function sopt(el) {
  document.querySelectorAll('#so .sf-opt').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('sn').classList.add('ok');
}

// ④ Scroll fade-in observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Header blur on scroll
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 80);
});

// Mobile CTA bar
const bar = document.getElementById('mcta');
if (bar) {
  window.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) {
      bar.style.transform = window.scrollY > 600 ? 'translateY(0)' : 'translateY(100%)';
    }
  });
}
