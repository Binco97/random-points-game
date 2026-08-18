const POINT_INTERVAL_SECONDS = 5;
const CONFETTI_COLORS = ['#ff5e62', '#ffd700', '#2575fc', '#6a11cb', '#00e676', '#ff4081', '#00e5ff', '#ff9100'];

const state = {
  players: [],
  running: false,
  countdownId: null,
  countdownRemaining: POINT_INTERVAL_SECONDS,
  soundEnabled: true,
};

const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const addPlayerForm = document.getElementById('add-player-form');
const playerNameInput = document.getElementById('player-name-input');
const playerList = document.getElementById('player-list');
const playBtn = document.getElementById('play-btn');
const setupHint = document.getElementById('setup-hint');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const soundBtn = document.getElementById('sound-btn');
const countdownValue = document.getElementById('countdown-value');
const leaderboard = document.getElementById('leaderboard');
const toast = document.getElementById('toast');
const screenFlash = document.getElementById('screen-flash');
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

addPlayerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = playerNameInput.value.trim();
  if (!name) return;
  state.players.push({ id: crypto.randomUUID(), name, score: 0 });
  playerNameInput.value = '';
  playerNameInput.focus();
  renderPlayerList();
});

function renderPlayerList() {
  playerList.innerHTML = '';
  state.players.forEach((player) => {
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = player.name;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '✕';
    removeBtn.className = 'remove-btn';
    removeBtn.addEventListener('click', () => {
      state.players = state.players.filter((p) => p.id !== player.id);
      renderPlayerList();
    });
    li.append(nameSpan, removeBtn);
    playerList.appendChild(li);
  });
  playBtn.disabled = state.players.length < 2;
  setupHint.classList.toggle('hidden', state.players.length >= 2);
}

playBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
soundBtn.addEventListener('click', () => {
  state.soundEnabled = !state.soundEnabled;
  soundBtn.textContent = state.soundEnabled ? '🔊' : '🔇';
});

function startGame() {
  ensureAudioContext();
  setupScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  state.running = true;
  renderLeaderboard();
  runCountdownCycle();
}

function runCountdownCycle() {
  state.countdownRemaining = POINT_INTERVAL_SECONDS;
  updateCountdownDisplay();
  clearInterval(state.countdownId);
  state.countdownId = setInterval(() => {
    state.countdownRemaining -= 1;
    if (state.countdownRemaining <= 0) {
      assignRandomPoint();
      state.countdownRemaining = POINT_INTERVAL_SECONDS;
    }
    updateCountdownDisplay();
  }, 1000);
}

function updateCountdownDisplay() {
  countdownValue.textContent = state.countdownRemaining;
  countdownValue.classList.toggle('hot', state.countdownRemaining > 0 && state.countdownRemaining <= 2);
}

function assignRandomPoint() {
  const winner = state.players[Math.floor(Math.random() * state.players.length)];
  winner.score += 1;
  renderLeaderboard(winner.id);
  celebrate(winner.name);
}

function celebrate(winnerName) {
  showPointPopup(winnerName);
  playDing();
  flashScreen();
  burstConfetti();
  shakeScreen();
}

function renderLeaderboard(highlightId) {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const medals = ['🥇', '🥈', '🥉'];
  leaderboard.innerHTML = '';
  sorted.forEach((player, index) => {
    const li = document.createElement('li');
    li.className = 'leaderboard-row';
    if (player.id === highlightId) li.classList.add('pulse');

    const rank = document.createElement('span');
    rank.className = 'rank';
    rank.textContent = medals[index] ?? String(index + 1);

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = player.name;

    const score = document.createElement('span');
    score.className = 'score';
    score.textContent = player.score;

    li.append(rank, name, score);

    if (player.id === highlightId) {
      const floatPlus = document.createElement('span');
      floatPlus.className = 'float-plus';
      floatPlus.textContent = '+1';
      li.appendChild(floatPlus);
    }

    leaderboard.appendChild(li);
  });
}

function showPointPopup(name) {
  toast.textContent = `🎉 +1 a ${name}! 🎉`;
  toast.classList.remove('hidden', 'pop');
  void toast.offsetWidth;
  toast.classList.add('pop');
}

function flashScreen() {
  const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  screenFlash.style.background = color;
  screenFlash.classList.remove('flash-active');
  void screenFlash.offsetWidth;
  screenFlash.classList.add('flash-active');
}

function shakeScreen() {
  document.body.classList.remove('shake');
  void document.body.offsetWidth;
  document.body.classList.add('shake');
}

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

let confettiParticles = [];
let confettiAnimId = null;

function burstConfetti() {
  for (let i = 0; i < 80; i++) {
    confettiParticles.push({
      x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 160,
      y: confettiCanvas.height * 0.25,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -13 - 4,
      size: Math.random() * 8 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 24,
      life: 0,
      maxLife: 80 + Math.random() * 30,
    });
  }
  if (!confettiAnimId) confettiAnimId = requestAnimationFrame(updateConfetti);
}

function updateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach((p) => {
    p.vy += 0.35;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    p.life += 1;
    const alpha = Math.max(0, 1 - p.life / p.maxLife);
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.globalAlpha = alpha;
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    confettiCtx.restore();
  });
  confettiParticles = confettiParticles.filter((p) => p.life < p.maxLife);
  confettiAnimId = confettiParticles.length > 0 ? requestAnimationFrame(updateConfetti) : null;
}

let audioCtx = null;

function ensureAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playDing() {
  if (!state.soundEnabled || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
}

function togglePause() {
  if (state.running) {
    clearInterval(state.countdownId);
    state.running = false;
    pauseBtn.textContent = '▶️ Riprendi';
  } else {
    state.running = true;
    pauseBtn.textContent = '⏸ Pausa';
    runCountdownCycle();
  }
}

function resetGame() {
  clearInterval(state.countdownId);
  state.running = false;
  state.players = [];
  pauseBtn.textContent = '⏸ Pausa';
  gameScreen.classList.add('hidden');
  setupScreen.classList.remove('hidden');
  renderPlayerList();
}
