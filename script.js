const board = document.getElementById("board");
const next = document.getElementById("next");
const colum = 10;
const row = 20;

//const boardArray = []
for (let i = 0; i < row; i++) {
  for (let j = 0; j < colum; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');  
    board.appendChild(cell);
    //boardArray.
  }
}

for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell'); 
    next.appendChild(cell);
  }
}

const boardCells = Array.from(board.children);
const nextCells = Array.from(next.children);
const COLORS = {
  I: "#555555",
  O: "#707070",
  T: "#8C8C8C",
  S: "#777777",
  Z: "#A0A0A0",
  J: "#CCCCCC",
  L: "#EEEEEE"
};
const GHOST_COLOR = '#ffffff10'

const SHAPES = {
  I: [
    [[0,1],[1,1],[2,1],[3,1]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[1,0],[1,1],[1,2],[1,3]]
  ],
  O: [
    [[0,0],[1,0],[0,1],[1,1]],
    [[0,0],[1,0],[0,1],[1,1]],
    [[0,0],[1,0],[0,1],[1,1]],
    [[0,0],[1,0],[0,1],[1,1]]
  ],
  T: [
    [[1,0],[0,1],[1,1],[2,1]],
    [[1,0],[0,1],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[1,2]],
    [[1,0],[1,1],[2,1],[1,2]]
  ],
  S: [
    [[1,0],[2,0],[0,1],[1,1]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[1,1],[2,1],[0,2],[1,2]],
    [[0,0],[0,1],[1,1],[1,2]]
  ],
  Z: [
    [[0,0],[1,0],[1,1],[2,1]],
    [[2,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[1,0],[0,1],[1,1],[0,2]]
  ],
  J: [
    [[0,0],[0,1],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[0,2],[1,2]]
  ],
  L: [
    [[2,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,1],[0,2]],
    [[0,0],[1,0],[1,1],[1,2]]
  ]
}


let state = {
  grid: Array.from({length: row}, () => Array(colum).fill(0)),
  active: null,    
  nextQ: [],        
  score: 0,
  lines: 0,
  level: 1,
  over: false,
  paused: false
};

function bag() {
  if (state.over) {
    return 
  }
  const pieces = ['I','O','T','S','Z','J','L'];
  const shuffled = [];

  while (pieces.length) {
    const idx = Math.floor(Math.random() * pieces.length);
    shuffled.push(pieces[idx]);
    pieces.splice(idx, 1);
  }

  return shuffled;
}

function spawnPiece() {
  if (state.over) {
    return 
  }
  if (state.nextQ.length === 0) {
    state.nextQ = bag();
  }

  const type = state.nextQ.shift();

  state.active = {
    type: type,
    x: 3,
    y: -1,
    rotation: 0
  };
  rendernext()
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
  if (state.over) {
    return 
  }
  renderGrid();

  const shape = SHAPES[state.active.type][state.active.rotation];
  const ghostY = getGhostY();
  shape.forEach(([dx, dy]) => {
    const x = state.active.x + dx;
    const y = ghostY + dy;
    if (x >= 0 && x < colum && y >= 0 && y < row) {
      const index = y * colum + x;
      boardCells[index].style.backgroundColor = GHOST_COLOR;
    }
  });
  shape.forEach(([dx, dy]) => {
    const x = state.active.x + dx;
    const y = state.active.y + dy;
    if (x >= 0 && x < colum && y >= 0 && y < row) {
      const index = y * colum + x;
      boardCells[index].style.backgroundColor = COLORS[state.active.type];
    }
  });
}
function rendernext() {
  if (state.nextQ.length === 0) {
    state.nextQ = bag();
  }
  nextCells.forEach((d) => {
    d.style.backgroundColor = '#212121';
  });

  const type = state.nextQ[0];
  const shape = SHAPES[type][0];
  for (let i = 0; i < 4; i++) {
    nextCells[shape[i][0] + shape[i][1] * 4].style.backgroundColor = COLORS[type];
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
function lockPiece() {
  const shape = SHAPES[state.active.type][state.active.rotation];
  shape.forEach(([dx, dy]) => {
    const x = state.active.x + dx;
    const y = state.active.y + dy;
    if (y >= 0) {
      state.grid[y][x] = state.active.type;
    } else {
      state.over = true;
      clearInterval(loopid);
      alert("Game Over");
      return
    }
  });

  clearLines();
  spawnPiece();
}

function clearLines() {
  for (let y = row - 1; y >= 0; y--) {
    if (state.grid[y].every(cell => cell !== 0)) {
      state.grid.splice(y, 1);
      state.grid.unshift(Array(colum).fill(0));
      state.lines += 1;
      state.score += 100;
      y++;
    }
  }
}

function gameLoop() {
  if (state.over || state.paused) return 
  if (isValidMove(0, 1, state.active.rotation)) {
    state.active.y += 1;
  } else {
    lockPiece();
  }

  render();
}

function hardDrop() {
  while (isValidMove(0, 1, state.active.rotation)) {
    state.active.y += 1;
  }
  lockPiece();
  render();
}

document.addEventListener('keydown', (e) => {
  if ([" ", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }

  switch(e.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (isValidMove(-1, 0, state.active.rotation)) state.active.x -= 1;
      break;

    case 'ArrowRight':
    case 'd':
    case 'D':
      if (isValidMove(1, 0, state.active.rotation)) state.active.x += 1;
      break;

    case 'ArrowDown':
    case 's':
    case 'S':
      if (isValidMove(0, 1, state.active.rotation)) {
        state.active.y += 1;
      } else {
        lockPiece();
      }
      break;

    case 'ArrowUp': 
    case 'w':
    case 'W':
      const newRotation = (state.active.rotation + 1) % SHAPES[state.active.type].length;
      if (isValidMove(0, 0, newRotation)) {
        state.active.rotation = newRotation;
      }
      break;

    case ' ':
      hardDrop();
      break;
  }

  render();
});

spawnPiece();
render();
let loopid = setInterval(gameLoop, 500);
