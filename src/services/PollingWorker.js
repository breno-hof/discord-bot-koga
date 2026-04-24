const cron = require('node-cron');
const config = require('../utils/config');
const {
  getAllTrackedPlayers,
  updateLastMatchId,
  isMatchAlreadyAnalyzed,
  saveMatchHistory,
} = require('../database/queries');
const { getMatchIdsByPuuid, getMatchById, extractPlayerStats } = require('./RiotApiService');
const { analyze, formatEmbed } = require('../engine/HistoryEngine');

let discordClient = null;
let isRunning = false;

/**
 * Inicializa o Polling Worker com o cliente Discord.
 * @param {import('discord.js').Client} client
 */
function init(client) {
  discordClient = client;

  const cronExpression = `*/${config.polling.intervalMinutes} * * * *`;
  console.log(`⏰ Polling Worker iniciado. Intervalo: a cada ${config.polling.intervalMinutes} minutos.`);

  cron.schedule(cronExpression, async () => {
    if (isRunning) {
      console.log('⏭️  Polling já em execução. Pulando ciclo.');
      return;
    }
    await runPollingCycle();
  });
}

/**
 * Executa um ciclo completo de polling para todos os jogadores monitorados.
 */
async function runPollingCycle() {
  isRunning = true;
  console.log(`🔄 [Polling] Iniciando ciclo em ${new Date().toISOString()}`);

  try {
    const players = getAllTrackedPlayers();
    console.log(`👥 [Polling] ${players.length} jogador(es) monitorado(s).`);

    for (const player of players) {
      await processPlayer(player);
      // Delay entre requisições para respeitar o rate limit da Riot API
      await sleep(config.polling.delayMs);
    }
  } catch (error) {
    console.error('❌ [Polling] Erro no ciclo de polling:', error.message);
  } finally {
    isRunning = false;
    console.log(`✅ [Polling] Ciclo concluído em ${new Date().toISOString()}`);
  }
}

/**
 * Processa um único jogador: verifica novas partidas e envia análise se necessário.
 * @param {object} player - Registro da tabela tracked_players com notification_channel_id
 */
async function processPlayer(player) {
  const { puuid, riot_id_tag, last_match_id, guild_id, notification_channel_id } = player;

  try {
    const matchIds = await getMatchIdsByPuuid(puuid, 1);

    if (!matchIds || matchIds.length === 0) return;

    const latestMatchId = matchIds[0];

    // Verifica se é uma partida nova
    if (latestMatchId === last_match_id) return;
    if (await isMatchAlreadyAnalyzed(latestMatchId, puuid, guild_id)) return;

    console.log(`🎮 [Polling] Nova partida detectada para ${riot_id_tag}: ${latestMatchId}`);

    const matchData = await getMatchById(latestMatchId);
    const stats = extractPlayerStats(matchData, puuid);

    // Salva no histórico independente do resultado
    saveMatchHistory({
      matchId: latestMatchId,
      puuid,
      guildId: guild_id,
      win: stats.win,
      duration: stats.duration,
      champion: stats.champion,
      kills: stats.kills,
      deaths: stats.deaths,
      assists: stats.assists,
      goldEarned: stats.goldEarned,
    });

    // Atualiza o last_match_id
    updateLastMatchId(puuid, guild_id, latestMatchId);

    // Só envia análise em caso de derrota
    if (!stats.win) {
      const analysis = analyze(stats, riot_id_tag);
      const embed = formatEmbed(analysis);

      if (embed && notification_channel_id) {
        const channel = await discordClient.channels.fetch(notification_channel_id).catch(() => null);
        if (channel) {
          await channel.send({ embeds: [embed] });
          console.log(`📢 [Polling] Análise enviada para o canal ${notification_channel_id} (Guild: ${guild_id})`);
        }
      }
    }
  } catch (error) {
    if (error.message === 'RIOT_KEY_EXPIRED') {
      console.error('🔑 [Polling] CRÍTICO: Chave da Riot API expirada. Suspendendo polling.');
      isRunning = true; // Bloqueia próximos ciclos até reinicialização
      return;
    }
    if (error.message === 'RIOT_NOT_FOUND') {
      console.warn(`🔍 [Polling] Jogador ${riot_id_tag} não encontrado na API. Pulando.`);
      return;
    }
    console.error(`❌ [Polling] Erro ao processar ${riot_id_tag}:`, error.message);
  }
}

/**
 * Utilitário de delay assíncrono.
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { init, runPollingCycle };
