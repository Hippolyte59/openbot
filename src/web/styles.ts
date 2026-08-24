export const BASE_CSS = `
  :root {
    --bg: #0a0a0c;
    --surface: #141417;
    --surface-2: #1a1a1e;
    --border: #24242a;
    --border-soft: #2a2a32;
    --text: #f0f0f3;
    --text-muted: #9a9aa3;
    --text-faint: #6e6e7a;
    --accent: #5865F2;
    --accent-hover: #4752c4;
    --accent-glow: rgba(88,101,242,.18);
    --success: #57F287;
    --code-bg: #1e1e22;
    --radius: 16px;
    --radius-sm: 10px;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    background-image:
      radial-gradient(1200px 600px at 50% -10%, rgba(88,101,242,.14), transparent 60%),
      radial-gradient(800px 400px at 90% 20%, rgba(87,242,135,.06), transparent 60%),
      radial-gradient(700px 500px at 10% 60%, rgba(88,101,242,.06), transparent 60%);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  header.hero {
    position: relative;
    padding: 88px 24px 64px;
    text-align: center;
    border-bottom: 1px solid var(--border);
    overflow: hidden;
  }
  header.hero::before {
    content:"";
    position:absolute; inset:0;
    background:
      linear-gradient(180deg, transparent 0%, var(--bg) 100%),
      repeating-linear-gradient(0deg, transparent 0 40px, rgba(255,255,255,.015) 40px 41px),
      repeating-linear-gradient(90deg, transparent 0 40px, rgba(255,255,255,.015) 40px 41px);
    pointer-events:none;
    opacity:.5;
  }
  header.hero > * { position: relative; z-index:1; }
  .logo { width: 88px; height: 88px; margin-bottom: 18px; filter: drop-shadow(0 8px 24px var(--accent-glow)); }
  header.hero h1 { font-size: clamp(2.2rem, 5vw, 3.4rem); letter-spacing: -0.035em; font-weight: 800; line-height: 1.1; }
  header.hero h1 span { color: var(--text-muted); font-weight: 300; letter-spacing: -0.02em; }
  header.hero p {
    max-width: 640px;
    margin: 16px auto 28px;
    color: var(--text-muted);
    font-size: 1.08rem;
    line-height: 1.7;
  }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn {
    display: inline-flex; align-items:center; justify-content:center; gap:8px;
    padding: 11px 24px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-weight: 600; font-size:.92rem;
    transition: all .18s ease;
  }
  .btn:hover { background: var(--surface-2); border-color: var(--border-soft); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
  .btn:active { transform: translateY(0); }
  .btn.primary { background: var(--text); color: #0a0a0c; border-color: var(--text); box-shadow: 0 4px 20px rgba(255,255,255,.12); }
  .btn.primary:hover { background:#fff; border-color:#fff; box-shadow: 0 8px 28px rgba(255,255,255,.18); }
  main { max-width: 960px; margin: 0 auto; padding: 48px 24px 80px; }
  section.card {
    background: linear-gradient(180deg, var(--surface) 0%, rgba(20,20,23,.9) 100%);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    margin-bottom: 24px;
    box-shadow: 0 1px 0 rgba(255,255,255,.03) inset, 0 12px 32px rgba(0,0,0,.18);
    transition: border-color .18s, transform .18s, box-shadow .18s;
  }
  section.card:hover { border-color: var(--border-soft); }
  main > section.card + section.card { margin-top: 0; }
  h2 { font-size: 1.28rem; letter-spacing: -0.02em; margin-bottom: 8px; font-weight: 700; }
  p.muted { color: var(--text-muted); margin-bottom: 18px; font-size:.96rem; line-height:1.6; }
  table { width: 100%; border-collapse: collapse; font-size: .93rem; }
  th, td { text-align: left; padding: 11px 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
  thead th { color: var(--text-faint); font-size: .72rem; text-transform: uppercase; letter-spacing: .09em; font-weight: 700; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: rgba(255,255,255,.015); }
  code {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 7px;
    padding: 2px 7px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: .84em;
    white-space: nowrap;
  }
  footer {
    text-align: center;
    padding: 40px 24px;
    color: var(--text-muted);
    font-size: .88rem;
    border-top: 1px solid var(--border);
    background: rgba(255,255,255,.01);
  }
  footer a { text-decoration: none; border-bottom: 1px solid transparent; transition: border-color .15s; }
  footer a:hover { border-color: var(--text-muted); }
  @media (max-width: 560px) {
    section.card { padding: 20px; border-radius: 14px; }
    th, td { padding: 9px 8px; }
    header.hero { padding: 64px 20px 48px; }
  }
`;

export const COPY_JS = `
  document.querySelectorAll("td code").forEach((el) => {
    el.style.cursor = "pointer";
    el.title = "Cliquer pour copier";
    el.addEventListener("click", async () => {
      const text = el.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        flash(el, "Copié");
      } catch {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
        flash(el, "Copié");
      }
    });
  });
  function flash(el, label) {
    const old = el.title;
    el.title = label;
    el.style.borderColor = "#57f287";
    setTimeout(() => { el.title = old; el.style.borderColor = ""; }, 1200);
  }
`;
