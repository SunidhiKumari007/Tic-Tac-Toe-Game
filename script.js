// --- DOM Element Selection ---
const player1NameInput = document.getElementById('player1NameInput');
const player2NameInput = document.getElementById('player2NameInput');
const startGameButton = document.getElementById('startGameButton');
const restartGameButton = document.getElementById('restartGameButton'); // This now performs a full reset

const gameStatus = document.getElementById('gameStatus');
const assignmentsDisplay = document.getElementById('assignmentsDisplay');
const cells = document.querySelectorAll('.cell');
const gameSection = document.getElementById('gameSection');
const playerSetup = document.getElementById('playerSetup'); // New selection for hiding/showing setup

const player1NameDisplay = document.getElementById('player1NameDisplay');
const player2NameDisplay = document.getElementById('player2NameDisplay');
const scorePlayer1 = document.getElementById('scorePlayer1');
const scorePlayer2 = document.getElementById('scorePlayer2');

// --- Game State Management ---
const WIN_CONDITIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

const gameState = {
    player1: 'Player 1',
    player2: 'Player 2',
    currentPlayer: 'X',
    board: ["", "", "", "", "", "", "", "", ""],
    gameActive: false,
    scores: { X: 0, O: 0 },
    // ⭐ NEW FEATURE STATE: Tracks the starting player for the next round
    nextStarter: 'X' 
};

// --- Initialization and Event Listeners ---

startGameButton.addEventListener('click', initializeGame);
// ⭐ CHANGE: 'Restart Game' button now calls the full reset function
restartGameButton.addEventListener('click', fullResetGame); 
cells.forEach(cell => cell.addEventListener('click', handleCellClick));

// Hide the game board until names are entered
gameSection.style.display = 'none';

// --- Core Game Functions ---

/**
 * 1. Fully resets names, scores, and board.
 * 2. Hides the game board and shows the name inputs.
 * (Called by the 'Restart Game' button)
 */
function fullResetGame() {
    // Reset names and scores
    player1NameInput.value = '';
    player2NameInput.value = '';
    gameState.scores = { X: 0, O: 0 };
    gameState.nextStarter = 'X'; // Reset starter to X for the very first game

    // Update Scoreboard display to show default values
    scorePlayer1.textContent = '0';
    scorePlayer2.textContent = '0';
    player1NameDisplay.textContent = 'Player 1';
    player2NameDisplay.textContent = 'Player 2';
    
    // Hide game, show setup
    gameSection.style.display = 'none';
    playerSetup.style.display = 'flex'; // Assuming playerSetup is flex based on CSS
    
    // Reset status text
    updateGameStatus(`Enter names and click Start Game`);
    assignmentsDisplay.textContent = '';
    
    // Ensure game is inactive
    gameState.gameActive = false;
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('X', 'O');
    });
}

/**
 * Sets up the game with player names and makes the board visible.
 * (Called by the 'Start Game' button)
 */
function initializeGame() {
    // 1. Get and set player names
    gameState.player1 = player1NameInput.value.trim() || 'Player 1 (X)';
    gameState.player2 = player2NameInput.value.trim() || 'Player 2 (O)';

    // 2. Update display elements
    assignmentsDisplay.textContent = `${gameState.player1} is X and ${gameState.player2} is O`;
    player1NameDisplay.textContent = gameState.player1;
    player2NameDisplay.textContent = gameState.player2;

    // 3. Hide setup and Show the game section
    playerSetup.style.display = 'none';
    gameSection.style.display = 'block';

    // 4. Reset the state for the first round using the current nextStarter
    restartRound(false); // Do not change starter yet
}

/**
 * Resets the board state for a new round, keeping scores/names.
 * @param {boolean} changeStarter - True if the starting player should alternate.
 */
function restartRound(changeStarter = true) {
    gameState.board.fill("");
    gameState.gameActive = true;
    
    // ⭐ NEW FEATURE LOGIC: Determine the starting player
    if (changeStarter) {
        gameState.nextStarter = gameState.nextStarter === 'X' ? 'O' : 'X';
    }
    gameState.currentPlayer = gameState.nextStarter; 

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('X', 'O');
    });
    
    updateGameStatus(`${getPlayerName(gameState.currentPlayer)}'s turn (${gameState.currentPlayer})`);
}

/**
 * Handles a click on a cell.
 * @param {Event} event - The click event object.
 */
function handleCellClick(event) {
    const cellIndex = event.target.dataset.index;

    if (!gameState.gameActive || gameState.board[cellIndex] !== "") {
        return;
    }

    gameState.board[cellIndex] = gameState.currentPlayer;
    event.target.textContent = gameState.currentPlayer;
    event.target.classList.add(gameState.currentPlayer); 

    if (checkForWin()) {
        endGame(false); // Win
    } else if (checkForDraw()) {
        endGame(true); // Draw
    } else {
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        updateGameStatus(`${getPlayerName(gameState.currentPlayer)}'s turn (${gameState.currentPlayer})`);
    }
}

// --- Game Logic Helpers ---

/**
 * Checks if the current player has won.
 */
function checkForWin() {
    return WIN_CONDITIONS.some(condition => {
        const [a, b, c] = condition;
        const currentMarker = gameState.board[a];
        
        return currentMarker && currentMarker === gameState.board[b] && currentMarker === gameState.board[c];
    });
}

/**
 * Checks if the board is full (Draw).
 */
function checkForDraw() {
    return !gameState.board.includes("");
}

/**
 * Ends the current game round (Win or Draw).
 */
function endGame(isDraw) {
    gameState.gameActive = false;
    
    if (isDraw) {
        updateGameStatus(`It's a draw!`);
    } else {
        const winnerName = getPlayerName(gameState.currentPlayer);
        updateGameStatus(`${winnerName} wins! 🎉`);
        updateScore(gameState.currentPlayer);
    }
    
    // Automatically start the next round with the alternating starter
    setTimeout(() => {
        restartRound(true); 
    }, 1500); // Give players 1.5 seconds to see the result
}

/**
 * Updates the scoreboard in the UI.
 */
function updateScore(marker) {
    gameState.scores[marker] += 1;

    if (marker === 'X') {
        scorePlayer1.textContent = gameState.scores.X;
    } else {
        scorePlayer2.textContent = gameState.scores.O;
    }
}

/**
 * Helper to get the full name based on the marker.
 */
function getPlayerName(marker) {
    return marker === 'X' ? gameState.player1 : gameState.player2;
}

/**
 * Helper to update the main status text.
 */
function updateGameStatus(message) {
    gameStatus.textContent = message;
}