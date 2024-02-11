const socket = io("ws://localhost:3500");

let ulList = document.querySelector(".ulList");
let inputMessage = document.querySelector(".inputMessage");
let btnSend = document.querySelector(".btnSend");

const sendMessage = (e) => {
  let messageText = inputMessage.value;
  if (inputMessage.value != "") {
    data = [inputMessage.value, socket.id];
    socket.emit("sendMessage", data);
    inputMessage.value = "";
  }
};

btnSend.addEventListener("click", sendMessage);

socket.on("messageSent", (data) => {
  let message = data[0];
  let idUserSent = data[1];
  let timeSent = data[2];
  let liElement = document.createElement("li");
  let divElement = document.createElement("div");
  let pElement = document.createElement("p");
  liElement.classList.add("liElement");
  divElement.classList.add("divElement");
  pElement.classList.add("pElement");
  if (idUserSent == socket.id) {
    liElement.classList.add("liElement-your");
    divElement.classList.add("divElement-your");
  }
  liElement.textContent = message;
  pElement.textContent = timeSent;
  divElement.appendChild(liElement);
  divElement.appendChild(pElement);
  ulList.appendChild(divElement);
});

function przewijDoDolu() {
  const kontenerWiadomosci = document.querySelector(".chat-container-messages");
  kontenerWiadomosci.scrollTop = kontenerWiadomosci.scrollHeight;
}

// Wywołanie funkcji przewijania
przewijDoDolu();
let userId = socket.id;
setTimeout(() => {
  socket.emit("joinChat", userId);
}, "500");

socket.on("messageHistory", (history) => {
  let userJoinId = history;
  for (let i = 0; i < history[0].length; i++) {
    displayMessage(history[0][i]);
  }
});

function displayMessage(data) {
  let message = data[0];
  let idUserSent = data[1];
  let timeSent = data[2];
  let liElement = document.createElement("li");
  let divElement = document.createElement("div");
  let pElement = document.createElement("p");
  liElement.classList.add("liElement");
  divElement.classList.add("divElement");
  pElement.classList.add("pElement");
  if (idUserSent == socket.id) {
    liElement.classList.add("liElement-your");
    divElement.classList.add("divElement-your");
  }
  liElement.textContent = message;
  pElement.textContent = timeSent;
  divElement.appendChild(liElement);
  divElement.appendChild(pElement);
  ulList.appendChild(divElement);
}
