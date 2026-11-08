// ============================================================================
// Sudoku.com Authentic Clone - Forgiving & Dementia-Friendly Edition
// ============================================================================

// --- Core Sudoku Logic (MRV Backtracker & Step-by-Step Human Technique Solver) ---

function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (i !== col && board[row][i] === num) return false;
        if (i !== row && board[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const nr = startRow + r;
            const nc = startCol + c;
            if ((nr !== row || nc !== col) && board[nr][nc] === num) {
                return false;
            }
        }
    }
    return true;
}

function findCandidates(board, row, col) {
    if (board[row][col] !== 0) return [];
    const used = new Array(10).fill(false);

    for (let i = 0; i < 9; i++) {
        if (board[row][i] !== 0) used[board[row][i]] = true;
        if (board[i][col] !== 0) used[board[i][col]] = true;
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const val = board[startRow + r][startCol + c];
            if (val !== 0) used[val] = true;
        }
    }

    const candidates = [];
    for (let num = 1; num <= 9; num++) {
        if (!used[num]) candidates.push(num);
    }
    return candidates;
}

/**
 * Fast Sudoku solver using Minimum Remaining Values (MRV) heuristic.
 */
function solve(board, maxSolutions = 1) {
    let solutionCount = 0;

    function search() {
        let bestRow = -1;
        let bestCol = -1;
        let bestCandidates = null;

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) {
                    const cands = findCandidates(board, r, c);
                    if (cands.length === 0) {
                        return false;
                    }
                    if (bestCandidates === null || cands.length < bestCandidates.length) {
                        bestRow = r;
                        bestCol = c;
                        bestCandidates = cands;
                        if (cands.length === 1) break;
                    }
                }
            }
            if (bestCandidates !== null && bestCandidates.length === 1) break;
        }

        if (bestRow === -1) {
            solutionCount++;
            return solutionCount >= maxSolutions;
        }

        if (maxSolutions === 1 && bestCandidates.length > 1) {
            for (let i = bestCandidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [bestCandidates[i], bestCandidates[j]] = [bestCandidates[j], bestCandidates[i]];
            }
        }

        for (const num of bestCandidates) {
            board[bestRow][bestCol] = num;
            if (search()) {
                if (maxSolutions === 1) return true;
                board[bestRow][bestCol] = 0;
                return true;
            }
            board[bestRow][bestCol] = 0;
        }

        return false;
    }

    search();
    return maxSolutions === 1 ? solutionCount > 0 : solutionCount;
}

function generateFullGrid() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    solve(board, 1);
    return board;
}

/**
 * Simulates solving the ENTIRE puzzle step-by-step using only human Singles techniques:
 * - 'NAKED_ONLY': Only Naked Singles (cells where only 1 digit is possible in its row/col/box).
 * - 'SINGLES': Naked Singles + Hidden Singles (a digit has only 1 possible position in a row/col/box).
 */
function canSolveWithHumanSingles(puzzle, mode = 'SINGLES') {
    const work = puzzle.map(row => [...row]);

    while (true) {
        let emptyCells = 0;
        let progress = false;
        const candsGrid = Array.from({ length: 9 }, () => Array(9).fill(null));

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (work[r][c] === 0) {
                    emptyCells++;
                    const cands = findCandidates(work, r, c);
                    if (cands.length === 0) return false;
                    if (cands.length === 1) {
                        work[r][c] = cands[0];
                        progress = true;
                    } else {
                        candsGrid[r][c] = cands;
                    }
                }
            }
        }

        if (emptyCells === 0) return true;
        if (progress) continue;
        if (mode === 'NAKED_ONLY') return false;

        for (let unit = 0; unit < 9; unit++) {
            for (let num = 1; num <= 9; num++) {
                let rowSpot = -1;
                let rowCount = 0;
                for (let c = 0; c < 9; c++) {
                    if (candsGrid[unit][c] && candsGrid[unit][c].includes(num)) {
                        rowCount++;
                        rowSpot = c;
                    }
                }
                if (rowCount === 1) {
                    work[unit][rowSpot] = num;
                    progress = true;
                    break;
                }

                let colSpot = -1;
                let colCount = 0;
                for (let r = 0; r < 9; r++) {
                    if (candsGrid[r][unit] && candsGrid[r][unit].includes(num)) {
                        colCount++;
                        colSpot = r;
                    }
                }
                if (colCount === 1) {
                    work[colSpot][unit] = num;
                    progress = true;
                    break;
                }

                const startRow = Math.floor(unit / 3) * 3;
                const startCol = (unit % 3) * 3;
                let boxR = -1;
                let boxC = -1;
                let boxCount = 0;
                for (let dr = 0; dr < 3; dr++) {
                    for (let dc = 0; dc < 3; dc++) {
                        const r = startRow + dr;
                        const c = startCol + dc;
                        if (candsGrid[r][c] && candsGrid[r][c].includes(num)) {
                            boxCount++;
                            boxR = r;
                            boxC = c;
                        }
                    }
                }
                if (boxCount === 1) {
                    work[boxR][boxC] = num;
                    progress = true;
                    break;
                }
            }
            if (progress) break;
        }

        if (!progress) return false;
    }
}

