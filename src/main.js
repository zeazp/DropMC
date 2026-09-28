// Main Application Coordinator for MCNameSnipe Pro Edition
import { mcApi } from './api.js';
import { watchlistStore } from './watchlist.js';
import { soundFx } from './sound.js';
import { NameGenerator } from './generator.js';
import { DropCalculator } from './calculator.js';
import { Skin3DStudio } from './skin3d.js';
import { timeSync } from './timeSync.js';
import { NameAppraiser } from './appraisal.js';
import { discordWebhook } from './webhook.js';
import { reflexTrainer } from './reflexTrainer.js';
import { dropsFeed } from './dropsFeed.js';
import { NameDuelEngine } from './nameDuel.js';

const RECENT_SEARCHES_KEY = 'mcnametracker_recent_lookups_v1';

class App {
  constructor() {
    this.activeTab = 'search';
    this.activeFilter = 'all';
    this.activeDropTab = 'hot';
    this.activeLengthFilter = 'all';
    this.activeSortMode = 'soonest';
    this.dropSearchQuery = '';
    this.recentSearches = this.loadRecentSearches();
    this.lastCalculatedDrop = null;
    this.skinStudio = null;
    this.isSpinningRoulette = false;

    this.initElements();
    this.bindEvents();
    this.initClocks();
    this.initWatchlistLoop();
    this.initDropsTimerLoop();
    this.calibrateAtomicClock();
    this.renderMarquee();
    this.renderRecentSearches();
    this.renderDropsHub();
    this.initAutocomplete();
    this.initRoulette();
    this.initNameDuel();
    this.renderWatchlist();
    this.renderStatus();
    this.renderGenerator();
  }

  initElements() {
    // Nav elements
    this.navButtons = document.querySelectorAll('.nav-item');
    this.views = document.querySelectorAll('.page-view');
    this.navWatchlistCount = document.getElementById('nav-watchlist-count');

    // Clocks & stats
    this.localClock = document.getElementById('sidebar-local-clock');
    this.utcClock = document.getElementById('sidebar-utc-clock');
    this.recalibrateClockBtn = document.getElementById('recalibrate-clock-btn');
    this.atomicSyncText = document.getElementById('atomic-sync-text');
    this.statDropping = document.getElementById('stat-dropping-text');
    this.statAvailable = document.getElementById('stat-available-text');

    // Sound & Discord Webhook
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.soundIconOn = document.getElementById('sound-icon-on');
    this.soundIconOff = document.getElementById('sound-icon-off');
    this.webhookSettingsBtn = document.getElementById('webhook-settings-btn');
    this.webhookModal = document.getElementById('webhook-modal');
    this.webhookUrlInput = document.getElementById('webhook-url-input');
    this.closeWebhookModalBtn = document.getElementById('close-webhook-modal-btn');
    this.cancelWebhookBtn = document.getElementById('cancel-webhook-btn');
    this.saveWebhookBtn = document.getElementById('save-webhook-btn');
    this.testWebhookBtn = document.getElementById('test-webhook-btn');

    // Search view & Discovery Hub
    this.searchForm = document.getElementById('search-form');
    this.searchInput = document.getElementById('search-input');
    this.searchResultContainer = document.getElementById('search-result-container');
    this.quickTags = document.querySelectorAll('.quick-tag');
    this.autocompleteBox = document.getElementById('search-autocomplete-box');
    this.recentSearchesRow = document.getElementById('recent-searches-row');
    this.recentChipsContainer = document.getElementById('recent-chips-container');
    this.marqueeTrack = document.getElementById('marquee-track');
    this.marqueeRefreshBtn = document.getElementById('marquee-refresh-btn');

    // Drops Discovery Hub Elements
    this.dropsHubSection = document.getElementById('drops-hub-section');
    this.dropCatTabs = document.querySelectorAll('.drop-cat-tab');
    this.lengthChips = document.querySelectorAll('.length-chip');
    this.dropsFilterInput = document.getElementById('drops-filter-input');
    this.dropsSortSelect = document.getElementById('drops-sort-select');
    this.dropsCountPill = document.getElementById('drops-count-pill');
    this.dropsFeedGrid = document.getElementById('drops-feed-grid');

    // Interactive Name Duel
    this.nameDuelSection = document.getElementById('name-duel-section');
    this.toggleNameDuelBtn = document.getElementById('toggle-name-duel-btn');
    this.closeDuelBtn = document.getElementById('close-duel-btn');
    this.duelInput1 = document.getElementById('duel-input-1');
    this.duelInput2 = document.getElementById('duel-input-2');
    this.duelPresetBtns = document.querySelectorAll('.duel-preset-btn');
    this.runDuelBtn = document.getElementById('run-duel-btn');
    this.duelResultsContainer = document.getElementById('duel-results-container');

    // Drop Roulette Modal
    this.openRouletteBtn = document.getElementById('open-roulette-btn');
    this.rouletteModal = document.getElementById('roulette-modal');
    this.closeRouletteModalBtn = document.getElementById('close-roulette-modal-btn');
    this.rouletteSlotReel = document.getElementById('roulette-slot-reel');
    this.rouletteResultCard = document.getElementById('roulette-result-card');
    this.triggerRouletteSpinBtn = document.getElementById('trigger-roulette-spin-btn');

    // Watchlist view
    this.watchlistGrid = document.getElementById('watchlist-grid');
    this.filterTabs = document.querySelectorAll('.filter-tab');
    this.exportBtn = document.getElementById('export-btn');
    this.importBtn = document.getElementById('import-btn');
    this.importFileInput = document.getElementById('import-file-input');
    this.openAddModalBtn = document.getElementById('open-add-modal-btn');

    // Modal
    this.trackModal = document.getElementById('track-modal');
    this.trackForm = document.getElementById('track-form');
    this.modalTitle = document.getElementById('modal-title-text');
    this.closeModalBtn = document.getElementById('close-modal-btn');
    this.cancelModalBtn = document.getElementById('cancel-modal-btn');
    this.trackEditId = document.getElementById('track-edit-id');
    this.trackNameInput = document.getElementById('track-name-input');
    this.trackTimeInput = document.getElementById('track-time-input');
    this.trackPrioritySelect = document.getElementById('track-priority-select');
    this.trackCategorySelect = document.getElementById('track-category-select');
    this.trackNotesInput = document.getElementById('track-notes-input');

    // Generator view
    this.genModeSelect = document.getElementById('gen-mode-select');
    this.genPatternGroup = document.getElementById('gen-pattern-group');
    this.genPatternSelect = document.getElementById('gen-pattern-select');
    this.genCountSelect = document.getElementById('gen-count-select');
    this.runGeneratorBtn = document.getElementById('run-generator-btn');
    this.generatorResultsGrid = document.getElementById('generator-results-grid');

    // Calculator view
    this.calcNameInput = document.getElementById('calc-name-input');
    this.calcDatetimeInput = document.getElementById('calc-datetime-input');
    this.calcModeSelect = document.getElementById('calc-mode-select');
    this.runCalcBtn = document.getElementById('run-calc-btn');
    this.calcResultsCard = document.getElementById('calc-results-card');
    this.calcGraceOutput = document.getElementById('calc-grace-output');
    this.calcDropOutput = document.getElementById('calc-drop-output');
    this.calcDropUtcOutput = document.getElementById('calc-drop-utc-output');
    this.calcRemainingOutput = document.getElementById('calc-remaining-output');
    this.calcAddWatchlistBtn = document.getElementById('calc-add-watchlist-btn');

    // Reflex Trainer view
    this.trainerTimerDisplay = document.getElementById('trainer-timer-display');
    this.trainerFeedbackBox = document.getElementById('trainer-feedback-box');
    this.trainerStartBtn = document.getElementById('trainer-start-btn');
    this.trainerSnipeBtn = document.getElementById('trainer-snipe-btn');
    this.trainerPingSlider = document.getElementById('trainer-ping-slider');
    this.trainerPingVal = document.getElementById('trainer-ping-val');
    this.trainerAttemptsList = document.getElementById('trainer-attempts-list');

    // Status view
    this.statusGrid = document.getElementById('status-grid');
    this.refreshStatusBtn = document.getElementById('refresh-status-btn');
  }

