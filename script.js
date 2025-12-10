// --- Core Sudoku Logic (Backtracking) ---

/**
 * Checks if placing 'num' at (row, col) is valid based on Sudoku rules.
 */
function isValid(board, row, col, num) {
    // Check row and column
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) {
            return false;
        }
    }
    // Check 3x3 box
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
 * If solutions is 1, it finds and returns the first solution (mutating the board).
 * If solutions > 1, it counts the number of solutions and returns the count.
 */
function solve(board, solutions = 1) {
    let count = 0;

    function backtrack() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    // Use a shuffled array for randomness in generation/first solution
                    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                    
                    for (const num of nums) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            
                            if (solutions === 1) {
                                // If seeking a single solution, return true immediately upon finding it
                                if (backtrack()) return true;
                            } else {
                                // If counting multiple solutions
                                if (backtrack()) {
                                    count++;
                                    if (count >= solutions) return true; // Stop once the target count is reached
                                }
                            }
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    // If no number worked, return false (or stop counting if we hit the limit)
                    return solutions === 1 ? false : (count >= solutions);
                }
            }
        }
        // Puzzle is full
        return solutions === 1 ? true : (count++, count >= solutions);
    }

    // When counting solutions, work on a copy to avoid unintended mutation if necessary,
    // though the recursive function handles the backtracking resets (board[r][c] = 0).
    // Note: The logic handles both cases.
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

// --- Sudoku Technique Analysis for Difficulty Control ---

/**
 * Finds all possible candidates (pencil marks) for a specific cell (row, col).
 */
function findCandidates(board, row, col) {
    if (board[row][col] !== 0) return [];
    
    const candidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    // Check row and column
    for (let i = 0; i < 9; i++) {
        if (board[row][i] !== 0) candidates.delete(board[row][i]);
        if (board[i][col] !== 0) candidates.delete(board[i][col]);
    }
    
    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] !== 0) {
                candidates.delete(board[startRow + i][startCol + j]);
            }
        }
    }
    return Array.from(candidates);
}

/**
 * Checks if the next solvable step is a simple Naked or Hidden Single.
 * This is used to guarantee that "Easy" puzzles are solvable by inspection.
 * Returns 'EASY_SINGLE' or 'REQUIRES_ADVANCED'.
 */
function getRequiredTechniqueLevel(board) {
    // Generate all candidates for all empty cells
    const allCandidates = [];
    for (let r = 0; r < 9; r++) {
        allCandidates[r] = [];
        for (let c = 0; c < 9; c++) {
            allCandidates[r][c] = board[r][c] === 0 ? findCandidates(board, r, c) : [];
            // 1. Check for Naked Singles (Level 1 - Easiest)
            if (allCandidates[r][c].length === 1) {
                return 'EASY_SINGLE';
            }
        }
    }
    
    // 2. Check for Hidden Singles (Level 2 - Still Easy/Medium)
    for (let i = 0; i < 9; i++) { // i is the unit index (0-8)
        for (let num = 1; num <= 9; num++) { // num is the candidate value

            // Check Row i
            let rowCount = 0;
            for (let c = 0; c < 9; c++) {
                if (allCandidates[i][c].includes(num)) rowCount++;
            }
            if (rowCount === 1) return 'EASY_SINGLE';

            // Check Column i
            let colCount = 0;
            for (let r = 0; r < 9; r++) {
                if (allCandidates[r][i].includes(num)) colCount++;
            }
            if (colCount === 1) return 'EASY_SINGLE';
            
            // Check Box i
            const startRow = Math.floor(i / 3) * 3;
            const startCol = (i % 3) * 3;
            let boxCount = 0;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (allCandidates[startRow + r][startCol + c].includes(num)) boxCount++;
                }
            }
            if (boxCount === 1) return 'EASY_SINGLE';
        }
    }

    // Check if the board is solved (no empty cells)
    const solved = board.every(row => row.every(val => val !== 0));
    return solved ? 'SOLVED' : 'REQUIRES_ADVANCED';
}


/**
 * Generates a Sudoku puzzle by removing clues from a full grid until
 * a target number of remaining clues is reached, ensuring a unique solution.
 * For 'easy' difficulty, it also enforces that the next solvable step is a Single.
 * @param {number} targetClues The minimum number of clues to leave on the board.
 * @param {string} difficulty The difficulty level ('easy', 'medium', etc.).
 * @returns {number[][]} The generated Sudoku puzzle.
 */
