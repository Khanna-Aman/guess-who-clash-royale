/**
 * game.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrator: Initializes components and handles high-level life cycle events.
 */

'use strict';

/**
 * Main game initialization.
 */
function init() {
    // 1. Merge core card data with annotations
    CARDS = mergeCoreAndAnnotations(CARDS_DATA_JSON, CARD_ANNOTATIONS);

    // 2. Setup initial UI state
    showScreen('startScreen');

    // 3. Wire up root-level event listeners
    const btnStart = document.getElementById('btnStart');
    if (btnStart) {
        btnStart.onclick = () => {
            showPassScreen(
                1,
                '🎴',
                "▶ I'm Player 1 — Start Picking!",
                () => setPhase(GamePhase.PICK_P1)
            );
        };
    }

    const guessInput = document.getElementById('guessInput');
    if (guessInput) {
        guessInput.addEventListener('input', onGuessInput);
    }

    // 4. Handle Score adjustments (P1/P2 global labels)
    const btnScoreMinus = document.getElementById('btnScoreMinus');
    const btnScorePlus = document.getElementById('btnScorePlus');

    if (btnScoreMinus) {
        btnScoreMinus.onclick = () => {
            adjustScore(state.currentPlayer, -1);
        };
    }

    if (btnScorePlus) {
        btnScorePlus.onclick = () => {
            // Manual scorecard adjustment
            const player = state.currentPlayer;
            const active = state.board.filter(Boolean).length;
            const eliminated = 0; // manual points don't eliminate cards via engine

            const prog = player === 1 ? state.progressionP1 : state.progressionP2;
            prog.push(active);

            state.questionLog.push({
                label: '❓ Custom',
                eliminated: 0,
                activeAfter: active,
                isManual: true
            });

            renderQuestionLog();
            adjustScore(player, 1);

            // Subtle feedback
            const pill = document.getElementById('activeCardCount');
            if (pill) {
                pill.classList.add('pill-flash');
                setTimeout(() => pill.classList.remove('pill-flash'), 600);
            }
        };
    }
}

// Boot the game
document.addEventListener('DOMContentLoaded', init);
