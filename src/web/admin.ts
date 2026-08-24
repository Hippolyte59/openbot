import type { Client } from "discord.js";
import { loadGuilds } from "../database/json-db.js";
import { BASE_CSS } from "./styles.js";
import { config } from "../config.js";

export function renderAdmin(client: Client): string {
  const guilds = [...client.guilds.cache.values()].map(g => ({
    id: g.id, name: g.name, memberCount: g.memberCount ?? 0,
    icon: g.iconURL() ?? `https://cdn.discordapp.com/embed/avatars/${Number(g.id) % 5}.png`
  }));
  const stored = loadGuilds();
  const guildOptions = guilds.map(g => `<option value="${g.id}">${escapeHtml(g.name)} — ${g.memberCount} membres</option>`).join("") || `<option value="">Aucun serveur</option>`;
  const firstId = guilds[0]?.id ?? "";
  const firstCfg: any = firstId ? (stored.get(firstId) ?? {}) : {};

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(config.botName)} — Admin</title>
<link rel="icon" href="/logo.svg">
<style>${BASE_CSS}
  .wrap{max-width:900px;margin:0 auto;padding:24px;}
  .tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0;}
  .tabs button{padding:8px 14px;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:8px;cursor:pointer;}
  .tabs button.active{background:var(--text);color:#000;border-color:var(--text);}
  .panel{display:none;}
  .panel.active{display:block;}
  .field{margin:10px 0;}
  .field label{font-size:.85rem;color:var(--text-muted);display:block;margin-bottom:6px;}
  .field input,.field textarea,.field select{width:100%;background:#0f0f0f;border:1px solid var(--border);color:var(--text);border-radius:8px;padding:10px 12px;}
  .field textarea{min-height:80px;}
  .preview{background:#1e1e1e;border:1px solid var(--border);border-radius:10px;padding:12px;margin-top:10px;}
  .preview .msg{background:#2b2d31;border-left:4px solid #5865F2;border-radius:8px;padding:10px;}
  .banner{width:100%;height:140px;background:#0f0f0f;border:1px dashed var(--border);border-radius:10px;display:grid;place-items:center;overflow:hidden;}
  .banner img{width:100%;height:100%;object-fit:cover;}
  .toast{position:fixed;right:16px;bottom:16px;background:#111;border:1px solid #333;padding:10px 14px;border-radius:10px;display:none;}
</style>
</head>
<body>
<header class="hero" style="padding:32px 24px;">
  <h1>${escapeHtml(config.botName)} — Admin</h1>
  <p class="muted">Configure sans coder. Sauvegardé dans <code>data/</code>.</p>
  <div class="hero-actions"><a class="btn" href="/">Accueil</a><a class="btn" href="/wiki">Wiki</a></div>
</header>
<main class="wrap">
  <section class="card">
    <div class="field"><label>Serveur</label><select id="guildSelect">${guildOptions}</select></div>
  </section>

  <div class="tabs">
    <button class="active" data-tab="welcome">Bienvenue</button>
    <button data-tab="goodbye">Au revoir</button>
    <button data-tab="objectifs">Objectifs</button>
    <button data-tab="auto">Auto</button>
    <button data-tab="logs">Logs</button>
    <button data-tab="commands">Commandes</button>
    <button data-tab="style">Apparence</button>
  </div>

  <section id="panel-welcome" class="card panel active">
    <h2>Bienvenue</h2>
    <p class="muted">Placeholders: <code>{pseudo}</code> <code>{mention}</code> <code>{server_name}</code> <code>{channel_name}</code> <code>{memberCount}</code></p>
    <div class="field"><label>Salon ID</label><input id="welcomeChannel" value="${escapeHtml(firstCfg.welcomeChannel ?? "")}" placeholder="123456789..."></div>
    <div class="field"><label>Bannière URL</label><input id="welcomeBanner" value="${escapeHtml(firstCfg.welcomeBanner ?? "")}" placeholder="https://..."></div>
    <div class="banner" id="welcomeBannerPreview"><span>Aperçu</span></div>
    <div class="field"><label>Message</label><textarea id="welcomeMessage">${escapeHtml(firstCfg.welcomeMessage ?? "🎉 Bienvenue {pseudo} sur **{server_name}** !\n\nTu es notre {memberCount}ème membre — merci de nous rejoindre ! N'hésite pas à te présenter dans {channel_name}.")}</textarea></div>
    <div class="preview"><div class="msg" id="welcomePreview"></div></div>
    <button class="btn primary" style="margin-top:10px;" onclick="save('welcome')">Enregistrer</button>
  </section>

  <section id="panel-goodbye" class="card panel">
    <h2>Au revoir</h2>
    <div class="field"><label>Salon ID</label><input id="goodbyeChannel" value="${escapeHtml(firstCfg.goodbyeChannel ?? "")}"></div>
    <div class="field"><label>Bannière URL</label><input id="goodbyeBanner" value="${escapeHtml(firstCfg.goodbyeBanner ?? "")}"></div>
    <div class="field"><label>Message</label><textarea id="goodbyeMessage">${escapeHtml(firstCfg.goodbyeMessage ?? "👋 Au revoir {pseudo}, on espère te revoir sur **{server_name}** !")}</textarea></div>
    <div class="preview"><div class="msg" id="goodbyePreview"></div></div>
    <button class="btn primary" style="margin-top:10px;" onclick="save('goodbye')">Enregistrer</button>
  </section>

  <section id="panel-objectifs" class="card panel">
    <h2>Objectifs communauté</h2>
    <p class="muted">Donnez un objectif : niveau maximum et rôle spécial + salon privilégié</p>
    <div class="row2">
      <div class="field"><label>Niveau maximum</label><input type="number" id="maxLevel" placeholder="100" min="10" max="1000" value="${escapeHtml(String(firstCfg.maxLevel ?? 100))}"></div>
      <div class="field"><label>Rôle niveau max (ID)</label><input id="maxLevelRoleId" value="${escapeHtml(firstCfg.maxLevelRoleId ?? "")}" placeholder="123456789..."></div>
    </div>
    <div class="row2">
      <div class="field"><label>Rôle privilégié (ID)</label><input id="privilegedRoleId" value="${escapeHtml(firstCfg.privilegedRoleId ?? "")}" placeholder="123456789..."></div>
      <div class="field"><label>Salon privilégié (ID)</label><input id="privilegedChannelId" value="${escapeHtml(firstCfg.privilegedChannelId ?? "")}" placeholder="123456789..."></div>
    </div>
    <button class="btn primary" style="margin-top:10px;" onclick="saveGoals()">Enregistrer objectifs</button>
  </section>

  <section id="panel-auto" class="card panel">
    <h2>Automatisation</h2>
    <p class="muted">Rôles auto, commandes perso, rôles réactions, réactions de mots — aussi via slash : <code>/autorole</code> <code>/custom</code> <code>/reactionrole</code> <code>/wordreact</code></p>
    <div class="field"><label>Rôles automatiques à l'arrivée (IDs séparés par virgule)</label><input id="autoRoles" value="${escapeHtml((firstCfg.autoRoles||[]).join(", "))}" placeholder="123, 456"></div>
    <div class="field"><label>Commandes personnalisées (JSON — ex: {"bonjour":{"response":"Salut {mention} !"}})</label><textarea id="customCommands" style="min-height:90px;font-family:monospace;font-size:.85rem;">${escapeHtml(JSON.stringify(firstCfg.customCommands||{}, null, 2))}</textarea><p class="muted">Placeholders: {pseudo} {mention} {user} {server_name} {channel_name} {memberCount} {args} — déclenché par <code>!nom</code></p></div>
    <div class="field"><label>Réactions de mots (JSON — ex: {"hello":"👋","gg":"🎉"})</label><textarea id="wordReactions" style="min-height:70px;font-family:monospace;font-size:.85rem;">${escapeHtml(JSON.stringify(firstCfg.wordReactions||{}, null, 2))}</textarea></div>
    <div class="field"><label>Rôles réactions (JSON — messageId → emoji→roleId)</label><textarea id="reactionRoles" style="min-height:70px;font-family:monospace;font-size:.85rem;">${escapeHtml(JSON.stringify(firstCfg.reactionRoles||{}, null, 2))}</textarea><p class="muted">Ex: {"1234567890123":{"✅":"987654321"}} — utilise <code>/reactionrole ajouter</code> pour réagir auto</p></div>
    <button class="btn primary" style="margin-top:10px;" onclick="saveAuto()">Enregistrer automatisation</button>
  </section>

  <section id="panel-logs" class="card panel">
    <h2>Logs personnalisés</h2>
    <p class="muted">Configuration des logs par service (YouTube, Twitch, Reddit, Dealabs)</p>
    <div class="row2">
      <div class="field"><label>YouTube — Couleur</label><div style="display:flex;gap:8px;"><input type="color" id="logsYouTubeColor" value="${escapeHtml(firstCfg.logs?.youtube?.color ?? "#FF0000")}" style="width:48px;height:38px;padding:2px;"><input type="text" id="logsYouTubeColorText" value="${escapeHtml(firstCfg.logs?.youtube?.color ?? "#FF0000")}" style="flex:1"></div></div>
      <div class="field"><label>YouTube — Salon ID</label><input id="logsYouTubeChannel" value="${escapeHtml(firstCfg.logs?.youtube?.channelId ?? "")}" placeholder="123456789..."></div>
    </div>
    <div class="row2">
      <div class="field"><label>Twitch — Couleur</label><div style="display:flex;gap:8px;"><input type="color" id="logsTwitchColor" value="${escapeHtml(firstCfg.logs?.twitch?.color ?? "#9146FF")}" style="width:48px;height:38px;padding:2px;"><input type="text" id="logsTwitchColorText" value="${escapeHtml(firstCfg.logs?.twitch?.color ?? "#9146FF")}" style="flex:1"></div></div>
      <div class="field"><label>Twitch — Salon ID</label><input id="logsTwitchChannel" value="${escapeHtml(firstCfg.logs?.twitch?.channelId ?? "")}" placeholder="123456789..."></div>
    </div>
    <div class="row2">
      <div class="field"><label>Reddit — Couleur</label><div style="display:flex;gap:8px;"><input type="color" id="logsRedditColor" value="${escapeHtml(firstCfg.logs?.reddit?.color ?? "#FF4500")}" style="width:48px;height:38px;padding:2px;"><input type="text" id="logsRedditColorText" value="${escapeHtml(firstCfg.logs?.reddit?.color ?? "#FF4500")}" style="flex:1"></div></div>
      <div class="field"><label>Reddit — Salon ID</label><input id="logsRedditChannel" value="${escapeHtml(firstCfg.logs?.reddit?.channelId ?? "")}" placeholder="123456789..."></div>
    </div>
    <div class="row2">
      <div class="field"><label>Dealabs — Couleur</label><div style="display:flex;gap:8px;"><input type="color" id="logsDealabsColor" value="${escapeHtml(firstCfg.logs?.dealabs?.color ?? "#FFAA00")}" style="width:48px;height:38px;padding:2px;"><input type="text" id="logsDealabsColorText" value="${escapeHtml(firstCfg.logs?.dealabs?.color ?? "#FFAA00")}" style="flex:1"></div></div>
      <div class="field"><label>Dealabs — Salon ID</label><input id="logsDealabsChannel" value="${escapeHtml(firstCfg.logs?.dealabs?.channelId ?? "")}" placeholder="123456789..."></div>
    </div>
    <div class="row2">
      <div class="field"><label>Avatar par défaut (URL)</label><input id="logsAvatarUrl" value="${escapeHtml(firstCfg.logs?.youtube?.avatarUrl ?? "")}" placeholder="https://..."></div>
    </div>
    <button class="btn primary" style="margin-top:10px;" onclick="saveLogs()">Enregistrer logs</button>
  </section>

  <section id="panel-commands" class="card panel">
    <h2>Commandes</h2>
    <div id="commandsList"></div>
  </section>

  <section id="panel-style" class="card panel">
    <h2>Apparence</h2>
    <p class="muted">Changez la couleur des niveaux et de l'économie</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="field"><label>Couleur principale</label><div style="display:flex;gap:8px;"><input type="color" id="embedColor" value="${escapeHtml(config.embedColor)}" style="width:48px;height:38px;padding:2px;"><input type="text" id="embedColorText" value="${escapeHtml(config.embedColor)}" style="flex:1"></div></div>
      <div class="field"><label>Couleur niveaux</label><div style="display:flex;gap:8px;"><input type="color" id="levelColor" value="${escapeHtml((config as any).levelColor ?? "#57F287")}" style="width:48px;height:38px;padding:2px;"><input type="text" id="levelColorText" value="${escapeHtml((config as any).levelColor ?? "#57F287")}" style="flex:1"></div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="field"><label>Couleur économie</label><div style="display:flex;gap:8px;"><input type="color" id="economyColor" value="${escapeHtml((config as any).economyColor ?? "#FEE75C")}" style="width:48px;height:38px;padding:2px;"><input type="text" id="economyColorText" value="${escapeHtml((config as any).economyColor ?? "#FEE75C")}" style="flex:1"></div></div>
      <div class="field"><label>Nom du bot</label><input id="botName" value="${escapeHtml(config.botName)}"></div>
    </div>
    <button class="btn primary" style="margin-top:10px;" onclick="saveStyle()">Enregistrer apparence</button>
    <p class="muted" style="margin-top:8px;">Par serveur — modifie <code>.env</code> pour les valeurs globales : <code>EMBED_COLOR</code> / <code>LEVEL_COLOR</code> / <code>ECONOMY_COLOR</code></p>
  </section>
</main>
<div class="toast" id="toast"></div>
<script>
  const toastEl=document.getElementById('toast');
  function toast(m){toastEl.textContent=m;toastEl.style.display='block';setTimeout(()=>toastEl.style.display='none',1800);}
  function curId(){return document.getElementById('guildSelect').value;}
  async function loadGuild(){
    const id=curId(); if(!id) return;
    const r=await fetch('/admin/api/guilds'); const d=await r.json();
    const c=(d.find(x=>x[0]===id)||[])[1]||{};
    document.getElementById('welcomeChannel').value=c.welcomeChannel||'';
    document.getElementById('welcomeMessage').value=c.welcomeMessage||'🎉 Bienvenue {pseudo} sur **{server_name}** !\\n\\nTu es notre {memberCount}ème membre — merci de nous rejoindre ! N\\'hésite pas à te présenter dans {channel_name}.';
    document.getElementById('welcomeBanner').value=c.welcomeBanner||'';
    document.getElementById('goodbyeChannel').value=c.goodbyeChannel||'';
    document.getElementById('goodbyeMessage').value=c.goodbyeMessage||'👋 Au revoir {pseudo}, on espère te revoir sur **{server_name}** !';
    document.getElementById('goodbyeBanner').value=c.goodbyeBanner||'';
    document.getElementById('maxLevel').value=c.maxLevel||100;
    document.getElementById('maxLevelRoleId').value=c.maxLevelRoleId||'';
    document.getElementById('privilegedRoleId').value=c.privilegedRoleId||'';
    document.getElementById('privilegedChannelId').value=c.privilegedChannelId||'';
    document.getElementById('logsYouTubeColor').value=c.logs?.youtube?.color||'#FF0000';
    document.getElementById('logsYouTubeColorText').value=c.logs?.youtube?.color||'#FF0000';
    document.getElementById('logsYouTubeChannel').value=c.logs?.youtube?.channelId||'';
    document.getElementById('logsTwitchColor').value=c.logs?.twitch?.color||'#9146FF';
    document.getElementById('logsTwitchColorText').value=c.logs?.twitch?.color||'#9146FF';
    document.getElementById('logsTwitchChannel').value=c.logs?.twitch?.channelId||'';
    document.getElementById('logsRedditColor').value=c.logs?.reddit?.color||'#FF4500';
    document.getElementById('logsRedditColorText').value=c.logs?.reddit?.color||'#FF4500';
    document.getElementById('logsRedditChannel').value=c.logs?.reddit?.channelId||'';
    document.getElementById('logsDealabsColor').value=c.logs?.dealabs?.color||'#FFAA00';
    document.getElementById('logsDealabsColorText').value=c.logs?.dealabs?.color||'#FFAA00';
    document.getElementById('logsDealabsChannel').value=c.logs?.dealabs?.channelId||'';
    document.getElementById('logsAvatarUrl').value=c.logs?.youtube?.avatarUrl||'';
    document.getElementById('autoRoles').value=(c.autoRoles||[]).join(", ");
    document.getElementById('customCommands').value=JSON.stringify(c.customCommands||{}, null, 2);
    document.getElementById('wordReactions').value=JSON.stringify(c.wordReactions||{}, null, 2);
    document.getElementById('reactionRoles').value=JSON.stringify(c.reactionRoles||{}, null, 2);
    document.getElementById('embedColor').value=c.embedColor||'${config.embedColor}';
    document.getElementById('embedColorText').value=c.embedColor||'${config.embedColor}';
    document.getElementById('levelColor').value=c.levelColor||'${(config as any).levelColor ?? "#57F287"}';
    document.getElementById('levelColorText').value=c.levelColor||'${(config as any).levelColor ?? "#57F287"}';
    document.getElementById('economyColor').value=c.economyColor||'${(config as any).economyColor ?? "#FEE75C"}';
    document.getElementById('economyColorText').value=c.economyColor||'${(config as any).economyColor ?? "#FEE75C"}';
    preview('welcome'); preview('goodbye'); bannerPreview();
  }
  function preview(t){
    const msg=document.getElementById(t+'Message').value;
    const out=document.getElementById(t+'Preview');
    const f={pseudo:'Hippolyte', mention:'@Hippolyte', server_name:'MonServeur', channel_name:'#bienvenue', memberCount:'42'};
    let r=msg; r=r.replace(/{pseudo}/gi,f.pseudo); r=r.replace(/{@?mention}/g,f.mention); r=r.replace(/{server_name}/g,f.server_name); r=r.replace(/{channel_name}/g,f.channel_name); r=r.replace(/{memberCount}/g,f.memberCount);
    out.textContent=r;
  }
  function bannerPreview(){
    const url=document.getElementById('welcomeBanner').value.trim();
    const el=document.getElementById('welcomeBannerPreview');
    if(url) el.innerHTML='<img src=\"'+url+'\" onerror=\"this.parentElement.textContent=\\'URL invalide\\'\">'; else el.innerHTML='<span>Aperçu</span>';
  }
  async function save(t){
    const id=curId(); if(!id) return toast('Choisis un serveur');
    const p={guildId:id};
    if(t==='welcome'){p.welcomeChannel=document.getElementById('welcomeChannel').value.trim(); p.welcomeMessage=document.getElementById('welcomeMessage').value; p.welcomeBanner=document.getElementById('welcomeBanner').value.trim();}
    if(t==='goodbye'){p.goodbyeChannel=document.getElementById('goodbyeChannel').value.trim(); p.goodbyeMessage=document.getElementById('goodbyeMessage').value; p.goodbyeBanner=document.getElementById('goodbyeBanner').value.trim();}
    const r=await fetch('/admin/api/guilds',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    const j=await r.json(); toast(j.success?'Enregistré ✅':'Erreur');
  }
  async function saveGoals(){
    const id=curId(); if(!id) return toast('Choisis un serveur');
    const p={guildId:id, maxLevel: Number(document.getElementById('maxLevel').value)||100, maxLevelRoleId: document.getElementById('maxLevelRoleId').value.trim(), privilegedRoleId: document.getElementById('privilegedRoleId').value.trim(), privilegedChannelId: document.getElementById('privilegedChannelId').value.trim()};
    const r=await fetch('/admin/api/guilds',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    const j=await r.json(); toast(j.success?'Objectifs enregistrés ✅':'Erreur');
  }
  async function saveLogs(){
    const id=curId(); if(!id) return toast('Choisis un serveur');
    const p={guildId:id, logs: {
      youtube: { color: document.getElementById('logsYouTubeColor').value, channelId: document.getElementById('logsYouTubeChannel').value.trim(), avatarUrl: document.getElementById('logsAvatarUrl').value.trim() },
      twitch: { color: document.getElementById('logsTwitchColor').value, channelId: document.getElementById('logsTwitchChannel').value.trim() },
      reddit: { color: document.getElementById('logsRedditColor').value, channelId: document.getElementById('logsRedditChannel').value.trim() },
      dealabs: { color: document.getElementById('logsDealabsColor').value, channelId: document.getElementById('logsDealabsChannel').value.trim() }
    }};
    const r=await fetch('/admin/api/guilds',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    const j=await r.json(); toast(j.success?'Logs enregistrés ✅':'Erreur');
  }
  async function saveAuto(){
    const id=curId(); if(!id) return toast('Choisis un serveur');
    let customCommands={}, wordReactions={}, reactionRoles={};
    try{ customCommands=JSON.parse(document.getElementById('customCommands').value||"{}"); }catch{ return toast('JSON commandes invalide'); }
    try{ wordReactions=JSON.parse(document.getElementById('wordReactions').value||"{}"); }catch{ return toast('JSON mots invalide'); }
    try{ reactionRoles=JSON.parse(document.getElementById('reactionRoles').value||"{}"); }catch{ return toast('JSON rôles réactions invalide'); }
    const autoRoles=document.getElementById('autoRoles').value.split(",").map((s)=>s.trim()).filter(Boolean);
    const p={guildId:id, autoRoles, customCommands, wordReactions, reactionRoles};
    const r=await fetch('/admin/api/guilds',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    const j=await r.json(); toast(j.success?'Automatisation enregistrée ✅':'Erreur');
  }
  async function saveStyle(){
    const id=curId(); if(!id) return toast('Choisis un serveur');
    const p={guildId:id, embedColor:document.getElementById('embedColor').value, levelColor:document.getElementById('levelColor').value, economyColor:document.getElementById('economyColor').value};
    // sync text inputs
    document.getElementById('embedColorText').value=p.embedColor;
    document.getElementById('levelColorText').value=p.levelColor;
    document.getElementById('economyColorText').value=p.economyColor;
    const r=await fetch('/admin/api/guilds',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
    const j=await r.json(); toast(j.success?'Apparence enregistrée ✅':'Erreur');
  }
  // sync color pickers <-> text
  [['embedColor','embedColorText'],['levelColor','levelColorText'],['economyColor','economyColorText'],['logsYouTubeColor','logsYouTubeColorText'],['logsTwitchColor','logsTwitchColorText'],['logsRedditColor','logsRedditColorText'],['logsDealabsColor','logsDealabsColorText']].forEach(([c,t])=>{
    const a=document.getElementById(c), b=document.getElementById(t);
    if(!a||!b) return;
    a.addEventListener('input',e=>b.value=e.target.value);
    b.addEventListener('input',e=>{ const v=e.target.value; if(/^#[0-9A-Fa-f]{6}$/.test(v)) a.value=v; });
  });
  document.getElementById('welcomeMessage').addEventListener('input',()=>preview('welcome'));
  document.getElementById('goodbyeMessage').addEventListener('input',()=>preview('goodbye'));
  document.getElementById('welcomeBanner').addEventListener('input',bannerPreview);
  document.getElementById('guildSelect').addEventListener('change',loadGuild);
  document.querySelectorAll('.tabs button').forEach(b=>{
    b.addEventListener('click',()=>{
      document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
      document.getElementById('panel-'+b.dataset.tab).classList.add('active');
    });
  });
  loadGuild();
  fetch('/api/commands').then(r=>r.json()).then(j=>{
    const el=document.getElementById('commandsList');
    el.innerHTML=j.commands.map(c=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border:1px solid var(--border);border-radius:8px;margin-bottom:6px;"><span><b>/'+c.name+'</b> <span style="color:var(--text-muted)">'+c.description.slice(0,60)+'</span></span><span style="color:#57f287">● actif</span></div>').join('');
  });
  bannerPreview(); preview('welcome'); preview('goodbye');
</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
