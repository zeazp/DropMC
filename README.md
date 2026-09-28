# MCNameSnipe Pro 🎯✨

A cozy, modern, and minimal real-time Minecraft name tracking, NameMC statistics, sniper countdown, and OG name discovery application.

![Aesthetic](https://img.shields.io/badge/Theme-Comfy%20Midnight-8b5cf6?style=flat-square)
![Precision](https://img.shields.io/badge/Clock-Atomic%20NTP%20Calibrated-38bdf8?style=flat-square)
![Status](https://img.shields.io/badge/Status-Operational-10b981?style=flat-square)

---

## ⚡ What Makes MCNameSnipe Unique (Key Selling Points)

1. ⏱️ **Atomic Server Clock Calibration (`src/timeSync.js`)**:
   - Eliminates client PC clock drift by measuring round-trip time against atomic NTP & Cloudflare time headers.
   - Computes live millisecond clock skew (`±ms`) so snipes are synchronized with Mojang drop servers down to the exact millisecond.

2. 💎 **OG Rarity & Market Value Appraisal Engine (`src/appraisal.js`)**:
   - Instant heuristic rating (0–100) on name length (1-char, 2-char, 3-char), clean dictionary status, pronounceability, and absence of numbers/underscores.
   - Badges: **Tier S+ (Holy Grail OG)**, **Tier S (Tier 1 Clean OG)**, **Tier A (Rare Semi-OG)**, **Tier B**, and **Tier C**.

3. 🎮 **Sub-Millisecond Snipe Reflex & Latency Simulator (`src/reflexTrainer.js`)**:
   - Practice timing your manual claim clicks against dropping targets down to the millisecond.
   - Adjust simulated network latency (ping slider) to train ping-compensation reflexes!

4. 🤖 **Discord Webhook Drop Alerts (`src/webhook.js`)**:
   - Send rich Discord embed notifications to your custom server channels when a tracked name enters the **15-minute** or **1-minute** drop window.

5. 🌍 **Default User Local Timezone**:
   - All clocks, drop timetables, and date pickers default to your local timezone (e.g. `11:15 PM PDT`) with secondary UTC badges.

6. 🎨 **Interactive 3D Three.js Skin & Cape Studio (`src/skin3d.js`)**:
   - 360° mouse drag rotation, zoom, auto-spin toggle, animated cape flutter, and layer depth.

7. 📊 **Real NameMC Stats & Active 37-Day Drop Detection (`src/api.js`)**:
   - Displays real NameMC profile links, search popularity rank, owned event/Mojang capes, days held per historical username, and automatic detection of dropping old names.

---

## 🚀 Running Locally

```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

---

## 🌐 Deploying to the Web (Putting it Online)

MCNameSnipe builds into a standalone, lightning-fast static web app in the `dist/` directory. You can host it for free on any modern web platform:

### 1. Deploy to Vercel (Recommended — Free & Easiest)
1. Install the Vercel CLI (or connect your GitHub repository directly at [vercel.com](https://vercel.com)):
   ```bash
   npx vercel
   ```
2. Follow the prompts. Vercel will automatically read `vercel.json` and deploy your site in ~30 seconds with custom domains, SSL, and global edge caching!

---

### 2. Deploy to Netlify (Free Drag & Drop or Git)
* **Via Git**: Connect your repository on [netlify.com](https://netlify.com). Build command is `npm run build` and publish directory is `dist` (automatically configured in `netlify.toml`).
* **Via Drag & Drop**:
  1. Run `npm run build` in your project terminal.
  2. Drag and drop the generated `dist` folder into [app.netlify.com/drop](https://app.netlify.com/drop).

---

### 3. Deploy to GitHub Pages (Free with Automated GitHub Action)
1. Push this repository to GitHub (`main` or `master` branch).
2. In your GitHub repository, go to **Settings** → **Pages** → **Build and deployment**.
3. Under **Source**, select **GitHub Actions**.
4. The included [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml) workflow will automatically build and publish your site at `https://<your-username>.github.io/<repo-name>/`.

---

### 4. Deploy to Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages**.
2. Connect your Git repository.
3. Set **Framework preset** to `Vite`, **Build command** to `npm run build`, and **Output directory** to `dist`.
4. Click **Save and Deploy**.

---

### 5. Traditional Web Server / Nginx / Apache / Shared Hosting (cPanel)
1. Run the build command:
   ```bash
   npm run build
   ```
2. Upload the contents of the `dist/` folder to your web server's public document root (e.g. `/var/www/html/` or `public_html/`).

