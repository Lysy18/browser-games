const socket = io("ws://localhost:3500");
let clientId = localStorage.getItem("clientId");

let IdArr = [];
function generateUniqueId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const idLength = 6;
  let generatedId;

  do {
    generatedId = "";
    for (let i = 0; i < idLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      generatedId += characters.charAt(randomIndex);
    }
  } while (IdArr.includes(generatedId));

  return generatedId;
}

console.log('test')
if (!clientId) {
  clientId = generateUniqueId(); // Implementuj funkcję generateUniqueId() zgodnie z własnymi potrzebami
  localStorage.setItem("clientId", clientId);
}
socket.emit("setClientId", clientId);


let roomsIdArr = [];
function roomsIdGenerate() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const idLength = 6;
  let generatedId;

  do {
    generatedId = "";
    for (let i = 0; i < idLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      generatedId += characters.charAt(randomIndex);
    }
  } while (roomsIdArr.includes(generatedId));

  return generatedId;
}
let ulList = document.querySelector(".ulList-rooms");
for (let i = 0; i < 10; i++) {
  let liElement = document.createElement("li");
  let roomId = roomsIdGenerate();
  liElement.classList.add("li-room");
  liElement.setAttribute("data-id-room", roomId);
  liElement.textContent = roomId;
  // let aHfer = '<a href="./../tic-tac-toe_game/tic-tac-toe_game.html"></a>';
  let aHfer = '<a href="#"></a>';
  ulList.insertAdjacentHTML("beforeend", aHfer);
  ulList.children[i].appendChild(liElement);
  console.log(roomId);
}
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("li-room")) {
    console.log("Clicked element:", e.target);
    // Tworzenie lub dołączanie do pokoju
    // const roomName = e.target.chlidren.getAttribute("data-IdRoom");
    const roomName = "123";
    socket.emit("createRoom", roomName);
    console.log(socket.id);
  }
});
// // Obsługa odbierania wiadomości w pokoju
// socket.on("message", (message) => {
//   console.log("Otrzymano wiadomość:", message);
// });

// // Wysyłanie wiadomości do pokoju po naciśnięciu przycisku
// function sendMessage() {
//   const messageInput = "test";
//   socket.emit("message", roomName, messageInput);
// }
