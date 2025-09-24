import { initControls } from './controls.js';
import { gameLoop } from './game.js';
import { state } from './state.js';
import { renderBoard, updateStats, renderNext, renderHold } from './view.js';
import { lives } from './dom.js';

function init() {
    lives.textContent = state.lives;
    renderBoard();
    updateStats();
    renderNext();
    renderHold();
    initControls();
    requestAnimationFrame(gameLoop);
}

init();
