import { state } from './state.js';
import { moveLeft, moveRight, moveDown, rotate, hardDrop, holdPiece } from './game.js';
import { showPauseMenu, hidePauseMenu, togglePauseButton } from './view.js';
import { Paused, ContinueButton, RestartButton, RestartModalButton } from './dom.js';

function handlePause() {
    state.paused = !state.paused;
    togglePauseButton(state.paused);
    if (state.paused) {
        state.pauseStartTime = Date.now();
        showPauseMenu();
    } else {
        state.totalPausedTime += Date.now() - state.pauseStartTime;
        hidePauseMenu();
    }
}

export function initControls() {
    document.addEventListener('keydown', (e) => {
        if ([" ", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }

        if (e.key.toLowerCase() === 'r') {
            location.reload();
            return;
        }

        if (e.key.toLowerCase() === 'p') {
            handlePause();
            return;
        }

        if (state.over || state.paused || !state.active) return;

        switch (e.key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                moveLeft();
                break;
            case 'd':
            case 'arrowright':
                moveRight();
                break;
            case 's':
            case 'arrowdown':
                moveDown();
                break;
            case 'w':
            case 'arrowup':
                rotate();
                break;
            case ' ':
                hardDrop();
                break;
            case 'shift':
                holdPiece();
                break;
        }
    });

    Paused.addEventListener("click", handlePause);
    ContinueButton.addEventListener("click", handlePause);
    RestartButton.addEventListener("click", () => location.reload());
    RestartModalButton.addEventListener("click", () => location.reload());
}