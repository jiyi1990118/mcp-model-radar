// src/analysis/sentiment.ts

/**
 * Lightweight keyword-based sentiment analysis for community discussions.
 * No NLP library dependency — uses curated keyword dictionaries.
 * Returns a score from -100 (extremely negative) to +100 (extremely positive).
 */

const POSITIVE_KEYWORDS = [
  'breakthrough', 'impressive', 'amazing', 'excellent', 'state-of-the-art', 'sota',
  'game changer', 'revolutionary', 'incredible', 'outstanding', 'remarkable',
  'best', 'great', 'awesome', 'fantastic', 'superb', 'brilliant',
  'love', 'fast', 'efficient', 'powerful', 'accurate', 'robust',
  'promising', 'innovative', 'leading', 'top-tier', 'world-class',
  'underrated', 'gem', 'sleeper hit', 'must try', 'highly recommend'
];

const NEGATIVE_KEYWORDS = [
  'disappointing', 'overhyped', 'slow', 'broken', 'useless', 'worse',
  'fail', 'failure', 'terrible', 'awful', 'horrible', 'bad',
  'bug', 'buggy', 'crash', 'unstable', 'unreliable', 'inaccurate',
  'overrated', 'garbage', 'trash', 'waste', 'poor', 'mediocre',
  'hallucination', 'hallucinate', 'incorrect', 'wrong', 'misleading',
  'censored', 'biased', 'dangerous', 'harmful'
];

const STRONG_MODIFIERS = ['very', 'extremely', 'incredibly', 'absolutely', 'really'];

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

export function analyzeSentiment(text: string): {
  score: number;
  positive_hits: string[];
  negative_hits: string[];
  label: 'positive' | 'negative' | 'neutral';
} {
  const tokens = tokenize(text);
  const positiveHits: string[] = [];
  const negativeHits: string[] = [];

  // Check for multi-word phrases first
  const textLower = text.toLowerCase();

  for (const kw of POSITIVE_KEYWORDS) {
    if (textLower.includes(kw)) {
      positiveHits.push(kw);
    }
  }

  for (const kw of NEGATIVE_KEYWORDS) {
    if (textLower.includes(kw)) {
      negativeHits.push(kw);
    }
  }

  // Apply intensity modifiers
  let posWeight = positiveHits.length;
  let negWeight = negativeHits.length;

  for (const mod of STRONG_MODIFIERS) {
    if (textLower.includes(mod)) {
      // Check if modifier precedes a sentiment word
      const modIdx = textLower.indexOf(mod);
      const afterMod = textLower.substring(modIdx + mod.length, modIdx + mod.length + 50);
      const hasPositive = POSITIVE_KEYWORDS.some(kw => afterMod.includes(kw));
      const hasNegative = NEGATIVE_KEYWORDS.some(kw => afterMod.includes(kw));
      if (hasPositive) posWeight += 0.5;
      if (hasNegative) negWeight += 0.5;
    }
  }

  const total = posWeight + negWeight;
  if (total === 0) {
    return { score: 0, positive_hits: [], negative_hits: [], label: 'neutral' };
  }

  // Normalize to -100 to +100
  const score = Math.round(((posWeight - negWeight) / total) * 100);

  let label: 'positive' | 'negative' | 'neutral';
  if (score > 15) label = 'positive';
  else if (score < -15) label = 'negative';
  else label = 'neutral';

  return { score, positive_hits: positiveHits, negative_hits: negativeHits, label };
}

/**
 * Aggregate sentiment across multiple texts.
 */
export function aggregateSentiment(texts: string[]): {
  score: number;
  count: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  label: string;
} {
  const results = texts.map(analyzeSentiment);
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  return {
    score: avgScore,
    count: results.length,
    positive_count: results.filter(r => r.label === 'positive').length,
    negative_count: results.filter(r => r.label === 'negative').length,
    neutral_count: results.filter(r => r.label === 'neutral').length,
    label: avgScore > 15 ? 'positive' : avgScore < -15 ? 'negative' : 'neutral'
  };
}
