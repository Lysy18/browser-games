const socket = io("ws://localhost:3500");
let userEmail = document.querySelector("#userEmail");
let userPassword = document.querySelector("#userPassword");
let btnLogIn = document.querySelector(".login");
let btnSignIn = document.querySelector(".signIn");
const checkPassword = (password) => {
  const regex = /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[a-z])(?=.*[A-Z])/;
  return regex.test(password);
};
function checkMail(email) {
  var wzorzec = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return wzorzec.test(email);
}
const signInUser = (e) => {
  e.preventDefault();
  let password = userPassword.value;
  isPasswordCorect = checkPassword(password);
  let mail = userEmail.value;
  isMailCorect = checkMail(mail);

  if (isPasswordCorect && isMailCorect) {
    socket.emit(
      "getUserLoginInfo",
      userEmail.value,
      userPassword.value,
      "signin"
    );
  } else {
  }
};

const loginUser = (e) => {
  e.preventDefault();
  let password = userPassword.value;
  isPasswordCorect = checkPassword(password);
  let mail = userEmail.value;
  isMailCorect = checkMail(mail);

  if (isPasswordCorect && isMailCorect) {
    socket.emit(
      "getUserLoginInfo",
      userEmail.value,
      userPassword.value,
      "login"
    );
  }
};
btnSignIn.addEventListener("click", signInUser);
btnLogIn.addEventListener("click", loginUser);
