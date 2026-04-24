const axios = require('axios');
const config = require('../utils/config');

const ACCOUNT_BASE_URL = `https://${config.riot.region}.api.riotgames.com`;
const MATCH_BASE_URL = `https://${config.riot.region}.api.riotgames.com`;

const riotAxios = axios.create({
  headers: {
    'X-Riot-Token': config.riot.apiKey,
  },
  timeout: 10000,
});

/**
 * Busca o PUUID de um jogador pelo Riot ID (gameName + tagLine).
 * @param {string} gameName
 * @param {string} tagLine
 * @returns {Promise<{puuid: string, gameName: string, tagLine: string}>}
 */
async function getPuuidByRiotId(gameName, tagLine) {
  try {
    const url = `${ACCOUNT_BASE_URL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const response = await riotAxios.get(url);
    return response.data;
  } catch (error) {
    handleRiotError(error, `getPuuidByRiotId(${gameName}#${tagLine})`);
  }
}

/**
 * Busca os IDs das últimas partidas de um jogador.
 * @param {string} puuid
 * @param {number} count - Quantidade de partidas (padrão: 1)
 * @returns {Promise<string[]>}
 */
async function getMatchIdsByPuuid(puuid, count = 1) {
  try {
    const url = `${MATCH_BASE_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=${count}`;
    const response = await riotAxios.get(url);
    return response.data;
  } catch (error) {
    handleRiotError(error, `getMatchIdsByPuuid(${puuid})`);
  }
}

/**
 * Busca os detalhes completos de uma partida.
 * @param {string} matchId
 * @returns {Promise<object>}
 */
async function getMatchById(matchId) {
  try {
    const url = `${MATCH_BASE_URL}/lol/match/v5/matches/${matchId}`;
    const response = await riotAxios.get(url);
    return response.data;
  } catch (error) {
    handleRiotError(error, `getMatchById(${matchId})`);
  }
}

/**
 * Extrai as estatísticas relevantes de um jogador em uma partida.
 * @param {object} matchData - Dados completos da partida (MATCH-V5)
 * @param {string} puuid
 * @returns {object} Estatísticas do jogador
 */
function extractPlayerStats(matchData, puuid) {
  const participant = matchData.info.participants.find(p => p.puuid === puuid);
  if (!participant) throw new Error(`Participante com PUUID ${puuid} não encontrado na partida.`);

  return {
    matchId: matchData.metadata.matchId,
    win: participant.win,
    champion: participant.championName,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    goldEarned: participant.goldEarned,
    // Duração em segundos
    duration: matchData.info.gameDuration,
    // Objetivos globais perdidos (torres, drakes, baron)
    teamId: participant.teamId,
    teamData: matchData.info.teams.find(t => t.teamId === participant.teamId),
    enemyTeamData: matchData.info.teams.find(t => t.teamId !== participant.teamId),
  };
}

/**
 * Tratamento centralizado de erros da Riot API.
 */
function handleRiotError(error, context) {
  if (error.response) {
    const status = error.response.status;
    if (status === 403) {
      console.error(`🔑 [RIOT API] Chave de API expirada ou inválida. Contexto: ${context}`);
      throw new Error('RIOT_KEY_EXPIRED');
    }
    if (status === 404) {
      console.warn(`🔍 [RIOT API] Recurso não encontrado. Contexto: ${context}`);
      throw new Error('RIOT_NOT_FOUND');
    }
    if (status === 429) {
      console.warn(`⏳ [RIOT API] Rate limit atingido. Contexto: ${context}`);
      throw new Error('RIOT_RATE_LIMIT');
    }
    console.error(`❌ [RIOT API] Erro ${status}. Contexto: ${context}`, error.response.data);
    throw new Error(`RIOT_API_ERROR_${status}`);
  }
  console.error(`❌ [RIOT API] Erro de rede. Contexto: ${context}`, error.message);
  throw error;
}

module.exports = {
  getPuuidByRiotId,
  getMatchIdsByPuuid,
  getMatchById,
  extractPlayerStats,
};
