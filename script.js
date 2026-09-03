const memories = [
  { image: 'assets/images/photo1.jpg', caption: 'A beautiful memory, waiting to be added' },
  { image: 'assets/images/photo2.jpg', caption: 'One of the moments I will always keep' },
  { image: 'assets/images/photo3.jpg', caption: 'More laughter, more memories, more you' }
];
const birthdayLetter = `SOWBHAGYALAKSHMI,\n\nI hope this birthday brings you the same warmth and happiness that you bring to the people around you. Your kindness, your creativity, and the way you make every moment brighter are gifts in themselves.\n\nThank you for being wonderfully, unmistakably you. Here is to another year of beautiful beginnings, brave dreams, and memories we have not made yet.`;
const password = 'sowbhagyalakshmi';
const gate = document.querySelector('#passwordGate');
const site = document.querySelector('#site');
const passwordForm = document.querySelector('#passwordForm');
const passwordInput = document.querySelector('#passwordInput');
const passwordError = document.querySelector('#passwordError');
const wrongPasswordPopup = document.querySelector('#wrongPasswordPopup');
const closeWrongPassword = document.querySelector('#closeWrongPassword');
const screens = [...document.querySelectorAll('.screen')];
const music = document.querySelector('#birthdayMusic');
const wrongPasswordSound = document.querySelector('#wrongPasswordSound');
const crackersSound = document.querySelector('#crackersSound');
const rainSound = document.querySelector('#rainSound');
const countdownSound = document.querySelector('#countdownSound');
const typewriterSound = document.querySelector('#typewriterSound');
const musicToggle = document.querySelector('#musicToggle');
const memoryImage = document.querySelector('#memoryImage');
const memoryFallback = document.querySelector('#memoryFallback');
const memoryCaption = document.querySelector('#memoryCaption');
const memoryCount = document.querySelector('#memoryCount');
const progressButtons = [...document.querySelectorAll('#memoryProgress button')];
const finalMessage = document.querySelector('#finalMessage');
const finalImage = document.querySelector('#finalImage');
const scratchCard = document.querySelector('#scratchCard');
const scratchCanvas = document.querySelector('#scratchCanvas');
const scratchPercent = document.querySelector('#scratchPercent');
const scratchDialogues = document.querySelector('#scratchDialogues');
const showExactAge = document.querySelector('#showExactAge');
const scratchNext = document.querySelector('#scratchNext');
const brushChoices = [...document.querySelectorAll('.brush-choice')];
const brushMessage = document.querySelector('#brushMessage');
const brushCursor = document.querySelector('#brushCursor');
const ageValues = {
  years: document.querySelector('#ageYears'),
  days: document.querySelector('#ageDays'),
  hours: document.querySelector('#ageHours'),
  minutes: document.querySelector('#ageMinutes'),
  seconds: document.querySelector('#ageSeconds')
};
const currentDate = document.querySelector('#currentDate');
const birthDate = new Date(2004, 9, 1, 8, 25, 0);
let screenIndex = 0;
let memoryIndex = 0;
let popupTimer;
let audioContext;
let musicGain;
let generatedMusicTimer;
let scratchContext;
let isScratching = false;
let scratchRevealed = false;
let lastScratchPoint;
let selectedBrush = null;

