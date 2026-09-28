// Minecraft Username Rarity & OG Value Appraisal Engine
// Evaluates names on character length, dictionary clean status, alphanumeric rarity, and market prestige

export class NameAppraiser {
  static DICTIONARY_WORDS = new Set([
    'god', 'ace', 'air', 'art', 'ash', 'bad', 'bar', 'bat', 'bay', 'bed', 'bee', 'bet', 'big',
    'bit', 'bow', 'box', 'boy', 'bug', 'bus', 'buy', 'cam', 'can', 'cap', 'car', 'cat', 'cow',
    'cry', 'cup', 'cut', 'dad', 'dam', 'day', 'die', 'dig', 'dim', 'dog', 'dot', 'dry', 'due',
    'dye', 'ear', 'eat', 'egg', 'ego', 'elf', 'end', 'era', 'eve', 'eye', 'fan', 'fat', 'fee',
    'few', 'fig', 'fit', 'fix', 'fly', 'fog', 'for', 'fox', 'fry', 'fun', 'fur', 'gap', 'gas',
    'gem', 'get', 'god', 'gum', 'gun', 'gut', 'guy', 'gym', 'ham', 'hat', 'hay', 'hen', 'hex',
    'hid', 'hip', 'hit', 'hop', 'hot', 'how', 'hub', 'hug', 'hum', 'hut', 'ice', 'ill', 'ink',
    'inn', 'ion', 'ivy', 'jam', 'jar', 'jaw', 'jay', 'jet', 'jew', 'job', 'jog', 'joy', 'jug',
    'key', 'kid', 'kin', 'kit', 'lab', 'lad', 'lap', 'law', 'lay', 'leg', 'lid', 'lie', 'lip',
    'log', 'lot', 'low', 'mad', 'man', 'map', 'mat', 'may', 'men', 'met', 'mix', 'mob', 'mom',
    'mop', 'mud', 'mug', 'nab', 'nag', 'nap', 'net', 'new', 'nil', 'nod', 'not', 'now', 'nun',
    'nut', 'oak', 'oar', 'oat', 'odd', 'off', 'oil', 'old', 'one', 'opt', 'orb', 'ore', 'our',
    'out', 'owl', 'own', 'pad', 'pan', 'pat', 'paw', 'pay', 'pea', 'peg', 'pen', 'pet', 'pie',
    'pig', 'pin', 'pit', 'pod', 'pop', 'pot', 'pro', 'pub', 'pun', 'pup', 'rad', 'rag', 'ram',
    'ran', 'rap', 'rat', 'raw', 'ray', 'red', 'rib', 'rid', 'rig', 'rim', 'rip', 'rob', 'rod',
    'rot', 'row', 'rub', 'rug', 'run', 'rut', 'rye', 'sad', 'sag', 'sap', 'sat', 'saw', 'say',
    'sea', 'see', 'set', 'sew', 'sin', 'sip', 'sir', 'sit', 'six', 'ski', 'sky', 'sly', 'sob',
    'son', 'sop', 'sow', 'soy', 'spa', 'spy', 'sum', 'sun', 'tab', 'tag', 'tan', 'tap', 'tar',
    'tax', 'tea', 'ten', 'the', 'tie', 'tin', 'tip', 'toe', 'ton', 'top', 'toy', 'tub', 'tug',
    'two', 'urn', 'use', 'van', 'vat', 'vet', 'vex', 'via', 'vow', 'war', 'wax', 'way', 'web',
    'wed', 'wet', 'who', 'why', 'wig', 'win', 'wit', 'woe', 'won', 'woo', 'yak', 'yam', 'yap',
    'jaw', 'yen', 'yew', 'yin', 'zap', 'zen', 'zig', 'zip', 'zoo',
    'aero', 'aura', 'void', 'echo', 'mist', 'haze', 'nova', 'zenith', 'vortex', 'specter',
    'blaze', 'shadow', 'frost', 'lunar', 'solar', 'pulse', 'pixel', 'drift', 'eclipse', 'matrix',
    'phantom', 'reaper', 'hunter', 'knight', 'legend', 'master', 'player', 'dragon', 'steve', 'alex', 'notch'
  ]);

