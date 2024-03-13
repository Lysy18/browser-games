const http = require("http");
const { Server } = require("socket.io");

const httpServer = http.createServer();
const { createClient } = require("@supabase/supabase-js");

// Zastąp poniższe dane swoimi danymi z Supabase
const supabaseUrl = "";
const supabaseKey = "";
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
    if (game == "TTT" && !rooms.includes(uniqueRoomName)) {
      rooms.push(uniqueRoomName);
      return uniqueRoomName;
    } else if (game == "RPS" && !roomsRPS.includes(uniqueRoomName)) {
      roomsRPS.push(uniqueRoomName);

      return uniqueRoomName;
    } else if (game == "SLOWKA" && !roomsSLOWKA.includes(uniqueRoomName)) {
      roomsSLOWKA.push(uniqueRoomName);

      return uniqueRoomName;
    }
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
async function incrementGameAmount(gameName) {
  let { data, error } = await supabase
    .from("games")
    .select("game_amount")
    .eq("game_name", gameName);

  if (error) {
    console.error("Błąd przy pobieraniu danych:", error);
    return;
  }
  if (data.length === 0) {
    return;
  }

  const { error: updateError } = await supabase
    .from("games")
    .update({ game_amount: data[0].game_amount + 1 })
    .eq("game_name", gameName);

  // Obsługa błędu przy aktualizacji danych
  if (updateError) {
    console.error("Błąd przy aktualizacji danych:", updateError);
  }
}

async function getGames() {
  try {
    let { data, error } = await supabase.from("games").select("*");

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Błąd podczas pobierania danych:", error);
    return null;
  }
}

