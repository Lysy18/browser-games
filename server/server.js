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

const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
  connectionStateRecovery: {},
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

  //funkcja wsatwiająca email i hasło do bazy
  // Funkcja sprawdzająca, czy email już istnieje w bazie danych
  async function sprawdzDaneLogowania(email, password) {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("email", email)
        .eq("password", password);

      if (error) {
        throw error;
      }
      return data.length > 0; // Zwraca true, jeśli dane logowania są poprawne, w przeciwnym razie false
    } catch (error) {
      console.error(
        "Błąd podczas sprawdzania danych logowania w bazie danych:",
        error.message
      );
      return false; // Zakładamy, że wystąpił błąd, więc nie chcemy potwierdzić prawidłowych danych logowania
    }
  }

  // Funkcja dodająca nowy wiersz do tabeli "clients"
  async function dodajNowyWiersz(email, password) {
    try {
      // Sprawdź, czy email już istnieje w bazie danych
      const emailIstnieje = await sprawdzEmail(email);

      if (emailIstnieje) {
        console.error(
          "Email już istnieje w bazie danych. Nie dodano nowego wiersza."
        );
        return;
      }

      // Dodaj nowy wiersz do tabeli "clients"
      const { data, error } = await supabase.from("clients").insert([
        {
          email: email,
          password: password,
        },
      ]);

      if (error) {
        throw error;
      }

      console.log("Dodano nowy wiersz:", data);
    } catch (error) {
      console.error("Błąd podczas dodawania nowego wiersza:", error.message);
    }
  }

  // funkcja pobierająca mail z login-page
  socket.on("getUserLoginInfo", (email, password, type) => {
    console.log(`Client mail: ${email}`);
    console.log(`Client password: ${password}`);
    if (type == "signin") {
      dodajNowyWiersz(email, password);
      console.log(type);
    } else if (type == "login") {
      sprawdzDaneLogowania(email, password);
      console.log(type);
    }
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