  static evaluate(name) {
    if (!name || typeof name !== 'string') {
      return null;
    }

    const clean = name.trim();
    const lower = clean.toLowerCase();
    const len = clean.length;

    let score = 50;
    const highlights = [];
    let isDictionary = this.DICTIONARY_WORDS.has(lower);
    const hasUnderscore = clean.includes('_');
    const hasNumber = /[0-9]/.test(clean);
    const isLettersOnly = /^[a-zA-Z]+$/.test(clean);
    const isDigitsOnly = /^[0-9]+$/.test(clean);

    // Length evaluation
    if (len === 1) {
      score = 100;
      highlights.push('1-Character Legend (Extremely impossible to obtain)');
    } else if (len === 2) {
      score = 98;
      highlights.push('2-Character Ultra OG (Max prestige tier)');
    } else if (len === 3) {
      if (isLettersOnly) {
        score = 95;
        highlights.push('3-Letter Pure OG (Highest Tier market demand)');
      } else if (isDigitsOnly) {
        score = 92;
        highlights.push('3-Digit Pure OG (Rare collectible)');
      } else if (!hasUnderscore) {
        score = 88;
        highlights.push('3-Character Alphanumeric Clean handle');
      } else {
        score = 82;
        highlights.push('3-Character handle with underscore');
      }
    } else if (len === 4) {
      if (isDictionary) {
        score = 96;
        highlights.push('4-Letter Clean Dictionary Word');
      } else if (isLettersOnly) {
        score = 84;
        highlights.push('4-Letter Pure Alphabet handle');
      } else if (!hasUnderscore) {
        score = 74;
        highlights.push('4-Character Alphanumeric handle');
      } else {
        score = 65;
        highlights.push('4-Character handle with underscore');
      }
    } else {
      // 5+ Characters
      if (isDictionary) {
        score = 92;
        highlights.push('Clean English Dictionary Noun / Concept');
      } else if (isLettersOnly) {
        score = Math.max(55, 80 - (len - 5) * 2);
        highlights.push('Clean Letters Only (No digits/symbols)');
      } else {
        score = Math.max(25, 60 - (len - 5) * 3);
      }
    }

    // Bonuses & Penalties
    if (isLettersOnly && !highlights.some(h => h.includes('Letters Only'))) {
      score += 4;
    }
    if (hasUnderscore) {
      if (clean.startsWith('_') || clean.endsWith('_')) {
        score -= 8;
        highlights.push('Leading or trailing underscore present');
      }
      if (clean.includes('__')) {
        score -= 12;
      }
    }
    if (hasNumber && len > 4) {
      score -= 6;
    }

    // Capitalization style
    if (/^[A-Z][a-z0-9_]+$/.test(clean)) {
      highlights.push('Proper TitleCase formatting');
      score += 2;
    }

    // Clamp score
    score = Math.min(100, Math.max(15, score));

    // Determine Tier
    let tier = '';
    let badgeClass = '';
    let estimatedMarket = '';

    if (score >= 95) {
      tier = 'Tier S+ (Holy Grail OG)';
      badgeClass = 'appraisal-s-plus';
      estimatedMarket = 'High Collector Market ($200 - $1,500+)';
    } else if (score >= 88) {
      tier = 'Tier S (Clean OG)';
      badgeClass = 'appraisal-s';
      estimatedMarket = 'Solid OG Demand ($80 - $250)';
    } else if (score >= 75) {
      tier = 'Tier A (Rare Semi-OG)';
      badgeClass = 'appraisal-a';
      estimatedMarket = 'Semi-OG Collector Tier ($30 - $80)';
    } else if (score >= 60) {
      tier = 'Tier B (Aesthetic Clean)';
      badgeClass = 'appraisal-b';
      estimatedMarket = 'Moderate Interest ($10 - $30)';
    } else {
      tier = 'Tier C (Standard Player Handle)';
      badgeClass = 'appraisal-c';
      estimatedMarket = 'Personal Account Value';
    }

    return {
      score,
      tier,
      badgeClass,
      estimatedMarket,
      highlights,
      length: len,
      isDictionary,
      isLettersOnly
    };
  }
}
