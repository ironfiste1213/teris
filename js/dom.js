import { ROWS, COLUMNS } from './constants.js';

export const board = document.getElementById("board");
export const Lockedpieces = document.getElementById("locked-pieces-layer");
export const next = document.getElementById("next");
export const hold = document.getElementById("hold");
export const container = document.getElementById("game-container");
export const Score = document.getElementById('score');
export const RestartButton = document.getElementById("restart-button");
export const Lines = document.getElementById("lines");
export const Level = document.getElementById("level");
export const Paused = document.getElementById("paused");
export const Activepiece = document.getElementById("active-piece-layer");
export const GhostPice = document.getElementById("ghost-piece-layer");
export const Timer = document.getElementById("timer");
export const lives = document.getElementById("lives");
export const PauseMenu = document.getElementById("pause-menu");
export const ContinueButton = document.getElementById("continue-button");
export const RestartModalButton = document.getElementById("restart-modal-button");


const holdCellsList = [];
for (let i = 0; i < 16; i++) {
    const holdCell = document.createElement('div');
    holdCell.classList.add('cell');
    hold.appendChild(holdCell);
    holdCellsList.push(holdCell);
}
export const holdCells = holdCellsList;

const nextPreviewsList = [];
for (let i = 0; i < 5; i++) {
    const preview = document.createElement('div');
    preview.classList.add('next-preview');
    const previewCells = [];
    for (let j = 0; j < 16; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        preview.appendChild(cell);
        previewCells.push(cell);
    }
    next.appendChild(preview);
    nextPreviewsList.push(previewCells);
}
export const nextPreviews = nextPreviewsList;
