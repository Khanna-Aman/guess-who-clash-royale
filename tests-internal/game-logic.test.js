/**
 * game-logic.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Exercises the real browser game logic headlessly by loading the actual js/
 * files into a sandbox with a minimal DOM stub. Guards the audit fixes
 * (undo/scoring desync, escaping, slug overrides) against regression.
 *
 * Run with: node --test tests-internal/*.test.js
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

/** Build a fresh sandbox with the game code loaded and a stubbed DOM. */
function makeGame() {
    const registry = {};
    const mkEl = () => {
        const el = {
            _cls: new Set(), attrs: {}, style: {}, _children: [], innerHTML: '', textContent: '',
            classList: {
                add(...c) { c.forEach(x => el._cls.add(x)); },
                remove(...c) { c.forEach(x => el._cls.delete(x)); },
                toggle(c, f) { const on = f === undefined ? !el._cls.has(c) : f; on ? el._cls.add(c) : el._cls.delete(c); return on; },
                contains(c) { return el._cls.has(c); },
            },
            setAttribute(k, v) { el.attrs[k] = String(v); },
            getAttribute(k) { return el.attrs[k]; },
            appendChild(c) { el._children.push(c); return c; },
            querySelector() { return mkEl(); }, querySelectorAll() { return []; },
            remove() {}, focus() {}, addEventListener() {}, dataset: {},
        };
        Object.defineProperty(el, 'id', { get() { return el._id || ''; }, set(v) { el._id = v; registry[v] = el; } });
        Object.defineProperty(el, 'className', { get() { return [...el._cls].join(' '); }, set(v) { el._cls = new Set(String(v).split(/\s+/).filter(Boolean)); } });
        return el;
    };
    const board = mkEl(); registry['cardBoard'] = board;
    const ctx = {
        console, setTimeout: (fn) => { fn(); return 0; }, clearTimeout() {},
        document: { getElementById: (id) => registry[id] || mkEl(), querySelector: () => mkEl(), querySelectorAll: () => [], createElement: mkEl, addEventListener() {} },
        window: { devicePixelRatio: 1 }, location: { reload() {} },
        // UI no-ops so pure logic can run headless:
        renderBoard() {}, renderQuestionLog() {}, updateActiveCount() {}, updateScoreUI() {},
        showScreen() {}, showToast() {}, wireFilterEvents() {}, wireBoardControls() {}, handleCardImgError() {},
    };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    for (const f of ['js/cards.js', 'js/cards-annotations.js', 'js/config-filters.js', 'js/utils.js', 'js/state.js', 'js/filters.js']) {
        vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
    }
    vm.runInContext('CARDS = mergeCoreAndAnnotations(CARDS_DATA_JSON, CARD_ANNOTATIONS);', ctx);
    const run = (code) => vm.runInContext(code, ctx);
    return { ctx, run };
}

test('escapeHtml neutralizes HTML/JS-breaking characters', () => {
    const { run } = makeGame();
    assert.strictEqual(run(`escapeHtml("<b>'\\"&")`), '&lt;b&gt;&#39;&quot;&amp;');
    assert.strictEqual(run(`escapeHtml("Dragon's Lair")`), 'Dragon&#39;s Lair');
});

test('toSlug + getCardImg apply slug overrides', () => {
    const { run } = makeGame();
    assert.strictEqual(run(`toSlug("P.E.K.K.A")`), 'pekka');
    assert.strictEqual(run(`toSlug("Mini P.E.K.K.A")`), 'mini-pekka');
    assert.ok(run(`getCardImg("Void")`).endsWith('/void-spell.png'), 'Void maps to void-spell via override');
});

test('adjustScore floors at 0', () => {
    const { run } = makeGame();
    run('startGuessingPhase(1);');
    run('adjustScore(1, -5);');
    assert.strictEqual(run('state.scoreP1'), 0, 'score never goes negative');
    run('adjustScore(1, 3);');
    assert.strictEqual(run('state.scoreP1'), 3);
});

test('applyFilter eliminates non-matching cards and records one question', () => {
    const { run } = makeGame();
    run('startGuessingPhase(1);');
    run(`applyFilter(c => c.rarity === 'Common', 1, 'Rarity: Common');`);
    const active = run('state.board.filter(Boolean).length');
    const commons = run(`CARDS.filter(c => c.rarity === 'Common').length`);
    assert.strictEqual(active, commons, 'only Common cards remain active');
    assert.strictEqual(run('state.scoreP1'), 1, 'one point charged');
    assert.strictEqual(run('state.history.length'), 1);
    assert.strictEqual(run('state.questionLog.length'), 1);
    assert.strictEqual(run('state.progressionP1.length'), 1);
});

test('REGRESSION (C1): undo after a custom "+" keeps history/progression/log/score aligned', () => {
    const { run } = makeGame();
    run('startGuessingPhase(1);');
    run(`applyFilter(c => c.rarity === 'Common', 1, 'Rarity: Common');`);
    // Simulate the "+" custom-question button (game.js) which must push a manual entry:
    run(`(function(){ const active = state.board.filter(Boolean).length;
        state.progressionP1.push(active);
        state.history.push({ type: 'manual', flips: [] });
        state.questionLog.push({ label: 'Custom', eliminated: 0, activeAfter: active, isManual: true });
        adjustScore(1, 1); })();`);
    assert.strictEqual(run('state.history.length'), 2);
    // The previously-buggy operation:
    run('undoLast(1);');
    const h = run('state.history.length'), p = run('state.progressionP1.length'),
        q = run('state.questionLog.length'), s = run('state.scoreP1');
    assert.strictEqual(h, 1, 'history back to just the filter');
    assert.strictEqual(p, 1, 'progression aligned'); assert.strictEqual(q, 1, 'log aligned');
    assert.strictEqual(s, 1, 'score aligned');
});

test('resetBoard clears history, score, and reactivates all cards', () => {
    const { run } = makeGame();
    run('startGuessingPhase(1);');
    run(`applyFilter(c => c.rarity === 'Common', 1, 'Rarity: Common');`);
    run('resetBoard();');
    assert.strictEqual(run('state.history.length'), 0);
    assert.strictEqual(run('state.scoreP1'), 0);
    assert.strictEqual(run('state.board.every(Boolean)'), true, 'all cards active again');
});

test('applyFilter with zero eliminations does not charge a point', () => {
    const { run } = makeGame();
    run('startGuessingPhase(1);');
    // A filter that matches everything eliminates nothing:
    run(`applyFilter(() => true, 1, 'no-op');`);
    assert.strictEqual(run('state.scoreP1'), 0, 'no point for a zero-elimination filter');
    assert.strictEqual(run('state.history.length'), 0);
});
