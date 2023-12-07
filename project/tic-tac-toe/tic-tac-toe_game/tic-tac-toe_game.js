const socket = io("ws://localhost:3500");

let btnStartGame = document.querySelector(".startBtn-js");
let gameContainer = document.querySelector(".game-container-js");
let waitingRoom = document.querySelector(".waitingRoom-js");
let nextMove = document.querySelector(".nextMove-js");

const createRoomFun = () => {
  socket.emit("createRoom", "tak");
  socket.on("personAmout", (receivedPersonAmout) => {
    console.log(`receivedPersonAmout: ${receivedPersonAmout}`);

    if (receivedPersonAmout == 1) {
      if (!btnStartGame.classList.contains("hidden")) {
        btnStartGame.classList.add("hidden");
        waitingRoom.classList.remove("hidden");
        console.log("1!!!!!!!!!!!!!!!!!!!!!!!!");
        gameContainer.classList.remove("hidden");
        nextMove.innerText = "Twój ruch";
      }
    }

    // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
  });
};

btnStartGame.addEventListener("click", createRoomFun);

let roomId = [];

socket.on("roomId", (receivedRoomId) => {
  roomId.push(receivedRoomId);
  console.log(`Room ID received: ${roomId}`);
  // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
});
socket.on("userMove", (userId) => {
  if (userId == socket.id) {
    nextMove.innerText = "Twój ruch";
  }
});

const cells = document.querySelectorAll(".cell");
let currentPlayer = "X";
let moveHistory = [];

let personAmout;
socket.on("personAmout", (receivedPersonAmout) => {
  console.log(`receivedPersonAmout: ${receivedPersonAmout}`);
  if (receivedPersonAmout == 2) {
    gameContainer.classList.remove("hidden");
    btnStartGame.classList.add("hidden");
    console.log("test2");
    // socket.emit("secondUserJoined", receivedPersonAmout);
    personAmout = "2";
  }
});

socket.on("gameStart", (message) => {
  console.log(`gameStart: ${message}`);
  if (!waitingRoom.classList.contains("hidden")) {
    waitingRoom.classList.add("hidden");
  }
});

// Utwórz planszę do gry (tablicę 3x3)
const board = Array.from(Array(3), () => Array(3).fill(""));
let test = document.querySelector(".test");
// Funkcja obsługująca kliknięcie w komórkę
function handleCellClick(event) {
  if (moveHistory.length == 0) {
    currentPlayer = "X";
    moveHistory.unshift(currentPlayer);
  } else {
    if (moveHistory[0] == "X") {
      currentPlayer = "0";
      moveHistory.unshift(currentPlayer);
      console.log(moveHistory);
    } else {
      currentPlayer = "X";
      moveHistory.unshift(currentPlayer);
      console.log(moveHistory);
    }
  }
  nextMove.innerText = "Poczekaj na ruch twojego przeciwnika";

  // if (nextMove.innerText == "Twój ruch") {
  //   console.log("1Move");
  // } else if ((nextMove.innerText = "Poczekaj na ruch twojego przeciwnika")) {
  //   nextMove.innerText = "Twój ruch";
  //   console.log("2Move");
  // }

  // currentPlayer = currentPlayer === "X" ? "O" : "X";
  // currentPlayer = currentPlayer === "X" ? "O" : "X";

  const cellIndex = event.target.dataset.index;
  console.log(roomId[0]);
  let gameRoomId = roomId[0];
  // Sprawdź, czy komórka jest pusta
  if (board[Math.floor(cellIndex / 3)][cellIndex % 3] === "") {
    // Zaktualizuj planszę i wyślij informację o ruchu do serwera
    board[Math.floor(cellIndex / 3)][cellIndex % 3] = currentPlayer;
    console.log(socket.id);
    const userId = socket.id;
    socket.emit("move", {
      cellIndex,
      player: currentPlayer,
      gameRoomId,
      userId,
    });

    // Zaktualizuj interfejs gracza
    event.target.textContent = currentPlayer;

    // Sprawdź, czy jest zwycięzca
    // if (checkWinner()) {
    //   // alert(`Gracz ${currentPlayer} wygrywa!`);
    //   // resetGame();
    // } else if (isBoardFull()) {
    //   // Sprawdź, czy plansza jest pełna (remis)
    //   // alert("Remis!");
    //   // resetGame();
    // } else {
    //   // Zmień aktualnego gracza
    // }
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
socket.on("opponentMove", ({ cellIndex, player, lastUserMove }) => {
  // Zaktualizuj planszę i interfejs na podstawie otrzymanego ruchu przeciwnika

  console.log(cellIndex, player, lastUserMove, "lastUserMove");
  board[Math.floor(cellIndex / 3)][cellIndex % 3] = player;
  cells[cellIndex].textContent = player;
  if (player == "X") {
    moveHistory.unshift(player);
    console.log(moveHistory);
  } else {
    moveHistory.unshift(player);
    console.log(moveHistory);
  }

  console.log(socket.id, lastUserMove);

  if (lastUserMove == socket.id) {
    console.log("wykonałeś ruch");
    nextMove.innerText = "Poczekaj na ruch swojego przeciwnika";
  }
  if (lastUserMove != socket.id) {
    console.log("twój ruch");
    nextMove.innerText = "Twój ruch!";
  }

  // Sprawdź, czy jest zwycięzca
  // if (checkWinner()) {
  //   alert(`Gracz ${player} wygrywa!`);
  //   resetGame();
  // } else if (isBoardFull()) {
  //   // Sprawdź, czy plansza jest pełna (remis)
  //   alert("Remis!");
  //   resetGame();
  // } else {
  //   // Zmień aktualnego gracza
  // }
});
