# Personal Portfolio Website

This repository contains a simple personal portfolio website for showcasing projects and skills. It is built with HTML, CSS and vanilla JavaScript, featuring smooth animations and a responsive design.

## Sections

- **Home**: introduction with animated roles
- **About**: summary of background and interests
- **Skills**: list of technical skills
- **Projects**: sample project cards
- **Contact**: links to email, GitHub and LinkedIn

Open `index.html` in a browser to view the site.

## Résumé

The résumé lives at **/markdown** and is written in Markdown.

`resume.md` in the repository root is the single source of truth. It is rendered to
static HTML ahead of time rather than in the browser, so the page needs no
JavaScript, is indexable, and works when opened straight from disk.

```bash
# after editing resume.md
node scripts/build-resume.mjs
```

That writes `markdown/index.html` (the page) and `markdown/resume.md` (the raw file
served at `/markdown/resume.md`). Both are committed — **edit `resume.md` and re-run
the script; do not edit `markdown/index.html` by hand**, as the next build overwrites it.

[`scripts/build-resume.mjs`](scripts/build-resume.mjs) has no dependencies, so there is
nothing to install. It supports only the Markdown `resume.md` uses — headings,
paragraphs, lists, rules, links, emphasis and code spans. Extend the script if you need
more; it is not a full Markdown implementation.

The page reuses `style.css`, so it follows the site's light/dark theme automatically,
and has print styles for saving to PDF.
