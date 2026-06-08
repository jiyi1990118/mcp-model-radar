-- AI Model Intelligence Database Schema (SQLite)

-- Models table: Base model information
CREATE TABLE IF NOT EXISTS models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  author TEXT,
  base_model TEXT,
  params TEXT,
  license TEXT,
  context_length INTEGER,
  tags TEXT,
  created_at TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_synced TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Model metrics table: Time-series metrics
CREATE TABLE IF NOT EXISTS model_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id TEXT NOT NULL,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  trend_score REAL DEFAULT 0,
  snapshot_date TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(model_id) ON DELETE CASCADE,
  UNIQUE(model_id, snapshot_date)
);

-- Model pricing table: OpenRouter pricing data
CREATE TABLE IF NOT EXISTS model_pricing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id TEXT NOT NULL,
  provider TEXT,
  input_cost REAL,
  output_cost REAL,
  context_length INTEGER,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(model_id) ON DELETE CASCADE
);

-- Historical metrics tracking table
CREATE TABLE IF NOT EXISTS metrics_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id TEXT NOT NULL,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  trend_score REAL DEFAULT 0,
  arena_rank INTEGER,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(model_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_models_author ON models(author);
CREATE INDEX IF NOT EXISTS idx_models_updated ON models(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_snapshot ON model_metrics(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_trend ON model_metrics(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_provider ON model_pricing(provider);
CREATE INDEX IF NOT EXISTS idx_metrics_history_model ON metrics_history(model_id);
CREATE INDEX IF NOT EXISTS idx_metrics_history_recorded ON metrics_history(recorded_at);
