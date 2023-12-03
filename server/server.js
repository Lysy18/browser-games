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
async function generateUniqueRoomName() {
  const adjectives = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"];
  const nouns = ["Lion", "Tiger", "Bear", "Elephant", "Giraffe", "Zebra"];

  let uniqueRoomName = "";

  do {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    uniqueRoomName = `${adjective}-${noun}`;

    // Sprawdź, czy nazwa pokoju jest unikalna
    if (!rooms.includes(uniqueRoomName)) {
      // Jeżeli jest unikalna, dodaj ją do tablicy i zwróć nazwę
      rooms.push(uniqueRoomName);
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
      io.to(roomWithOnePerson).emit("personAmout", "1");
      io.to(roomWithOnePerson).emit("roomId", roomWithOnePerson);
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
        io.to(generatedRoomName).emit("personAmout", "2");
        io.to(generatedRoomName).emit("roomId", generatedRoomName);
      }
    }
  });

  socket.on("move", ({ cellIndex, player, gameRoomId }) => {
    console.log(cellIndex, player, gameRoomId);
    io.to(gameRoomId).emit("opponentMove", { cellIndex, player });
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
});

httpServer.listen(3500, () => {
  console.log("listening on port 3500");
});
