const socket = io("ws://localhost:3500");
const listaZwierzat = [
  "kot",
  "pies",
  "słoń",
  "żyrafa",
  "tygrys",
  "krokodyl",
  "żółw",
  "pingwin",
  "koń",
  "owca",
  "koza",
  "orzeł",
  "delfin",
  "wąż",
  "papuga",
  "królik",
  "jeleń",
  "mrówka",
  "bóbr",
  "żaba",
];
const listaKolorow = [
  "czerwony",
  "zielony",
  "niebieski",
  "żółty",
  "pomarańczowy",
  "fioletowy",
  "rózowy",
  "czarny",
  "biały",
  "brązowy",
  "szary",
  "turkusowy",
  "indygo",
  "jasnoniebieski",
  "purpurowy",
  "limonkowy",
  "lawendowy",
  "morski",
  "khaki",
  "fuksja",
];
const listaKrajow = [
  "polska",
  "niemcy",
  "francja",
  "włochy",
  "hiszpania",
  "wielka brytania",
  "stany zjednoczone",
  "kanada",
  "chiny",
  "japonia",
  "indie",
  "rosja",
  "brazylia",
  "argentina",
  "australia",
  "egipt",
  "grecja",
  "turcja",
  "meksyk",
  "norwegia",
];

let btnStartGame = document.querySelector(".startBtn-js");
let gameContainer = document.querySelector(".game-container-js");
let waitingRoom = document.querySelector(".waitingRoom-js");
let StartGameContainer = document.querySelector(
  ".game-container-StartGame-container-letter-js"
);

let guessWordInput = document.querySelector(".guessWordInput-js");
let nextMove = document.querySelector(".nextMove-js");
let gameResult = document.querySelector(".gameResult-js");
let gameResultLose = document.querySelector(".gameResultLose-js");
let gameResultDraw = document.querySelector(".gameResultDraw-js");
let gameResultWon = document.querySelector(".gameResultWon-js");

let newGame = document.querySelector(".newGame-js");
let playAgain = document.querySelector(".playAgain-js");
let changeGame = document.querySelector(".changeGame-js");

