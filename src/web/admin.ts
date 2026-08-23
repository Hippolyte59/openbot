import type { Client } from "discord.js";
import { loadGuilds } from "../database/json-db.js";
import { BASE_CSS } from "./styles.js";
import { config } from "../config.js";

export function renderAdmin(client: Client): string {
  const guilds = [...client.guilds.cache.values()].map(g => ({
    id: g.id, name: g.name, memberCount: g.memberCount, icon: g.iconURL() ?? `https://cdn.discordapp.com/embed/avatars/${Number(g.id) % 5}.png`
  }));
  const stored = loadGuilds();
  const guildOptions = guilds.map(g => `<option value="${g.id}">${escapeHtml(g.name)} (${g.memberCount} membres)</option>`).join("") || `<option value="">Aucun serveur — invite le bot d'abord</option>`;
  const firstGuildId = guilds[0]?.id ?? "";
  const firstCfg = firstGuildId ? (stored.get(firstGuildId) ?? {}) : {};

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(config.botName)} — Panneau d'administration</title>
<link rel="icon" type="image/svg+xml" href="/logo.svg">
<style>${BASE_CSS}
  .admin-layout { display:grid; grid-template-columns: 240px 1fr; min-height:100vh; }
  .sidebar { background: var(--surface); border-right:1px solid var(--border); padding:24px 16px; position:sticky; top:0; height:100vh; }
  .sidebar h2 { font-size:.85rem; letter-spacing:.08em; text-transform:uppercase; color:var(--text-muted); margin:18px 0 8px; }
  .sidebar a { display:block; padding:9px 12px; border-radius:8px; color:var(--text-muted); font-size:.92rem; cursor:pointer; }
  .sidebar a.active, .sidebar a:hover { background:#1e1e1e; color:var(--text); }
  .main { padding:28px 24px; max-width:900px; }
  .preview { background:#1e1e1e; border:1px solid var(--border); border-radius:12px; padding:16px; margin-top:12px; }
  .preview .msg { background:#2b2d31; border-radius:8px; padding:10px 12px; border-left:4px solid #5865F2; }
  .field { margin-bottom:16px; }
  .field label { display:block; font-size:.85rem; color:var(--text-muted); margin-bottom:6px; }
  .field input, .field textarea, .field select { width:100%; background:#0f0f0f; border:1px solid var(--border); color:var(--text); border-radius:8px; padding:10px 12px; font:inherit; }
  .field textarea { min-height:72px; resize:vertical; }
  .row2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .banner-preview { width:100%; height:140px; background:#0f0f0f; border:1px dashed var(--border); border-radius:10px; display:grid; place-items:center; color:var(--text-muted); font-size:.9rem; overflow:hidden; }
  .banner-preview img { width:100%; height:100%; object-fit:cover; }
  .toast { position:fixed; bottom:18px; right:18px; background:#1e1e1e; border:1px solid #2a2a2a; padding:10px 14px; border-radius:10px; display:none; }
  .guild-badge { display:flex; align-items:center; gap:10px; padding:10px; border:1px solid var(--border); border-radius:10px; background:#0f0f0f; margin-bottom:10px; }
  .guild-badge img { width:36px; height:36px; border-radius:50%; }
  @media (max-width:720px){ .admin-layout{grid-template-columns:1fr} .sidebar{height:auto; position:relative} .row2{grid-template-columns:1fr} }
</style>
</head>
<body>
<div class="admin-layout">
  <aside class="sidebar">
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:18px;">
      <img src="/logo.svg" style="width:32px;height:32px">
      <strong>${escapeHtml(config.botName)}</strong>
    </div>
    <div class="guild-badge">
      <img src="${guilds[0]?.icon ?? ""}" onerror="this.style.display='none'">
      <div><div style="font-weight:600">${escapeHtml(guilds[0]?.name ?? "Aucun serveur")}</div><div style="font-size:.8rem;color:var(--text-muted)">${guilds.length} serveur(s) • ${client.users.cache.size} utilisateurs</div></div>
    </div>
    <h2>Configuration</h2>
    <a class="active" data-tab="welcome">Bienvenue</a>
    <a data-tab="goodbye">Au revoir</a>
    <a data-tab="commands">Commandes</a>
    <a data-tab="style">Apparence</a>
    <h2>Liens</h2>
    <a href="/">Accueil</a>
    <a href="/wiki">Wiki</a>
    <a href="/api/commands">API</a>
  </aside>
  <main class="main">
    <h1 style="font-size:1.6rem; margin-bottom:6px;">Panneau d'administration</h1>
    <p class="muted">Configure ton bot sans toucher au code. Les changements sont sauvegardés en <code>data/*.json</code> et pris en compte instantanément.</p>

    <section class="card" style="margin-top:18px;">
      <div class="field">
        <label>Serveur à configurer</label>
        <select id="guildSelect">${guildOptions}</select>
      </div>
      <div id="guildInfo" class="muted" style="font-size:.85rem;"></div>
    </section>

    <!-- WELCOME -->
    <section class="card tab" id="tab-welcome">
      <h2>Message de bienvenue</h2>
      <p class="muted">Envoyé quand un membre rejoint. Placeholders : <code>{pseudo}</code> <code>{mention}</code> <code>{server_name}</code> <code>{channel_name}</code></p>
      <div class="row2">
        <div class="field"><label>Salon #bienvenue (ID)</label><input id="welcomeChannel" placeholder="ex: 1234567890123" value="${escapeHtml(firstCfg.welcomeChannel ?? "")}"></div>
        <div class="field"><label>Bannière (URL image)</label><input id="welcomeBanner" placeholder="https://..." value="${escapeHtml(firstCfg.welcomeBanner ?? "")}"></div>
      </div>
      <div class="field"><label>Message</label><textarea id="welcomeMessage" placeholder="🎉 Bienvenue {pseudo} sur **{server_name}** !\n\nTu es notre {memberCount}ème membre — merci de nous rejoindre ! N'hésite pas à te présenter dans {channel_name}.">${escapeHtml(firstCfg.welcomeMessage ?? "🎉 Bienvenue {pseudo} sur **{server_name}** !\n\nTu es notre {memberCount}ème membre — merci de nous rejoindre ! N'hésite pas à te présenter dans {channel_name}. 🎉")}</textarea></div>
      <div class="banner-preview" id="welcomeBannerPreview"><span>Aperçu bannière</span></div>
      <div class="preview"><div class="msg" id="welcomePreview">Bienvenue @Pseudo sur MonServeur !</div></div>
      <div style="margin-top:12px; display:flex; gap:10px;"><button class="btn primary" onclick="save('welcome')">Enregistrer</button><button class="btn" onclick="preview('welcome')">Prévisualiser</button></div>
    </section>

    <!-- GOODBYE -->
    <section class="card tab" id="tab-goodbye" style="display:none;">
      <h2>Message d'au revoir</h2>
      <p class="muted">Envoyé quand un membre quitte.</p>
      <div class="row2">
        <div class="field"><label>Salon #au-revoir (ID)</label><input id="goodbyeChannel" placeholder="ex: 1234567890123" value="${escapeHtml(firstCfg.goodbyeChannel ?? "")}"></div>
        <div class="field"><label>Bannière (URL)</label><input id="goodbyeBanner" placeholder="https://..." value="${escapeHtml((firstCfg as any).goodbyeBanner ?? "")}"></div>
      </div>
      <div class="field"><label>Message</label><textarea id="goodbyeMessage">${escapeHtml(firstCfg.goodbyeMessage ?? "👋 Au revoir {pseudo}, on espère te revoir bientôt sur **{server_name}** ! 👋")}</textarea></div>
      <div class="preview"><div class="msg" id="goodbyePreview">Au revoir @Pseudo !</div></div>
      <div style="margin-top:12px; display:flex; gap:10px;"><button class="btn primary" onclick="save('goodbye')">Enregistrer</button><button class="btn" onclick="preview('goodbye')">Prévisualiser</button></div>
    </section>

    <!-- COMMANDS -->
    <section class="card tab" id="tab-commands" style="display:none;">
      <h2>Commandes</h2>
      <p class="muted">Active/désactive les catégories. Les changements sont instantanés (pas besoin de redéployer).</p>
      <div id="commandsList" style="display:grid; gap:8px; margin-top:10px;"></div>
      <p class="muted" style="margin-top:10px;">Astuce : la liste complète est sur <a href="/wiki" style="text-decoration:underline">/wiki</a> et <a href="/api/commands" style="text-decoration:underline">/api/commands</a></p>
    </section>

    <!-- STYLE -->
    <section class="card tab" id="tab-style" style="display:none;">
      <h2>Apparence</h2>
      <div class="row2">
        <div class="field"><label>Couleur des embeds (hex)</label><input id="embedColor" value="${escapeHtml(config.embedColor)}" placeholder="#5865F2"></div>
        <div class="field"><label>Nom du bot</label><input id="botName" value="${escapeHtml(config.botName)}"></div>
      </div>
      <p class="muted">Modifie <code>.env</code> puis redémarre : <code>EMBED_COLOR</code> / <code>BOT_NAME</code></p>
    </section>

  </main>
</div>
<div class="toast" id="toast"></div>
<script>
  const guildSelect = document.getElementById('guildSelect');
  const toastEl = document.getElementById('toast');
  function toast(msg){ toastEl.textContent=msg; toastEl.style.display='block'; setTimeout(()=>toastEl.style.display='none',1800); }
  function currentGuildId(){ return guildSelect.value; }
  async function loadGuild(){
    const id=currentGuildId(); if(!id) return;
    const res=await fetch('/admin/api/guilds'); const data=await res.json();
    const cfg = (data.find(([gid])=>gid===id)?.[1]) || {};
    document.getElementById('welcomeChannel').value=cfg.welcomeChannel||'';
    document.getElementById('welcomeMessage').value=cfg.welcomeMessage||'🎉 Bienvenue {pseudo} sur **{server_name}** !\n\nTu es notre {memberCount}ème membre — merci de nous rejoindre ! N'hésite pas à te présenter dans {channel_name}.';
    document.getElementById('welcomeBanner').value=cfg.welcomeBanner||'';
    document.getElementById('goodbyeChannel').value=cfg.goodbyeChannel||'';
    document.getElementById('goodbyeMessage').value=cfg.goodbyeMessage||'👋 Au revoir {pseudo}, on espère te revoir bientôt sur **{server_name}** !';
    document.getElementById('goodbyeBanner').value=cfg.goodbyeBanner||'';
    preview('welcome'); preview('goodbye'); bannerPreview();
  }
  function preview(type){
    const msg=document.getElementById(type+'Message').value;
    const out=document.getElementById(type+'Preview');
    const fake={pseudo:'Hippolyte', mention:'@Hippolyte', server_name:'MonServeur', channel_name:'#bienvenue', memberCount: 42};
    let r=msg; r=r.replace(/{pseudo}/gi,fake.pseudo); r=r.replace(/{@?mention}/g,fake.mention); r=r.replace(/{server_name}/g,fake.server_name); r=r.replace(/{channel_name}/g,fake.channel_name); r=r.replace(/{memberCount}/g,String(fake.memberCount));
    out.textContent=r;
  }
  function bannerPreview(){
    const url=document.getElementById('welcomeBanner').value.trim();
    const el=document.getElementById('welcomeBannerPreview');
    if(url) el.innerHTML='<img src="'+url+'" onerror="this.parentElement.textContent=\\'URL invalide\\'">'; else el.innerHTML='<span>Aperçu bannière</span>';
  }
  async function save(type){
    const id=currentGuildId(); if(!id) return toast('Choisis un serveur');
    const payload={ guildId:id };
    if(type==='welcome'){ payload.welcomeChannel=document.getElementById('welcomeChannel').value.trim(); payload.welcomeMessage=document.getElementById('welcomeMessage').value; payload.welcomeBanner=document.getElementById('welcomeBanner').value.trim(); }
    if(type==='goodbye'){ payload.goodbyeChannel=document.getElementById('goodbyeChannel').value.trim(); payload.goodbyeMessage=document.getElementById('goodbyeMessage').value; payload.goodbyeBanner=document.getElementById('goodbyeBanner').value.trim(); }
    const res=await fetch('/admin/api/guilds',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
    const j=await res.json(); if(j.success) toast('Enregistré ✅'); else toast('Erreur');
  }
  document.getElementById('welcomeMessage').addEventListener('input',()=>preview('welcome'));
  document.getElementById('goodbyeMessage').addEventListener('input',()=>preview('goodbye'));
  document.getElementById('welcomeBanner').addEventListener('input',bannerPreview);
  guildSelect.addEventListener('change', loadGuild);
  document.querySelectorAll('.sidebar a[data-tab]').forEach(a=>{
    a.addEventListener('click',()=>{
      document.querySelectorAll('.sidebar a[data-tab]').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      document.querySelectorAll('.tab').forEach(s=>s.style.display='none');
      document.getElementById('tab-'+a.dataset.tab).style.display='block';
    });
  });
  // init
  loadGuild();
  fetch('/api/commands').then(r=>r.json()).then(j=>{
    const el=document.getElementById('commandsList');
    el.innerHTML=j.commands.map(c=>'<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border:1px solid var(--border); border-radius:8px;"><span><b>/'+c.name+'</b> <span style="color:var(--text-muted)">'+c.description.slice(0,60)+'</span></span><span style="color:#57f287">● actif</span></div>').join('');
  });
  bannerPreview();
</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
