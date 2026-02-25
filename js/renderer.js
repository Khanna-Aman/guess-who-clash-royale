/**
 * renderer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * DOM manipulation, UI rendering, board updates, and end-game visualizations.
 */

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
}

function updateScoreUI(player) {
    const score = player === 1 ? state.scoreP1 : state.scoreP2;
    const labelEl = document.getElementById('currentPlayerLabel');
    const scoreEl = document.getElementById('currentScore');
    if (labelEl) labelEl.textContent = `P${player} Questions`;
    if (scoreEl) scoreEl.textContent = score;
}

function showPassScreen(toPlayer, icon, btnLabel, onReady, lookAway = true) {
    const fromPlayer = toPlayer === 1 ? 2 : 1;
    const fromColour = fromPlayer === 1 ? '#60a5fa' : '#f87171';
    const toColour = toPlayer === 1 ? '#60a5fa' : '#f87171';

    document.getElementById('passIcon').textContent = icon || '📱';
    document.getElementById('passPlayerName').textContent = `Player ${toPlayer}`;
    document.getElementById('passPlayerName').style.color = toColour;

    const subEl = document.getElementById('passSub');
    if (lookAway) {
        subEl.innerHTML = `<span style="color:${fromColour};font-weight:700;">Player ${fromPlayer}</span> — look away now 👀`;
        subEl.style.visibility = 'visible';
    } else {
        subEl.textContent = '🎤 Both secret cards are set — game on!';
        subEl.style.color = '#4ade80';
        subEl.style.visibility = 'visible';
    }

    document.getElementById('passReadyName').textContent = `Player ${toPlayer}`;
    document.getElementById('passReadyBtnText').textContent = btnLabel || `▶ I’m Player ${toPlayer} — Start My Turn`;

    showScreen('passDeviceScreen');
    document.getElementById('btnPassReady').onclick = () => onReady();
}

function showPickScreen(player) {
    showScreen('pickScreen');
    const title = document.getElementById('pickTitle');
    const subtitle = document.getElementById('pickSubtitle');
    const grid = document.getElementById('pickGrid');
    const confirmBtn = document.getElementById('pickConfirm');
    const searchInput = document.getElementById('pickSearch');

    title.textContent = `Player ${player}`;
    title.className = `text-2xl font-black uppercase mb-1 ${player === 1 ? 'text-blue-400' : 'text-red-400'}`;
    subtitle.textContent = `Pick the card Player ${player === 1 ? 2 : 1} will have to guess`;
    searchInput.value = '';

    let selected = null;

    function renderPickerCards(filter = '') {
        grid.innerHTML = '';
        const filtered = filter
            ? CARDS.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
            : CARDS;

        filtered.forEach(card => {
            const origIdx = CARDS.indexOf(card);
            const div = document.createElement('div');
            div.className = `picker-card rarity-${card.rarity.toLowerCase()}`;
            div.dataset.idx = origIdx;

            const imgSrc = getCardImg(card.name);
            div.innerHTML = `
                <div class="picker-elixir">${card.elixir === 0 ? '?' : card.elixir}</div>
                ${imgSrc ? `<img src="${imgSrc}" alt="${card.name}" onerror="handleCardImgError(this, '${card.name}')">` : ''}
                <div class="picker-name">${card.name}</div>
                <div class="picker-badges">
                    ${card.hasEvo ? '<span class="badge-evo"  title="Has Evolution">⚡</span>' : ''}
                    ${card.hasHero ? '<span class="badge-hero" title="Has Hero Skin">🦸</span>' : ''}
                </div>
            `;

            div.onclick = () => {
                grid.querySelectorAll('.picker-card').forEach(c => c.classList.remove('selected'));
                div.classList.add('selected');
                selected = card;
                confirmBtn.disabled = false;
                confirmBtn.textContent = `✓ Confirm: ${card.name}`;
            };
            if (selected && selected.name === card.name) div.classList.add('selected');
            grid.appendChild(div);
        });
    }

    renderPickerCards();
    searchInput.oninput = () => renderPickerCards(searchInput.value);
    confirmBtn.disabled = true;
    confirmBtn.onclick = () => {
        if (!selected) return;
        if (player === 1) {
            state.secretP2 = selected;
            showPassScreen(2, '🎴', '▶ I’m Player 2 — Pick My Card', () => setPhase(GamePhase.PICK_P2));
        } else {
            state.secretP1 = selected;
            showPassScreen(1, '🔍', '▶ I’m Player 1 — Start Guessing!', () => setPhase(GamePhase.GUESS_P1), false);
        }
    };
}

