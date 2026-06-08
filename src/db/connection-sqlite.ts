import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.SQLITE_DB_PATH || './modelradar.db';
const db: Database.Database = new Database(dbPath);

// 初始化数据库schema
const schema = readFileSync(join(__dirname, 'schema-sqlite.sql'), 'utf-8');
db.exec(schema);

console.log(`SQLite database initialized at: ${dbPath}`);

export default db;
