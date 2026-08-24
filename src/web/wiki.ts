import type { Collection } from "discord.js";
import type { Command } from "../types.js";
import { config } from "../config.js";
import { CATEGORIES } from "../data/categories.js";
import { GITHUB_URL } from "./logo.js";
import { BASE_CSS, COPY_JS } from "./styles.js";

function escapeHtml(v: string): string { return v.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }
function stripEmoji(d: string): string { return d.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Emoji}\uFE0F]/gu, "").replace(/\s{2,}/g," ").trim(); }

export function renderWiki(commands: Collection<string, Command> | Map<string, any>): string {
  const sections = CATEGORIES.map(cat => {
    const rows = cat.commands.map(n => (commands as any).get(n)).filter(Boolean).map((cmd: any) => `
      <tr data-command="${escapeHtml(cmd.data.name)}" data-desc="${escapeHtml(stripEmoji(cmd.data.description).toLowerCase())}">
        <td><code>/${escapeHtml(cmd.data.name)}</code></td>
        <td>${escapeHtml(stripEmoji(cmd.data.description))}</td>
        <td><button class="btn" style="padding:4px 10px;font-size:.8rem;" onclick="copyCmd('/${escapeHtml(cmd.data.name)}')">Copier</button></td>
      </tr>`).join("\n");
    if (!rows) return "";
    return `
      <section class="card" id="${cat.id}">
        <h2>${escapeHtml(stripEmoji(cat.title))}</h2>
        <p class="muted">${escapeHtml(stripEmoji(cat.description))} — ${cat.commands.length} commande(s)</p>
        <table><thead><tr><th>Commande</th><th>Description</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      </section>`;
  }).join("\n");

  const nav = CATEGORIES.filter(c => c.commands.some(n => (commands as any).has(n))).map(c => `<a href="#${c.id}">${escapeHtml(stripEmoji(c.title))}</a>`).join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(config.botName)} — Wiki</title>
<link rel="icon" href="/logo.svg">
<style>${BASE_CSS}
  nav.toc{position:sticky;top:0;z-index:10;display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;padding:16px 24px;background:rgba(11,11,11,.96);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);font-size:.88rem;}
  nav.toc a{color:var(--text-muted);padding:6px 10px;border-radius:20px;border:1px solid transparent;transition:all .15s;}
  nav.toc a:hover{color:var(--text);border-color:var(--border);background:var(--surface);}
  .search-wrap{max-width:600px;margin:24px auto 0;padding:0 24px;}
  .search-wrap input{width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:12px 16px;font-size:1rem;}
  .search-wrap input::placeholder{color:var(--text-muted);}
  .search-info{text-align:center;color:var(--text-muted);font-size:.9rem;margin:12px 0 0;}
</style>
</head>
<body>
<header class="hero" style="padding:48px 24px 32px;">
  <h1>${escapeHtml(config.botName)} <span>/ wiki</span></h1>
  <p>Toute la doc : <b>${(commands as any).size ?? 0} commandes</b> classées par catégorie. Clique <code>Copier</code> ou tape le nom pour filtrer.</p>
  <div class="hero-actions"><a class="btn primary" href="/">Accueil</a><a class="btn" href="${GITHUB_URL}">GitHub</a><a class="btn" href="/api/commands">API</a></div>
</header>
<nav class="toc">${nav}</nav>
<div class="search-wrap">
  <input id="search" type="search" placeholder="Rechercher une commande…  ex: /profil, /aventure, vocal" autofocus>
  <div class="search-info" id="searchInfo"></div>
