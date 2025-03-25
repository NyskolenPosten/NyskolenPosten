# Nyskolen Posten

Nyskolen Posten er en nettbasert skoleavis for elever på Nyskolen i Oslo. Applikasjonen er bygget med React og bruker lokal lagring (localStorage) for å lagre artikler og brukerinformasjon.

## Funksjoner

- Lese artikler publisert av elever
- Registrere seg som bruker
- Logge inn som registrert bruker
- Skrive og sende inn artikler
- Administrere egne artikler
- Administratorpanel for godkjenning av artikler og brukere

## Installasjon og kjøring lokalt

1. Klon prosjektet:
```bash
git clone https://github.com/MattisCrafting/NyskolenPosten.git
cd NyskolenPosten
```

2. Installer avhengigheter:
```bash
npm install
```

3. Start utviklingsserveren:
```bash
npm start
```

Nettstedet vil nå være tilgjengelig på [http://localhost:3000](http://localhost:3000)

## Deployering til GitHub Pages

For å publisere endringer til GitHub Pages:

1. Gjør endringer i koden
2. Commit og push endringene til GitHub
3. Kjør deploy-kommandoen:
```bash
npm run deploy
```

Nettstedet vil være tilgjengelig på [https://MattisCrafting.github.io/NyskolenPosten](https://MattisCrafting.github.io/NyskolenPosten)

## Teknologier brukt

- React
- React Router
- React Markdown
- GitHub Pages for hosting

## Kontakt

For spørsmål eller tilbakemeldinger, kontakt redaksjonen på redaksjonenyskolenposten@nionett.no

## Bruk

### Som leser
- Bla gjennom publiserte artikler på forsiden
- Klikk på en artikkel for å lese hele innholdet
- Les om avisen på "Om oss"-siden

### Som skribent
1. Registrer deg med e-post, passord, navn og klasse
2. Vent på godkjenning fra administrator
3. Logg inn med dine brukerdetaljer
4. Skriv nye artikler ved å klikke på "Ny artikkel"
5. Administrer dine artikler i "Mine artikler"-seksjonen

### Som administrator
1. Logg inn med administratorkonto
2. Gå til "Admin"-panelet
3. Godkjenn eller avvis nye artikler
4. Administrer brukere (godkjenn nye brukere, endre roller, slett brukere)

## Lokal lagring

Denne applikasjonen bruker nettleserens localStorage for å lagre data. Dette betyr at:
- All data lagres lokalt i nettleseren din
- Data vil være tilgjengelig selv etter at du lukker nettleseren, men kun på samme enhet
- Hvis du tømmer nettleserdata eller bruker privat/inkognito-modus, vil dataene forsvinne

## Første gangs oppsett

Når du starter applikasjonen for første gang, vil en administratorkonto automatisk bli opprettet:

- E-post: admin@nyskolen.no
- Passord: admin123

**Viktig:** Endre passordet til administratorkontoen etter første innlogging for å sikre applikasjonen.

## Utvikling

Prosjektet er strukturert som følger:

- `src/` - Kildekode for React-applikasjonen
  - `components/` - React-komponenter
  - `services/` - Tjenester for databehandling
- `public/` - Statiske filer

## Lisens

Dette prosjektet er laget for utdanningsformål ved Nyskolen i Oslo.

## Hvordan commite endringer

For å commite endringer til prosjektet:

1. Sjekk status for å se hvilke filer som er endret:
   ```bash
   git status
   ```

2. Legg til endringene dine til staging:
   ```bash
   git add .
   ```

3. Commit endringene med en beskrivende melding:
   ```bash
   git commit -m "Beskrivelse av endringene"
   ```

4. Push endringene til GitHub:
   ```bash
   git push origin main
   ```

## Prosjektstatus

Denne seksjonen blir oppdatert regelmessig for å informere om prosjektets status.

### Nåværende status (oppdatert 14. oktober 2023)
- ✅ Grunnfunksjonalitet for visning av artikler
- ✅ Brukerregistrering og innlogging
- ✅ Skriving og publisering av artikler
- ✅ Godkjenningssystem for artikler
- ✅ Admin-panel for administrering av brukere og artikler
- ✅ E-postverifisering ved registrering
- ✅ Responsivt design for mobil og desktop
- ✅ GitHub Pages integrasjon for enkel publisering

### Pågående arbeid
- 🔄 Feilsøking av navigasjon på GitHub Pages
- 🔄 Forbedring av markdown-formatering i artikler
- 🔄 Oppdatering av brukergrensesnitt med nye farger og ikoner

### Kommende funksjoner
- 📅 Kommentarsystem for artikler
- 📅 Avansert søkefunksjonalitet
- 📅 Mulighet for å legge til kategorier
- 📅 Støtte for opplasting av bilder direkte i artikler

Sist oppdatert: 14.10.2023 