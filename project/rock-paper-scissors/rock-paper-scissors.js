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
let amountWin = 1;
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
    } else {
      $(".result-js").removeClass("hidden");
      if (yourResult == "1") {
        $(".resultParagraph-js")[0].textContent = "Wygrałeś!";
      } else if (yourResult == "0") {
        $(".resultParagraph-js")[0].textContent = "Przegrałeś";
      } else {
        $(".resultParagraph-js")[0].textContent = "Remis!";
      }
      setTimeout(() => {
        $(".result-js").addClass("hidden");
      }, "2000");
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
  $(".result-js").addClass("hidden");
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

$(".playAgain-js").on("click", function (e) {
  if (!$(".playAgain-js").hasClass("onePlayer")) {
    console.log(!$(".playAgain-js").hasClass("onePlayer"));
    let gameRectangle = $(e.currentTarget).parent().parent();
    gameRectangle.addClass("hidden");
    console.log(gameRectangle);
    gameResult.classList.add("hidden");
    moveHistory = [];
    const userId = socket.id;
    socket.emit("playAgainRPS", {
      roomName: roomId[0],
      userId,
    });
    socket.on("yourOpponentLeftTheGameRPS", (status) => {
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
    $("#yourScore")[0].textContent = "0";
    $("#yourOpponent")[0].textContent = "0";
    $("#game-status").addClass("hidden");
  }
  console.log(personAmout);
});

socket.on("playOnceAgainRPS", (status) => {
  console.log(status, "status");
  if (status == "yes") {
    $(".waitForYourOpponent-js").addClass("hidden");
    console.log("playAgain ZJeby");
  }

  // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
});

$(".changeGame-js").on("click", function (e) {
  console.log("changeGame", roomId[0]);
  socket.emit("PlayerLeftRoomRPS", roomId[0]);
  window.location.href = "./../choose-game/index.html";
});

$(".newGame-js").on("click", function (e) {
  socket.emit("PlayerLeftRoomRPS", roomId[0]);
  location.reload();
});