// ============================================================================
// Hidden URL Configuration (Easier Mode & Language DE / EN)
// ============================================================================
// Supported URL parameters (persisted in localStorage):
//   ?easy=1  or ?leicht=1  -> Leichter (Einfach = 56 vorgegebene Zahlen, nur Naked Singles)
//   ?easy=2  or ?leicht=2  -> Sehr leicht (Einfach = 63 vorgegebene Zahlen, nur Naked Singles)
//   ?easy=3  or ?leicht=3  -> Ultra leicht (Einfach = 70 vorgegebene Zahlen, fast volle Reihen/Boxen)
//   ?easy=65 or ?clues=65  -> Direkte Anzahl vorgegebener Zahlen (zwischen 35 und 78) für "Einfach"
//   ?lang=de or ?lang=en   -> Sprache auf Deutsch oder Englisch (wie im Screenshot) stellen
//   ?reset=1 or ?easy=0    -> Zurücksetzen auf Standard

const CONFIG_STORAGE_KEY = 'forgot_sudoku_custom_config_v1';
const LANG_STORAGE_KEY = 'forgot_sudoku_lang_v1';

const I18N = {
    de: {
        classic: 'Klassisch',
        killer: 'Killer',
        difficultyLabel: 'Schwierigkeitsgrad:',
        diffs: {
            easy: 'Einfach',
            medium: 'Mittel',
            hard: 'Schwer',
            expert: 'Experte',
            master: 'Meister',
            extreme: 'Extrem'
        },
        mistakes: 'Fehler',
        time: 'Zeit',
        off: 'AUS',
        on: 'EIN',
        newGame: 'Neues Spiel',
        pauseTitle: 'Spiel pausiert',
        resume: 'Weiter',
        winTitle: 'Großartig!',
        bestScores: 'Bestpunktzahl',
        today: 'Heute',
        thisWeek: 'Diese Woche',
        thisMonth: 'Dieser Monat',
        total: 'Gesamt',
        tournament: 'Turnier',
        showAll: 'Alle anzeigen',
        rank: 'Platzierung',
        tournamentScore: 'Gesamtpunktzahl',
        adSub: 'Candlelight',
        adTitle: 'Candlelight Bielefeld',
        adBtn: 'Öffnen',
        tournamentInfo: 'Turnier-Rangliste: Platz 13 von 1.500 Spielern',
        selectCellFirst: ''
    },
    en: {
        classic: 'Classic',
        killer: 'Killer',
        difficultyLabel: 'Difficulty:',
        diffs: {
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard',
            expert: 'Expert',
            master: 'Master',
            extreme: 'Extreme'
        },
        mistakes: 'Mistakes',
        time: 'Time',
        off: 'OFF',
        on: 'ON',
        newGame: 'New Game',
        pauseTitle: 'Game Paused',
        resume: 'Resume',
        winTitle: 'Great!',
        bestScores: 'Best score',
        today: 'Today',
        thisWeek: 'This week',
        thisMonth: 'This month',
        total: 'Total',
        tournament: 'Tournament',
        showAll: 'Show all',
        rank: 'Rank',
        tournamentScore: 'Total score',
        adSub: 'Candlelight',
        adTitle: 'Candlelight Bielefeld',
        adBtn: 'Open',
        tournamentInfo: 'Tournament ranking: Rank 13 of 1,500 players',
        selectCellFirst: ''
    }
};

function resolveLanguage() {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang === 'en' || urlLang === 'de') {
        try { localStorage.setItem(LANG_STORAGE_KEY, urlLang); } catch (e) {}
        return urlLang;
    }
    try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved === 'en' || saved === 'de') return saved;
    } catch (e) {}
    return 'de';
}

let currentLang = resolveLanguage();

const BASE_DIFFICULTY_CONFIG = {
    easy:    { clues: 47, solverMode: 'SINGLES' },
    medium:  { clues: 38, solverMode: 'SINGLES' },
    hard:    { clues: 32, solverMode: 'SINGLES' },
    expert:  { clues: 28, solverMode: 'ANY' },
    master:  { clues: 25, solverMode: 'ANY' },
    extreme: { clues: 23, solverMode: 'ANY' }
};

