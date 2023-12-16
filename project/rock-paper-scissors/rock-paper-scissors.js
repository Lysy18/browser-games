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