function generateSudokuPuzzle(targetClues, difficulty) {
    const fullGrid = generateFullGrid();
    const puzzle = fullGrid.map(row => [...row]);
    
    let clues = 81;
    let attempts = 0;
    const maxAttemptsPerRemoval = 50; 

    // Create a shuffled list of cell coordinates for randomized removal order
    const removableCells = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            removableCells.push([r, c]);
        }
    }
    removableCells.sort(() => Math.random() - 0.5);

    while (clues > targetClues && removableCells.length > 0) {
        if (attempts >= maxAttemptsPerRemoval) break; 

        const [r, c] = removableCells.pop(); // Get the next cell to test

        const originalValue = puzzle[r][c];
        puzzle[r][c] = 0; // Remove the clue temporarily

        // 1. Check for Unique Solution (Must have only 1 solution)
        const solutionsFound = solve(puzzle.map(row => [...row]), 2); 
        
        // 2. Check for Technique Level (Only enforce this for EASY mode)
        let techniqueCheckPassed = true;
        if (difficulty === 'easy' || difficulty === 'medium') { // Medium can also benefit from this check if desired
            const requiredLevel = getRequiredTechniqueLevel(puzzle);
            // If the puzzle requires a complex technique (Pairs/Triples/X-Wing, etc.), fail the removal.
            if (requiredLevel === 'REQUIRES_ADVANCED') {
                techniqueCheckPassed = false;
            }
        }
        
        if (solutionsFound === 1 && techniqueCheckPassed) {
            clues--;
            attempts = 0; // Successful removal: reset attempts
        } else {
            // Restore the clue
            puzzle[r][c] = originalValue;
            removableCells.unshift([r, c]); // Put the cell back for a later attempt
            attempts++;
        }
    }
    return puzzle;
}

// --- DOM and Game Setup Logic ---

// Get DOM elements
const gridEl = document.getElementById('sudoku-grid');
const newGameBtn = document.getElementById('new-game-btn');
const messageEl = document.getElementById('message');
const numberPadEl = document.getElementById('number-pad');
const trophyEl = document.getElementById('trophy-display');
const difficultySelectEl = document.getElementById('difficulty-select'); 


let currentPuzzle = []; 
let userBoard = [];     
let solution = [];      
let selectedCell = null; 

// The helper function to map difficulty names to clue counts
const DIFFICULTY_CLUES = {
    'easy': 48,    // Target: 48 clues, strictly uses technique check (Singles only)
    'medium': 35,  // Target: ~35 clues, generally requires Pairs/Triples
    'hard': 25,    // Target: ~25 clues, likely requires advanced techniques
    'minima': 17   // Target: ~17-21 clues, true minimum unique solution
};

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
            // Add click listener to all cells
            cell.addEventListener('click', () => selectCell(cell));
            gridEl.appendChild(cell);
        }
    }
    recheckAllErrors(); // Clear any previous error styling
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
    recheckAllErrors(); // Recheck all cells for simplicity
}

function recheckAllErrors() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            // Only check user-entered cells
            if (currentPuzzle[r][c] === 0) {
                const cellEl = gridEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                // If a value exists and it doesn't match the solution, mark as error
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
            // Check for empty cells or incorrect values
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

/**
 * Starts a new game with the selected difficulty.
 * @param {string} difficulty The difficulty level (e.g., 'easy', 'medium', 'hard').
 */
function newGame(difficulty = 'easy') {
    const targetClues = DIFFICULTY_CLUES[difficulty] || DIFFICULTY_CLUES['easy'];
    
    messageEl.textContent = `Generating ${difficulty.toUpperCase()} Puzzle (Target Clues > ${targetClues})... Please wait.`;
    gridEl.style.opacity = '0.5';
    trophyEl.classList.remove('trophy-shown');
    numberPadEl.style.pointerEvents = 'auto';
    gridEl.style.pointerEvents = 'auto';

    // Use a short timeout to prevent UI freeze during generation
    setTimeout(() => {
        currentPuzzle = generateSudokuPuzzle(targetClues, difficulty);
        
        // Solve the puzzle copy to get the solution
        solution = currentPuzzle.map(row => [...row]);
        solve(solution, 1);
        
        createGrid(currentPuzzle);
        messageEl.textContent = `Dieters Sudoku - ${difficulty.toUpperCase()}`;
        gridEl.style.opacity = '1';
    }, 50); 
}

// --- Keyboard Input Logic ---

document.addEventListener('keydown', (e) => {
    // 1. Navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); 
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
    if (nextCell) {
        selectCell(nextCell);
    }
}

// --- Event Listeners and Initialization ---

// Event listener for the New Game Button
newGameBtn.addEventListener('click', () => {
    const selectedDifficulty = difficultySelectEl ? difficultySelectEl.value : 'easy';
    newGame(selectedDifficulty);
});

// Event listener for the Difficulty Selector
if (difficultySelectEl) {
    difficultySelectEl.addEventListener('change', (e) => {
        newGame(e.target.value);
    });
}

// Event listener for the Number Pad
// document.querySelectorAll('.num-button').forEach(button => {
//     button.addEventListener('click', (e) => {
//         const value = parseInt(e.target.dataset.value);
//         applyValue(value);
//     });
// });


// Event listener for the Number Pad
document.querySelectorAll('.num-button').forEach(button => {
    button.addEventListener('click', (e) => {
        let value = parseInt(e.target.dataset.value); 
        
        // **SAFTEY CHECK ADDED HERE**
        if (isNaN(value)) {
            value = 0; // Assume any non-numeric value from the number pad is a request to clear/erase
        }
        
        applyValue(value);
    });
});

// Start the first game
newGame('easy');