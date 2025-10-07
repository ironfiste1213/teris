import { state, bag } from './state.js';
import { SHAPES, COLUMNS, ROWS } from './constants.js';
import * as view from './view.js';

// Checks if a piece's potential move (translation or rotation) is valid
export function isValidMove(piece, xOffset, yOffset, rotation) {
  const shape = SHAPES[piece.type][rotation];
  for (const [dx, dy] of shape) {
    const x = piece.x + dx + xOffset;
    const y = piece.y + dy + yOffset;
    if (x < 0 || x >= COLUMNS || y >= ROWS) return false;
    if (y >= 0 && state.grid[y][x] !== 0) return false;
  }
  return true;
}

// Calculates the final Y position for the ghost piece
function getGhostY() {
  if (!state.active) return 0;
  let y = state.active.y;
  while (isValidMove(state.active, 0, y - state.active.y + 1, state.active.rotation)) {
    y++;
  }
  return y;
}

// Renders the active piece and its corresponding ghost piece
function render() {
    if (state.over || !state.active) return;
    view.renderActivePiece(state.active);
    const ghostY = getGhostY();
    view.renderGhostPiece(state.active, ghostY);
}

// Spawns a new piece at the top of the board
function spawnPiece() {
  if (state.over) return;
  if (state.nextQ.length < 7) {
    state.nextQ.push(...bag());
  }
  const type = state.nextQ.shift();
  state.active = { type, x: 3, y: -1, rotation: 0 };

  if (!isValidMove(state.active, 0, 0, state.active.rotation)) {
      state.lives -= 1;
      view.updateStats();
      if (state.lives <= 0) {
          state.over = true;
          window.location.href = "gameover.html";
          return;
      } else {
          // Don't reset the whole state just clear the board and held piece
          state.grid.forEach(row => row.fill(0));
          state.hold = null;
          state.canHold = true;
          view.renderBoard();
          view.renderHold();
          spawnPiece();
          return;
      }
  }

  state.canHold = true;
  view.renderNext();
  render();
}

// Updates the score based on the number of lines cleared
function updateScore(linesCleared) {
  const basePoints = [0, 40, 100, 300, 1200];
  state.score += basePoints[linesCleared] * state.level;
}


// Clears completed lines from the grid
function clearLines() {
  let linesCleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (state.grid[y].every(cell => cell !== 0)) {
      state.grid.splice(y, 1);
      state.grid.unshift(Array(COLUMNS).fill(0));
      linesCleared++;
      state.lines++;
      y++;
    }
  }

  if (linesCleared > 0) {
      updateScore(linesCleared);
      state.linesForLevelUp += linesCleared;
      if (state.linesForLevelUp >= 10) {
          state.level += Math.floor(state.linesForLevelUp / 10);
          state.linesForLevelUp %= 10;
          state.dropInterval = Math.max(100, 700 - (state.level - 1) * 60);
          showLevelUpStory();
      }
      view.updateStats();
  }
}

const storySentences = [
  "He feels the weight of every block, each one a memory he cannot place.",
  "The grid stretches on, endless, a silent testament to his persistence.",
  "A fleeting hope flickers as the lines vanish, but the emptiness remains.",
  "He wonders if the next piece will bring salvation or only delay the inevitable.",
  "The music echoes in the void, a lullaby for the restless.",
  "He is both the architect and the prisoner of this falling world.",
  "Each level brings new speed, but the tunnel ahead is as dark as ever.",
  "He dreams of escape, but the game resets, and he begins again.",
  "The blocks descend, uncaring, as he chases meaning in their patterns.",
  "Victory is an illusion, but still, he plays on."
];


function showLevelUpStory() {
  const msgDiv = document.getElementById('story-message');
  if (!msgDiv) return;
  const idx = Math.floor(Math.random() * storySentences.length);
  msgDiv.textContent = storySentences[idx];
  msgDiv.style.display = 'block';
  setTimeout(() => {
    setTimeout(() => { msgDiv.style.display = 'none'; }, 400);
  }, 3300);
}


// Locks the active piece into the grid
function lockPiece() {
  if (!state.active) return;

  const shape = SHAPES[state.active.type][state.active.rotation];
  shape.forEach(([dx, dy]) => {
    const x = state.active.x + dx;
    const y = state.active.y + dy;
    if (y >= 0) state.grid[y][x] = state.active.type;
  });

  clearLines();
  view.renderBoard();
  spawnPiece();
}

// Moves the active piece one column to the left
export function moveLeft() {
    if (isValidMove(state.active, -1, 0, state.active.rotation)) {
        state.active.x -= 1;
        render();
    }
}

// Moves the active piece one column to the right
export function moveRight() {
    if (isValidMove(state.active, 1, 0, state.active.rotation)) {
        state.active.x += 1;
        render();
    }
}

// Moves the active piece one row down (soft drop)
export function moveDown() {
    if (isValidMove(state.active, 0, 1, state.active.rotation)) {
        state.score += 1;
        state.active.y += 1;
        view.updateStats();
        render();
    } else {
        lockPiece();
    }
}

// Rotates the active piece, with wall kick checks
export function rotate() {
    const newRot = (state.active.rotation + 1) % 4;
    if (isValidMove(state.active, 0, 0, newRot)) {
        state.active.rotation = newRot;
    } else if (isValidMove(state.active, -1, 0, newRot)) {
        state.active.x -= 1;
        state.active.rotation = newRot;
    } else if (isValidMove(state.active, 1, 0, newRot)) {
        state.active.x += 1;
        state.active.rotation = newRot;
    }
    render();
}

// Instantly drops the active piece to its lowest valid position (hard drop)
export function hardDrop() {
  const ghostY = getGhostY();
  if (ghostY > state.active.y) {
      state.score += (ghostY - state.active.y) * 2;
  }
  state.active.y = ghostY;
  view.updateStats();
  lockPiece();
  view.playHardDropAnimation();
}

// Swaps the active piece with the piece in the hold area
export function holdPiece() {
  if (!state.canHold) return;
  
  const currentType = state.active.type;
  if (state.hold === null) {
    state.hold = currentType;
    spawnPiece();
  } else {
    const heldType = state.hold;
    state.hold = currentType;
    state.active = { type: heldType, x: 3, y: -1, rotation: 0 };
    if (!isValidMove(state.active, 0, 0, 0)) {
        state.hold = heldType;
        state.active.type = currentType;
        return;
    }
  }
  state.canHold = false;
  view.renderHold();
  render();
}

let dt = 0;
let lasttime = 0;

// The main game loop, which updates game state and renders frames
export function gameLoop(timestamp) {
  if (state.over) return;
  
  if (!state.paused) {
    view.updateTimer();
    if (!state.active) spawnPiece();

    if (!lasttime) lasttime = timestamp;
    dt += timestamp - lasttime;
    lasttime = timestamp;

    if (dt >= state.dropInterval) {
      moveDown();
      dt = 0;
    }
  } else {
    lasttime = timestamp;
  }

  requestAnimationFrame(gameLoop);
}
