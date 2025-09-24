import { ROWS, COLUMNS } from './constants.js';

export function bag() {
  const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const shuffled = [];

  while (pieces.length) {
    const idx = Math.floor(Math.random() * pieces.length);
    shuffled.push(pieces[idx]);
    pieces.splice(idx, 1);
  }

  return shuffled;
}

export let state = {};

export function resetState() {
    state.grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
    state.active = null;
    state.nextQ = bag().concat(bag()); 
    state.hold = null;
    state.canHold = true;
    state.score = 0;
    state.lines = 0;
    state.level = 1;
    state.dropInterval = 700;
    state.over = false;
    state.paused = false;
    state.startTime = Date.now();
    state.gameTime = 0;
    state.lives = 3;
   
    state.linesForLevelUp = 0;
}


resetState();
