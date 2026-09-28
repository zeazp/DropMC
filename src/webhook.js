// Discord Webhook Notification Dispatcher
// Sends rich embeds to custom Discord channels when name drops approach

const WEBHOOK_STORAGE_KEY = 'mcnametracker_discord_webhook';

export class DiscordWebhookService {
  constructor() {
    this.webhookUrl = localStorage.getItem(WEBHOOK_STORAGE_KEY) || '';
    this.enabled = !!this.webhookUrl;
  }

  setWebhookUrl(url) {
    this.webhookUrl = (url || '').trim();
    this.enabled = !!this.webhookUrl;
    if (this.webhookUrl) {
      localStorage.setItem(WEBHOOK_STORAGE_KEY, this.webhookUrl);
    } else {
      localStorage.removeItem(WEBHOOK_STORAGE_KEY);
    }
  }

  getWebhookUrl() {
    return this.webhookUrl;
  }

  async sendEmbed({ title, description, color = 9133310, fields = [], name = 'Target' }) {
    if (!this.webhookUrl) return { success: false, reason: 'No webhook configured' };

    const payload = {
      username: 'MCNameSnipe Alert',
      avatar_url: 'https://minotar.net/helm/Steve/128.png',
      embeds: [
        {
          title: title,
          description: description,
          color: color,
          fields: fields,
          thumbnail: {
            url: `https://crafthead.net/helm/${encodeURIComponent(name)}/128`
          },
          footer: {
            text: 'MCNameSnipe Pro • Live Atomic Precision'
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const res = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 204) {
        return { success: true };
      } else {
        return { success: false, reason: `Discord responded with HTTP ${res.status}` };
      }
    } catch (e) {
      return { success: false, reason: e.message };
    }
  }

  async sendTest() {
    return this.sendEmbed({
      title: '🎯 Discord Webhook Connected Successfully!',
      description: 'MCNameSnipe is now connected to this channel. You will receive live drop alerts, 15m warnings, and availability notifications here.',
      color: 0x8b5cf6,
      fields: [
        { name: 'Status', value: '🟢 Operational & Active', inline: true },
        { name: 'Precision Engine', value: '⚡ Atomic Clock Calibrated', inline: true }
      ],
      name: 'Notch'
    });
  }

  async sendDropAlert(item, urgencyLabel) {
    const isCritical = urgencyLabel.includes('1 Minute') || urgencyLabel.includes('DROPPED');
    const color = isCritical ? 0xf43f5e : 0xf59e0b;

    return this.sendEmbed({
      title: `🚨 ${urgencyLabel}: ${item.name}`,
      description: `Tracked Minecraft name **${item.name}** has entered a critical drop window!`,
      color: color,
      fields: [
        { name: 'Target Name', value: `\`${item.name}\``, inline: true },
        { name: 'Priority', value: `${item.priority.toUpperCase()}`, inline: true },
        { name: 'Category', value: item.category || 'General', inline: true },
        { name: 'Notes', value: item.notes || 'None attached', inline: false },
        { name: 'Action', value: `[Claim on Minecraft.net](https://www.minecraft.net/en-us/msaprofile/mygames/editprofile)`, inline: false }
      ],
      name: item.name
    });
  }
}

export const discordWebhook = new DiscordWebhookService();
