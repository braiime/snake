// ==== CONFIG ====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
let cellSize = canvas.width / gridSize;
const snakeColor = '#2dff7c';
const foodColor = '#ff3c6f';
const bgColor = '#23272f';
const maxSpeed = 20;

// ==== DIFFICULTY ====
const difficultySpeeds = {
  easy: 7,
  medium: 11,
  hard: 16
};
let baseSpeed = difficultySpeeds.easy;

// ==== STATE ====
let snake, direction, nextDirection, food, score, highScore, speed, running, gameOver, lastFrame, frameInterval;

// ==== INIT ====
function initGame() {
  resizeCanvas();
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  food = randomFood();
  score = 0;
  speed = baseSpeed;
  frameInterval = 1000 / speed;
  running = true;
  gameOver = false;
  lastFrame = performance.now();
  updateScore();
  hideGameOver();
  document.getElementById('startBtn').style.display = 'none';
  requestAnimationFrame(gameLoop);
  canvas.focus();
}

// ==== GAME LOOP ====
function gameLoop(now) {
  if (!running) return;
  if (now - lastFrame > frameInterval) {
    update();
    draw();
    lastFrame = now;
  }
  requestAnimationFrame(gameLoop);
}

// ==== UPDATE ====
function update() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Wall collision
  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    return endGame();
  }
  // Self collision
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    return endGame();
  }

  snake.unshift(head);

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    speed = Math.min(speed + 0.5, maxSpeed);
    frameInterval = 1000 / speed;
    food = randomFood();
    updateScore();
  } else {
    snake.pop();
  }
}

// ==== DRAW ====
function draw() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw food
  drawCell(food.x, food.y, foodColor);

  // Draw snake
  snake.forEach((seg, i) => {
    drawCell(seg.x, seg.y, snakeColor, i === 0 ? 1 : 0.85);
  });
}

// ==== HELPERS ====
function drawCell(x, y, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(
    x * cellSize + 2,
    y * cellSize + 2,
    cellSize - 4,
    cellSize - 4
  );
  ctx.restore();
}

function randomFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

function updateScore() {
  document.getElementById('score').textContent = score;
  highScore = Math.max(score, getHighScore());
  document.getElementById('highScore').textContent = highScore;
  setHighScore(highScore);
}

function getHighScore() {
  return Number(localStorage.getItem('snakeHighScore') || 0);
}

function setHighScore(val) {
  localStorage.setItem('snakeHighScore', val);
}

function endGame() {
  running = false;
  gameOver = true;
  showGameOver();
  document.getElementById('finalScore').textContent = score;
  document.getElementById('startBtn').style.display = 'block';
}

function showGameOver() {
  document.getElementById('gameOver').style.display = 'block';
}

function hideGameOver() {
  document.getElementById('gameOver').style.display = 'none';
}

// ==== INPUT ====
// Keyboard controls
window.addEventListener('keydown', e => {
  if (!running) return;
  switch (e.key) {
    case 'ArrowUp':
      if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
      break;
  }
});

// Touch controls for mobile
function handleTouchDirection(dir) {
  if (!running) return;
  switch (dir) {
    case 'up':
      if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
      break;
    case 'down':
      if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
      break;
    case 'left':
      if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
      break;
    case 'right':
      if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
      break;
  }
}

// Attach touch/mouse events to arrow buttons
['up', 'down', 'left', 'right'].forEach(dir => {
  const btn = document.getElementById(`btn-${dir}`);
  if (btn) {
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      handleTouchDirection(dir);
    }, {passive: false});
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      handleTouchDirection(dir);
    });
  }
});

// ==== BUTTONS ====
document.getElementById('startBtn').onclick = () => {
  if (!running) initGame();
};

document.getElementById('restartBtn').onclick = () => {
  if (!running) initGame();
};

// ==== DIFFICULTY SELECTOR ====
document.getElementById('difficultyForm').addEventListener('change', e => {
  if (e.target.name === 'difficulty') {
    baseSpeed = difficultySpeeds[e.target.value];
    if (!running) {
      speed = baseSpeed;
      frameInterval = 1000 / speed;
    }
  }
});

// ==== RESPONSIVE CANVAS ====
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
  // Maintain square aspect ratio and fit parent
  const size = Math.min(
    document.body.clientWidth * 0.9,
    400,
    window.innerHeight * 0.7
  );
  canvas.width = size;
  canvas.height = size;
  cellSize = canvas.width / gridSize;
  if (snake && food) draw();
}

// ==== INITIAL STATE ====
function showStartButton() {
  document.getElementById('startBtn').style.display = 'block';
  hideGameOver();
}
showStartButton();
resizeCanvas();