const http = require("http");
const { Server } = require("socket.io");
const { join } = require("node:path");

const httpServer = http.createServer();
const { createClient } = require("@supabase/supabase-js");

// Zastąp poniższe dane swoimi danymi z Supabase
const supabaseUrl = "https://tpiobmfcjontnvmvkrzo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaW9ibWZjam9udG52bXZrcnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA5MTQyODEsImV4cCI6MjAxNjQ5MDI4MX0.5JcyQimgLc0EmirbcpiqDmO3hMAimMrWR1KoEVDWQWM";
const supabase = createClient(supabaseUrl, supabaseKey);

let rooms = [];
let roomsAttributes = {};
let lastUserMove;
let onceAgain = [];

//talking
let messageHistory = [];

//RPS
let roomsRPS = [];
let roomsAttributesRPS = {};
let gameMemoryRPS = [];
let onceAgainRPS = [];
//SLOWKA
let roomsSLOWKA = [];
let roomsAttributesSLOWKA = {};
let gameMemorySLOWKA = [];
let onceAgainSLOWKA = [];
let lastUserMoveSlowka;

async function generateUniqueRoomName(game) {
  const adjectives = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"];
  const nouns = ["Lion", "Tiger", "Bear", "Elephant", "Giraffe", "Zebra"];

  let uniqueRoomName = "";

  do {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    uniqueRoomName = `${adjective}-${noun}`;

    // Sprawdź, czy nazwa pokoju jest unikalna
    // Jeżeli jest unikalna, dodaj ją do tablicy i zwróć nazwę
    if ((game = "") && !rooms.includes(uniqueRoomName)) {
      rooms.push(uniqueRoomName);
      return uniqueRoomName;
    } else if ((game = "RPS") && !roomsRPS.includes(uniqueRoomName)) {
      roomsRPS.push(uniqueRoomName);
      return uniqueRoomName;
    } else if ((game = "SLOWKO") && !roomsSLOWKO.includes(uniqueRoomName)) {
      roomsSLOWKO.push(uniqueRoomName);
      return uniqueRoomName;
    }

    // Jeżeli nazwa już istnieje, ponów próbę generacji
  } while (true);
}

