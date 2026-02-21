/**
 * Renderer Process - Core Game Logic & UI Orchestration.
 * This script runs in the browser-like environment of the Electron window.
 */

// UI Element Selectors
const boxCountSelect = document.getElementById('box-count');
const themeSelect = document.getElementById('theme-select');
const startBtn = document.getElementById('start-btn');
const timeLimitSelect = document.getElementById('time-limit');
const checkBtn = document.getElementById('check-btn');
const clearBtn = document.getElementById('clear-btn');
const gameContainer = document.getElementById('game-container');
const scoreContainer = document.getElementById('score-container');
const scoreText = document.getElementById('score-text');
const selectionOverlay = document.getElementById('selection-overlay');
const selectionGrid = document.getElementById('selection-grid');
const closeOverlayBtn = document.getElementById('close-overlay-btn');

const timerVal = document.getElementById('timer-val');
const liveTimer = document.getElementById('live-timer');

// Language switcher elements
const langBtns = document.querySelectorAll('.lang-btn');
let currentLang = localStorage.getItem('appLang') || 'es';

// Game State Variables
let shuffledImages = [];        // Shuffled list of all images in child theme
let gameImages = [];            // Specific subset/order used for the current session
let sessionUniqueImages = [];  // Unique images used in current session, sorted
let currentState = 'IDLE';      // State machine tracker: IDLE, MEMORIZING, SELECTING, VALIDATED
let memorizationTimer = null;   // Reference to the active countdown interval
let sessionTimer = null;        // Reference to the live stopwatch interval
let mTime = 0;                  // Elapsed memorization time in seconds
let rTime = 0;                  // Elapsed recall time in seconds
let startTime = 0;              // Reference start timestamp

/**
 * Initializes the application: loads theme folders and restores the user's last selection.
 */
async function init() {
    try {
        const themes = await window.api.getThemes();
        themes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme;
            option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
            themeSelect.appendChild(option);
        });

        // Restore last used theme from localStorage persistence
        const lastTheme = localStorage.getItem('lastTheme');
        if (lastTheme && themes.includes(lastTheme)) {
            themeSelect.value = lastTheme;
        }
    } catch (err) {
        console.error('Failed to initialize themes:', err);
    }

    // Initialize Language
    setLanguage(currentLang);
}

/**
 * Updates the UI based on the selected language.
 */
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    const t = translations[lang];

    // Update labels and buttons
    document.querySelector('label[for="box-count"]').textContent = t.boxes;
    document.querySelector('label[for="time-limit"]').textContent = t.time;
    document.querySelector('label[for="theme-select"]').textContent = t.theme;

    // Update select options (Time Limit)
    const timeOptions = timeLimitSelect.options;
    timeOptions[0].textContent = t.quick;
    timeOptions[6].textContent = t.noLimit;

    // Update buttons
    if (currentState === 'IDLE') {
        startBtn.textContent = t.startGame;
    } else if (currentState === 'MEMORIZING') {
        const timeLimit = timeLimitSelect.value;
        if (timeLimit === 'none') {
            startBtn.textContent = t.memorizar;
        } else {
            // Keep timer text but translated
            const match = startBtn.textContent.match(/\d+/);
            if (match) {
                startBtn.textContent = `${t.memorize} (${match[0]}s)`;
            }
        }
    }

    checkBtn.textContent = t.checkResults;
    clearBtn.textContent = t.reset;
    closeOverlayBtn.textContent = t.cancel;

    // Timer label
    liveTimer.firstChild.textContent = t.timeLabel + ' ';

    // Overlay title
    document.querySelector('.overlay-content h3').textContent = t.selectImage;

    // Highlight active language button
    langBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update score if visible
    if (!scoreContainer.classList.contains('hidden')) {
        updateScoreDisplay();
    }
}

/**
 * Helper to update score display with current language
 */
