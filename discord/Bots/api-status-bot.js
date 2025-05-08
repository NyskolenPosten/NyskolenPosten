let oppgaver = [];

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

const API_URLS = [
  { navn: 'Supabase', url: `${SUPABASE_URL}/rest/v1/` },
  // Legg til flere API-er her hvis du vil
];

// Test API-tilkobling ved oppstart
(async () => {
  try {
    const res = await fetch(API_URLS[0].url);
    console.log(`✅ Botten fikk kontakt med API-et '${API_URLS[0].navn}' (HTTP ${res.status}) ved oppstart.`);
  } catch (err) {
    console.error(`❌ Botten fikk IKKE kontakt med API-et '${API_URLS[0].navn}' ved oppstart:`, err.message);
  }
})();

// Legg til flere systemer du vil overvåke her
const SYSTEMS = [
  { navn: 'Supabase API', type: 'api', url: 'http://localhost:54321/rest/v1/' },
  { navn: 'Server', type: 'server' },
  { navn: 'Database', type: 'db' },
  { navn: 'E-post', type: 'email' },
];

// Funksjon for å sjekke status på alle systemer
async function sjekkAlleSystemer() {
  let statusMeldinger = [];
  for (const system of SYSTEMS) {
    if (system.type === 'api') {
      try {
        const res = await fetch(system.url);
        if (res.ok) {
          statusMeldinger.push(`**${system.navn}**: Operational`);
        } else {
          statusMeldinger.push(`**${system.navn}**: Nede (HTTP ${res.status})`);
        }
      } catch (err) {
        statusMeldinger.push(`**${system.navn}**: Nede`);
      }
    } else if (system.type === 'server') {
      // Her kan du legge til ekte sjekk senere
      statusMeldinger.push(`**${system.navn}**: Operational`);
    } else if (system.type === 'db') {
      // Her kan du legge til ekte sjekk senere
      statusMeldinger.push(`**${system.navn}**: Operational`);
    } else if (system.type === 'email') {
      // Her kan du legge til ekte sjekk senere
      statusMeldinger.push(`**${system.navn}**: Nede`);
    }
  }
  return '🟩 Systemstatus\n\n' + statusMeldinger.join('\n');
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

async function sjekkApiStatus() {
  let statusMeldinger = [];
  for (const api of API_URLS) {
    try {
      const res = await fetch(api.url);
      statusMeldinger.push(`✅ ${api.navn}: HTTP ${res.status}`);
      // Fjern eventuell gammel oppgave hvis API-et nå svarer
      oppgaver = oppgaver.filter(o => !o.includes(api.navn));
    } catch (err) {
      statusMeldinger.push(`❌ ${api.navn}: Fikk ikke kontakt med serveren`);
      // Legg til oppgave hvis den ikke allerede finnes
      if (!oppgaver.some(o => o.includes(api.navn))) {
        oppgaver.push(`${api.navn}: API-et svarer ikke!`);
      }
    }
  }
  return statusMeldinger.join('\n');
}

client.once('ready', () => {
  console.log(`Botten er klar som ${client.user.tag}!`);
  const kanal = client.channels.cache.get(CHANNEL_ID);

  // Sjekk status med én gang ved oppstart
  sjekkApiStatus().then(melding => {
    if (kanal) kanal.send(melding);
  });

  // Sjekk status hvert 10. minutt (600000 ms)
  setInterval(async () => {
    const melding = await sjekkApiStatus();
    if (kanal) kanal.send(melding);
  }, 600000);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content === '!tasks') {
    if (oppgaver.length === 0) {
      message.channel.send('Ingen oppgaver akkurat nå! 🎉');
    } else {
      message.channel.send('Her er dine oppgaver:\n' + oppgaver.map((t, i) => `${i + 1}. ${t}`).join('\n'));
    }
  } else if (message.content === '!sjekk alle') {
    const melding = await sjekkAlleSystemer();
    message.channel.send(melding);
  } else if (message.content === '!sjekk api') {
    const api = API_URLS[0];
    try {
      const res = await fetch(api.url);
      message.channel.send(`✅ ${api.navn}: HTTP ${res.status}`);
    } catch (err) {
      message.channel.send(`❌ ${api.navn}: Fikk ikke kontakt med serveren`);
    }
  } else if (message.content === '!sjekk server') {
    message.channel.send('Serveren kjører! 🚀');
  } else if (message.content === '!help') {
    message.channel.send('Tilgjengelige kommandoer:\n- !tasks: Vis oppgaver\n- !sjekk alle: Sjekk alle systemer\n- !sjekk api: Sjekk bare API-et\n- !sjekk server: Sjekk serveren\n- !help: Vis denne hjelpen');
  }
});

client.login(DISCORD_TOKEN);
