const socket = io("ws://localhost:3500");

let btnStartGame = document.querySelector(".startBtn-js");
let gameContainer = document.querySelector(".game-container-js");
let waitingRoom = document.querySelector(".waitingRoom-js");
// let nextMove = document.querySelector(".nextMove-js");
let gameResult = document.querySelector(".gameResult-js");
let gameResultLose = document.querySelector(".gameResultLose-js");
let gameResultDraw = document.querySelector(".gameResultDraw-js");
let gameResultWon = document.querySelector(".gameResultWon-js");

let newGame = document.querySelector(".newGame-js");
let playAgain = document.querySelector(".playAgain-js");
let changeGame = document.querySelector(".changeGame-js");

let gameAction = document.querySelector(".gameAction-js");
let amountWin = 3;
const createRoomFun = () => {
  socket.emit("createRoomRPS", "tak");
  socket.on("personAmoutRPS", (receivedPersonAmout) => {
    if (receivedPersonAmout == 1) {
      if (!btnStartGame.classList.contains("hidden")) {
        btnStartGame.classList.add("hidden");
        waitingRoom.classList.remove("hidden");
        gameContainer.classList.remove("hidden");
      }
      console.log("jeden gracz");
      //   if (!gameResult.classList.contains("hidden")) {
      //     $(".playAgain-js").addClass("onePlayer");
      //   }
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

socket.on("roomIdRPS", (receivedRoomId) => {
  roomId.push(receivedRoomId);
  `Room ID received: ${roomId}`;
  // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
});
socket.on("roomIdRPS", (receivedRoomId) => {
  roomId.push(receivedRoomId);
  `Room ID received: ${roomId}`;
  // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
});
socket.on("userMoveRPS", (userId) => {
  if (userId != socket.id) {
    // nextMove.innerText = "Twój ruch!";
  }
});

const cells = document.querySelectorAll(".cell");
let currentPlayer = "X";
let moveHistory = [];

let personAmout;
socket.on("personAmoutRPS", (receivedPersonAmout) => {
  if (receivedPersonAmout == 2) {
    gameContainer.classList.remove("hidden");
    btnStartGame.classList.add("hidden");
    // nextMove.classList.remove("hidden");
    personAmout = "2";
    console.log("dwa gracz");
    $(".amountWin-js").addClass("hidden");

    if (!$(".startBtnContainer").hasClass("hidden")) {
      $(".startBtnContainer").addClass("hidden");
    }
  }
});

socket.on("gameStartRPS", (message) => {
  if (!waitingRoom.classList.contains("hidden")) {
    waitingRoom.classList.add("hidden");
    // nextMove.classList.remove("hidden");
  }
});

$(".gameAction-js").on("click", function (e) {
  // console.log(`test`, gameAction.id, gameAction);
  // console.log(e.currentTarget);
  let type = e.currentTarget.id;
  let gameRoomId = roomId[0];
  let userId = socket.id;
  socket.emit("userMoveRPS", {
    type,
    gameRoomId,
    userId,
  });
});

socket.on("gameResult", (data) => {
  console.log(data[0][0]);
  if (data.length == 1) {
    if (data[0][0] != socket.id) {
      $(".yourOpponentMadeMove-js").removeClass("hidden");
    } else {
      $(".waitForMoveYourOpponent-js").removeClass("hidden");
    }
  } else {
    $(".yourOpponentMadeMove-js").addClass("hidden");
    $(".waitForMoveYourOpponent-js").addClass("hidden");
    let P1 = data[0];
    let P2 = data[1];
    let yourMove;
    let opponentMove;
    if (P1[0] == socket.id) {
      yourMove = P1;
      opponentMove = P2;
      // console.log(yourMove[1], opponentMove[1]);
    } else if (P2[0] == socket.id) {
      yourMove = P2;
      opponentMove = P1;
    }
    let yourMoveS = yourMove[1];
    let opponentMoveS = opponentMove[1];
    // console.log(yourMoveS);
    let yourResult = determineWinner(yourMoveS, opponentMoveS);
    // console.log(yourResult);
    let yourScore = $("#yourScore")[0].textContent;
    let opponentScore = $("#yourOpponent")[0].textContent;
    if (yourScore == 0 || opponentScore == 0) {
      // console.log("first match");
      $("#game-status").removeClass("hidden");
    }
    console.log(yourResult);
    if (yourResult == "1") {
      yourScore++;
      $("#yourScore")[0].textContent = yourScore;
    } else if (yourResult == "0") {
      opponentScore++;
      $("#yourOpponent")[0].textContent = opponentScore;
    } else if (yourResult == "-") {
    }
    if (yourScore == amountWin) {
      let gameRoomId = roomId[0];
      let userId = socket.id;

      console.log(gameRoomId, userId, "tuuu");
      socket.emit("playerResultGameEndRPS", {
        gameRoomId: gameRoomId,
        userId: userId,
        result: "win",
      });
      gameResultWon.classList.remove("hidden");
    }
  }
});

function determineWinner(playerMove, opponentMove) {
  if (playerMove === opponentMove) {
    return "-";
  }

  if (playerMove === "rock") {
    if (opponentMove === "scissors") {
      return "1";
    } else {
      return "0";
    }
  }

  if (playerMove === "paper") {
    if (opponentMove === "rock") {
      return "1";
    } else {
      return "0";
    }
  }

  if (playerMove === "scissors") {
    if (opponentMove === "paper") {
      return "1";
    } else {
      return "0";
    }
  }
}

socket.on("secondPlayerResultRPS", (data) => {
  let gameRoomId = data.gameRoomId;
  let winnerUserId = data.userId;
  let result = data.result;
  console.log(gameRoomId, winnerUserId, result);
  if (gameResult.classList.contains("hidden")) {
    gameResult.classList.remove("hidden");
  }
  if (winnerUserId != socket.id && result == "win") {
    gameResultLose.classList.remove("hidden");
  }
});
