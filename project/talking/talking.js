const socket = io("ws://localhost:3500");

let ulList = document.querySelector(".ulList");
let inputMessage = document.querySelector(".inputMessage");
let btnSend = document.querySelector(".btnSend");
const sendMessage = (e) => {
  let messageText = inputMessage.value;
  if (inputMessage.value != "") {
    socket.emit("sendMessage", inputMessage.value);
    inputMessage.value = "";
  }
};

btnSend.addEventListener("click", sendMessage);

socket.on("messageSent", (message) => {
  let liElement = document.createElement("li");
  liElement.classList.add("liElement");
  liElement.textContent = message;
  console.log(liElement);
  ulList.appendChild(liElement);
});

function przewijDoDolu() {
    const kontenerWiadomosci = document.querySelector('.chat-container-messages');
    kontenerWiadomosci.scrollTop = kontenerWiadomosci.scrollHeight;
}

// Wywołanie funkcji przewijania
przewijDoDolu();