function updateAge() {
  const now = new Date();
  currentDate.textContent = `Today is ${now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  let years = now.getFullYear() - birthDate.getFullYear();
  const anniversary = new Date(birthDate);
  anniversary.setFullYear(birthDate.getFullYear() + years);
  if (now < anniversary) years -= 1;
  anniversary.setFullYear(birthDate.getFullYear() + years);
  const remaining = Math.max(0, now - anniversary);
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  ageValues.years.textContent = String(years).padStart(2, '0');
  ageValues.days.textContent = String(days).padStart(3, '0');
  ageValues.hours.textContent = String(hours).padStart(2, '0');
  ageValues.minutes.textContent = String(minutes).padStart(2, '0');
  ageValues.seconds.textContent = String(seconds).padStart(2, '0');
}

function playGeneratedTone(frequency, startTime, duration) {
  if (!audioContext) audioContext = new AudioContext();
  if (!musicGain) {
    musicGain = audioContext.createGain();
    musicGain.gain.value = 0.04;
    musicGain.connect(audioContext.destination);
  }
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain).connect(musicGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.04);
}

function startGeneratedMusic() {
  if (!audioContext) audioContext = new AudioContext();
  audioContext.resume();
  const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
  const playPhrase = () => {
    const startTime = audioContext.currentTime + 0.05;
    notes.forEach((note, index) => playGeneratedTone(note, startTime + index * 0.55, 0.5));
  };
  playPhrase();
  generatedMusicTimer = window.setInterval(playPhrase, 4400);
  musicToggle.classList.add('is-playing');
  musicToggle.setAttribute('aria-label', 'Pause birthday music');
}

function startMusic() {
  music.play().then(() => {
    musicToggle.classList.add('is-playing');
    musicToggle.setAttribute('aria-label', 'Pause birthday music');
  }).catch(() => startGeneratedMusic());
}

function stopMusic() {
  music.pause();
  window.clearInterval(generatedMusicTimer);
  generatedMusicTimer = null;
  if (audioContext) audioContext.suspend();
  musicToggle.classList.remove('is-playing');
  musicToggle.setAttribute('aria-label', 'Play birthday music');
}

// Add event listeners to resume music when sound effects end
rainSound.addEventListener('ended', () => {
  if (!countdownSound.paused || !typewriterSound.paused) return;
  if (music.paused && gate.classList.contains('is-unlocked')) music.play().catch(() => {});
});

countdownSound.addEventListener('ended', () => {
  if (!rainSound.paused || !typewriterSound.paused) return;
  if (music.paused && gate.classList.contains('is-unlocked')) music.play().catch(() => {});
});

typewriterSound.addEventListener('ended', () => {
  if (!rainSound.paused || !countdownSound.paused) return;
  if (music.paused && gate.classList.contains('is-unlocked')) music.play().catch(() => {});
});

function playWrongPasswordSound() {
  wrongPasswordSound.currentTime = 0;
  wrongPasswordSound.play().catch(() => {});
}

function showScreen(index) {
  const previousScreen = screenIndex;
  screenIndex = (index + screens.length) % screens.length;
  screens.forEach((screen, screenNumber) => {
    const active = screenNumber === screenIndex;
    screen.classList.toggle('is-active', active);
    screen.setAttribute('aria-hidden', String(!active));
  });
  // Stop rain sound when leaving page 0
  if (previousScreen === 0 && screenIndex !== 0) {
    rainSound.pause();
    rainSound.currentTime = 0;
    if (!countdownSound.paused || !typewriterSound.paused) return;
    if (!music.paused) music.play().catch(() => {});
  }
  // Play rain sound only on page 0 when gate is unlocked
  if (screenIndex === 0 && !gate.classList.contains('is-unlocked')) {
    rainSound.pause();
    rainSound.currentTime = 0;
  } else if (screenIndex === 0 && gate.classList.contains('is-unlocked')) {
    music.pause();
    rainSound.currentTime = 0;
    rainSound.play().catch(() => {});
  }
  if (screenIndex === 1) window.requestAnimationFrame(resizeScratchCard);
  // Stop countdown sound when leaving page 2 (age page)
  if (previousScreen === 2 && screenIndex !== 2) {
    countdownSound.pause();
    countdownSound.currentTime = 0;
    if (!rainSound.paused || !typewriterSound.paused) return;
    if (!music.paused) music.play().catch(() => {});
  }
  // Play countdown sound only on page 2 (age page) when gate is unlocked
  if (screenIndex === 2 && gate.classList.contains('is-unlocked')) {
    music.pause();
    countdownSound.currentTime = 0;
    countdownSound.play().catch(() => {});
  } else if (screenIndex === 2 && !gate.classList.contains('is-unlocked')) {
    countdownSound.pause();
    countdownSound.currentTime = 0;
  }
  if (screenIndex === 5) typeLetter();
}

function celebrateScratch() {
  if (scratchRevealed) return;
  scratchRevealed = true;
  scratchContext.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
  scratchPercent.textContent = '100%';
  scratchCard.classList.add('is-revealed');
  scratchDialogues.hidden = false;
  scratchNext.disabled = false;
  crackersSound.currentTime = 0;
  crackersSound.play().catch(() => {});
  launchSparkles();
  launchConfetti();

  function launchSparkles() {
    for (let index = 0; index < 18; index += 1) {
      const sparkle = document.createElement('span');
      sparkle.className = 'scratch-sparkle';
      sparkle.textContent = index % 2 ? '✦' : '✧';
      sparkle.style.left = `${15 + Math.random() * 70}%`;
      sparkle.style.top = `${22 + Math.random() * 52}%`;
      sparkle.style.setProperty('--sparkle-delay', `${Math.random() * 350}ms`);
      scratchCard.append(sparkle);
      window.setTimeout(() => sparkle.remove(), 1500);
    }
  }
  window.setTimeout(() => scratchDialogues.classList.add('is-ready'), 900);
}

function updateScratchProgress() {
  const pixels = scratchContext.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
  let transparent = 0;
  for (let index = 3; index < pixels.length; index += 4) {
    if (pixels[index] < 40) transparent += 1;
  }
  const percentage = Math.round((transparent / (pixels.length / 4)) * 100);
  scratchPercent.textContent = `${percentage}%`;
  if (percentage >= 87) celebrateScratch();
}

function resizeScratchCard() {
  const bounds = scratchCard.getBoundingClientRect();
  const previous = scratchCanvas.width ? scratchCanvas.toDataURL() : null;
  scratchCanvas.width = Math.max(1, Math.floor(bounds.width * window.devicePixelRatio));
  scratchCanvas.height = Math.max(1, Math.floor(bounds.height * window.devicePixelRatio));
  scratchCanvas.style.width = `${bounds.width}px`;
  scratchCanvas.style.height = `${bounds.height}px`;
  scratchContext = scratchCanvas.getContext('2d');
  scratchContext.scale(window.devicePixelRatio, window.devicePixelRatio);
  scratchContext.fillStyle = '#c99c64';
  scratchContext.fillRect(0, 0, bounds.width, bounds.height);
  scratchContext.globalCompositeOperation = 'destination-out';
  if (previous) {
    const image = new Image();
    image.onload = () => scratchContext.drawImage(image, 0, 0, bounds.width, bounds.height);
    image.src = previous;
  }
}

function scratchAt(event) {
  if (!selectedBrush || !isScratching || scratchRevealed) return;
  const bounds = scratchCanvas.getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  brushCursor.style.left = `${x}px`;
  brushCursor.style.top = `${y}px`;
  scratchContext.lineWidth = 48;
  scratchContext.lineCap = 'round';
  scratchContext.lineJoin = 'round';
  scratchContext.beginPath();
  if (lastScratchPoint) {
    scratchContext.moveTo(lastScratchPoint.x, lastScratchPoint.y);
    scratchContext.lineTo(x, y);
  } else {
    scratchContext.moveTo(x, y);
    scratchContext.lineTo(x, y);
  }
  scratchContext.stroke();
  scratchContext.beginPath();
  scratchContext.arc(x, y, 24, 0, Math.PI * 2);
  scratchContext.fill();
  lastScratchPoint = { x, y };
  updateScratchProgress();
}

function setupScratchCard() {
  brushChoices.forEach((choice) => choice.addEventListener('click', () => {
    selectedBrush = choice.dataset.brush;
    brushChoices.forEach((item) => item.classList.toggle('is-selected', item === choice));
    scratchCard.dataset.brush = selectedBrush;
    brushCursor.className = `brush-cursor brush-cursor--${selectedBrush}`;
    brushCursor.hidden = false;
    brushMessage.hidden = false;
    scratchCanvas.setAttribute('aria-label', `${choice.textContent.trim()} selected. Scratch to reveal the hidden age`);
  }));
  scratchCanvas.addEventListener('pointerdown', (event) => {
    if (!selectedBrush || scratchRevealed) return;
    isScratching = true;
    lastScratchPoint = null;
    scratchCanvas.setPointerCapture(event.pointerId);
    scratchAt(event);
  });
  scratchCanvas.addEventListener('pointermove', scratchAt);
  scratchCanvas.addEventListener('pointerleave', () => { if (!isScratching) brushCursor.hidden = true; });
  scratchCanvas.addEventListener('pointerenter', () => { if (selectedBrush && !scratchRevealed) brushCursor.hidden = false; });
  scratchCanvas.addEventListener('pointerup', () => { isScratching = false; lastScratchPoint = null; });
  scratchCanvas.addEventListener('pointercancel', () => { isScratching = false; lastScratchPoint = null; });
  window.addEventListener('resize', resizeScratchCard);
}

function showMemory(index) {
  memoryIndex = (index + memories.length) % memories.length;
  const memory = memories[memoryIndex];
  memoryCaption.textContent = memory.caption;
  memoryCount.textContent = `0${memoryIndex + 1} / 0${memories.length}`;
  progressButtons.forEach((button, buttonIndex) => button.classList.toggle('is-active', buttonIndex === memoryIndex));
  memoryImage.hidden = true;
  memoryFallback.hidden = false;
  memoryImage.onload = () => { memoryFallback.hidden = true; memoryImage.hidden = false; };
  memoryImage.onerror = () => { memoryFallback.hidden = false; memoryImage.hidden = true; };
  memoryImage.src = memory.image;
  memoryImage.alt = memory.caption;
}

function typeLetter() {
  const target = document.querySelector('#letterText');
  if (target.dataset.typed) return;
  target.dataset.typed = 'true';
  let position = 0;
  music.pause();
  typewriterSound.currentTime = 0;
  typewriterSound.play().catch(() => {});
  const write = () => {
    target.textContent = birthdayLetter.slice(0, position);
    position += 1;
    if (position <= birthdayLetter.length) {
      window.setTimeout(write, 40);
    } else {
      // Stop typewriter sound when typing completes and resume music
      typewriterSound.pause();
      typewriterSound.currentTime = 0;
      if (!rainSound.paused || !countdownSound.paused) return;
      if (!music.paused) music.play().catch(() => {});
    }
  };
  write();
}

function launchConfetti() {
  const colors = ['#d98f91', '#e8c997', '#f6e9df', '#8d3d4e'];
  for (let index = 0; index < 60; index += 1) {
    const piece = document.createElement('i');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * .5}s`;
    document.body.append(piece);
    window.setTimeout(() => piece.remove(), 2600);
  }
}