const RARITY_ORDER = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Champion: 4 };
const TYPE_ORDER = { Spell: 0, Building: 1, Troop: 2 };

function getSortedCardIndices() {
    const indices = CARDS.map((_, i) => i);
    const { sortKey, sortDir } = state;
    if (sortKey === 'default') return indices;
    indices.sort((a, b) => {
        const ca = CARDS[a], cb = CARDS[b];
        let cmp = 0;
        if (sortKey === 'name') cmp = ca.name.localeCompare(cb.name);
        else if (sortKey === 'elixir') cmp = ca.elixir - cb.elixir;
        else if (sortKey === 'rarity') cmp = (RARITY_ORDER[ca.rarity] ?? 0) - (RARITY_ORDER[cb.rarity] ?? 0);
        else if (sortKey === 'type') cmp = (TYPE_ORDER[ca.type] ?? 3) - (TYPE_ORDER[cb.type] ?? 3);
        if (cmp === 0) cmp = ca.name.localeCompare(cb.name);
        return sortDir === 'asc' ? cmp : -cmp;
    });
    return indices;
}

function updateActiveCount() {
    const total = CARDS.length;
    const active = state.board.filter(Boolean).length;
    const pill = document.getElementById('activeCardCount');
    if (!pill) return;
    pill.textContent = `${active} / ${total} active`;
    pill.classList.remove('low', 'very-low');
    if (active <= 5) pill.classList.add('very-low');
    else if (active <= 15) pill.classList.add('low');

    const board = document.getElementById('cardBoard');
    if (!board) return;
    const existingMsg = board.querySelector('.board-empty-msg');
    if (state.viewMode === 'active' && active === 0) {
        if (!existingMsg) {
            const msg = document.createElement('div');
            msg.className = 'board-empty-msg';
            msg.innerHTML = '🏆 All cards eliminated!<br><span style="font-size:.75rem;color:#64748b;">Switch to \'All Cards\' view or Reset to see them again.</span>';
            board.appendChild(msg);
        }
    } else if (existingMsg) existingMsg.remove();
}

function renderBoard() {
    const board = document.getElementById('cardBoard');
    if (!board) return;
    board.innerHTML = '';
    board.classList.toggle('active-only', state.viewMode === 'active');
    const displayIndices = getSortedCardIndices();
    displayIndices.forEach((i, pos) => {
        const card = CARDS[i];
        const rarityClass = `rarity-${card.rarity.toLowerCase()}`;
        const isFlipped = !state.board[i];
        const container = document.createElement('div');
        container.className = `card-container ${rarityClass} ${isFlipped ? 'flipped' : ''} animate-in`;
        container.style.animationDelay = `${pos * 5}ms`;
        container.id = `card-${i}`;
        container.onclick = () => toggleCard(i);
        const imgSrc = getCardImg(card.name);
        const imgTag = imgSrc ? `<img src="${imgSrc}" alt="${card.name}" loading="lazy" onerror="handleCardImgError(this, '${card.name}')">` : `<img class="img-error" alt="${card.name}">`;
        const badges = [];
        if (card.hasEvo) badges.push(`<span class="card-badge badge-evo"  title="Has Evolution">⚡</span>`);
        if (card.hasHero) badges.push(`<span class="card-badge badge-hero" title="Has Hero Skin">🦸</span>`);
        container.setAttribute('title', card.name);
        container.innerHTML = `<div class="card-inner"><div class="card-front"><div class="elixir-badge">${card.elixir === 0 ? '?' : card.elixir}</div><div class="card-img-wrap">${imgTag}<div class="img-fallback">${card.name}</div></div><div class="card-name">${card.name}</div><div class="card-badges-row">${badges.join('')}</div></div><div class="card-back"></div></div>`;
        board.appendChild(container);
    });
    updateActiveCount();

    // Reset secret card display logic for the current player
    const secret = state.currentPlayer === 1 ? state.secretP1 : state.secretP2;
    const slot = document.getElementById('secretSlot');
    if (slot) {
        slot.className = `secret-slot`;
        slot.innerHTML = `
            <div class="secret-hidden-content">
                <span class="secret-icon">❓</span>
                <div class="secret-safety-hint">Keep hidden!</div>
                <div class="secret-safety-sub">Peek only when opponent isn't looking</div>
            </div>
            <div class="secret-reveal">
                <div class="secret-hint-text">Opponent's Target</div>
                <img src="${getCardImg(secret.name)}" alt="${secret.name}" onerror="handleCardImgError(this, '${secret.name}')">
                <div class="secret-name-text">${secret.name}</div>
            </div>
        `;
        const btnHold = document.getElementById('btnHoldView');
        if (btnHold) {
            btnHold.onmousedown = btnHold.ontouchstart = () => slot.classList.add('revealed');
            btnHold.onmouseup = btnHold.onmouseleave = btnHold.ontouchend = () => slot.classList.remove('revealed');
        }
    }
}

