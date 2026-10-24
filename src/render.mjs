// Renders the one-page site from content/site.json (edited by Samuel in Pages CMS).
// Every image falls back to a labelled placeholder until one is uploaded.

const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Multi-line headings: a new line in the editor becomes a line break on desktop.
const lines = (s = '', brClass = '') => esc(s).split(/\r?\n/).join(brClass ? ` <br class="${brClass}">` : '<br>');
const pad = (n) => String(n).padStart(2, '0');

const placeholder = (label) => `
  <div class="ph" role="img" aria-label="Placeholder: ${esc(label)}">
    <span class="mono accent">+ Add photo</span>
    <span class="mono muted">${esc(label)}</span>
  </div>`;

const image = (src, alt, label, extra = '') =>
  src ? `<img src="${esc(src)}" alt="${esc(alt)}" ${extra}>` : placeholder(label);

const link = (url) => (url ? `href="${esc(url)}" target="_blank" rel="noopener"` : 'href="#" data-placeholder-link');

const vf = (cls = 'vf') => `<div class="${cls}" aria-hidden="true"><i></i><i></i><i></i><i></i></div>`;

const FILTERS = [
  ['all', 'All'], ['films', 'Films'], ['brand', 'Brand content'],
  ['events', 'Events'], ['photography', 'Photography'], ['edits', 'Edits'],
];

