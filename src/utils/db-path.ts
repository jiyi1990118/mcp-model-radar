import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Get the default database path for SQLite.
 * Uses ~/.mcp-model-radar/modelradar.db as the single shared location.
 * Can be overridden via SQLITE_DB_PATH environment variable.
 */
export function getDefaultDbPath(): string {
  const dir = join(homedir(), '.mcp-model-radar');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return join(dir, 'modelradar.db');
}