function updateScoreDisplay() {
    const t = translations[currentLang];
    const correctCount = gameContainer.querySelectorAll('.cell.correct').length;
    scoreText.innerHTML = `
        <div>${t.score.replace('{correct}', correctCount).replace('{total}', gameImages.length)}</div>
        <div style="font-size: 1.2rem; margin-top: 10px; opacity: 0.8">
            ${t.stats.replace('{mTime}', mTime.toFixed(1)).replace('{rTime}', rTime.toFixed(1))}
        </div>
    `;
}

// Language button event listeners
langBtns.forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

// Persist theme selection changes to localStorage
themeSelect.addEventListener('change', () => {
    localStorage.setItem('lastTheme', themeSelect.value);
});

/**
 * Helper: Starts a live stopwatch for the current phase.
 */
function startStopwatch() {
    if (sessionTimer) clearInterval(sessionTimer);
    startTime = Date.now();
    sessionTimer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        timerVal.textContent = elapsed.toFixed(1);
    }, 100);
}

/**
 * Helper: Stops the stopwatch and returns the total elapsed time.
 */
function stopStopwatch() {
    if (sessionTimer) clearInterval(sessionTimer);
    return (Date.now() - startTime) / 1000;
}

/**
 * Starts a new game session. Loads images from the main process and triggers memorization.
 */
async function startGame() {
    const count = parseInt(boxCountSelect.value);
    const theme = themeSelect.value;

    if (!theme) {
        alert(translations[currentLang].selectThemeAlert);
        return;
    }

    try {
        // Fetch and shuffle images from main process via IPC
        const allImages = await window.api.getImages(theme);

        if (allImages.length === 0) {
            alert(translations[currentLang].emptyThemeAlert);
            return;
        }

        // Deduplicate images based on Base64 content to ensure unique game elements
        // This fixes the issue where duplicates in the folder caused smaller selection grids
        shuffledImages = [...new Set(allImages)];

        // Build the current session image array
        gameImages = [];
        for (let i = 0; i < count; i++) {
            gameImages.push(shuffledImages[i % shuffledImages.length]);
        }

        // Create a sorted list of unique images used in this specific session
        sessionUniqueImages = [...new Set(gameImages)].sort();

        liveTimer.classList.remove('hidden');
        showPhaseMemorize();
    } catch (err) {
        console.error('Game start failed:', err);
    }
}

/**
 * Adjusts the CSS grid template-columns based on the total number of cells for optimal UI fit.
 */
function updateGridStyles(count) {
    let cols;
    if (count <= 10) cols = 10;
    else if (count <= 20) cols = 5;
    else if (count <= 40) cols = 8;
    else cols = 10;

    gameContainer.style.gridTemplateColumns = `repeat(${cols}, 100px)`;
}

/**
 * PHASE: Memorization. Displays images and starts the memorization stopwatch.
 */
function showPhaseMemorize() {
    currentState = 'MEMORIZING';
    gameContainer.innerHTML = '';
    const count = gameImages.length;
    updateGridStyles(count);

    // Render the images to be memorized
    gameImages.forEach(src => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.innerHTML = `<img src="${src}">`;
        gameContainer.appendChild(cell);
    });

    const timeLimit = timeLimitSelect.value;
    timeLimitSelect.classList.add('hidden');

    // Start session stopwatch for memorization
    startStopwatch();

    if (timeLimit === 'none') {
        // "No limit" mode: Button changes to click-to-proceed
        startBtn.disabled = false;
        startBtn.textContent = translations[currentLang].memorizar;
    } else {
        // Countdown mode: Automatically transitions to selection after timer expires
        const seconds = parseInt(timeLimit);
        let remaining = seconds;
        const t = translations[currentLang];
        startBtn.disabled = true;
        startBtn.textContent = `${t.memorize} (${remaining}s)`;

        memorizationTimer = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                clearInterval(memorizationTimer);
                showPhaseSelecting();
            } else {
                startBtn.textContent = `${t.memorize} (${remaining}s)`;
            }
        }, 1000);
    }
}

