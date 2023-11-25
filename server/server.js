const http = require("http");
const { Server } = require("socket.io");

const httpServer = http.createServer();
const { createClient } = require("@supabase/supabase-js");

// Zastąp poniższe dane swoimi danymi z Supabase
const supabaseUrl = "https://tpiobmfcjontnvmvkrzo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaW9ibWZjam9udG52bXZrcnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA5MTQyODEsImV4cCI6MjAxNjQ5MDI4MX0.5JcyQimgLc0EmirbcpiqDmO3hMAimMrWR1KoEVDWQWM";
const supabase = createClient(supabaseUrl, supabaseKey);

// Przykład pobierania danych z bazy danych

const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
});

io.on("connection", (socket) => {
  // Przykład pobierania danych z bazy danych
  // supabase
  //   .from("clients")
  //   .select("*")
  //   .then(({ data, error }) => {
  //     if (error) {
  //       throw error;
  //     }
  //     socket.emit("clientsData", data);
  //     console.log(data, "test");
  //   })
  //   .catch((error) => {
  //     console.error(
  //       "Błąd podczas pobierania danych z bazy danych:",
  //       error.message
  //     );
  //   });

  // funkcja pobierąca mail z login-page

  socket.on("getUserLoginInfo", (email, password) => {
    console.log(`Client mail: ${email}`);
    console.log(`Client password: ${password}`);
  });

  //socket io
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

httpServer.listen(3500, () => {
  console.log("listening on port 3500");
});
