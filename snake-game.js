import { DIRECTIONS, createInitialState, queueDirection, step } from "./snake-logic.js";

const TICK_MS = 140;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const lengthEl = document.getElementById("length");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const pauseBtn = document.getElementById("pause");

let state = createInitialState();
let paused = false;

function drawGrid() {
  const cellWidth = canvas.width / state.cols;
  const cellHeight = canvas.height / state.rows;

  ctx.fillStyle = "#0e1320";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(130, 154, 194, 0.15)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= state.cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellWidth, 0);
    ctx.lineTo(x * cellWidth, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= state.rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellHeight);
    ctx.lineTo(canvas.width, y * cellHeight);
    ctx.stroke();
  }
}

function drawCell(cell, color) {
  const cellWidth = canvas.width / state.cols;
  const cellHeight = canvas.height / state.rows;
  const padding = 2;

  ctx.fillStyle = color;
  ctx.fillRect(
    cell.x * cellWidth + padding,
    cell.y * cellHeight + padding,
    cellWidth - padding * 2,
    cellHeight - padding * 2
  );
}

function render() {
  drawGrid();

  if (state.food) {
    drawCell(state.food, "#ff6d6d");
  }

  state.snake.forEach((segment, index) => {
    drawCell(segment, index === 0 ? "#3ad6a3" : "#2bb98b");
  });

  scoreEl.textContent = String(state.score);
  lengthEl.textContent = String(state.snake.length);

  if (state.gameOver) {
    statusEl.textContent = "ゲームオーバー: Rキーまたはリスタートで再開";
  } else if (paused) {
    statusEl.textContent = "一時停止中";
  } else {
    statusEl.textContent = "";
  }

  pauseBtn.textContent = paused ? "再開" : "一時停止";
}

function restartGame() {
  state = createInitialState();
  paused = false;
  render();
}

function togglePause() {
  if (state.gameOver) {
    return;
  }
  paused = !paused;
  render();
}

function setDirectionFromLabel(label) {
  const dir = DIRECTIONS[label];
  if (!dir) {
    return;
  }
  state = queueDirection(state, dir);
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  const directionByKey = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right"
  };

  if (key in directionByKey) {
    event.preventDefault();
    setDirectionFromLabel(directionByKey[key]);
    return;
  }

  if (key === "p") {
    togglePause();
    return;
  }

  if (key === "r") {
    restartGame();
  }
}

function gameTick() {
  if (!paused && !state.gameOver) {
    state = step(state);
  }
  render();
}

document.addEventListener("keydown", onKeyDown);
restartBtn.addEventListener("click", restartGame);
pauseBtn.addEventListener("click", togglePause);

document.querySelectorAll("[data-dir]").forEach((button) => {
  const handle = () => setDirectionFromLabel(button.dataset.dir);
  button.addEventListener("click", handle);
  button.addEventListener("touchstart", (event) => {
    event.preventDefault();
    handle();
  }, { passive: false });
});

render();
setInterval(gameTick, TICK_MS);
