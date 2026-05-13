/* =========================================================
   SKYNOVA · App
   Phase 0 — Routing + Supabase init + render stubs
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Supabase init ---------- */
  const cfg = window.SKYNOVA_CONFIG || {};
  let supabase = null;
  const isConfigured =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_URL !== 'A_REMPLIR_PAR_MAXIM' &&
    cfg.SUPABASE_ANON_KEY &&
    cfg.SUPABASE_ANON_KEY !== 'A_REMPLIR_PAR_MAXIM';

  if (isConfigured && window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  } else {
    console.info('[skynova] Supabase non configure — phase 0 fonctionne sans BDD. Renseigne config.js plus tard.');
  }
  window.skynova = window.skynova || {};
  window.skynova.supabase = supabase;

  /* ---------- DOM helper ---------- */
  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      for (const k in props) {
        const v = props[k];
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'dataset' && typeof v === 'object') Object.assign(node.dataset, v);
        else if (k.startsWith('on') && typeof v === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (typeof v === 'boolean') {
          if (v) node.setAttribute(k, '');
        } else {
          node.setAttribute(k, v);
        }
      }
    }
    if (children != null) {
      const arr = Array.isArray(children) ? children : [children];
      for (const c of arr) {
        if (c == null || c === false) continue;
        node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
      }
    }
    return node;
  }
  window.skynova.el = el;

  /* ---------- Placeholder util pour la suite (algo scoring) ---------- */
  function getCategoryMedianPrice(/* categoryId */) {
    // Sera implemente en Phase 10 quand la BDD sera seedee.
    return null;
  }
  window.skynova.getCategoryMedianPrice = getCategoryMedianPrice;

  /* ---------- Page stub generator ---------- */
  function stub(label, sub) {
    const wrap = el('section', { class: 'page-stub anim-fade-in-up' }, [
      el('span', { class: 'overline' }, '· ' + label.toUpperCase() + ' ·'),
      el('h1', null, [
        label + ' ',
        el('span', { class: 'lime' }, '— en construction')
      ]),
      el('p', { class: 'body-lg' }, sub)
    ]);
    return wrap;
  }

  /* ---------- Phase 1 — Hero (landing) ---------- */

  // SVG gauge avec stroke-dasharray anime via CSS (800ms ease-out).
  function renderGauge(value, opts) {
    opts = opts || {};
    const size   = opts.size  || 80;
    const stroke = opts.stroke || 6;
    const tone   = opts.tone  || 'lime';
    const delay  = opts.delay || 0;
    const v = Math.max(0, Math.min(100, value));
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const target = c * (1 - v / 100);

    const wrap = el('div', {
      class: 'gauge gauge--' + tone,
      style: { width: size + 'px', height: size + 'px' },
      role: 'img',
      'aria-label': 'Score ' + Math.round(v) + ' sur 100'
    });
    wrap.style.setProperty('--gauge-c', c);
    wrap.style.setProperty('--gauge-target', target);
    wrap.style.setProperty('--gauge-delay', delay + 'ms');

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('class', 'gauge__svg');
    svg.setAttribute('aria-hidden', 'true');

    const cx = size / 2;
    const cy = size / 2;
    const track = document.createElementNS(NS, 'circle');
    track.setAttribute('cx', cx); track.setAttribute('cy', cy); track.setAttribute('r', r);
    track.setAttribute('class', 'gauge__track');
    const progress = document.createElementNS(NS, 'circle');
    progress.setAttribute('cx', cx); progress.setAttribute('cy', cy); progress.setAttribute('r', r);
    progress.setAttribute('class', 'gauge__progress');

    svg.appendChild(track);
    svg.appendChild(progress);
    wrap.appendChild(svg);
    wrap.appendChild(
      el('div', { class: 'gauge__center' }, [
        el('span', { class: 'gauge__num' }, String(Math.round(v)))
      ])
    );
    return wrap;
  }
  window.skynova.renderGauge = renderGauge;

  function gaugeBlock(label, value, tone, delay) {
    return el('div', { class: 'gauge-block' }, [
      el('span', { class: 'overline gauge-block__label' }, label),
      renderGauge(value, { size: 80, tone: tone, delay: delay })
    ]);
  }

  function renderHeroMockup() {
    return el('article', { class: 'hero-card', 'aria-label': 'Exemple de fiche produit decodee' }, [
      el('div', { class: 'hero-card__image' }, [
        el('div', { class: 'hero-card__image-top' }, [
          el('span', { class: 'mono hero-card__image-tag' }, 'REF · SKY-001'),
          el('span', { class: 'mono hero-card__image-tag' }, '03 · 05 · 26')
        ]),
        el('div', { class: 'hero-card__mark', 'aria-hidden': 'true' }, 'ASH'),
        el('div', { class: 'hero-card__image-bottom' }, [
          el('span', { class: 'mono hero-card__image-tag' }, '600 MG · KSM-66'),
          el('span', { class: 'mono hero-card__image-tag' }, '60 GÉL')
        ])
      ]),
      el('div', { class: 'hero-card__body' }, [
        el('span', { class: 'overline hero-card__brand' }, '· Nutripure ·'),
        el('h3', { class: 'hero-card__name' }, 'Ashwagandha KSM-66'),
        el('div', { class: 'hero-card__pills' }, [
          el('span', { class: 'pill pill--mercury' }, 'Sommeil'),
          el('span', { class: 'pill' }, 'Stress')
        ]),
        el('div', { class: 'hero-card__price-row' }, [
          el('span', { class: 'hero-card__price' }, '29,90 €'),
          el('span', { class: 'hero-card__servings' }, '0,49 € / dose')
        ]),
        el('div', { class: 'hero-card__gauges' }, [
          gaugeBlock('Efficacité', 89, 'lime',    500),
          gaugeBlock('Prix',        71, 'mercury', 650)
        ])
      ])
    ]);
  }

  function heroSection() {
    return el('section', { class: 'hero' }, [
      el('div', { class: 'hero__container' }, [
        el('div', { class: 'hero__left' }, [
          el('span', { class: 'overline hero__overline' }, '· ENQUÊTE INDÉPENDANTE EN COURS ·'),
          el('h1', { class: 'hero__title' }, [
            el('span', { class: 'hero__title-line' }, 'Tu sais ce que tu achètes,'),
            el('span', { class: 'hero__title-line hero__title-line--lime' }, 'vraiment ?')
          ]),
          el('p', { class: 'hero__sub' }, "Skynova décode 15 000 compléments alimentaires. Score d'efficacité, prix au gramme de principe actif, alternatives recommandées. En 3 secondes."),
          el('div', { class: 'hero__ctas' }, [
            el('a', { href: '#auth',   class: 'cta cta--primary'   }, 'Commencer gratuit'),
            el('a', { href: '#search', class: 'cta cta--secondary' }, 'Voir un rapport →')
          ]),
          el('div', { class: 'hero__trust' }, [
            el('span', { class: 'overline hero__trust-label' }, '· Mentionnés par ·'),
            el('div', { class: 'hero__trust-logos' }, [
              el('span', { class: 'hero__trust-logo hero__trust-logo--serif' }, 'Le Monde'),
              el('span', { class: 'hero__trust-logo hero__trust-logo--bold'  }, 'Que Choisir'),
              el('span', { class: 'hero__trust-logo hero__trust-logo--mono'  }, 'France Inter')
            ])
          ])
        ]),
        el('div', { class: 'hero__right' }, [
          renderHeroMockup()
        ])
      ])
    ]);
  }

  /* ---------- Phase 2 — Section "Le probleme" + stats ---------- */
  function statCard(opts) {
    const card = el('article', {
      class: 'stat-card',
      dataset: {
        count: String(opts.value),
        prefix: opts.prefix || '',
        suffix: opts.suffix || ''
      }
    }, [
      el('div', { class: 'stat-card__num-wrap' }, [
        opts.prefix ? el('span', { class: 'stat-card__num-affix mono' }, opts.prefix) : null,
        el('span', { class: 'stat-card__num stat-card__num-value mono' }, '0'),
        opts.suffix ? el('span', { class: 'stat-card__num-affix mono' }, opts.suffix) : null
      ]),
      el('span', { class: 'overline stat-card__tag' }, opts.overline),
      el('p', { class: 'stat-card__label' }, opts.label),
      el('span', { class: 'stat-card__src mono' }, opts.source)
    ]);
    return card;
  }

  function problemSection() {
    return el('section', { class: 'problem' }, [
      el('div', { class: 'problem__container' }, [
        el('header', { class: 'problem__header' }, [
          el('span', { class: 'overline' }, '· LE PROBLÈME ·'),
          el('h2', { class: 'problem__title' }, [
            el('span', { class: 'problem__title-line' }, "L'industrie pèse 2,92 milliards d'euros. "),
            el('span', { class: 'problem__title-line problem__title-mute' }, "90% des consommateurs ne savent pas lire une étiquette.")
          ])
        ]),
        el('div', { class: 'problem__stats' }, [
          statCard({
            value: 61, suffix: ' %',
            overline: '· Marché ·',
            label: 'des Français consomment des compléments alimentaires au moins une fois par an.',
            source: 'Synadiet 2024'
          }),
          statCard({
            value: 90, suffix: ' %',
            overline: '· Lecture ·',
            label: "ne savent pas évaluer la qualité réelle d'un produit qu'ils achètent en pharmacie.",
            source: 'Enquête CLCV'
          }),
          statCard({
            value: 212, suffix: ' €',
            overline: '· Budget ·',
            label: 'dépensés en moyenne chaque année et par foyer en compléments alimentaires.',
            source: 'Xerfi · Marché FR 2024'
          })
        ])
      ])
    ]);
  }

  function renderHome() {
    const frag = document.createDocumentFragment();
    frag.appendChild(heroSection());
    frag.appendChild(problemSection());
    return frag;
  }

  /* ---------- Count-up animation (scroll-into-view) ---------- */
  function setupCountUp(root) {
    const targets = root.querySelectorAll('[data-count]');
    if (!targets.length) return;

    const animate = (host) => {
      const target = parseFloat(host.dataset.count);
      const prefix = host.dataset.prefix || '';
      const suffix = host.dataset.suffix || '';
      const numEl = host.querySelector('.stat-card__num-value');
      if (!numEl) return;
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.round(target * eased);
        numEl.textContent = String(current);
        if (t < 1) requestAnimationFrame(tick);
        else numEl.textContent = String(Math.round(target));
        // prefix/suffix are siblings (rendered separately), no need to touch them here
        void prefix; void suffix;
      }
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });
      targets.forEach((t) => io.observe(t));
    } else {
      targets.forEach(animate);
    }
  }
  window.skynova.setupCountUp = setupCountUp;

  /* ---------- Renderers ---------- */
  const RENDERERS = {
    home:         renderHome,
    methodologie: () => stub('Methodologie', 'Page editoriale — Phase 6.'),
    decode:       () => stub('Le Decode',    'Blog editorial — Phase 6.'),
    categories:   () => stub('Categories',   'Hub des 7 univers — Phase 6.'),
    manifesto:    () => stub('Manifesto',    'Manifeste de marque — Phase 6.'),
    pricing:      () => stub('Pricing',      'Plans Free / Premium / Pro — Phase 6.'),
    auth:         () => stub('Auth',         'Login + Signup — Phase 7.'),
    onboarding:   () => stub('Onboarding',   'Modal 4 etapes — Phase 7.'),
    lab:          () => stub('Mon Lab',      'Dashboard personnel — Phase 8.'),
    scan:         () => stub('Scan',         'Cadre laser anime — Phase 8.'),
    search:       () => stub('Recherche',    'Exploration BDD — Phase 9.'),
    product:      (params) => stub('Fiche produit', 'Fiche complete — Phase 9. ID demande : ' + (params[0] || '—'))
  };
  window.skynova.renderers = RENDERERS;

  /* ---------- Routing ---------- */
  function route() {
    const raw = (window.location.hash || '').replace(/^#/, '');
    const parts = raw.split('/').filter(Boolean);
    const pageId = parts[0] || 'home';
    const params = parts.slice(1);

    const renderer = RENDERERS[pageId] || RENDERERS.home;
    const app = document.getElementById('app');
    if (!app) return;

    app.classList.remove('anim-fade-in');
    void app.offsetWidth;
    app.innerHTML = '';
    app.appendChild(renderer(params));
    app.classList.add('anim-fade-in');

    setupCountUp(app);

    document.querySelectorAll('.site-nav__link, .mobile-drawer__link').forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('is-active', href === '#' + pageId);
    });

    closeDrawer();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'auto' : 'auto' });

    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }
  window.skynova.route = route;

  /* ---------- Header scroll behavior ---------- */
  function setupHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile drawer ---------- */
  function closeDrawer() {
    const drawer = document.getElementById('mobileDrawer');
    const btn = document.getElementById('burgerBtn');
    if (!drawer || !btn) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function setupBurger() {
    const btn = document.getElementById('burgerBtn');
    const drawer = document.getElementById('mobileDrawer');
    if (!btn || !drawer) return;
    btn.addEventListener('click', () => {
      const open = drawer.classList.toggle('is-open');
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    setupHeaderScroll();
    setupBurger();
    route();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('hashchange', route);
})();