function resolveDifficultyConfig() {
    const params = new URLSearchParams(window.location.search);
    let customEasyClues = null;
    let urlChangedConfig = false;

    if (params.get('reset') === '1' || params.get('easy') === '0' || params.get('leicht') === '0') {
        try { localStorage.removeItem(CONFIG_STORAGE_KEY); } catch (e) {}
        urlChangedConfig = true;
    } else {
        const rawParam =
            params.get('clues') ??
            params.get('zahlen') ??
            params.get('easy') ??
            params.get('leicht');

        if (rawParam !== null && rawParam !== '') {
            const num = parseInt(rawParam, 10);
            if (rawParam === 'true' || num === 1) {
                customEasyClues = 56;
            } else if (num === 2) {
                customEasyClues = 63;
            } else if (num === 3) {
                customEasyClues = 70;
            } else if (num >= 4 && num <= 9) {
                customEasyClues = Math.min(76, 52 + num * 3);
            } else if (num >= 30 && num <= 78) {
                customEasyClues = num;
            }

            if (customEasyClues !== null) {
                try {
                    const prev = localStorage.getItem(CONFIG_STORAGE_KEY);
                    if (prev !== String(customEasyClues)) {
                        urlChangedConfig = true;
                    }
                    localStorage.setItem(CONFIG_STORAGE_KEY, String(customEasyClues));
                } catch (e) {}
            }
        } else {
            try {
                const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
                if (saved) {
                    const parsed = parseInt(saved, 10);
                    if (parsed >= 30 && parsed <= 78) {
                        customEasyClues = parsed;
                    }
                }
            } catch (e) {}
        }
    }

    if (customEasyClues === null) {
        return {
            config: JSON.parse(JSON.stringify(BASE_DIFFICULTY_CONFIG)),
            urlChangedConfig,
            customEasyClues: null
        };
    }

    const easyClues = Math.max(35, Math.min(78, customEasyClues));
    const clamp = (v, min) => Math.max(min, Math.min(76, v));

    return {
        config: {
            easy:    { clues: easyClues,              solverMode: easyClues >= 50 ? 'NAKED_ONLY' : 'SINGLES' },
            medium:  { clues: clamp(easyClues - 4, 36), solverMode: 'SINGLES' },
            hard:    { clues: clamp(easyClues - 8, 33), solverMode: 'SINGLES' },
            expert:  { clues: clamp(easyClues - 11, 30), solverMode: 'SINGLES' },
            master:  { clues: clamp(easyClues - 14, 28), solverMode: 'SINGLES' },
            extreme: { clues: clamp(easyClues - 16, 26), solverMode: 'SINGLES' }
        },
        urlChangedConfig,
        customEasyClues: easyClues
    };
}

const resolvedSettings = resolveDifficultyConfig();
const DIFFICULTY_CONFIG = resolvedSettings.config;

function generateSudokuPuzzle(targetClues, difficulty) {
    const fullGrid = generateFullGrid();
    const puzzle = fullGrid.map(row => [...row]);
    const solverMode = DIFFICULTY_CONFIG[difficulty]?.solverMode || 'SINGLES';

    let clues = 81;
    const removableCells = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            removableCells.push([r, c]);
        }
    }
    for (let i = removableCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [removableCells[i], removableCells[j]] = [removableCells[j], removableCells[i]];
    }

    for (let i = 0; i < removableCells.length && clues > targetClues; i++) {
        const [r, c] = removableCells[i];
        const originalValue = puzzle[r][c];
        puzzle[r][c] = 0;

        const solutionsFound = solve(puzzle.map(row => [...row]), 2);
        if (solutionsFound !== 1) {
            puzzle[r][c] = originalValue;
            continue;
        }

        if (solverMode === 'NAKED_ONLY' || solverMode === 'SINGLES') {
            if (!canSolveWithHumanSingles(puzzle, solverMode)) {
                puzzle[r][c] = originalValue;
                continue;
            }
        }

        clues--;
    }

    return { puzzle, solution: fullGrid };
}

// ============================================================================
// DOM & Game State
// ============================================================================

const STORAGE_KEY = 'forgot_sudoku_state_v3';
const STATS_STORAGE_KEY = 'forgot_sudoku_stats_v1';

