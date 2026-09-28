// Watchlist & Sniper Countdown Queue Manager with Atomic Sync & Discord Webhook
import { soundFx } from './sound.js';
import { mcApi } from './api.js';
import { timeSync } from './timeSync.js';
import { discordWebhook } from './webhook.js';

const STORAGE_KEY = 'mcnametracker_watchlist_v2';

const DEFAULT_WATCHLIST = [
  {
    id: 'demo-1',
    name: 'Aero',
    status: 'dropping',
    targetTime: new Date(Date.now() + 1000 * 60 * 28 + 1000 * 30).toISOString(),
    priority: 'high',
    notes: 'Super clean 4-letter OG name. Drops after 37-day cycle.',
    category: 'OGs',
    createdAt: new Date(Date.now() - 1000 * 3600 * 12).toISOString(),
    soundAlerts: true,
    alertsTriggered: {}
  },
  {
    id: 'demo-2',
    name: 'Vortex',
    status: 'dropping',
    targetTime: new Date(Date.now() + 1000 * 60 * 60 * 4 + 1000 * 60 * 15).toISOString(),
    priority: 'medium',
    notes: 'Rare word name. Monitor session server latency prior to drop.',
    category: 'Sniper Target',
    createdAt: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
    soundAlerts: true,
    alertsTriggered: {}
  },
  {
    id: 'demo-3',
    name: 'q7z',
    status: 'dropping',
    targetTime: new Date(Date.now() + 1000 * 60 * 2 + 1000 * 45).toISOString(),
    priority: 'high',
    notes: 'Short 3-character alpha-numeric handle. High demand.',
    category: 'OGs',
    createdAt: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    soundAlerts: true,
    alertsTriggered: {}
  },
  {
    id: 'demo-4',
    name: 'Notch',
    status: 'taken',
    targetTime: null,
    priority: 'low',
    notes: 'Minecraft Creator account. Tracked for reference.',
    category: 'Personal',
    createdAt: new Date(Date.now() - 1000 * 3600 * 48).toISOString(),
    soundAlerts: false,
    alertsTriggered: {}
  },
  {
    id: 'demo-5',
    name: 'PixelCraft99',
    status: 'available',
    targetTime: null,
    priority: 'medium',
    notes: 'Clean creative name, available right now to claim!',
    category: 'Clean Words',
    createdAt: new Date(Date.now() - 1000 * 3600 * 6).toISOString(),
    soundAlerts: false,
    alertsTriggered: {}
  }
];

