import { config } from "../config.js";
import { CATEGORIES } from "../data/categories.js";
import { AUTHOR_URL, GITHUB_URL, LOGO_SVG } from "./logo.js";
import { BASE_CSS } from "./styles.js";

function escapeHtml(v: string): string { return v.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }
function stripEmojiHome(v: string): string { return v.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Emoji}\uFE0F]/gu, "").replace(/\s{2,}/g," ").trim(); }

const FEATURES = CATEGORIES.map(c => `
  <section class="card" style="position:relative; overflow:hidden;">
    <div style="position:absolute; top:0; left:0; right:0; height:1px; background: linear-gradient(90deg, transparent, var(--border-soft), transparent);"></div>
    <div style="width:36px;height:36px;border-radius:10px;background:var(--code-bg);border:1px solid var(--border);display:grid;place-items:center;margin-bottom:14px;font-size:.7rem;letter-spacing:.08em;color:var(--text-faint);font-weight:700;">${escapeHtml(c.id.slice(0,2).toUpperCase())}</div>
    <h2 style="font-size:1.08rem;margin-bottom:6px;">${escapeHtml(stripEmojiHome(c.title))}</h2>
    <p class="muted" style="min-height:42px;font-size:.92rem;margin-bottom:14px;">${escapeHtml(stripEmojiHome(c.description))}</p>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">${c.commands.slice(0,3).map(n=>`<span style="background:var(--code-bg);border:1px solid var(--border);border-radius:999px;padding:4px 10px;font-family:ui-monospace,monospace;font-size:.78rem;color:var(--text-muted);">/${n}</span>`).join("")} ${c.commands.length>3?`<span style="font-size:.78rem;color:var(--text-faint);align-self:center;">+${c.commands.length-3}</span>`:""}</div>
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
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(268px,1fr));gap:18px;}
  .grid section.card{margin-bottom:0;}
  .grid section.card:hover{transform:translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,.24), 0 1px 0 rgba(255,255,255,.03) inset;}
  .stats{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:8px 0 36px;}
  .stat{background:linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%);border:1px solid var(--border);border-radius:14px;padding:16px 18px;min-width:148px;text-align:center;box-shadow: 0 1px 0 rgba(255,255,255,.02) inset;}
  .stat b{display:block;color:var(--text);font-size:1.5rem;letter-spacing:-.03em;line-height:1;margin-bottom:4px;font-weight:800;}
  .stat span{font-size:.74rem;letter-spacing:.06em;text-transform:uppercase;color:var(--text-faint);font-weight:600;}
  .highlight{position:relative;overflow:hidden;background:linear-gradient(180deg, #111114 0%, #0f0f12 100%);border:1px solid var(--border);border-radius:var(--radius);padding:28px;margin:28px 0 36px;box-shadow: 0 12px 40px rgba(0,0,0,.2);}
  .highlight::before{content:"";position:absolute;inset:0;background:radial-gradient(600px 200px at 20% 0%, rgba(88,101,242,.08), transparent 60%);pointer-events:none;}
  .highlight > *{position:relative;}
  .compare{width:100%;font-size:.92rem;}
  .compare th{color:var(--text-faint);font-weight:700;text-transform:uppercase;font-size:.7rem;letter-spacing:.09em;}
  .compare td{padding:13px 12px;}
  .badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:.74rem;font-weight:700;letter-spacing:.02em;}
  .badge.yes{background:rgba(87,242,135,.1);color:var(--success);border:1px solid rgba(87,242,135,.2);}
  .badge.yes::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--success);box-shadow:0 0 8px rgba(87,242,135,.6);}
  .badge.no{background:rgba(237,66,69,.08);color:#ff6b6e;border:1px solid rgba(237,66,69,.18);}
  .badge.no::before{content:"";width:6px;height:6px;border-radius:50%;background:#ff6b6e;opacity:.7;}
  .author{display:flex;align-items:center;gap:18px;flex-wrap:wrap;}
  .author img{width:64px;height:64px;border-radius:14px;border:1px solid var(--border);object-fit:cover;}
  .kicker{ display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,.06); border:1px solid var(--border); border-radius:999px; padding:6px 12px; font-size:.76rem; letter-spacing:.06em; text-transform:uppercase; color:var(--text-muted); font-weight:600; margin-bottom:18px;}
  .kicker::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--success);box-shadow:0 0 10px rgba(87,242,135,.5);}
</style>
</head>
<body>
<header class="hero">
  <img class="logo" src="/logo.svg" alt="Logo ${escapeHtml(config.botName)}" style="width:92px;height:92px;margin-bottom:20px;">
  <div class="kicker">Open source · Auto-hébergé · MIT</div>
  <h1>${escapeHtml(config.botName)} <span>open source</span></h1>
  <p>Le bot Discord <strong style="color:var(--text);">qui vous appartient</strong> : economie, niveaux, aventures, animaux, salons vocaux et moderation — <em style="color:var(--text-muted);font-style:normal;border-bottom:1px dashed var(--border-soft);">zero premium, zero cloud</em>, 100% vos donnees.</p>
  <div class="hero-actions">
    <a class="btn primary" href="/wiki">Explorer le wiki</a>
    <a class="btn" href="${GITHUB_URL}">GitHub</a>
  </div>
  <p style="margin-top:18px;font-size:.82rem;color:var(--text-faint);letter-spacing:.02em;">Clone <code>npm install</code> <span style="opacity:.4;">·</span> <code>npm start</code> — en 2 minutes</p>
</header>

<main>
  <div class="stats">
    <div class="stat"><b>${commandCount}</b><span>commandes slash</span></div>
    <div class="stat"><b>14</b><span>discord.js v14</span></div>
    <div class="stat"><b>Local</b><span>SQLite instantanee</span></div>
    <div class="stat"><b>MIT</b><span>libre pour toujours</span></div>
  </div>

  <div class="highlight">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
      <div style="width:28px;height:28px;border-radius:8px;background:rgba(88,101,242,.15);border:1px solid rgba(88,101,242,.2);display:grid;place-items:center;color:var(--accent);font-weight:800;font-size:.8rem;">?</div>
      <h3 style="font-size:1.05rem;letter-spacing:-.02em;">Pourquoi OpenBot ?</h3>
      <span style="margin-left:auto;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--text-faint);font-weight:600;">Comparatif</span>
    </div>
    <table class="compare">
      <thead><tr><th></th><th>OpenBot</th><th>Bots heberges</th></tr></thead>
      <tbody>
        <tr><td style="color:var(--text-muted);">Code source</td><td><span class="badge yes">Ouvert MIT</span></td><td><span class="badge no">Ferme</span></td></tr>
        <tr><td style="color:var(--text-muted);">Hebergement</td><td><span class="badge yes">Ta machine</span></td><td><span class="badge no">Leur cloud</span></td></tr>
        <tr><td style="color:var(--text-muted);">Donnees</td><td><span class="badge yes">100% chez toi</span></td><td><span class="badge no">Chez eux</span></td></tr>
        <tr><td style="color:var(--text-muted);">Premium</td><td><span class="badge yes">Aucun</span></td><td><span class="badge no">Paywall</span></td></tr>
      </tbody>
    </table>
  </div>

  <h2 style="text-align:center;margin:8px 0 22px;font-size:1.45rem;letter-spacing:-.03em;">Ce que le bot sait faire</h2>
  <div class="grid" style="margin-bottom:36px;">
${FEATURES}
  </div>

  <section class="card">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <div style="width:32px;height:32px;border-radius:10px;background:var(--code-bg);border:1px solid var(--border);display:grid;place-items:center;font-family:ui-monospace,monospace;font-size:.75rem;color:var(--text-faint);">$</div>
      <h2 style="margin:0;">Demarrage eclair</h2>
      <span style="margin-left:auto;background:rgba(87,242,135,.1);color:var(--success);border:1px solid rgba(87,242,135,.15);padding:4px 10px;border-radius:999px;font-size:.72rem;font-weight:700;letter-spacing:.05em;">3 COMMANDES</span>
    </div>
    <p class="muted" style="margin-bottom:14px;">En 3 commandes, ton bot est en ligne.</p>
    <div style="background:#0c0c0e;border:1px solid var(--border);border-radius:12px;padding:16px;font-family:ui-monospace,monospace;font-size:.88rem;overflow-x:auto;box-shadow: inset 0 1px 0 rgba(255,255,255,.03);">
      <div style="display:flex;gap:10px;"><span style="color:var(--text-faint);user-select:none;">$</span><span>git clone https://github.com/Hippolyte59/openbot.git</span></div>
      <div style="display:flex;gap:10px;color:var(--text-muted);"><span style="color:var(--text-faint);"> $</span><span>cp .env.example .env <span style="color:var(--text-faint);"># ajoute ton token</span></span></div>
      <div style="display:flex;gap:10px;"><span style="color:var(--text-faint);"> $</span><span>npm install && npm run deploy && npm start</span></div>
    </div>
    <p style="margin-top:14px;font-size:.88rem;color:var(--text-muted);">Puis <code>/aide</code> dans Discord — tout est explique.</p>
  </section>

  <section class="card" id="auteur">
    <h2 style="margin-bottom:16px;">L'auteur</h2>
    <div class="author">
      <img src="${AUTHOR_URL}.png" alt="Hippolyte59">
      <div>
        <strong style="font-size:1rem;">Hippolyte59</strong> <span style="color:var(--text-faint);font-size:.85rem;">— Createur d'${escapeHtml(config.botName)}</span><br>
        <span class="muted" style="font-size:.92rem;">Bot communautaire pense comme alternative libre aux bots fermes. Contributions bienvenues !</span><br>
        <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;">
          <a href="${AUTHOR_URL}" class="btn" style="padding:7px 14px;font-size:.85rem;">Profil GitHub</a>
          <a href="${GITHUB_URL}" class="btn" style="padding:7px 14px;font-size:.85rem;">Code source</a>
        </div>
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
