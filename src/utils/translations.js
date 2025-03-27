// translations.js - Oversettelser for Nyskolen Posten

// Norske oversettelser (standard)
export const no = {
  // Navigasjon
  navigation: {
    home: "Forsiden",
    about: "Om oss",
    login: "Logg inn",
    register: "Registrer deg",
    writeArticle: "Skriv artikkel",
    myArticles: "Mine artikler",
    admin: "Administrer",
    logout: "Logg ut"
  },
  
  // Footer
  footer: {
    contactUs: "Kontakt oss",
    becomeJournalist: "Bli journalist",
    copyright: "Nyskolen Posten - Elevdrevet avis for Nyskolen i Oslo",
    contact: "Kontakt oss",
    contactAriaLabel: "Send e-post til redaksjonen"
  },
  
  // Innlogging
  login: {
    title: "Logg inn",
    email: "E-post",
    emailPlaceholder: "Din e-postadresse",
    password: "Passord",
    passwordPlaceholder: "Ditt passord",
    loginButton: "Logg inn",
    registerPrompt: "Har du ikke en konto?",
    registerHere: "Registrer deg her",
    verifyEmail: "Verifiser e-postadressen din",
    verificationCode: "Verifiseringskode",
    verificationPlaceholder: "Skriv inn 6-sifret kode",
    sendingCode: "Sender verifiseringskode...",
    codeSent: "Verifiseringskode sendt! Sjekk e-posten din.",
    couldNotSendCode: "Kunne ikke sende verifiseringskode. Vennligst sjekk om e-postadressen er riktig.",
    emailError: "Feil ved sending av e-post. Prøv igjen senere.",
    smtpError: "Tilkobling til e-postserver feilet. Vennligst prøv igjen senere.",
    enterCode: "Vennligst skriv inn verifiseringskoden",
    invalidCode: "Ugyldig kode. Prøv igjen.",
    errorOccurred: "Det oppstod en feil. Vennligst prøv igjen.",
    verifyButton: "Verifiser",
    backButton: "Tilbake",
    success: "Suksess!",
    loginSuccess: "Du er nå logget inn.",
    sessionExpired: "Økten din har utløpt. Vennligst logg inn igjen.",
    checkEmailForCode: "Vi har sendt en 6-sifret kode til din e-postadresse. Sjekk innboksen din (og eventuelt spam-mappen) og skriv inn koden nedenfor.",
    localTestingCode: "For lokal testing - din kode er:",
    noEmailServer: "E-postserver ikke tilgjengelig. Bruk koden under for testing:",
    userNotFound: "Brukeren finnes ikke. Vennligst sjekk e-postadressen eller registrer deg.",
    fillBothFields: "Vennligst fyll ut begge feltene.",
    wrongPassword: "Feil passord. Prøv igjen.",
  },
  
  // Registrering
  registration: {
    title: "Registrer deg",
    name: "Navn",
    namePlaceholder: "Skriv inn fullt navn",
    email: "E-post",
    emailPlaceholder: "Din e-postadresse",
    password: "Passord",
    passwordPlaceholder: "Velg et passord",
    confirmPassword: "Bekreft passord",
    confirmPasswordPlaceholder: "Skriv passordet på nytt",
    class: "Klasse",
    classPlaceholder: "Hvilken klasse går du i?",
    registerButton: "Registrer deg",
    backButton: "Tilbake",
    haveAccount: "Har du allerede en konto?",
    loginHere: "Logg inn her",
    verificationCode: "Verifiseringskode",
    verifyButton: "Verifiser",
    registrationComplete: "Registrering fullført",
    goToLogin: "Gå til innlogging",
    allFieldsRequired: "Alle felt må fylles ut",
    passwordsMustMatch: "Passordene må være like",
    invalidEmail: "Vennligst oppgi en gyldig e-postadresse",
    registrationSuccess: "Registrering fullført! Du kan nå logge inn.",
    registrationFailed: "Registrering feilet. Vennligst prøv igjen."
  },
  
  // Artikler
  articles: {
    readMore: "Les mer",
    publishedOn: "Publisert",
    by: "av",
    category: "Kategori",
    contentPlaceholder: "Skriv artikkelinnhold her...",
    title: "Tittel",
    introduction: "Ingress",
    saveDraft: "Lagre utkast",
    publish: "Publiser",
    edit: "Rediger",
    delete: "Slett",
    confirmDelete: "Er du sikker på at du vil slette denne artikkelen?",
    noArticles: "Ingen artikler funnet"
  },
  
  // Admin
  admin: {
    userManagement: "Brukerhåndtering",
    articleManagement: "Artikkelhåndtering",
    approve: "Godkjenn",
    approved: "Godkjent",
    pending: "Venter",
    role: "Rolle",
    journalist: "Journalist",
    editor: "Redaktør",
    admin: "Administrator"
  },
  
  // Generelt
  general: {
    loading: "Laster inn...",
    error: "En feil har oppstått",
    save: "Lagre",
    cancel: "Avbryt",
    confirm: "Bekreft",
    submit: "Send inn",
    success: "Suksess!",
    language: "Språk",
    norwegian: "Norsk",
    english: "Engelsk"
  }
};

