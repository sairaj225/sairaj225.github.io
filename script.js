const typedText = document.getElementById('typed');
const roles = [
  'Professional Software Engineer',
  'Full Stack Developer',
  'Tech Enthusiast'
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
      setTimeout(updateText, 2000);
      return;
    }
  } else {
    typedText.textContent = current.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      typing = true;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  setTimeout(updateText, typing ? 120 : 60);
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

document.addEventListener('DOMContentLoaded', () => {
  if (roles.length) {
    updateText();
  }
  revealOnScroll();
});
