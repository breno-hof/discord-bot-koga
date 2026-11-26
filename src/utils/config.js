require('dotenv').config();

const config = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
  },
  riot: {
    apiKey: process.env.RIOT_API_KEY,
    region: process.env.RIOT_REGION || 'americas',
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

// O polling usa a expressão cron "*/N * * * *", que só é válida para N entre 1 e 59.
const interval = config.polling.intervalMinutes;
if (!Number.isInteger(interval) || interval < 1 || interval > 59) {
  console.error(`❌ POLLING_INTERVAL_MINUTES inválido (${process.env.POLLING_INTERVAL_MINUTES}). Use um inteiro entre 1 e 59.`);
  process.exit(1);
}
if (!Number.isInteger(config.polling.delayMs) || config.polling.delayMs < 0) {
  console.error(`❌ POLLING_DELAY_MS inválido (${process.env.POLLING_DELAY_MS}). Use um inteiro maior ou igual a 0.`);
  process.exit(1);
}

module.exports = config;