const gridEl = document.getElementById('sudoku-grid');
const newGameBtn = document.getElementById('new-game-btn');
const winNewGameBtn = document.getElementById('win-new-game-btn');
const undoBtn = document.getElementById('undo-btn');
const eraseBtn = document.getElementById('erase-btn');
const notesBtn = document.getElementById('notes-btn');
const notesBadgeEl = document.getElementById('notes-badge');
const hintBtn = document.getElementById('hint-btn');
const messageEl = document.getElementById('message');
const timerDisplayEl = document.getElementById('timer-display');
const timerToggleEl = document.getElementById('timer-toggle');
const pauseIconEl = document.getElementById('pause-icon');
const playIconEl = document.getElementById('play-icon');
const pauseOverlayEl = document.getElementById('pause-overlay');
const resumeBtn = document.getElementById('resume-btn');
const winOverlayEl = document.getElementById('win-overlay');
const winMiniGridEl = document.getElementById('win-mini-grid');
const winTournamentBtn = document.getElementById('win-tournament-btn');
const winAdBtn = document.getElementById('win-ad-btn');
const scoreDisplayEl = document.getElementById('score-display');
const diffTabs = document.querySelectorAll('.diff-tab');
const numButtons = document.querySelectorAll('.num-button');

let currentDifficulty = 'easy';
let currentPuzzle = [];
let userBoard = [];
let solution = [];
let notesBoard = [];
let scoredCells = []; // 9x9 boolean grid so each solved cell awards points once
let currentScore = 0;
let historyStack = [];
let selectedRow = null;
let selectedCol = null;
let isNotesMode = false;
let isPaused = false;
let isGameWon = false;
let elapsedSeconds = 0;
let timerInterval = null;
let autoNewGameTimeout = null;

function getStoredStats() {
    try {
        const raw = localStorage.getItem(STATS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.today === 'number') {
                return parsed;
            }
        }
    } catch (e) {}

    // Initial base high scores matching the original design
    return {
        today: 11525,
        thisWeek: 13850,
        thisMonth: 19185,
        total: 40715,
        rank: 13,
        tournamentScore: 757775
    };
}

function updateWinStats(earnedScore) {
    const stats = getStoredStats();
    const scoreToAdd = Math.max(earnedScore || 0, 150);
    stats.today += scoreToAdd;
    stats.thisWeek += scoreToAdd;
    stats.thisMonth += scoreToAdd;
    stats.total += scoreToAdd;
    stats.tournamentScore += scoreToAdd;

    try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {}

    return stats;
}

function displayWinStats(stats) {
    const locale = currentLang === 'de' ? 'de-DE' : 'en-US';
    const todayEl = document.getElementById('win-stat-today');
    const weekEl = document.getElementById('win-stat-week');
    const monthEl = document.getElementById('win-stat-month');
    const totalEl = document.getElementById('win-stat-total');
    const rankEl = document.getElementById('win-stat-rank');
    const tournamentScoreEl = document.getElementById('win-stat-tournament-score');

    if (todayEl) todayEl.textContent = stats.today.toLocaleString(locale);
    if (weekEl) weekEl.textContent = stats.thisWeek.toLocaleString(locale);
    if (monthEl) monthEl.textContent = stats.thisMonth.toLocaleString(locale);
    if (totalEl) totalEl.textContent = stats.total.toLocaleString(locale);
    if (rankEl) rankEl.textContent = stats.rank.toLocaleString(locale);
    if (tournamentScoreEl) tournamentScoreEl.textContent = stats.tournamentScore.toLocaleString(locale);
}

function renderMiniBoard() {
    if (!winMiniGridEl) return;
    winMiniGridEl.innerHTML = '';

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.className = 'win-mini-cell';

            if (c % 3 === 2 && c !== 8) cell.classList.add('mini-border-right-thick');
            if (r % 3 === 2 && r !== 8) cell.classList.add('mini-border-bottom-thick');

            const val = (userBoard[r] && userBoard[r][c])
                ? userBoard[r][c]
                : (solution[r] ? solution[r][c] : 0);
            const isInitial = currentPuzzle[r] && currentPuzzle[r][c] !== 0;

            if (val !== 0) {
                cell.textContent = String(val);
                cell.classList.add(isInitial ? 'mini-cell-clue' : 'mini-cell-user');
            }

            winMiniGridEl.appendChild(cell);
        }
    }
}

