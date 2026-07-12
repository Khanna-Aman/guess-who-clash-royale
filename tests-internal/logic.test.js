/**
 * logic.test.js
 * Simple, zero-dependency unit tests using Node.js built-in test runner.
 * Run with: node --test tests-internal/logic.test.js
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

// Mock browser globals if needed, but for logic we try to stay pure
const { CARDS_DATA_JSON } = require('../js/cards.js');
const { mergeCoreAndAnnotations, CARD_ANNOTATIONS } = require('../js/cards-annotations.js');

test('mergeCoreAndAnnotations: merges all cards correctly', (t) => {
    const merged = mergeCoreAndAnnotations(CARDS_DATA_JSON, CARD_ANNOTATIONS);

    assert.strictEqual(merged.length, CARDS_DATA_JSON.length, 'Merged length matches core length');

    // Check a specific card (e.g., Skeletons)
    const skel = merged.find(c => c.name === 'Skeletons');
    assert.ok(skel, 'Skeletons found in merged set');
    assert.strictEqual(skel.isUndead, true, 'Skeletons are undead (merged from annotations)');
    assert.strictEqual(skel.rarity, 'Common', 'Skeletons rarity is Common (from core)');
});

test('Card Data: check for missing fields after merge', (t) => {
    const merged = mergeCoreAndAnnotations(CARDS_DATA_JSON, CARD_ANNOTATIONS);
    const requiredFields = [
        'name', 'rarity', 'elixir', 'type', 'target',
        'hasEvo', 'hasHero', 'flying', 'isGoblin',
        'isUndead', 'isMan', 'isHuman'
    ];

    merged.forEach(card => {
        requiredFields.forEach(field => {
            assert.ok(card.hasOwnProperty(field), `Card "${card.name}" is missing field: ${field}`);
        });
    });
});

test('Card Data: no card should be named Terry (Purge check)', (t) => {
    const merged = mergeCoreAndAnnotations(CARDS_DATA_JSON, CARD_ANNOTATIONS);
    const terry = merged.find(c => c.name.toLowerCase().includes('terry'));
    assert.strictEqual(terry, undefined, 'Terry should not exist in the dataset');
});

test('Logic: Elixir filter works as expected', (t) => {
    // Basic filter simulation: Cost = 1
    const cost1 = CARDS_DATA_JSON.filter(c => c.elixir === 1);
    assert.ok(cost1.length > 0, 'Found cards with cost 1');
    cost1.forEach(c => assert.strictEqual(c.elixir, 1));
});

test('Data integrity: card names are unique', (t) => {
    const names = CARDS_DATA_JSON.map(c => c.name);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    assert.deepStrictEqual([...new Set(dupes)], [], `Duplicate card names found: ${dupes.join(', ')}`);
});

test('Data integrity: field values are within valid ranges', (t) => {
    const RARITIES = new Set(['Common', 'Rare', 'Epic', 'Legendary', 'Champion']);
    const TYPES = new Set(['Troop', 'Spell', 'Building']);
    CARDS_DATA_JSON.forEach(c => {
        assert.ok(RARITIES.has(c.rarity), `"${c.name}" has invalid rarity: ${c.rarity}`);
        assert.ok(TYPES.has(c.type), `"${c.name}" has invalid type: ${c.type}`);
        assert.ok(Number.isInteger(c.elixir) && c.elixir >= 0 && c.elixir <= 10, `"${c.name}" has invalid elixir: ${c.elixir}`);
    });
});

test('Data integrity: no temporary/event/seasonal cards leaked into the roster', (t) => {
    // Event cards (Super*, Party*, Santa*, Terry, etc.) must never be in the
    // permanent roster. Guards against a bad auto-update or manual add.
    // Only unambiguous event prefixes — note "Golden Knight" is a permanent Champion,
    // so "Golden " is deliberately NOT treated as an event marker here.
    const EVENT_PREFIXES = ['Super ', 'Party ', 'Santa '];
    const EVENT_BLOCKLIST = new Set(['Terry', 'Raging Prince', 'Baby Shark']);
    CARDS_DATA_JSON.forEach(c => {
        assert.ok(!EVENT_BLOCKLIST.has(c.name), `Blocklisted event card leaked: "${c.name}"`);
        assert.ok(!EVENT_PREFIXES.some(p => c.name.startsWith(p)), `Event-prefixed card leaked: "${c.name}"`);
    });
});

test('Data integrity: known recent permanent cards are present (regression guard)', (t) => {
    // These are permanent cards absent from the (frozen) upstream data source,
    // so they can only be maintained manually. Lock them in so a future data
    // regen cannot silently drop them.
    const MUST_EXIST = [
        'Little Prince', 'Goblinstein', 'Boss Bandit', 'Spirit Empress', 'Vines',
        'Void', 'Rune Giant', 'Goblin Machine', 'Goblin Demolisher', 'Berserker',
        'Suspicious Bush', 'Goblin Curse',
    ];
    const names = new Set(CARDS_DATA_JSON.map(c => c.name));
    MUST_EXIST.forEach(n => assert.ok(names.has(n), `Expected permanent card missing: "${n}"`));
});
