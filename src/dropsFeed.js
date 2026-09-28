// Real-Time Dropping & Hot Minecraft Names Feed Engine
// Provides dynamically synchronized upcoming drop schedules, hot trending names, and community discovery
import { NameAppraiser } from './appraisal.js';
import { timeSync } from './timeSync.js';

const HYPES_STORAGE_KEY = 'mcnametracker_user_hypes_v1';

// Base database of curated dropping, OG, and hot usernames
const INITIAL_DROPS_DATA = [
  // Immediate & Soon Dropping (Under 24 hours)
  {
    name: 'q7z',
    offsetMs: 1000 * 60 * 2 + 1000 * 45, // 2m 45s
    monthlySearches: 12400,
    lifetimeViews: 86500,
    baseHypes: 642,
    category: '3-Char OG',
    tag: 'Dropping Soon ⏱️',
    status: 'dropping'
  },
  {
    name: 'Void',
    offsetMs: 1000 * 60 * 11 + 1000 * 20, // 11m 20s
    monthlySearches: 28900,
    lifetimeViews: 312000,
    baseHypes: 1280,
    category: 'Clean Dictionary',
    tag: 'Hot 🔥',
    status: 'dropping'
  },
  {
    name: 'Echo',
    offsetMs: 1000 * 60 * 34 + 1000 * 10, // 34m 10s
    monthlySearches: 19500,
    lifetimeViews: 142000,
    baseHypes: 890,
    category: 'Clean Dictionary',
    tag: 'Hot 🔥',
    status: 'dropping'
  },
  {
    name: 'Aero',
    offsetMs: 1000 * 60 * 75, // 1h 15m
    monthlySearches: 22100,
    lifetimeViews: 198000,
    baseHypes: 940,
    category: 'Clean Dictionary',
    tag: 'Dropping Soon ⏱️',
    status: 'dropping'
  },
  {
    name: 'x8z',
    offsetMs: 1000 * 60 * 160, // 2h 40m
    monthlySearches: 9800,
    lifetimeViews: 64000,
    baseHypes: 512,
    category: '3-Char OG',
    tag: 'Rare 👑',
    status: 'dropping'
  },
  {
    name: 'j4k',
    offsetMs: 1000 * 60 * 280, // 4h 40m
    monthlySearches: 11200,
    lifetimeViews: 71000,
    baseHypes: 580,
    category: '3-Char OG',
    tag: 'Rare 👑',
    status: 'dropping'
  },
  {
    name: 'Zenith',
    offsetMs: 1000 * 60 * 490, // 8h 10m
    monthlySearches: 16400,
    lifetimeViews: 125000,
    baseHypes: 730,
    category: 'Aesthetic Concept',
    tag: 'Hot 🔥',
    status: 'dropping'
  },
  {
    name: 'Specter',
    offsetMs: 1000 * 60 * 890, // 14h 50m
    monthlySearches: 18200,
    lifetimeViews: 154000,
    baseHypes: 810,
    category: 'Clean Dictionary',
    tag: 'Dropping Soon ⏱️',
    status: 'dropping'
  },
  {
    name: 'Vortex',
    offsetMs: 1000 * 60 * 1560, // 26 hours
    monthlySearches: 24500,
    lifetimeViews: 220000,
    baseHypes: 1050,
    category: 'Clean Dictionary',
    tag: 'Hot 🔥',
    status: 'dropping'
  },

  // Dropping in 2 to 7 days
  {
    name: 'Lush',
    offsetMs: 1000 * 3600 * 52, // 2.1 days
    monthlySearches: 14200,
    lifetimeViews: 98000,
    baseHypes: 620,
    category: 'Clean Dictionary',
    tag: 'Trending 📈',
    status: 'dropping'
  },
  {
    name: 'Cipher',
    offsetMs: 1000 * 3600 * 84, // 3.5 days
    monthlySearches: 15600,
    lifetimeViews: 110000,
    baseHypes: 690,
    category: 'Clean Dictionary',
    tag: 'Trending 📈',
    status: 'dropping'
  },
  {
    name: 'k9w',
    offsetMs: 1000 * 3600 * 110, // 4.5 days
    monthlySearches: 8400,
    lifetimeViews: 45000,
    baseHypes: 430,
    category: '3-Char OG',
    tag: 'Rare 👑',
    status: 'dropping'
  },
  {
    name: 'Solace',
    offsetMs: 1000 * 3600 * 135, // 5.6 days
    monthlySearches: 13100,
    lifetimeViews: 89000,
    baseHypes: 560,
    category: 'Aesthetic Concept',
    tag: 'Trending 📈',
    status: 'dropping'
  },
  {
    name: 'Zephyr',
    offsetMs: 1000 * 3600 * 168, // 7 days
    monthlySearches: 17800,
    lifetimeViews: 138000,
    baseHypes: 780,
    category: 'Aesthetic Concept',
    tag: 'Hot 🔥',
    status: 'dropping'
  },

  // Dropping in 1 to 4 weeks (Long-Range Radar)
  {
    name: 'Glint',
    offsetMs: 1000 * 3600 * 240, // 10 days
    monthlySearches: 11900,
    lifetimeViews: 76000,
    baseHypes: 490,
    category: 'Clean Dictionary',
    tag: 'Upcoming 📅',
    status: 'dropping'
  },
  {
    name: 'Crypt',
    offsetMs: 1000 * 3600 * 310, // 12.9 days
    monthlySearches: 14700,
    lifetimeViews: 104000,
    baseHypes: 670,
    category: 'Clean Dictionary',
    tag: 'Upcoming 📅',
    status: 'dropping'
  },
  {
    name: 'Chasm',
    offsetMs: 1000 * 3600 * 380, // 15.8 days
    monthlySearches: 10200,
    lifetimeViews: 68000,
    baseHypes: 440,
    category: 'Clean Dictionary',
    tag: 'Upcoming 📅',
    status: 'dropping'
  },
  {
    name: 'Aura',
    offsetMs: 1000 * 3600 * 450, // 18.75 days
    monthlySearches: 21300,
    lifetimeViews: 185000,
    baseHypes: 990,
    category: 'Clean Dictionary',
    tag: 'Hot 🔥',
    status: 'dropping'
  },
  {
    name: 'Phantom',
    offsetMs: 1000 * 3600 * 530, // 22 days
    monthlySearches: 26400,
    lifetimeViews: 240000,
    baseHypes: 1140,
    category: 'Clean Dictionary',
    tag: 'Hot 🔥',
    status: 'dropping'
  },
  {
    name: 'Frost',
    offsetMs: 1000 * 3600 * 610, // 25.4 days
    monthlySearches: 27800,
    lifetimeViews: 265000,
    baseHypes: 1220,
    category: 'Clean Dictionary',
    tag: 'Hot 🔥',
    status: 'dropping'
  },
  {
    name: 'Nebula',
    offsetMs: 1000 * 3600 * 700, // 29.1 days
    monthlySearches: 23100,
    lifetimeViews: 210000,
    baseHypes: 1010,
    category: 'Aesthetic Concept',
    tag: 'Upcoming 📅',
    status: 'dropping'
  },
  {
    name: 'Eclipse',
    offsetMs: 1000 * 3600 * 790, // 32.9 days
    monthlySearches: 25900,
    lifetimeViews: 235000,
    baseHypes: 1180,
    category: 'Aesthetic Concept',
    tag: 'Hot 🔥',
    status: 'dropping'
  },

  // Available Right Now (Freshly Claimable Gems)
  {
    name: 'PixelCraft99',
    offsetMs: null,
    monthlySearches: 5200,
    lifetimeViews: 28000,
    baseHypes: 310,
    category: 'Available Gem',
    tag: 'Available ✨',
    status: 'available'
  },
  {
    name: 'VeloSync',
    offsetMs: null,
    monthlySearches: 3800,
    lifetimeViews: 19000,
    baseHypes: 260,
    category: 'Available Gem',
    tag: 'Available ✨',
    status: 'available'
  },
  {
    name: 'CryoDrift',
    offsetMs: null,
    monthlySearches: 4600,
    lifetimeViews: 22000,
    baseHypes: 290,
    category: 'Available Gem',
    tag: 'Available ✨',
    status: 'available'
  },
  {
    name: 'HyperVeil',
    offsetMs: null,
    monthlySearches: 4100,
    lifetimeViews: 21000,
    baseHypes: 275,
    category: 'Available Gem',
    tag: 'Available ✨',
    status: 'available'
  },
  {
    name: 'AstroByte',
    offsetMs: null,
    monthlySearches: 4900,
    lifetimeViews: 25000,
    baseHypes: 320,
    category: 'Available Gem',
    tag: 'Available ✨',
    status: 'available'
  },

  // Most Searched / Creator / OG Legends
  {
    name: 'Dream',
    offsetMs: null,
    monthlySearches: 185000,
    lifetimeViews: 4200000,
    baseHypes: 4800,
    category: 'Creator/Legend',
    tag: 'Most Searched 💎',
    status: 'taken'
  },
  {
    name: 'Notch',
    offsetMs: null,
    monthlySearches: 145000,
    lifetimeViews: 3800000,
    baseHypes: 5200,
    category: 'Creator/Legend',
    tag: 'Most Searched 💎',
    status: 'taken'
  },
  {
    name: 'Technoblade',
    offsetMs: null,
    monthlySearches: 210000,
    lifetimeViews: 5600000,
    baseHypes: 9800,
    category: 'Creator/Legend',
    tag: 'Most Searched 💎',
    status: 'taken'
  },
  {
    name: 'jeb_',
    offsetMs: null,
    monthlySearches: 76000,
    lifetimeViews: 1900000,
    baseHypes: 3400,
    category: 'Creator/Legend',
    tag: 'Most Searched 💎',
    status: 'taken'
  }
];

