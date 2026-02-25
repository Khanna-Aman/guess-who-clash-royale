/**
 * state.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Core game state management, undo/redo history, and scoring logic.
 */

let CARDS = [];

const GamePhase = {
    START: 'start',
    PICK_P1: 'pick_p1',
    PICK_P2: 'pick_p2',
    GUESS_P1: 'guess_p1',
    GUESS_P2: 'guess_p2',
    RESULTS: 'results',
};

let state = {
    phase: GamePhase.START,
    board: [],
    secretP1: null,
    secretP2: null,
    scoreP1: 0,
    scoreP2: 0,
    history: [],
    sortKey: 'default',
    sortDir: 'asc',
    viewMode: 'all',
    progressionP1: [],
    progressionP2: [],
    currentPlayer: 1,
    questionLog: [],
};

function setPhase(phase) {
    state.phase = phase;
    switch (phase) {
        case GamePhase.PICK_P1: showPickScreen(1); break;
        case GamePhase.PICK_P2: showPickScreen(2); break;
        case GamePhase.GUESS_P1: startGuessingPhase(1); break;
        case GamePhase.GUESS_P2: startGuessingPhase(2); break;
        case GamePhase.RESULTS: showResults(); break;
        default: showScreen('startScreen');
    }
}

function startGuessingPhase(player) {
    state.currentPlayer = player;
    state.board = new Array(CARDS.length).fill(true);
    state.history = [];
    state.questionLog = [];

    // Reset scores for this player's run
    if (player === 1) { state.scoreP1 = 0; state.progressionP1 = []; }
    else { state.scoreP2 = 0; state.progressionP2 = []; }

    showScreen('gameScreen');
    renderBoard();
    wireFilterEvents(player);
    wireBoardControls();
    updateScoreUI(player);
}

function adjustScore(player, delta) {
    if (player === 1) state.scoreP1 = Math.max(0, state.scoreP1 + delta);
    else state.scoreP2 = Math.max(0, state.scoreP2 + delta);
    updateScoreUI(player);
}

function resetBoard() {
    const player = state.currentPlayer;
    let delay = 0;
    CARDS.forEach((_, i) => {
        if (!state.board[i]) {
            delay += 10;
            setTimeout(() => {
                state.board[i] = true;
                const el = document.getElementById(`card-${i}`);
                if (el) el.classList.remove('flipped');
            }, delay);
        }
    });
    state.history = [];
    if (player === 1) { state.scoreP1 = 0; state.progressionP1 = []; }
    else { state.scoreP2 = 0; state.progressionP2 = []; }
    state.questionLog = [];
    renderQuestionLog();
    updateScoreUI(player);
    setTimeout(() => updateActiveCount(), delay + 20);
}

function undoLast(player) {
    if (state.history.length === 0) return;
    const action = state.history.pop();

    if (action.type === 'filter') {
        let delay = 0;
        action.indices.forEach((idx, j) => {
            delay += 12;
            setTimeout(() => {
                state.board[idx] = action.prevStates[j];
                const el = document.getElementById(`card-${idx}`);
                if (el) el.classList.remove('flipped');
            }, delay);
        });
        adjustScore(player, -1);
        const prog = player === 1 ? state.progressionP1 : state.progressionP2;
        prog.pop();
        state.questionLog.pop();
        renderQuestionLog();
        setTimeout(() => updateActiveCount(), action.indices.length * 12 + 20);
    } else if (action.type === 'manual') {
        adjustScore(player, -1);
        const prog = player === 1 ? state.progressionP1 : state.progressionP2;
        prog.pop();
        state.questionLog.pop();
        renderQuestionLog();
        let delay = 0;
        (action.flips || []).forEach(flipAction => {
            delay += 12;
            setTimeout(() => {
                state.board[flipAction.index] = flipAction.prevState;
                const el = document.getElementById(`card-${flipAction.index}`);
                if (el) el.classList.toggle('flipped', !flipAction.prevState);
            }, delay);
        });
        setTimeout(() => updateActiveCount(), delay + 20);
    } else if (action.type === 'flip') {
        state.board[action.index] = action.prevState;
        const el = document.getElementById(`card-${action.index}`);
        if (el) el.classList.toggle('flipped', !action.prevState);
        updateActiveCount();
    }
}

function undoFullQuestion(player) {
    if (state.history.length === 0) return;
    let delay = 0;
    while (state.history.length && state.history[state.history.length - 1].type === 'flip') {
        const f = state.history.pop();
        delay += 12;
        setTimeout((d => () => {
            state.board[d.index] = d.prevState;
            const el = document.getElementById(`card-${d.index}`);
            if (el) el.classList.toggle('flipped', !d.prevState);
        })(f), delay);
    }
    if (state.history.length === 0) {
        setTimeout(() => updateActiveCount(), delay + 20);
        return;
    }
    const action = state.history.pop();
    if (action.type === 'filter') {
        action.indices.forEach((idx, j) => {
            delay += 12;
            setTimeout(((i, ps) => () => {
                state.board[i] = ps;
                const el = document.getElementById(`card-${i}`);
                if (el) el.classList.remove('flipped');
            })(idx, action.prevStates[j]), delay);
        });
        adjustScore(player, -1);
        const prog = player === 1 ? state.progressionP1 : state.progressionP2;
        prog.pop();
        state.questionLog.pop();
        renderQuestionLog();
        setTimeout(() => updateActiveCount(), delay + action.indices.length * 12 + 20);
    } else if (action.type === 'manual') {
        adjustScore(player, -1);
        const prog = player === 1 ? state.progressionP1 : state.progressionP2;
        prog.pop();
        state.questionLog.pop();
        renderQuestionLog();
        (action.flips || []).forEach(flipAction => {
            delay += 12;
            setTimeout(((i, ps) => () => {
                state.board[i] = ps;
                const el = document.getElementById(`card-${i}`);
                if (el) el.classList.toggle('flipped', !ps);
            })(flipAction.index, flipAction.prevState), delay);
        });
        setTimeout(() => updateActiveCount(), delay + 20);
    }
}
