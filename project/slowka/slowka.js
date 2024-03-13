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
  "różowy",
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
  "Republika Południowej Afryki",
  "kanada",
  "chiny",
  "japonia",
  "indie",
  "rosja",
  "brazylia",
  "argentyna",
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
let lastUserMoveSlowka;
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
    lastUserMoveSlowka = userId;
  }
});
let personAmout;
socket.on("personAmoutSLOWKA", (receivedPersonAmout) => {
  if (receivedPersonAmout == 2) {
    gameContainer.classList.remove("hidden");
    btnStartGame.classList.add("hidden");
    // nextMove.classList.remove("hidden");
    personAmout = "2";
    lastUserMoveSlowka = socket.id;

    $(".amountWin-js").addClass("hidden");

    if (!$(".startBtnContainer").hasClass("hidden")) {
      $(".startBtnContainer").addClass("hidden");
    }
  }
});

socket.on("gameStartSLOWKA", (message) => {
  if (!waitingRoom.classList.contains("hidden")) {
    waitingRoom.classList.add("hidden");
    // nextMove.classList.remove("hidden");
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
  if (data.length == 1) {
  } else if (data.length == 2) {
    nextMove.classList.remove("hidden");

    let P1 = data[0];
    let P2 = data[1];
    let yourWord;
    let opponentWord;
    if (P1[3] != socket.id) {
      yourWord = P1;
      opponentWord = P2;
    } else if (P2[3] != socket.id) {
      yourWord = P2;
      opponentWord = P1;
    }
    yourWordS = yourWord[1];
    opponentWordS = opponentWord[1];
    $(".chooseWordForYourOpponent-js").addClass("hidden");
    $(".game-container-StartGame-js").removeClass("hidden");
    if (yourWord[0] == "colors") {
      $(".categoryName-js")[0].textContent = "Kolor";
    } else if (yourWord[0] == "animals") {
      $(".categoryName-js")[0].textContent = "Zwierzę";
    } else {
      $(".categoryName-js")[0].textContent = "Kraj";
    }
    let wordToShow = yourWordS.split(" ");
    for (let j = 0; j < wordToShow.length; j++) {
      let word = wordToShow[j];
      let containerElement = document.createElement("div");
      containerElement.classList.add(
        `game-container-StartGame-container-letters-lettersConatainer`
      );
      for (let i = 0; i < word.length; i++) {
        let divElement = document.createElement("div");
        let pElement = document.createElement("p");
        divElement.classList.add(
          "game-container-StartGame-container-letters-lettersConatainer-letter"
        );
        pElement.classList.add(
          "game-container-StartGame-container-letters-lettersConatainer-letter-p"
        );
        pElement.classList.add("pElement-js");
        pElement.setAttribute("id", `element${i}`);
        divElement.appendChild(pElement);
        containerElement.append(divElement);
      }
      StartGameContainer.appendChild(containerElement);
    }
  }
});

$(".tryGuessWord-js").on("click", function (e) {
  if (lastUserMoveSlowka != socket.id) {
    let yourProposition = guessWordInput.value.replace(/ /g, "");
    let x = 0;
    let yourWord = yourWordS.replace(/ /g, "");
    if (yourProposition != "") {
      let yourPropositionArr = yourProposition.toLowerCase().split("");
      let yourWordArr = yourWord.toLowerCase().split("");
      let pElementAll = document.querySelectorAll(".pElement-js");
      nextMove.innerText = "Poczekaj na ruch twojego przeciwnika";
      for (let i = 0; i < yourPropositionArr.length; i++) {
        if (
          yourPropositionArr[i] == yourWordArr[i] &&
          yourPropositionArr[i] != " "
        ) {
          pElementAll[i].textContent = yourPropositionArr[i];
          x++;
        } else if (yourPropositionArr[i] == " ") {
          continue;
        }
      }
    }

    guessWordInput.value = "";
    let percent = parseInt((x / yourWord.length) * 100);
    let gameRoomId = roomId[0];
    let userId = socket.id;
    data = [percent, gameRoomId, userId];
    if (percent == "100") {
      socket.emit("playerResultGameEndSLOWKA", {
        gameRoomId: gameRoomId,
        userId: userId,
        result: "win",
      });
      socket.emit("addWin", "SLOWKA");

      gameResultWon.classList.remove("hidden");
      nextMove.classList.add("hidden");
    }
    socket.emit("gameMoveSLOWKA", data);
  }
});

socket.on("setPercentSLOWKA", (data) => {
  let userId = data[2];
  let opponentPercent = data[0];
  if (socket.id != userId) {
    $(".yourOpponentStatus-js")[0].textContent = `${opponentPercent}%`;
    nextMove.innerText = "Twój ruch!";
  }
  lastUserMoveSlowka = userId;
});

// BT obsługa po grze

socket.on("secondPlayerResultSLOWKA", (data) => {
  $(".result-js").addClass("hidden");
  let gameRoomId = data.gameRoomId;
  let winnerUserId = data.userId;
  let result = data.result;
  if (gameResult.classList.contains("hidden")) {
    gameResult.classList.remove("hidden");
  }
  if (winnerUserId != socket.id && result == "win") {
    gameResultLose.classList.remove("hidden");
    nextMove.classList.add("hidden");
    $(".yourOpponentStatus-js")[0].textContent = `0%`;
  }
});

$(".playAgain-js").on("click", function (e) {
  if (!$(".playAgain-js").hasClass("onePlayer")) {
    let gameRectangle = $(e.currentTarget).parent().parent();
    gameRectangle.addClass("hidden");
    gameResult.classList.add("hidden");
    moveHistory = [];
    const userId = socket.id;
    socket.emit("playAgainSLOWKA", {
      roomName: roomId[0],
      userId,
    });
    socket.on("yourOpponentLeftTheGameSLOWKA", (status) => {
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
    $(".chooseCategoryForYourOpponent-js").removeClass("hidden");
    $(".game-container-StartGame-js").addClass("hidden");
    $(".game-container-StartGame-container-letter-js")[0].textContent = [];
    $(".yourOpponentStatus-js")[0].textContent = `0%`;
  }
});

socket.on("playOnceAgainSLOWKA", (status) => {
  if (status == "yes") {
    $(".waitForYourOpponent-js").addClass("hidden");
  }

  // Tutaj możesz wykonywać inne działania związane z otrzymanym ID pokoju
});

$(".changeGame-js").on("click", function (e) {
  socket.emit("PlayerLeftRoomSLOWKA", roomId[0]);
  window.location.href = "./../choose-game/index.html";
});

$(".newGame-js").on("click", function (e) {
  socket.emit("PlayerLeftRoomSLOWKA", roomId[0]);
  location.reload();
});
