const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./utils/config');
const { getDatabase, closeDatabase } = require('./database/init');
const { init: initPollingWorker } = require('./services/PollingWorker');
const dndRulesListener = require('./listeners/dndRulesListener');

// ==========================================
// INICIALIZAÇÃO DO CLIENTE DISCORD
// ==========================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,    // Necessário para receber mensagens
    GatewayIntentBits.MessageContent,   // Necessário para ler o conteúdo das mensagens
  ],
});

client.commands = new Collection();

// ==========================================
// CARREGAMENTO DE COMANDOS
// ==========================================
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Comando carregado: /${command.data.name}`);
  }
}

// ==========================================
// EVENTOS
// ==========================================
client.once(Events.ClientReady, (c) => {
  console.log(`\n⚔️  Koga está online como ${c.user.tag}!`);
  console.log(`🌐 Servindo ${c.guilds.cache.size} servidor(es).`);

  // Inicializar banco de dados
  getDatabase();

  // Inicializar Polling Worker (LoL)
  initPollingWorker(client);

  // Registrar listener de regras D&D
  dndRulesListener.register(client);

  // Status do bot
  client.user.setActivity('📜 Estudando suas derrotas...', { type: 4 });
});

// Handler de Slash Commands e Autocomplete
client.on(Events.InteractionCreate, async (interaction) => {
  // Autocomplete
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (!command || !command.autocomplete) return;
    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(`❌ Erro no autocomplete de /${interaction.commandName}:`, error);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Erro no comando /${interaction.commandName}:`, error);
    const reply = {
      embeds: [{
        title: '❌ Erro Interno',
        description: 'Ocorreu um erro ao executar este comando. Tente novamente.',
        color: 0xe74c3c,
      }],
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================
function shutdown(signal) {
  console.log(`\n🛑 Sinal ${signal} recebido. Encerrando Koga...`);
  closeDatabase();
  client.destroy();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ==========================================
// LOGIN
// ==========================================
client.login(config.discord.token);