function launchBrokenHearts() {
  const hearts = ['&#128148;', '&#128148;', '&#128148;', '&#128148;', '&#128148;', '&#128148;'];
  hearts.forEach((heart, index) => {
    const piece = document.createElement('span');
    piece.className = 'broken-heart';
    piece.innerHTML = heart;
    piece.style.setProperty('--heart-x', `${(Math.random() * 180) - 90}px`);
    piece.style.setProperty('--heart-delay', `${index * 45}ms`);
    piece.style.left = `${50 + (Math.random() * 20 - 10)}%`;
    piece.style.top = `${48 + (Math.random() * 12 - 6)}%`;
    document.body.append(piece);
    window.setTimeout(() => piece.remove(), 1500);
  });
}

passwordForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (passwordInput.value.trim().toLowerCase() !== password) {
    passwordError.hidden = false;
    playWrongPasswordSound();
    launchBrokenHearts();
    if ('vibrate' in navigator) navigator.vibrate([35, 25, 35]);
    wrongPasswordPopup.hidden = false;
    wrongPasswordPopup.classList.remove('is-visible');
    window.clearTimeout(popupTimer);
    window.requestAnimationFrame(() => wrongPasswordPopup.classList.add('is-visible'));
    popupTimer = window.setTimeout(() => {
      wrongPasswordPopup.classList.remove('is-visible');
      wrongPasswordPopup.hidden = true;
    }, 3600);
    passwordInput.focus();
    return;
  }
  gate.classList.add('is-unlocked');
  site.setAttribute('aria-hidden', 'false');
  site.classList.add('is-visible');
  showScreen(0);
  startMusic();
});
document.querySelector('#togglePassword').addEventListener('click', (event) => {
  const visible = passwordInput.type === 'text';
  passwordInput.type = visible ? 'password' : 'text';
  event.currentTarget.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
});
passwordInput.addEventListener('input', () => { passwordError.hidden = true; });
closeWrongPassword.addEventListener('click', () => {
  wrongPasswordPopup.classList.remove('is-visible');
  wrongPasswordPopup.hidden = true;
  window.clearTimeout(popupTimer);
  passwordInput.focus();
});
document.querySelectorAll('[data-next]').forEach((button) => button.addEventListener('click', () => showScreen(screenIndex + 1)));
document.querySelectorAll('[data-prev]').forEach((button) => button.addEventListener('click', () => showScreen(screenIndex - 1)));
musicToggle.addEventListener('click', () => {
  if (!music.paused || generatedMusicTimer) stopMusic();
  else startMusic();
});
document.querySelector('#previousMemory').addEventListener('click', () => showMemory(memoryIndex - 1));
document.querySelector('#nextMemory').addEventListener('click', () => showMemory(memoryIndex + 1));
progressButtons.forEach((button, index) => button.addEventListener('click', () => showMemory(index)));
const puzzleCanvas = document.querySelector('#puzzleCanvas');

