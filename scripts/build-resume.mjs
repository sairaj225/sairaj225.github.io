/**
 * Renders resume.md into markdown/index.html.
 *
 * Written without dependencies on purpose: this repo has no package.json and no
 * build step, and adding npm for one page would be a poor trade. The renderer
 * therefore supports only the Markdown that resume.md actually uses — headings,
 * paragraphs, lists, rules, links and inline emphasis. It is not a general
 * Markdown implementation, so if you reach for a feature it does not know,
 * extend it here rather than assuming it works.
 *
 * Run after editing resume.md:  node scripts/build-resume.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Escaped first, so every later step can emit markup safely. */
const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Inline formatting, applied to already-escaped text.
 *
 * Code spans run first and their contents are stashed, so emphasis markers
 * inside `--flag` or `a * b` are not misread as formatting.
 */
function inline(text) {
  const codeSpans = [];
  let out = text.replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(code);
    return `\u0000${codeSpans.length - 1}\u0000`;
  });

  out = out
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      // Only http(s), mailto and same-site paths — never javascript: URLs.
      const safe = /^(https?:|mailto:|[./#])/i.test(href) ? href : '#';
      const external = /^https?:/i.test(safe);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${safe}"${attrs}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/(^|\s)_([^_]+)_/g, '$1<em>$2</em>');

  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codeSpans[Number(i)]}</code>`);
}

/** Turns a heading into a stable anchor id, for the contents links. */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

function renderMarkdown(markdown) {
  const lines = markdown.split('\n');
  const html = [];
  const headings = [];
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }
  };

  for (const line of lines) {
    const raw = line.trimEnd();
    const text = escapeHtml(raw);

    if (!raw.trim()) {
      closeList();
      continue;
    }

    if (/^---+$/.test(raw.trim())) {
      closeList();
      html.push('<hr />');
      continue;
    }

    const heading = raw.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      const body = inline(escapeHtml(heading[2]));
      const id = slugify(heading[2]);
      if (level === 2) headings.push({ id, label: heading[2] });
      html.push(`<h${level} id="${id}">${body}</h${level}>`);
      continue;
    }

    const item = raw.match(/^[-*]\s+(.*)$/);
    if (item) {
      if (!listOpen) {
        html.push('<ul>');
        listOpen = true;
      }
      html.push(`<li>${inline(escapeHtml(item[1]))}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${inline(text)}</p>`);
  }

  closeList();
  return { body: html.join('\n'), headings };
}

function page({ body, headings }) {
  const nav = headings
    .map(({ id, label }) => `<a href="#${id}">${escapeHtml(label)}</a>`)
    .join('\n          ');

  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Veera Atukuri | Résumé</title>
  <meta name="description" content="Résumé of Veera Atukuri, Software Development Engineer based in Hyderabad, India." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../style.css" />
  <link rel="stylesheet" href="resume.css" />
  <script>
    // Applied before first paint so a dark-mode visitor never sees a white flash.
    try {
      var stored = localStorage.getItem('preferred-theme');
      var dark = stored ? stored === 'dark'
        : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    } catch (e) { /* private mode — fall back to the light default */ }
  </script>
  <script defer src="../script.js"></script>
</head>

<body>
  <header class="top-nav surface">
    <div class="brand">
      <span class="logo-dot blue"></span>
      <span class="logo-dot red"></span>
      <span class="logo-dot yellow"></span>
      <span class="logo-dot green"></span>
      <span class="brand-name">Veera</span>
    </div>
    <!-- Required: below 820px the links and actions are hidden until this opens them. -->
    <button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">
      <span class="menu-bar"></span>
      <span class="menu-bar"></span>
      <span class="menu-bar"></span>
    </button>
    <nav class="nav-links">
      <a href="../index.html">Home</a>
      <a href="../index.html#work">Projects</a>
      <a href="../index.html#contact">Contact</a>
    </nav>
    <div class="nav-actions">
      <button class="chip outline theme-toggle" type="button" aria-label="Toggle dark mode" data-theme-toggle>
        <span class="theme-icon" aria-hidden="true">🌙</span>
        <span class="theme-label">Dark</span>
      </button>
      <a class="chip outline" href="resume.md" download>Download .md</a>
    </div>
  </header>

  <main class="page resume-page">
    <nav class="resume-toc surface" aria-label="Sections">
      ${nav}
    </nav>

    <article class="resume surface">
${body
  .split('\n')
  .map((line) => `      ${line}`)
  .join('\n')}
    </article>
  </main>

  <footer class="footer surface">
    <p>Written in Markdown · <a href="resume.md">View the source</a></p>
  </footer>
</body>

</html>
`;
}

const source = readFileSync(join(root, 'resume.md'), 'utf8');
const outDir = join(root, 'markdown');
mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, 'index.html'), page(renderMarkdown(source)));
// Served alongside the page so /markdown/resume.md is the real Markdown file.
writeFileSync(join(outDir, 'resume.md'), source);

console.log('Wrote markdown/index.html and markdown/resume.md');