export class DropsFeedService {
  constructor() {
    this.sessionStartTime = Date.now();
    this.userHypes = this.loadUserHypes();
    this.drops = this.buildDropItems();
  }

  loadUserHypes() {
    try {
      const raw = localStorage.getItem(HYPES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveUserHypes() {
    try {
      localStorage.setItem(HYPES_STORAGE_KEY, JSON.stringify(this.userHypes));
    } catch (e) {
      console.warn('Failed to persist user hypes', e);
    }
  }

  buildDropItems() {
    return INITIAL_DROPS_DATA.map((item, idx) => {
      let targetTime = null;
      if (item.offsetMs != null) {
        targetTime = new Date(this.sessionStartTime + item.offsetMs).toISOString();
      }

      const appraisal = NameAppraiser.evaluate(item.name);
      const isUserHyped = !!this.userHypes[item.name];
      const hypeBonus = this.userHypes[item.name] || 0;

      return {
        id: `drop-feed-${idx}`,
        name: item.name,
        status: item.status,
        targetTime: targetTime,
        offsetMs: item.offsetMs,
        monthlySearches: item.monthlySearches,
        lifetimeViews: item.lifetimeViews,
        hypes: item.baseHypes + hypeBonus,
        isUserHyped: isUserHyped,
        category: item.category,
        tag: item.tag,
        appraisal: appraisal,
        length: item.name.length,
        is3Char: item.name.length === 3,
        is4Char: item.name.length === 4
      };
    });
  }

  toggleHype(name) {
    const item = this.drops.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (!item) return { success: false };

    if (!this.userHypes[item.name]) {
      this.userHypes[item.name] = 1;
      item.hypes += 1;
      item.isUserHyped = true;
    } else {
      this.userHypes[item.name] = (this.userHypes[item.name] || 1) + 1;
      item.hypes += 1;
      item.isUserHyped = true;
    }

    this.saveUserHypes();
    return {
      success: true,
      hypes: item.hypes,
      isUserHyped: item.isUserHyped,
      name: item.name
    };
  }

  getFilteredDrops({ categoryTab = 'hot', lengthFilter = 'all', sortMode = 'soonest', searchQuery = '' } = {}) {
    let result = [...this.drops];
    const now = timeSync.now();

    // Tab Filtering
    if (categoryTab === 'hot') {
      result = result.filter(d => d.tag.includes('Hot') || d.tag.includes('Trending') || (d.status === 'dropping' && d.hypes > 600));
    } else if (categoryTab === 'dropping_soon') {
      result = result.filter(d => d.status === 'dropping' && d.targetTime && new Date(d.targetTime).getTime() > now);
    } else if (categoryTab === 'rare_3char') {
      result = result.filter(d => d.length === 3 || (d.appraisal && d.appraisal.score >= 90));
    } else if (categoryTab === 'available') {
      result = result.filter(d => d.status === 'available');
    } else if (categoryTab === 'most_searched') {
      result = result.filter(d => d.monthlySearches >= 15000);
    }

    // Length Filtering
    if (lengthFilter === '3char') {
      result = result.filter(d => d.length === 3);
    } else if (lengthFilter === '4char') {
      result = result.filter(d => d.length === 4);
    } else if (lengthFilter === '5char') {
      result = result.filter(d => d.length === 5);
    } else if (lengthFilter === '6plus') {
      result = result.filter(d => d.length >= 6);
    } else if (lengthFilter === 'clean_words') {
      result = result.filter(d => d.appraisal && d.appraisal.isDictionary);
    }

    // Search query within the feed
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }

    // Sorting
    if (sortMode === 'soonest') {
      result.sort((a, b) => {
        if (a.status === 'available' && b.status !== 'available') return -1;
        if (b.status === 'available' && a.status !== 'available') return 1;
        if (a.targetTime && b.targetTime) {
          return new Date(a.targetTime).getTime() - new Date(b.targetTime).getTime();
        }
        if (a.targetTime) return -1;
        if (b.targetTime) return 1;
        return b.hypes - a.hypes;
      });
    } else if (sortMode === 'most_searched') {
      result.sort((a, b) => b.monthlySearches - a.monthlySearches);
    } else if (sortMode === 'highest_og') {
      result.sort((a, b) => (b.appraisal?.score || 0) - (a.appraisal?.score || 0));
    } else if (sortMode === 'most_hyped') {
      result.sort((a, b) => b.hypes - a.hypes);
    } else if (sortMode === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }

  getRandomDrop() {
    const candidates = this.drops.filter(d => d.status === 'dropping' || d.status === 'available' || d.appraisal?.score >= 80);
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex] || this.drops[0];
  }

  getMarqueeEvents() {
    return [
      { icon: '🚨', text: '<strong>q7z</strong> drops in under 3 minutes — sniper alerts armed!' },
      { icon: '🔥', text: '<strong>Void</strong> passed 1,280 community hypes' },
      { icon: '⏱️', text: '<strong>Aero</strong> & <strong>Echo</strong> 37-day public drop incoming today' },
      { icon: '✨', text: '<strong>PixelCraft99</strong> is available to claim on Minecraft.net' },
      { icon: '👑', text: '<strong>x8z</strong> & <strong>j4k</strong> rare 3-character handles on drop radar' },
      { icon: '💎', text: '<strong>Specter</strong> and <strong>Vortex</strong> dropping this week' }
    ];
  }
}

export const dropsFeed = new DropsFeedService();
