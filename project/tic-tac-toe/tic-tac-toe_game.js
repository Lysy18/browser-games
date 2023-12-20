const socket = io("ws://localhost:3500");

let btnStartGame = document.querySelector(".startBtn-js");
let gameContainer = document.querySelector(".game-container-js");
let waitingRoom = document.querySelector(".waitingRoom-js");
let nextMove = document.querySelector(".nextMove-js");
let gameResult = document.querySelector(".gameResult-js");
let gameResultLose = document.querySelector(".gameResultLose-js");
let gameResultDraw = document.querySelector(".gameResultDraw-js");
let gameResultWon = document.querySelector(".gameResultWon-js");

let newGame = document.querySelector(".newGame-js");
let playAgain = document.querySelector(".playAgain-js");
let changeGame = document.querySelector(".changeGame-js");
const createRoomFun = () => {
  socket.emit("createRoom", "tak");
  socket.on("personAmout", (receivedPersonAmout) => {
    if (receivedPersonAmout == 1) {
      if (!btnStartGame.classList.contains("hidden")) {
        btnStartGame.classList.add("hidden");
        waitingRoom.classList.remove("hidden");
        gameContainer.classList.remove("hidden");
      }
      console.log("jeden gracz");
      if (!gameResult.classList.contains("hidden")) {
        $(".playAgain-js").addClass("onePlayer");
      }
    }

    // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
  });
};

btnStartGame.addEventListener("click", createRoomFun);

let roomId = [];

socket.on("roomId", (receivedRoomId) => {
  roomId.push(receivedRoomId);
  `Room ID received: ${roomId}`;
  // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
});
socket.on("userMove", (userId) => {
  if (userId != socket.id) {
    nextMove.innerText = "Twój ruch!";
  }
});

const cells = document.querySelectorAll(".cell");
let currentPlayer = "X";
let moveHistory = [];

let personAmout;
socket.on("personAmout", (receivedPersonAmout) => {
  if (receivedPersonAmout == 2) {
    gameContainer.classList.remove("hidden");
    btnStartGame.classList.add("hidden");
    nextMove.classList.remove("hidden");
    personAmout = "2";
    console.log("dwa gracz");
  }
});

socket.on("gameStart", (message) => {
  if (!waitingRoom.classList.contains("hidden")) {
    waitingRoom.classList.add("hidden");
    nextMove.classList.remove("hidden");
  }
});

// Utwórz planszę do gry (tablicę 3x3)
const board = Array.from(Array(3), () => Array(3).fill(""));
let test = document.querySelector(".test");
// Funkcja obsługująca kliknięcie w komórkę
function handleCellClick(event) {
  if (nextMove.innerText == "Twój ruch!") {
    if (moveHistory.length == 0) {
      currentPlayer = "X";
      moveHistory.unshift(currentPlayer);
    } else {
      if (moveHistory[0] == "X") {
        currentPlayer = "0";
        moveHistory.unshift(currentPlayer);
      } else {
        currentPlayer = "X";
        moveHistory.unshift(currentPlayer);
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
    let gameRoomId = roomId[0];
    // Sprawdź, czy komórka jest pusta
    if (board[Math.floor(cellIndex / 3)][cellIndex % 3] === "") {
      // Zaktualizuj planszę i wyślij informację o ruchu do serwera
      board[Math.floor(cellIndex / 3)][cellIndex % 3] = currentPlayer;
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
      if (checkWinner()) {
        socket.emit("playerResultGameEnd", {
          gameRoomId: gameRoomId,
          userId: userId,
          result: "win",
        });
        gameResultWon.classList.remove("hidden");
      } else if (isBoardFull()) {
        socket.emit("playerResultGameEnd", {
          gameRoomId: gameRoomId,
          userId: userId,
          result: "draw",
        });

        // Sprawdź, czy plansza jest pełna (remis)
        // alert("Remis!");
        // resetGame();
      } else {
        // Zmień aktualnego gracza
      }
    }
  } else {
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
  board[Math.floor(cellIndex / 3)][cellIndex % 3] = player;
  cells[cellIndex].textContent = player;
  if (player == "X") {
    moveHistory.unshift(player);
  } else {
    moveHistory.unshift(player);
  }

  if (lastUserMove == socket.id) {
    nextMove.innerText = "Poczekaj na ruch swojego przeciwnika";
  }
  if (lastUserMove != socket.id) {
    nextMove.innerText = "Twój ruch!";
  }
});

//obsługa końca gry u opponenta
socket.on("secondPlayerResult", (data) => {
  let gameRoomId = data.gameRoomId;
  let winnerUserId = data.userId;
  let result = data.result;
  console.log(gameRoomId, winnerUserId, result);
  if (gameResult.classList.contains("hidden")) {
    gameResult.classList.remove("hidden");
  }

  if (result == "draw") {
    gameResultDraw.classList.remove("hidden");
  } else if (result == "win") {
    if (winnerUserId != socket.id) {
      gameResultLose.classList.remove("hidden");
    }
  }
});

$(".playAgain-js").on("click", function (e) {
  if (!$(".playAgain-js").hasClass("onePlayer")) {
    console.log(!$(".playAgain-js").hasClass("onePlayer"));
    resetGame();
    let gameRectangle = $(e.currentTarget).parent().parent();
    gameRectangle.addClass("hidden");
    console.log();
    gameResult.classList.add("hidden");
    moveHistory = [];
    const userId = socket.id;
    socket.emit("playAgain", {
      roomName: roomId[0],
      userId,
    });
    socket.on("yourOpponentLeftTheGame", (status) => {
      console.log(status, "status");
      if (status == "yes") {
        if (gameResult.classList.contains("hidden")) {
          $(".yourOpponentLeftTheGame-js").removeClass("hidden");
        }
        if (!$(".waitForYourOpponent-js").hasClass("hidden")) {
          $(".waitForYourOpponent-js").addClass("hidden");
        }
      } else {
        $(".yourOpponentLeftTheGame-js").addClass("hidden");
      }
      // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
    });
    $(".waitForYourOpponent-js").removeClass("hidden");
  }
  console.log(personAmout);
});

socket.on("playOnceAgain", (status) => {
  console.log(status, "status");
  if (status == "yes") {
    $(".waitForYourOpponent-js").addClass("hidden");
    console.log("playAgain ZJeby");
  }

  // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
});

$(".changeGame-js").on("click", function (e) {
  resetGame();
  console.log("changeGame", roomId[0]);
  socket.emit("PlayerLeftRoom", roomId[0]);
  window.location.href = "./../choose-game/index.html";
});

$(".newGame-js").on("click", function (e) {
  socket.emit("PlayerLeftRoom", roomId[0]);
  location.reload();
});