function renderQuestionLog() {
    const logContainer = document.querySelector('.q-log-panel');
    const existingList = logContainer.querySelector('.q-log-list');
    if (existingList) existingList.remove();
    const list = document.createElement('div');
    list.className = 'q-log-list';
    if (state.questionLog.length === 0) {
        list.innerHTML = `<div style="text-align:center;padding:2rem 1rem;color:#475569;font-size:.75rem;font-style:italic;">No questions asked yet. Ask one using the filters above!</div>`;
    } else {
        [...state.questionLog].reverse().forEach(entry => {
            const item = document.createElement('div');
            item.className = `q-log-item animate-in ${entry.isManual ? 'manual' : ''}`;
            item.innerHTML = `<div class="q-log-header"><span>${entry.label}</span><span class="q-log-outcome">(-${entry.eliminated})</span></div><div class="q-log-footer">${entry.activeAfter} cards remaining</div>`;
            list.appendChild(item);
        });
    }
    logContainer.appendChild(list);
}

function wireBoardControls() {
    const sortSel = document.getElementById('sortKey');
    const sortDirBtn = document.getElementById('sortDir');
    const viewAll = document.getElementById('viewAll');
    const viewActive = document.getElementById('viewActive');
    const btnUndo = document.getElementById('btnUndo');
    const btnResetTotal = document.getElementById('btnResetTotal');

    if (sortSel) {
        sortSel.onchange = () => { state.sortKey = sortSel.value; renderBoard(); };
    }
    if (sortDirBtn) {
        sortDirBtn.onclick = () => { state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc'; sortDirBtn.textContent = state.sortDir === 'asc' ? '↑' : '↓'; renderBoard(); };
    }
    if (viewAll) {
        viewAll.onclick = () => { state.viewMode = 'all'; viewAll.classList.add('active'); if (viewActive) viewActive.classList.remove('active'); renderBoard(); };
    }
    if (viewActive) {
        viewActive.onclick = () => { state.viewMode = 'active'; viewActive.classList.add('active'); if (viewAll) viewAll.classList.remove('active'); renderBoard(); };
    }
    if (btnUndo) {
        btnUndo.onclick = () => undoFullQuestion(state.currentPlayer);
    }
    if (btnResetTotal) {
        btnResetTotal.onclick = () => resetBoard();
    }

    // Guessing logic
    const btnGuess = document.getElementById('btnGuess');
    if (btnGuess) btnGuess.onclick = () => {
        const secret = state.currentPlayer === 1 ? state.secretP2 : state.secretP1;
        const modal = document.getElementById('guessModal');
        const list = document.getElementById('guessList');
        const input = document.getElementById('guessInput');
        const confirm = document.getElementById('confirmGuessBtn');
        const cancel = document.getElementById('cancelGuessBtn');
        input.value = '';
        list.innerHTML = '';
        confirm.disabled = true;
        modal.classList.add('active');
        input.focus();

        cancel.onclick = () => modal.classList.remove('active');
        confirm.onclick = () => {
            const val = input.value.trim().toLowerCase();
            if (val === secret.name.toLowerCase()) {
                modal.classList.remove('active');
                showScreen('passDeviceScreen'); // Re-use pass screen for win message if needed, or simple direct phase
                if (state.currentPlayer === 1) {
                    showPassScreen(2, '🔍', '▶ I’m Player 2 — Start My Turn!', () => setPhase(GamePhase.GUESS_P2), false);
                } else {
                    setPhase(GamePhase.RESULTS);
                }
            } else {
                showToast("Wrong guess! +1 question added.", "warn");
                adjustScore(state.currentPlayer, 1);
                modal.classList.remove('active');
                // Track progression for manual guess
                const active = state.board.filter(Boolean).length;
                const prog = state.currentPlayer === 1 ? state.progressionP1 : state.progressionP2;
                prog.push(active);
                state.questionLog.push({ label: '🎯 Guess: Miss', eliminated: 0, activeAfter: active, isManual: true });
                renderQuestionLog();
            }
        };
    };
}

function onGuessInput() {
    const input = document.getElementById('guessInput');
    const list = document.getElementById('guessList');
    const confirm = document.getElementById('confirmGuessBtn');
    const val = input.value.trim().toLowerCase();
    list.innerHTML = '';
    confirm.disabled = true;
    if (val.length < 1) return;
    const matches = CARDS.filter(c => c.name.toLowerCase().includes(val)).slice(0, 5);
    matches.forEach(c => {
        const item = document.createElement('div');
        item.className = 'guess-match-item';
        item.textContent = c.name;
        item.onclick = () => {
            input.value = c.name;
            list.innerHTML = '';
            confirm.disabled = false;
            confirm.focus();
        };
        list.appendChild(item);
    });
    if (matches.length === 1 && matches[0].name.toLowerCase() === val) confirm.disabled = false;
}

function showResults() {
    showScreen('resultsScreen');
    document.getElementById('winnerPlayer').textContent = state.scoreP1 < state.scoreP2 ? 'Player 1 Wins!' : (state.scoreP2 < state.scoreP1 ? 'Player 2 Wins!' : 'Draw!');
    document.getElementById('p1FinalScore').textContent = state.scoreP1;
    document.getElementById('p2FinalScore').textContent = state.scoreP2;
    renderProgressionGraph();
    renderStats();
    document.getElementById('btnRestart').onclick = () => location.reload();
}

function renderProgressionGraph() {
    const canvas = document.getElementById('progressionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height, total = CARDS.length;
    const s1 = [total, ...state.progressionP1], s2 = [total, ...state.progressionP2];
    const maxLen = Math.max(s1.length, s2.length, 2);
    while (s1.length < maxLen) s1.push(s1[s1.length - 1]);
    while (s2.length < maxLen) s2.push(s2[s2.length - 1]);
    const PAD = { top: 24, right: 20, bottom: 40, left: 44 };
    const gW = W - PAD.left - PAD.right, gH = H - PAD.top - PAD.bottom;
    const xOf = i => PAD.left + (i / (maxLen - 1)) * gW;
    const yOf = v => PAD.top + (1 - v / total) * gH;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(51,65,85,0.5)'; ctx.lineWidth = 1;
    for (let g = 0; g <= 5; g++) {
        const y = PAD.top + (g / 5) * gH; ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + gW, y); ctx.stroke();
    }
    const drawLine = (series, color) => {
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.beginPath(); series.forEach((v, i) => { if (i === 0) ctx.moveTo(xOf(i), yOf(v)); else ctx.lineTo(xOf(i), yOf(v)); }); ctx.stroke();
    };
    drawLine(s1, '#60a5fa'); drawLine(s2, '#f87171');
    const drawDots = (series, color) => {
        series.forEach((v, i) => {
            ctx.beginPath(); ctx.arc(xOf(i), yOf(v), i === 0 ? 3 : 4.5, 0, Math.PI * 2);
            ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = '#0b1628'; ctx.lineWidth = 1.5; ctx.stroke();
            if (i > 0) { ctx.fillStyle = color; ctx.font = '700 9px Outfit, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(v, xOf(i), yOf(v) - 8); }
        });
    };
    drawDots(s1, '#60a5fa'); drawDots(s2, '#f87171');
}

function renderStats() {
    const tbody = document.getElementById('statsTableBody');
    if (!tbody) return;
    const total = CARDS.length;
    function computeStats(prog, score) {
        if (prog.length === 0) return { questions: score, eliminated: 0, cardsLeft: total, bestQ: 0, avgPerQ: '—', efficiency: 0, sub10At: '—', sub5At: '—' };
        const series = [total, ...prog]; const diffs = series.slice(1).map((v, i) => series[i] - v);
        const eliminated = total - prog[prog.length - 1], cardsLeft = prog[prog.length - 1];
        const bestQ = Math.max(...diffs), avgPerQ = (eliminated / prog.length).toFixed(1), efficiency = Math.round((eliminated / total) * 100);
        const sub10 = prog.findIndex(v => v < 10), sub5 = prog.findIndex(v => v < 5);
        return { questions: score, eliminated, cardsLeft, bestQ, avgPerQ, efficiency, sub10At: sub10 >= 0 ? `Q${sub10 + 1}` : '—', sub5At: sub5 >= 0 ? `Q${sub5 + 1}` : '—' };
    }
    const s1 = computeStats(state.progressionP1, state.scoreP1), s2 = computeStats(state.progressionP2, state.scoreP2);
    function addRow(icon, label, v1, v2, winDir) {
        const tr = document.createElement('tr'); let cls1 = 'stats-cell', cls2 = 'stats-cell';
        const isQ = (x) => typeof x === 'string' && x.startsWith('Q');
        if (v1 !== '—' && v2 !== '—') {
            if (isQ(v1) && isQ(v2)) {
                const q1 = parseInt(v1.slice(1)), q2 = parseInt(v2.slice(1));
                if (q1 !== q2) { cls1 = q1 < q2 ? 'stats-cell stats-win' : 'stats-cell stats-lose'; cls2 = q1 < q2 ? 'stats-cell stats-lose' : 'stats-cell stats-win'; }
            } else {
                const n1 = parseFloat(v1), n2 = parseFloat(v2);
                if (!isNaN(n1) && !isNaN(n2)) { const p1Wins = winDir === 'lo' ? n1 < n2 : n1 > n2; cls1 = p1Wins ? 'stats-cell stats-win' : 'stats-cell stats-lose'; cls2 = p1Wins ? 'stats-cell stats-lose' : 'stats-cell stats-win'; }
            }
        }
        tr.innerHTML = `<td class="stats-label"><span class="stats-icon">${icon}</span>${label}</td><td class="${cls1}">${v1}</td><td class="${cls2}">${v2}</td>`; tbody.appendChild(tr);
    }
    tbody.innerHTML = '';
    addRow('❓', 'Questions asked', s1.questions, s2.questions, 'lo');
    addRow('💥', 'Cards eliminated', s1.eliminated, s2.eliminated, 'hi');
    addRow('🃏', 'Cards left at guess', s1.cardsLeft, s2.cardsLeft, 'lo');
    addRow('⚡', 'Best single question', s1.bestQ, s2.bestQ, 'hi');
    addRow('📊', 'Avg eliminated / question', s1.avgPerQ, s2.avgPerQ, 'hi');
    addRow('🎯', 'Efficiency', `${s1.efficiency}%`, `${s2.efficiency}%`, 'hi');
    addRow('🔟', 'First reached < 10 cards', s1.sub10At, s2.sub10At, 'lo');
    addRow('✋', 'First reached < 5 cards', s1.sub5At, s2.sub5At, 'lo');
}