</div>
<main>
  <section class="card" id="vocaux" style="margin-top:24px;">
    <h2>Salons vocaux personnels</h2>
    <p class="muted">Ton vocal perso en un clic depuis le hub.</p>
    <p><code>/vocal hub creer</code> → un membre rejoint le hub → salon perso créé + panneau de contrôle.</p>
    <table><thead><tr><th>Bouton</th><th>Effet</th></tr></thead><tbody>
      <tr><td><code>Verrouiller</code></td><td>Bloque l'accès</td></tr>
      <tr><td><code>Cacher</code></td><td>Invisible</td></tr>
      <tr><td><code>Places</code></td><td>Capacité (0 = ∞)</td></tr>
      <tr><td><code>Renommer</code></td><td>Nouveau nom</td></tr>
      <tr><td><code>Fermer</code></td><td>Supprime</td></tr>
    </tbody></table>
  </section>

  <section class="card" id="anniversaires-detail">
    <h2>Chaque anniversaire est unique</h2>
    <p class="muted">Message d'annonce personnalisé pour chaque membre ou rôle — le bot n'envoie jamais deux fois le même message.</p>
    <p><code>/anniv set &lt;mois&gt; &lt;jour&gt;</code> enregistre ta date. <code>/anniv serveur</code> configure le salon, le rôle et le modèle.</p>
    <table><thead><tr><th>Placeholder</th><th>Remplacé par</th></tr></thead><tbody>
      <tr><td><code>{pseudo}</code></td><td>Pseudo du membre</td></tr>
      <tr><td><code>{mention}</code></td><td>Mention &lt;@id&gt;</td></tr>
      <tr><td><code>{age}</code></td><td>Ancienneté approximative</td></tr>
      <tr><td><code>{date}</code></td><td>Date jj/mm</td></tr>
      <tr><td><code>{server_name}</code></td><td>Nom du serveur</td></tr>
    </tbody></table>
    <p style="margin-top:10px;font-size:.9rem;">Panel <a href="/admin">Admin → Anniversaires</a> : salon d'annonce, rôle offert le jour J, message custom. Commandes : <code>/anniv list</code> <code>/anniv remove</code>.</p>
  </section>

  <section class="card" id="logs-detail">
    <h2>Logs customisés</h2>
    <p class="muted">Photo de profil et couleur personnalisée pour chaque type de log — lisible en un coup d'œil.</p>
    <table><thead><tr><th>Type</th><th>Couleur par défaut</th><th>Usage</th></tr></thead><tbody>
      <tr><td>YouTube</td><td><code>#FF0000</code></td><td>Nouvelle vidéo / notif</td></tr>
      <tr><td>Twitch</td><td><code>#9146FF</code></td><td>Live en cours</td></tr>
      <tr><td>Reddit</td><td><code>#FF4500</code></td><td>Nouveau post</td></tr>
      <tr><td>Dealabs</td><td><code>#FFAA00</code></td><td>Bon plan</td></tr>
    </tbody></table>
    <p style="margin-top:10px;">Panel <a href="/admin">Admin → Logs</a> : couleur, salon cible et avatar par service. Plusieurs canaux possibles (un par service). Commande : <code>/log &lt;service&gt; &lt;titre&gt; &lt;description&gt;</code>.</p>
    <p class="muted" style="font-size:.9rem;">Astuce "Soyez de bons fans" : active les notifs sociales YouTube / Twitch / Reddit / Dealabs et centralise-les via les logs customisés — chaque service a son salon, sa couleur et sa photo.</p>
  </section>

  <section class="card" id="objectifs-detail">
    <h2>Objectifs communauté</h2>
    <p class="muted">Donne un objectif : niveau maximum + rôle spécial et salon privilégié.</p>
    <p><code>Admin → Objectifs</code> : définis <code>maxLevel</code>, le rôle débloqué et le salon privé annoncé à l'atteinte du niveau max.</p>
  </section>

  <section class="card" id="messages-detail">
    <h2>Messages</h2>
    <p class="muted">Messages sauvegardés et profils de messages — pseudo et avatar personnalisé par envoi.</p>
    <table><thead><tr><th>Commande</th><th>Effet</th></tr></thead><tbody>
      <tr><td><code>/message sauvegarder &lt;nom&gt; &lt;contenu&gt;</code></td><td>Stocke un snippet par serveur (<code>data/saved_messages.json</code>)</td></tr>
      <tr><td><code>/message afficher &lt;nom&gt;</code></td><td>Affiche le contenu sauvegardé</td></tr>
      <tr><td><code>/message liste</code></td><td>Liste tous les messages du serveur</td></tr>
      <tr><td><code>/message supprimer &lt;nom&gt;</code></td><td>Supprime l'entrée</td></tr>
      <tr><td><code>/dire &lt;message&gt; [pseudo] [avatar]</code></td><td>Envoie via webhook avec pseudo et avatar custom — nécessite permission Gérer les webhooks</td></tr>
    </tbody></table>
    <p style="margin-top:10px;font-size:.9rem;">Autocomplete sur <code>nom</code> pour retrouver rapidement un message. Parfait pour regles, templates et lore.</p>
  </section>

  <section class="card" id="interactions-detail">
    <h2>Interactions</h2>
    <p class="muted">Boutons et sélecteur — demos et interactions avancées : rôles, tickets, suggestions, boutique et articles.</p>
    <table><thead><tr><th>Commande / Fonction</th><th>Details</th></tr></thead><tbody>
      <tr><td><code>/demo boutons</code></td><td>3 boutons : Valider / Annuler / Info</td></tr>
      <tr><td><code>/demo select</code></td><td>Menu select : Roles / Tickets / Boutique</td></tr>
      <tr><td><code>/autorole</code> <code>/reactionrole</code> <code>/wordreact</code> <code>/custom</code></td><td>Rôles auto à l'arrivée, rôles à réaction, réactions sur mots, commandes custom <code>!nom</code> — aussi dans <code>Admin → Auto</code></td></tr>
      <tr><td><code>/ticket creer &lt;sujet&gt;</code> <code>/ticket fermer</code> <code>/ticket panel</code></td><td>Salon privé par ticket, stockage <code>data/tickets.json</code></td></tr>
      <tr><td><code>/suggestion proposer &lt;texte&gt;</code> <code>/suggestion liste</code></td><td>Suggestions avec boutons Pour / Contre, comptage et anti double-vote, <code>data/suggestions.json</code></td></tr>
      <tr><td><code>/boutique</code> <code>/acheter</code> <code>/inventaire</code> <code>/utiliser</code></td><td>Boutique et articles — catalogue <code>src/data/items.ts</code></td></tr>
    </tbody></table>
    <p class="muted" style="margin-top:10px;font-size:.9rem;">Toutes les interactions passent par <code>interactionCreate</code> avec handlers centralisés et garde-fous de permissions.</p>
  </section>

  ${sections}