function createPuzzleAnimation(imageElement) {
  const canvas = puzzleCanvas;
  const ctx = canvas.getContext('2d');
  const photo = document.querySelector('.final-photo');
  
  canvas.width = photo.offsetWidth;
  canvas.height = photo.offsetHeight;
  canvas.style.display = 'block';
  
  const gridCols = 4;
  const gridRows = 5;
  const pieceWidth = canvas.width / gridCols;
  const pieceHeight = canvas.height / gridRows;
  
  // Create piece positions array
  const pieces = [];
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      pieces.push({ col, row, currentCol: col, currentRow: row });
    }
  }
  
  // Shuffle pieces
  const shuffled = [...pieces].sort(() => Math.random() - 0.5);
  shuffled.forEach((piece, i) => {
    piece.currentCol = pieces[i].col;
    piece.currentRow = pieces[i].row;
  });
  
  let animationStartTime = null;
  const animationDuration = 3000; // 3 seconds
  
  function drawPuzzle(progress) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    shuffled.forEach(piece => {
      // Interpolate between current and target position
      const targetCol = piece.col;
      const targetRow = piece.row;
      const col = piece.currentCol + (targetCol - piece.currentCol) * progress;
      const row = piece.currentRow + (targetRow - piece.currentRow) * progress;
      
      const sx = piece.col * pieceWidth;
      const sy = piece.row * pieceHeight;
      const dx = col * pieceWidth;
      const dy = row * pieceHeight;
      
      ctx.drawImage(
        imageElement,
        sx, sy, pieceWidth, pieceHeight,
        dx, dy, pieceWidth, pieceHeight
      );
    });
  }
  
  function animate(timestamp) {
    if (!animationStartTime) animationStartTime = timestamp;
    const elapsed = timestamp - animationStartTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    
    drawPuzzle(progress);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Animation complete, hide canvas and show image
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
        canvas.style.display = 'none';
        imageElement.hidden = false;
      }, 500);
    }
  }
  
  requestAnimationFrame(animate);
}

