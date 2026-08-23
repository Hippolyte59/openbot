import { config } from "../config.js";
import { CATEGORIES } from "../data/categories.js";
import {
  AUTHOR_URL,
  GITHUB_URL,
  LOGO_SVG,
} from "./logo.js";
import { BASE_CSS } from "./styles.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const FEATURES = CATEGORIES.map(
  (category) => `
    <section class="card">
      <h2>${escapeHtml(category.title)}</h2>
      <p class="muted">${escapeHtml(category.description)}</p>
    </section>`,
).join("\n");

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
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 22px; }
  .grid section.card { margin-bottom: 0; }
  .stats { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 36px; }
  .stat {
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: 10px;
    padding: 10px 20px;
    font-size: .9rem;
    color: var(--text-muted);
  }
  .stat b { display: block; color: var(--text); font-size: 1.15rem; }
  .author { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
  .author img { width: 72px; height: 72px; border-radius: 50%; border: 1px solid var(--border); }
</style>
</head>
<body>

<header class="hero">
  <img class="logo" src="/logo.svg" alt="Logo ${escapeHtml(config.botName)}">
  <h1>${escapeHtml(config.botName)}</h1>
  <p>Bot Discord <strong>open source</strong> : économie, niveaux, aventures au tour par tour,
     animaux de compagnie, salons vocaux personnels et modération complète.
     Libre, auto-hébergeable, sans offre premium.</p>
  <div class="hero-actions">
    <a class="btn primary" href="/wiki">Lire le wiki</a>
    <a class="btn" href="${GITHUB_URL}">Code source sur GitHub</a>
  </div>
</header>

<main>
  <div class="stats">
    <div class="stat"><b>${commandCount}</b> commandes slash</div>
    <div class="stat"><b>v14</b> discord.js · TypeScript</div>
    <div class="stat"><b>SQLite</b> embarquée, zéro config</div>
    <div class="stat"><b>MIT</b> logiciel libre</div>
  </div>

  <h2 style="text-align:center;margin-bottom:28px">Ce que le bot sait faire</h2>
  <div class="grid" style="margin-bottom:36px;">
${FEATURES}
  </div>

  <section class="card" id="auteur">
    <h2>L'auteur</h2>
    <p class="muted">Le projet est développé et maintenu par un passionné.</p>
    <div class="author">
      <img src="${AUTHOR_URL}.png" alt="Avatar GitHub de Hippolyte59">
      <div>
        <strong>Hippolyte59</strong><br>
        <span class="muted">Créateur et mainteneur d'${escapeHtml(config.botName)} — bot communautaire
        pensé comme une alternative libre aux bots de progression fermés.</span><br>
        <a href="${AUTHOR_URL}" style="text-decoration:underline;text-underline-offset:3px">Profil GitHub →</a>
      </div>
    </div>
  </section>

  <section class="card" id="démarrer">
    <h2>Démarrer en 3 étapes</h2>
    <table>
      <tbody>
        <tr><td><code>1</code></td><td>Invite le bot sur ton serveur avec le lien du README</td></tr>
        <tr><td><code>2</code></td><td>Tape <code>/aide</code> dans Discord : tout y est expliqué</td></tr>
        <tr><td><code>3</code></td><td>Explore le <a href="/wiki" style="text-decoration:underline;text-underline-offset:3px">wiki</a> pour la liste complète des commandes</td></tr>
      </tbody>
    </table>
  </section>
</main>

<footer>
  ${escapeHtml(config.botName)} — projet open source sous licence MIT ·
  <a href="${GITHUB_URL}">GitHub</a> · <a href="/wiki">Wiki</a> · <a href="/api/commands">API</a>
</footer>

</body>
</html>`;
}

export { LOGO_SVG };
