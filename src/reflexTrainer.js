// Sub-Millisecond Snipe Reflex & Latency Compensation Simulator
// Allows users to practice manual name sniping precision against mock drop timers

export class ReflexTrainer {
  constructor() {
    this.targetDurationMs = 5000;
    this.startTime = null;
    this.targetEndTime = null;
    this.simulatedPingMs = 35; // Default 35ms network latency
    this.isRunning = false;
    this.rafId = null;
    this.attempts = [];
  }

  startRound(callback) {
    this.isRunning = true;
    this.startTime = performance.now();
    // Randomize duration between 3.5s and 6.5s to prevent blind rhythm clicking
    this.targetDurationMs = 3500 + Math.random() * 3000;
    this.targetEndTime = this.startTime + this.targetDurationMs;

    const tick = () => {
      if (!this.isRunning) return;
      const now = performance.now();
      const remaining = this.targetEndTime - now;

      callback({
        remainingMs: remaining,
        isDropPassed: remaining <= 0,
        formatted: this.formatTrainerTime(remaining)
      });

      this.rafId = requestAnimationFrame(tick);
    };

    tick();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  triggerSnipe() {
    if (!this.isRunning) return null;
    this.stop();

    const clientClickTime = performance.now();
    // Effective arrival at server = clientClickTime + (simulatedPingMs / 2)
    const serverArrivalTime = clientClickTime + (this.simulatedPingMs / 2);
    const deltaMs = serverArrivalTime - this.targetEndTime; // Positive = after drop, Negative = early

    let grade = '';
    let statusText = '';
    let badgeClass = '';

    if (deltaMs < 0) {
      grade = 'EARLY_FAIL';
      statusText = `TOO EARLY (${Math.abs(Math.round(deltaMs))}ms before drop) — Name still locked by Mojang!`;
      badgeClass = 'trainer-early';
    } else if (deltaMs <= 25) {
      grade = 'LEGENDARY_SNIPE';
      statusText = `🎯 GODLIKE SNIPE! Arrived +${Math.round(deltaMs)}ms after drop!`;
      badgeClass = 'trainer-godlike';
    } else if (deltaMs <= 75) {
      grade = 'CLEAN_SNIPE';
      statusText = `✨ SUCCESSFUL SNIPE! Arrived +${Math.round(deltaMs)}ms after drop.`;
      badgeClass = 'trainer-success';
    } else if (deltaMs <= 200) {
      grade = 'SNIPED_BY_BOT';
      statusText = `🐢 TOO SLOW (+${Math.round(deltaMs)}ms) — Sniped by competitor bot!`;
      badgeClass = 'trainer-slow';
    } else {
      grade = 'MISSED';
      statusText = `❌ MISSED COMPLETELY (+${Math.round(deltaMs)}ms).`;
      badgeClass = 'trainer-miss';
    }

    const result = {
      deltaMs: Math.round(deltaMs),
      grade,
      statusText,
      badgeClass,
      simulatedPing: this.simulatedPingMs,
      timestamp: new Date().toLocaleTimeString()
    };

    this.attempts.unshift(result);
    return result;
  }

  formatTrainerTime(diff) {
    const isNegative = diff < 0;
    const absDiff = Math.abs(diff);
    const totalSeconds = Math.floor(absDiff / 1000);
    const ms = Math.floor(absDiff % 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);

    const pad = (n, len = 2) => String(n).padStart(len, '0');
    const msPad = String(ms).padStart(3, '0');

    const prefix = isNegative ? '+ ' : '';
    return `${prefix}${pad(minutes)}:${pad(seconds)}.${msPad}`;
  }
}

export const reflexTrainer = new ReflexTrainer();