finalImage.onerror = () => { finalImage.hidden = true; document.querySelector('.memory-fallback').hidden = false; };

// Reveal button - floating effect + puzzle animation
document.querySelector('#revealButton').addEventListener('click', function handleRevealClick(event) {
  if (!event.currentTarget.dataset.attempts) event.currentTarget.dataset.attempts = '0';
  const attempts = parseInt(event.currentTarget.dataset.attempts);
  if (attempts < 3) {
    event.currentTarget.dataset.attempts = String(attempts + 1);
    const randomX = Math.random() * (window.innerWidth - 150);
    const randomY = Math.random() * (window.innerHeight - 60) + 60;
    event.currentTarget.style.position = 'fixed';
    event.currentTarget.style.left = randomX + 'px';
    event.currentTarget.style.top = randomY + 'px';
    event.currentTarget.style.zIndex = '100';
    event.currentTarget.style.transition = 'all 0.3s ease-out';
  } else {
    event.currentTarget.hidden = true;
    finalMessage.hidden = false;
    launchConfetti();
    // Start puzzle if image is already loaded
    if (finalImage.complete && finalImage.naturalWidth > 0) {
      createPuzzleAnimation(finalImage);
    }
  }
});

showExactAge.addEventListener('click', () => showScreen(2));
setupScratchCard();

showScreen(0);
showMemory(0);
updateAge();
window.setInterval(updateAge, 1000);
