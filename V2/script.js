// --- Core Sudoku Logic (Backtracking) ---

/**
 * Checks if placing 'num' at (row, col) is valid based on Sudoku rules.
 */
function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) {
            return false;
        }
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Solves the Sudoku puzzle using the Backtracking algorithm.
 */
function solve(board, solutions = 1) {
    let count = 0;

    function backtrack() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                    for (const num of nums) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solutions === 1) {
                                if (backtrack()) return true;
                            } else {
                                if (backtrack()) {
                                    count++;
                                    if (count >= solutions) return true;
                                }
                            }
                            board[row][col] = 0;
                        }
                    }
                    return solutions === 1 ? false : (count >= solutions);
                }
            }
        }
        return solutions === 1 ? true : (count++, count >= solutions);
    }

    const tempBoard = solutions > 1 ? board.map(row => [...row]) : board;
    if (solutions === 1) {
        return backtrack();
    } else {
        backtrack();
        return count;
    }
}

function generateFullGrid() {
    const board = Array(9).fill(0).map(() => Array(9).fill(0));
    solve(board, 1);
    return board;
}

function generateMinimaPuzzle() {
    const fullGrid = generateFullGrid();
    const puzzle = fullGrid.map(row => [...row]);
    const cells = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            cells.push({ r, c });
        }
    }
    cells.sort(() => Math.random() - 0.5);

    let clues = 81;
    let i = 0;
    while (clues > 42 && i < cells.length) {
        const { r, c } = cells[i];
        const originalValue = puzzle[r][c];
        if (originalValue !== 0) {
            puzzle[r][c] = 0;
            const solutionsFound = solve(puzzle.map(row => [...row]), 2); 
            if (solutionsFound === 1) {
                clues--;
            } else {
                puzzle[r][c] = originalValue;
            }
        }
        i++;
    }
    return puzzle;
}

// --- DOM and Game Setup Logic ---

const gridEl = document.getElementById('sudoku-grid');
const newGameBtn = document.getElementById('new-game-btn');
const messageEl = document.getElementById('message');
const numberPadEl = document.getElementById('number-pad');
const trophyEl = document.getElementById('trophy-display');

let currentPuzzle = []; 
let userBoard = [];     
let solution = [];      
let selectedCell = null; 

function createGrid(board) {
    gridEl.innerHTML = '';
    userBoard = board.map(row => [...row]);
    selectedCell = null;
    
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            if (board[r][c] !== 0) {
                cell.classList.add('clue');
                cell.textContent = board[r][c];
            } else {
                cell.textContent = userBoard[r][c] === 0 ? '' : userBoard[r][c];
            }
            // Add click listener to all cells to facilitate navigation focus
            cell.addEventListener('click', () => selectCell(cell));
            gridEl.appendChild(cell);
        }
    }
}

function selectCell(cell) {
    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    selectedCell = cell;
    selectedCell.classList.add('selected');
}

function applyValue(value) {
    if (!selectedCell) {
        messageEl.textContent = '👆 Select a cell first.';
        return;
    }

    const r = parseInt(selectedCell.dataset.row);
    const c = parseInt(selectedCell.dataset.col);
    
    // Protect clue cells from being overwritten
    if (currentPuzzle[r][c] !== 0) return;

    selectedCell.textContent = value === 0 ? '' : value;
    userBoard[r][c] = value;

    checkCellForError(r, c);
    
    if (isBoardCorrect()) {
        gameOver(true);
    }
}

function checkCellForError(r, c) {
    recheckAllErrors();
}

function recheckAllErrors() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (currentPuzzle[r][c] === 0) {
                const cellEl = gridEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (userBoard[r][c] !== 0 && userBoard[r][c] !== solution[r][c]) {
                    cellEl.classList.add('error');
                } else {
                    cellEl.classList.remove('error');
                }
            }
        }
    }
}

function isBoardCorrect() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (userBoard[r][c] === 0 || userBoard[r][c] !== solution[r][c]) {
                return false;
            }
        }
    }
    return true;
}

function gameOver(win) {
    if (win) {
        messageEl.textContent = '🎉 Solved! Starting a new game in 5 seconds...';
        trophyEl.classList.add('trophy-shown');
        numberPadEl.style.pointerEvents = 'none';
        gridEl.style.pointerEvents = 'none';

        setTimeout(() => {
            newGame();
        }, 5000);
    }
}

function newGame() {
    messageEl.textContent = 'Generating Minima Puzzle (17 Clues)... Please wait.';
    gridEl.style.opacity = '0.5';
    trophyEl.classList.remove('trophy-shown');
    numberPadEl.style.pointerEvents = 'auto';
    gridEl.style.pointerEvents = 'auto';

    setTimeout(() => {
        currentPuzzle = generateMinimaPuzzle();
        solution = currentPuzzle.map(row => [...row]);
        solve(solution, 1);
        createGrid(currentPuzzle);
        messageEl.textContent = 'Dieters Sudoku';
        gridEl.style.opacity = '1';
    }, 50); 
}

// --- Keyboard Input Logic ---

document.addEventListener('keydown', (e) => {
    // 1. Navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); // Prevent page scrolling
        handleNavigation(e.key);
        return;
    }

    // 2. Numbers 1-9
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
        applyValue(num);
        return;
    }

    // 3. Clear (Backspace, Delete, or 0)
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        applyValue(0);
        return;
    }
});

function handleNavigation(key) {
    let r = 0;
    let c = 0;

    if (!selectedCell) {
        r = 0; c = 0;
    } else {
        r = parseInt(selectedCell.dataset.row);
        c = parseInt(selectedCell.dataset.col);

        if (key === 'ArrowUp') r = (r - 1 + 9) % 9;
        if (key === 'ArrowDown') r = (r + 1) % 9;
        if (key === 'ArrowLeft') c = (c - 1 + 9) % 9;
        if (key === 'ArrowRight') c = (c + 1) % 9;
    }

    const nextCell = gridEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    selectCell(nextCell);
}

// --- Event Listeners and Initialization ---

newGameBtn.addEventListener('click', newGame);

document.querySelectorAll('.num-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const value = parseInt(e.target.dataset.value);
        applyValue(value);
    });
});

newGame();