function applyLanguageUI() {
    const t = I18N[currentLang] || I18N.de;
    document.documentElement.lang = currentLang;
    document.getElementById('nav-classic').textContent = t.classic;
    document.getElementById('nav-killer').textContent = t.killer;
    document.getElementById('difficulty-label').textContent = t.difficultyLabel;
    diffTabs.forEach(tab => {
        const key = tab.dataset.difficulty;
        if (t.diffs[key]) tab.textContent = t.diffs[key];
    });
    document.getElementById('mistakes-label').textContent = t.mistakes;
    document.getElementById('time-label').textContent = t.time;
    notesBadgeEl.textContent = isNotesMode ? t.on : t.off;
    newGameBtn.textContent = t.newGame;
    document.getElementById('pause-title').textContent = t.pauseTitle;
    resumeBtn.textContent = t.resume;

    // Win Screen Elements
    const winTitleEl = document.getElementById('win-title');
    if (winTitleEl) winTitleEl.textContent = t.winTitle;
    const bestScoresEl = document.getElementById('win-best-label');
    if (bestScoresEl) bestScoresEl.textContent = t.bestScores;
    const todayLabelEl = document.getElementById('win-label-today');
    if (todayLabelEl) todayLabelEl.textContent = t.today;
    const weekLabelEl = document.getElementById('win-label-week');
    if (weekLabelEl) weekLabelEl.textContent = t.thisWeek;
    const monthLabelEl = document.getElementById('win-label-month');
    if (monthLabelEl) monthLabelEl.textContent = t.thisMonth;
    const totalLabelEl = document.getElementById('win-label-total');
    if (totalLabelEl) totalLabelEl.textContent = t.total;
    const tournamentLabelEl = document.getElementById('win-tournament-label');
    if (tournamentLabelEl) tournamentLabelEl.textContent = t.tournament;
    const showAllBtnEl = document.getElementById('win-tournament-btn');
    if (showAllBtnEl) showAllBtnEl.textContent = t.showAll;
    const rankLabelEl = document.getElementById('win-label-rank');
    if (rankLabelEl) rankLabelEl.textContent = t.rank;
    const tournScoreLabelEl = document.getElementById('win-label-tournament-score');
    if (tournScoreLabelEl) tournScoreLabelEl.textContent = t.tournamentScore;
    if (winNewGameBtn) winNewGameBtn.textContent = t.newGame;
    const adSubEl = document.getElementById('win-ad-sub');
    if (adSubEl) adSubEl.textContent = t.adSub;
    const adTitleEl = document.getElementById('win-ad-title');
    if (adTitleEl) adTitleEl.textContent = t.adTitle;
    const adBtnEl = document.getElementById('win-ad-btn');
    if (adBtnEl) adBtnEl.textContent = t.adBtn;
}

// --- Helpers for Notes & History ---

function createEmptyNotesBoard() {
    return Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => new Set())
    );
}

function createEmptyScoredCells(puzzle) {
    return puzzle.map(row => row.map(val => val !== 0));
}

function cloneNotesBoard(nb) {
    return nb.map(row => row.map(set => new Set(set)));
}

function pushHistory() {
    historyStack.push({
        userBoard: userBoard.map(row => [...row]),
        notesBoard: cloneNotesBoard(notesBoard),
        selectedRow,
        selectedCol
    });
    if (historyStack.length > 200) {
        historyStack.shift();
    }
}

// --- LocalStorage Persistence ---

function saveGameState() {
    if (isGameWon || currentPuzzle.length === 0) return;
    try {
        const serializedNotes = notesBoard.map(row => row.map(set => Array.from(set)));
        const state = {
            currentDifficulty,
            currentPuzzle,
            userBoard,
            solution,
            notesBoard: serializedNotes,
            scoredCells,
            currentScore,
            elapsedSeconds
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {}
}

function loadSavedGameState() {
    if (resolvedSettings.urlChangedConfig) {
        return false;
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const state = JSON.parse(raw);
        if (
            !state ||
            !Array.isArray(state.currentPuzzle) ||
            state.currentPuzzle.length !== 9 ||
            !Array.isArray(state.solution) ||
            state.solution.length !== 9
        ) {
            return false;
        }
        currentDifficulty = DIFFICULTY_CONFIG[state.currentDifficulty] ? state.currentDifficulty : 'easy';
        currentPuzzle = state.currentPuzzle;
        userBoard = state.userBoard;
        solution = state.solution;
        notesBoard = state.notesBoard.map(row => row.map(arr => new Set(arr)));
        scoredCells = Array.isArray(state.scoredCells)
            ? state.scoredCells
            : createEmptyScoredCells(currentPuzzle);
        currentScore = typeof state.currentScore === 'number' ? state.currentScore : 0;
        elapsedSeconds = typeof state.elapsedSeconds === 'number' ? state.elapsedSeconds : 0;
        return true;
    } catch (err) {
        return false;
    }
}

function clearSavedGameState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (err) {}
}

// --- Timer & Score Logic ---

function formatTime(secs) {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    const mStr = String(mins).padStart(2, '0');
    const sStr = String(remSecs).padStart(2, '0');
    return `${mStr}:${sStr}`;
}

function updateTimerDisplay() {
    if (timerDisplayEl) {
        timerDisplayEl.textContent = formatTime(elapsedSeconds);
    }
}

function updateScoreDisplay() {
    if (scoreDisplayEl) {
        scoreDisplayEl.textContent = String(currentScore);
    }
}

function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
        if (!isPaused && !isGameWon) {
            elapsedSeconds++;
            updateTimerDisplay();
            if (elapsedSeconds % 5 === 0) {
                saveGameState();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function togglePause(forceState) {
    if (isGameWon) return;
    isPaused = typeof forceState === 'boolean' ? forceState : !isPaused;
    if (isPaused) {
        pauseOverlayEl.style.display = 'flex';
        pauseIconEl.style.display = 'none';
        playIconEl.style.display = 'block';
    } else {
        pauseOverlayEl.style.display = 'none';
        pauseIconEl.style.display = 'block';
        playIconEl.style.display = 'none';
    }
}

// --- Grid Creation & Rendering ---

function buildGridDOM() {
    gridEl.innerHTML = '';
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.setAttribute('role', 'gridcell');
            cell.addEventListener('click', () => selectCell(r, c));
            gridEl.appendChild(cell);
        }
    }
}

function getCellEl(r, c) {
    return gridEl.children[r * 9 + c];
}

function hasPeerConflict(r, c, val) {
    if (val === 0) return false;
    for (let i = 0; i < 9; i++) {
        if (i !== c && userBoard[r][i] === val) return true;
        if (i !== r && userBoard[i][c] === val) return true;
    }
    const startRow = Math.floor(r / 3) * 3;
    const startCol = Math.floor(c / 3) * 3;
    for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
            const nr = startRow + dr;
            const nc = startCol + dc;
            if ((nr !== r || nc !== c) && userBoard[nr][nc] === val) {
                return true;
            }
        }
    }
    return false;
}

