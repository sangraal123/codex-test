export const DIRECTIONS = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 })
});

const DEFAULT_CONFIG = Object.freeze({
  cols: 20,
  rows: 20,
  initialLength: 3
});

function cloneCell(cell) {
  return { x: cell.x, y: cell.y };
}

export function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function isOppositeDirection(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

export function buildInitialSnake(cols, rows, length) {
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);
  return Array.from({ length }, (_, index) => ({
    x: centerX - index,
    y: centerY
  }));
}

export function placeFood(cols, rows, snake, random = Math.random) {
  const occupied = new Set(snake.map((cell) => `${cell.x},${cell.y}`));
  const freeCells = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * freeCells.length);
  return freeCells[index];
}

export function createInitialState(config = {}, random = Math.random) {
  const { cols, rows, initialLength } = { ...DEFAULT_CONFIG, ...config };
  const snake = buildInitialSnake(cols, rows, initialLength);

  return {
    cols,
    rows,
    snake,
    direction: DIRECTIONS.right,
    queuedDirection: DIRECTIONS.right,
    food: placeFood(cols, rows, snake, random),
    score: 0,
    gameOver: false
  };
}

export function queueDirection(state, nextDirection) {
  if (!nextDirection || state.gameOver) {
    return state;
  }

  if (isOppositeDirection(nextDirection, state.direction)) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection
  };
}

function isOutsideBoard(head, cols, rows) {
  return head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
}

function hitsSnake(head, snake) {
  return snake.some((segment) => sameCell(segment, head));
}

export function step(state, random = Math.random) {
  if (state.gameOver) {
    return state;
  }

  const direction = state.queuedDirection;
  const currentHead = state.snake[0];
  const nextHead = {
    x: currentHead.x + direction.x,
    y: currentHead.y + direction.y
  };

  const willEat = state.food && sameCell(nextHead, state.food);
  const tailSafeSnake = willEat ? state.snake : state.snake.slice(0, -1);

  if (isOutsideBoard(nextHead, state.cols, state.rows) || hitsSnake(nextHead, tailSafeSnake)) {
    return {
      ...state,
      gameOver: true
    };
  }

  const nextSnake = [nextHead, ...state.snake.map(cloneCell)];
  if (!willEat) {
    nextSnake.pop();
  }

  const nextFood = willEat ? placeFood(state.cols, state.rows, nextSnake, random) : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    queuedDirection: direction,
    food: nextFood,
    score: state.score + (willEat ? 1 : 0),
    gameOver: nextFood === null ? true : state.gameOver
  };
}
