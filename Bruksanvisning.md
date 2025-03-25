# Nyskolen Posten - Bruksanvisning

Dette dokumentet forklarer hvordan du bruker Nyskolen Posten, den elevdrevede nettavisen for Nyskolen i Oslo. Programmet er laget for å reflektere Nyskolens verdier om demokrati, medbestemmelse og ansvar.

## Innholdsfortegnelse
1. [Hvordan fungerer Nyskolen Posten?](#hvordan-fungerer-nyskolen-posten)
2. [Registrere seg](#registrere-seg)
3. [Logge inn](#logge-inn)
4. [Lese artikler](#lese-artikler)
5. [Skrive artikler](#skrive-artikler)
6. [Administrasjon og redaktøransvar](#administrasjon-og-redaktørarbeid)
7. [Teknisk informasjon](#teknisk-informasjon)

## Hvordan fungerer Nyskolen Posten?

Nyskolen Posten er en nettavis der elevene kan:
- Lese nyheter og artikler om Nyskolen
- Registrere seg for å få en brukerkonto
- Skrive egne artikler når brukerkontoen er godkjent
- Få artiklene sine godkjent og publisert på forsiden

Systemet er bygd med tre nivåer av brukere:
1. **Besøkende**: Kan lese alle publiserte artikler
2. **Journalister** (godkjente elever): Kan skrive artikler som må godkjennes før publisering
3. **Redaktører/Admin**: Kan godkjenne både nye brukere og artikler

## Registrere seg

Registrering er enkelt og gratis:

1. Klikk på "Registrer deg" i menyen øverst på siden
2. Fyll ut skjemaet med:
   - Fullt navn
   - E-postadresse (helst skolens e-postadresse)
   - Klassetrinn
   - Passord (minst 6 tegn)
3. Bekreft passordet ditt
4. Klikk på "Registrer meg"

Etter registrering kan du lese alle publiserte artikler, men for å skrive egne artikler må kontoen din godkjennes av en administrator eller redaktør. Dette kan gjøres med avtale mellom eleven og redaktøren/administratoren.

## Logge inn

Når du har en godkjent konto:

1. Klikk på "Logg inn" i menyen øverst på siden
2. Skriv inn e-postadressen og passordet du brukte ved registrering
3. Klikk på "Logg inn"

Når du er logget inn, vil du se flere valg i menyen, inkludert "Skriv ny artikkel" og "Mine artikler", og du kan se hvem som er redaktør/administrator, og journalister i jobblisten.

## Lese artikler

Nyskolen Posten er åpen for alle å lese, også uten å logge inn.

- **Forsiden** viser de nyeste godkjente artiklene, organisert i kategorier
- Klikk på "Les mer" eller "Les artikkel" for å se hele artikkelen
- Artikler er sortert etter kategorier som "Nyheter", "Saksmøtet", "Meninger", "Heureka", "Skolen", "Klassen" osv.

## Skrive artikler

Når kontoen din er godkjent, kan du skrive artikler:

1. Klikk på "Skriv ny artikkel" i menyen
2. Fyll ut skjemaet:
   - **Tittel** (obligatorisk): Lag en kort og fengende tittel
   - **Kategori**: Velg den kategorien som passer best til innholdet ditt
   - **Bilde** (valgfritt): Last opp et bilde som illustrerer artikkelen
   - **Ingress** (valgfritt): En kort introduksjon (hvis du ikke fyller inn, lages den automatisk)
   - **Innhold** (obligatorisk): Selve artikkelteksten

3. Artikkelen kan formateres med enkel markdown:
   - `**tekst**` for **fet tekst**
   - `*tekst*` for *kursiv tekst*
   - `### Overskrift` for overskrifter

4. Klikk "Send inn artikkel" når du er ferdig

Artikkelen din blir sendt til redaktørene for godkjenning. Når den godkjennes, vil den vises på forsiden.

## Administrasjon og redaktørarbeid

Hvis e-post matcher en e-post i redaktør/administrator-listen, vil du få konto som er redaktør/administrator.

i jobblisten kan du se hvem som er redaktør/administrator, og journalister. i kategorilisten kan du se hvem som er ansvarlig for hvilke kategorier. og hvem som har fått jobb legges til i jobblisten. hvis det er en ny bruker som matcher e-post addresse: mattis.tollefsen@nionett.no, så går brukeren rett til rolle redaktør. Redaktører kan gi roller til andre brukere i jobblisten

For redaktører og administratorer:

1. Logg inn med redaktør- eller administratorkonto
2. Klikk på "Administrer" i menyen

I administrasjonspanelet kan du:
- **Godkjenne brukere**: Nye elever som har registrert seg må godkjennes før de kan skrive
- **Godkjenne artikler**: Se gjennom og godkjenn/avvis innsendte artikler
- **Slette artikler**: Fjerne upassende eller utdaterte artikler

Administrator kan ikke gjøre alt som redaktører kan, og i tillegg administrere andre brukere.

## Teknisk informasjon

Nyskolen Posten er bygd med følgende teknologier:

- **React**: JavaScript-rammeverk for brukergrensesnitt
- **LocalStorage**: For å lagre data lokalt i nettleseren (i produksjon ville dette bli erstattet med en database)
- **Markdown**: For enkel formatering av artikkeltekst

### For utviklere

Hvis du vil bidra til utvikling av Nyskolen Posten, Eller har spørsmål Kan du sende en e-post til: redaksjonenyskolenposten@nionett.no

1. Prosjektet er tilgjengelig på GitHub
2. Koden er skrevet i JavaScript og React
3. Se README.md-filen i GitHub-repoet for detaljer om installasjon og oppsett
4. Alle elever oppfordres til å bidra til videreutvikling av nettavisen

Dette er en app som virkelig setter Nyskolens verdier i praksis - elevdrevet, demokratisk, og med rom for alles stemme!