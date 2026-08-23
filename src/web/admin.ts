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
    <button data-tab="commands">Commandes</button>
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

  <section id="panel-commands" class="card panel">
    <h2>Commandes</h2>
    <div id="commandsList"></div>
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
    el.innerHTML=j.commands.map(c=>'<div style=\"display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border:1px solid var(--border);border-radius:8px;margin-bottom:6px;\"><span><b>/'+c.name+'</b> <span style=\"color:var(--text-muted)\">'+c.description.slice(0,60)+'</span></span><span style=\"color:#57f287\">● actif</span></div>').join('');
  });
  bannerPreview(); preview('welcome'); preview('goodbye');
</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
