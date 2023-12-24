const socket = io("ws://localhost:3500");
let bestGame = document.querySelectorAll(".bestGame-js");

function findIndex(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return []; 
  }

  let biggest = arr[0].game_amount;
  let num = [0];

  for (let i = 1; i < arr.length; i++) {
    const currentValue = arr[i].game_amount;

    if (currentValue > biggest) {
      biggest = currentValue;
      num = [i];
    } else if (currentValue === biggest) {
      num.push(i);
    }
  }

  return num;
}

socket.on("bestGame", (data) => {
  let index = findIndex(data);
  index.sort((a, b) => a - b);
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
    }
  }
});
