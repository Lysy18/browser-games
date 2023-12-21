const socket = io("ws://localhost:3500");
let bestGame = document.querySelectorAll(".bestGame-js");

function znajdzNajwiekszeIndeksy(tablica) {
  if (!Array.isArray(tablica) || tablica.length === 0) {
    return []; // Zwróć pustą tablicę, jeśli tablica jest pusta lub nie jest tablicą.
  }

  let najwiekszaWartosc = tablica[0].game_amount;
  let indeksyNajwiekszych = [0];

  for (let i = 1; i < tablica.length; i++) {
    const aktualnaWartosc = tablica[i].game_amount;

    if (aktualnaWartosc > najwiekszaWartosc) {
      najwiekszaWartosc = aktualnaWartosc;
      indeksyNajwiekszych = [i];
    } else if (aktualnaWartosc === najwiekszaWartosc) {
      indeksyNajwiekszych.push(i);
    }
  }

  return indeksyNajwiekszych;
}

socket.on("bestGame", (data) => {
  console.log(data);
  let index = znajdzNajwiekszeIndeksy(data);
  index.sort((a, b) => a - b);
  console.log(index);
  for (const element of index) {
    if (typeof element === "number" && !isNaN(element)) {
      let game = data[element].game_name;
      for (let i = 0; i < bestGame.length; i++) {
        gameAttr = bestGame[i].getAttribute("data-game");
        console.log;
        if (game == gameAttr && (gameAttr != "talk" || gameAttr != "-")) {
          console.log(game, "game", gameAttr);
          bestGame[i].classList.remove("hidden");
        }
      }
      // Wykonaj operacje tylko dla liczb
      console.log(`To jest liczba: ${element}`);
    }
  }
  //   for(let i=)
});
