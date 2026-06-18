import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getDefaultDbPath } from '../utils/db-path.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.SQLITE_DB_PATH || getDefaultDbPath();
const db: Database.Database = new Database(dbPath);

// 初始化数据库schema
const schema = readFileSync(join(__dirname, 'schema-sqlite.sql'), 'utf-8');
db.exec(schema);

// Enable WAL mode for concurrent read access (required for HTTP transport mode)
db.pragma('journal_mode = WAL');
// Wait up to 5 seconds if the database is locked by another connection
db.pragma('busy_timeout = 5000');

console.error(`SQLite database initialized at: ${dbPath}`);

export default db;
