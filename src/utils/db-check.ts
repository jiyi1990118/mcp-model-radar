let dbAvailable: boolean | null = null;

export function isDatabaseAvailable(): boolean {
  if (dbAvailable !== null) return dbAvailable;

  try {
    const dbType = process.env.DB_TYPE || 'sqlite';

    if (dbType === 'sqlite') {
      const sqlitePath = process.env.SQLITE_DB_PATH || './modelradar.db';
      dbAvailable = true;
      return true;
    } else if (dbType === 'postgresql') {
      const hasConfig = !!(process.env.DB_HOST && process.env.DB_NAME);
      dbAvailable = hasConfig;
      return hasConfig;
    }

    dbAvailable = false;
    return false;
  } catch (error) {
    dbAvailable = false;
    return false;
  }
}

export function resetDatabaseAvailability() {
  dbAvailable = null;
}