</main>
<footer>${escapeHtml(config.botName)} — MIT · <a href="/">Accueil</a> · <a href="${GITHUB_URL}">GitHub</a></footer>
<script>${COPY_JS}
  function copyCmd(t){ navigator.clipboard.writeText(t).then(()=>toast('Copié '+t)).catch(()=>{ const a=document.createElement('textarea'); a.value=t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); toast('Copié '+t); }); }
  function toast(m){ const t=document.createElement('div'); t.textContent=m; t.style.cssText='position:fixed;bottom:18px;right:18px;background:#1e1e1e;border:1px solid #333;padding:10px 14px;border-radius:10px;z-index:99;'; document.body.appendChild(t); setTimeout(()=>t.remove(),1400); }
  const search=document.getElementById('search');
  const info=document.getElementById('searchInfo');
  search.addEventListener('input',()=>{
    const q=search.value.trim().toLowerCase();
    let visible=0;
    document.querySelectorAll('tbody tr[data-command]').forEach(tr=>{
      const cmd=tr.getAttribute('data-command')||''; const desc=tr.getAttribute('data-desc')||'';
      const show=!q || cmd.includes(q) || desc.includes(q);
      tr.style.display=show?'':'none';
      if(show) visible++;
    });
    document.querySelectorAll('main section.card').forEach(sec=>{
      const rows=sec.querySelectorAll('tbody tr[data-command]');
      if(!rows.length) return;
      const anyVisible=[...rows].some(r=>r.style.display!=='none');
      sec.style.display=anyVisible?'':'none';
    });
    info.textContent=q ? visible+' résultat(s) pour "'+q+'"' : '';
  });
  // highlight TOC on scroll
  const tocLinks=document.querySelectorAll('nav.toc a');
  const sections2=document.querySelectorAll('main section.card[id]');
  window.addEventListener('scroll',()=>{
    let current='';
    sections2.forEach(s=>{ if(window.scrollY >= (s as HTMLElement).offsetTop - 120) current=s.id; });
    tocLinks.forEach(a=>a.style.color = a.getAttribute('href')==='#'+current ? 'var(--text)' : 'var(--text-muted)');
  });
</script>
</body>
</html>`;
}
