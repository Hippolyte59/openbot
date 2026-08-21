import type { Collection } from "discord.js";
import type { Command } from "../types.js";
import { config } from "../config.js";
import { CATEGORIES } from "../data/categories.js";
import { GITHUB_URL } from "./logo.js";
import { BASE_CSS, COPY_JS } from "./styles.js";

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
<link rel="icon" type="image/svg+xml" href="/logo.svg">
<style>${BASE_CSS}
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
</style>
</head>
<body>

<header class="hero">
  <img class="logo" src="/logo.svg" alt="Logo ${escapeHtml(config.botName)}">
  <h1>${escapeHtml(config.botName)} <span>/ wiki</span></h1>
  <p>Toute la documentation du bot : commandes classées par catégorie,
     salons vocaux personnels, guide d'installation et personnalisation.
     Clique sur une commande pour la copier.</p>
  <div class="hero-actions">
    <a class="btn primary" href="/">Retour à l'accueil</a>
    <a class="btn" href="${GITHUB_URL}">GitHub</a>
    <a class="btn" href="/api/commands">API JSON</a>
  </div>
</header>

<nav class="toc">${nav}</nav>

<main>
  <section class="card" id="vocaux">
    <h2>Salons vocaux personnels</h2>
    <p class="muted">Ton propre vocal, créé en un saut depuis le hub.</p>
    <p>
      Le staff place un salon <em>« rejoindre pour créer »</em> avec
      <code>/vocal hub creer</code>. Dès qu'un membre y entre, un salon vocal
      personnel est créé et il y est déplacé automatiquement : le panneau de
      contrôle apparaît dans le chat du salon.
    </p>
    <table>
      <thead><tr><th>Bouton du panneau</th><th>Effet</th></tr></thead>
      <tbody>
        <tr><td><code>Verrouiller / Déverrouiller</code></td><td>Autorise ou interdit l'accès au salon</td></tr>
        <tr><td><code>Cacher / Afficher</code></td><td>Rend le salon invisible aux autres membres</td></tr>
        <tr><td><code>Places</code></td><td>Fixe la capacité maximale (0 = illimité)</td></tr>
        <tr><td><code>Renommer</code></td><td>Change le nom du salon</td></tr>
        <tr><td><code>Fermer</code></td><td>Supprime immédiatement le salon</td></tr>
      </tbody>
    </table>
    <p class="muted" style="margin-top:14px">
      Réservé au propriétaire. Si le propriétaire part, la propriété passe au membre suivant ;
      un salon vide est supprimé automatiquement.
    </p>
  </section>
  ${sections}
</main>

<footer>
  ${escapeHtml(config.botName)} — logiciel libre sous licence MIT ·
  Documentation régénérée automatiquement à chaque démarrage du bot ·
  <a href="/">Accueil</a>
</footer>

<script>${COPY_JS}</script>
</body>
</html>`;
}
