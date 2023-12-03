const socket = io("ws://localhost:3500");

let btnStartGame = document.querySelector(".startBtn-js");
let gameContainer = document.querySelector(".game-container-js");

const createRoomFun = () => {
  socket.emit("createRoom", "tak");
  gameContainer.classList.remove("hidden");
  btnStartGame.classList.add("hidden");

  console.log("test");
};

btnStartGame.addEventListener("click", createRoomFun);

let roomId = [];

socket.on("roomId", (receivedRoomId) => {
  roomId.push(receivedRoomId);
  console.log(`Room ID received: ${roomId}`);
  // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
});

const cells = document.querySelectorAll(".cell");
let currentPlayer = "X";
let moveHistory = [];

// Utwórz planszę do gry (tablicę 3x3)
const board = Array.from(Array(3), () => Array(3).fill(""));

// Funkcja obsługująca kliknięcie w komórkę
function handleCellClick(event) {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  const cellIndex = event.target.dataset.index;
  console.log(roomId[0]);
  let gameRoomId = roomId[0];
  // Sprawdź, czy komórka jest pusta
  if (board[Math.floor(cellIndex / 3)][cellIndex % 3] === "") {
    // Zaktualizuj planszę i wyślij informację o ruchu do serwera
    board[Math.floor(cellIndex / 3)][cellIndex % 3] = currentPlayer;
    socket.emit("move", { cellIndex, player: currentPlayer, gameRoomId });

    // Zaktualizuj interfejs gracza
    event.target.textContent = currentPlayer;

    // Sprawdź, czy jest zwycięzca
    if (checkWinner()) {
      // alert(`Gracz ${currentPlayer} wygrywa!`);
      // resetGame();
    } else if (isBoardFull()) {
      // Sprawdź, czy plansza jest pełna (remis)
      // alert("Remis!");
      // resetGame();
    } else {
      // Zmień aktualnego gracza
    }
  }
}

// Funkcja sprawdzająca, czy jest zwycięzca
function checkWinner() {
  // Sprawdź wiersze, kolumny i przekątne
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] === currentPlayer &&
      board[i][1] === currentPlayer &&
      board[i][2] === currentPlayer
    ) {
      return true; // Zwycięstwo w wierszu
    }
    if (
      board[0][i] === currentPlayer &&
      board[1][i] === currentPlayer &&
      board[2][i] === currentPlayer
    ) {
      return true; // Zwycięstwo w kolumnie
    }
  }
  if (
    board[0][0] === currentPlayer &&
    board[1][1] === currentPlayer &&
    board[2][2] === currentPlayer
  ) {
    return true; // Zwycięstwo na przekątnej
  }
  if (
    board[0][2] === currentPlayer &&
    board[1][1] === currentPlayer &&
    board[2][0] === currentPlayer
  ) {
    return true; // Zwycięstwo na przekątnej
  }
  return false;
}

// Funkcja sprawdzająca, czy plansza jest pełna (remis)
function isBoardFull() {
  return board.every((row) => row.every((cell) => cell !== ""));
}

// Funkcja resetująca grę
function resetGame() {
  board.forEach((row) => row.fill(""));
  cells.forEach((cell) => (cell.textContent = ""));
  currentPlayer = "X";
}

// Dodaj obsługę kliknięcia do wszystkich komórek
cells.forEach((cell) => cell.addEventListener("click", handleCellClick));

// Obsługa ruchu przeciwnika
socket.on("opponentMove", ({ cellIndex, player }) => {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  // Zaktualizuj planszę i interfejs na podstawie otrzymanego ruchu przeciwnika
  console.log(cellIndex, player);
  board[Math.floor(cellIndex / 3)][cellIndex % 3] = player;
  cells[cellIndex].textContent = player;

  // Sprawdź, czy jest zwycięzca
  if (checkWinner()) {
    alert(`Gracz ${player} wygrywa!`);
    resetGame();
  } else if (isBoardFull()) {
    // Sprawdź, czy plansza jest pełna (remis)
    alert("Remis!");
    resetGame();
  } else {
    // Zmień aktualnego gracza
  }
});
