// Interactive OG Name Duel & Rarity Comparison Engine
// Pit two Minecraft usernames head-to-head in a battle of rarity, aesthetics, and collector prestige
import { NameAppraiser } from './appraisal.js';

export class NameDuelEngine {
  static PRESETS = [
    { name1: 'Void', name2: 'Aero', title: 'Battle of 4-Letter Clean Legends' },
    { name1: 'Specter', name2: 'Vortex', title: 'Aesthetic Concept Clash' },
    { name1: 'q7z', name2: 'x8z', title: '3-Character Ultra OG Showdown' },
    { name1: 'Echo', name2: 'Zenith', title: 'Atmospheric Word Rivalry' },
    { name1: 'Notch', name2: 'jeb_', title: 'Founding Mojang Creators' },
    { name1: 'Dream', name2: 'Technoblade', title: 'Minecraft Content Titans' }
  ];

  static fight(name1, name2) {
    if (!name1 || !name2) throw new Error('Please enter two names to duel.');

    const n1 = name1.trim();
    const n2 = name2.trim();

    if (n1.toLowerCase() === n2.toLowerCase()) {
      throw new Error('A username cannot duel itself! Choose two different names.');
    }

    const app1 = NameAppraiser.evaluate(n1) || { score: 40, tier: 'Tier C', isDictionary: false, isLettersOnly: false };
    const app2 = NameAppraiser.evaluate(n2) || { score: 40, tier: 'Tier C', isDictionary: false, isLettersOnly: false };

    // Metric 1: Character Length Score (Shorter is rarer)
    const calcLengthScore = (len) => {
      if (len <= 2) return 100;
      if (len === 3) return 95;
      if (len === 4) return 85;
      if (len === 5) return 72;
      if (len === 6) return 60;
      return Math.max(20, 55 - (len - 6) * 4);
    };

    const lenScore1 = calcLengthScore(n1.length);
    const lenScore2 = calcLengthScore(n2.length);

    // Metric 2: Purity & Cleanliness (Letters only > no underscores > with underscores)
    const calcPurityScore = (name) => {
      let score = 70;
      if (/^[a-zA-Z]+$/.test(name)) score = 100;
      else if (!name.includes('_')) score = 80;
      else score = 50;
      return score;
    };

    const purityScore1 = calcPurityScore(n1);
    const purityScore2 = calcPurityScore(n2);

    // Metric 3: Dictionary & Aesthetic Rating
    const dictScore1 = app1.isDictionary ? 100 : (n1.length <= 4 && /^[a-zA-Z]+$/.test(n1) ? 80 : 50);
    const dictScore2 = app2.isDictionary ? 100 : (n2.length <= 4 && /^[a-zA-Z]+$/.test(n2) ? 80 : 50);

    // Overall Combat Power Rating (Weighted combination)
    const power1 = Math.round(app1.score * 0.45 + lenScore1 * 0.25 + purityScore1 * 0.15 + dictScore1 * 0.15);
    const power2 = Math.round(app2.score * 0.45 + lenScore2 * 0.25 + purityScore2 * 0.15 + dictScore2 * 0.15);

    let winner = 'tie';
    let summary = 'Dead heat! Both handles possess closely matched collector rarity.';
    const diff = Math.abs(power1 - power2);

    if (power1 > power2) {
      winner = 'fighter1';
      summary = diff > 15
        ? `<strong>${n1}</strong> dominates the arena with superior OG rarity tier & clean character structure!`
        : `<strong>${n1}</strong> edges out ${n2} by a narrow margin in collector prestige.`;
    } else if (power2 > power1) {
      winner = 'fighter2';
      summary = diff > 15
        ? `<strong>${n2}</strong> dominates the arena with superior OG rarity tier & clean character structure!`
        : `<strong>${n2}</strong> edges out ${n1} by a narrow margin in collector prestige.`;
    }

    return {
      fighter1: {
        name: n1,
        appraisal: app1,
        length: n1.length,
        lengthScore: lenScore1,
        purityScore: purityScore1,
        dictScore: dictScore1,
        power: power1,
        avatar: `https://crafthead.net/helm/${encodeURIComponent(n1)}/96`
      },
      fighter2: {
        name: n2,
        appraisal: app2,
        length: n2.length,
        lengthScore: lenScore2,
        purityScore: purityScore2,
        dictScore: dictScore2,
        power: power2,
        avatar: `https://crafthead.net/helm/${encodeURIComponent(n2)}/96`
      },
      winner,
      diff,
      summary
    };
  }
}
