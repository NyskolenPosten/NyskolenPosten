// firebaseConfig.js - Lokal lagring i stedet for Firebase

// Denne filen erstatter Firebase med lokal lagring (localStorage)
// for å kunne teste applikasjonen uten skytjenester

// Simulerer Firebase-lignende objekter for å unngå å måtte endre koden i resten av applikasjonen
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    // Hent bruker fra localStorage ved oppstart
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      auth.currentUser = user;
      callback(user);
    } else {
      callback(null);
    }
    
    // Returner en funksjon for å "avregistrere" lytteren (ikke brukt i lokal versjon)
    return () => {};
  }
};

const db = {
  // Denne vil bli brukt av andre tjenester
};

const storage = {
  // Denne vil bli brukt av andre tjenester
};

// Initialiser lokal lagring hvis den ikke finnes
if (!localStorage.getItem('brukere')) {
  localStorage.setItem('brukere', JSON.stringify([]));
}

if (!localStorage.getItem('artikler')) {
  localStorage.setItem('artikler', JSON.stringify([]));
}

export { auth, db, storage }; 