-- AI Model Intelligence Database Schema

-- Models table: Base model information
CREATE TABLE IF NOT EXISTS models (
  id SERIAL PRIMARY KEY,
  model_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  base_model VARCHAR(255),
  params VARCHAR(50),
  license VARCHAR(100),
  context_length INTEGER,
  tags TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  last_synced TIMESTAMP DEFAULT NOW()
);

-- Model metrics table: Time-series metrics
CREATE TABLE IF NOT EXISTS model_metrics (
  id SERIAL PRIMARY KEY,
  model_id VARCHAR(255) REFERENCES models(model_id) ON DELETE CASCADE,
  downloads BIGINT DEFAULT 0,
  likes INTEGER DEFAULT 0,
  trend_score DECIMAL(5,2) DEFAULT 0,
  snapshot_date TIMESTAMP DEFAULT NOW(),
  UNIQUE(model_id, snapshot_date)
);

-- Model pricing table: OpenRouter pricing data
CREATE TABLE IF NOT EXISTS model_pricing (
  id SERIAL PRIMARY KEY,
  model_id VARCHAR(255) REFERENCES models(model_id) ON DELETE CASCADE,
  provider VARCHAR(100),
  input_cost DECIMAL(10,6),
  output_cost DECIMAL(10,6),
  context_length INTEGER,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(model_id, provider)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_models_author ON models(author);
CREATE INDEX IF NOT EXISTS idx_models_updated ON models(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_snapshot ON model_metrics(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_trend ON model_metrics(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_provider ON model_pricing(provider);

-- Historical metrics tracking table
CREATE TABLE IF NOT EXISTS metrics_history (
  id SERIAL PRIMARY KEY,
  model_id VARCHAR(255) REFERENCES models(model_id),
  downloads BIGINT DEFAULT 0,
  likes INTEGER DEFAULT 0,
  trend_score DECIMAL(5,2) DEFAULT 0,
  arena_rank INTEGER,
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_history_model ON metrics_history(model_id);
CREATE INDEX IF NOT EXISTS idx_metrics_history_recorded ON metrics_history(recorded_at);

-- GitHub repositories tracking table
CREATE TABLE IF NOT EXISTS github_repos (
  id SERIAL PRIMARY KEY,
  repo_full_name VARCHAR(255) NOT NULL UNIQUE,
  model_id VARCHAR(255) REFERENCES models(model_id) ON DELETE SET NULL,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  description TEXT,
  language VARCHAR(50),
  topics TEXT[],
  pushed_at TIMESTAMP,
  collected_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_github_stars ON github_repos(stars DESC);
CREATE INDEX IF NOT EXISTS idx_github_model ON github_repos(model_id);
