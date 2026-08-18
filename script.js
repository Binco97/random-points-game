const POINT_INTERVAL_SECONDS = 5;

const state = {
  players: [],
  running: false,
  countdownId: null,
  countdownRemaining: POINT_INTERVAL_SECONDS,
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
const countdownValue = document.getElementById('countdown-value');
const leaderboard = document.getElementById('leaderboard');
const toast = document.getElementById('toast');

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

function startGame() {
  setupScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  state.running = true;
  renderLeaderboard();
  runCountdownCycle();
}

function runCountdownCycle() {
  state.countdownRemaining = POINT_INTERVAL_SECONDS;
  countdownValue.textContent = state.countdownRemaining;
  clearInterval(state.countdownId);
  state.countdownId = setInterval(() => {
    state.countdownRemaining -= 1;
    if (state.countdownRemaining <= 0) {
      assignRandomPoint();
      state.countdownRemaining = POINT_INTERVAL_SECONDS;
    }
    countdownValue.textContent = state.countdownRemaining;
  }, 1000);
}

function assignRandomPoint() {
  const winner = state.players[Math.floor(Math.random() * state.players.length)];
  winner.score += 1;
  renderLeaderboard(winner.id);
  showToast(`🎯 +1 punto a ${winner.name}!`);
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
    leaderboard.appendChild(li);
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 1800);
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
