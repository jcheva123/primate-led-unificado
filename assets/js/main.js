const nav = document.querySelector('.site-nav');
const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');
const year = document.querySelector('#year');

const setNavState = () => nav?.classList.toggle('scrolled', window.scrollY > 18);
setNavState();
window.addEventListener('scroll', setNavState, { passive: true });

if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -45px' });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

if (year) year.textContent = new Date().getFullYear();