/**
 * PHASE: Selection. Stops memorization stopwatch and starts recall stopwatch.
 */
function showPhaseSelecting() {
    if (memorizationTimer) clearInterval(memorizationTimer);

    // Record memorization time and pivot stopwatch
    mTime = stopStopwatch();

    currentState = 'SELECTING';
    gameContainer.innerHTML = '';
    startBtn.classList.add('hidden'); // Hide the start button during selection
    checkBtn.classList.remove('hidden');
    clearBtn.classList.remove('hidden');

    // Create empty clickable cells
    for (let i = 0; i < gameImages.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell empty';
        cell.dataset.index = i;

        cell.addEventListener('click', () => {
            if (currentState === 'SELECTING') openSelection(cell);
        });

        gameContainer.appendChild(cell);
    }

    // Start recall phase stopwatch
    startStopwatch();
}

/**
 * Opens the selection overlay showing only the images used in the current session.
 */
function openSelection(cell) {
    selectionOverlay.classList.remove('hidden');
    selectionGrid.innerHTML = '';

    // Dynamically calculate grid columns for a balanced layout (NxN feel)
    const total = sessionUniqueImages.length;
    let cols = Math.ceil(Math.sqrt(total));
    // Limit to reasonable width
    if (cols > 10) cols = 10;
    selectionGrid.style.gridTemplateColumns = `repeat(${cols}, 70px)`;

    // Populates the overlay with thumbnails of only the images used in this game
    sessionUniqueImages.forEach((src) => {
        const thumb = document.createElement('div');
        thumb.className = 'thumb-cell';
        thumb.style.width = '70px';
        thumb.style.height = '70px';
        thumb.innerHTML = `<img src="${src}">`;

        thumb.addEventListener('click', () => {
            cell.innerHTML = `<img src="${src}">`;
            cell.dataset.selected = src;
            cell.classList.remove('empty');
            selectionOverlay.classList.add('hidden');
        });

        selectionGrid.appendChild(thumb);
    });
}

// Close selection overlay without choosing an image
closeOverlayBtn.addEventListener('click', () => {
    selectionOverlay.classList.add('hidden');
});

/**
 * PHASE: Validation. Stops recall stopwatch and shows total stats.
 */
function checkResults() {
    // Record recall time
    rTime = stopStopwatch();
    currentState = 'VALIDATED';
    const cells = gameContainer.querySelectorAll('.cell');
    let correctCount = 0;

    cells.forEach((cell, i) => {
        const selected = cell.dataset.selected;
        const original = gameImages[i];

        if (selected === original) {
            cell.classList.add('correct');
            correctCount++;
        } else {
            cell.classList.add('wrong');
        }
    });

    // Display final score
    scoreContainer.classList.remove('hidden');
    updateScoreDisplay();

    checkBtn.classList.add('hidden');
    startBtn.classList.add('hidden');
    liveTimer.classList.add('hidden');
}

/**
 * Returns the game to the initial idle state, cleaning up UI and timers.
 */
function clearGame() {
    if (memorizationTimer) clearInterval(memorizationTimer);
    if (sessionTimer) clearInterval(sessionTimer);

    currentState = 'IDLE';
    gameContainer.innerHTML = '';
    scoreContainer.classList.add('hidden');
    checkBtn.classList.add('hidden');
    clearBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
    timeLimitSelect.classList.remove('hidden');
    liveTimer.classList.add('hidden');
    startBtn.textContent = translations[currentLang].startGame;
    startBtn.disabled = false;
}

// High-level event wiring
startBtn.addEventListener('click', () => {
    if (currentState === 'IDLE') {
        startGame();
    } else if (currentState === 'MEMORIZING') {
        // Transitions to selection if user clicks 'Memorizar' early or in "no limit" mode
        showPhaseSelecting();
    }
});

checkBtn.addEventListener('click', checkResults);
clearBtn.addEventListener('click', clearGame);

// Bootstrap the app
init();