export function render(c) {
  const { settings, contact, hero, brands, about, services, work, gear } = c;
  const cta = contact.bookingUrl || (contact.email ? `mailto:${contact.email}` : '#contact');
  const ctaAttrs = `href="${esc(cta)}"${contact.bookingUrl ? ' target="_blank" rel="noopener"' : ''}`;

  // The hero deck always shows at least three cards.
  const deck = [...(hero.photos || [])];
  while (deck.length < 3) deck.push({ image: '', alt: '' });

  const marquee = (c.marquee || []).map((w) => `<span>${esc(w)}</span><span>/</span>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(settings.pageTitle)}</title>
  <meta name="description" content="${esc(settings.description)}">
  <meta name="theme-color" content="#0B0B0A">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@500&family=Mrs+Saint+Delafield&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <!-- ============ NAV ============ -->
  <header class="nav" data-nav>
    <div class="nav__inner">
      <a class="logo" href="#top" aria-label="SA Imagery — home">
        <span class="logo__mark">SA</span>
        <span class="rec-dot" aria-hidden="true"></span>
        <span class="mono muted">Imagery</span>
      </a>

      <nav class="nav__links" aria-label="Primary">
        <a class="mono" href="#work">Work</a>
        <a class="mono" href="#services">Services</a>
        <a class="mono" href="#about">About</a>
        <a class="mono" href="#gear">Gear</a>
        <a class="mono" href="#contact">Contact</a>
      </nav>

      <div class="nav__actions">
        <span class="rec mono" aria-hidden="true">
          <span class="rec-dot rec-dot--blink"></span>
          <span class="accent">Rec</span>
          <span class="muted nav__status">${esc(settings.status)}</span>
        </span>
        <a class="btn btn--accent nav__cta" ${ctaAttrs}>Book a shoot →</a>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
          <span class="sr-only">Open menu</span>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M3 9H25M3 19H17" stroke="currentColor" stroke-width="2"/></svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile menu overlay -->
  <div class="menu" id="menu" hidden data-menu>
    <nav aria-label="Mobile">
      <a href="#about" data-menu-link><span class="mono accent">03</span>About</a>
      <a href="#services" data-menu-link><span class="mono accent">04</span>Services</a>
      <a href="#work" data-menu-link><span class="mono accent">05</span>Work</a>
      <a href="#gear" data-menu-link><span class="mono accent">06</span>Gear</a>
      <a href="#contact" data-menu-link><span class="mono accent">07</span>Contact</a>
    </nav>
    <a class="btn btn--accent btn--block" ${ctaAttrs} data-menu-link>Book a shoot →</a>
  </div>

  <main id="main">
    <!-- ============ HERO ============ -->
    <section class="hero" id="top" aria-label="Introduction">
      <div class="hero__stage">
        <!-- Photo deck: position 0 = front, 1 = back right, 2 = back left, h = hidden in the deck.
             JS rotates the deck every few seconds and on tap. -->
        <div class="hero__deck" data-deck>
${deck.map((p, i) => `          <figure class="card" data-card data-pos="${i < 3 ? i : 'h'}"><div class="card__inner">${image(p.image, p.alt, `Hero photo ${i + 1}`, i === 0 ? 'fetchpriority="high"' : 'loading="lazy"')}</div></figure>`).join('\n')}
        </div>
        <div class="hero__frame" aria-hidden="true" data-frame>
          <div class="hero__progress"></div>
          ${vf()}
          <div class="hud">
            <span class="hud__tl mono"><span class="rec-dot rec-dot--blink"></span>REC <span data-timecode>00:00:00:00</span></span>
            <span class="hud__tr mono">4K · 24P</span>
            <span class="hud__bl mono">ISO 800 &nbsp; F/2.8 &nbsp; 1/50</span>
            <span class="hud__br mono accent">Sony α</span>
            <span class="hud__hint mono accent">Tap ↻</span>
          </div>
        </div>
        <button class="hero__shuffle" type="button" data-shuffle aria-label="Show the next photo"></button>
        <p class="sr-only" aria-live="polite" data-shuffle-status></p>
        <h1 class="hero__name">
          <span class="hero__first">${esc(hero.firstName)}</span>
          <span class="hero__last">${esc(hero.lastName)}</span>
        </h1>
        <p class="hero__script script" aria-hidden="true">${esc(hero.script)}</p>
        <div class="hero__intro hero__intro--desktop">
          <p class="mono accent">( 01 ) — Hello</p>
          <p class="body-l">${esc(hero.intro)}</p>
        </div>
      </div>

      <div class="hero__intro hero__intro--mobile">
        <p class="mono accent">( 01 ) — Hello</p>
        <p class="body-l">${esc(hero.intro)}</p>
        <a class="btn btn--accent btn--block" ${ctaAttrs}>Book a shoot →</a>
      </div>

      <div class="hero__bar">
        <p class="mono hero__roles"><span class="lg-only">${esc(hero.roles)}</span><span class="sm-only">${esc(hero.rolesShort)}</span></p>
        <p class="body-m muted lg-only">${esc(settings.tagline)}</p>
        <a class="mono accent" href="#brands">Scroll ↓</a>
      </div>
    </section>

    <!-- ============ MARQUEE ============ -->
    <div class="marquee" aria-hidden="true">
      <div class="marquee__track">${marquee}${marquee}</div>
    </div>

    <!-- ============ BRANDS ============ -->
    <section class="section" id="brands" aria-labelledby="brands-title">
      <div class="section__head">
        <div>
          <p class="mono accent">( 02 ) — Brands</p>
          <h2 class="t-l" id="brands-title">${lines(brands.title, 'lg-only')}</h2>
        </div>
        <p class="body-m muted section__blurb">${esc(brands.blurb)}</p>
      </div>

      <ul class="brands" role="list">
${(brands.items || []).map((b, i) => `        <li class="brand-card reveal">
          <div class="brand-card__tile" style="background:${esc(b.tileColor || '#ffffff')}">${b.logo ? `<img src="${esc(b.logo)}" alt="${esc(b.name)} logo" loading="lazy">` : `<span class="t-s" style="color:#0b0b0a">${esc(b.name)}</span>`}</div>
          <div class="brand-card__meta"><h3 class="t-s">${esc(b.name)}</h3><span class="mono accent">${pad(i + 1)}</span></div>
          <p class="mono muted">${esc(b.role)}</p>
        </li>`).join('\n')}
      </ul>
    </section>

    <!-- ============ ABOUT ============ -->
    <section class="section section--raised about" id="about" aria-labelledby="about-title">
      <div class="about__visual reveal">
        <div class="about__main">${image(about.photo, about.photoAlt, 'About — portrait', 'loading="lazy"')}</div>
        <figure class="polaroid">
          <div class="polaroid__img">${image(about.polaroid, about.polaroidAlt, 'Polaroid', 'loading="lazy"')}</div>
          <figcaption class="script">${esc(about.polaroidCaption)}</figcaption>
        </figure>
      </div>

      <div class="about__copy">
        <p class="mono accent about__label">( 03 ) — About</p>
        <h2 class="t-l about__title" id="about-title">${lines(about.title)}</h2>
        <div class="about__text">
          <p class="body-l">${esc(about.lead)}</p>
          <p class="body-m muted">${esc(about.body)}</p>
          <ul class="pills" role="list">
${(about.traits || []).map((t) => `            <li class="pill mono">${esc(t)}</li>`).join('\n')}
          </ul>
          <dl class="specs">
${(about.facts || []).map((f) => `            <div class="spec"><dt class="mono muted">${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('\n')}
          </dl>
        </div>
      </div>
    </section>

    <!-- ============ SERVICES ============ -->
    <section class="section services" id="services" aria-labelledby="services-title">
      <div class="section__head">
        <div>
          <p class="mono accent">( 04 ) — Services</p>
          <h2 class="t-l" id="services-title">${lines(services.title)}</h2>
        </div>
        <p class="body-m muted section__blurb">${esc(services.blurb)}</p>
      </div>

      <ul class="services__list" role="list" data-carousel>
${(services.items || []).map((s, i) => `        <li class="service-card">
          <div class="service-card__img">
            ${image(s.image, s.alt, `Service — ${s.title}`, 'loading="lazy"')}
            <span class="mono accent service-card__num">${pad(i + 1)}</span>
            ${vf()}
          </div>
          <h3 class="t-s">${esc(s.title)}</h3>
          <p class="body-m muted">${esc(s.description)}</p>
          <p class="mono accent">${esc(s.deliverables)}</p>
        </li>`).join('\n')}
      </ul>

      <div class="services__foot">
        <p class="mono carousel-count" aria-hidden="true"><span data-carousel-index>01</span> / ${pad((services.items || []).length)}</p>
        <p class="mono accent carousel-hint" aria-hidden="true">Swipe →</p>
        <span class="rule lg-only"></span>
        <a class="btn btn--accent lg-only" ${ctaAttrs}>Book a shoot →</a>
      </div>
    </section>

    <!-- ============ WORK ============ -->
    <section class="section section--raised" id="work" aria-labelledby="work-title">
      <div class="section__head">
        <div>
          <p class="mono accent">( 05 ) — Work</p>
          <h2 class="t-l" id="work-title">${lines(work.title)}</h2>
        </div>
        <p class="body-m muted section__blurb">${esc(work.blurb)}</p>
      </div>

      <div class="filters" role="group" aria-label="Filter work">
${FILTERS.map(([v, l], i) => `        <button class="pill mono${i ? '' : ' is-active'}" type="button" data-filter="${v}" aria-pressed="${!i}">${l}</button>`).join('\n')}
      </div>

      <ul class="work" role="list">
${(work.projects || []).map((p, i) => `        <li class="project${i < 2 ? ' project--lg' : ''}" data-tags="${esc((p.categories || []).join(' '))}">
          <a ${link(p.link)} class="project__link" aria-label="${esc(`${p.title} — ${p.client}`)}">
            <div class="project__thumb">
              ${p.thumbnail ? `<img class="project__img" src="${esc(p.thumbnail)}" alt="" loading="lazy">` : ''}
              <span class="mono muted project__code">SA_${String(i + 1).padStart(3, '0')}</span>
              <span class="mono muted project__tc">00:00:00:00</span>
              ${p.thumbnail ? '' : '<span class="mono muted project__ph">Placeholder · 16:9</span>'}
              <span class="play" aria-hidden="true"><svg width="22" height="24" viewBox="0 0 22 24"><path d="M22 12L0 24V0L22 12Z" fill="currentColor"/></svg></span>
              ${vf('vf vf--dim')}
            </div>
            <div class="project__meta"><h3 class="t-s">${esc(p.title)}</h3><span class="mono accent">${esc(p.year)}</span></div>
            <p class="mono muted">${esc(p.client)}</p>
          </a>
        </li>`).join('\n')}
      </ul>
      <p class="work__empty body-m muted" hidden data-empty>Nothing in this category yet — more coming soon.</p>

      <div class="work__more">
        <a class="btn btn--outline" ${work.allWorkUrl ? link(work.allWorkUrl) : 'href="#work"'}>View all work →</a>
      </div>
    </section>

    <!-- ============ GEAR ============ -->
    <section class="section gear" id="gear" aria-labelledby="gear-title">
      <p class="mono accent gear__label">( 06 ) — Gear</p>
      <h2 class="t-l gear__title" id="gear-title">${lines(gear.title, 'lg-only')}</h2>
      <figure class="gear__visual reveal">
        ${image(gear.photo, gear.photoAlt, 'Gear — camera close-up', 'loading="lazy"')}
        ${vf()}
        <span class="mono gear__shot lg-only">Shot on</span>
        <span class="gear__sony">${esc(gear.badge)}</span>
        <span class="mono accent gear__exif lg-only">ISO 400 &nbsp; F/1.8 &nbsp; 1/100</span>
      </figure>
      <div class="gear__copy">
        <p class="body-l">${esc(gear.body)}</p>
        <dl class="specs">
${(gear.items || []).map((g) => `          <div class="spec"><dt class="mono muted">${esc(g.label)}</dt><dd>${esc(g.value)}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>

    <!-- ============ CONTACT ============ -->
    <section class="section contact" id="contact" aria-labelledby="contact-title">
      <p class="mono accent">( 07 ) — Contact</p>
      <h2 class="contact__title" id="contact-title">
        <span class="contact__l1">Let's work</span>
        <span class="contact__l2">together</span>
        <span class="contact__script script" aria-hidden="true">Book a shoot</span>
      </h2>

      <div class="contact__details">
        <div>
          <p class="mono muted">Email</p>
          ${contact.email ? `<a class="t-s contact__email" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>` : '<p class="t-s">Email coming soon</p>'}
        </div>
        <div>
          <p class="mono muted">Socials</p>
          <ul class="socials" role="list">
${(contact.socials || []).map((s) => `            <li><a class="body-m-medium" ${link(s.url)}>${esc(s.label)} ↗</a></li>`).join('\n')}
          </ul>
        </div>
        <a class="btn btn--accent contact__cta" ${ctaAttrs}>Book a shoot →</a>
      </div>

      <footer class="footer">
        <p class="mono muted">© <span data-year>2026</span> SA Imagery</p>
        <p class="body-m muted footer__tag">${esc(settings.tagline)}</p>
        <a class="mono accent" href="#top">Back to top ↑</a>
      </footer>
    </section>
  </main>

  <script src="js/main.js" defer></script>
</body>
</html>
`;
}
