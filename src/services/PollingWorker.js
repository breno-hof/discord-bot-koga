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
// Fica true quando a chave da Riot expira; só volta a false com reinício do processo.
let isSuspended = false;

/**
 * Inicializa o Polling Worker com o cliente Discord.
 * @param {import('discord.js').Client} client
 */
function init(client) {
  discordClient = client;

  const cronExpression = `*/${config.polling.intervalMinutes} * * * *`;
  console.log(`⏰ Polling Worker iniciado. Intervalo: a cada ${config.polling.intervalMinutes} minutos.`);

  cron.schedule(cronExpression, async () => {
    if (isSuspended) {
      console.warn('🔑 [Polling] Suspenso: chave da Riot API expirada. Atualize RIOT_API_KEY e reinicie o bot.');
      return;
    }
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
      const outcome = await processPlayer(player);

      if (outcome === 'KEY_EXPIRED') {
        console.error('🔑 [Polling] CRÍTICO: Chave da Riot API expirada. Polling suspenso até o bot ser reiniciado com uma chave válida.');
        isSuspended = true;
        break;
      }
      if (outcome === 'RATE_LIMITED') {
        console.warn('⏳ [Polling] Rate limit atingido. Encerrando o ciclo; os jogadores restantes serão verificados no próximo.');
        break;
      }

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
 * @returns {Promise<'OK'|'KEY_EXPIRED'|'RATE_LIMITED'>}
 */
async function processPlayer(player) {
  const { puuid, riot_id_tag, last_match_id, guild_id, notification_channel_id } = player;

  try {
    const matchIds = await getMatchIdsByPuuid(puuid, 1);

    if (!matchIds || matchIds.length === 0) return 'OK';

    const latestMatchId = matchIds[0];

    // Verifica se é uma partida nova
    if (latestMatchId === last_match_id) return 'OK';
    if (isMatchAlreadyAnalyzed(latestMatchId, puuid, guild_id)) return 'OK';

    // Primeira verificação após o /vincular: apenas registra a partida mais recente
    // como ponto de partida, para não analisar uma derrota antiga.
    if (!last_match_id) {
      updateLastMatchId(puuid, guild_id, latestMatchId);
      console.log(`📌 [Polling] Ponto de partida definido para ${riot_id_tag}: ${latestMatchId}`);
      return 'OK';
    }

    console.log(`🎮 [Polling] Nova partida detectada para ${riot_id_tag}: ${latestMatchId}`);

    const matchData = await getMatchById(latestMatchId);
    const stats = extractPlayerStats(matchData, puuid);

    // Atualiza o last_match_id antes de qualquer outra coisa
    updateLastMatchId(puuid, guild_id, latestMatchId);

    // Remakes não contam como derrota nem entram no histórico
    if (stats.isRemake) {
      console.log(`↩️  [Polling] Partida ${latestMatchId} de ${riot_id_tag} foi remake. Ignorando.`);
      return 'OK';
    }

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

    // Só envia análise em caso de derrota
    if (!stats.win) {
      const analysis = analyze(stats, riot_id_tag);
      const embed = formatEmbed(analysis);

      if (embed && notification_channel_id) {
        const channel = await discordClient.channels.fetch(notification_channel_id).catch(() => null);
        if (channel && channel.isTextBased()) {
          await channel.send({ embeds: [embed] });
          console.log(`📢 [Polling] Análise enviada para o canal ${notification_channel_id} (Guild: ${guild_id})`);
        } else {
          console.warn(`⚠️  [Polling] Canal ${notification_channel_id} inacessível (Guild: ${guild_id}).`);
        }
      }
    }
    return 'OK';
  } catch (error) {
    if (error.message === 'RIOT_KEY_EXPIRED') return 'KEY_EXPIRED';
    if (error.message === 'RIOT_RATE_LIMIT') return 'RATE_LIMITED';
    if (error.message === 'RIOT_NOT_FOUND') {
      console.warn(`🔍 [Polling] Jogador ${riot_id_tag} não encontrado na API. Pulando.`);
      return 'OK';
    }
    console.error(`❌ [Polling] Erro ao processar ${riot_id_tag}:`, error.message);
    return 'OK';
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
