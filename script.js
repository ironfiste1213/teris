const board = document.getElementById("board");
const next = document.getElementById("next");
const hold = document.getElementById("hold");
const container = document.getElementById("game-container");
const Score = document.getElementById('score')
const RestartButton = document.getElementById("restart-button")
const Lines = document.getElementById("lines")
const Level = document.getElementById("level")
const Paused = document.getElementById("paused")
const Activepiece = document.getElementById("active-piece-layer")
const GhostPice = document.getElementById("ghost-piece-layer")
const colum = 10;
const row = 20;

for (let i = 0; i < row; i++) {
  for (let j = 0; j < colum; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    board.appendChild(cell);
  }
}

for (let i = 0; i < 16; i++) {
  const holdCell = document.createElement('div');
  holdCell.classList.add('cell');
  hold.appendChild(holdCell);
}

const boardCells = Array.from(board.children);
const holdCells = Array.from(hold.children);

const COLORS = {
  I: "#00c3ff",
  O: "#ffd500",
  T: "#ff3b30",
  S: "#4cd964",
  Z: "#ff9f0a",
  J: "#5856d6",
  L: "#af52de"
};

const GHOST_COLOR = '#ffffff10';

const SHAPES = {
  I: [[[0, 1], [1, 1], [2, 1], [3, 1]], [[2, 0], [2, 1], [2, 2], [2, 3]], [[0, 2], [1, 2], [2, 2], [3, 2]], [[1, 0], [1, 1], [1, 2], [1, 3]]],
  O: [[[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]]],
  T: [[[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [0, 1], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [1, 1], [2, 1], [1, 2]]],
  S: [[[1, 0], [2, 0], [0, 1], [1, 1]], [[1, 0], [1, 1], [2, 1], [2, 2]], [[1, 1], [2, 1], [0, 2], [1, 2]], [[0, 0], [0, 1], [1, 1], [1, 2]]],
  Z: [[[0, 0], [1, 0], [1, 1], [2, 1]], [[2, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [1, 2], [2, 2]], [[1, 0], [0, 1], [1, 1], [0, 2]]],
  J: [[[0, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [1, 1], [0, 2], [1, 2]]],
  L: [[[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [1, 2], [2, 2]], [[0, 1], [1, 1], [2, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [1, 2]]]
};

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
  paused: false
};

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
  createPieceVisuals(Activepiece, shape, state.active.type, 1.0); // Full opacity
  const ghostY = getGhostY();
  GhostPice.style.transform = `translate(${activeX}px, ${ghostY * cellSize}px)`;
  createPieceVisuals(GhostPice, shape, state.active.type, 0.3); // 30% opacity
  state.canHold = true;
  renderNext();
}

function createPieceVisuals(layer, shape, pieceType, opacity) {
  for (let i = 0; i < 4; i++) {
    const [dx, dy] = shape[i];
    const block = document.createElement("div");
    block.style.backgroundColor = COLORS[pieceType];
    block.classList.add("piece-block");
    block.style.opacity = opacity;
    block.style.left = `${dx * 30}px`;
    block.style.top = `${dy * 30}px`;
    layer.appendChild(block);
  }
}

function clearLayer(layer) {
  while (layer.firstChild) {
    layer.removeChild(layer.firstChild);
  }
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

function renderGrid() {
  boardCells.forEach((cell, index) => {
    const x = index % colum;
    const y = Math.floor(index / colum);
    const type = state.grid[y][x];
    cell.style.backgroundColor = type ? COLORS[type] : '#212121';
  });
}

function getGhostY() {
  let ghostY = state.active.y;
  while (isValidMove(0, 1, state.active.rotation)) {
    state.active.y += 1;
  }
  const finalY = state.active.y;
  state.active.y = ghostY;
  return finalY;
}

function render() {
  if (state.over) return;
  renderGrid();
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
    let m = 0
    let p = 0
    shape.forEach(([dx, dy]) => {
      if (type != "I") {
        m = 1
      }
      if (type == "O") {
        p = 1
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

function lockPiece() {
  const shape = SHAPES[state.active.type][state.active.rotation];
  shape.forEach(([dx, dy]) => {
    const x = state.active.x + dx;
    const y = state.active.y + dy;
    if (y >= 0) {
      state.grid[y][x] = state.active.type;
    } else {
      state.over = true;
      alert("Game Over");
    }
  });

  clearLines();
  spawnPiece();
}
function reset() {
  state.grid.forEach(row => row.fill(0));
  state.nextQ.length = 0
  state.score = 0

}
let h = 0
function clearLines() {
  for (let y = row - 1; y >= 0; y--) {
    if (state.grid[y].every(cell => cell !== 0)) {
      state.grid.splice(y, 1);
      state.grid.unshift(Array(colum).fill(0));
      h += 1;
      state.lines += 1
      y++;
    }
  }
  if (h >= 10) {
    state.level += h / 10
    h = h % 10
    if ((state.dropInterval - 60) >= 90) {
      state.dropInterval -= 60
    }
  }
  Score.textContent = state.score;
  Lines.textContent = state.lines
  Level.textContent = state.level
}

function hardDrop() {
  while (isValidMove(0, 1, state.active.rotation)) {
    state.active.y += 1;
    state.score += 2
  }
  lockPiece();
  render();

  container.classList.add("hit-drop-animation");

  container.addEventListener("animationend", () => {
    container.classList.remove("hit-drop-animation");
  }, { once: true });
}
let dt = 0;
let lasttime = 0;


function loop(timestap) {
  if (state.over || state.paused) {
    return
  }
  if (!state.active) {
    spawnPiece()
  }
  if (!lasttime) {
    lasttime = timestap;
  }
  dt += timestap - lasttime;
  lasttime = timestap
  if (dt >= state.dropInterval) {
    if (isValidMove(0, 1, state.active.rotation)) {
      console.log(state.dropInterval);

      state.active.y += 1
    } else {
      lockPiece();
    }
    dt = 0
  }
  render()

  requestAnimationFrame(loop)


}



document.addEventListener('keydown', (e) => {
  if ([" ", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }

  switch (e.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (state.over || state.paused) {
        break
      }

      if (isValidMove(-1, 0, state.active.rotation)) state.active.x -= 1;
      break;

    case 'ArrowRight':
    case 'd':
    case 'D':
      if (state.over || state.paused) {
        break
      }

      if (isValidMove(1, 0, state.active.rotation)) state.active.x += 1;
      break;

    case 'ArrowDown':
    case 's':
    case 'S':
      if (state.over || state.paused) {
        break
      }

      if (isValidMove(0, 1, state.active.rotation)) {
        state.score += 1; state.active.y += 1;
      } else lockPiece();
      break;

    case 'ArrowUp':
    case 'w':
    case 'W':
      if (state.over || state.paused) {
        break
      }

      let newRot = (state.active.rotation + 1) % 4;
      if (isValidMove(0, 0, newRot)) {
        state.active.rotation = newRot;
      }
      break;

    case ' ':
      if (state.over || state.paused) {
        break
      }

      hardDrop();
      break;

    case 'Shift':
      if (state.over || state.paused) {
        break
      }

      holdPiece();
      break;

    case 'r':
    case 'R':
      location.reload();

    case 'p':
    case 'P':
      state.paused = !state.paused
      Paused.textContent = state.paused ? "Continue" : "pause"
      requestAnimationFrame(loop)
  }

  render();
});
Paused.addEventListener("click", () => {
  state.paused = !state.paused
  Paused.textContent = state.paused ? "Continue" : "pause"

  requestAnimationFrame(loop)
})
RestartButton.addEventListener("click", () => {
  location.reload();
});

requestAnimationFrame(loop)
