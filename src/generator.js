// OG & Clean Minecraft Name Generator & Pattern Finder

export class NameGenerator {
  static VOWELS = ['a', 'e', 'i', 'o', 'u'];
  static CONSONANTS = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
  static ALPHANUM = 'abcdefghijklmnopqrstuvwxyz0123456789_';
  static LETTERS = 'abcdefghijklmnopqrstuvwxyz';
  static DIGITS = '0123456789';

  static AESTHETIC_WORDS = [
    'Aero', 'Aura', 'Blaze', 'Bloom', 'Breeze', 'Chasm', 'Cipher', 'Cloud', 'Comet', 'Cosmo',
    'Crest', 'Crypt', 'Dawn', 'Drift', 'Dusk', 'Echo', 'Eclipse', 'Ember', 'Fade', 'Flare',
    'Flux', 'Frost', 'Gaze', 'Gleam', 'Glide', 'Glint', 'Gloom', 'Glow', 'Haven', 'Haze',
    'Helix', 'Horizon', 'Hymn', 'Karma', 'Lunar', 'Lush', 'Lyric', 'Mist', 'Mystic', 'Nebula',
    'Nexus', 'Night', 'Nova', 'Oasis', 'Orbit', 'Origin', 'Phase', 'Pixel', 'Prism', 'Pulse',
    'Quark', 'Rift', 'Rune', 'Shadow', 'Shard', 'Solar', 'Sonic', 'Spark', 'Specter', 'Spire',
    'Static', 'Surge', 'Tide', 'Twilight', 'Valkyrie', 'Vapor', 'Vault', 'Vector', 'Velvet', 'Vibe',
    'Vivid', 'Void', 'Vortex', 'Wave', 'Whisper', 'Zen', 'Zephyr', 'Zero'
  ];

  static PREFIXES = ['Neo', 'Aero', 'Hyper', 'Ultra', 'Cyber', 'Null', 'Mono', 'Poly', 'Meta', 'Omni', 'Astro', 'Cryo', 'Pyro', 'Hydro', 'Velo'];
  static SUFFIXES = ['vibe', 'craft', 'soul', 'core', 'flow', 'zone', 'drift', 'glow', 'wave', 'byte', 'sync', 'fade', 'veil'];

  // Generate 3-Character names (OG style)
  static generate3Char(count = 12, pattern = 'any') {
    const results = new Set();
    let attempts = 0;

    while (results.size < count && attempts < 500) {
      attempts++;
      let name = '';
      if (pattern === 'letter_digit_letter') {
        const l1 = this.LETTERS[Math.floor(Math.random() * this.LETTERS.length)];
        const d = this.DIGITS[Math.floor(Math.random() * this.DIGITS.length)];
        const l2 = this.LETTERS[Math.floor(Math.random() * this.LETTERS.length)];
        name = `${l1}${d}${l2}`;
      } else if (pattern === 'all_letters') {
        name = Array.from({ length: 3 }, () => this.LETTERS[Math.floor(Math.random() * this.LETTERS.length)]).join('');
      } else if (pattern === 'digit_hybrid') {
        name = Array.from({ length: 3 }, () => this.ALPHANUM[Math.floor(Math.random() * (this.ALPHANUM.length - 1))]).join('');
      } else {
        name = Array.from({ length: 3 }, () => this.ALPHANUM[Math.floor(Math.random() * this.ALPHANUM.length)]).join('');
      }

      // Disallow double underscores or underscore at start/end
      if (!name.startsWith('_') && !name.endsWith('_') && !name.includes('__')) {
        results.add(name);
      }
    }

    return Array.from(results).map(name => ({
      name,
      type: '3-Character OG',
      length: 3
    }));
  }

  // Generate 4-Character CVCV (Pronounceable clean names)
  static generateCVCV(count = 12) {
    const results = new Set();
    let attempts = 0;

    while (results.size < count && attempts < 500) {
      attempts++;
      const c1 = this.CONSONANTS[Math.floor(Math.random() * this.CONSONANTS.length)];
      const v1 = this.VOWELS[Math.floor(Math.random() * this.VOWELS.length)];
      const c2 = this.CONSONANTS[Math.floor(Math.random() * this.CONSONANTS.length)];
      const v2 = this.VOWELS[Math.floor(Math.random() * this.VOWELS.length)];

      const name = `${c1}${v1}${c2}${v2}`;
      results.add(name);
    }

    return Array.from(results).map(name => ({
      name,
      type: '4-Char CVCV Clean',
      length: 4
    }));
  }

  // Generate Aesthetic / Word Combinations
  static generateAesthetic(count = 12) {
    const shuffled = [...this.AESTHETIC_WORDS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return selected.map(word => ({
      name: word,
      type: 'Clean English / Aesthetic',
      length: word.length
    }));
  }

  // Generate Prefix/Suffix Hybrids
  static generateCompound(count = 12) {
    const results = new Set();
    let attempts = 0;

    while (results.size < count && attempts < 300) {
      attempts++;
      const p = this.PREFIXES[Math.floor(Math.random() * this.PREFIXES.length)];
      const s = this.SUFFIXES[Math.floor(Math.random() * this.SUFFIXES.length)];
      const name = `${p}${s.charAt(0).toUpperCase() + s.slice(1)}`;
      if (name.length <= 16) {
        results.add(name);
      }
    }

    return Array.from(results).map(name => ({
      name,
      type: 'Modern Compound',
      length: name.length
    }));
  }
}
