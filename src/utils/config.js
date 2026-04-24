require('dotenv').config();

const config = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
  },
  riot: {
    apiKey: process.env.RIOT_API_KEY,
    region: process.env.RIOT_REGION || 'americas',
    platform: process.env.RIOT_PLATFORM || 'br1',
  },
  database: {
    path: process.env.DATABASE_PATH || 'data/koga.db',
  },
  polling: {
    intervalMinutes: parseInt(process.env.POLLING_INTERVAL_MINUTES || '5', 10),
    delayMs: parseInt(process.env.POLLING_DELAY_MS || '1500', 10),
  },
};

// Validação de variáveis obrigatórias
const required = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'RIOT_API_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Variável de ambiente obrigatória não definida: ${key}`);
    process.exit(1);
  }
}

module.exports = config;
