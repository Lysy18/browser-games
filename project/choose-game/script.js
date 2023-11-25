// // const socket = io("ws://localhost:3500", {});

// let clientId = localStorage.getItem("clientId");

// let IdArr = [];
// function generateUniqueId() {
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   const idLength = 6;
//   let generatedId;

//   do {
//     generatedId = "";
//     for (let i = 0; i < idLength; i++) {
//       const randomIndex = Math.floor(Math.random() * characters.length);
//       generatedId += characters.charAt(randomIndex);
//     }
//   } while (IdArr.includes(generatedId));

//   return generatedId;
// }

// console.log("test");
// if (!clientId) {
//   clientId = generateUniqueId(); // Implementuj funkcję generateUniqueId() zgodnie z własnymi potrzebami
//   localStorage.setItem("clientId", clientId);
// }
// // socket.emit("setClientId", clientId);
