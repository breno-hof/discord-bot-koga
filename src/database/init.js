const Database = require('better-sqlite3');
const path = require('path');
const config = require('../utils/config');

let db = null;

function getDatabase() {
  if (db) return db;

  const dbPath = path.resolve(process.cwd(), config.database.path);

  // Garantir que o diretório existe
  const fs = require('fs');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new Database(dbPath);

  // Performance e integridade
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // ==========================================
  // SCHEMA DO BANCO DE DADOS
  // ==========================================
  db.exec(`
    -- Configuração por servidor (multi-tenant)
    CREATE TABLE IF NOT EXISTS guild_configs (
      guild_id                TEXT PRIMARY KEY,
      notification_channel_id TEXT,
      prefix                  TEXT DEFAULT '/',
      created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Jogadores monitorados por servidor
    CREATE TABLE IF NOT EXISTS tracked_players (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      puuid        TEXT    NOT NULL,
      riot_id_tag  TEXT    NOT NULL,
      last_match_id TEXT,
      guild_id     TEXT    NOT NULL,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(puuid, guild_id),
      FOREIGN KEY (guild_id) REFERENCES guild_configs(guild_id) ON DELETE CASCADE
    );

    -- Histórico de partidas analisadas
    CREATE TABLE IF NOT EXISTS match_history (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id     TEXT    NOT NULL,
      puuid        TEXT    NOT NULL,
      guild_id     TEXT    NOT NULL,
      win          INTEGER NOT NULL DEFAULT 0,
      duration     INTEGER NOT NULL DEFAULT 0,
      champion     TEXT,
      kills        INTEGER DEFAULT 0,
      deaths       INTEGER DEFAULT 0,
      assists      INTEGER DEFAULT 0,
      gold_earned  INTEGER DEFAULT 0,
      analyzed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(match_id, puuid, guild_id),
      FOREIGN KEY (puuid, guild_id) REFERENCES tracked_players(puuid, guild_id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Banco de dados inicializado.');
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDatabase, closeDatabase };
