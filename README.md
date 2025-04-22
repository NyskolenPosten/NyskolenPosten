## Kjøring med Docker

Prosjektet kan enkelt kjøres i en isolert container med Docker og Docker Compose. Dette gir en forutsigbar og enkel oppstart, uavhengig av lokalt utviklingsmiljø.

### Forutsetninger
- Docker og Docker Compose må være installert på maskinen din.
- Node.js-versjon 22.13.1 brukes i Dockerfile (ingen Node-installasjon kreves lokalt).

### Bygg og start applikasjonen

1. Bygg og start containeren med Docker Compose:
   ```bash
   docker compose up --build
   ```
   Dette bygger og starter applikasjonen i en container med alle nødvendige avhengigheter.

2. Applikasjonen vil være tilgjengelig på følgende porter:
   - http://localhost:3001
   - http://localhost:3002

### Miljøvariabler
- Standardoppsettet bruker ikke eksterne miljøvariabler, men du kan legge til en `.env`-fil i prosjektroten og fjerne kommentaren på `env_file` i `docker-compose.yml` hvis du ønsker å overstyre konfigurasjon (f.eks. for produksjon).
- **NB:** Hemmelige nøkler og sensitive data bør ikke legges inn i Docker-image, men settes som miljøvariabler ved oppstart.

### Databasen
- Applikasjonen bruker som standard en lokal SQLite-database (`prisma/dev.db`) som lagres i containeren.
- Hvis du ønsker å bruke en ekstern database i produksjon, må du oppdatere databasekonfigurasjonen og eventuelt legge til en database-tjeneste i `docker-compose.yml`.

### Spesielle hensyn
- Containeren kjører som en ikke-root bruker for økt sikkerhet.
- Kun nødvendige filer kopieres inn i produksjonscontaineren for å holde imaget slankt.

Se `Dockerfile` og `docker-compose.yml` for flere detaljer om oppsettet.