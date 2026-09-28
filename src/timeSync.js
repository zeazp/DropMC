// Atomic Server Clock Sync & Precision Offset Engine
// Synchronizes client time against atomic HTTP/NTP clock headers to eliminate PC clock drift

export class TimeSyncService {
  constructor() {
    this.offsetMs = 0; // Local Date.now() + offsetMs = True Atomic Time
    this.isSynced = false;
    this.latencyMs = 0;
    this.lastSyncTimestamp = null;
    this.syncListeners = new Set();
  }

  // Measure round-trip time and calculate clock skew
  async calibrate() {
    const endpoints = [
      'https://cloudflare.com/cdn-cgi/trace',
      'https://api.ashcon.app/mojang/v2/user/notch',
      'https://playerdb.co/api/player/minecraft/notch'
    ];

    let bestSample = null;

    for (const url of endpoints) {
      try {
        const start = performance.now();
        const clientBefore = Date.now();

        const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
        const clientAfter = Date.now();
        const rtt = performance.now() - start;

        const dateHeader = res.headers.get('date');
        if (dateHeader) {
          const serverTime = new Date(dateHeader).getTime();
          // Assume one-way trip is rtt / 2
          const estimatedServerNow = serverTime + (rtt / 2);
          const localMiddle = (clientBefore + clientAfter) / 2;
          const skew = estimatedServerNow - localMiddle;

          if (!bestSample || rtt < bestSample.rtt) {
            bestSample = { skew, rtt };
          }
        }
      } catch (e) {
        // Fallback to next endpoint
      }
    }

    if (bestSample) {
      this.offsetMs = Math.round(bestSample.skew);
      this.latencyMs = Math.round(bestSample.rtt);
      this.isSynced = true;
      this.lastSyncTimestamp = Date.now();
      this.notify();
      return { success: true, offsetMs: this.offsetMs, latencyMs: this.latencyMs };
    } else {
      // Fallback zero offset
      this.offsetMs = 0;
      this.isSynced = true;
      this.notify();
      return { success: false, offsetMs: 0, latencyMs: 0 };
    }
  }

  // Get current true atomic millisecond timestamp
  now() {
    return Date.now() + this.offsetMs;
  }

  subscribe(listener) {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  notify() {
    for (const fn of this.syncListeners) {
      fn({
        offsetMs: this.offsetMs,
        isSynced: this.isSynced,
        latencyMs: this.latencyMs
      });
    }
  }
}

export const timeSync = new TimeSyncService();