function isSameBox(r1, c1, r2, c2) {
    return Math.floor(r1 / 3) === Math.floor(r2 / 3) &&
           Math.floor(c1 / 3) === Math.floor(c2 / 3);
}

function renderBoard() {
    const selectedVal =
        selectedRow !== null && selectedCol !== null
            ? userBoard[selectedRow][selectedCol]
            : 0;

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cellEl = getCellEl(r, c);
            if (!cellEl) continue;

            const isClue = currentPuzzle[r][c] !== 0;
            const val = userBoard[r][c];
            const isSelected = r === selectedRow && c === selectedCol;
            const isRelated =
                selectedRow !== null &&
                selectedCol !== null &&
                !isSelected &&
                (r === selectedRow || c === selectedCol || isSameBox(r, c, selectedRow, selectedCol));

            const isSameNumber = selectedVal !== 0 && val === selectedVal && !isSelected;
            const isWrongEntry = !isClue && val !== 0 && val !== solution[r][c];
            const isConflict = val !== 0 && hasPeerConflict(r, c, val);

            const hadHintAnim = cellEl.classList.contains('hint-anim');
            cellEl.className = 'cell';
            if (hadHintAnim) cellEl.classList.add('hint-anim');

            if (isClue) cellEl.classList.add('clue');
            if (isRelated) cellEl.classList.add('related');
            if (isSameNumber) cellEl.classList.add('same-number');
            if (isConflict) cellEl.classList.add('conflict');
            if (isSelected) cellEl.classList.add('selected');
            if (isWrongEntry) cellEl.classList.add('error');

            if (val !== 0) {
                cellEl.textContent = val;
            } else {
                const notes = notesBoard[r][c];
                if (notes && notes.size > 0) {
                    const notesGrid = document.createElement('div');
                    notesGrid.className = 'notes-grid';
                    for (let n = 1; n <= 9; n++) {
                        const span = document.createElement('span');
                        span.className = 'note-num';
                        if (notes.has(n)) {
                            span.textContent = n;
                            if (selectedVal !== 0 && n === selectedVal) {
                                span.classList.add('highlight-note');
                            }
                        }
                        notesGrid.appendChild(span);
                    }
                    cellEl.innerHTML = '';
                    cellEl.appendChild(notesGrid);
                } else {
                    cellEl.textContent = '';
                }
            }
        }
    }

    updateNumberPadCompletion();
}

function updateNumberPadCompletion() {
    const counts = Array(10).fill(0);
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = userBoard[r][c];
            if (val !== 0 && val === solution[r][c]) {
                counts[val]++;
            }
        }
    }

    numButtons.forEach(btn => {
        const num = parseInt(btn.dataset.value, 10);
        if (counts[num] >= 9) {
            btn.classList.add('completed');
        } else {
            btn.classList.remove('completed');
        }
    });
}

// --- Cell Selection & Input ---

function selectCell(r, c) {
    if (isPaused || isGameWon) return;
    selectedRow = r;
    selectedCol = c;
    renderBoard();
}

function removePeerNotes(row, col, num) {
    for (let i = 0; i < 9; i++) {
        notesBoard[row][i].delete(num);
        notesBoard[i][col].delete(num);
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
            notesBoard[startRow + dr][startCol + dc].delete(num);
        }
    }
}