io.on("connection", (socket) => {
  socket.on("addWin", (game) => {
    incrementGameAmount(game);
  });

  async function main() {
    try {
      const games = await getGames();
      io.emit("bestGame", games);
    } catch (error) {
      console.error(error);
    }
  }

  main();
  //  BT ttt
  socket.on("createRoom", async () => {
    const roomWithOnePerson = findRoomWithOccupancy(1);
    if (roomWithOnePerson) {
      // Jeżeli jest pokój z jedną osobą, dołącz do niego i zaktualizuj dane
      socket.join(roomWithOnePerson);
      updateOccupancy(roomWithOnePerson, 2);
      io.to(roomWithOnePerson).emit("personAmout", "2");
      io.to(roomWithOnePerson).emit("gameStart", "start");
      io.to(roomWithOnePerson).emit("yourOpponentLeftTheGame", "");
      onceAgain = [];
      io.to(roomWithOnePerson).emit("roomId", roomWithOnePerson);
      lastUserMove = socket.id;
      io.to(roomWithOnePerson).emit("userMove", lastUserMove);
    } else {
      // Jeżeli nie ma pokoju z jedną osobą lub są już dwa klienty w pokoju
      const generatedRoomName = await generateUniqueRoomName("TTT");

      if (generatedRoomName) {
        // Jeżeli udało się wygenerować unikalną nazwę pokoju, dodaj do roomsAttributes
        addRoomToAttributes(generatedRoomName, 1);
        socket.join(generatedRoomName);

        io.to(generatedRoomName).emit("personAmout", "1");
        io.to(generatedRoomName).emit("roomId", generatedRoomName);
        io.to(generatedRoomName).emit("yourOpponentLeftTheGame", "");
      }
    }
  });

  socket.on("move", ({ cellIndex, player, gameRoomId, userId }) => {
    if (lastUserMove != socket.id) {
      lastUserMove = userId;
      io.to(gameRoomId).emit("opponentMove", {
        cellIndex,
        player,
        lastUserMove,
      });
    }
  });

  socket.on("playerResultGameEnd", (data) => {
    let gameRoomId = data.gameRoomId;
    io.to(gameRoomId).emit("secondPlayerResult", data);
  });

  socket.on("PlayerLeftRoom", (roomName) => {
    if (roomsAttributes[roomName].occupancy == 2) {
      socket.leave(roomName);
      io.to(roomName).emit("personAmout", "1");
      io.to(roomName).emit("yourOpponentLeftTheGame", "yes");
      updateOccupancy(roomName, 1);
    } else {
      io.to(roomName).emit("personAmout", "0");
      updateOccupancy(roomName, 0);
      socket.leave(roomName);
    }
  });

  socket.on("playAgain", ({ roomName, userId }) => {
    onceAgain.push(userId);
    if (onceAgain.length == 2) {
      io.to(roomName).emit("playOnceAgain", "yes1");
      onceAgain = [];
    }
  });

  function findRoomWithOccupancy(occupancy) {
    for (const roomName in roomsAttributes) {
      if (roomsAttributes[roomName].occupancy === occupancy) {
        return roomName;
      }
    }
    return null;
  }
  function updateOccupancy(roomName, newOccupancy) {
    roomsAttributes[roomName].occupancy = newOccupancy;
  }

  function addRoomToAttributes(roomName, occupancy) {
    roomsAttributes[roomName] = { occupancy };
  }

  socket.on("joinChat", (userId) => {
    data = [messageHistory, socket.id];
    socket.emit("messageHistory", data);
  });

  socket.on("sendMessage", (data) => {
    messageHistory.push(data);
    if (messageHistory.length > 100) {
      messageHistory.shift();
    }
    io.emit("messageSent", data);
  });

  //BT RPS
  socket.on("createRoomRPS", async () => {
    const roomWithOnePerson = findRoomWithOccupancyRPS(1);
    if (roomWithOnePerson) {
      socket.join(roomWithOnePerson);
      updateOccupancyRPS(roomWithOnePerson, 2);
      io.to(roomWithOnePerson).emit("personAmoutRPS", "2");
      io.to(roomWithOnePerson).emit("gameStartRPS", "start");
      io.to(roomWithOnePerson).emit("yourOpponentLeftTheGameRPS", "");

      io.to(roomWithOnePerson).emit("roomIdRPS", roomWithOnePerson);
      onceAgainRPS = [];
    } else {
      const generatedRoomName = await generateUniqueRoomName("RPS");

      if (generatedRoomName) {
        addRoomToAttributesRPS(generatedRoomName, 1);
        socket.join(generatedRoomName);

        io.to(generatedRoomName).emit("personAmoutRPS", "1");
        io.to(generatedRoomName).emit("roomIdRPS", generatedRoomName);
      }
    }
  });
  function findRoomWithOccupancyRPS(occupancy) {
    for (const roomName in roomsAttributesRPS) {
      if (roomsAttributesRPS[roomName].occupancy === occupancy) {
        return roomName;
      }
    }
    return null;
  }

  function updateOccupancyRPS(roomName, newOccupancy) {
    roomsAttributesRPS[roomName].occupancy = newOccupancy;
  }

  function addRoomToAttributesRPS(roomName, occupancy) {
    roomsAttributesRPS[roomName] = { occupancy };
  }

  socket.on("userMoveRPS", ({ type, gameRoomId, userId }) => {
    gameMemoryRPS.push([userId, type]);
    if (gameMemoryRPS.length == 1) {
      io.to(gameRoomId).emit("gameResult", gameMemoryRPS);
    } else if (gameMemoryRPS.length > 1) {
      io.to(gameRoomId).emit("gameResult", gameMemoryRPS);
      gameMemoryRPS = [];
    }
  });

  socket.on("playerResultGameEndRPS", (data) => {
    let gameRoomId = data.gameRoomId;
    io.to(gameRoomId).emit("secondPlayerResultRPS", data);
  });

  socket.on("PlayerLeftRoomRPS", (roomName) => {
    if (roomsAttributesRPS[roomName].occupancy == 2) {
      socket.leave(roomName);
      io.to(roomName).emit("personAmoutRPS", "1");
      io.to(roomName).emit("yourOpponentLeftTheGameRPS", "yes");

      updateOccupancyRPS(roomName, 1);
    } else {
      io.to(roomName).emit("personAmoutRPS", "0");
      updateOccupancyRPS(roomName, 0);
      socket.leave(roomName);
    }
  });

  socket.on("playAgainRPS", ({ roomName, userId }) => {
    onceAgainRPS.push(userId);
    if (onceAgainRPS.length == 2) {
      io.to(roomName).emit("playOnceAgainRPS", "yes");
      onceAgainRPS = [];
    }
  });

  // BT SLOWKA
  socket.on("createRoomSLOWKA", async () => {
    const roomWithOnePerson = findRoomWithOccupancySLOWKA(1);
    if (roomWithOnePerson) {
      socket.join(roomWithOnePerson);
      updateOccupancySLOWKA(roomWithOnePerson, 2);
      io.to(roomWithOnePerson).emit("personAmoutSLOWKA", "2");
      io.to(roomWithOnePerson).emit("gameStartSLOWKA", "start");
      io.to(roomWithOnePerson).emit("yourOpponentLeftTheGameSLOWKA", "");

      io.to(roomWithOnePerson).emit("roomIdSLOWKA", roomWithOnePerson);
      lastUserMoveSlowka = socket.id;
      io.to(roomWithOnePerson).emit("userMoveSlowka", lastUserMove);
      onceAgainSLOWKA = [];

      io.to(roomWithOnePerson).emit("userMoveSLOWKA", lastUserMoveSlowka);
    } else {
      const generatedRoomName = await generateUniqueRoomName("SLOWKA");
      if (generatedRoomName) {
        addRoomToAttributesSLOWKA(generatedRoomName, 1);
        socket.join(generatedRoomName);
        io.to(generatedRoomName).emit("personAmoutSLOWKA", "1");
        io.to(generatedRoomName).emit("roomIdSLOWKA", generatedRoomName);
      }
    }
  });
  function findRoomWithOccupancySLOWKA(occupancy) {
    for (const roomName in roomsAttributesSLOWKA) {
      if (roomsAttributesSLOWKA[roomName].occupancy === occupancy) {
        return roomName;
      }
    }
    return null;
  }

  function updateOccupancySLOWKA(roomName, newOccupancy) {
    roomsAttributesSLOWKA[roomName].occupancy = newOccupancy;
  }

  function addRoomToAttributesSLOWKA(roomName, occupancy) {
    roomsAttributesSLOWKA[roomName] = { occupancy };
  }

  socket.on("userSetSLOWKA", (data) => {
    let gameRoomId = data[2];
    let userId = data[3];

    if (gameMemorySLOWKA.length == 0) {
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
  });

  socket.on("gameMoveSLOWKA", (data) => {
    userId = data[2];
    lastUserMoveSlowka = userId;
    data.push(lastUserMoveSlowka);
    let gameRoomId = data[1];
    io.to(gameRoomId).emit("setPercentSLOWKA", data);
  });

  socket.on("playerResultGameEndSLOWKA", (data) => {
    let gameRoomId = data.gameRoomId;
    io.to(gameRoomId).emit("secondPlayerResultSLOWKA", data);
  });

  socket.on("PlayerLeftRoomSLOWKA", (roomName) => {
    if (roomsAttributesSLOWKA[roomName].occupancy == 2) {
      socket.leave(roomName);
      io.to(roomName).emit("personAmoutSLOWKA", "1");
      io.to(roomName).emit("yourOpponentLeftTheGameSLOWKA", "yes");

      updateOccupancySLOWKA(roomName, 1);
    } else {
      io.to(roomName).emit("personAmoutSLOWKA", "0");
      updateOccupancySLOWKA(roomName, 0);
      socket.leave(roomName);
    }
  });

  socket.on("playAgainSLOWKA", ({ roomName, userId }) => {
    onceAgainSLOWKA.push(userId);
    if (onceAgainSLOWKA.length == 2) {
      io.to(roomName).emit("playOnceAgainSLOWKA", "yes");
      onceAgainSLOWKA = [];
    }
  });
  socket.on("disconnect", () => {
    console.log(socket.id, "discon");
  });
});

httpServer.listen(3500, () => {
  console.log("listening on port 3500");
});
