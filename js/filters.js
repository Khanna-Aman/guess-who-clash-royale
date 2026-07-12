/**
 * filters.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Logic for filtering cards based on attributes and community classifications.
 */

function toggleCard(i) {
    const wasActive = state.board[i];
    state.history.push({ type: 'flip', index: i, prevState: wasActive });
    state.board[i] = !wasActive;
    setCardFlipped(document.getElementById(`card-${i}`), !state.board[i]);
    updateActiveCount();
}

function applyFilter(matchFn, player, label) {
    const flippedIndices = [];
    const prevStates = [];

    CARDS.forEach((card, i) => {
        if (!matchFn(card) && state.board[i]) {
            flippedIndices.push(i);
            prevStates.push(true);
            state.board[i] = false;
        }
    });

    if (flippedIndices.length === 0) {
        showToast("No cards were eliminated by this filter.", "warn");
        return;
    }

    state.history.push({ type: 'filter', indices: flippedIndices, prevStates });

    // Stagger the flip animation, but cap total duration (~360ms) so a filter
    // that eliminates many cards doesn't lag ~1.5s behind the score/log update.
    const MAX_STAGGER = 360;
    const step = Math.min(12, MAX_STAGGER / flippedIndices.length);
    let maxDelay = 0;
    flippedIndices.forEach((idx, k) => {
        const delay = (k + 1) * step;
        maxDelay = delay;
        setTimeout(() => {
            setCardFlipped(document.getElementById(`card-${idx}`), true);
        }, delay);
    });

    const active = state.board.filter(Boolean).length;
    const eliminated = flippedIndices.length;

    const prog = player === 1 ? state.progressionP1 : state.progressionP2;
    prog.push(active);

    state.questionLog.push({ label, eliminated, activeAfter: active, isManual: false });
    renderQuestionLog();
    adjustScore(player, 1);
    setTimeout(() => updateActiveCount(), maxDelay + 20);
}

function setupFilter(id, fnBuilder, labelFn) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = '';
    el.onchange = () => {
        const val = el.value;
        if (!val) return;
        const fn = fnBuilder(val);
        if (fn) applyFilter(fn, state.currentPlayer, labelFn(val));
        setTimeout(() => { el.value = ''; }, 60);
    };
}

function wireFilterEvents(player) {
    // Rarity
    setupFilter('rarityFilter', v => (c => c.rarity === v), v => `💎 Rarity: ${v}`);
    // Type
    setupFilter('typeFilter', v => (c => c.type === v), v => `🗡️ Type: ${v}`);
    // Target (Mapped to 'attackFilter' in HTML)
    setupFilter('attackFilter', v => {
        const targetMap = {
            'air-ground': 'Air & Ground',
            'ground': 'Ground',
            'buildings': 'Buildings',
            'none': 'None'
        };
        const targetValue = targetMap[v] || v;
        return (c => c.target === targetValue);
    }, v => {
        const labelMap = { 'air-ground': 'Air & Ground', 'ground': 'Ground', 'buildings': 'Buildings', 'none': 'None' };
        return `🎯 Target: ${labelMap[v] || v}`;
    });
    // Is Swarm
    setupFilter('swarmFilter', v => (c => v === 'yes' ? SWARM_CARDS.has(c.name) : !SWARM_CARDS.has(c.name)), v => `👥 Swarm: ${v === 'yes' ? 'Yes' : 'No'}`);
    // Is Tank
    setupFilter('tankFilter', v => (c => v === 'yes' ? TANK_CARDS.has(c.name) : !TANK_CARDS.has(c.name)), v => `🛡️ Tank: ${v === 'yes' ? 'Yes' : 'No'}`);
    // Is Spawner
    setupFilter('spawnerFilter', v => (c => v === 'yes' ? SPAWNER_CARDS.has(c.name) : !SPAWNER_CARDS.has(c.name)), v => `🏗️ Spawner: ${v === 'yes' ? 'Yes' : 'No'}`);
    // Is Win-Con
    setupFilter('winconFilter', v => (c => v === 'yes' ? WIN_CON_CARDS.has(c.name) : !WIN_CON_CARDS.has(c.name)), v => `🏰 Win-Con: ${v === 'yes' ? 'Yes' : 'No'}`);
    // Can Hit Air
    setupFilter('airFilter', v => (c => v === 'yes' ? (c.target === 'Air & Ground') : (c.target !== 'Air & Ground')), v => `🏹 Hits Air: ${v === 'yes' ? 'Yes' : 'No'}`);
    // Has Evolution
    setupFilter('evoFilter', v => (c => v === 'yes' ? c.hasEvo : !c.hasEvo), v => `⚡ Evolution: ${v === 'yes' ? 'Yes' : 'No'}`);
    // Has Hero Skin
    setupFilter('heroFilter', v => (c => v === 'yes' ? c.hasHero : !c.hasHero), v => `🦸 Hero: ${v === 'yes' ? 'Yes' : 'No'}`);
    // Is Flying
    setupFilter('flyingFilter', v => (c => v === 'yes' ? c.flying : !c.flying), v => `☁️ Flying: ${v === 'yes' ? 'Yes' : 'No'}`);
    // Is Goblin
    setupFilter('goblinFilter', v => (c => v === 'yes' ? c.isGoblin : !c.isGoblin), v => `👺 Goblin: ${v === 'yes' ? 'Yes' : 'No'}`);
    // Is Undead
    setupFilter('undeadFilter', v => (c => v === 'yes' ? c.isUndead : !c.isUndead), v => `💀 Undead: ${v === 'yes' ? 'Yes' : 'No'}`);
    // Is Man
    setupFilter('manFilter', v => (c => v === 'yes' ? c.isMan : !c.isMan), v => `👨 Man: ${v === 'yes' ? 'Yes' : 'No'}`);
    // Is Human
    setupFilter('humanFilter', v => (c => v === 'yes' ? c.isHuman : !c.isHuman), v => `🧑 Human: ${v === 'yes' ? 'Yes' : 'No'}`);

    // Elixir Cost (special handling)
    const costSelect = document.getElementById('costFilter');
    if (costSelect) {
        costSelect.value = '';
        costSelect.onchange = () => {
            const val = costSelect.value;
            if (!val) return;
            const [op, num] = val.split(':');
            const n = parseInt(num);
            const opLabel = { eq: '=', gt: '>', lt: '<', gte: '≥', lte: '≤' }[op] || op;
            let fn;
            if (op === 'eq') fn = c => c.elixir === n;
            else if (op === 'gt') fn = c => c.elixir > n;
            else if (op === 'lt') fn = c => c.elixir < n;
            else if (op === 'gte') fn = c => c.elixir >= n;
            else if (op === 'lte') fn = c => c.elixir <= n;
            if (fn) applyFilter(fn, player, `💧 Elixir ${opLabel} ${n}`);
            setTimeout(() => { costSelect.value = ''; }, 60);
        };
    }
}
