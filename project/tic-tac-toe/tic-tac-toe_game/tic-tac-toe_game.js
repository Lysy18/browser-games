const socket = io("ws://localhost:3500");

// Obsługa odbierania wiadomości w pokoju
socket.on("message", (message) => {
  console.log("Otrzymano wiadomość:", message);
});

// Wysyłanie wiadomości do pokoju po naciśnięciu przycisku
function sendMessage() {
  //   const messageInput = document.getElementById("messageInput").value;
  const messageInput = "test";
  socket.emit("message", roomName, messageInput);
}