let gameAction = document.querySelector(".gameAction-js");
const createRoomFun = () => {
  socket.emit("createRoomSLOWKA", "tak");
  socket.on("personAmoutSLOWKA", (receivedPersonAmout) => {
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

socket.on("roomIdSLOWKA", (receivedRoomId) => {
  roomId.push(receivedRoomId);
  `Room ID received: ${roomId}`;
  // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
});

socket.on("userMoveSLOWKA", (userId) => {
  if (userId != socket.id) {
    nextMove.innerText = "Twój ruch!";
  }
});
let personAmout;
socket.on("personAmoutSLOWKA", (receivedPersonAmout) => {
  if (receivedPersonAmout == 2) {
    gameContainer.classList.remove("hidden");
    btnStartGame.classList.add("hidden");
    nextMove.classList.remove("hidden");
    personAmout = "2";
    console.log("dwa gracz");
    $(".amountWin-js").addClass("hidden");

    if (!$(".startBtnContainer").hasClass("hidden")) {
      $(".startBtnContainer").addClass("hidden");
    }
  }
});

socket.on("gameStartSLOWKA", (message) => {
  if (!waitingRoom.classList.contains("hidden")) {
    waitingRoom.classList.add("hidden");
    nextMove.classList.remove("hidden");
  }
});

function losujSlowa(lista, ilosc) {
  if (ilosc > lista.length) {
    return "Ilość słów do losowania jest większa niż dostępna lista.";
  }

  const losoweSlowa = [];
  const kopiaListy = lista.slice(); // Tworzymy kopię listy, aby nie zmieniać oryginalnej.

  for (let i = 0; i < ilosc; i++) {
    const losowyIndex = Math.floor(Math.random() * kopiaListy.length);
    const wylosowaneSlowo = kopiaListy.splice(losowyIndex, 1)[0];
    losoweSlowa.push(wylosowaneSlowo);
  }

  return losoweSlowa;
}

$(".categoryGame-js").on("click", function (e) {
  let category = e.currentTarget.id;
  let words;
  if (category == "animals") {
    words = losujSlowa(listaZwierzat, 3);
  } else if (category == "colors") {
    words = losujSlowa(listaKolorow, 3);
  } else {
    words = losujSlowa(listaKrajow, 3);
  }
  $("#paragrphOne")[0].textContent = words[0];
  $("#paragrphTwo")[0].textContent = words[1];
  $("#paragrphThree")[0].textContent = words[2];
  $(".chooseCategoryForYourOpponent-js").addClass("hidden");
  $(".chooseWordForYourOpponent-js").removeClass("hidden");
  $(".chooseWordForYourOpponent-js").attr("categoryName", category);
});

$(".wordGame-js").on("click", function (e) {
  let category = $(".chooseWordForYourOpponent-js").attr("categoryName");
  let word = e.currentTarget.children[0].textContent;
  let gameRoomId = roomId[0];
  let userId = socket.id;
  data = [category, word, gameRoomId, userId];
  socket.emit("userSetSLOWKA", data);
});
// startGameSLOWKA
let yourWordS;
let opponentWordS;
socket.on("startGameSLOWKA", (data) => {
  console.log(data);
  if (data.length == 1) {
  } else if (data.length == 2) {
    let P1 = data[0];
    let P2 = data[1];
    let yourWord;
    let opponentWord;
    console.log(P1, P2);
    if (P1[3] != socket.id) {
      yourWord = P1;
      opponentWord = P2;
      // console.log(yourMove[1], opponentMove[1]);
    } else if (P2[3] != socket.id) {
      yourWord = P2;
      opponentWord = P1;
    }
    yourWordS = yourWord[1];
    opponentWordS = opponentWord[1];
    console.log("yourWordS:", yourWordS, opponentWordS);
    $(".chooseWordForYourOpponent-js").addClass("hidden");
    $(".game-container-StartGame-js").removeClass("hidden");
    $(".categoryName-js").textContent = yourWordS[0];
    for (let i = 0; i < yourWordS.length; i++) {
      let divElement = document.createElement("div");
      let pElement = document.createElement("p");
      divElement.classList.add(
        "game-container-StartGame-container-letters-letter"
      );
      pElement.classList.add(
        "game-container-StartGame-container-letters-letter-p"
      );
      pElement.classList.add("pElement-js");
      pElement.setAttribute("id", `element${i}`);
      divElement.appendChild(pElement);
      StartGameContainer.appendChild(divElement);
    }
  }
});
// tryGuessWord-js

$(".tryGuessWord-js").on("click", function (e) {
  let yourProposition = guessWordInput.value;
  let yourPropositionArr = yourProposition.toLowerCase().split("");
  let yourWordArr = yourWordS.toLowerCase().split("");
  let pElementAll = document.querySelectorAll(".pElement-js");

  console.log(yourPropositionArr);
  console.log(yourWordArr);
  for (let i = 0; i < yourPropositionArr.length; i++) {
    if (yourPropositionArr[i] == yourWordArr[i]) {
      pElementAll[i].textContent = yourPropositionArr[i];
      console.log(yourPropositionArr[i], pElementAll[i]);
    }
  }

  guessWordInput.value = "";
});

// $(".gameAction-js").on("click", function (e) {
//   // console.log(`test`, gameAction.id, gameAction);
//   // console.log(e.currentTarget);
//   let type = e.currentTarget.id;
//   let gameRoomId = roomId[0];
//   let userId = socket.id;
//   socket.emit("userMoveSLOWKA", {
//     type,
//     gameRoomId,
//     userId,
//   });
// });

// socket.on("gameResult", (data) => {
//   console.log(data[0][0]);
//   if (data.length == 1) {
//     if (data[0][0] != socket.id) {
//       $(".yourOpponentMadeMove-js").removeClass("hidden");
//     } else {
//       $(".waitForMoveYourOpponent-js").removeClass("hidden");
//     }
//   } else {
//     $(".yourOpponentMadeMove-js").addClass("hidden");
//     $(".waitForMoveYourOpponent-js").addClass("hidden");
//     let P1 = data[0];
//     let P2 = data[1];
//     let yourMove;
//     let opponentMove;
//     if (P1[0] == socket.id) {
//       yourMove = P1;
//       opponentMove = P2;
//       // console.log(yourMove[1], opponentMove[1]);
//     } else if (P2[0] == socket.id) {
//       yourMove = P2;
//       opponentMove = P1;
//     }
//     let yourMoveS = yourMove[1];
//     let opponentMoveS = opponentMove[1];
//     // console.log(yourMoveS);
//     let yourResult = determineWinner(yourMoveS, opponentMoveS);
//     // console.log(yourResult);
//     let yourScore = $("#yourScore")[0].textContent;
//     let opponentScore = $("#yourOpponent")[0].textContent;
//     if (yourScore == 0 || opponentScore == 0) {
//       // console.log("first match");
//       $("#game-status").removeClass("hidden");
//     }
//     console.log(yourResult);
//     if (yourResult == "1") {
//       yourScore++;
//       $("#yourScore")[0].textContent = yourScore;
//     } else if (yourResult == "0") {
//       opponentScore++;
//       $("#yourOpponent")[0].textContent = opponentScore;
//     } else if (yourResult == "-") {
//     }
//     if (yourScore == amountWin) {
//       let gameRoomId = roomId[0];
//       let userId = socket.id;

//       console.log(gameRoomId, userId, "tuuu");
//       socket.emit("playerResultGameEndSLOWKA", {
//         gameRoomId: gameRoomId,
//         userId: userId,
//         result: "win",
//       });
//       gameResultWon.classList.remove("hidden");
//     } else {
//       $(".result-js").removeClass("hidden");
//       if (yourResult == "1") {
//         $(".resultParagraph-js")[0].textContent = "Wygrałeś!";
//       } else if (yourResult == "0") {
//         $(".resultParagraph-js")[0].textContent = "Przegrałeś";
//       } else {
//         $(".resultParagraph-js")[0].textContent = "Remis!";
//       }
//       setTimeout(() => {
//         $(".result-js").addClass("hidden");
//       }, "2000");
//     }
//   }
// });

// lysy obsługa po grze

// socket.on("secondPlayerResultSLOWKA", (data) => {
//   $(".result-js").addClass("hidden");
//   let gameRoomId = data.gameRoomId;
//   let winnerUserId = data.userId;
//   let result = data.result;
//   console.log(gameRoomId, winnerUserId, result);
//   if (gameResult.classList.contains("hidden")) {
//     gameResult.classList.remove("hidden");
//   }
//   if (winnerUserId != socket.id && result == "win") {
//     gameResultLose.classList.remove("hidden");
//   }
// });

// $(".playAgain-js").on("click", function (e) {
//   if (!$(".playAgain-js").hasClass("onePlayer")) {
//     console.log(!$(".playAgain-js").hasClass("onePlayer"));
//     let gameRectangle = $(e.currentTarget).parent().parent();
//     gameRectangle.addClass("hidden");
//     console.log(gameRectangle);
//     gameResult.classList.add("hidden");
//     moveHistory = [];
//     const userId = socket.id;
//     socket.emit("playAgainSLOWKA", {
//       roomName: roomId[0],
//       userId,
//     });
//     socket.on("yourOpponentLeftTheGameSLOWKA", (status) => {
//       console.log(status, "status");
//       if (status == "yes") {
//         if (gameResult.classList.contains("hidden")) {
//           $(".yourOpponentLeftTheGame-js").removeClass("hidden");
//         }
//         if (!$(".waitForYourOpponent-js").hasClass("hidden")) {
//           $(".waitForYourOpponent-js").addClass("hidden");
//         }
//       } else {
//         $(".yourOpponentLeftTheGame-js").addClass("hidden");
//       }
//       // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
//     });
//     $(".waitForYourOpponent-js").removeClass("hidden");
//     $("#yourScore")[0].textContent = "0";
//     $("#yourOpponent")[0].textContent = "0";
//     $("#game-status").addClass("hidden");
//   }
//   console.log(personAmout);
// });

// socket.on("playOnceAgainSLOWKA", (status) => {
//   console.log(status, "status");
//   if (status == "yes") {
//     $(".waitForYourOpponent-js").addClass("hidden");
//     console.log("playAgain ZJeby");
//   }

//   // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
// });

// $(".changeGame-js").on("click", function (e) {
//   console.log("changeGame", roomId[0]);
//   socket.emit("PlayerLeftRoomSLOWKA", roomId[0]);
//   window.location.href = "./../choose-game/index.html";
// });

// $(".newGame-js").on("click", function (e) {
//   socket.emit("PlayerLeftRoomSLOWKA", roomId[0]);
//   location.reload();
// });