const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
  connectionStateRecovery: {},
  maxDisconnectionDuration: 2 * 60 * 1000,
  skipMiddlewares: true,
});
io.on("connection", (socket) => {
  console.log(`User: ${socket.id} connected`);

  socket.on("createRoom", async () => {
    const roomWithOnePerson = findRoomWithOccupancy(1);

    if (roomWithOnePerson) {
      // Jeżeli jest pokój z jedną osobą, dołącz do niego i zaktualizuj dane
      socket.join(roomWithOnePerson);
      updateOccupancy(roomWithOnePerson, 2);
      console.log(`Klient ${socket.id} dołączył do: ${roomWithOnePerson}`);
      io.to(roomWithOnePerson).emit("personAmout", "2");
      io.to(roomWithOnePerson).emit("gameStart", "start");
      io.to(roomWithOnePerson).emit("yourOpponentLeftTheGame", "");

      io.to(roomWithOnePerson).emit("roomId", roomWithOnePerson);
      lastUserMove = socket.id;
      io.to(roomWithOnePerson).emit("userMove", lastUserMove);
    } else {
      // Jeżeli nie ma pokoju z jedną osobą lub są już dwa klienty w pokoju
      const generatedRoomName = await generateUniqueRoomName();

      if (generatedRoomName) {
        // Jeżeli udało się wygenerować unikalną nazwę pokoju, dodaj do roomsAttributes
        addRoomToAttributes(generatedRoomName, 1);
        socket.join(generatedRoomName);
        console.log(
          `Klient ${socket.id} stworzył/połączył się z pokojem: ${generatedRoomName}`
        );
        io.to(generatedRoomName).emit("personAmout", "1");
        io.to(generatedRoomName).emit("roomId", generatedRoomName);
      }
    }
  });

  socket.on("move", ({ cellIndex, player, gameRoomId, userId }) => {
    console.log("______________DUPA_____________________");
    console.log(lastUserMove, socket.id);
    if (lastUserMove == socket.id) {
      // console.log("duplikujesz ruch");
    } else {
      // console.log("good move broooo");
      lastUserMove = userId;
      io.to(gameRoomId).emit("opponentMove", {
        cellIndex,
        player,
        lastUserMove,
      });
      // io.to(roomWithOnePerson).emit("userMove", "your oponent");
    }
    // console.log(cellIndex, player, gameRoomId, userId);
  });

  socket.on("playerResultGameEnd", (data) => {
    console.log("Otrzymane dane od klienta:", data);
    let gameRoomId = data.gameRoomId;
    let userId = data.userId;
    let result = data.result;
    // if (socket.id != userId) {
    console.log(`${userId} Wygrał`, result, gameRoomId);
    console.log(socket.id, userId);
    if (result == "win") {
      io.to(gameRoomId).emit("secondPlayerResult", data);
    } else if (result == "draw") {
      io.to(gameRoomId).emit("secondPlayerResult", data);
    }
    // }
  });

  socket.on("PlayerLeftRoom", (roomName) => {
    console.log(roomsAttributes[roomName].occupancy, roomName, "test");

    if (roomsAttributes[roomName].occupancy == 2) {
      socket.leave(roomName);
      io.to(roomName).emit("personAmout", "1");
      io.to(roomName).emit("yourOpponentLeftTheGame", "yes");

      updateOccupancy(roomName, 1);
      console.log(roomsAttributes[roomName].occupancy, roomName);
    } else {
      io.to(roomName).emit("personAmout", "0");
      updateOccupancy(roomName, 0);
      socket.leave(roomName);
      console.log(roomsAttributes[roomName].occupancy, roomName);
    }
  });

  socket.on("playAgain", ({ roomName, userId }) => {
    console.log(roomName, userId);
    onceAgain.push(userId);
    console.log(`______________${onceAgain}`);
    if (onceAgain.length == 2) {
      io.to(roomName).emit("playOnceAgain", "yes");
      onceAgain = [];
      console.log("Gra zaczyna się na nowo Ci sami gracze", onceAgain.length);
    }
    console.log(onceAgain.length);
  });

  // Dodaj funkcję, która znajduje pokój z określoną ilością osób
  function findRoomWithOccupancy(occupancy) {
    for (const roomName in roomsAttributes) {
      if (roomsAttributes[roomName].occupancy === occupancy) {
        return roomName;
      }
    }
    return null;
  }

  // Dodaj funkcję, która aktualizuje ilość osób w danym pokoju
  function updateOccupancy(roomName, newOccupancy) {
    roomsAttributes[roomName].occupancy = newOccupancy;
  }

  // Dodaj funkcję, która dodaje pokój do roomsAttributes
  function addRoomToAttributes(roomName, occupancy) {
    roomsAttributes[roomName] = { occupancy };
  }

  //talking lysy

  socket.on("joinChat", (userId) => {
    console.log(userId, socket.id);
    data = [messageHistory, socket.id];
    socket.emit("messageHistory", data);
  });

  socket.on("sendMessage", (data) => {
    console.log(data, "test");
    messageHistory.push(data); // Dodaj nową wiadomość do historii
    if (messageHistory.length > 100) {
      // Opcjonalnie ogranicz rozmiar historii
      messageHistory.shift();
    }
    io.emit("messageSent", data);
  });

  //lysy RPS
  socket.on("createRoomRPS", async () => {
    const roomWithOnePerson = findRoomWithOccupancyRPS(1);
    console.log("test");
    if (roomWithOnePerson) {
      // Jeżeli jest pokój z jedną osobą, dołącz do niego i zaktualizuj dane
      socket.join(roomWithOnePerson);
      updateOccupancyRPS(roomWithOnePerson, 2);
      console.log(`Klient ${socket.id} dołączył do: ${roomWithOnePerson}`);
      io.to(roomWithOnePerson).emit("personAmoutRPS", "2");
      io.to(roomWithOnePerson).emit("gameStartRPS", "start");
      io.to(roomWithOnePerson).emit("yourOpponentLeftTheGameRPS", "");

      io.to(roomWithOnePerson).emit("roomIdRPS", roomWithOnePerson);
      // lastUserMove = socket.id;
      // io.to(roomWithOnePerson).emit("userMoveRPS", lastUserMove);
    } else {
      // Jeżeli nie ma pokoju z jedną osobą lub są już dwa klienty w pokoju
      const generatedRoomName = await generateUniqueRoomName("RPS");

      if (generatedRoomName) {
        // Jeżeli udało się wygenerować unikalną nazwę pokoju, dodaj do roomsAttributes
        addRoomToAttributesRPS(generatedRoomName, 1);
        socket.join(generatedRoomName);
        console.log(
          `Klient ${socket.id} stworzył/połączył się z pokojem: ${generatedRoomName}`
        );
        io.to(generatedRoomName).emit("personAmoutRPS", "1");
        io.to(generatedRoomName).emit("roomIdRPS", generatedRoomName);
      }
    }
  });
  // Dodaj funkcję, która znajduje pokój z określoną ilością osób
  function findRoomWithOccupancyRPS(occupancy) {
    for (const roomName in roomsAttributesRPS) {
      if (roomsAttributesRPS[roomName].occupancy === occupancy) {
        return roomName;
      }
    }
    return null;
  }

  // Dodaj funkcję, która aktualizuje ilość osób w danym pokoju
  function updateOccupancyRPS(roomName, newOccupancy) {
    roomsAttributesRPS[roomName].occupancy = newOccupancy;
  }

  // Dodaj funkcję, która dodaje pokój do roomsAttributes
  function addRoomToAttributesRPS(roomName, occupancy) {
    roomsAttributesRPS[roomName] = { occupancy };
  }

  socket.on("userMoveRPS", ({ type, gameRoomId, userId }) => {
    console.log("______________DUPA_____________________");
    // console.log(lastUserMove, socket.id);

    // io.to(roomWithOnePerson).emit("userMove", "your oponent");

    gameMemoryRPS.push([userId, type]);
    console.log(type, gameRoomId, userId, gameMemoryRPS);
    if (gameMemoryRPS.length == 1) {
      io.to(gameRoomId).emit("gameResult", gameMemoryRPS);
    } else if (gameMemoryRPS.length > 1) {
      io.to(gameRoomId).emit("gameResult", gameMemoryRPS);
      gameMemoryRPS = [];
    }
  });

  socket.on("playerResultGameEndRPS", (data) => {
    console.log("Otrzymane dane od klienta:", data);
    let gameRoomId = data.gameRoomId;
    let userId = data.userId;
    let result = data.result;
    console.log(`${userId} Wygrał`, result, gameRoomId);
    console.log(socket.id, userId);
    io.to(gameRoomId).emit("secondPlayerResultRPS", data);
  });

  socket.on("PlayerLeftRoomRPS", (roomName) => {
    console.log(roomsAttributesRPS[roomName].occupancy, roomName, "test");

    if (roomsAttributesRPS[roomName].occupancy == 2) {
      socket.leave(roomName);
      io.to(roomName).emit("personAmoutRPS", "1");
      io.to(roomName).emit("yourOpponentLeftTheGameRPS", "yes");

      updateOccupancyRPS(roomName, 1);
      console.log(roomsAttributesRPS[roomName].occupancy, roomName);
    } else {
      io.to(roomName).emit("personAmoutRPS", "0");
      updateOccupancyRPS(roomName, 0);
      socket.leave(roomName);
      console.log(roomsAttributesRPS[roomName].occupancy, roomName);
    }
  });

  socket.on("playAgainRPS", ({ roomName, userId }) => {
    onceAgainRPS.push(userId);
    console.log(onceAgainRPS, onceAgainRPS.length);
    console.log(`______________${onceAgainRPS}`);
    if (onceAgainRPS.length == 2) {
      io.to(roomName).emit("playOnceAgainRPS", "yes");
      onceAgainRPS = [];
      console.log(
        "Gra zaczyna się na nowo Ci sami gracze",
        onceAgainRPS.length
      );
    }
    console.log(onceAgain.length);
  });

  // lysy SLOWKA
  socket.on("createRoomSLOWKA", async () => {
    const roomWithOnePerson = findRoomWithOccupancySLOWKA(1);
    console.log("test");
    if (roomWithOnePerson) {
      // Jeżeli jest pokój z jedną osobą, dołącz do niego i zaktualizuj dane
      socket.join(roomWithOnePerson);
      updateOccupancySLOWKA(roomWithOnePerson, 2);
      console.log(`Klient ${socket.id} dołączył do: ${roomWithOnePerson}`);
      io.to(roomWithOnePerson).emit("personAmoutSLOWKA", "2");
      io.to(roomWithOnePerson).emit("gameStartSLOWKA", "start");
      io.to(roomWithOnePerson).emit("yourOpponentLeftTheGameSLOWKA", "");

      io.to(roomWithOnePerson).emit("roomIdSLOWKA", roomWithOnePerson);
      lastUserMoveSlowka = socket.id;
      io.to(roomWithOnePerson).emit("userMoveSlowka", lastUserMove);

      console.log("userMoveSLOWKA", lastUserMoveSlowka);
      io.to(roomWithOnePerson).emit("userMoveSLOWKA", lastUserMoveSlowka);
    } else {
      // Jeżeli nie ma pokoju z jedną osobą lub są już dwa klienty w pokoju
      const generatedRoomName = await generateUniqueRoomName("SLOWKA");

      if (generatedRoomName) {
        // Jeżeli udało się wygenerować unikalną nazwę pokoju, dodaj do roomsAttributes
        addRoomToAttributesSLOWKA(generatedRoomName, 1);
        socket.join(generatedRoomName);
        console.log(
          `Klient ${socket.id} stworzył/połączył się z pokojem: ${generatedRoomName}`
        );
        io.to(generatedRoomName).emit("personAmoutSLOWKA", "1");
        io.to(generatedRoomName).emit("roomIdSLOWKA", generatedRoomName);
      }
    }
  });
  // Dodaj funkcję, która znajduje pokój z określoną ilością osób
  function findRoomWithOccupancySLOWKA(occupancy) {
    for (const roomName in roomsAttributesSLOWKA) {
      if (roomsAttributesSLOWKA[roomName].occupancy === occupancy) {
        return roomName;
      }
    }
    return null;
  }

  // Dodaj funkcję, która aktualizuje ilość osób w danym pokoju
  function updateOccupancySLOWKA(roomName, newOccupancy) {
    roomsAttributesSLOWKA[roomName].occupancy = newOccupancy;
  }

  // Dodaj funkcję, która dodaje pokój do roomsAttributes
  function addRoomToAttributesSLOWKA(roomName, occupancy) {
    roomsAttributesSLOWKA[roomName] = { occupancy };
  }

  socket.on("userSetSLOWKA", (data) => {
    console.log("______________DUPA_____________________");
    let gameRoomId = data[2];
    let userId = data[3];
    console.log(gameMemorySLOWKA);

    if (gameMemorySLOWKA.length == 0) {
      console.log("userId znajduje się w tablicy");
      gameMemorySLOWKA.push(data);
      io.to(gameRoomId).emit("startGameSLOWKA", gameMemorySLOWKA);
    } else if (gameMemorySLOWKA.length == 1) {
      let userChoseWordId = gameMemorySLOWKA[0];
      if (userId != userChoseWordId[3]) {
        gameMemorySLOWKA.push(data);
        io.to(gameRoomId).emit("startGameSLOWKA", gameMemorySLOWKA);
        gameMemorySLOWKA = [];
      }
    }

    // if (gameMemorySLOWKA.length == 1) {
    //   io.to(gameRoomId).emit("startGameSLOWKA", gameMemorySLOWKA);
    // } else if (gameMemorySLOWKA.length > 1) {
    //   io.to(gameRoomId).emit("startGameSLOWKA", gameMemorySLOWKA);
    //   gameMemorySLOWKA = [];
    // }
  });

  socket.on("gameMoveSLOWKA", (data) => {
    userId = data[2];
    console.log(userId, "gameMoveSLOWKA");
    lastUserMoveSlowka = userId;
    data.push(lastUserMoveSlowka);
    let gameRoomId = data[1];
    io.to(gameRoomId).emit("setPercentSLOWKA", data);
    // io.to(gameRoomId).emit("userMoveSLOWKA", lastUserMoveSlowka);

    console.log(data);
  });

  socket.on("playerResultGameEndSLOWKA", (data) => {
    console.log("Otrzymane dane od klienta:", data);
    let gameRoomId = data.gameRoomId;
    let userId = data.userId;
    let result = data.result;
    console.log(`${userId} Wygrał`, result, gameRoomId);
    console.log(socket.id, userId);
    io.to(gameRoomId).emit("secondPlayerResultSLOWKA", data);
  });

  socket.on("PlayerLeftRoomSLOWKA", (roomName) => {
    console.log(roomsAttributesSLOWKA[roomName].occupancy, roomName, "test");

    if (roomsAttributesSLOWKA[roomName].occupancy == 2) {
      socket.leave(roomName);
      io.to(roomName).emit("personAmoutSLOWKA", "1");
      io.to(roomName).emit("yourOpponentLeftTheGameSLOWKA", "yes");

      updateOccupancySLOWKA(roomName, 1);
      console.log(roomsAttributesSLOWKA[roomName].occupancy, roomName);
    } else {
      io.to(roomName).emit("personAmoutSLOWKA", "0");
      updateOccupancySLOWKA(roomName, 0);
      socket.leave(roomName);
      console.log(roomsAttributesSLOWKA[roomName].occupancy, roomName);
    }
  });

  socket.on("playAgainSLOWKA", ({ roomName, userId }) => {
    onceAgainSLOWKA.push(userId);
    console.log(onceAgainSLOWKA, onceAgainSLOWKA.length);
    console.log(`______________${onceAgainSLOWKA}`);
    if (onceAgainSLOWKA.length == 2) {
      io.to(roomName).emit("playOnceAgainSLOWKA", "yes");
      onceAgainSLOWKA = [];
      console.log(
        "Gra zaczyna się na nowo Ci sami gracze",
        onceAgainSLOWKA.length
      );
    }
    console.log(onceAgainSLOWKA.length);
  });
});

httpServer.listen(3500, () => {
  console.log("listening on port 3500");
});
