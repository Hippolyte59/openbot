import type { Collection } from "discord.js";
import type { Command } from "../types.js";
import { config } from "../config.js";
import { CATEGORIES } from "../data/categories.js";

const GITHUB_URL = "https://github.com/Hippolyte59/openbot";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripLeadingEmoji(description: string): string {
  return description.replace(/^[^\wÀ-ÿ]+ /u, "");
}

/** Construit la page wiki complète (thème sombre neutre). */
export function renderWiki(commands: Collection<string, Command>): string {
  const sections = CATEGORIES.map((category) => {
    const rows = category.commands
      .map((name) => commands.get(name))
      .filter((cmd): cmd is Command => cmd !== undefined)
      .map(
        (cmd) => `
          <tr>
            <td><code>/${escapeHtml(cmd.data.name)}</code></td>
            <td>${escapeHtml(stripLeadingEmoji(cmd.data.description))}</td>
          </tr>`,
      )
      .join("\n");

    if (!rows) return "";

    return `
      <section class="card" id="${category.id}">
        <h2>${escapeHtml(category.title)}</h2>
        <p class="muted">${escapeHtml(category.description)}</p>
        <table>
          <thead><tr><th>Commande</th><th>Description</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
  }).join("\n");

  const nav = CATEGORIES.filter((c) =>
    c.commands.some((name) => commands.has(name)),
  )
    .map((c) => `<a href="#${c.id}">${escapeHtml(c.title)}</a>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(config.botName)} — Wiki</title>
<style>
  :root {
    --bg: #0b0b0b;
    --surface: #141414;
    --border: #262626;
    --text: #e6e6e6;
    --text-muted: #9a9a9a;
    --accent: #ffffff;
    --code-bg: #1d1d1d;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    line-height: 1.65;
  }
  a { color: inherit; text-decoration: none; }
  header.hero {
    padding: 72px 24px 48px;
    text-align: center;
    border-bottom: 1px solid var(--border);
  }
  header.hero h1 { font-size: clamp(2rem, 5vw, 3.25rem); letter-spacing: -0.02em; }
  header.hero h1 span { color: var(--text-muted); font-weight: 400; }
  header.hero p {
    max-width: 620px;
    margin: 16px auto 28px;
    color: var(--text-muted);
    font-size: 1.05rem;
  }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn {
    display: inline-block;
    padding: 10px 22px;
    border-radius: 8px;
    border: 1px solid var(--border);
    font-weight: 600;
    transition: border-color .15s ease, background .15s ease;
  }
  .btn:hover { background: var(--surface); border-color: #3d3d3d; }
  .btn.primary { background: var(--accent); color: #0b0b0b; border-color: var(--accent); }
  .btn.primary:hover { opacity: .88; }
  nav.toc {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 18px;
    justify-content: center;
    padding: 14px 24px;
    background: rgba(11, 11, 11, .92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
    font-size: .9rem;
  }
  nav.toc a { color: var(--text-muted); transition: color .15s ease; }
  nav.toc a:hover { color: var(--accent); }
  main { max-width: 900px; margin: 0 auto; padding: 40px 24px 80px; }
  section.card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 32px;
    margin-bottom: 28px;
  }
  h2 { font-size: 1.35rem; letter-spacing: -0.01em; margin-bottom: 6px; }
  p.muted { color: var(--text-muted); margin-bottom: 18px; }
  table { width: 100%; border-collapse: collapse; font-size: .95rem; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
  thead th { color: var(--text-muted); font-size: .78rem; text-transform: uppercase; letter-spacing: .08em; }
  tbody tr:last-child td { border-bottom: none; }
  code {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 2px 8px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: .86em;
    white-space: nowrap;
  }
  footer {
    text-align: center;
    padding: 36px 24px;
    color: var(--text-muted);
    font-size: .9rem;
    border-top: 1px solid var(--border);
  }
  footer a { text-decoration: underline; text-underline-offset: 3px; }
  @media (max-width: 560px) {
    section.card { padding: 22px; }
    th, td { padding: 8px 6px; }
  }
</style>
</head>
<body>

<header class="hero">
  <h1>${escapeHtml(config.botName)} <span>/ wiki</span></h1>
  <p>Bot Discord open source : économie, niveaux, boutique, aventures au tour par tour,
     animaux de compagnie, salons vocaux personnels et modération complète.</p>
  <div class="hero-actions">
    <a class="btn primary" href="${GITHUB_URL}">Code source sur GitHub</a>
    <a class="btn" href="/api/commands">API JSON des commandes</a>
  </div>
</header>

<nav class="toc">${nav}</nav>

<main>
  ${sections}
</main>

<footer>
  ${escapeHtml(config.botName)} — logiciel libre sous licence MIT ·
  Documentation régénérée automatiquement à chaque démarrage du bot.
</footer>

</body>
</html>`;
}