  bindEvents() {
    // Navigation
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Sound toggle
    this.soundToggleBtn.addEventListener('click', () => {
      soundFx.enabled = !soundFx.enabled;
      this.soundIconOn.style.display = soundFx.enabled ? 'block' : 'none';
      this.soundIconOff.style.display = soundFx.enabled ? 'none' : 'block';
      if (soundFx.enabled) {
        soundFx.playPop();
        this.showToast('Sound feedback enabled', 'success');
      } else {
        this.showToast('Sound feedback muted', 'normal');
      }
    });

    // Webhook Settings Modal
    this.webhookSettingsBtn.addEventListener('click', () => {
      this.webhookUrlInput.value = discordWebhook.getWebhookUrl();
      this.webhookModal.classList.add('open');
      soundFx.playPop();
    });

    const closeWebhookModal = () => {
      this.webhookModal.classList.remove('open');
      soundFx.playSubtleClick();
    };
    this.closeWebhookModalBtn.addEventListener('click', closeWebhookModal);
    this.cancelWebhookBtn.addEventListener('click', closeWebhookModal);

    this.saveWebhookBtn.addEventListener('click', () => {
      discordWebhook.setWebhookUrl(this.webhookUrlInput.value);
      this.showToast('Discord webhook saved successfully', 'success');
      closeWebhookModal();
    });

    this.testWebhookBtn.addEventListener('click', async () => {
      discordWebhook.setWebhookUrl(this.webhookUrlInput.value);
      this.testWebhookBtn.disabled = true;
      this.testWebhookBtn.textContent = 'Sending...';
      const res = await discordWebhook.sendTest();
      this.testWebhookBtn.disabled = false;
      this.testWebhookBtn.textContent = 'Send Test Alert';
      if (res.success) {
        this.showToast('Test embed sent to Discord channel!', 'success');
      } else {
        this.showToast(`Webhook failed: ${res.reason}`, 'warning');
      }
    });

    // Recalibrate Atomic Clock
    this.recalibrateClockBtn.addEventListener('click', () => {
      this.calibrateAtomicClock(true);
    });

    // Refresh Marquee
    this.marqueeRefreshBtn?.addEventListener('click', () => {
      this.renderMarquee();
      this.renderDropsHub();
      soundFx.playPop();
      this.showToast('Refreshed upcoming drops radar & feed', 'normal');
    });

    // Quick search tags
    this.quickTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const name = tag.dataset.name;
        this.searchInput.value = name;
        this.performSearch(name);
      });
    });

    // Search submit
    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = this.searchInput.value.trim();
      if (query) {
        this.performSearch(query);
      }
    });

    // Drops Discovery Hub Category Tabs
    this.dropCatTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.dropCatTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeDropTab = tab.dataset.dropTab;
        soundFx.playSubtleClick();
        this.renderDropsHub();
      });
    });

    // Drops Length Filter Chips
    this.lengthChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.lengthChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeLengthFilter = chip.dataset.length;
        soundFx.playSubtleClick();
        this.renderDropsHub();
      });
    });

    // Drops Feed Sort Select
    this.dropsSortSelect?.addEventListener('change', () => {
      this.activeSortMode = this.dropsSortSelect.value;
      soundFx.playSubtleClick();
      this.renderDropsHub();
    });

    // Drops In-Feed Search Filter
    this.dropsFilterInput?.addEventListener('input', (e) => {
      this.dropSearchQuery = e.target.value;
      this.renderDropsHub();
    });

    // Watchlist Filters
    this.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeFilter = tab.dataset.filter;
        soundFx.playSubtleClick();
        this.renderWatchlist();
      });
    });

    // Modal open/close
    this.openAddModalBtn.addEventListener('click', () => {
      this.openTrackModal();
    });
    this.closeModalBtn.addEventListener('click', () => this.closeTrackModal());
    this.cancelModalBtn.addEventListener('click', () => this.closeTrackModal());

    // Modal submit
    this.trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = this.trackEditId.value;
      const data = {
        name: this.trackNameInput.value.trim(),
        targetTime: this.trackTimeInput.value ? new Date(this.trackTimeInput.value).toISOString() : null,
        priority: this.trackPrioritySelect.value,
        category: this.trackCategorySelect.value,
        notes: this.trackNotesInput.value.trim()
      };

      if (id) {
        watchlistStore.update(id, data);
        this.showToast(`Updated ${data.name} in watchlist`, 'success');
      } else {
        watchlistStore.add(data);
        this.showToast(`Added ${data.name} to sniper watchlist`, 'success');
      }

      this.closeTrackModal();
      this.renderWatchlist();
    });

    // Watchlist Export & Import
    this.exportBtn.addEventListener('click', () => {
      watchlistStore.exportJSON();
      soundFx.playPop();
      this.showToast('Watchlist exported as JSON', 'success');
    });

    this.importBtn.addEventListener('click', () => {
      this.importFileInput.click();
    });

    this.importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = watchlistStore.importJSON(event.target.result);
          if (res.success) {
            this.showToast(`Successfully imported ${res.count} names!`, 'success');
            this.renderWatchlist();
          } else {
            this.showToast(`Import failed: ${res.error}`, 'warning');
          }
        };
        reader.readAsText(file);
      }
    });

    // Generator events
    this.genModeSelect.addEventListener('change', () => {
      this.genPatternGroup.style.display = this.genModeSelect.value === '3char' ? 'block' : 'none';
    });

    this.runGeneratorBtn.addEventListener('click', () => {
      this.renderGenerator();
      soundFx.playPop();
    });

    // Calculator events (Defaults to Local Time)
    const nowLocal = new Date();
    nowLocal.setMinutes(nowLocal.getMinutes() - nowLocal.getTimezoneOffset());
    this.calcDatetimeInput.value = nowLocal.toISOString().slice(0, 16);

    this.runCalcBtn.addEventListener('click', () => {
      this.runCalculator();
    });

    this.calcAddWatchlistBtn.addEventListener('click', () => {
      if (this.lastCalculatedDrop) {
        watchlistStore.add({
          name: this.lastCalculatedDrop.name || 'TargetName',
          targetTime: this.lastCalculatedDrop.dropTime.toISOString(),
          priority: 'high',
          category: 'Sniper Target',
          notes: `Calculated ${this.lastCalculatedDrop.mode === 'account_delete_30' ? '30-day' : '37-day'} drop schedule.`
        });
        this.showToast(`Added ${this.lastCalculatedDrop.name} with drop timer to watchlist!`, 'success');
        this.switchTab('watchlist');
      }
    });

    // Reflex Trainer Events
    this.trainerPingSlider.addEventListener('input', (e) => {
      const ping = parseInt(e.target.value, 10);
      this.trainerPingVal.textContent = `${ping} ms`;
      reflexTrainer.simulatedPingMs = ping;
    });

    this.trainerStartBtn.addEventListener('click', () => {
      this.trainerStartBtn.style.display = 'none';
      this.trainerSnipeBtn.style.display = 'inline-flex';
      this.trainerFeedbackBox.innerHTML = '<span style="color: var(--accent-sky);">WATCH THE COUNTDOWN... PREPARE TO CLICK!</span>';
      soundFx.playPop();

      reflexTrainer.startRound((state) => {
        this.trainerTimerDisplay.textContent = state.formatted;
        this.trainerTimerDisplay.className = `reflex-countdown-huge ${state.isDropPassed ? 'drop-passed' : ''}`;
      });
    });

    this.trainerSnipeBtn.addEventListener('click', () => {
      const result = reflexTrainer.triggerSnipe();
      if (!result) return;

      this.trainerStartBtn.style.display = 'inline-flex';
      this.trainerSnipeBtn.style.display = 'none';

      if (result.grade.includes('SNIPE')) {
        soundFx.playSuccess();
      } else {
        soundFx.playWarningPing();
      }

      this.trainerFeedbackBox.innerHTML = `
        <div class="status-badge ${result.badgeClass}" style="font-size: 0.95rem; padding: 6px 16px;">
          ${result.statusText}
        </div>
      `;

      this.renderTrainerAttempts();
    });

    // Status refresh
    this.refreshStatusBtn.addEventListener('click', () => {
      this.renderStatus();
      soundFx.playPop();
      this.showToast('Mojang services status refreshed', 'success');
    });

    // Watchlist store subscription
    watchlistStore.subscribe(() => {
      this.renderWatchlist();
      this.updateHeaderStats();
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    this.navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    this.views.forEach(view => {
      view.classList.toggle('active', view.id === `view-${tabId}`);
    });
    soundFx.playSubtleClick();
  }

  async calibrateAtomicClock(manual = false) {
    this.atomicSyncText.textContent = 'Syncing...';
    const res = await timeSync.calibrate();
    const sign = res.offsetMs >= 0 ? '+' : '';
    this.atomicSyncText.textContent = `Atomic Sync: ${sign}${res.offsetMs}ms (${res.latencyMs}ms RTT)`;
    if (manual) {
      soundFx.playPop();
      this.showToast(`Calibrated Atomic Clock! Skew: ${sign}${res.offsetMs}ms`, 'success');
    }
  }

  initClocks() {
    const update = () => {
      const now = new Date(timeSync.now());

      // User's Local Time
      const localTimeStr = now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const tzAbbr = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || 'Local';
      this.localClock.textContent = `${localTimeStr} ${tzAbbr}`;

      // UTC time
      const utcString = now.toUTCString().split(' ')[4] + ' UTC';
      this.utcClock.textContent = utcString;
    };
    update();
    setInterval(update, 1000);
  }

  initWatchlistLoop() {
    const tick = () => {
      const timerBoxes = document.querySelectorAll('.dynamic-timer-box');
      timerBoxes.forEach(box => {
        const targetTime = box.dataset.targetTime;
        const itemId = box.dataset.itemId;
        if (!targetTime) return;

        const countdown = watchlistStore.calculateCountdown(targetTime);
        if (countdown) {
          const digitsEl = box.querySelector('.timer-digits');
          const sublabelEl = box.querySelector('.timer-sublabel');

          if (digitsEl) {
            digitsEl.textContent = countdown.text;
            digitsEl.className = `timer-digits ${countdown.urgency}`;
          }
          if (sublabelEl) {
            sublabelEl.textContent = countdown.label;
          }

          const item = watchlistStore.items.find(i => i.id === itemId);
          if (item) {
            watchlistStore.checkTriggers(item, countdown);
          }
        }
      });

      requestAnimationFrame(() => {
        setTimeout(tick, 50);
      });
    };
    tick();
  }

  // Search Logic with Real Stats & Pixel-Perfect 3D Skin Studio
  async performSearch(query) {
    soundFx.playSubtleClick();
    this.saveRecentSearch(query);
    if (this.autocompleteBox) this.autocompleteBox.style.display = 'none';

    if (this.skinStudio) {
      this.skinStudio.destroy();
      this.skinStudio = null;
    }

    this.searchResultContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⌛</div>
        <h3 style="font-size: 1.2rem; font-weight: 700;">Querying Mojang & NameMC Database...</h3>
        <p style="color: var(--text-muted); margin-top: 6px;">Resolving real skins, capes, UUID, and past username change records for "${query}".</p>
      </div>
    `;

    try {
      const profile = await mcApi.lookupProfile(query);
      this.renderSearchResult(profile);
    } catch (e) {
      this.searchResultContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--accent-rose);">Lookup Error</h3>
          <p style="color: var(--text-muted); margin-top: 6px;">${e.message || 'Could not reach Minecraft database service.'}</p>
        </div>
      `;
    }
  }

  renderSearchResult(profile) {
    if (profile.status === 'invalid') {
      this.searchResultContainer.innerHTML = `
        <button class="back-to-drops-btn" id="back-to-drops-btn">← Back to Upcoming Drops & Hot Names Hub</button>
        <div class="empty-state">
          <div class="empty-state-icon">🚫</div>
          <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--accent-rose);">Invalid Minecraft Name</h3>
          <p style="color: var(--text-muted); margin-top: 6px;">${profile.reason}</p>
        </div>
      `;
      document.getElementById('back-to-drops-btn')?.addEventListener('click', () => {
        this.clearSearchResult();
      });
      return;
    }

    if (profile.status === 'available') {
      const appraisal = NameAppraiser.evaluate(profile.name);

      this.searchResultContainer.innerHTML = `
        <button class="back-to-drops-btn" id="back-to-drops-btn">← Back to Upcoming Drops & Hot Names Hub</button>
        <div class="available-hero-card">
          <span class="status-badge available">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Available To Claim
          </span>

          <div class="available-name-huge">${profile.name}</div>
          <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 20px;">
            This Minecraft username is currently available! No active player profile is holding this name.
          </p>

          ${appraisal ? `
            <div style="max-width: 480px; margin: 0 auto 24px;" class="appraisal-card">
              <div class="appraisal-header">
                <div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">OG Appraisal Score</div>
                  <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-bright);">${appraisal.tier}</div>
                </div>
                <div class="appraisal-score-badge ${appraisal.badgeClass}">
                  ${appraisal.score} / 100
                </div>
              </div>
              <div style="font-size: 0.8rem; color: var(--accent-emerald); font-weight: 600;">
                Estimated Value: ${appraisal.estimatedMarket}
              </div>
            </div>
          ` : ''}

          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="btn-primary" id="search-track-available-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Track on Watchlist
            </button>
            <a href="https://www.minecraft.net/en-us/msaprofile/mygames/editprofile" target="_blank" rel="noopener noreferrer" class="btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Claim on Minecraft.net
            </a>
            <button class="btn-secondary" id="search-copy-name-btn">
              Copy Name
            </button>
          </div>
        </div>
      `;

      document.getElementById('back-to-drops-btn')?.addEventListener('click', () => {
        this.clearSearchResult();
      });

      document.getElementById('search-track-available-btn')?.addEventListener('click', () => {
        watchlistStore.add({
          name: profile.name,
          status: 'available',
          priority: 'high',
          category: 'Clean Words',
          notes: 'Available right now to claim!'
        });
        this.showToast(`Added ${profile.name} to Watchlist!`, 'success');
      });

      document.getElementById('search-copy-name-btn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(profile.name);
        this.showToast('Copied name to clipboard', 'success');
      });

      return;
    }

    // Taken Profile: Calculate OG Appraisal
    const appraisal = NameAppraiser.evaluate(profile.username);

    // Active 37-day drop banner HTML
    const activeDropHtml = profile.activeDrop ? `
      <div class="active-drop-banner">
        <div>
          <div style="font-weight: 800; font-size: 1.1rem; color: var(--accent-amber);">
            🚨 Active Drop Cycle Detected: "${profile.activeDrop.droppedName}"
          </div>
          <div style="font-size: 0.85rem; color: var(--text-main); margin-top: 4px;">
            ${profile.username} changed their name on ${new Date(profile.activeDrop.changeDate).toLocaleDateString()}. 
            Previous name drops to public in <strong>${profile.activeDrop.remainingDays} days</strong> (${DropCalculator.formatLocalTime(profile.activeDrop.dropDate).localStr}).
          </div>
        </div>
        <button class="btn-primary" id="track-active-drop-btn" style="white-space: nowrap;">
          Track This Drop ⏱️
        </button>
      </div>
    ` : '';

    // Capes HTML
    const capesHtml = (profile.capesList && profile.capesList.length > 0) ? `
      <div style="margin-top: 4px;">
        <div class="section-title">Owned Capes (${profile.capesList.length})</div>
        <div class="capes-row">
          ${profile.capesList.map(c => `
            <span class="cape-pill">
              <span>🛡️</span>
              <span>${c.badge || c.name}</span>
            </span>
          `).join('')}
        </div>
      </div>
    ` : '';

    // History items HTML
    const historyHtml = (profile.history && profile.history.length > 0)
      ? profile.history.map(h => `
          <div class="history-item">
            <div style="display: flex; align-items: center;">
              <span class="history-name">${h.name}</span>
              ${h.isOriginal ? '<span class="original-badge">Original</span>' : ''}
            </div>
            <div style="text-align: right;">
              <div class="history-date">${h.changedToAt ? new Date(h.changedToAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Original Name'}</div>
              <div style="font-size: 0.72rem; color: var(--accent-sky); font-family: 'JetBrains Mono', monospace;">${h.durationLabel || ''}</div>
            </div>
          </div>
        `).join('')
      : '<div style="color: var(--text-muted); font-size: 0.88rem; padding: 10px;">No previous name changes on record.</div>';

    // Account creation string
    const createdStr = profile.createdAt
      ? `${profile.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`
      : 'Legacy Account';

    this.searchResultContainer.innerHTML = `
      <button class="back-to-drops-btn" id="back-to-drops-btn">← Back to Upcoming Drops & Hot Names Hub</button>
      ${activeDropHtml}
      <div class="profile-card" id="profile-card-container">
        <div class="profile-skin-column">
          <div class="skin-3d-viewport" id="skin-3d-canvas-container"></div>

          <div class="skin-studio-toolbar">
            <select class="anim-select" id="skin-anim-select" title="Change Animation">
              <option value="walk">🚶 Walk</option>
              <option value="run">🏃 Run</option>
              <option value="idle">🧍 Idle</option>
              <option value="wave">👋 Wave</option>
              <option value="fly">🦅 Fly</option>
              <option value="none">⏸️ Pause</option>
            </select>
            <button class="btn-ghost" id="skin-rotate-toggle-btn" title="Toggle Auto-Spin">
              🔄 Spin
            </button>
            <button class="btn-ghost" id="skin-layers-toggle-btn" title="Toggle Outer Jacket/Hat Layer">
              🧥 Layers
            </button>
            <button class="btn-ghost" id="skin-reset-btn" title="Reset View Angle">
              🎯 Reset
            </button>
          </div>

          <div class="skin-actions" style="margin-top: 14px; display: flex; gap: 8px; width: 100%;">
            <a href="${profile.namemcUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="flex: 1; text-align: center; justify-content: center;">
              NameMC ↗
            </a>
            <a href="https://hypixel.net/player/${profile.username}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="flex: 1; text-align: center; justify-content: center;">
              Hypixel ↗
            </a>
            <a href="${profile.skinUrl}" download="${profile.username}_skin.png" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="padding: 10px 12px;" title="Download Skin PNG">
              📥
            </a>
          </div>
        </div>

        <div class="profile-info-column">
          <div class="profile-header-row">
            <div>
              <div class="profile-name-title">
                ${profile.username}
                <span class="status-badge taken">Taken / Active</span>
              </div>
            </div>

            <button class="btn-primary" id="track-profile-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Track Name
            </button>
          </div>

          <!-- Comprehensive Real Profile Analytics Grid -->
          <div class="deep-stats-grid">
            <div class="stat-box-card">
              <div class="stat-box-label">Profile Views</div>
              <div class="stat-box-val highlight-green">${profile.lifetimeViews.toLocaleString()}</div>
            </div>
            <div class="stat-box-card">
              <div class="stat-box-label">Monthly Views</div>
              <div class="stat-box-val">${profile.monthlyViews.toLocaleString()} / mo</div>
            </div>
            <div class="stat-box-card">
              <div class="stat-box-label">Upvotes / Likes</div>
              <div class="stat-box-val highlight-pink">★ ${profile.lifetimeUpvotes}</div>
            </div>
            <div class="stat-box-card">
              <div class="stat-box-label">Account Type</div>
              <div class="stat-box-val" style="font-size: 0.92rem;">${profile.accountType}</div>
            </div>
            <div class="stat-box-card">
              <div class="stat-box-label">Registered / Created</div>
              <div class="stat-box-val" style="font-size: 0.88rem;">${createdStr}</div>
            </div>
            <div class="stat-box-card">
              <div class="stat-box-label">Skin Model</div>
              <div class="stat-box-val" style="font-size: 0.9rem;">${profile.isSlim ? 'Slim (Alex 3px)' : 'Classic (Steve 4px)'}</div>
            </div>
          </div>

          <!-- OG Appraisal Card -->
          ${appraisal ? `
            <div class="appraisal-card">
              <div class="appraisal-header">
                <div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">OG Rarity Appraisal</div>
                  <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-bright);">${appraisal.tier}</div>
                </div>
                <div class="appraisal-score-badge ${appraisal.badgeClass}">
                  ${appraisal.score} / 100
                </div>
              </div>
              <div style="font-size: 0.8rem; color: var(--accent-emerald); font-weight: 600;">
                Market Demand: ${appraisal.estimatedMarket}
              </div>
            </div>
          ` : ''}

          <div class="uuid-box">
            <span>${profile.uuid}</span>
            <button class="uuid-copy-btn" id="copy-uuid-btn" title="Copy UUID">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>

          ${capesHtml}

          <div class="history-section">
            <div class="section-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Username Change History (${profile.history ? profile.history.length : 1})
            </div>
            <div class="history-list">
              ${historyHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('back-to-drops-btn')?.addEventListener('click', () => {
      this.clearSearchResult();
    });

    // Initialize skinview3d Pixel-Perfect 3D Studio
    const canvasContainer = document.getElementById('skin-3d-canvas-container');
    if (canvasContainer) {
      this.skinStudio = new Skin3DStudio(canvasContainer);
      this.skinStudio.init();
      this.skinStudio.loadSkinTexture(profile.skinUrl, profile.capeUrl, profile.isSlim);

      document.getElementById('skin-anim-select')?.addEventListener('change', (e) => {
        if (this.skinStudio) {
          this.skinStudio.setAnimation(e.target.value);
        }
      });

      document.getElementById('skin-rotate-toggle-btn')?.addEventListener('click', () => {
        if (this.skinStudio) {
          const rotating = this.skinStudio.toggleAutoRotate();
          this.showToast(`3D Auto-Spin ${rotating ? 'Enabled' : 'Paused'}`, 'normal');
        }
      });

      document.getElementById('skin-layers-toggle-btn')?.addEventListener('click', () => {
        if (this.skinStudio) {
          const visible = this.skinStudio.toggleOuterLayer();
          this.showToast(`Outer Skin Layers ${visible ? 'Shown' : 'Hidden'}`, 'normal');
        }
      });

      document.getElementById('skin-reset-btn')?.addEventListener('click', () => {
        if (this.skinStudio) this.skinStudio.resetView();
      });
    }

    // Active Drop Button
    document.getElementById('track-active-drop-btn')?.addEventListener('click', () => {
      if (profile.activeDrop) {
        watchlistStore.add({
          name: profile.activeDrop.droppedName,
          status: 'dropping',
          targetTime: profile.activeDrop.dropDate.toISOString(),
          priority: 'high',
          category: 'Sniper Target',
          notes: `Detected drop from ${profile.username}. 37-day public drop.`
        });
        this.showToast(`Tracking drop for "${profile.activeDrop.droppedName}"!`, 'success');
        this.switchTab('watchlist');
      }
    });

    // Track button
    document.getElementById('track-profile-btn')?.addEventListener('click', () => {
      this.openTrackModal({
        name: profile.username,
        notes: `UUID: ${profile.uuid}`,
        category: 'Personal'
      });
    });

    // Copy UUID button
    document.getElementById('copy-uuid-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(profile.uuid);
      this.showToast('Copied UUID to clipboard', 'success');
      soundFx.playPop();
    });
  }

  clearSearchResult() {
    if (this.skinStudio) {
      this.skinStudio.destroy();
      this.skinStudio = null;
    }
    this.searchResultContainer.innerHTML = '';
    this.searchInput.value = '';
    this.dropsHubSection?.scrollIntoView({ behavior: 'smooth' });
  }

  // Marquee Live Drop Ticker
  renderMarquee() {
    if (!this.marqueeTrack) return;
    const events = dropsFeed.getMarqueeEvents();
    const doubled = [...events, ...events];

    this.marqueeTrack.innerHTML = doubled.map(ev => `
      <div class="marquee-item">
        <span>${ev.icon}</span>
        <span>${ev.text}</span>
      </div>
    `).join('');

    this.marqueeTrack.querySelectorAll('.marquee-item').forEach(item => {
      item.addEventListener('click', () => {
        const strong = item.querySelector('strong');
        if (strong) {
          const name = strong.textContent.trim();
          this.searchInput.value = name;
          this.performSearch(name);
        }
      });
    });
  }

  // Dropping Soon & Hot Names Discovery Hub
  renderDropsHub() {
    if (!this.dropsFeedGrid) return;

    const drops = dropsFeed.getFilteredDrops({
      categoryTab: this.activeDropTab,
      lengthFilter: this.activeLengthFilter,
      sortMode: this.activeSortMode,
      searchQuery: this.dropSearchQuery
    });

    if (this.dropsCountPill) {
      this.dropsCountPill.textContent = `${drops.length} ${drops.length === 1 ? 'Name' : 'Names'}`;
    }

    if (drops.length === 0) {
      this.dropsFeedGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 40px 20px;">
          <div class="empty-state-icon">🔍</div>
          <h3 style="font-size: 1.15rem; font-weight: 700;">No Matching Names in this Filter</h3>
          <p style="color: var(--text-muted); margin-top: 4px;">Try changing the length filter or clearing your search term.</p>
        </div>
      `;
      return;
    }

    this.dropsFeedGrid.innerHTML = drops.map(item => {
      const isDropping = item.status === 'dropping' && item.targetTime != null;
      const isAvailable = item.status === 'available';
      const countdown = isDropping ? watchlistStore.calculateCountdown(item.targetTime) : null;
      const avatarUrl = `https://crafthead.net/helm/${encodeURIComponent(item.name)}/64`;

      const appraisalBadge = item.appraisal ? `
        <span class="appraisal-score-badge ${item.appraisal.badgeClass}" style="font-size: 0.72rem; padding: 2px 8px;">
          ${item.appraisal.tier.split(' ')[0]} (${item.appraisal.score})
        </span>
      ` : '';

      let timerBoxHtml = '';
      if (isDropping) {
        const dropLocalFmt = DropCalculator.formatLocalTime(new Date(item.targetTime));
        timerBoxHtml = `
          <div class="timer-display-box dynamic-drop-timer-box" data-target-time="${item.targetTime}" data-drop-name="${item.name}">
            <div class="timer-digits ${countdown?.urgency || ''}" style="font-size: 1.45rem;">${countdown?.text || '--:--:--'}</div>
            <div class="timer-sublabel" style="font-size: 0.7rem;">Drops: ${dropLocalFmt.localStr}</div>
          </div>
        `;
      } else if (isAvailable) {
        timerBoxHtml = `
          <div class="timer-display-box" style="border-color: rgba(16, 185, 129, 0.35); background: rgba(16, 185, 129, 0.06);">
            <div class="timer-digits dropped" style="font-size: 1.25rem;">AVAILABLE NOW</div>
            <div class="timer-sublabel" style="color: var(--accent-emerald);">Ready to Claim on Mojang</div>
          </div>
        `;
      } else {
        timerBoxHtml = `
          <div class="timer-display-box">
            <div class="timer-digits" style="font-size: 1.2rem; color: var(--text-secondary);">ACTIVE ACCOUNT</div>
            <div class="timer-sublabel">High Search Volume</div>
          </div>
        `;
      }

      return `
        <div class="hot-drop-card ${countdown?.urgency === 'critical' ? 'card-dropping-critical' : isDropping ? 'card-dropping-soon' : ''}" id="drop-card-${item.id}">
          <div class="hot-drop-header">
            <div class="hot-drop-identity">
              <img src="${avatarUrl}" alt="${item.name}" class="hot-drop-avatar" onerror="this.src='https://minotar.net/helm/Steve/64.png'" />
              <div class="hot-drop-name-wrap">
                <div class="hot-drop-name">${item.name}</div>
                <div class="hot-drop-cat-tag">${item.category}</div>
              </div>
            </div>

            <div class="hot-drop-badges">
              ${appraisalBadge}
              <span class="hot-drop-tag-badge">${item.tag}</span>
            </div>
          </div>

          ${timerBoxHtml}

          <div class="hot-drop-metrics">
            <div class="metric-item">
              <span class="metric-val">${item.monthlySearches.toLocaleString()}</span>
              <span class="metric-label">Monthly Searches</span>
            </div>
            <div class="metric-item">
              <span class="metric-val">${item.lifetimeViews.toLocaleString()}</span>
              <span class="metric-label">NameMC Views</span>
            </div>
          </div>

          <div class="hot-drop-footer">
            <button class="hot-drop-hype-btn ${item.isUserHyped ? 'hyped' : ''}" data-action="hype-drop" data-name="${item.name}" title="Upvote / Hype this name">
              <span>🔥</span>
              <span class="hype-count-num">${item.hypes}</span>
            </button>

            <div class="hot-drop-actions">
              <button class="btn-ghost" data-action="inspect-drop" data-name="${item.name}" title="Inspect 3D Skin & Stats">
                <span>🔍</span>
                <span>Inspect</span>
              </button>
              <button class="btn-ghost" data-action="track-drop" data-name="${item.name}" data-target-time="${item.targetTime || ''}" data-status="${item.status}" title="Add to Sniper Watchlist">
                <span>⭐</span>
                <span>Track</span>
              </button>
              <button class="btn-ghost" data-action="copy-drop" data-name="${item.name}" title="Copy Username">
                <span>📋</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind Feed Card Actions
    this.dropsFeedGrid.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const name = btn.dataset.name;

        if (action === 'hype-drop') {
          const res = dropsFeed.toggleHype(name);
          if (res.success) {
            soundFx.playHype();
            btn.classList.add('hyped');
            const numSpan = btn.querySelector('.hype-count-num');
            if (numSpan) numSpan.textContent = res.hypes;

            // Spawn floating +1 particle
            const particle = document.createElement('span');
            particle.className = 'hype-float-particle';
            particle.textContent = '+1 🔥';
            btn.appendChild(particle);
            setTimeout(() => particle.remove(), 700);

            this.showToast(`Hyped "${name}"! (${res.hypes} total hypes)`, 'success');
          }
        } else if (action === 'inspect-drop') {
          this.searchInput.value = name;
          this.performSearch(name);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'track-drop') {
          const targetTime = btn.dataset.targetTime;
          const status = btn.dataset.status;
          watchlistStore.add({
            name: name,
            targetTime: targetTime || null,
            status: status || 'dropping',
            priority: 'high',
            category: 'OGs',
            notes: `Added from Hot Drops Hub. Status: ${status}.`
          });
          soundFx.playSuccess();
          this.showToast(`Added "${name}" with countdown timer to Watchlist!`, 'success');
        } else if (action === 'copy-drop') {
          navigator.clipboard.writeText(name);
          soundFx.playPop();
          this.showToast(`Copied "${name}" to clipboard`, 'success');
        }
      });
    });
  }

  // Real-time ticking loop for discovery hub drop cards
  initDropsTimerLoop() {
    const tick = () => {
      const feedTimerBoxes = document.querySelectorAll('.dynamic-drop-timer-box');
      feedTimerBoxes.forEach(box => {
        const targetTime = box.dataset.targetTime;
        if (!targetTime) return;

        const countdown = watchlistStore.calculateCountdown(targetTime);
        if (countdown) {
          const digitsEl = box.querySelector('.timer-digits');
          if (digitsEl) {
            digitsEl.textContent = countdown.text;
            digitsEl.className = `timer-digits ${countdown.urgency}`;
          }
        }
      });

      requestAnimationFrame(() => {
        setTimeout(tick, 100);
      });
    };
    tick();
  }

  // Instant Search Autocomplete
  initAutocomplete() {
    if (!this.searchInput || !this.autocompleteBox) return;

    this.searchInput.addEventListener('input', (e) => {
      const val = e.target.value.trim().toLowerCase();
      if (!val) {
        this.autocompleteBox.style.display = 'none';
        return;
      }

      const matches = dropsFeed.drops.filter(d => d.name.toLowerCase().includes(val)).slice(0, 6);
      if (matches.length === 0) {
        this.autocompleteBox.style.display = 'none';
        return;
      }

      this.autocompleteBox.innerHTML = matches.map(m => `
        <div class="autocomplete-item" data-name="${m.name}">
          <div class="autocomplete-left">
            <img src="https://crafthead.net/helm/${encodeURIComponent(m.name)}/32" class="autocomplete-avatar" onerror="this.src='https://minotar.net/helm/Steve/32.png'" />
            <span class="autocomplete-name">${m.name}</span>
          </div>
          <span class="autocomplete-tag status-badge ${m.status === 'available' ? 'available' : 'taken'}">${m.tag}</span>
        </div>
      `).join('');

      this.autocompleteBox.style.display = 'block';

      this.autocompleteBox.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          const name = item.dataset.name;
          this.searchInput.value = name;
          this.autocompleteBox.style.display = 'none';
          this.performSearch(name);
        });
      });
    });

    document.addEventListener('click', (e) => {
      if (!this.searchInput.contains(e.target) && !this.autocompleteBox.contains(e.target)) {
        this.autocompleteBox.style.display = 'none';
      }
    });
  }

  // Recent Searches History
  loadRecentSearches() {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      return raw ? JSON.parse(raw) : ['Void', 'Aero', 'Notch', 'Echo'];
    } catch {
      return ['Void', 'Aero', 'Notch', 'Echo'];
    }
  }

  saveRecentSearch(name) {
    if (!name || typeof name !== 'string') return;
    const clean = name.trim();
    if (!clean) return;

    const filtered = this.recentSearches.filter(n => n.toLowerCase() !== clean.toLowerCase());
    filtered.unshift(clean);
    this.recentSearches = filtered.slice(0, 6);

    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(this.recentSearches));
    } catch (e) {
      console.warn('Recent searches persist error', e);
    }
    this.renderRecentSearches();
  }

  renderRecentSearches() {
    if (!this.recentSearchesRow || !this.recentChipsContainer) return;
    if (this.recentSearches.length === 0) {
      this.recentSearchesRow.style.display = 'none';
      return;
    }

    this.recentSearchesRow.style.display = 'flex';
    this.recentChipsContainer.innerHTML = this.recentSearches.map(n => `
      <span class="recent-chip" data-name="${n}">${n}</span>
    `).join('');

    this.recentChipsContainer.querySelectorAll('.recent-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const name = chip.dataset.name;
        this.searchInput.value = name;
        this.performSearch(name);
      });
    });
  }

  // Drop Roulette Interactive Slot Game
  initRoulette() {
    if (!this.openRouletteBtn || !this.rouletteModal) return;

    this.openRouletteBtn.addEventListener('click', () => {
      this.rouletteModal.classList.add('open');
      soundFx.playPop();
      if (this.rouletteResultCard) this.rouletteResultCard.style.display = 'none';
    });

    const closeRoulette = () => {
      this.rouletteModal.classList.remove('open');
      soundFx.playSubtleClick();
    };

    this.closeRouletteModalBtn?.addEventListener('click', closeRoulette);

    this.triggerRouletteSpinBtn?.addEventListener('click', () => {
      if (this.isSpinningRoulette) return;
      this.isSpinningRoulette = true;
      this.triggerRouletteSpinBtn.disabled = true;
      this.triggerRouletteSpinBtn.textContent = 'Spinning... 🎲';
      if (this.rouletteResultCard) this.rouletteResultCard.style.display = 'none';

      let count = 0;
      const totalSteps = 24;
      const interval = setInterval(() => {
        count++;
        const randomItem = dropsFeed.getRandomDrop();
        soundFx.playRouletteTick();

        if (this.rouletteSlotReel) {
          this.rouletteSlotReel.innerHTML = `
            <div class="roulette-slot-item">
              <div class="roulette-reel-name">${randomItem.name}</div>
              <div class="roulette-reel-sub">${randomItem.category} • ${randomItem.tag}</div>
            </div>
          `;
        }

        if (count >= totalSteps) {
          clearInterval(interval);
          this.isSpinningRoulette = false;
          this.triggerRouletteSpinBtn.disabled = false;
          this.triggerRouletteSpinBtn.textContent = 'SPIN AGAIN 🎲';

          // Winner selection
          const winner = dropsFeed.getRandomDrop();
          soundFx.playRouletteWin();

          if (this.rouletteSlotReel) {
            this.rouletteSlotReel.innerHTML = `
              <div class="roulette-slot-item">
                <div class="roulette-reel-name" style="color: var(--accent-emerald); text-shadow: 0 0 20px rgba(16,185,129,0.5);">${winner.name}</div>
                <div class="roulette-reel-sub" style="color: var(--text-bright);">${winner.category} (Score: ${winner.appraisal?.score || 90})</div>
              </div>
            `;
          }

          if (this.rouletteResultCard) {
            this.rouletteResultCard.style.display = 'flex';
            this.rouletteResultCard.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="https://crafthead.net/helm/${encodeURIComponent(winner.name)}/48" style="width: 36px; height: 36px; border-radius: 6px;" onerror="this.src='https://minotar.net/helm/Steve/48.png'" />
                  <div>
                    <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-bright); font-family: 'JetBrains Mono', monospace;">${winner.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${winner.tag}</div>
                  </div>
                </div>
                <span class="status-badge available" style="font-size: 0.72rem;">OG Tier: ${winner.appraisal?.tier.split(' ')[0] || 'S'}</span>
              </div>

              <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                ${winner.status === 'available' ? 'Available to claim on Minecraft.net right now!' : `Drop candidate with estimated ${winner.monthlySearches.toLocaleString()} monthly searches.`}
              </div>

              <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 6px;">
                <button class="btn-secondary" id="roulette-inspect-btn">🔍 Inspect Profile</button>
                <button class="btn-primary" id="roulette-track-btn">⭐ Track Drop</button>
              </div>
            `;

            document.getElementById('roulette-inspect-btn')?.addEventListener('click', () => {
              closeRoulette();
              this.searchInput.value = winner.name;
              this.performSearch(winner.name);
            });

            document.getElementById('roulette-track-btn')?.addEventListener('click', () => {
              watchlistStore.add({
                name: winner.name,
                targetTime: winner.targetTime || null,
                status: winner.status || 'dropping',
                priority: 'high',
                category: 'OGs',
                notes: 'Won from Drop Roulette mystery spin!'
              });
              this.showToast(`Added ${winner.name} to Watchlist!`, 'success');
              closeRoulette();
              this.switchTab('watchlist');
            });
          }
        }
      }, 75);
    });
  }

  // Interactive OG Name Duel Arena
  initNameDuel() {
    if (!this.nameDuelSection) return;

    this.toggleNameDuelBtn?.addEventListener('click', () => {
      const isHidden = this.nameDuelSection.style.display === 'none';
      this.nameDuelSection.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        soundFx.playPop();
        this.nameDuelSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    this.closeDuelBtn?.addEventListener('click', () => {
      this.nameDuelSection.style.display = 'none';
      soundFx.playSubtleClick();
    });

    this.duelPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.duelInput1.value = btn.dataset.n1;
        this.duelInput2.value = btn.dataset.n2;
        this.runNameDuel();
      });
    });

    this.runDuelBtn?.addEventListener('click', () => {
      this.runNameDuel();
    });
  }

  runNameDuel() {
    const n1 = this.duelInput1.value.trim();
    const n2 = this.duelInput2.value.trim();

    if (!n1 || !n2) {
      this.showToast('Please enter both usernames to duel', 'warning');
      return;
    }

    try {
      const duel = NameDuelEngine.fight(n1, n2);
      soundFx.playBattleWin();

      this.duelResultsContainer.style.display = 'flex';
      this.duelResultsContainer.innerHTML = `
        <div class="duel-verdict-banner">
          ${duel.summary}
        </div>

        <div class="duel-vs-arena">
          <!-- Fighter 1 Card -->
          <div class="duel-fighter-card ${duel.winner === 'fighter1' ? 'winner' : ''}">
            ${duel.winner === 'fighter1' ? '<div class="duel-crown-badge">👑 WINNER</div>' : ''}
            <img src="${duel.fighter1.avatar}" style="width: 64px; height: 64px; border-radius: 8px; image-rendering: pixelated;" onerror="this.src='https://minotar.net/helm/Steve/64.png'" />
            <div>
              <div style="font-size: 1.5rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--text-bright);">${duel.fighter1.name}</div>
              <div style="font-size: 0.78rem; color: var(--accent-sky); font-weight: 700; margin-top: 2px;">${duel.fighter1.appraisal.tier}</div>
            </div>

            <div class="duel-power-meter">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700;">
                <span>Battle Power</span>
                <span style="color: var(--accent-sky); font-family: 'JetBrains Mono', monospace;">${duel.fighter1.power} / 100</span>
              </div>
              <div class="power-meter-bar-bg">
                <div class="power-meter-bar-fill" style="width: ${duel.fighter1.power}%;"></div>
              </div>
            </div>

            <div style="font-size: 0.8rem; color: var(--text-secondary); width: 100%; text-align: left; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
              <div>• Length: <strong>${duel.fighter1.length} Characters</strong></div>
              <div>• Dictionary: <strong>${duel.fighter1.appraisal.isDictionary ? 'Yes (Clean Word)' : 'Handle'}</strong></div>
              <div>• OG Score: <strong>${duel.fighter1.appraisal.score} / 100</strong></div>
            </div>

            <button class="btn-secondary" data-duel-inspect="${duel.fighter1.name}" style="width: 100%; justify-content: center; font-size: 0.82rem;">Inspect 3D Skin</button>
          </div>

          <!-- Fighter 2 Card -->
          <div class="duel-fighter-card ${duel.winner === 'fighter2' ? 'winner' : ''}">
            ${duel.winner === 'fighter2' ? '<div class="duel-crown-badge">👑 WINNER</div>' : ''}
            <img src="${duel.fighter2.avatar}" style="width: 64px; height: 64px; border-radius: 8px; image-rendering: pixelated;" onerror="this.src='https://minotar.net/helm/Steve/64.png'" />
            <div>
              <div style="font-size: 1.5rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--text-bright);">${duel.fighter2.name}</div>
              <div style="font-size: 0.78rem; color: var(--accent-sky); font-weight: 700; margin-top: 2px;">${duel.fighter2.appraisal.tier}</div>
            </div>

            <div class="duel-power-meter">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700;">
                <span>Battle Power</span>
                <span style="color: var(--accent-sky); font-family: 'JetBrains Mono', monospace;">${duel.fighter2.power} / 100</span>
              </div>
              <div class="power-meter-bar-bg">
                <div class="power-meter-bar-fill" style="width: ${duel.fighter2.power}%;"></div>
              </div>
            </div>

            <div style="font-size: 0.8rem; color: var(--text-secondary); width: 100%; text-align: left; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
              <div>• Length: <strong>${duel.fighter2.length} Characters</strong></div>
              <div>• Dictionary: <strong>${duel.fighter2.appraisal.isDictionary ? 'Yes (Clean Word)' : 'Handle'}</strong></div>
              <div>• OG Score: <strong>${duel.fighter2.appraisal.score} / 100</strong></div>
            </div>

            <button class="btn-secondary" data-duel-inspect="${duel.fighter2.name}" style="width: 100%; justify-content: center; font-size: 0.82rem;">Inspect 3D Skin</button>
          </div>
        </div>
      `;

      this.duelResultsContainer.querySelectorAll('[data-duel-inspect]').forEach(b => {
        b.addEventListener('click', () => {
          const targetName = b.dataset.duelInspect;
          this.searchInput.value = targetName;
          this.performSearch(targetName);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });

    } catch (e) {
      this.showToast(e.message, 'warning');
    }
  }

  // Watchlist Rendering
  renderWatchlist() {
    const items = watchlistStore.items;
    this.updateHeaderStats();

    let filtered = items;
    if (this.activeFilter === 'dropping') {
      filtered = items.filter(i => i.status === 'dropping' || (i.targetTime && new Date(i.targetTime) > timeSync.now()));
    } else if (this.activeFilter === 'available') {
      filtered = items.filter(i => i.status === 'available');
    } else if (this.activeFilter === 'high') {
      filtered = items.filter(i => i.priority === 'high');
    }

    if (filtered.length === 0) {
      this.watchlistGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📋</div>
          <h3 style="font-size: 1.2rem; font-weight: 700;">No Tracked Names in this View</h3>
          <p style="color: var(--text-muted); margin-top: 6px;">Click "Track Name" in the top bar to add your first target username.</p>
        </div>
      `;
      return;
    }

    this.watchlistGrid.innerHTML = filtered.map(item => {
      const isDropping = item.targetTime != null;
      const countdown = isDropping ? watchlistStore.calculateCountdown(item.targetTime) : null;
      const avatarUrl = `https://crafthead.net/helm/${encodeURIComponent(item.name)}/64`;

      const priorityClasses = {
        high: 'priority-high',
        medium: 'priority-medium',
        low: 'priority-low'
      };

      const priorityIcons = {
        high: 'High 🔥',
        medium: 'Medium ⭐',
        low: 'Low 💤'
      };

      const timerBoxHtml = isDropping ? `
        <div class="timer-display-box dynamic-timer-box" data-target-time="${item.targetTime}" data-item-id="${item.id}">
          <div class="timer-digits ${countdown?.urgency || ''}">${countdown?.text || '--:--:--'}</div>
          <div class="timer-sublabel">${countdown?.label || 'Drop Countdown'}</div>
        </div>
      ` : `
        <div class="timer-display-box">
          <div class="timer-digits ${item.status === 'available' ? 'dropped' : ''}" style="font-size: 1.15rem;">
            ${item.status === 'available' ? 'AVAILABLE NOW' : 'ACTIVE / TAKEN'}
          </div>
          <div class="timer-sublabel">${item.status === 'available' ? 'Ready to Claim' : 'Status Monitored'}</div>
        </div>
      `;

      return `
        <div class="snipe-card ${countdown?.urgency === 'critical' ? 'urgency-critical' : ''}" id="card-${item.id}">
          <div class="snipe-card-header">
            <div class="snipe-identity">
              <img src="${avatarUrl}" alt="${item.name}" class="snipe-avatar" onerror="this.src='https://minotar.net/helm/Steve/64.png'" />
              <div>
                <div class="snipe-name">${item.name}</div>
                <div class="snipe-category-badge">${item.category || 'General'}</div>
              </div>
            </div>

            <button class="snipe-priority-tag ${priorityClasses[item.priority] || 'priority-medium'}" data-action="toggle-priority" data-id="${item.id}" title="Click to cycle priority">
              ${priorityIcons[item.priority] || 'Medium ⭐'}
            </button>
          </div>

          ${timerBoxHtml}

          <div class="snipe-notes-text">
            ${item.notes ? item.notes : '<span style="color: var(--text-muted); font-style: italic;">No custom notes attached.</span>'}
          </div>

          <div class="snipe-card-footer">
            <div class="card-actions-group">
              <button class="btn-ghost" data-action="recheck" data-id="${item.id}" title="Re-check API status">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              </button>
              <button class="btn-ghost" data-action="copy" data-name="${item.name}" title="Copy Name">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button class="btn-ghost" data-action="edit" data-id="${item.id}" title="Edit Name & Timer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <a href="https://www.minecraft.net/en-us/msaprofile/mygames/editprofile" target="_blank" rel="noopener noreferrer" class="btn-ghost" title="Open Mojang Change Name Page">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </div>

            <button class="btn-ghost" data-action="delete" data-id="${item.id}" style="color: var(--accent-rose);" title="Remove from Watchlist">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.watchlistGrid.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        const name = btn.dataset.name;

        if (action === 'toggle-priority') {
          watchlistStore.togglePriority(id);
        } else if (action === 'delete') {
          watchlistStore.remove(id);
          this.showToast('Removed name from watchlist', 'normal');
        } else if (action === 'copy') {
          navigator.clipboard.writeText(name);
          soundFx.playPop();
          this.showToast(`Copied "${name}" to clipboard`, 'success');
        } else if (action === 'edit') {
          const item = watchlistStore.items.find(i => i.id === id);
          if (item) this.openTrackModal(item);
        } else if (action === 'recheck') {
          watchlistStore.recheckItem(id);
          this.showToast(`Rechecked availability for ${id}`, 'normal');
        }
      });
    });
  }

  updateHeaderStats() {
    const stats = watchlistStore.getStats();
    this.navWatchlistCount.textContent = stats.total;
    this.statDropping.textContent = `${stats.droppingToday} Dropping Soon`;
    this.statAvailable.textContent = `${stats.availableCount} Available`;

    document.getElementById('count-filter-all').textContent = stats.total;
    document.getElementById('count-filter-dropping').textContent = watchlistStore.items.filter(i => i.status === 'dropping' || i.targetTime).length;
    document.getElementById('count-filter-available').textContent = stats.availableCount;
    document.getElementById('count-filter-high').textContent = stats.highPriority;
  }

  openTrackModal(preset = {}) {
    this.trackEditId.value = preset.id || '';
    this.trackNameInput.value = preset.name || '';
    this.modalTitle.textContent = preset.id ? 'Edit Tracked Name' : 'Track Minecraft Name';

    if (preset.targetTime) {
      const d = new Date(preset.targetTime);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      this.trackTimeInput.value = d.toISOString().slice(0, 16);
    } else {
      this.trackTimeInput.value = '';
    }

    this.trackPrioritySelect.value = preset.priority || 'medium';
    this.trackCategorySelect.value = preset.category || 'OGs';
    this.trackNotesInput.value = preset.notes || '';

    this.trackModal.classList.add('open');
    soundFx.playPop();
  }

  closeTrackModal() {
    this.trackModal.classList.remove('open');
    soundFx.playSubtleClick();
  }

  // OG Name Generator
  renderGenerator() {
    const mode = this.genModeSelect.value;
    const pattern = this.genPatternSelect.value;
    const count = parseInt(this.genCountSelect.value, 10) || 12;

    let names = [];
    if (mode === '3char') {
      names = NameGenerator.generate3Char(count, pattern);
    } else if (mode === 'cvcv') {
      names = NameGenerator.generateCVCV(count);
    } else if (mode === 'aesthetic') {
      names = NameGenerator.generateAesthetic(count);
    } else if (mode === 'compound') {
      names = NameGenerator.generateCompound(count);
    }

    this.generatorResultsGrid.innerHTML = names.map(item => `
      <div class="generated-name-card">
        <div>
          <div class="gen-name-text">${item.name}</div>
          <div class="gen-type-tag">${item.type}</div>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="btn-ghost gen-search-btn" data-name="${item.name}" title="Search & Lookup">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          <button class="btn-ghost gen-add-btn" data-name="${item.name}" title="Track in Watchlist">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
      </div>
    `).join('');

    this.generatorResultsGrid.querySelectorAll('.gen-search-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        this.switchTab('search');
        this.searchInput.value = name;
        this.performSearch(name);
      });
    });

    this.generatorResultsGrid.querySelectorAll('.gen-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        watchlistStore.add({
          name: name,
          status: 'dropping',
          priority: 'medium',
          category: 'OGs',
          notes: 'Generated combo candidate.'
        });
        this.showToast(`Added "${name}" to Watchlist!`, 'success');
      });
    });
  }

  // Drop Calculator in Local Time
  runCalculator() {
    const name = this.calcNameInput.value.trim() || 'CustomName';
    const dateVal = this.calcDatetimeInput.value;
    const mode = this.calcModeSelect.value;

    if (!dateVal) {
      this.showToast('Please select the date/time of name change', 'warning');
      return;
    }

    try {
      const schedule = DropCalculator.calculateDropSchedule(dateVal, mode);
      schedule.name = name;
      this.lastCalculatedDrop = schedule;

      const graceFmt = DropCalculator.formatLocalTime(schedule.graceEndTime);
      const dropFmt = DropCalculator.formatLocalTime(schedule.dropTime);

      this.calcGraceOutput.textContent = graceFmt.localStr;
      this.calcDropOutput.textContent = dropFmt.localStr;
      this.calcDropUtcOutput.textContent = `(${dropFmt.utcStr})`;

      const countdown = watchlistStore.calculateCountdown(schedule.dropTime.toISOString());
      this.calcRemainingOutput.textContent = countdown ? countdown.text : 'Already Passed';

      this.calcResultsCard.style.display = 'flex';
      soundFx.playSuccess();
      this.showToast('Calculated drop timetable in your Local Time!', 'success');
    } catch (e) {
      this.showToast(e.message, 'warning');
    }
  }

  // Reflex Trainer attempts list
  renderTrainerAttempts() {
    if (reflexTrainer.attempts.length === 0) {
      this.trainerAttemptsList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.88rem;">No attempts recorded yet.</div>';
      return;
    }

    this.trainerAttemptsList.innerHTML = reflexTrainer.attempts.slice(0, 5).map(att => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
        <span style="font-weight: 600; font-size: 0.88rem;">${att.statusText}</span>
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: var(--text-muted);">${att.timestamp} (Ping: ${att.simulatedPing}ms)</span>
      </div>
    `).join('');
  }

  // Mojang Status
  async renderStatus() {
    const services = await mcApi.checkServicesStatus();
    this.statusGrid.innerHTML = services.map(s => `
      <div class="control-panel-card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: 700; font-size: 1rem; color: var(--text-bright);">${s.service}</div>
          <span class="status-badge available" style="font-size: 0.7rem;">Operational</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; font-size: 0.85rem; color: var(--text-muted);">
          <span>Response Latency</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: var(--accent-sky); font-weight: 600;">${s.ping} ms</span>
        </div>
      </div>
    `).join('');
  }

  // Toast feedback
  showToast(message, type = 'normal') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'warning' ? 'toast-warning' : ''}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✨';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
