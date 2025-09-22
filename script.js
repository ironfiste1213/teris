const board = document.getElementById("board");
const next = document.getElementById("next");
const hold = document.getElementById("hold");
const container = document.getElementById("game-container");
const Score = document.getElementById('score');
const RestartButton = document.getElementById("restart-button");
const Lines = document.getElementById("lines");
const Level = document.getElementById("level");
const Paused = document.getElementById("paused");
const Activepiece = document.getElementById("active-piece-layer");
const GhostPice = document.getElementById("ghost-piece-layer");
const Timer = document.getElementById("timer");
const lives = document.getElementById("lives");
const PauseMenu = document.getElementById("pause-menu");
const ContinueButton = document.getElementById("continue-button");
const RestartModalButton = document.getElementById("restart-modal-button");

const colum = 10;
const row = 20;

const COLORS = {
  I: "#00c3ff",
  O: "#ffd500",
  T: "#ff3b30",
  S: "#4cd964",
  Z: "#ff9f0a",
  J: "#5856d6",
  L: "#af52de"
};

const SHAPES = {
  I: [[[0, 1], [1, 1], [2, 1], [3, 1]], [[2, 0], [2, 1], [2, 2], [2, 3]], [[0, 2], [1, 2], [2, 2], [3, 2]], [[1, 0], [1, 1], [1, 2], [1, 3]]],
  O: [[[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]]],
  T: [[[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [0, 1], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [1, 1], [2, 1], [1, 2]]],
  S: [[[1, 0], [2, 0], [0, 1], [1, 1]], [[1, 0], [1, 1], [2, 1], [2, 2]], [[1, 1], [2, 1], [0, 2], [1, 2]], [[0, 0], [0, 1], [1, 1], [1, 2]]],
  Z: [[[0, 0], [1, 0], [1, 1], [2, 1]], [[2, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [0, 1], [1, 1], [0, 2]]],
  J: [[[0, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [1, 1], [0, 2], [1, 2]]],
  L: [[[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [1, 2], [2, 2]], [[0, 1], [1, 1], [2, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [1, 2]]]
};

let state = {
  grid: Array.from({ length: row }, () => Array(colum).fill(0)),
  active: null,
  nextQ: bag(),
  hold: null,
  canHold: true,
  score: 0,
  lines: 0,
  level: 1,
  dropInterval: 700,
  over: false,
  paused: false,
  startTime: Date.now(),
  gameTime: 0,
  lives: 3
};
lives.textContent = state.lives;


let dt = 0;
let lasttime = 0;
let h = 0;

// Initialize Board
for (let i = 0; i < row; i++) {
  for (let j = 0; j < colum; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    board.appendChild(cell);
  }
}

// Initialize Hold Area
for (let i = 0; i < 16; i++) {
  const holdCell = document.createElement('div');
  holdCell.classList.add('cell');
  hold.appendChild(holdCell);
}

// Initialize Next Previews
const nextPreviews = [];
for (let i = 0; i < 5; i++) {
  const preview = document.createElement('div');
  preview.classList.add('next-preview');
  for (let j = 0; j < 16; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    preview.appendChild(cell);
  }
  next.appendChild(preview);
  nextPreviews.push(Array.from(preview.children));
}

const boardCells = Array.from(board.children);
const holdCells = Array.from(hold.children);

function bag() {
  const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const shuffled = [];

  while (pieces.length) {
    const idx = Math.floor(Math.random() * pieces.length);
    shuffled.push(pieces[idx]);
    pieces.splice(idx, 1);
  }

  return shuffled;
}

function clearLayer(layer) {
  while (layer.firstChild) {
    layer.removeChild(layer.firstChild);
  }
}

function createPieceVisuals(layer, shape, pieceType, opacity) {
  for (let i = 0; i < 4; i++) {
    const [dx, dy] = shape[i];
    const block = document.createElement("div");
    block.style.backgroundColor = COLORS[pieceType];
    block.classList.add("piece-block");
    block.style.opacity = opacity;
    block.style.left = (dx * 30 + 2) + "px";
    block.style.top = (dy * 30 + 2) + "px";
    layer.appendChild(block);
  }
}

function isValidMove(xOffset, yOffset, rotation) {
  const shape = SHAPES[state.active.type][rotation];
  for (const [dx, dy] of shape) {
    const x = state.active.x + dx + xOffset;
    const y = state.active.y + dy + yOffset;
    if (x < 0 || x >= colum || y >= row) return false;
    if (y >= 0 && state.grid[y][x] !== 0) return false;
  }
  return true;
}

function getGhostY() {
  if (!state.active) {
    return 0;
  }
  let ghostY = 0;
  while (isValidMove(0, ghostY + 1, state.active.rotation)) {
    ghostY += 1;
  }
  return ghostY + state.active.y;
}

function spawnPiece() {
  if (state.over) return;
  if (state.nextQ.length < 7) {
    state.nextQ = state.nextQ.concat(bag());
  }
  const type = state.nextQ.shift();
  state.active = {
    type: type,
    x: 3,
    y: -1,
    rotation: 0
  };
  clearLayer(Activepiece);
  clearLayer(GhostPice);
  const shape = SHAPES[state.active.type][state.active.rotation];
  const cellSize = 30;
  const activeX = state.active.x * cellSize;
  const activeY = state.active.y * cellSize;
  Activepiece.style.transform = `translate(${activeX}px, ${activeY}px)`;
  createPieceVisuals(Activepiece, shape, state.active.type, 1.0);
  const ghostY = getGhostY();
  GhostPice.style.transform = `translate(${activeX}px, ${ghostY * cellSize}px)`;
  createPieceVisuals(GhostPice, shape, state.active.type, 0.3);
  state.canHold = true;
  renderNext();
}

function holdPiece() {
  if (!state.canHold) return;
  const current = state.active.type;
  clearLayer(Activepiece);
  clearLayer(GhostPice);
  if (state.hold === null) {
    state.hold = current;
    spawnPiece();
  } else {
    [state.hold, state.active.type] = [current, state.hold];
    state.active.x = 3;
    state.active.y = -1;
    state.active.rotation = 0;
    const shape = SHAPES[state.active.type][state.active.rotation];
    const activeX = state.active.x * 30;
    const activeY = state.active.y * 30;
    Activepiece.style.transform = `translate(${activeX}px, ${activeY}px)`;
    createPieceVisuals(Activepiece, shape, state.active.type, 1.0);
    const ghostY = getGhostY();
    GhostPice.style.transform = `translate(${activeX}px, ${ghostY * 30}px)`;
    createPieceVisuals(GhostPice, shape, state.active.type, 0.3);
  }
  state.canHold = false;
  renderHold();
}

function rotation() {
  clearLayer(Activepiece);
  clearLayer(GhostPice);
  const shape = SHAPES[state.active.type][state.active.rotation];
  createPieceVisuals(Activepiece, shape, state.active.type, 1.0);
  createPieceVisuals(GhostPice, shape, state.active.type, 0.3);
}

function lockPiece() {
  if (!state.active) return;

  const shape = SHAPES[state.active.type][state.active.rotation];
  let hitTop = false;

  shape.forEach(([dx, dy]) => {
    const x = state.active.x + dx;
    const y = state.active.y + dy;

    if (y < 0) hitTop = true;
    else if (y < row) state.grid[y][x] = state.active.type;
  });
  if (hitTop) {
    state.lives -= 1;
    lives.textContent = state.lives;

    if (state.lives <= 0) {
      state.over = true;
      window.location.href = "gameover.html";
      return;
    } else {
      state.grid.forEach(row => row.fill(0));
      state.active = null;
      state.hold = null;
      state.canHold = true;
      renderGrid();
      spawnPiece();
      return;
    }
  }
  clearLines();
  renderGrid();
  spawnPiece();
}


function hardDrop() {
  while (isValidMove(0, 1, state.active.rotation)) {
    state.active.y += 1;
    state.score += 2;
    Score.textContent = state.score;
  }
  lockPiece();
  render();

  container.classList.add("hit-drop-animation");
  container.addEventListener("animationend", () => {
    container.classList.remove("hit-drop-animation");
  }, { once: true });
}

function clearLines() {
  let lines = 0;
  for (let y = row - 1; y >= 0; y--) {
    if (state.grid[y].every(cell => cell !== 0)) {
      state.grid.splice(y, 1);
      state.grid.unshift(Array(colum).fill(0));
      lines += 1;
      h += 1;
      state.lines += 1;
      y++;
    }
  }
  updateScore(lines);
  if (h >= 10) {
    state.level += Math.floor(h / 10);
    h = h % 10;
    state.dropInterval = Math.max(100, 700 - (state.level - 1) * 60);
  }
  Score.textContent = state.score;
  Lines.textContent = state.lines;
  Level.textContent = state.level;
}

function updateScore(linesCleared) {
  const basePoints = [0, 40, 100, 300, 1200];
  state.score += basePoints[linesCleared] * state.level;
}

function updateTimer() {
  if (!state.paused && !state.over) {
    state.gameTime = Date.now() - state.startTime;
    const minutes = Math.floor(state.gameTime / 60000);
    const seconds = Math.floor((state.gameTime % 60000) / 1000);
    Timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

function reset() {
  state.grid.forEach(row => row.fill(0));
  state.nextQ.length = 0;
  state.score = 0;
  state.startTime = Date.now();
  state.gameTime = 0;
}

function renderGrid() {
  boardCells.forEach((cell, index) => {
    const x = index % colum;
    const y = Math.floor(index / colum);
    const type = state.grid[y][x];
    cell.style.backgroundColor = type ? COLORS[type] : '#212121';
  });
}

function render() {
  if (state.over) return;
  const activeX = state.active.x * 30;
  const activeY = state.active.y * 30;
  Activepiece.style.transform = `translate(${activeX}px, ${activeY}px)`;
  const ghostY = getGhostY();
  const ghostX = state.active.x * 30;
  GhostPice.style.transform = `translate(${ghostX}px, ${ghostY * 30}px)`;
}

function renderNext() {
  nextPreviews.forEach(cells => {
    cells.forEach(cell => (cell.style.backgroundColor = '#212121'));
  });

  for (let i = 0; i < 5; i++) {
    const type = state.nextQ[i];
    if (!type) continue;

    const shape = SHAPES[type][0];
    const cells = nextPreviews[i];
    let m = 0;
    let p = 0;
    shape.forEach(([dx, dy]) => {
      if (type != "I") {
        m = 1;
      }
      if (type == "O") {
        p = 1;
      }
      const index = (dy + 1) * 4 + dx + p;

      if (index >= 0 && index < cells.length) {
        cells[index].style.backgroundColor = COLORS[type];
      }
    });
  }
}

function renderHold() {
  holdCells.forEach(cell => (cell.style.backgroundColor = '#212121'));

  if (!state.hold) return;

  const shape = SHAPES[state.hold][0];
  shape.forEach(([dx, dy]) => {
    const index = dy * 4 + dx;
    holdCells[index].style.backgroundColor = COLORS[state.hold];
  });
}

// Show pause menu when paused
function showPauseMenu() {
  PauseMenu.style.display = "flex";
}

// Hide pause menu
function hidePauseMenu() {
  PauseMenu.style.display = "none";
}

function loop(timestap) {
  if (state.over || state.paused) {
    return;
  }
  updateTimer();
  if (!state.active) {
    spawnPiece();
  }
  if (!lasttime) {
    lasttime = timestap;
  }
  dt += timestap - lasttime;
  lasttime = timestap;
  if (dt >= state.dropInterval) {
    if (isValidMove(0, 1, state.active.rotation)) {
      console.log(state.dropInterval);
      state.active.y += 1;
      render();
    } else {
      lockPiece();
    }
    dt = 0;
  }
 

  requestAnimationFrame(loop);
}

document.addEventListener('keydown', (e) => {
  if ([" ", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }

  switch (e.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (state.over || state.paused || !state.active) {
        break;
      }
      if (isValidMove(-1, 0, state.active.rotation)) state.active.x -= 1;
      break;

    case 'ArrowRight':
    case 'd':
    case 'D':
      if (state.over || state.paused || !state.active) {
        break;
      }
      if (isValidMove(1, 0, state.active.rotation)) state.active.x += 1;
      break;

    case 'ArrowDown':
    case 's':
    case 'S':
      if (state.over || state.paused || !state.active) {
        break;
      }
      if (isValidMove(0, 1, state.active.rotation)) {
        state.score += 1;
        state.active.y += 1;
        Score.textContent = state.score;
      } else lockPiece();
      break;

    case 'ArrowUp':
    case 'w':
    case 'W':
      if (state.over || state.paused || !state.active) {
        break;
      }
      let newRot = (state.active.rotation + 1) % 4;
      if (isValidMove(0, 0, newRot)) {
        state.active.rotation = newRot;
        rotation();
      } 
      else if (isValidMove(-1, 0, newRot)) {
        state.active.x -= 1;
        state.active.rotation = newRot;
        rotation();
      } 
      else if (isValidMove(1, 0, newRot)) {
        state.active.x += 1;
        state.active.rotation = newRot;
        rotation();
      }
      break;

    case ' ':
      if (state.over || state.paused || !state.active) {
        break;
      }
      hardDrop();
      break;

    case 'Shift':
      if (state.over || state.paused || !state.active) {
        break;
      }
      holdPiece();
      break;

    case 'r':
    case 'R':
      location.reload();
      break;

    case 'p':
    case 'P':
      state.paused = !state.paused;
      Paused.textContent = state.paused ? "Continue" : "pause";
      if (state.paused) {
        showPauseMenu();
      } else {
        hidePauseMenu();
        requestAnimationFrame(loop);
      }
      break;
  }

  render();
});

Paused.addEventListener("click", () => {
  state.paused = !state.paused;
  Paused.textContent = state.paused ? "Continue" : "pause";
  if (state.paused) {
    showPauseMenu();
  } else {
    hidePauseMenu();
    requestAnimationFrame(loop);
  }
});

ContinueButton.addEventListener("click", () => {
  state.paused = false;
  Paused.textContent = "pause";
  hidePauseMenu();
  requestAnimationFrame(loop);
});

RestartButton.addEventListener("click", () => {
  location.reload();
});

RestartModalButton.addEventListener("click", () => {
  location.reload();
});

requestAnimationFrame(loop);