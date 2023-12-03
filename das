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

// Przykład pobierania danych z bazy danych
async function updateIloscOsobByNameRoom(nameRoom, newIloscOsob) {
  try {
    const { data, error } = await supabase.from("clients").upsert(
      [
        {
          name_room: nameRoom,
          ilosc_osob: newIloscOsob,
        },
      ],
      {
        onConflict: ["name_room"],
        returning: ["name_room", "ilosc_osob"],
      }
    );

    if (error) {
      console.error("Error updating ilosc_osob in clients:", error.message);
    } else {
      console.log("ilosc_osob updated in clients:", data);
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

async function addVariableToTTTRooms(variable, ilosc_gracy) {
  try {
    // const { data, error } = await supabase
    //   .from("TTT-rooms")
    //   .upsert([{ name_room: variable }], { onConflict: ["name_room"] });
    const { data, error } = await supabase.from("clients").insert([
      {
        name_room: variable,
        ilosc_osob: ilosc_gracy,
      },
    ]);

    if (error) {
      console.error("Error adding variable to TTT-rooms:", error.message);
    } else {
      console.log("Variable added to TTT-rooms:", data);
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

async function checkRoomOccupancy() {
  try {
    // Sprawdź, czy istnieje rekord z ilosc_osob równą 1 w tabeli "clients"
    const { data, error } = await supabase
      .from("clients")
      .select("ilosc_osob, name_room")
      .eq("ilosc_osob", 1);

    if (error) {
      console.error("Error checking room occupancy:", error.message);
      return null; // Obsługa błędu
    } else {
      console.log("Room occupancy checked:", data);

      if (data.length > 0) {
        // Zwróć nazwę pokoju z pierwszego znalezionego rekordu
        const roomName = data[0].name_room;
        console.log("Room with occupancy 1 found:", roomName);
        return roomName;
      } else {
        console.log("No room with occupancy 1 found.");
        return null;
      }
    }
  } catch (e) {
    console.error("Error:", e.message);
    return null; // Obsługa błędu
  }
}
async function generateUniqueRoomName() {
  const adjectives = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"];
  const nouns = ["Lion", "Tiger", "Bear", "Elephant", "Giraffe", "Zebra"];

  let uniqueRoomName = "";

  do {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    uniqueRoomName = `${adjective}-${noun}`;

    // Sprawdź, czy nazwa pokoju już istnieje w tablicy TTTrooms
    const { data, error } = await supabase
      .from("TTT-rooms")
      .select("*")
      .eq("name_room", uniqueRoomName);

    if (error) {
      console.error("Error checking room existence:", error.message);
      return null; // Obsługa błędu
    }

    if (data.length === 0) {
      // Nazwa pokoju jest unikalna
      return uniqueRoomName;
    }

    // Powtórz pętlę, jeśli nazwa pokoju już istnieje
  } while (true);
}

let rooms = [];

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
  rooms.push(socket.id);
  console.log(rooms);
  // addVariableToTTTRooms(generatedRoomName);
  // console.log(generatedRoomName);

  // Obsługa stworzenia i dołączenia do pokoju

  socket.on("createRoom", (roomName) => {
    // socket.join(generatedRoomName);

  });





  // socket.on("createRoom", (roomName) => {
  //   checkRoomOccupancy()
  //     .then((roomNameWithOccupancy1) => {
  //       if (roomNameWithOccupancy1) {
  //         console.log("if");
  //         // console.log("Room with occupancy 1:", roomNameWithOccupancy1);
  //         socket.join(roomNameWithOccupancy1);
  //         updateIloscOsobByNameRoom(roomNameWithOccupancy1, 2);
  //         console.log(
  //           `Klient ${socket.id} dołaczył do: ${roomNameWithOccupancy1}`
  //         );
  //         socket.to(roomNameWithOccupancy1).emit("personAmout", "1");
  //       } else {
  //         console.log("else");
  //         console.log("No room with occupancy 1 or error occurred.");
  //         generateUniqueRoomName()
  //           .then((generatedRoomName) => {
  //             if (generatedRoomName) {
  //               console.log("Generated Room Name:", generatedRoomName);
  //               addVariableToTTTRooms(generatedRoomName, 1);
  //               setTimeout(() => {
  //                 socket.join(generatedRoomName);
  //                 console.log(
  //                   `Klient ${socket.id} stworzył/połączył się z pokojem: ${roomNameWithOccupancy1}`
  //                 );
  //                 socket.to(generatedRoomName).emit("personAmout", "2");
  //               }, 8000);
  //             } else {
  //               // console.log("Unable to generate unique room name.");
  //             }
  //           })
  //           .catch((error) => {
  //             // console.error("Error generating room name:", error.message);
  //           });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error.message);
  //     });
  // });
});

httpServer.listen(3500, () => {
  console.log("listening on port 3500");
});
