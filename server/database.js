const { createClient } = require("@supabase/supabase-js");

// Zastąp poniższe dane swoimi danymi z Supabase
const supabaseUrl = "https://tpiobmfcjontnvmvkrzo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaW9ibWZjam9udG52bXZrcnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA5MTQyODEsImV4cCI6MjAxNjQ5MDI4MX0.5JcyQimgLc0EmirbcpiqDmO3hMAimMrWR1KoEVDWQWM";
const supabase = createClient(supabaseUrl, supabaseKey);

// Przykład pobierania danych z bazy danych
async function sprawdzPolaczenie() {
  try {
    const { data, error } = await supabase.from("clients").select("*").limit(5);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(
      "Błąd podczas pobierania danych z bazy danych:",
      error.message
    );
    console.error("Błąd! Połączenie z bazą danych nie jest aktywne.");
  }
}
sprawdzPolaczenie();

// Przykład pobierania danych z bazy danych
supabase
  .from("clients")
  .select("*")
  .then(({ data, error }) => {
    if (error) {
      throw error;
    }
    socket.emit("clientsData", data);
  })
  .catch((error) => {
    console.error(
      "Błąd podczas pobierania danych z bazy danych:",
      error.message
    );
  });