function awardScoreIfFirstTime(r, c) {
    if (!scoredCells[r][c]) {
        scoredCells[r][c] = true;
        currentScore += 50;
        updateScoreDisplay();
    }
}

function applyValue(value) {
    if (isPaused || isGameWon) return;
    if (selectedRow === null || selectedCol === null) return;

    const r = selectedRow;
    const c = selectedCol;

    if (currentPuzzle[r][c] !== 0) {
        return;
    }

    if (value === 0) {
        if (userBoard[r][c] === 0 && notesBoard[r][c].size === 0) return;
        pushHistory();
        userBoard[r][c] = 0;
        notesBoard[r][c].clear();
        renderBoard();
        saveGameState();
        return;
    }

    if (isNotesMode) {
        pushHistory();
        if (userBoard[r][c] !== 0 && userBoard[r][c] !== solution[r][c]) {
            userBoard[r][c] = 0;
        }
        if (userBoard[r][c] === 0) {
            if (notesBoard[r][c].has(value)) {
                notesBoard[r][c].delete(value);
            } else {
                notesBoard[r][c].add(value);
            }
        }
        renderBoard();
        saveGameState();
        return;
    }

    pushHistory();

    if (userBoard[r][c] === value) {
        userBoard[r][c] = 0;
    } else {
        userBoard[r][c] = value;
        notesBoard[r][c].clear();
        if (value === solution[r][c]) {
            removePeerNotes(r, c, value);
            awardScoreIfFirstTime(r, c);
        }
    }

    renderBoard();
    saveGameState();

    if (isBoardSolved()) {
        handleGameWon();
    }
}

// --- Action Buttons: Undo, Erase, Notes, Hint ---

function handleUndo() {
    if (isPaused || isGameWon || historyStack.length === 0) return;
    const prev = historyStack.pop();
    userBoard = prev.userBoard;
    notesBoard = prev.notesBoard;
    if (prev.selectedRow !== null && prev.selectedCol !== null) {
        selectedRow = prev.selectedRow;
        selectedCol = prev.selectedCol;
    }
    renderBoard();
    saveGameState();
}

function handleErase() {
    applyValue(0);
}

function toggleNotesMode(forceState) {
    if (isPaused || isGameWon) return;
    const t = I18N[currentLang] || I18N.de;
    isNotesMode = typeof forceState === 'boolean' ? forceState : !isNotesMode;
    if (isNotesMode) {
        notesBtn.classList.add('active');
        notesBadgeEl.textContent = t.on;
        notesBadgeEl.classList.add('on');
    } else {
        notesBtn.classList.remove('active');
        notesBadgeEl.textContent = t.off;
        notesBadgeEl.classList.remove('on');
    }
}

function handleHint() {
    if (isPaused || isGameWon) return;

    let targetR = null;
    let targetC = null;

    if (
        selectedRow !== null &&
        selectedCol !== null &&
        currentPuzzle[selectedRow][selectedCol] === 0 &&
        userBoard[selectedRow][selectedCol] !== solution[selectedRow][selectedCol]
    ) {
        targetR = selectedRow;
        targetC = selectedCol;
    }

    if (targetR === null) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (
                    currentPuzzle[r][c] === 0 &&
                    userBoard[r][c] !== 0 &&
                    userBoard[r][c] !== solution[r][c]
                ) {
                    targetR = r;
                    targetC = c;
                    break;
                }
            }
            if (targetR !== null) break;
        }
    }

    if (targetR === null) {
        let bestCount = 10;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (userBoard[r][c] === 0) {
                    const cands = findCandidates(userBoard, r, c);
                    const count = cands.length > 0 ? cands.length : 9;
                    if (count < bestCount) {
                        bestCount = count;
                        targetR = r;
                        targetC = c;
                    }
                }
            }
        }
    }

    if (targetR === null || targetC === null) return;

    pushHistory();
    selectedRow = targetR;
    selectedCol = targetC;
    const correctNum = solution[targetR][targetC];
    userBoard[targetR][targetC] = correctNum;
    notesBoard[targetR][targetC].clear();
    removePeerNotes(targetR, targetC, correctNum);
    awardScoreIfFirstTime(targetR, targetC);

    renderBoard();
    saveGameState();

    const cellEl = getCellEl(targetR, targetC);
    if (cellEl) {
        cellEl.classList.remove('hint-anim');
        void cellEl.offsetWidth;
        cellEl.classList.add('hint-anim');
    }

    if (isBoardSolved()) {
        handleGameWon();
    }
}

// --- Win Check & Game Over ---

function isBoardSolved() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (userBoard[r][c] !== solution[r][c]) {
                return false;
            }
        }
    }
    return true;
}

