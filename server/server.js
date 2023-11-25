const http = require("http");
const { Server } = require("socket.io");

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
});

io.on("connection", (socket) => {
  // const staticUserid12312 = roomsIdGenerate();
  socket.on("connect", () => {
    socket.emit("setClientId", clientId);
  });

  // socket.on("setClientId", (clientId) => {
  //   console.log(`Client connected with ID: ${clientId}`);
  //   socket.id = clientId;
  //   // Do something with clientId...
  //   console.log(socket.id);
  // });

  console.log(`User: ${socket.id} connected`);
  // Obsługa stworzenia i dołączenia do pokoju
  socket.on("createRoom", (roomName) => {
    socket.join(roomName);
    console.log(
      `Klient ${socket.id} stworzył/połączył się z pokojem: ${roomName}`
    );
  });

  socket.on("message", (data) => {
    console.log(socket.id, data);
    io.emit(`message`, `${socket.id.substring(0, 5)}: ${data}`);
    io.emit(`id`, `${socket.id.substring(0, 5)}`);
  });

  socket.on("disconnect", () => {
    console.log("Klient odłączony:", socket.id);
  });
});

httpServer.listen(3500, () => console.log("listening on port 3500"));
