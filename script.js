const typedText = document.getElementById('typed');
const roles = [
  'design systems that feel like Google',
  'accessible, joyful interfaces',
  'fast APIs with clean docs'
];
let roleIndex = 0;
let charIndex = 0;
let typing = true;
const THEME_KEY = 'preferred-theme';
const root = document.documentElement;

function updateText() {
  const current = roles[roleIndex];
  if (typing) {
    typedText.textContent = current.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      typing = false;
      setTimeout(updateText, 1800);
      return;
    }
  } else {
    typedText.textContent = current.substring(0, Math.max(0, charIndex - 1));
    charIndex--;
    if (charIndex === 0) {
      typing = true;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  setTimeout(updateText, typing ? 90 : 40);
}

function revealOnScroll() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function setupNavToggle() {
  const toggle = document.querySelector('.menu-toggle');
  const topNav = document.querySelector('.top-nav');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (!toggle || !topNav) return;

  const closeMenu = () => {
    topNav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const open = topNav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });

  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });
}

function applyTheme(theme, persist = true) {
  root.setAttribute('data-theme', theme);
  if (persist) {
    localStorage.setItem(THEME_KEY, theme);
  }

  const toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    const icon = toggle.querySelector('.theme-icon');
    const label = toggle.querySelector('.theme-label');
    const isDark = theme === 'dark';
    toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    toggle.setAttribute('aria-pressed', String(isDark));
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    if (label) label.textContent = isDark ? 'Light' : 'Dark';
  }
}

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setupThemeToggle() {
  const toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;

  applyTheme(getInitialTheme(), false);

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', (event) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(event.matches ? 'dark' : 'light', false);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (roles.length) {
    updateText();
  }
  revealOnScroll();
  setupNavToggle();
  setupThemeToggle();
});
