// SA Imagery — small progressive enhancements. The page works without JS.
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Nav: solid background once the page scrolls ----------
const nav = document.querySelector('[data-nav]');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ---------- Mobile menu ----------
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');

function setMenu(open) {
  menu.hidden = !open;
  nav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
  document.body.style.overflow = open ? 'hidden' : '';
}

menuToggle.addEventListener('click', () => setMenu(menu.hidden));
menu.querySelectorAll('[data-menu-link]').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
window.matchMedia('(min-width: 1100px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

// ---------- Running timecode in the hero viewfinder (HH:MM:SS:FF @ 24fps) ----------
const timecodes = document.querySelectorAll('[data-timecode]');
let start = performance.now() - 84_500; // start the "recording" at ~00:01:24
const pad = (n) => String(n).padStart(2, '0');

function tick(now) {
  const frames = Math.floor(((now - start) / 1000) * 24);
  const ff = frames % 24;
  const s = Math.floor(frames / 24);
  const text = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(ff)}`;
  timecodes.forEach((el) => { el.textContent = text; });
  if (!reduceMotion) requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---------- Hero photo deck: auto-shuffle + tap to shuffle ----------
const stage = document.querySelector('.hero__stage');
const deck = [...document.querySelectorAll('[data-card]')];
const frame = document.querySelector('[data-frame]');
const shuffleBtn = document.querySelector('[data-shuffle]');
const shuffleStatus = document.querySelector('[data-shuffle-status]');

// The front card goes to the back of the deck; the rest move up one slot.
function shuffle(manual = false) {
  deck.push(deck.shift());
  deck.forEach((card, i) => { card.dataset.pos = i < 3 ? String(i) : 'h'; });
  frame.classList.remove('is-cut', 'is-playing');
  void frame.offsetWidth; // restart the cut + progress animations
  frame.classList.add('is-cut');
  start = performance.now() - (5 + Math.random() * 120) * 1000; // new "clip", new timecode
  if (reduceMotion) requestAnimationFrame(tick);
  if (manual) shuffleStatus.textContent = `Now showing: ${deck[0].querySelector('img').alt}`;
  restartAuto();
}
shuffleBtn.addEventListener('click', () => shuffle(true));

// Auto-shuffle: a new shot every few seconds while the hero is on screen.
// Pauses while keyboard-focused, when scrolled away or the tab is hidden; off for reduced motion.
const AUTO_MS = 2000;
frame.style.setProperty('--auto', `${AUTO_MS}ms`);
let autoTimer = null;
let heroVisible = true;
let held = false;

function restartAuto() {
  clearTimeout(autoTimer);
  frame.classList.remove('is-playing');
  if (reduceMotion || !heroVisible || held || document.hidden) return;
  void frame.offsetWidth;
  frame.classList.add('is-playing');
  autoTimer = setTimeout(() => shuffle(), AUTO_MS);
}

new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; restartAuto(); }, { threshold: 0.35 }).observe(stage);
document.addEventListener('visibilitychange', restartAuto);
// Only keyboard focus holds the deck (a mouse click or tap focuses the button too, but shouldn't pause it).
shuffleBtn.addEventListener('focus', () => { held = shuffleBtn.matches(':focus-visible'); restartAuto(); });
shuffleBtn.addEventListener('blur', () => { held = false; restartAuto(); });

// ---------- Services carousel counter (mobile) ----------
const carousel = document.querySelector('[data-carousel]');
const carouselIndex = document.querySelector('[data-carousel-index]');
if (carousel && carouselIndex) {
  const cards = [...carousel.children];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) carouselIndex.textContent = pad(cards.indexOf(entry.target) + 1);
    });
  }, { root: carousel, threshold: 0.6 });
  cards.forEach((card) => io.observe(card));
}

// ---------- Work filters ----------
const filterButtons = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('.project');
const empty = document.querySelector('[data-empty]');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterButtons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    let shown = 0;
    projects.forEach((p) => {
      const match = filter === 'all' || p.dataset.tags.split(' ').includes(filter);
      p.classList.toggle('is-hidden', !match);
      if (match) shown += 1;
    });
    empty.hidden = shown > 0;
  });
});

// Placeholder links (no URL added in the editor yet) shouldn't jump to the top of the page
document.querySelectorAll('[data-placeholder-link]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

// ---------- Highlight the current section in the nav ----------
const navLinks = [...document.querySelectorAll('.nav__links a')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const sectionIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((s) => sectionIO.observe(s));

// ---------- Reveal on scroll ----------
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      revealIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));

// ---------- Footer year ----------
document.querySelector('[data-year]').textContent = new Date().getFullYear();
