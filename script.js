const typedText = document.getElementById('typed');
const roles = [
  'design systems that feel like Google',
  'accessible, joyful interfaces',
  'fast APIs with clean docs'
];
let roleIndex = 0;
let charIndex = 0;
let typing = true;

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

document.addEventListener('DOMContentLoaded', () => {
  if (roles.length) {
    updateText();
  }
  revealOnScroll();
  setupNavToggle();
});
