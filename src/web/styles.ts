export const BASE_CSS = `
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
  .logo { width: 88px; height: 88px; margin-bottom: 18px; }
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
