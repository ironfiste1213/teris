import { state } from './state.js';
import { COLUMNS, COLORS, SHAPES, ROWS } from './constants.js';
import { holdCells, nextPreviews, Activepiece, GhostPice, Lockedpieces, PauseMenu, Timer, Score, Lines, Level, lives as livesEl, Paused as PausedEl, container } from './dom.js';

// Removes all child elements from a given DOM layer.
function clearLayer(layer) {
  while (layer.firstChild) {
    layer.removeChild(layer.firstChild);
  }
}

// Renders the locked pieces on the board based on the game state grid.
export function renderBoard() {
  clearLayer(Lockedpieces);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLUMNS; x++) {
      const type = state.grid[y][x];
      if (type) {
        const block = document.createElement("div");
        block.classList.add("piece-block");
        block.style.backgroundColor = COLORS[type];
        // Position the block based on its grid coordinates
        block.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        Lockedpieces.appendChild(block);
      }
    }
  }
}

// Renders the currently falling (active) piece.
export function renderActivePiece(piece) {
    if (!piece) return;
    const shape = SHAPES[piece.type][piece.rotation];
    createPieceVisuals(Activepiece, shape, piece.type);
    const activeX = piece.x * 30;
    const activeY = piece.y * 30;
    Activepiece.style.transform = `translate(${activeX}px, ${activeY}px)`;
}

// Creates the visual blocks for a piece on a given layer.
function createPieceVisuals(layer, shape, pieceType) {
  clearLayer(layer);
  for (let i = 0; i < 4; i++) {
    const [dx, dy] = shape[i];
    const block = document.createElement("div");
    block.style.backgroundColor = COLORS[pieceType];
    block.classList.add("piece-block");
    block.style.transform = `translate(${dx * 30}px, ${dy * 30}px)`;
    layer.appendChild(block);
  }
}

// Renders the ghost piece, showing where the active piece will land.
export function renderGhostPiece(piece, ghostY) {
    if (!piece) return;
    const shape = SHAPES[piece.type][piece.rotation];
    createPieceVisuals(GhostPice, shape, piece.type);
    const ghostX = piece.x * 30;
    GhostPice.style.transform = `translate(${ghostX}px, ${ghostY * 30}px)`;
}

// Renders the upcoming pieces in the "Next" preview area.
export function renderNext() {
  nextPreviews.forEach(cells => {
    cells.forEach(cell => (cell.style.backgroundColor = '#212121'));
  });

  for (let i = 0; i < 5; i++) {
    const type = state.nextQ[i];
    if (!type) continue;

    const shape = SHAPES[type][0];
    const cells = nextPreviews[i];
    let p = (type === "O") ? 1 : 0;

    shape.forEach(([dx, dy]) => {
      const index = (dy + 1) * 4 + dx + p;
      if (index >= 0 && index < cells.length) {
        cells[index].style.backgroundColor = COLORS[type];
      }
    });
  }
}

// Renders the piece in the "Hold" area.
export function renderHold() {
  holdCells.forEach(cell => (cell.style.backgroundColor = '#212121'));

  if (!state.hold) return;

  const shape = SHAPES[state.hold][0];
  let p = (state.hold === "O") ? 1 : 0;

  shape.forEach(([dx, dy]) => {
    const index = (dy + 1) * 4 + dx + p;
    if (index >= 0 && index < holdCells.length) {
        holdCells[index].style.backgroundColor = COLORS[state.hold];
    }
  });
}

// Updates the displayed score, lines, level, and lives.
export function updateStats() {
    Score.textContent = state.score;
    Lines.textContent = state.lines;
    Level.textContent = state.level;
    livesEl.textContent = state.lives;
}

// Updates the game timer.
export function updateTimer() {
  if (!state.paused && !state.over) {
    state.gameTime = Date.now() - state.startTime;
    const minutes = Math.floor(state.gameTime / 60000);
    const seconds = Math.floor((state.gameTime % 60000) / 1000);
    Timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Displays the pause menu overlay.
export function showPauseMenu() {
  PauseMenu.style.display = "flex";
}

// Hides the pause menu overlay.
export function hidePauseMenu() {
  PauseMenu.style.display = "none";
}

// Toggles the text on the pause button.
export function togglePauseButton(paused) {
    PausedEl.textContent = paused ? "Continue" : "pause";
}

// Plays the screen shake animation for a hard drop.
export function playHardDropAnimation() {
    container.classList.add("hit-drop-animation");
    container.addEventListener("animationend", () => {
        container.classList.remove("hit-drop-animation");
    }, { once: true });
}
