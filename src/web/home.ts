import { config } from "../config.js";
import { CATEGORIES } from "../data/categories.js";
import { AUTHOR_URL, GITHUB_URL, LOGO_SVG } from "./logo.js";
import { BASE_CSS } from "./styles.js";

function escapeHtml(v: string): string { return v.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }
function stripEmojiHome(v: string): string { return v.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").replace(/\s{2,}/g," ").trim(); }

const FEATURES = CATEGORIES.map(c => `
  <section class="card" style="position:relative; overflow:hidden;">
    <div style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, #5865F2, #57F287);"></div>
    <h2 style="display:flex; align-items:center; gap:10px;">${escapeHtml(stripEmojiHome(c.title))}</h2>
    <p class="muted" style="min-height:44px;">${escapeHtml(stripEmojiHome(c.description))}</p>
    <div style="margin-top:12px; font-size:.85rem; color:var(--text-muted);">${c.commands.slice(0,3).map(n=>`<code>/${n}</code>`).join(" ")} ${c.commands.length>3?`+${c.commands.length-3}`:""}</div>
  </section>`).join("\n");

export function renderHome(commandCount: number): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(config.botName)} — Bot Discord open source</title>
<link rel="icon" type="image/svg+xml" href="/logo.svg">
<style>${BASE_CSS}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;}
  .grid section.card{margin-bottom:0;}
  .stats{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:36px;}
  .stat{border:1px solid var(--border);background:var(--surface);border-radius:12px;padding:14px 22px;font-size:.9rem;color:var(--text-muted);text-align:center;min-width:140px;}
  .stat b{display:block;color:var(--text);font-size:1.4rem;margin-bottom:2px;}
  .stat span{font-size:.8rem;}
  .author{display:flex;align-items:center;gap:18px;flex-wrap:wrap;}
  .author img{width:72px;height:72px;border-radius:50%;border:1px solid var(--border);}
  .highlight{background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);border:1px solid #2a2a4a;border-radius:14px;padding:28px;margin:32px 0;}
  .highlight h3{color:#fff;margin-bottom:8px;}
  .compare{width:100%;font-size:.9rem;}
  .compare th{color:var(--text-muted);font-weight:600;text-transform:uppercase;font-size:.75rem;letter-spacing:.06em;}
  .compare td{padding:12px;}
  .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:.75rem;font-weight:600;}
  .badge.yes{background:#1a3a2a;color:#57F287;border:1px solid #2a5a3a;}
  .badge.no{background:#2a1a1a;color:#ed4245;border:1px solid #5a2a2a;}
</style>
</head>
<body>
<header class="hero">
  <img class="logo" src="/logo.svg" alt="Logo ${escapeHtml(config.botName)}" style="width:96px;height:96px;margin-bottom:20px;filter:drop-shadow(0 4px 12px rgba(88,101,242,.3));">
  <h1 style="font-size:clamp(2.2rem, 6vw, 3.5rem);">${escapeHtml(config.botName)} <span style="font-weight:300;color:var(--text-muted);">open source</span></h1>
  <p style="max-width:640px;margin:18px auto 28px;font-size:1.1rem;">Le bot Discord <strong>qui vous appartient</strong> : économie, niveaux, aventures, animaux, salons vocaux et modération — <em>zéro premium, zéro cloud, 100% vos données</em>.</p>
  <div class="hero-actions">
    <a class="btn primary" href="/wiki" style="padding:12px 28px;font-size:1rem;">Explorer le wiki →</a>
    <a class="btn" href="${GITHUB_URL}" style="padding:12px 28px;">GitHub ★</a>
  </div>
  <p style="margin-top:16px;font-size:.85rem;color:var(--text-muted);">Clone → <code>npm install</code> → <code>npm start</code> — en 2 minutes</p>
</header>

<main>
  <div class="stats">
    <div class="stat"><b>${commandCount}</b><span>commandes slash</span></div>
    <div class="stat"><b>14</b><span>discord.js v14</span></div>
    <div class="stat"><b>Instantanée</b><span>SQLite locale</span></div>
    <div class="stat"><b>MIT</b><span>libre pour toujours</span></div>
  </div>

  <div class="highlight">
    <h3>Pourquoi OpenBot ?</h3>
    <table class="compare">
      <thead><tr><th></th><th>OpenBot</th><th>Bots hébergés</th></tr></thead>
      <tbody>
        <tr><td>Code source</td><td><span class="badge yes">Ouvert MIT</span></td><td><span class="badge no">Fermé</span></td></tr>
        <tr><td>Hébergement</td><td><span class="badge yes">Ta machine</span></td><td><span class="badge no">Leur cloud</span></td></tr>
        <tr><td>Données</td><td><span class="badge yes">100% chez toi</span></td><td><span class="badge no">Chez eux</span></td></tr>
        <tr><td>Premium</td><td><span class="badge yes">Aucun</span></td><td><span class="badge no">Paywall</span></td></tr>
      </tbody>
    </table>
  </div>

  <h2 style="text-align:center;margin:36px 0 28px;font-size:1.6rem;">Ce que le bot sait faire</h2>
  <div class="grid" style="margin-bottom:40px;">
${FEATURES}
  </div>

  <section class="card">
    <h2>Démarrage éclair</h2>
    <p class="muted">En 3 commandes, ton bot est en ligne.</p>
    <div style="background:#0f0f0f;border:1px solid var(--border);border-radius:10px;padding:16px;font-family:ui-monospace,monospace;font-size:.9rem;overflow-x:auto;">
      <div><span style="color:#9a9a9a;">$</span> git clone https://github.com/Hippolyte59/openbot.git</div>
      <div><span style="color:#9a9a9a;">$</span> cp .env.example .env <span style="color:#6a6a6a;"># ajoute ton token</span></div>
      <div><span style="color:#9a9a9a;">$</span> npm install && npm run deploy && npm start</div>
    </div>
    <p style="margin-top:12px;font-size:.9rem;">Puis <code>/aide</code> dans Discord — tout est expliqué.</p>
  </section>

  <section class="card" id="auteur">
    <h2>L'auteur</h2>
    <div class="author">
      <img src="${AUTHOR_URL}.png" alt="Hippolyte59">
      <div>
        <strong>Hippolyte59</strong> — Créateur d'${escapeHtml(config.botName)}<br>
        <span class="muted">Bot communautaire pensé comme alternative libre aux bots fermés. Contributions bienvenues !</span><br>
        <a href="${AUTHOR_URL}" style="text-decoration:underline;">Profil GitHub →</a> · <a href="${GITHUB_URL}" style="text-decoration:underline;">Code source</a>
      </div>
    </div>
  </section>
</main>

<footer>
  ${escapeHtml(config.botName)} — MIT · <a href="${GITHUB_URL}">GitHub</a> · <a href="/wiki">Wiki</a> · <a href="/api/commands">API</a> · <a href="/admin">Admin</a>
</footer>
</body>
</html>`;
}
export { LOGO_SVG };
