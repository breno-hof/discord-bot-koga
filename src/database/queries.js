const { getDatabase } = require('./init');

// ==========================================
// GUILD CONFIGS
// ==========================================

function upsertGuildConfig(guildId, channelId) {
  const db = getDatabase();
  db.prepare(`
    INSERT INTO guild_configs (guild_id, notification_channel_id, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(guild_id) DO UPDATE SET
      notification_channel_id = excluded.notification_channel_id,
      updated_at = CURRENT_TIMESTAMP
  `).run(guildId, channelId);
}

function getGuildConfig(guildId) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM guild_configs WHERE guild_id = ?').get(guildId);
}

// ==========================================
// TRACKED PLAYERS
// ==========================================

function addTrackedPlayer(puuid, riotIdTag, guildId) {
  const db = getDatabase();
  // Garante que a guild_config existe antes de inserir
  db.prepare(`
    INSERT OR IGNORE INTO guild_configs (guild_id) VALUES (?)
  `).run(guildId);

  const result = db.prepare(`
    INSERT OR IGNORE INTO tracked_players (puuid, riot_id_tag, guild_id)
    VALUES (?, ?, ?)
  `).run(puuid, riotIdTag, guildId);

  // true = jogador novo; false = já estava sendo monitorado neste servidor
  return result.changes > 0;
}

function getTrackedPlayersByGuild(guildId) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM tracked_players WHERE guild_id = ?').all(guildId);
}

function getAllTrackedPlayers() {
  const db = getDatabase();
  return db.prepare(`
    SELECT tp.*, gc.notification_channel_id
    FROM tracked_players tp
    JOIN guild_configs gc ON tp.guild_id = gc.guild_id
    WHERE gc.notification_channel_id IS NOT NULL
  `).all();
}

function updateLastMatchId(puuid, guildId, matchId) {
  const db = getDatabase();
  db.prepare(`
    UPDATE tracked_players SET last_match_id = ? WHERE puuid = ? AND guild_id = ?
  `).run(matchId, puuid, guildId);
}

function isMatchAlreadyAnalyzed(matchId, puuid, guildId) {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT id FROM match_history WHERE match_id = ? AND puuid = ? AND guild_id = ?
  `).get(matchId, puuid, guildId);
  return !!row;
}

// ==========================================
// MATCH HISTORY
// ==========================================

function saveMatchHistory({ matchId, puuid, guildId, win, duration, champion, kills, deaths, assists, goldEarned }) {
  const db = getDatabase();
  db.prepare(`
    INSERT OR IGNORE INTO match_history
      (match_id, puuid, guild_id, win, duration, champion, kills, deaths, assists, gold_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(matchId, puuid, guildId, win ? 1 : 0, duration, champion, kills, deaths, assists, goldEarned);
}

module.exports = {
  upsertGuildConfig,
  getGuildConfig,
  addTrackedPlayer,
  getTrackedPlayersByGuild,
  getAllTrackedPlayers,
  updateLastMatchId,
  isMatchAlreadyAnalyzed,
  saveMatchHistory,
};