// Engelske oversettelser
export const en = {
  // Navigation
  navigation: {
    home: "Home",
    about: "About Us",
    login: "Log In",
    register: "Sign Up",
    writeArticle: "Write Article",
    myArticles: "My Articles",
    admin: "Admin",
    logout: "Log Out"
  },
  
  // Footer
  footer: {
    contactUs: "Contact Us",
    becomeJournalist: "Become a Journalist",
    copyright: "Nyskolen Post - Student-run newspaper for Nyskolen in Oslo",
    contact: "Contact Us",
    contactAriaLabel: "Send email to the editorial team"
  },
  
  // Login
  login: {
    title: "Login",
    email: "Email",
    emailPlaceholder: "Your email address",
    password: "Password",
    passwordPlaceholder: "Your password",
    loginButton: "Login",
    registerPrompt: "Don't have an account?",
    registerHere: "Register here",
    verifyEmail: "Verify your email address",
    verificationCode: "Verification code",
    verificationPlaceholder: "Enter 6-digit code",
    sendingCode: "Sending verification code...",
    codeSent: "Verification code sent! Check your email.",
    couldNotSendCode: "Could not send verification code. Please check if your email address is correct.",
    emailError: "Error sending email. Please try again later.",
    smtpError: "Connection to email server failed. Please try again later.",
    enterCode: "Please enter the verification code",
    invalidCode: "Invalid code. Please try again.",
    errorOccurred: "An error occurred. Please try again.",
    verifyButton: "Verify",
    backButton: "Back",
    success: "Success!",
    loginSuccess: "You are now logged in.",
    sessionExpired: "Your session has expired. Please log in again.",
    checkEmailForCode: "We've sent a 6-digit code to your email address. Check your inbox (and possibly spam folder) and enter the code below.",
    localTestingCode: "For local testing - your code is:",
    noEmailServer: "Email server not available. Use the code below for testing:",
    userNotFound: "User not found. Please check your email or register.",
    fillBothFields: "Please fill in both fields.",
    wrongPassword: "Incorrect password. Please try again.",
  },
  
  // Registration
  registration: {
    title: "Sign Up",
    name: "Name",
    namePlaceholder: "Enter your full name",
    email: "Email",
    emailPlaceholder: "Your email address",
    password: "Password",
    passwordPlaceholder: "Choose a password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Retype your password",
    class: "Class",
    classPlaceholder: "Which class are you in?",
    registerButton: "Sign Up",
    backButton: "Back",
    haveAccount: "Already have an account?",
    loginHere: "Log in here",
    verificationCode: "Verification Code",
    verifyButton: "Verify",
    registrationComplete: "Registration Complete",
    goToLogin: "Go to Login",
    allFieldsRequired: "All fields must be filled out",
    passwordsMustMatch: "Passwords must match",
    invalidEmail: "Please provide a valid email address",
    registrationSuccess: "Registration complete! You can now log in.",
    registrationFailed: "Registration failed. Please try again."
  },
  
  // Articles
  articles: {
    readMore: "Read More",
    publishedOn: "Published on",
    by: "by",
    category: "Category",
    contentPlaceholder: "Write article content here...",
    title: "Title",
    introduction: "Introduction",
    saveDraft: "Save Draft",
    publish: "Publish",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this article?",
    noArticles: "No articles found"
  },
  
  // Admin
  admin: {
    userManagement: "User Management",
    articleManagement: "Article Management",
    approve: "Approve",
    approved: "Approved",
    pending: "Pending",
    role: "Role",
    journalist: "Journalist",
    editor: "Editor",
    admin: "Administrator"
  },
  
  // General
  general: {
    loading: "Loading...",
    error: "An error occurred",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    submit: "Submit",
    success: "Success!",
    language: "Language",
    norwegian: "Norwegian",
    english: "English"
  }
}; 