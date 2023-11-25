const socket = io("ws://localhost:3500");
let userEmail = document.querySelector("#userEmail");
let userPassword = document.querySelector("#userPassword");
let btnLogIn = document.querySelector(".login");
let btnSignIn = document.querySelector(".signIn");
const testFun = (e) => {
  e.preventDefault();
  socket.emit("getUserLoginInfo", userEmail.value, userPassword.value);
};

btnLogIn.addEventListener("click", testFun);