export class WatchlistStore {
  constructor() {
    this.items = this.load();
    this.listeners = new Set();
    this.notificationPermission = (typeof Notification !== 'undefined') ? Notification.permission : 'default';
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load watchlist from localStorage', e);
    }
    return DEFAULT_WATCHLIST;
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.items);
    }
  }

  requestNotifications() {
    if (typeof Notification !== 'undefined' && Notification.requestPermission) {
      Notification.requestPermission().then(perm => {
        this.notificationPermission = perm;
        this.notify();
      });
    }
  }

  add(item) {
    const newItem = {
      id: 'snipe-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: item.name.trim(),
      status: item.status || 'dropping',
      targetTime: item.targetTime ? new Date(item.targetTime).toISOString() : null,
      priority: item.priority || 'medium',
      notes: item.notes || '',
      category: item.category || 'General',
      createdAt: new Date().toISOString(),
      soundAlerts: item.soundAlerts !== false,
      alertsTriggered: {}
    };

    const existingIdx = this.items.findIndex(i => i.name.toLowerCase() === newItem.name.toLowerCase());
    if (existingIdx >= 0) {
      this.items[existingIdx] = { ...this.items[existingIdx], ...newItem };
    } else {
      this.items.unshift(newItem);
    }

    this.save();
    soundFx.playSuccess();
    return newItem;
  }

  update(id, updates) {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.items[idx] = { ...this.items[idx], ...updates };
      this.save();
      soundFx.playPop();
    }
  }

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    soundFx.playSubtleClick();
  }

  togglePriority(id) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      const order = ['low', 'medium', 'high'];
      const next = order[(order.indexOf(item.priority) + 1) % order.length];
      this.update(id, { priority: next });
    }
  }

  async recheckItem(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;

    try {
      const res = await mcApi.lookupProfile(item.name);
      if (res.status === 'available') {
        this.update(id, { status: 'available', lastChecked: new Date().toISOString() });
      } else if (res.status === 'taken') {
        this.update(id, { status: 'taken', lastChecked: new Date().toISOString() });
      }
      soundFx.playPop();
    } catch (e) {
      console.warn('Recheck error for ' + item.name, e);
    }
  }

  getStats() {
    const total = this.items.length;
    const now = timeSync.now();
    let droppingToday = 0;
    let availableCount = 0;
    let highPriority = 0;

    for (const item of this.items) {
      if (item.status === 'available') availableCount++;
      if (item.priority === 'high') highPriority++;
      if (item.targetTime) {
        const diff = new Date(item.targetTime).getTime() - now;
        if (diff > 0 && diff <= 1000 * 60 * 60 * 24) {
          droppingToday++;
        }
      }
    }

    return { total, droppingToday, availableCount, highPriority };
  }

  // High-resolution atomic-synchronized countdown
  calculateCountdown(targetTimeStr) {
    if (!targetTimeStr) return null;
    const target = new Date(targetTimeStr).getTime();
    const syncedNow = timeSync.now();
    const diff = target - syncedNow;

    if (diff <= 0) {
      return {
        expired: true,
        diff: 0,
        text: '00:00:00.000',
        urgency: 'dropped',
        label: 'DROPPED / AVAILABLE'
      };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const ms = Math.floor(diff % 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const days = Math.floor(totalSeconds / 86400);

    const pad = (n, len = 2) => String(n).padStart(len, '0');
    const msPad = String(ms).padStart(3, '0');

    let text = '';
    if (days > 0) {
      text = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    } else {
      text = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${msPad}`;
    }

    let urgency = 'normal';
    if (diff < 1000 * 10) {
      urgency = 'critical'; // under 10s
    } else if (diff < 1000 * 60) {
      urgency = 'critical'; // under 1m
    } else if (diff < 1000 * 60 * 15) {
      urgency = 'warning'; // under 15m
    } else if (diff < 1000 * 3600 * 24) {
      urgency = 'moderate'; // under 24h
    }

    return {
      expired: false,
      diff,
      days,
      hours,
      minutes,
      seconds,
      ms,
      text,
      urgency,
      label: days > 0 ? `${days} days left` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    };
  }

  // Trigger sound, desktop notification & Discord Webhook alerts
  checkTriggers(item, countdown) {
    if (!countdown || countdown.expired) return;
    if (!item.alertsTriggered) item.alertsTriggered = {};

    const { diff } = countdown;

    // 15 Minutes alert
    if (diff <= 1000 * 60 * 15 && diff > 1000 * 60 * 14 && !item.alertsTriggered.t15m) {
      item.alertsTriggered.t15m = true;
      soundFx.playWarningPing();
      this.sendDesktopNotification(`Name Snipe: ${item.name}`, `Drop in 15 minutes!`);
      discordWebhook.sendDropAlert(item, '15 Minutes Warning');
    }

    // 1 Minute alert
    if (diff <= 1000 * 60 && diff > 1000 * 45 && !item.alertsTriggered.t1m) {
      item.alertsTriggered.t1m = true;
      soundFx.playDropAlert();
      this.sendDesktopNotification(`🚨 IMMINENT DROP: ${item.name}`, `Drop in less than 60 seconds! Get ready to claim.`);
      discordWebhook.sendDropAlert(item, '1 Minute Drop Imminent');
    }

    // 10 Seconds alert
    if (diff <= 1000 * 10 && !item.alertsTriggered.t10s) {
      item.alertsTriggered.t10s = true;
      soundFx.playDropAlert();
    }
  }

  sendDesktopNotification(title, body) {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body,
          icon: 'https://minotar.net/helm/Steve/64.png'
        });
      } catch (e) {
        console.warn('Desktop notification error', e);
      }
    }
  }

  exportJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.items, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `mcnamesnipe_watchlist_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  exportCSV() {
    const headers = ['Name', 'Status', 'Priority', 'Target Drop Time', 'Category', 'Notes'];
    const rows = this.items.map(item => [
      item.name,
      item.status,
      item.priority,
      item.targetTime || 'N/A',
      item.category || 'General',
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.setAttribute('href', encodeURI(csvContent));
    a.setAttribute('download', `mcnamesnipe_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) throw new Error('File must contain an array of items.');

      let count = 0;
      for (const item of parsed) {
        if (item.name) {
          this.add({
            name: item.name,
            status: item.status || 'dropping',
            targetTime: item.targetTime,
            priority: item.priority || 'medium',
            notes: item.notes || '',
            category: item.category || 'Imported'
          });
          count++;
        }
      }
      return { success: true, count };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

export const watchlistStore = new WatchlistStore();