function handleGameWon() {
    isGameWon = true;
    stopTimer();
    clearSavedGameState();

    const stats = updateWinStats(currentScore);
    displayWinStats(stats);
    renderMiniBoard();

    if (winOverlayEl) {
        winOverlayEl.style.display = 'flex';
    }

    if (autoNewGameTimeout) clearTimeout(autoNewGameTimeout);
    autoNewGameTimeout = setTimeout(() => {
        newGame(currentDifficulty);
    }, 120000);
}

// --- Starting / Restoring a Game ---

function updateDifficultyTabsUI(difficulty) {
    diffTabs.forEach(tab => {
        const isMatch = tab.dataset.difficulty === difficulty;
        tab.classList.toggle('active', isMatch);
        tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
}

function selectInitialCell() {
    selectedRow = 0;
    selectedCol = 0;
}

function newGame(difficulty = currentDifficulty) {
    if (autoNewGameTimeout) {
        clearTimeout(autoNewGameTimeout);
        autoNewGameTimeout = null;
    }

    currentDifficulty = DIFFICULTY_CONFIG[difficulty] ? difficulty : 'easy';
    updateDifficultyTabsUI(currentDifficulty);

    isGameWon = false;
    isPaused = false;
    winOverlayEl.style.display = 'none';
    pauseOverlayEl.style.display = 'none';
    pauseIconEl.style.display = 'block';
    playIconEl.style.display = 'none';
    messageEl.textContent = '';

    const targetClues = DIFFICULTY_CONFIG[currentDifficulty].clues;

    setTimeout(() => {
        const generated = generateSudokuPuzzle(targetClues, currentDifficulty);
        currentPuzzle = generated.puzzle;
        solution = generated.solution;
        userBoard = currentPuzzle.map(row => [...row]);
        notesBoard = createEmptyNotesBoard();
        scoredCells = createEmptyScoredCells(currentPuzzle);
        currentScore = 0;
        historyStack = [];
        elapsedSeconds = 0;

        updateTimerDisplay();
        updateScoreDisplay();
        buildGridDOM();
        selectInitialCell();
        renderBoard();
        saveGameState();
        startTimer();
    }, 10);
}

function initGame() {
    applyLanguageUI();
    const params = new URLSearchParams(window.location.search);
    const shouldTestWin = params.get('win') === '1' || params.get('testwin') === '1';

    if (loadSavedGameState() && !isBoardSolved()) {
        updateDifficultyTabsUI(currentDifficulty);
        updateTimerDisplay();
        updateScoreDisplay();
        buildGridDOM();
        selectInitialCell();
        renderBoard();
        startTimer();
    } else {
        newGame('easy');
    }

    if (shouldTestWin) {
        setTimeout(() => {
            handleGameWon();
        }, 150);
    }
}

// --- Keyboard Navigation & Shortcuts ---

function handleNavigation(key) {
    if (isPaused || isGameWon) return;
    let r = selectedRow !== null ? selectedRow : 0;
    let c = selectedCol !== null ? selectedCol : 0;

    if (key === 'ArrowUp' || key === 'w' || key === 'W') r = (r - 1 + 9) % 9;
    if (key === 'ArrowDown' || key === 's' || key === 'S') r = (r + 1) % 9;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') c = (c - 1 + 9) % 9;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') c = (c + 1) % 9;

    selectCell(r, c);
}

document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        handleNavigation(e.key);
        return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
    }

    if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        toggleNotesMode();
        return;
    }

    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= 9) {
        e.preventDefault();
        applyValue(num);
        return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        applyValue(0);
    }
});

// --- Event Listeners ---

newGameBtn.addEventListener('click', () => newGame(currentDifficulty));
winNewGameBtn.addEventListener('click', () => newGame(currentDifficulty));

if (winTournamentBtn) {
    winTournamentBtn.addEventListener('click', () => {
        const t = I18N[currentLang] || I18N.de;
        alert(t.tournamentInfo);
    });
}

if (winAdBtn) {
    winAdBtn.addEventListener('click', () => {
        window.open('https://candlelightexperience.com/', '_blank');
    });
}

diffTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const diff = tab.dataset.difficulty;
        newGame(diff);
    });
});

undoBtn.addEventListener('click', handleUndo);
eraseBtn.addEventListener('click', handleErase);
notesBtn.addEventListener('click', () => toggleNotesMode());
hintBtn.addEventListener('click', handleHint);

timerToggleEl.addEventListener('click', () => togglePause());
resumeBtn.addEventListener('click', () => togglePause(false));

numButtons.forEach(button => {
    button.addEventListener('click', () => {
        let value = parseInt(button.dataset.value, 10);
        if (isNaN(value)) {
            value = 0;
        }
        applyValue(value);
    });
});

initGame();
