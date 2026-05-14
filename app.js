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
        el('span', {
          class: 'gauge__num',
          dataset: { target: String(Math.round(v)) }
        }, '0')
      ])
    );
    return wrap;
  }
  window.skynova.renderGauge = renderGauge;

  /* ---------- Premium · Mission 4 — Gauge fill + sync number ---------- */
  function initGauges(root) {
    root = root || document;
    const gauges = root.querySelectorAll('.gauge');
    if (!gauges.length) return;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function animateNum(gauge) {
      const numEl = gauge.querySelector('.gauge__num');
      if (!numEl || numEl.dataset.animated) return;
      numEl.dataset.animated = 'true';
      const target = parseFloat(numEl.dataset.target || numEl.textContent || '0');
      if (isNaN(target)) return;
      const delayStr = gauge.style.getPropertyValue('--gauge-delay') || '0ms';
      const delay = parseInt(delayStr, 10) || 0;
      const duration = 800;

      numEl.textContent = '0';
      setTimeout(function () {
        const start = performance.now();
        function step(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = easeOutCubic(t);
          numEl.textContent = String(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(step);
          else numEl.textContent = String(Math.round(target));
        }
        requestAnimationFrame(step);
      }, delay);
    }

    function trigger(gauge) {
      if (gauge.classList.contains('is-in-view')) return;
      gauge.classList.add('is-in-view');
      animateNum(gauge);
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          trigger(entry.target);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      gauges.forEach(function (g) { io.observe(g); });
    } else {
      gauges.forEach(trigger);
    }
  }
  window.skynova.initGauges = initGauges;

  function gaugeBlock(label, value, tone, delay) {
    return el('div', { class: 'gauge-block' }, [
      el('span', { class: 'overline gauge-block__label' }, label),
      renderGauge(value, { size: 80, tone: tone, delay: delay })
    ]);
  }

  /* ---------- Premium · Mission 5 — Hero mockup cycle ---------- */
  const HERO_CYCLE_IDS = ['ash', 'whe', 'col', 'prb'];
  let heroCycleIndex = 0;
  let heroCycleInterval = null;

  function buildHeroMockupChildren(productId, opts) {
    opts = opts || {};
    const delayBase = opts.delayBase != null ? opts.delayBase : 500;
    const p = getProductById(productId);
    if (!p) return [];

    return [
      el('div', { class: 'hero-card__image' }, [
        el('div', { class: 'hero-card__image-top' }, [
          el('span', { class: 'mono hero-card__image-tag' }, 'REF · SKY-' + p.id.toUpperCase()),
          el('span', { class: 'mono hero-card__image-tag' }, '14 · 05 · 26')
        ]),
        el('div', { class: 'hero-card__mark', 'aria-hidden': 'true' }, p.mark),
        el('div', { class: 'hero-card__image-bottom' }, [
          el('span', { class: 'mono hero-card__image-tag' }, p.activeDose + ' / DOSE'),
          el('span', { class: 'mono hero-card__image-tag' }, p.servings + ' DOSES')
        ])
      ]),
      el('div', { class: 'hero-card__body' }, [
        el('span', { class: 'overline hero-card__brand' }, '· ' + p.brand + ' ·'),
        el('h3', { class: 'hero-card__name' }, p.name),
        el('div', { class: 'hero-card__pills' },
          p.badges.map(function (b) {
            return el('span', { class: 'pill' + (b.tone ? ' pill--' + b.tone : '') }, b.label);
          })
        ),
        el('div', { class: 'hero-card__price-row' }, [
          el('span', { class: 'hero-card__price' }, p.price.toFixed(2).replace('.', ',') + ' €'),
          el('span', { class: 'hero-card__servings' }, p.pricePerDose)
        ]),
        el('div', { class: 'hero-card__gauges' }, [
          gaugeBlock('Efficacité', p.scoreEfficacy, 'lime',    delayBase),
          gaugeBlock('Prix',       p.scorePrice,    'mercury', delayBase + 150)
        ])
      ])
    ];
  }

  function renderHeroMockup() {
    heroCycleIndex = 0;
    return el(
      'article',
      { class: 'hero-card', 'aria-label': 'Exemple de fiche produit décodée' },
      buildHeroMockupChildren(HERO_CYCLE_IDS[0], { delayBase: 500 })
    );
  }

  function cycleHeroMockup() {
    const card = document.querySelector('.hero-card');
    if (!card) { stopHeroCycle(); return; }
    heroCycleIndex = (heroCycleIndex + 1) % HERO_CYCLE_IDS.length;
    const nextId = HERO_CYCLE_IDS[heroCycleIndex];

    card.classList.add('is-cycling');
    setTimeout(function () {
      card.innerHTML = '';
      const children = buildHeroMockupChildren(nextId, { delayBase: 100 });
      children.forEach(function (c) { card.appendChild(c); });
      card.classList.remove('is-cycling');
      initGauges(card);
    }, 300);
  }

  function startHeroCycle() {
    stopHeroCycle();
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    heroCycleInterval = setInterval(cycleHeroMockup, 6000);
  }

  function stopHeroCycle() {
    if (heroCycleInterval) {
      clearInterval(heroCycleInterval);
      heroCycleInterval = null;
    }
  }
  window.skynova.heroCycle = { start: startHeroCycle, stop: stopHeroCycle };

  function heroSection() {
    return el('section', { class: 'hero' }, [
      el('div', { class: 'hero__container' }, [
        el('div', { class: 'hero__left' }, [
          el('span', { class: 'overline hero__overline' }, '· ENQUÊTE INDÉPENDANTE EN COURS ·'),
          el('h1', { class: 'hero__title' }, [
            el('span', { class: 'hero__title-line' }, 'Tu sais ce que tu achètes,'),
            el('span', { class: 'hero__title-line hero__title-line--lime' }, 'vraiment ?')
          ]),
          el('p', { class: 'hero__sub' }, [
            'Skynova décode ',
            el('span', { dataset: { counter: '15000', separator: 'true' } }, '0'),
            ' compléments alimentaires. Score d\'efficacité, prix au gramme de principe actif, alternatives recommandées. En 3 secondes.'
          ]),
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

  /* ---------- Phase 3 — Comment ca marche ---------- */
  function howCard(opts) {
    return el('article', {
      class: 'how-card',
      dataset: { step: opts.step }
    }, [
      el('div', { class: 'how-card__bg-num mono', 'aria-hidden': 'true' }, opts.step),
      el('div', { class: 'how-card__content' }, [
        el('span', { class: 'overline mono how-card__tag' }, '· ' + opts.step + ' · ' + opts.title + ' ·'),
        el('div', { class: 'how-card__icon' }, [
          el('i', { 'data-lucide': opts.icon })
        ]),
        el('h3', { class: 'how-card__title' }, opts.title),
        el('p', { class: 'how-card__desc' }, opts.desc),
        el('ul', { class: 'how-card__bullets mono' },
          opts.bullets.map(function (b) { return el('li', null, '· ' + b); })
        )
      ])
    ]);
  }

  function howSection() {
    return el('section', { class: 'how' }, [
      el('div', { class: 'how__container' }, [
        el('header', { class: 'how__header' }, [
          el('span', { class: 'overline' }, '· COMMENT ÇA MARCHE ·'),
          el('h2', { class: 'how__title' }, [
            '3 étapes pour reprendre ',
            el('span', { class: 'how__title-lime' }, 'le contrôle'),
            ' de ce que tu consommes.'
          ])
        ]),
        el('div', { class: 'how__steps' }, [
          howCard({
            step: '01',
            title: 'Scan',
            icon: 'scan-line',
            desc: "Photographie l'étiquette ou scanne le code-barres. Skynova lit, décortique, extrait chaque ingrédient et chaque dosage en moins de 3 secondes.",
            bullets: ['Code-barres EAN-13', 'Photo étiquette', 'Recherche manuelle']
          }),
          howCard({
            step: '02',
            title: 'Décode',
            icon: 'gauge',
            desc: "On calcule un score d'efficacité et un score prix en croisant dosage, pureté, certifications et coût au gramme de principe actif. Sans compromis.",
            bullets: ['Dosage vs RDA', 'Pureté & additifs', 'Prix au mg actif']
          }),
          howCard({
            step: '03',
            title: 'Switch',
            icon: 'refresh-cw',
            desc: "3 alternatives recommandées : mieux dosées, plus pures ou moins chères. Économise jusqu'à 40 % à efficacité équivalente.",
            bullets: ['Top efficacité', 'Meilleur €/mg', 'Mieux noté communauté']
          })
        ])
      ])
    ]);
  }

  /* ---------- Phase 4 — Demo interactive ---------- */
  const DEMO_PRODUCTS = {
    whey: {
      id: 'whey',
      brand: 'Nutripure',
      name: 'Whey Native Isolat',
      mark: 'WHE',
      refNum: '042',
      spec: '900 G · 25 G/DOSE',
      pills: [
        { label: 'Sport',       tone: 'lime' },
        { label: 'Performance', tone: '' }
      ],
      price: '39,90 €',
      pricePerDose: '1,11 € / dose',
      efficacy: 92,
      priceScore: 76,
      alternatives: [
        { brand: 'MyProtein',   name: 'Impact Whey Isolate', price: '32,90 €', score: 84, mark: 'MYP', tone: 'lime' },
        { brand: 'Nutrimuscle', name: 'Whey Isolate Native', price: '44,50 €', score: 88, mark: 'NTM', tone: 'lime' },
        { brand: 'Bulk',        name: 'Whey Isolate 90',     price: '29,90 €', score: 79, mark: 'BLK', tone: 'mercury' }
      ]
    },
    melatonine: {
      id: 'melatonine',
      brand: 'Apyforme',
      name: 'Mélatonine 1,9 mg',
      mark: 'MLT',
      refNum: '118',
      spec: '60 GÉL · 1,9 MG',
      pills: [
        { label: 'Sommeil', tone: 'mercury' },
        { label: 'Stress',  tone: '' }
      ],
      price: '14,90 €',
      pricePerDose: '0,25 € / dose',
      efficacy: 84,
      priceScore: 88,
      alternatives: [
        { brand: 'Nutrimea', name: 'Mélatonine Bio 1,9', price: '12,90 €', score: 81, mark: 'NMA', tone: 'mercury' },
        { brand: 'D-Lab',    name: 'Mélatonine Pure',    price: '19,90 €', score: 86, mark: 'DLB', tone: 'lime' },
        { brand: 'Solgar',   name: 'Melatonin 1 mg',     price: '16,50 €', score: 78, mark: 'SLG', tone: 'mercury' }
      ]
    },
    probiotique: {
      id: 'probiotique',
      brand: 'D-Lab',
      name: 'Probio Daily 10M UFC',
      mark: 'PRB',
      refNum: '203',
      spec: '30 GÉL · 10 SOUCHES',
      pills: [
        { label: 'Digestion',  tone: 'lime' },
        { label: 'Microbiote', tone: '' }
      ],
      price: '34,90 €',
      pricePerDose: '1,16 € / dose',
      efficacy: 86,
      priceScore: 64,
      alternatives: [
        { brand: 'Nutripure',     name: 'Probio Daily 10M', price: '27,90 €', score: 82, mark: 'NTP', tone: 'lime' },
        { brand: 'Lab Lescuyer',  name: 'Probiotiques 5M',  price: '22,50 €', score: 74, mark: 'LSC', tone: 'amber' },
        { brand: 'Apyforme',      name: 'Microflore +',     price: '24,90 €', score: 79, mark: 'APY', tone: 'mercury' }
      ]
    }
  };

  function altCard(alt) {
    return el('article', { class: 'alt-card' }, [
      el('div', { class: 'alt-card__image' }, [
        el('span', { class: 'alt-card__mark mono' }, alt.mark)
      ]),
      el('div', { class: 'alt-card__body' }, [
        el('span', { class: 'overline alt-card__brand' }, '· ' + alt.brand + ' ·'),
        el('h4', { class: 'alt-card__name' }, alt.name),
        el('div', { class: 'alt-card__bottom' }, [
          el('span', { class: 'alt-card__price mono' }, alt.price),
          el('span', { class: 'alt-card__score alt-card__score--' + (alt.tone || 'lime') }, [
            el('span', { class: 'alt-card__score-num mono' }, String(alt.score)),
            el('span', { class: 'alt-card__score-suffix mono' }, '/100')
          ])
        ])
      ])
    ]);
  }

  function buildDemoPanelInner(p) {
    return el('div', { class: 'demo__panel-inner' }, [
      el('div', { class: 'demo__product' }, [
        el('div', { class: 'demo__product-image' }, [
          el('div', { class: 'demo__product-image-top' }, [
            el('span', { class: 'mono demo__image-tag' }, 'REF · SKY-' + p.refNum),
            el('span', { class: 'mono demo__image-tag demo__image-tag--live' }, [
              el('span', { class: 'demo__live-dot', 'aria-hidden': 'true' }),
              'LIVE'
            ])
          ]),
          el('div', { class: 'demo__product-mark mono', 'aria-hidden': 'true' }, p.mark),
          el('div', { class: 'demo__product-image-bottom' }, [
            el('span', { class: 'mono demo__image-tag' }, p.spec),
            el('span', { class: 'mono demo__image-tag' }, 'SCAN OK')
          ])
        ]),
        el('div', { class: 'demo__product-body' }, [
          el('span', { class: 'overline demo__product-brand' }, '· ' + p.brand + ' ·'),
          el('h3', { class: 'demo__product-name' }, p.name),
          el('div', { class: 'demo__product-pills' },
            p.pills.map(function (pi) {
              return el('span', { class: 'pill' + (pi.tone ? ' pill--' + pi.tone : '') }, pi.label);
            })
          ),
          el('div', { class: 'demo__product-price-row' }, [
            el('span', { class: 'demo__product-price mono' }, p.price),
            el('span', { class: 'demo__product-price-per mono' }, p.pricePerDose)
          ]),
          el('div', { class: 'demo__gauges' }, [
            gaugeBlock('Efficacité', p.efficacy,  'lime',     80),
            gaugeBlock('Prix',        p.priceScore, 'mercury', 220)
          ])
        ])
      ]),
      el('div', { class: 'demo__alternatives' }, [
        el('span', { class: 'overline demo__alt-title' }, '· 3 ALTERNATIVES RECOMMANDÉES ·'),
        el('div', { class: 'demo__alt-grid' }, p.alternatives.map(altCard))
      ])
    ]);
  }

  function switchBtn(id, label, icon, active) {
    return el('button', {
      class: 'demo-switch' + (active ? ' is-active' : ''),
      type: 'button',
      dataset: { product: id }
    }, [
      el('i', { 'data-lucide': icon, class: 'demo-switch__icon' }),
      el('span', { class: 'demo-switch__label' }, label)
    ]);
  }

  function switchDemoProduct(panel, switcher, newId) {
    if (panel.dataset.current === newId) return;
    if (panel.classList.contains('is-loading')) return;
    panel.classList.add('is-loading');
    setTimeout(function () {
      panel.innerHTML = '';
      panel.appendChild(buildDemoPanelInner(DEMO_PRODUCTS[newId]));
      panel.dataset.current = newId;
      panel.classList.remove('is-loading');
      switcher.querySelectorAll('.demo-switch').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.product === newId);
      });
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
      initGauges(panel);
    }, 150);
  }

  function demoSection() {
    const section = el('section', { class: 'demo' });

    section.appendChild(
      el('header', { class: 'demo__header' }, [
        el('span', { class: 'overline' }, '· DÉMO LIVE ·'),
        el('h2', { class: 'demo__title' }, [
          'Une fiche, ',
          el('span', { class: 'demo__title-lime' }, 'en 3 secondes.')
        ]),
        el('p', { class: 'demo__sub' }, 'Clique sur un produit ci-dessous pour voir comment Skynova le décode en temps réel.')
      ])
    );

    const panel = el('div', { class: 'demo__panel', dataset: { current: 'whey' } });
    panel.appendChild(buildDemoPanelInner(DEMO_PRODUCTS.whey));
    section.appendChild(panel);

    const switcher = el('div', { class: 'demo__switcher' }, [
      el('span', { class: 'overline demo__switcher-label' }, '· ESSAYE UN AUTRE PRODUIT ·'),
      el('div', { class: 'demo__switcher-buttons', role: 'tablist' }, [
        switchBtn('whey',        'Whey',         'dumbbell', true),
        switchBtn('melatonine',  'Mélatonine',   'moon',     false),
        switchBtn('probiotique', 'Probiotiques', 'pill',     false)
      ])
    ]);

    switcher.addEventListener('click', function (e) {
      const btn = e.target.closest('.demo-switch');
      if (!btn) return;
      const id = btn.dataset.product;
      if (!DEMO_PRODUCTS[id]) return;
      switchDemoProduct(panel, switcher, id);
    });

    section.appendChild(switcher);
    return section;
  }

  /* ---------- Phase 5 — Sections restantes de la landing ---------- */

  /* ----- Categories ----- */
  const CATEGORIES = [
    { id: 'vitality',   name: 'Vitalité & immunité',     desc: 'Vitamines, magnésium, spiruline, échinacée. La base de tout.',   icon: 'zap',       share: '25 %' },
    { id: 'sleep',      name: 'Sommeil & stress',         desc: 'Mélatonine, ashwagandha, valériane, GABA. Recharger la nuit.',   icon: 'moon',      share: '20 %' },
    { id: 'digestion',  name: 'Digestion & transit',      desc: 'Probiotiques, psyllium, charbon, enzymes digestives.',           icon: 'leaf',      share: '15 %' },
    { id: 'beauty',     name: 'Beauté & nutricosmétique', desc: 'Collagène, biotine, kératine, acide hyaluronique. Peau et cheveux.', icon: 'sparkles', share: '12 %' },
    { id: 'joints',     name: 'Santé articulaire',        desc: 'Curcumine, glucosamine, chondroïtine, MSM, harpagophyte.',       icon: 'shield',    share: '10 %' },
    { id: 'sport',      name: 'Sport & performance',      desc: 'Whey, créatine, BCAA, beta-alanine, caféine.',                   icon: 'dumbbell',  share: '8 %'  },
    { id: 'targeted',   name: 'Santé ciblée',             desc: 'Ginkgo, lutéine, canneberge, oméga-3, vitamine D.',              icon: 'target',    share: '10 %' }
  ];

  function catCard(cat) {
    return el('a', {
      class: 'cat-card',
      href: '#categories',
      dataset: { cat: cat.id }
    }, [
      el('div', { class: 'cat-card__icon' }, [ el('i', { 'data-lucide': cat.icon }) ]),
      el('div', { class: 'cat-card__body' }, [
        el('h3', { class: 'cat-card__name' }, cat.name),
        el('p', { class: 'cat-card__desc' }, cat.desc)
      ]),
      el('div', { class: 'cat-card__foot' }, [
        el('span', { class: 'cat-card__share mono' }, cat.share),
        el('span', { class: 'overline cat-card__share-label' }, 'du marché')
      ])
    ]);
  }

  function categoriesSection() {
    return el('section', { class: 'categories' }, [
      el('header', { class: 'categories__header' }, [
        el('span', { class: 'overline' }, '· 7 UNIVERS COUVERTS ·'),
        el('h2', { class: 'categories__title' }, [
          'Tout ce que tu peux acheter, ',
          el('span', { class: 'categories__title-lime' }, 'décodé.')
        ]),
        el('p', { class: 'categories__sub' }, '2 800 références couvrant les 7 grandes familles de compléments alimentaires vendus en France.')
      ]),
      el('div', { class: 'categories__grid' }, CATEGORIES.map(catCard))
    ]);
  }

  /* ----- Temoignages ----- */
  const TESTIMONIALS = [
    {
      quote: "J'achetais du collagène à 39 € depuis 3 ans sans rien y connaître. Skynova m'a montré que je payais pour un produit dosé à 60 % seulement, alors qu'une alternative à 28 € était dosée à 92 %. Switch fait.",
      author: 'Léa M.',
      role: 'Consommatrice · Lyon',
      tag: 'BEAUTÉ · COLLAGÈNE'
    },
    {
      quote: "Je prends de la whey depuis 6 ans, j'avais ma marque fétiche que je jugeais 'premium'. Score Skynova : 71. L'alternative qu'ils recommandent : 89, à 5 € de moins. La méthodologie est béton, je ne reviens pas en arrière.",
      author: 'Thomas B.',
      role: 'Coach sportif · Paris',
      tag: 'SPORT · WHEY'
    },
    {
      quote: "C'est enfin un outil qui sort les compléments du flou réglementaire. Sources citées, dosages comparés à la RDA, additifs identifiés. L'observatoire qui manquait au marché français.",
      author: 'Dr. Camille D.',
      role: 'Docteure en pharmacie · ENS Paris-Saclay',
      tag: 'EXPERTISE · MÉTHODOLOGIE'
    }
  ];

  function testimonialCard(t) {
    return el('article', { class: 'testi-card' }, [
      el('span', { class: 'overline testi-card__tag mono' }, '· ' + t.tag + ' ·'),
      el('blockquote', { class: 'testi-card__quote serif' }, [
        el('span', { class: 'testi-card__quote-mark', 'aria-hidden': 'true' }, '«'),
        ' ' + t.quote + ' ',
        el('span', { class: 'testi-card__quote-mark', 'aria-hidden': 'true' }, '»')
      ]),
      el('div', { class: 'testi-card__author' }, [
        el('span', { class: 'testi-card__author-name' }, t.author),
        el('span', { class: 'testi-card__author-role' }, t.role)
      ])
    ]);
  }

  function testimonialsSection() {
    return el('section', { class: 'testi' }, [
      el('header', { class: 'testi__header' }, [
        el('span', { class: 'overline' }, '· ILS ONT ESSAYÉ ·'),
        el('h2', { class: 'testi__title' }, [
          'Trois switches, ',
          el('span', { class: 'testi__title-lime' }, 'trois économies.')
        ])
      ]),
      el('div', { class: 'testi__grid' }, TESTIMONIALS.map(testimonialCard))
    ]);
  }

  /* ----- Pricing teaser ----- */
  function pricingCard(opts) {
    const cls = 'price-card' + (opts.highlight ? ' price-card--lime' : '');
    return el('article', { class: cls }, [
      opts.highlight ? el('span', { class: 'price-card__badge overline mono' }, '· LE PLUS POPULAIRE ·') : null,
      el('header', { class: 'price-card__head' }, [
        el('span', { class: 'overline price-card__tag' }, '· ' + opts.tag + ' ·'),
        el('h3', { class: 'price-card__name' }, opts.name)
      ]),
      el('div', { class: 'price-card__price-row' }, [
        el('span', { class: 'price-card__price mono' }, opts.price),
        opts.priceSuffix ? el('span', { class: 'price-card__price-suffix mono' }, opts.priceSuffix) : null
      ]),
      el('p', { class: 'price-card__pitch' }, opts.pitch),
      el('ul', { class: 'price-card__features' },
        opts.features.map(function (f) {
          return el('li', { class: 'price-card__feature' }, [
            el('span', { class: 'price-card__check mono', 'aria-hidden': 'true' }, '+'),
            el('span', null, f)
          ]);
        })
      ),
      el('a', {
        href: '#auth',
        class: 'cta cta--block ' + (opts.highlight ? 'cta--primary' : 'cta--secondary')
      }, opts.ctaLabel)
    ]);
  }

  function pricingTeaserSection() {
    return el('section', { class: 'pricing-teaser' }, [
      el('header', { class: 'pricing-teaser__header' }, [
        el('span', { class: 'overline' }, '· PRICING ·'),
        el('h2', { class: 'pricing-teaser__title' }, [
          'Gratuit pour scanner. ',
          el('span', { class: 'pricing-teaser__title-lime' }, '3,99 € pour switcher.')
        ]),
        el('p', { class: 'pricing-teaser__sub' }, 'Plus de la moitié de nos utilisateurs économisent leur abonnement en moins d\'un mois.')
      ]),
      el('div', { class: 'pricing-teaser__grid' }, [
        pricingCard({
          tag: 'Découverte',
          name: 'Free',
          price: '0 €',
          priceSuffix: '/ pour toujours',
          pitch: 'Pour comprendre ce que tu prends sans engagement.',
          features: [
            'Scan illimité par code-barres',
            'Score d\'efficacité et score prix',
            '1 alternative recommandée par produit',
            'Accès aux 7 catégories'
          ],
          ctaLabel: 'Commencer gratuit',
          highlight: false
        }),
        pricingCard({
          tag: 'Reco illimitées',
          name: 'Premium',
          price: '3,99 €',
          priceSuffix: '/ mois · ou 39 €/an',
          pitch: 'Pour économiser réellement à chaque achat.',
          features: [
            'Tout Free, sans aucune limite',
            'Alternatives illimitées par produit',
            'Alertes prix sur tes favoris',
            'Comparateur multi-produits',
            'Historique de scans sur 12 mois'
          ],
          ctaLabel: 'Essayer 7 jours offerts',
          highlight: true
        })
      ]),
      el('div', { class: 'pricing-teaser__foot' }, [
        el('a', { class: 'pricing-teaser__link', href: '#pricing' }, 'Voir tous les plans →')
      ])
    ]);
  }

  /* ----- CTA finale ----- */
  function ctaFinalSection() {
    return el('section', { class: 'cta-final' }, [
      el('div', { class: 'cta-final__inner' }, [
        el('span', { class: 'overline cta-final__overline mono' }, '· EN 3 SECONDES ·'),
        el('h2', { class: 'cta-final__title' }, [
          'Le prochain complément ',
          el('br'),
          'que tu achèteras ',
          el('span', { class: 'cta-final__title-italic serif' }, 'sera le bon.')
        ]),
        el('p', { class: 'cta-final__sub' }, 'Rejoins les 12 000 personnes qui ont déjà repris le contrôle de leur supplémentation.'),
        el('div', { class: 'cta-final__buttons' }, [
          el('a', { href: '#auth',   class: 'cta cta--dark'     }, 'Commencer gratuit'),
          el('a', { href: '#decode', class: 'cta cta--dark-alt' }, 'Lire le manifesto →')
        ]),
        el('div', { class: 'cta-final__meta mono' }, [
          el('span', null, 'Sans CB · Sans pub'),
          el('span', null, '·'),
          el('span', null, 'Annulation en 1 clic'),
          el('span', null, '·'),
          el('span', null, 'Made in France')
        ])
      ])
    ]);
  }

  function renderHome() {
    const frag = document.createDocumentFragment();
    frag.appendChild(heroSection());
    frag.appendChild(problemSection());
    frag.appendChild(howSection());
    frag.appendChild(demoSection());
    frag.appendChild(categoriesSection());
    frag.appendChild(testimonialsSection());
    frag.appendChild(pricingTeaserSection());
    frag.appendChild(ctaFinalSection());
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

  /* =========================================================
     Phase 6 — 5 pages publiques secondaires
     ========================================================= */

  /* ---------- Helper : page hero (commun aux 5 pages) ---------- */
  function pageHero(opts) {
    return el('section', { class: 'page-hero' }, [
      el('div', { class: 'page-hero__inner' }, [
        el('span', { class: 'overline page-hero__overline' }, opts.overline),
        el('h1', { class: 'page-hero__title' }, opts.title),
        opts.sub ? el('p', { class: 'page-hero__sub' }, opts.sub) : null,
        opts.meta ? el('div', { class: 'page-hero__meta mono' }, opts.meta) : null
      ])
    ]);
  }

  /* ---------- Page : /methodologie ---------- */
  const METHODO_DIMENSIONS = [
    { tag: '01 · Dosage',         weight: 40, color: 'lime',
      desc: "Le dosage du principe actif par dose, comparé à la quantité recommandée par l'EFSA et l'ANSES. Un produit sous-dosé n'agit pas, peu importe son prix." },
    { tag: '02 · Pureté',         weight: 30, color: 'mercury',
      desc: "Pourcentage de principe actif réel, moins une pénalité pour chaque additif controversé (dioxyde de titane, polysorbate 80, stéarate de magnésium en excès)." },
    { tag: '03 · Certifications', weight: 20, color: 'amber',
      desc: "Présence de certifications tierces vérifiables : ISO 22000, GMP, AB, Ecocert, Friend of the Sea. 5 points par certif jusqu'à 20." },
    { tag: '04 · Traçabilité',    weight: 10, color: 'coral',
      desc: "Origine du principe actif : 10 pts pour la France, 7 pts pour un pays UE, 4 pts ailleurs. Sans transparence sur la provenance, un produit ne peut pas être audité." }
  ];

  const METHODO_SOURCES = [
    { name: 'EFSA',     desc: 'Autorité européenne de sécurité des aliments — apports nutritionnels de référence (RDA).' },
    { name: 'ANSES',    desc: 'Agence française — valeurs nutritionnelles, alertes et avis sur les compléments.' },
    { name: 'Synadiet', desc: 'Syndicat national des compléments alimentaires — données marché France.' },
    { name: 'PubMed',   desc: 'Études cliniques peer-reviewed — pour chaque allégation de bénéfice mesurable.' },
    { name: 'Cochrane', desc: 'Revues systématiques — pour départager les principes actifs sur-documentés.' }
  ];

  function methodoDimCard(d) {
    return el('article', { class: 'methodo-dim' }, [
      el('div', { class: 'methodo-dim__head' }, [
        el('span', { class: 'overline mono methodo-dim__tag' }, '· ' + d.tag + ' ·'),
        el('div', { class: 'methodo-dim__weight' }, [
          el('span', { class: 'methodo-dim__weight-num mono methodo-dim__weight-num--' + d.color }, String(d.weight)),
          el('span', { class: 'methodo-dim__weight-of mono' }, ' / 100')
        ])
      ]),
      el('div', { class: 'methodo-dim__bar' }, [
        el('div', { class: 'methodo-dim__bar-fill methodo-dim__bar-fill--' + d.color, style: { width: d.weight + '%' } })
      ]),
      el('p', { class: 'methodo-dim__desc' }, d.desc)
    ]);
  }

  function renderMethodo() {
    return el('article', { class: 'page-content methodo' }, [
      pageHero({
        overline: '· MÉTHODOLOGIE V1 · MMXXVI ·',
        title: [
          'Comment on calcule, ',
          el('span', { class: 'page-hero__title-lime' }, 'exactement.')
        ],
        sub: "La méthodologie scientifique derrière chaque score Skynova. Reproductible, sourcée, ouverte aux critiques.",
        meta: [
          el('span', null, 'Version 1.4'),
          el('span', null, '·'),
          el('span', null, 'Mise à jour 03·05·2026'),
          el('span', null, '·'),
          el('span', null, 'Licence CC-BY 4.0')
        ]
      }),

      el('section', { class: 'page-block' }, [
        el('span', { class: 'overline' }, '· PRINCIPE ·'),
        el('h2', { class: 'page-h2' }, "Un score ne devrait jamais se discuter sur du flair."),
        el('p', { class: 'page-prose' }, "Le marché des compléments alimentaires en France pèse 2,92 milliards d'euros en 2024. À ce niveau de chiffre d'affaires, l'absence d'un référentiel scientifique public est anormale. Chaque marque communique son propre récit qualité — \"premium\", \"laboratoire\", \"breveté\" — sans définition partagée."),
        el('p', { class: 'page-prose' }, "Skynova publie une méthodologie unique, reproductible, et opposable. Chaque score publié peut être recalculé à partir des données ouvertes de la fiche produit. Si une marque conteste un score, elle peut nous écrire à methodo@skynova.fr en pointant précisément l'item qui pose problème. On corrige publiquement ou on argumente publiquement.")
      ]),

      el('section', { class: 'page-block' }, [
        el('span', { class: 'overline' }, "· SCORE D'EFFICACITÉ ·"),
        el('h2', { class: 'page-h2' }, [
          '4 dimensions. 100 points. ',
          el('span', { class: 'page-h2-mute' }, 'Aucun arbitrage subjectif.')
        ]),
        el('p', { class: 'page-prose page-prose--lead' }, "Le score d'efficacité est la somme pondérée de 4 dimensions mesurables. Chaque dimension a un poids fixé une fois pour toutes."),
        el('div', { class: 'methodo__dims' }, METHODO_DIMENSIONS.map(methodoDimCard))
      ]),

      el('section', { class: 'page-block' }, [
        el('span', { class: 'overline' }, '· SCORE PRIX ·'),
        el('h2', { class: 'page-h2' }, "Le prix au gramme de principe actif, pas au pot."),
        el('p', { class: 'page-prose' }, "Le score prix compare le coût au mg (ou g) de principe actif réel au prix médian de la catégorie. Un produit à 0,7× le prix médian obtient 100. Un produit à 1,0× obtient 50. À 1,5× ou plus, il obtient 0. Cette échelle linéaire écrase les écarts marketing : un \"premium\" qui sur-facture sa créatine 3× obtient zéro, point."),
        el('div', { class: 'methodo__formula card' }, [
          el('span', { class: 'overline' }, '· FORMULE ·'),
          el('pre', { class: 'methodo__code mono' },
            'score = max(0, min(100, round(125 − (ratio × 75))))\n' +
            'avec ratio = (prix / mg_actif_total) / médiane_catégorie'
          )
        ])
      ]),

      el('section', { class: 'page-block' }, [
        el('span', { class: 'overline' }, '· SOURCES ·'),
        el('h2', { class: 'page-h2' }, "Les autorités sur lesquelles on s'appuie."),
        el('ul', { class: 'methodo__sources' },
          METHODO_SOURCES.map(function (s) {
            return el('li', { class: 'methodo__source' }, [
              el('span', { class: 'methodo__source-name mono' }, s.name),
              el('span', { class: 'methodo__source-desc' }, s.desc)
            ]);
          })
        )
      ]),

      el('section', { class: 'page-block' }, [
        el('span', { class: 'overline overline--lime' }, '· LIMITES ASSUMÉES ·'),
        el('h2', { class: 'page-h2' }, "Ce que Skynova ne mesure pas, et pourquoi."),
        el('p', { class: 'page-prose' }, "On ne mesure pas le ressenti utilisateur en double-aveugle. On ne mesure pas l'effet placebo. On ne mesure pas la biodisponibilité réelle dans ton organisme (elle varie selon ton microbiote, ton âge, ton génotype). Notre score est une probabilité d'efficacité théorique, calculée sur des paramètres objectifs — il ne remplace pas un avis médical. Si tu prends un traitement, parle de ta supplémentation à ton médecin.")
      ]),

      el('section', { class: 'page-block page-block--cta' }, [
        el('div', { class: 'page-cta-band' }, [
          el('div', null, [
            el('span', { class: 'overline mono' }, '· DÉSACCORD MÉTHODOLOGIQUE ? ·'),
            el('h3', { class: 'page-cta-band__title' }, "Écris au lab."),
            el('p', { class: 'page-cta-band__sub' }, "On répond à chaque mail argumenté en moins de 7 jours.")
          ]),
          el('a', { href: 'mailto:methodo@skynova.fr', class: 'cta cta--primary' }, 'methodo@skynova.fr')
        ])
      ])
    ]);
  }

  /* ---------- Page : /decode (blog) ---------- */
  const BLOG_ARTICLES = [
    { slug: 'whey-89-vs-71',     featured: true,  category: 'Sport',       mark: 'WHE', tone: 'lime',
      title: "Pourquoi ta whey 89/100 n'est pas forcément meilleure que celle à 71",
      excerpt: "Le score d'efficacité raconte une histoire, le score prix en raconte une autre. On a décortiqué 8 whey best-sellers pour comprendre pourquoi la \"meilleure\" n'est presque jamais celle qu'on imagine.",
      author: 'Skynova Lab', date: '14 mai 2026', readTime: 7 },
    { slug: 'melatonine-france-2024',  category: 'Sommeil',    mark: 'MLT', tone: 'mercury',
      title: "Mélatonine : la France triple la dose autorisée en 2024",
      excerpt: "Jusqu'en 2023, le plafond était 1 mg. Depuis janvier 2024, c'est 1,9 mg sans prescription. Conséquences sur le marché et sur ton sommeil.",
      author: 'Skynova Lab', date: '08 mai 2026', readTime: 5 },
    { slug: 'collagene-marin-bovin',   category: 'Beauté',     mark: 'COL', tone: 'lime',
      title: "Collagène marin vs bovin : l'enquête",
      excerpt: "Type I, type II, peptides hydrolysés, poisson, bovin... On a comparé 14 références sur 5 critères. Le grand gagnant n'est pas le plus cher.",
      author: 'Camille D.',  date: '02 mai 2026', readTime: 9 },
    { slug: 'magnesium-bisglycinate',  category: 'Vitalité',   mark: 'MAG', tone: 'lime',
      title: "Magnésium bisglycinate : pourquoi ce nom barbare est devenu marketing",
      excerpt: "Bisglycinate, citrate, malate, oxyde... Tous les magnésiums ne se valent pas. Et certaines formes vendues 2× plus cher sont à peine mieux assimilées.",
      author: 'Skynova Lab', date: '26 avril 2026', readTime: 6 },
    { slug: 'probiotiques-souches',    category: 'Digestion',  mark: 'PRB', tone: 'amber',
      title: "Probiotiques : 10 milliards d'UFC, mais lesquelles ?",
      excerpt: "Le nombre d'UFC sur l'étiquette est devenu un argument commercial. La vraie question, c'est la diversité des souches et leur stabilité jusqu'à péremption.",
      author: 'Skynova Lab', date: '19 avril 2026', readTime: 8 },
    { slug: 'curcumine-piperine',      category: 'Articulaire', mark: 'CRC', tone: 'lime',
      title: "Curcumine et pipérine : le couple qui marche vraiment",
      excerpt: "Sans pipérine ou phytosomes, la curcumine est très peu biodisponible. Pourtant la moitié des produits vendus en pharmacie l'omettent. On nomme les coupables.",
      author: 'Skynova Lab', date: '12 avril 2026', readTime: 5 },
    { slug: 'vitamine-d-sous-dosage',  category: 'Vitalité',    mark: 'VTD', tone: 'amber',
      title: "Vitamine D : la France sous-dose, ses voisins surdosent",
      excerpt: "L'ANSES recommande 600 UI/jour. L'Allemagne va jusqu'à 2 000 UI sans prescription. Les pharmacies françaises vendent jusqu'à 100 000 UI en ampoule unique. Pourquoi cet écart ?",
      author: 'Camille D.',  date: '05 avril 2026', readTime: 7 },
    { slug: 'spiruline-fr-vs-cn',      category: 'Vitalité',    mark: 'SPI', tone: 'mercury',
      title: "Spiruline française vs chinoise : 6 critères qui tranchent",
      excerpt: "L'origine pèse 10 points sur 100 dans notre algorithme. Pour la spiruline, c'est presque la moitié du score. Voilà pourquoi.",
      author: 'Skynova Lab', date: '28 mars 2026', readTime: 6 },
    { slug: 'creatine-monohydrate',    category: 'Sport',       mark: 'CRE', tone: 'lime',
      title: "Créatine monohydrate : tout le reste est marketing",
      excerpt: "HCl, malate, éthyle-ester, kre-alkalyn... Toutes les variantes brevetées coûtent 3-5× plus cher. Aucune étude clinique n'a démontré leur supériorité. La pure monohydrate reste imbattable.",
      author: 'Thomas B.',   date: '21 mars 2026', readTime: 4 },
    { slug: 'ashwagandha-ksm66',       category: 'Sommeil',     mark: 'ASH', tone: 'mercury',
      title: "Ashwagandha KSM-66 : pourquoi ce dosage est devenu la référence",
      excerpt: "300 mg, 600 mg, 1 200 mg ? L'extrait KSM-66 standardise à 5% de withanolides — ce qui rend la comparaison entre marques enfin possible.",
      author: 'Skynova Lab', date: '14 mars 2026', readTime: 6 }
  ];

  function articleCard(a, featured) {
    return el('a', {
      class: 'art-card' + (featured ? ' art-card--featured' : ''),
      href: '#decode/' + a.slug
    }, [
      el('div', { class: 'art-card__image' }, [
        el('span', { class: 'art-card__mark mono' }, a.mark),
        el('span', { class: 'art-card__category overline mono' }, '· ' + a.category.toUpperCase() + ' ·')
      ]),
      el('div', { class: 'art-card__body' }, [
        el('h3', { class: 'art-card__title' }, a.title),
        el('p', { class: 'art-card__excerpt' }, a.excerpt),
        el('div', { class: 'art-card__foot' }, [
          el('span', { class: 'art-card__author mono' }, a.author),
          el('span', { class: 'art-card__sep' }, '·'),
          el('span', { class: 'art-card__date mono' }, a.date),
          el('span', { class: 'art-card__sep' }, '·'),
          el('span', { class: 'art-card__read mono' }, a.readTime + ' min')
        ])
      ])
    ]);
  }

  function renderDecode() {
    const featured = BLOG_ARTICLES.find(function (a) { return a.featured; });
    const others = BLOG_ARTICLES.filter(function (a) { return !a.featured; });

    return el('article', { class: 'page-content decode' }, [
      pageHero({
        overline: '· LE DECODE ·',
        title: [
          "L'observatoire des ",
          el('span', { class: 'page-hero__title-lime' }, 'compléments.')
        ],
        sub: "10 enquêtes éditoriales sur ce qui se cache vraiment derrière les étiquettes. Mis à jour chaque semaine.",
        meta: [
          el('span', null, '10 articles publiés'),
          el('span', null, '·'),
          el('span', null, '1 nouveau par semaine'),
          el('span', null, '·'),
          el('span', null, 'Sans pub, sans sponso')
        ]
      }),

      featured ? el('section', { class: 'page-block decode__featured-wrap' }, [
        el('span', { class: 'overline' }, '· À LA UNE ·'),
        articleCard(featured, true)
      ]) : null,

      el('section', { class: 'page-block decode__list-wrap' }, [
        el('div', { class: 'decode__list-head' }, [
          el('span', { class: 'overline' }, '· LE RESTE DU LAB ·'),
          el('span', { class: 'overline mono' }, '· ' + others.length + ' ARTICLES ·')
        ]),
        el('div', { class: 'decode__grid' }, others.map(function (a) { return articleCard(a, false); }))
      ])
    ]);
  }

  /* ---------- Page : /categories (hub) ---------- */
  const CATEGORIES_DETAIL = {
    vitality:  { productCount: 462, avgScore: 78, avgPrice: '21 €',
                 top: [
                   { name: 'Magnésium Bisglycinate', brand: 'Nutripure',    score: 94 },
                   { name: 'Vitamine C Liposomale',  brand: 'D-Lab',        score: 89 },
                   { name: 'Spiruline Bio FR',       brand: 'Ballot-Flurin', score: 88 }
                 ] },
    sleep:     { productCount: 318, avgScore: 74, avgPrice: '19 €',
                 top: [
                   { name: 'Ashwagandha KSM-66',     brand: 'Nutripure',  score: 92 },
                   { name: 'Mélatonine 1,9 mg',      brand: 'Apyforme',   score: 84 },
                   { name: 'Valériane Standardisée', brand: 'Solgar',     score: 81 }
                 ] },
    digestion: { productCount: 244, avgScore: 71, avgPrice: '24 €',
                 top: [
                   { name: 'Probio Daily 10M',       brand: 'D-Lab',         score: 86 },
                   { name: 'Psyllium Blond Bio',     brand: 'Nutrimea',      score: 83 },
                   { name: 'Enzymes Digestives',     brand: 'Now Foods',     score: 79 }
                 ] },
    beauty:    { productCount: 287, avgScore: 69, avgPrice: '32 €',
                 top: [
                   { name: 'Collagène Marin Type I', brand: 'Apyforme',   score: 92 },
                   { name: 'Biotine 10 000 µg',      brand: 'Solgar',     score: 84 },
                   { name: 'Acide Hyaluronique',     brand: 'D-Lab',      score: 81 }
                 ] },
    joints:    { productCount: 196, avgScore: 67, avgPrice: '27 €',
                 top: [
                   { name: 'Curcumine + Pipérine',   brand: 'Nutripure',  score: 90 },
                   { name: 'Glucosamine 1500 mg',    brand: 'Yves Ponroy', score: 82 },
                   { name: 'MSM Pur',                brand: 'Now Foods',  score: 78 }
                 ] },
    sport:     { productCount: 412, avgScore: 81, avgPrice: '34 €',
                 top: [
                   { name: 'Whey Native Isolat',     brand: 'Nutripure',   score: 92 },
                   { name: 'Créatine Creapure',      brand: 'Nutrimuscle', score: 95 },
                   { name: 'BCAA 2:1:1',             brand: 'MyProtein',   score: 84 }
                 ] },
    targeted:  { productCount: 281, avgScore: 73, avgPrice: '23 €',
                 top: [
                   { name: 'Oméga-3 EPA/DHA',        brand: 'Nutripure',   score: 91 },
                   { name: 'Ginkgo Biloba 6000',     brand: 'Solgar',      score: 83 },
                   { name: 'Lutéine 20 mg',          brand: 'Now Foods',   score: 79 }
                 ] }
  };

  function catHubCard(cat) {
    const d = CATEGORIES_DETAIL[cat.id] || {};
    return el('article', { class: 'cat-hub-card', dataset: { cat: cat.id } }, [
      el('header', { class: 'cat-hub-card__head' }, [
        el('div', { class: 'cat-hub-card__icon' }, [ el('i', { 'data-lucide': cat.icon }) ]),
        el('div', null, [
          el('span', { class: 'overline cat-hub-card__share-tag' }, '· ' + cat.share + ' du marché FR ·'),
          el('h3', { class: 'cat-hub-card__name' }, cat.name)
        ])
      ]),
      el('p', { class: 'cat-hub-card__desc' }, cat.desc),
      el('div', { class: 'cat-hub-card__stats' }, [
        el('div', { class: 'cat-hub-card__stat' }, [
          el('span', {
            class: 'cat-hub-card__stat-val mono',
            dataset: d.productCount ? { counter: String(d.productCount) } : null
          }, d.productCount ? '0' : '—'),
          el('span', { class: 'overline cat-hub-card__stat-lbl' }, 'références')
        ]),
        el('div', { class: 'cat-hub-card__stat' }, [
          el('span', {
            class: 'cat-hub-card__stat-val mono cat-hub-card__stat-val--lime',
            dataset: d.avgScore ? { counter: String(d.avgScore) } : null
          }, d.avgScore ? '0' : '—'),
          el('span', { class: 'overline cat-hub-card__stat-lbl' }, 'score moyen')
        ]),
        el('div', { class: 'cat-hub-card__stat' }, [
          el('span', { class: 'cat-hub-card__stat-val mono' }, d.avgPrice || '—'),
          el('span', { class: 'overline cat-hub-card__stat-lbl' }, 'prix moyen')
        ])
      ]),
      el('div', { class: 'cat-hub-card__top' }, [
        el('span', { class: 'overline cat-hub-card__top-label' }, '· TOP 3 ACTUEL ·'),
        el('ul', { class: 'cat-hub-card__top-list' },
          (d.top || []).map(function (p, i) {
            return el('li', { class: 'cat-hub-card__top-item' }, [
              el('span', { class: 'cat-hub-card__top-rank mono' }, '0' + (i + 1)),
              el('span', { class: 'cat-hub-card__top-name' }, [
                p.name,
                el('span', { class: 'cat-hub-card__top-brand' }, ' · ' + p.brand)
              ]),
              el('span', { class: 'cat-hub-card__top-score mono' }, String(p.score))
            ]);
          })
        )
      ]),
      el('a', { href: '#search', class: 'cat-hub-card__cta cta cta--secondary' }, 'Explorer →')
    ]);
  }

  function renderCategories() {
    return el('article', { class: 'page-content cat-hub' }, [
      pageHero({
        overline: '· 7 UNIVERS COUVERTS ·',
        title: [
          "L'intégralité du marché français, ",
          el('span', { class: 'page-hero__title-lime' }, 'décodé.')
        ],
        sub: '2 200 références analysées sur les 7 grandes familles de compléments alimentaires vendus en pharmacie, parapharmacie et boutiques spécialisées.',
        meta: [
          el('span', null, '2 200 références'),
          el('span', null, '·'),
          el('span', null, '78 marques'),
          el('span', null, '·'),
          el('span', null, 'Mise à jour quotidienne')
        ]
      }),
      el('section', { class: 'page-block' }, [
        el('div', { class: 'cat-hub__grid' }, CATEGORIES.map(catHubCard))
      ])
    ]);
  }

  /* ---------- Page : /manifesto ---------- */
  const MANIFESTO_COMMITMENTS = [
    { num: '01',
      title: "L'indépendance financière absolue.",
      body: "Skynova ne touche aucune commission qui influence un score. Notre revenu vient des abonnements payés par les utilisateurs et, plus tard, des données B2B agrégées vendues aux marques — sans jamais ajuster un score en échange. Si une marque nous propose de l'argent contre un meilleur classement, le mail est publié sur Le Decode. C'est arrivé deux fois en 2025." },
    { num: '02',
      title: "La transparence radicale des sources.",
      body: "Chaque score Skynova doit être recalculable à partir des données ouvertes de la fiche produit. La formule est publique. Le code de l'algorithme sera open-source en Q3 2026 sous licence MIT. Si tu trouves une erreur, on la corrige publiquement en moins de 7 jours." },
    { num: '03',
      title: "Le refus du flou réglementaire.",
      body: "Quand un produit n'affiche pas son dosage exact, son origine, ses certifications, on le note. On ne devine pas, on ne complète pas avec du marketing. Si l'industriel ne dit pas, l'utilisateur saura qu'il ne dit pas — et le score en tient compte." },
    { num: '04',
      title: "La rigueur scientifique, pas le marketing.",
      body: "On s'appuie sur l'EFSA, l'ANSES, PubMed et Cochrane. Pas sur la communication marque. Si une allégation n'a pas d'étude clinique en double-aveugle derrière, elle ne pèse pas dans le score. Le \"laboratoire\" gravé sur le pot, c'est juste typographique." },
    { num: '05',
      title: "L'utilisateur d'abord, l'industriel jamais.",
      body: "Les données utilisateurs ne sont jamais vendues. Les marques peuvent acheter des insights anonymisés agrégés à l'échelle du marché — pas des comportements individuels. Tu peux exporter ou supprimer ton compte en un clic, sans email de relance. C'est le contrat." }
  ];

  function manifestoItem(c) {
    return el('article', { class: 'manifesto-item' }, [
      el('div', { class: 'manifesto-item__num mono', 'aria-hidden': 'true' }, c.num),
      el('div', { class: 'manifesto-item__body' }, [
        el('h2', { class: 'manifesto-item__title' }, c.title),
        el('p', { class: 'manifesto-item__text' }, c.body)
      ])
    ]);
  }

  function renderManifesto() {
    return el('article', { class: 'page-content manifesto' }, [
      pageHero({
        overline: '· MANIFESTO · MMXXVI ·',
        title: [
          'Notre engagement, ',
          el('span', { class: 'page-hero__title-lime' }, 'en 5 points.')
        ],
        sub: "Ce qu'on signe quand on lance Skynova. Si un jour on dévie de l'un de ces 5 engagements, écris-nous. On répond et on corrige.",
        meta: [
          el('span', null, 'Signé par les 4 fondateurs'),
          el('span', null, '·'),
          el('span', null, 'Paris · 03·05·2026')
        ]
      }),
      el('section', { class: 'page-block manifesto__list' },
        MANIFESTO_COMMITMENTS.map(manifestoItem)
      ),
      el('section', { class: 'page-block page-block--cta' }, [
        el('div', { class: 'page-cta-band' }, [
          el('div', null, [
            el('span', { class: 'overline mono' }, '· TU VEUX VÉRIFIER ·'),
            el('h3', { class: 'page-cta-band__title' }, "Lis la méthodologie complète."),
            el('p', { class: 'page-cta-band__sub' }, "Sources, formules, limites assumées. Tout est public.")
          ]),
          el('a', { href: '#methodologie', class: 'cta cta--primary' }, 'Voir la méthodo →')
        ])
      ])
    ]);
  }

  /* ---------- Page : /pricing ---------- */
  const PRICING_PLANS = [
    { tag: 'Découverte', name: 'Free', price: '0 €', priceSuffix: '/ pour toujours',
      pitch: 'Pour comprendre ce que tu prends. Sans engagement, sans CB.',
      features: [
        'Scan illimité par code-barres',
        "Score d'efficacité + score prix",
        '1 alternative recommandée par produit',
        'Accès aux 7 catégories',
        '20 derniers scans en mémoire'
      ],
      cta: 'Commencer gratuit', ctaHref: '#auth', highlight: false },
    { tag: 'Reco illimitées', name: 'Premium', price: '3,99 €', priceSuffix: '/ mois · ou 39 €/an',
      pitch: 'Pour économiser réellement à chaque achat.',
      features: [
        'Tout Free, sans aucune limite',
        'Alternatives illimitées par produit',
        'Alertes prix sur tes favoris',
        'Comparateur multi-produits',
        'Historique de scans sur 12 mois',
        'Export PDF de ton stack'
      ],
      cta: 'Essayer 7 jours offerts', ctaHref: '#auth', highlight: true, badge: '· LE PLUS POPULAIRE ·' },
    { tag: 'Pour les marques', name: 'Pro', price: '299 €', priceSuffix: '/ mois · facturation annuelle',
      pitch: "Pour les marques qui veulent comprendre leur position sur leur marché.",
      features: [
        'Dashboard Brand Insights complet',
        'Benchmark anonymisé vs concurrents',
        'Score de tes propres produits en avant-première',
        'API d\'accès aux données catégorie',
        'Support dédié + onboarding sur-mesure',
        'Rapport mensuel signé Skynova Lab'
      ],
      cta: 'Demander une démo', ctaHref: 'mailto:b2b@skynova.fr', highlight: false }
  ];

  const PRICING_COMPARISON = [
    { feature: 'Scans illimités',                    free: true,  premium: true,  pro: true },
    { feature: "Score d'efficacité + score prix",    free: true,  premium: true,  pro: true },
    { feature: 'Alternatives recommandées',          free: '1',   premium: 'Illimité', pro: 'Illimité' },
    { feature: 'Alertes prix sur favoris',           free: false, premium: true,  pro: true },
    { feature: 'Comparateur multi-produits',         free: false, premium: true,  pro: true },
    { feature: 'Historique scans',                   free: '20',  premium: '12 mois', pro: 'Permanent' },
    { feature: 'Export PDF du stack',                free: false, premium: true,  pro: true },
    { feature: 'Brand Insights B2B',                 free: false, premium: false, pro: true },
    { feature: 'API + rapport mensuel signé Lab',    free: false, premium: false, pro: true }
  ];

  const FAQ_ITEMS = [
    { q: "Pourquoi seulement 3,99 €/mois pour Premium ?",
      a: "Parce qu'on calcule 250 000 scores par mois pour environ 0,40 € de coût serveur. Le reste paie l'équipe (4 personnes) et la maintenance des sources. On a fait le choix d'un prix accessible plutôt que d'un freemium artificiel." },
    { q: "Vous touchez des commissions sur les produits recommandés ?",
      a: "On a des liens d'affiliation Amazon, Nutripure et MyProtein qui rapportent ~7% sur les clics achat. Cette commission n'affecte aucun score — l'algorithme tourne avant qu'on calcule l'affiliation. C'est documenté ligne par ligne dans la méthodologie." },
    { q: "Comment je résilie mon abonnement Premium ?",
      a: "Settings > Abonnement > Résilier. Un seul clic, pas de mail de relance, pas de chat agent qui te garde 20 minutes. Tu gardes l'accès jusqu'à la fin de ta période payée. C'est dans le manifesto." },
    { q: "Mes données sont vendues ?",
      a: "Non, jamais à l'échelle individuelle. Pour le plan Pro B2B, on vend des agrégats anonymisés à l'échelle catégorie (ex. \"le panier moyen ashwagandha en 2026 est de 24 €\"). Tu peux exporter ou supprimer ton compte à tout moment." },
    { q: "Skynova fonctionne hors de France ?",
      a: "Pour l'instant le scoring est calibré sur le marché français (prix médians, certifications EFSA/ANSES, taxes). On lance Belgique, Suisse et Espagne en Q4 2026. UK et Allemagne en 2027." },
    { q: "Je suis professionnel de santé, vous avez un programme ?",
      a: "Oui — Skynova Pro Santé : 0 €/mois pour les pharmaciens, naturopathes et médecins certifiés, avec accès aux comparateurs et à la méthodologie détaillée. Justificatif demandé. Écris à pro@skynova.fr." }
  ];

  function pricingFullCard(p) {
    const cls = 'price-card price-card--full' + (p.highlight ? ' price-card--lime' : '');
    return el('article', { class: cls }, [
      p.badge ? el('span', { class: 'price-card__badge overline mono' }, p.badge) : null,
      el('header', { class: 'price-card__head' }, [
        el('span', { class: 'overline price-card__tag' }, '· ' + p.tag + ' ·'),
        el('h3', { class: 'price-card__name' }, p.name)
      ]),
      el('div', { class: 'price-card__price-row' }, [
        el('span', { class: 'price-card__price mono' }, p.price),
        el('span', { class: 'price-card__price-suffix mono' }, p.priceSuffix)
      ]),
      el('p', { class: 'price-card__pitch' }, p.pitch),
      el('ul', { class: 'price-card__features' },
        p.features.map(function (f) {
          return el('li', { class: 'price-card__feature' }, [
            el('span', { class: 'price-card__check mono', 'aria-hidden': 'true' }, '+'),
            el('span', null, f)
          ]);
        })
      ),
      el('a', {
        href: p.ctaHref,
        class: 'cta cta--block ' + (p.highlight ? 'cta--primary' : 'cta--secondary')
      }, p.cta)
    ]);
  }

  function comparisonCell(v) {
    if (v === true)  return el('span', { class: 'cmp-cell cmp-cell--yes mono' }, '+');
    if (v === false) return el('span', { class: 'cmp-cell cmp-cell--no mono'  }, '—');
    return el('span', { class: 'cmp-cell mono' }, String(v));
  }

  function faqItem(item, idx) {
    return el('details', { class: 'faq-item', open: idx === 0 ? '' : null }, [
      el('summary', { class: 'faq-item__q' }, [
        el('span', { class: 'faq-item__num mono' }, '0' + (idx + 1)),
        el('span', { class: 'faq-item__q-text' }, item.q),
        el('span', { class: 'faq-item__icon', 'aria-hidden': 'true' }, '+')
      ]),
      el('p', { class: 'faq-item__a' }, item.a)
    ]);
  }

  function renderPricing() {
    return el('article', { class: 'page-content pricing-page' }, [
      pageHero({
        overline: '· PRICING ·',
        title: [
          '3 plans. ',
          el('span', { class: 'page-hero__title-lime' }, "Aucun engagement.")
        ],
        sub: "Free pour comprendre. Premium pour économiser. Pro pour les marques. Tout est résiliable en 1 clic.",
        meta: [
          el('span', null, 'Sans CB pour Free'),
          el('span', null, '·'),
          el('span', null, '7 jours offerts Premium'),
          el('span', null, '·'),
          el('span', null, 'Tarifs TTC')
        ]
      }),

      el('section', { class: 'page-block' }, [
        el('div', { class: 'pricing-page__cards' }, PRICING_PLANS.map(pricingFullCard))
      ]),

      el('section', { class: 'page-block' }, [
        el('span', { class: 'overline' }, '· COMPARATIF DÉTAILLÉ ·'),
        el('h2', { class: 'page-h2' }, 'Tout ce que tu obtiens, ligne par ligne.'),
        el('div', { class: 'cmp-wrap' }, [
          el('table', { class: 'cmp-table' }, [
            el('thead', null, [
              el('tr', null, [
                el('th', { class: 'cmp-th cmp-th--feature' }, 'Fonctionnalité'),
                el('th', { class: 'cmp-th' }, 'Free'),
                el('th', { class: 'cmp-th cmp-th--lime' }, 'Premium'),
                el('th', { class: 'cmp-th' }, 'Pro')
              ])
            ]),
            el('tbody', null,
              PRICING_COMPARISON.map(function (row) {
                return el('tr', null, [
                  el('td', { class: 'cmp-td cmp-td--feature' }, row.feature),
                  el('td', { class: 'cmp-td' }, [comparisonCell(row.free)]),
                  el('td', { class: 'cmp-td cmp-td--lime' }, [comparisonCell(row.premium)]),
                  el('td', { class: 'cmp-td' }, [comparisonCell(row.pro)])
                ]);
              })
            )
          ])
        ])
      ]),

      el('section', { class: 'page-block' }, [
        el('span', { class: 'overline' }, '· QUESTIONS LÉGITIMES ·'),
        el('h2', { class: 'page-h2' }, [
          'Ce que tout le monde nous demande, ',
          el('span', { class: 'page-h2-mute' }, 'sans filtre.')
        ]),
        el('div', { class: 'faq-list' }, FAQ_ITEMS.map(faqItem))
      ]),

      el('section', { class: 'page-block page-block--cta' }, [
        el('div', { class: 'page-cta-band' }, [
          el('div', null, [
            el('span', { class: 'overline mono' }, '· UN DOUTE ? ·'),
            el('h3', { class: 'page-cta-band__title' }, "On répond en moins de 24h."),
            el('p', { class: 'page-cta-band__sub' }, "support@skynova.fr · ou clique sur le chat.")
          ]),
          el('a', { href: 'mailto:support@skynova.fr', class: 'cta cta--primary' }, 'Nous écrire')
        ])
      ])
    ]);
  }

  /* =========================================================
     Phase 7 — Auth + Onboarding
     ========================================================= */

  /* ---------- Supabase auth helpers (demo fallback) ---------- */
  async function skSignUp(email, password) {
    if (!supabase) {
      localStorage.setItem('skynova_demo_user', JSON.stringify({ email, demo: true, t: Date.now() }));
      return { user: { email: email }, error: null, demo: true };
    }
    try {
      const result = await supabase.auth.signUp({ email: email, password: password });
      return { user: result.data && result.data.user, error: result.error, demo: false };
    } catch (err) {
      return { user: null, error: err, demo: false };
    }
  }

  async function skSignIn(email, password) {
    if (!supabase) {
      localStorage.setItem('skynova_demo_user', JSON.stringify({ email: email, demo: true, t: Date.now() }));
      return { user: { email: email }, error: null, demo: true };
    }
    try {
      const result = await supabase.auth.signInWithPassword({ email: email, password: password });
      return { user: result.data && result.data.user, error: result.error, demo: false };
    } catch (err) {
      return { user: null, error: err, demo: false };
    }
  }

  async function skGetUser() {
    if (!supabase) {
      const raw = localStorage.getItem('skynova_demo_user');
      return raw ? JSON.parse(raw) : null;
    }
    try {
      const result = await supabase.auth.getUser();
      return result.data && result.data.user;
    } catch (err) {
      return null;
    }
  }

  async function skUpdateProfile(data) {
    if (!supabase) {
      localStorage.setItem('skynova_demo_profile', JSON.stringify(data));
      return { error: null, demo: true };
    }
    try {
      const userResult = await supabase.auth.getUser();
      const user = userResult.data && userResult.data.user;
      if (!user) return { error: { message: 'Pas de session active.' } };
      const payload = Object.assign({ id: user.id }, data);
      const result = await supabase.from('profiles').upsert(payload);
      return { error: result.error, demo: false };
    } catch (err) {
      return { error: err };
    }
  }

  window.skynova.auth = { signUp: skSignUp, signIn: skSignIn, getUser: skGetUser, updateProfile: skUpdateProfile };

  /* ---------- Page : /auth (split-screen 50/50) ---------- */
  function buildAuthForm(mode) {
    const isLogin = mode === 'login';
    return el('form', { class: 'auth__form', dataset: { mode: mode }, novalidate: 'novalidate' }, [
      el('h1', { class: 'auth__title' }, isLogin ? 'Re-bienvenue.' : 'Création de compte.'),
      el('p', { class: 'auth__sub' }, isLogin
        ? 'Reconnecte-toi pour retrouver ton lab et tes favoris.'
        : '2 champs, et tu peux commencer à scanner. Aucune CB demandée.'),

      el('label', { class: 'field' }, [
        el('span', { class: 'field__label' }, 'Email'),
        el('input', {
          type: 'email',
          name: 'email',
          autocomplete: 'email',
          required: 'required',
          placeholder: 'lea@example.com',
          class: 'field__input'
        })
      ]),

      el('label', { class: 'field' }, [
        el('span', { class: 'field__label' }, 'Mot de passe'),
        el('input', {
          type: 'password',
          name: 'password',
          autocomplete: isLogin ? 'current-password' : 'new-password',
          required: 'required',
          minlength: '8',
          placeholder: 'Minimum 8 caractères',
          class: 'field__input'
        }),
        !isLogin ? el('span', { class: 'field__hint mono' }, '· 8 caractères minimum') : null
      ]),

      el('button', {
        type: 'submit',
        class: 'cta cta--primary cta--block auth__submit'
      }, [
        el('span', { class: 'auth__submit-label' }, isLogin ? 'Se connecter' : 'Créer mon compte'),
        el('span', { class: 'auth__submit-spinner', 'aria-hidden': 'true' })
      ]),

      el('div', { class: 'auth__feedback', role: 'alert', 'aria-live': 'polite' }),

      isLogin
        ? el('a', { href: 'mailto:support@skynova.fr', class: 'auth__link mono' }, '· Mot de passe oublié ? ·')
        : el('p', { class: 'auth__legal mono' }, [
            'En continuant, tu acceptes nos ',
            el('a', { href: '#legal' }, 'CGU'),
            ' et notre ',
            el('a', { href: '#legal' }, 'confidentialité'),
            '.'
          ])
    ]);
  }

  function renderAuth(params) {
    const defaultMode = (params && params[0] === 'signup') ? 'signup' : 'login';

    const section = el('section', { class: 'auth' }, [
      // ----- Left : quote -----
      el('aside', { class: 'auth__left' }, [
        el('div', { class: 'auth__left-top' }, [
          el('a', { href: '#home', class: 'skynova-mark skynova-mark--lg' }, [
            el('span', { class: 'skynova-mark__word' }, 'skynova'),
            el('span', { class: 'skynova-mark__dot', 'aria-hidden': 'true' })
          ]),
          el('span', { class: 'overline mono' }, '· ENTRER DANS LE LAB ·')
        ]),

        el('div', { class: 'auth__quote' }, [
          el('span', { class: 'overline mono auth__quote-tag' }, '· POURQUOI SKYNOVA ·'),
          el('blockquote', { class: 'auth__quote-text serif' }, [
            el('span', { class: 'auth__quote-mark', 'aria-hidden': 'true' }, '«'),
            " On a construit Skynova parce qu'on en avait marre de payer 35 € pour des compléments dosés à 60 % de ce qu'on croyait. Maintenant on calcule, et on choisit. ",
            el('span', { class: 'auth__quote-mark', 'aria-hidden': 'true' }, '»')
          ]),
          el('div', { class: 'auth__quote-author' }, [
            el('span', { class: 'auth__quote-name' }, 'Maxime C. & Léa B.'),
            el('span', { class: 'auth__quote-role mono' }, 'Fondateurs · Paris · MMXXVI')
          ])
        ]),

        el('div', { class: 'auth__left-bottom' }, [
          el('div', { class: 'auth__sweep', 'aria-hidden': 'true' }),
          el('div', { class: 'auth__bottom-meta mono' }, [
            el('span', null, 'N° 001 · Paris'),
            el('span', null, '·'),
            el('span', null, '12 000 inscrits'),
            el('span', null, '·'),
            el('span', null, '03 · 05 · 26')
          ])
        ])
      ]),

      // ----- Right : tabs + form -----
      el('section', { class: 'auth__right' }, [
        el('div', { class: 'auth__form-wrap' }, [
          el('div', { class: 'auth__tabs', role: 'tablist' }, [
            el('button', {
              class: 'auth__tab' + (defaultMode === 'login'  ? ' is-active' : ''),
              type: 'button',
              role: 'tab',
              dataset: { tab: 'login' }
            }, 'Connexion'),
            el('button', {
              class: 'auth__tab' + (defaultMode === 'signup' ? ' is-active' : ''),
              type: 'button',
              role: 'tab',
              dataset: { tab: 'signup' }
            }, 'Créer un compte')
          ]),
          buildAuthForm('login'),
          buildAuthForm('signup')
        ])
      ])
    ]);

    // Set initial visibility
    setTimeout(function () {
      const tabs = section.querySelectorAll('.auth__tab');
      const forms = section.querySelectorAll('.auth__form');
      function showMode(mode) {
        tabs.forEach(function (t) {
          t.classList.toggle('is-active', t.dataset.tab === mode);
          t.setAttribute('aria-selected', t.dataset.tab === mode ? 'true' : 'false');
        });
        forms.forEach(function (f) {
          f.classList.toggle('is-active', f.dataset.mode === mode);
        });
      }
      showMode(defaultMode);

      tabs.forEach(function (t) {
        t.addEventListener('click', function () { showMode(t.dataset.tab); });
      });

      // Form submit handler
      forms.forEach(function (form) {
        form.addEventListener('submit', async function (e) {
          e.preventDefault();
          const mode = form.dataset.mode;
          const email = form.email.value.trim();
          const password = form.password.value;
          const feedback = form.querySelector('.auth__feedback');
          const submit = form.querySelector('.auth__submit');

          feedback.textContent = '';
          feedback.classList.remove('auth__feedback--err', 'auth__feedback--ok');

          if (!email || !password || password.length < 8) {
            feedback.textContent = '× Vérifie ton email et mot de passe (8 caractères mini).';
            feedback.classList.add('auth__feedback--err');
            return;
          }

          submit.classList.add('is-loading');
          submit.disabled = true;

          const fn = mode === 'login' ? skSignIn : skSignUp;
          const res = await fn(email, password);

          submit.classList.remove('is-loading');
          submit.disabled = false;

          if (res.error) {
            const msg = (res.error && res.error.message) || 'Une erreur est survenue.';
            feedback.textContent = '× ' + msg;
            feedback.classList.add('auth__feedback--err');
            return;
          }

          feedback.textContent = res.demo
            ? '✓ Compte ' + (mode === 'login' ? 'connecté' : 'créé') + ' (mode démo). Redirection…'
            : '✓ Succès. Redirection…';
          feedback.classList.add('auth__feedback--ok');

          setTimeout(function () {
            window.location.hash = mode === 'signup' ? 'onboarding' : 'lab';
          }, 700);
        });
      });
    }, 0);

    return section;
  }

  /* ---------- Page : /onboarding (4 étapes) ---------- */
  let onbState = null;
  function getOnbState() {
    if (!onbState) {
      onbState = {
        step: 0,
        data: { goals: [], gender: null, ageRange: null, budget: 30, allergens: [] }
      };
    }
    return onbState;
  }
  function resetOnb() { onbState = null; }

  const ONB_GOALS = [
    { id: 'vitality',   label: 'Vitalité',    icon: 'zap'      },
    { id: 'sleep',      label: 'Sommeil',     icon: 'moon'     },
    { id: 'digestion',  label: 'Digestion',   icon: 'leaf'     },
    { id: 'beauty',     label: 'Beauté',      icon: 'sparkles' },
    { id: 'joints',     label: 'Articulaire', icon: 'shield'   },
    { id: 'sport',      label: 'Sport',       icon: 'dumbbell' },
    { id: 'targeted',   label: 'Santé ciblée', icon: 'target'  }
  ];
  const ONB_GENDERS = [
    { id: 'female', label: 'Femme' },
    { id: 'male',   label: 'Homme' },
    { id: 'other',  label: 'Préfère ne pas dire' }
  ];
  const ONB_AGES = [
    { id: '<25',   label: 'Moins de 25 ans' },
    { id: '25-34', label: '25 — 34 ans'    },
    { id: '35-44', label: '35 — 44 ans'    },
    { id: '45-54', label: '45 — 54 ans'    },
    { id: '55+',   label: '55 ans et plus' }
  ];
  const ONB_ALLERGENS = [
    { id: 'gluten-free',   label: 'Sans gluten' },
    { id: 'lactose-free',  label: 'Sans lactose' },
    { id: 'vegan',         label: 'Vegan' },
    { id: 'bio',           label: 'Bio uniquement' },
    { id: 'no-gelatin',    label: 'Sans gélatine animale' }
  ];

  function onbChip(opts) {
    const active = opts.active;
    return el('button', {
      type: 'button',
      class: 'onb-chip' + (active ? ' is-active' : ''),
      dataset: { value: opts.value },
      onclick: opts.onClick
    }, [
      opts.icon ? el('i', { 'data-lucide': opts.icon, class: 'onb-chip__icon' }) : null,
      el('span', { class: 'onb-chip__label' }, opts.label)
    ]);
  }

  function onbStepContent(rerender) {
    const s = getOnbState();
    const d = s.data;

    if (s.step === 0) {
      return [
        el('span', { class: 'overline onb__step-tag' }, '· OBJECTIFS DE SANTÉ ·'),
        el('h1', { class: 'onb__title' }, 'Qu\'est-ce que tu cherches à améliorer ?'),
        el('p', { class: 'onb__sub' }, 'Sélectionne 1 ou plusieurs catégories. On personnalisera tes recommandations à partir de ces réponses.'),
        el('div', { class: 'onb__chips' },
          ONB_GOALS.map(function (g) {
            return onbChip({
              value: g.id,
              label: g.label,
              icon: g.icon,
              active: d.goals.indexOf(g.id) !== -1,
              onClick: function () {
                const i = d.goals.indexOf(g.id);
                if (i === -1) d.goals.push(g.id);
                else d.goals.splice(i, 1);
                rerender();
              }
            });
          })
        )
      ];
    }
    if (s.step === 1) {
      return [
        el('span', { class: 'overline onb__step-tag' }, '· PROFIL ·'),
        el('h1', { class: 'onb__title' }, 'Tu es ?'),
        el('p', { class: 'onb__sub' }, 'Nécessaire pour ajuster les RDA — les apports recommandés varient sensiblement entre femme et homme adultes.'),
        el('div', { class: 'onb__cards' },
          ONB_GENDERS.map(function (g, i) {
            return el('button', {
              type: 'button',
              class: 'onb-card' + (d.gender === g.id ? ' is-active' : ''),
              onclick: function () { d.gender = g.id; rerender(); }
            }, [
              el('span', { class: 'overline mono onb-card__num' }, '· 0' + (i + 1) + ' ·'),
              el('span', { class: 'onb-card__label' }, g.label)
            ]);
          })
        )
      ];
    }
    if (s.step === 2) {
      return [
        el('span', { class: 'overline onb__step-tag' }, '· TRANCHE D\'ÂGE ·'),
        el('h1', { class: 'onb__title' }, 'Quel âge as-tu ?'),
        el('p', { class: 'onb__sub' }, "Les besoins évoluent : la vitamine D devient critique après 50 ans, le magnésium plus tôt. On adapte."),
        el('div', { class: 'onb__cards onb__cards--lg' },
          ONB_AGES.map(function (a, i) {
            return el('button', {
              type: 'button',
              class: 'onb-card' + (d.ageRange === a.id ? ' is-active' : ''),
              onclick: function () { d.ageRange = a.id; rerender(); }
            }, [
              el('span', { class: 'overline mono onb-card__num' }, '· 0' + (i + 1) + ' ·'),
              el('span', { class: 'onb-card__label' }, a.label)
            ]);
          })
        )
      ];
    }
    // Step 4: Budget + allergens
    return [
      el('span', { class: 'overline onb__step-tag' }, '· BUDGET & CONTRAINTES ·'),
      el('h1', { class: 'onb__title' }, 'Tes contraintes pratiques.'),
      el('p', { class: 'onb__sub' }, 'On filtrera les recommandations selon ton budget et tes restrictions. Tu pourras tout modifier plus tard.'),

      el('div', { class: 'onb__field' }, [
        el('span', { class: 'overline' }, '· BUDGET MENSUEL ·'),
        el('div', { class: 'onb__slider-wrap' }, [
          el('input', {
            type: 'range',
            min: '0',
            max: '120',
            step: '5',
            value: String(d.budget),
            class: 'onb__slider',
            oninput: function (e) {
              d.budget = parseInt(e.target.value, 10);
              const out = document.querySelector('.onb__slider-value');
              if (out) out.textContent = d.budget;
            }
          }),
          el('div', { class: 'onb__slider-display' }, [
            el('span', { class: 'onb__slider-value mono' }, String(d.budget)),
            el('span', { class: 'onb__slider-unit mono' }, ' € / mois')
          ])
        ])
      ]),

      el('div', { class: 'onb__field' }, [
        el('span', { class: 'overline' }, '· CONTRAINTES ALIMENTAIRES ·'),
        el('p', { class: 'onb__field-hint' }, 'Optionnel — tu peux passer sans rien cocher.'),
        el('div', { class: 'onb__chips onb__chips--sm' },
          ONB_ALLERGENS.map(function (a) {
            return onbChip({
              value: a.id,
              label: a.label,
              active: d.allergens.indexOf(a.id) !== -1,
              onClick: function () {
                const i = d.allergens.indexOf(a.id);
                if (i === -1) d.allergens.push(a.id);
                else d.allergens.splice(i, 1);
                rerender();
              }
            });
          })
        )
      ])
    ];
  }

  function isStepValid() {
    const s = getOnbState();
    if (s.step === 0) return s.data.goals.length > 0;
    if (s.step === 1) return s.data.gender !== null;
    if (s.step === 2) return s.data.ageRange !== null;
    if (s.step === 3) return true;
    return false;
  }

  async function submitOnboarding() {
    const s = getOnbState();
    const payload = {
      health_goals: s.data.goals,
      gender: s.data.gender,
      age_range: s.data.ageRange,
      monthly_budget_eur: s.data.budget,
      allergens: s.data.allergens
    };
    const res = await skUpdateProfile(payload);
    return res;
  }

  function renderOnboarding() {
    const wrap = el('section', { class: 'onb' });

    function rerender() {
      wrap.innerHTML = '';
      wrap.appendChild(buildOnbContent());
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    }

    function buildOnbContent() {
      const s = getOnbState();
      const total = 4;
      const pct = ((s.step + 1) / total) * 100;
      const isLast = s.step === total - 1;
      const canContinue = isStepValid();

      const inner = el('div', { class: 'onb__inner' }, [
        el('header', { class: 'onb__header' }, [
          el('a', { href: '#home', class: 'skynova-mark' }, [
            el('span', { class: 'skynova-mark__word' }, 'skynova'),
            el('span', { class: 'skynova-mark__dot', 'aria-hidden': 'true' })
          ]),
          el('div', { class: 'onb__progress-text mono' }, [
            el('span', { class: 'onb__progress-num' }, 'Étape ' + String(s.step + 1).padStart(2, '0')),
            el('span', { class: 'onb__progress-total' }, ' / 04')
          ]),
          el('a', { href: '#lab', class: 'onb__skip mono' }, 'Plus tard →')
        ]),

        el('div', { class: 'onb__progress' }, [
          el('div', { class: 'onb__progress-bar', style: { width: pct + '%' } })
        ]),

        el('main', { class: 'onb__step' }, onbStepContent(rerender)),

        el('footer', { class: 'onb__nav' }, [
          el('button', {
            type: 'button',
            class: 'cta cta--secondary onb__back',
            disabled: s.step === 0 ? 'disabled' : null,
            onclick: function () {
              if (s.step > 0) {
                s.step--;
                rerender();
              }
            }
          }, '← Précédent'),

          el('button', {
            type: 'button',
            class: 'cta cta--primary onb__next',
            disabled: canContinue ? null : 'disabled',
            onclick: async function (e) {
              if (!canContinue) return;
              if (isLast) {
                const btn = e.currentTarget;
                btn.disabled = true;
                btn.textContent = 'Sauvegarde…';
                const res = await submitOnboarding();
                if (res.error) {
                  btn.disabled = false;
                  btn.textContent = '× Erreur — réessayer';
                  return;
                }
                btn.textContent = '✓ Profil créé';
                setTimeout(function () {
                  resetOnb();
                  window.location.hash = 'lab';
                }, 600);
              } else {
                s.step++;
                rerender();
              }
            }
          }, isLast ? '✓ Terminer mon profil' : 'Continuer →')
        ])
      ]);
      return inner;
    }

    wrap.appendChild(buildOnbContent());
    return wrap;
  }

  /* =========================================================
     Phase 8 — App core (layout + Mon Lab + Scan)
     ========================================================= */

  /* ---------- App layout (sidebar + tabbar) ---------- */
  const APP_NAV_PRIMARY = [
    { id: 'lab',    label: 'Mon Lab',     hash: '#lab',    icon: 'layout-dashboard' },
    { id: 'scan',   label: 'Scan',        hash: '#scan',   icon: 'scan-line' },
    { id: 'search', label: 'Recherche',   hash: '#search', icon: 'search' }
  ];
  const APP_NAV_SECONDARY = [
    { id: 'decode',       label: 'Le Decode',   hash: '#decode',       icon: 'book-open' },
    { id: 'methodologie', label: 'Méthodologie', hash: '#methodologie', icon: 'flask-conical' },
    { id: 'pricing',      label: 'Pricing',     hash: '#pricing',      icon: 'sparkles' }
  ];

  function getDisplayName() {
    try {
      const raw = localStorage.getItem('skynova_demo_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.email) {
          const local = String(u.email).split('@')[0];
          return local ? (local.charAt(0).toUpperCase() + local.slice(1)) : 'Maximilien';
        }
      }
    } catch (e) {}
    return 'Maximilien';
  }
  function getInitial() {
    return getDisplayName().charAt(0).toUpperCase();
  }

  function appNavItem(item, activeId, variant) {
    return el('a', {
      href: item.hash,
      class: 'app-nav' + (variant === 'secondary' ? ' app-nav--secondary' : '') + (item.id === activeId ? ' is-active' : '')
    }, [
      el('i', { 'data-lucide': item.icon, class: 'app-nav__icon' }),
      el('span', { class: 'app-nav__label' }, item.label),
      item.id === activeId ? el('span', { class: 'app-nav__dot', 'aria-hidden': 'true' }) : null
    ]);
  }

  function appSidebar(activeId) {
    return el('aside', { class: 'app-sidebar', 'aria-label': 'Navigation application' }, [
      el('div', { class: 'app-sidebar__top' }, [
        el('a', { href: '#home', class: 'skynova-mark skynova-mark--lg' }, [
          el('span', { class: 'skynova-mark__word' }, 'skynova'),
          el('span', { class: 'skynova-mark__dot', 'aria-hidden': 'true' })
        ]),
        el('span', { class: 'overline mono app-sidebar__tag' }, '· LAB · v1.4 ·')
      ]),

      el('nav', { class: 'app-sidebar__nav' }, [
        el('span', { class: 'overline app-sidebar__nav-label' }, '· APP ·'),
        ...APP_NAV_PRIMARY.map(function (i) { return appNavItem(i, activeId, 'primary'); }),
        el('div', { class: 'app-sidebar__sep' }),
        el('span', { class: 'overline app-sidebar__nav-label' }, '· LAB ·'),
        ...APP_NAV_SECONDARY.map(function (i) { return appNavItem(i, activeId, 'secondary'); })
      ]),

      el('div', { class: 'app-sidebar__bottom' }, [
        el('div', { class: 'app-user' }, [
          el('div', { class: 'app-user__avatar' }, getInitial()),
          el('div', { class: 'app-user__info' }, [
            el('span', { class: 'app-user__name' }, getDisplayName()),
            el('span', { class: 'app-user__plan mono' }, 'FREE · LVL 1')
          ])
        ]),
        el('a', { href: '#auth', class: 'app-sidebar__logout' }, [
          el('i', { 'data-lucide': 'log-out', class: 'app-nav__icon' }),
          el('span', null, 'Déconnexion')
        ])
      ])
    ]);
  }

  function appTabbar(activeId) {
    const tabs = [
      { id: 'lab',    label: 'Lab',       hash: '#lab',    icon: 'layout-dashboard' },
      { id: 'scan',   label: 'Scan',      hash: '#scan',   icon: 'scan-line',          big: true },
      { id: 'search', label: 'Recherche', hash: '#search', icon: 'search' },
      { id: 'home',   label: 'Accueil',   hash: '#home',   icon: 'home' }
    ];
    return el('nav', { class: 'app-tabbar', 'aria-label': 'Navigation mobile' },
      tabs.map(function (t) {
        return el('a', {
          href: t.hash,
          class: 'app-tab' + (t.big ? ' app-tab--big' : '') + (t.id === activeId ? ' is-active' : '')
        }, [
          el('span', { class: 'app-tab__icon' }, [ el('i', { 'data-lucide': t.icon }) ]),
          el('span', { class: 'app-tab__label' }, t.label)
        ]);
      })
    );
  }

  function appLayout(pageId, content) {
    const wrap = el('section', { class: 'app-layout' });
    wrap.appendChild(appSidebar(pageId));
    wrap.appendChild(el('main', { class: 'app-main' }, content));
    wrap.appendChild(appTabbar(pageId));
    return wrap;
  }

  /* ---------- Demo data for Lab dashboard ---------- */
  const DEMO_LAB = {
    stats: [
      { num: 23,  affix: '',     label: 'Scans réalisés',       sub: '+5 cette semaine', icon: 'scan-line', tone: 'lime'    },
      { num: 156, affix: ' €',   label: 'Économies cumulées',   sub: 'depuis ton inscription', icon: 'banknote', tone: 'lime'    },
      { num: 84,  affix: '/100', label: 'Score moyen du stack', sub: 'top 18 % France',  icon: 'gauge',     tone: 'mercury' },
      { num: 7,   affix: ' j',   label: 'Série en cours',       sub: 'continue demain',  icon: 'flame',     tone: 'amber'   }
    ],
    recommendations: [
      { brand: 'Nutripure', name: 'Magnésium Bisglycinate', score: 94, mark: 'MAG', tone: 'lime',    price: '22,90 €', because: 'Top de la catégorie Vitalité' },
      { brand: 'D-Lab',     name: 'Probio Daily 10M',       score: 86, mark: 'PRB', tone: 'lime',    price: '27,90 €', because: 'Couvre ton objectif Digestion' },
      { brand: 'Apyforme',  name: 'Mélatonine 1,9 mg',      score: 84, mark: 'MLT', tone: 'mercury', price: '14,90 €', because: 'Aligné sur ton objectif Sommeil' }
    ],
    challenge: {
      week: '19',
      title: 'Décode 3 magnésiums avant dimanche.',
      description: 'Le magnésium est le supplément le plus consommé en France et le plus mal dosé. Compare 3 marques différentes — on te montre le gagnant.',
      progress: 1,
      total: 3,
      reward: '+50 XP · Badge Magnésium Master'
    },
    recentScans: [
      { brand: 'Nutripure',    name: 'Whey Native Isolat',  score: 92, mark: 'WHE', tone: 'lime',    date: 'il y a 2h' },
      { brand: 'Apyforme',     name: 'Mélatonine 1,9 mg',   score: 84, mark: 'MLT', tone: 'mercury', date: 'hier · 21:42' },
      { brand: 'D-Lab',        name: 'Collagène Marin',     score: 88, mark: 'COL', tone: 'lime',    date: 'lundi · 09:12' },
      { brand: 'Nutrimuscle',  name: 'Créatine Creapure',   score: 95, mark: 'CRE', tone: 'lime',    date: '03·05 · 18:30' },
      { brand: 'Solgar',       name: 'Vitamine D3 1000UI',  score: 71, mark: 'VTD', tone: 'amber',   date: '01·05 · 11:55' }
    ]
  };

  function getTone(score) {
    if (score >= 85) return 'lime';
    if (score >= 70) return 'mercury';
    if (score >= 50) return 'amber';
    return 'coral';
  }

  /* ---------- Lab : sub-renderers ---------- */
  function labStatCard(s) {
    return el('article', { class: 'lab-stat' }, [
      el('div', { class: 'lab-stat__head' }, [
        el('span', { class: 'overline lab-stat__label' }, s.label),
        el('div', { class: 'lab-stat__icon' }, [ el('i', { 'data-lucide': s.icon }) ])
      ]),
      el('div', { class: 'lab-stat__num-wrap' }, [
        el('span', {
          class: 'lab-stat__num mono lab-stat__num--' + s.tone,
          dataset: { counter: String(s.num) }
        }, '0'),
        el('span', { class: 'lab-stat__affix mono' }, s.affix)
      ]),
      el('span', { class: 'lab-stat__sub mono' }, '· ' + s.sub)
    ]);
  }

  function labRecoCard(r) {
    return el('a', { href: '#product/' + (r.mark || '').toLowerCase(), class: 'reco-card' }, [
      el('div', { class: 'reco-card__image' }, [
        el('span', { class: 'reco-card__mark mono' }, r.mark)
      ]),
      el('div', { class: 'reco-card__body' }, [
        el('span', { class: 'overline reco-card__brand' }, '· ' + r.brand + ' ·'),
        el('h3', { class: 'reco-card__name' }, r.name),
        el('p', { class: 'reco-card__because mono' }, '→ ' + r.because),
        el('div', { class: 'reco-card__bottom' }, [
          el('span', { class: 'reco-card__price mono' }, r.price),
          el('span', { class: 'reco-card__score reco-card__score--' + r.tone + ' mono' }, [
            String(r.score),
            el('span', { class: 'reco-card__score-of' }, '/100')
          ])
        ])
      ])
    ]);
  }

  function labScanItem(s) {
    return el('a', { href: '#product/' + (s.mark || '').toLowerCase(), class: 'scan-item' }, [
      el('span', { class: 'scan-item__mark mono' }, s.mark),
      el('div', { class: 'scan-item__body' }, [
        el('span', { class: 'scan-item__brand mono' }, s.brand),
        el('span', { class: 'scan-item__name' }, s.name)
      ]),
      el('span', { class: 'scan-item__score scan-item__score--' + s.tone + ' mono' }, String(s.score)),
      el('span', { class: 'scan-item__date mono' }, s.date)
    ]);
  }

  function renderLab() {
    const d = DEMO_LAB;
    const hour = new Date().getHours();
    const greeting = hour < 6 ? 'Bonne nuit' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    const content = el('div', { class: 'lab-page' }, [
      el('header', { class: 'lab-page__head' }, [
        el('div', null, [
          el('span', { class: 'overline mono lab-page__date' }, '· ' + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase() + ' ·'),
          el('h1', { class: 'lab-page__title' }, [
            greeting + ', ',
            el('span', { class: 'lab-page__title-lime' }, getDisplayName() + '.')
          ]),
          el('p', { class: 'lab-page__sub' }, 'Ton tableau de bord scientifique — recommandations, défi de la semaine et derniers scans.')
        ]),
        el('a', { href: '#scan', class: 'cta cta--primary lab-page__cta' }, [
          el('i', { 'data-lucide': 'scan-line', class: 'cta__icon' }),
          el('span', null, 'Scanner un produit')
        ])
      ]),

      el('section', { class: 'lab-section' }, [
        el('div', { class: 'lab-stats-grid' }, d.stats.map(labStatCard))
      ]),

      el('section', { class: 'lab-section lab-section--challenge' }, [
        el('article', { class: 'challenge-card' }, [
          el('div', { class: 'challenge-card__body' }, [
            el('span', { class: 'overline mono challenge-card__tag' }, '· DÉFI · SEMAINE ' + d.challenge.week + ' ·'),
            el('h2', { class: 'challenge-card__title' }, d.challenge.title),
            el('p', { class: 'challenge-card__desc' }, d.challenge.description),
            el('div', { class: 'challenge-card__progress' }, [
              el('div', { class: 'challenge-card__bar' }, [
                el('div', { class: 'challenge-card__fill', style: { width: ((d.challenge.progress / d.challenge.total) * 100) + '%' } })
              ]),
              el('span', { class: 'challenge-card__progress-text mono' },
                d.challenge.progress + ' / ' + d.challenge.total + ' produits décodés'
              )
            ]),
            el('span', { class: 'challenge-card__reward mono' }, '· ' + d.challenge.reward + ' ·')
          ]),
          el('div', { class: 'challenge-card__action' }, [
            el('a', { href: '#search', class: 'cta cta--primary' }, 'Démarrer le défi →')
          ])
        ])
      ]),

      el('section', { class: 'lab-section' }, [
        el('header', { class: 'lab-section__head' }, [
          el('span', { class: 'overline' }, '· RECOMMANDÉ POUR TOI ·'),
          el('a', { href: '#search', class: 'lab-section__link mono' }, 'Voir tout →')
        ]),
        el('p', { class: 'lab-section__sub' }, 'Basé sur tes 3 objectifs d\'onboarding : Vitalité, Digestion, Sommeil.'),
        el('div', { class: 'lab-recos-grid' }, d.recommendations.map(labRecoCard))
      ]),

      el('section', { class: 'lab-section' }, [
        el('header', { class: 'lab-section__head' }, [
          el('span', { class: 'overline' }, '· DERNIERS SCANS ·'),
          el('a', { href: '#scan', class: 'lab-section__link mono' }, 'Tout l\'historique →')
        ]),
        el('div', { class: 'scan-list' }, d.recentScans.map(labScanItem))
      ])
    ]);
    return appLayout('lab', content);
  }

  /* ---------- /scan ---------- */
  function renderScan() {
    const recent = DEMO_LAB.recentScans.slice(0, 3);

    const content = el('div', { class: 'scan-page' }, [
      el('header', { class: 'scan-page__head' }, [
        el('span', { class: 'overline mono scan-page__tag' }, '· SCAN · LIVE ·'),
        el('h1', { class: 'scan-page__title' }, [
          'Pointe, scanne, ',
          el('span', { class: 'scan-page__title-lime' }, 'décode.')
        ]),
        el('p', { class: 'scan-page__sub' }, "Code-barres EAN-13 ou photo de l'étiquette. Le résultat tombe en 3 secondes.")
      ]),

      el('div', { class: 'scan-frame-wrap' }, [
        el('div', { class: 'scan-frame', 'aria-label': 'Cadre de scan' }, [
          el('div', { class: 'scan-frame__grid', 'aria-hidden': 'true' }),
          el('div', { class: 'scan-frame__corners', 'aria-hidden': 'true' }, [
            el('span', { class: 'scan-frame__corner scan-frame__corner--tl' }),
            el('span', { class: 'scan-frame__corner scan-frame__corner--tr' }),
            el('span', { class: 'scan-frame__corner scan-frame__corner--bl' }),
            el('span', { class: 'scan-frame__corner scan-frame__corner--br' })
          ]),
          el('div', { class: 'scan-frame__laser', 'aria-hidden': 'true' }),
          el('div', { class: 'scan-frame__center' }, [
            el('i', { 'data-lucide': 'scan-barcode', class: 'scan-frame__center-icon' }),
            el('span', { class: 'scan-frame__center-text mono' }, 'Aligne le code-barres')
          ]),
          el('div', { class: 'scan-frame__hud' }, [
            el('span', { class: 'mono' }, 'LASER · ON'),
            el('span', { class: 'mono' }, 'ZOOM · 1.0X')
          ])
        ])
      ]),

      el('div', { class: 'scan-actions' }, [
        el('button', { type: 'button', class: 'scan-action scan-action--primary' }, [
          el('i', { 'data-lucide': 'camera', class: 'scan-action__icon' }),
          el('div', { class: 'scan-action__body' }, [
            el('span', { class: 'scan-action__label' }, 'Activer la caméra'),
            el('span', { class: 'scan-action__hint mono' }, '· EAN-13 · QR ·')
          ])
        ]),
        el('button', { type: 'button', class: 'scan-action' }, [
          el('i', { 'data-lucide': 'image-up', class: 'scan-action__icon' }),
          el('div', { class: 'scan-action__body' }, [
            el('span', { class: 'scan-action__label' }, 'Importer une photo'),
            el('span', { class: 'scan-action__hint mono' }, '· JPG · PNG · 5 Mo max ·')
          ])
        ]),
        el('a', { href: '#search', class: 'scan-action' }, [
          el('i', { 'data-lucide': 'search', class: 'scan-action__icon' }),
          el('div', { class: 'scan-action__body' }, [
            el('span', { class: 'scan-action__label' }, 'Recherche manuelle'),
            el('span', { class: 'scan-action__hint mono' }, '· 2 200 références ·')
          ])
        ])
      ]),

      el('section', { class: 'scan-page__recent' }, [
        el('header', { class: 'lab-section__head' }, [
          el('span', { class: 'overline' }, '· DERNIERS SCANS ·'),
          el('a', { href: '#lab', class: 'lab-section__link mono' }, 'Tout voir →')
        ]),
        el('div', { class: 'scan-list' }, recent.map(labScanItem))
      ])
    ]);
    return appLayout('scan', content);
  }

  /* =========================================================
     Phase 9 — Recherche + Fiche produit
     ========================================================= */

  /* ---------- Dataset produits (12 produits seedés client-side) ---------- */
  const PRODUCTS = [
    {
      id: 'whe', mark: 'WHE', brand: 'Nutripure', name: 'Whey Native Isolat', category: 'sport',
      price: 39.90, pricePerDose: '1,11 € / dose', servings: 36, activeDose: '25 g',
      purity: 90, origin: 'France', certifications: ['ISO 22000', 'GMP', 'Sans gluten'], additives: [],
      badges: [{ label: 'Sport', tone: 'lime' }, { label: 'Performance', tone: '' }],
      description: "Whey native isolat obtenue par micro-filtration à froid à partir de lait de vache collecté en Normandie. 25 g de protéines par dose, 5,4 g de BCAA, 2,8 g de leucine.",
      scoreEfficacy: 92, scorePrice: 76,
      breakdown: { dosage: 38, purity: 27, certif: 17, trace: 10 },
      whyScore: [
        "25 g de protéines par dose, soit la dose efficace pour stimuler la synthèse musculaire (≥ 20 g par prise)",
        "Pureté 90 % : pas d'agent de remplissage, pas de protéines de soja en mélange caché",
        "Origine France traçable : lait collecté chez 12 éleveurs de Normandie identifiés",
        "Triple certification : ISO 22000, GMP pharmaceutique, Sans gluten certifié AFDIAG",
        "Zéro additif controversé : pas de dioxyde de titane, pas de polysorbate 80"
      ],
      composition: {
        ingredients: [
          { name: 'Concentré de protéines de lactosérum filtré à froid (90 %)', dose: '27,8 g' },
          { name: 'Arôme naturel vanille de Madagascar', dose: 'qsp' },
          { name: 'Émulsifiant : lécithine de tournesol', dose: '0,5 g' },
          { name: 'Édulcorant : stévia rebaudioside A 97 %', dose: '0,3 g' }
        ],
        perDose: [
          { label: 'Protéines', value: '25 g' },
          { label: 'BCAA', value: '5,4 g' },
          { label: 'Leucine', value: '2,8 g' },
          { label: 'Calories', value: '104 kcal' },
          { label: 'Glucides', value: '1,2 g' },
          { label: 'Lipides', value: '0,3 g' }
        ]
      },
      reviews: [
        { author: 'Thomas B.', rating: 5, weeks: 12, verified: true, helpful: 24,
          comment: "Excellent rapport qualité-prix. Dilution parfaite, goût propre, aucun problème digestif. J'avais une whey à 49 €, je gagne 10 € sans perdre en efficacité." },
        { author: 'Léa M.', rating: 4, weeks: 8, verified: true, helpful: 18,
          comment: "Top en prise de masse, petit goût vanille un peu sucré à mon goût mais ça reste léger. Le score 92 est mérité." },
        { author: 'Antoine K.', rating: 5, weeks: 20, verified: false, helpful: 12,
          comment: "Cinquième boîte. La transparence sur l'origine Normandie change tout, j'aurais aimé ça il y a 10 ans." }
      ]
    },
    {
      id: 'cre', mark: 'CRE', brand: 'Nutrimuscle', name: 'Créatine Creapure', category: 'sport',
      price: 29.90, pricePerDose: '0,30 € / dose', servings: 100, activeDose: '5 g',
      purity: 99.95, origin: 'Allemagne', certifications: ['Creapure', 'Cologne List', 'GMP'], additives: [],
      badges: [{ label: 'Sport', tone: 'lime' }, { label: 'Force', tone: '' }],
      description: "Créatine monohydrate Creapure, l'unique forme dont l'efficacité est cliniquement prouvée. Pureté 99,95 % garantie par Alzchem en Allemagne.",
      scoreEfficacy: 95, scorePrice: 92,
      breakdown: { dosage: 40, purity: 30, certif: 17, trace: 8 },
      whyScore: [
        "5 g par dose, la dose de charge et d'entretien validée par > 500 études cliniques",
        "Pureté 99,95 % Creapure : la norme industrielle, garantie par certificat d'analyse",
        "Cologne List (zéro contamination anabolisante) + GMP pharmaceutique",
        "Origine Allemagne, fabricant unique Alzchem traçable au lot",
        "Aucune valeur ajoutée des autres formes (HCl, malate, ester) à ce jour"
      ],
      composition: {
        ingredients: [
          { name: 'Créatine monohydrate Creapure®', dose: '5 g' }
        ],
        perDose: [
          { label: 'Créatine pure', value: '5 g' },
          { label: 'Pureté', value: '99,95 %' },
          { label: 'Calories', value: '0 kcal' },
          { label: 'Forme', value: 'Monohydrate' }
        ]
      },
      reviews: [
        { author: 'Maxime R.', rating: 5, weeks: 16, verified: true, helpful: 31,
          comment: "Le pot le moins cher au gramme de créatine pure sur le marché français. Pas d'arôme, pas d'édulcorant. Que de la créatine, rien d'autre." },
        { author: 'Sarah P.', rating: 5, weeks: 6, verified: true, helpful: 14,
          comment: "Aucun effet secondaire (ballonnements zéro contrairement à une autre marque). Je suis passée à 4 g/jour par confort et ça marche pareil." },
        { author: 'Julien T.', rating: 4, weeks: 24, verified: false, helpful: 9,
          comment: "Goût neutre légèrement amer. Je mixe avec ma whey, aucun problème. Score Skynova justifié." }
      ]
    },
    {
      id: 'mag', mark: 'MAG', brand: 'Nutripure', name: 'Magnésium Bisglycinate', category: 'vitality',
      price: 22.90, pricePerDose: '0,38 € / dose', servings: 60, activeDose: '300 mg',
      purity: 88, origin: 'France', certifications: ['Albion TRAACS', 'ISO 22000', 'AB'], additives: [],
      badges: [{ label: 'Vitalité', tone: 'lime' }, { label: 'Stress', tone: '' }],
      description: "Magnésium bisglycinate Albion TRAACS, la forme chélatée la mieux absorbée. 300 mg de magnésium élément par dose, sans oxyde ni stéarate.",
      scoreEfficacy: 94, scorePrice: 84,
      breakdown: { dosage: 40, purity: 27, certif: 18, trace: 9 },
      whyScore: [
        "300 mg de magnésium élément par dose, couvre 80 % des AJR d'un adulte",
        "Forme bisglycinate Albion TRAACS : assimilation 3 à 5× supérieure à l'oxyde",
        "Triple certif : Albion TRAACS authentifié, ISO 22000, AB (bio agriculture)",
        "Pas de stéarate de magnésium (utilisé comme excipient bon marché ailleurs)",
        "Conditionnement gélule pullulane (origine fungique, sans gélatine animale)"
      ],
      composition: {
        ingredients: [
          { name: 'Magnésium bisglycinate Albion TRAACS', dose: '1875 mg' },
          { name: 'Gélule pullulane (fungique)', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Magnésium élément', value: '300 mg' },
          { label: 'Forme', value: 'Bisglycinate' },
          { label: 'Source', value: 'Albion TRAACS' },
          { label: 'AJR couvert', value: '80 %' }
        ]
      },
      reviews: [
        { author: 'Camille L.', rating: 5, weeks: 10, verified: true, helpful: 28,
          comment: "Différence nette sur le sommeil après 2 semaines. Aucun effet laxatif contrairement à mon ancien magnésium marin." },
        { author: 'Paul D.', rating: 5, weeks: 14, verified: true, helpful: 19,
          comment: "Pris en cure d'attaque 600 mg/jour pendant 3 semaines, puis 300 mg en entretien. Crampes nocturnes finies, j'ai renouvelé." },
        { author: 'Élise V.', rating: 4, weeks: 7, verified: false, helpful: 8,
          comment: "Très efficace mais 2 gélules par jour c'est un peu lourd. À part ça, c'est top." }
      ]
    },
    {
      id: 'vtd', mark: 'VTD', brand: 'Solgar', name: 'Vitamine D3 1000 UI', category: 'vitality',
      price: 16.50, pricePerDose: '0,18 € / dose', servings: 90, activeDose: '1000 UI',
      purity: 75, origin: 'États-Unis', certifications: ['Kosher'], additives: ['Stéarate de magnésium'],
      badges: [{ label: 'Vitalité', tone: 'amber' }],
      description: "Vitamine D3 cholécalciférol issue de lanoline. 1000 UI par dose, en dessous des recommandations européennes modernes (2000 UI préconisés en hiver).",
      scoreEfficacy: 71, scorePrice: 80,
      breakdown: { dosage: 22, purity: 22, certif: 5, trace: 4 },
      whyScore: [
        "1000 UI par dose : couvre les AJR ANSES mais en dessous des protocoles européens hiver (2000-4000 UI)",
        "Forme D3 cholécalciférol (mieux que D2) issue de lanoline animale",
        "Présence de stéarate de magnésium comme agent d'écoulement (pénalité pureté)",
        "Aucune certification GMP ou Bio, juste Kosher",
        "Origine États-Unis non détaillée (lanoline source non précisée)"
      ],
      composition: {
        ingredients: [
          { name: 'Cholécalciférol (vitamine D3)', dose: '1000 UI (25 µg)' },
          { name: 'Huile de carthame', dose: '180 mg' },
          { name: 'Stéarate de magnésium végétal', dose: '12 mg' },
          { name: 'Capsule : gélatine bovine', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Vitamine D3', value: '1000 UI' },
          { label: 'AJR couvert', value: '500 %' },
          { label: 'Forme', value: 'Cholécalciférol' },
          { label: 'Source', value: 'Lanoline' }
        ]
      },
      reviews: [
        { author: 'Marie F.', rating: 4, weeks: 24, verified: true, helpful: 15,
          comment: "Cure d'hiver classique, mon médecin recommande Solgar mais je vais regarder une marque française mieux notée la prochaine fois." },
        { author: 'Bertrand M.', rating: 3, weeks: 12, verified: false, helpful: 6,
          comment: "1000 UI c'est très peu en réalité. Je double la dose en hiver. Score Skynova mérité, je vais switcher." },
        { author: 'Aïcha B.', rating: 4, weeks: 8, verified: true, helpful: 4,
          comment: "Bon prix, efficace, mais la gélatine bovine ne convient pas à tout le monde. Pour le reste rien à dire." }
      ]
    },
    {
      id: 'spi', mark: 'SPI', brand: 'Ballot-Flurin', name: 'Spiruline Bio FR', category: 'vitality',
      price: 24.50, pricePerDose: '0,82 € / dose', servings: 30, activeDose: '3 g',
      purity: 95, origin: 'France', certifications: ['AB', 'Demeter', 'Friend of the Sea'], additives: [],
      badges: [{ label: 'Vitalité', tone: 'lime' }],
      description: "Spiruline française cultivée en bassins ouverts dans le Sud-Ouest. Séchée à basse température (< 40 °C) pour préserver la phycocyanine.",
      scoreEfficacy: 88, scorePrice: 62,
      breakdown: { dosage: 32, purity: 28, certif: 18, trace: 10 },
      whyScore: [
        "3 g par dose, dose minimale efficace recommandée par la Fédération des Spiruliniers de France",
        "Pureté 95 % : phycocyanine garantie ≥ 18 %, séchage basse température",
        "Triple certif : AB, Demeter (biodynamie), Friend of the Sea",
        "Origine France traçable au bassin (Sud-Ouest), production artisanale",
        "Pénalité prix : 0,82 € / dose contre 0,30 € pour spiruline import certifiée"
      ],
      composition: {
        ingredients: [
          { name: 'Spiruline (Arthrospira platensis) bio française', dose: '3 g' }
        ],
        perDose: [
          { label: 'Spiruline', value: '3 g' },
          { label: 'Phycocyanine', value: '≥ 18 %' },
          { label: 'Protéines', value: '1,8 g' },
          { label: 'Fer', value: '1,8 mg' }
        ]
      },
      reviews: [
        { author: 'Sophie R.', rating: 5, weeks: 6, verified: true, helpful: 11,
          comment: "Cher mais la qualité française se sent : pas de goût terreux, dissolution propre. Je ne reviendrai pas à l'import." },
        { author: 'Lucas A.', rating: 4, weeks: 10, verified: false, helpful: 7,
          comment: "Top sur la fatigue chronique. Le prix au gramme reste élevé mais score 88 mérité." },
        { author: 'Inès D.', rating: 5, weeks: 4, verified: true, helpful: 3,
          comment: "Petits producteurs visibles sur leur site. Démarche cohérente, produit cohérent." }
      ]
    },
    {
      id: 'ash', mark: 'ASH', brand: 'Nutripure', name: 'Ashwagandha KSM-66', category: 'sleep',
      price: 27.90, pricePerDose: '0,93 € / dose', servings: 30, activeDose: '600 mg',
      purity: 92, origin: 'Inde', certifications: ['KSM-66', 'USDA Organic', 'GMP'], additives: [],
      badges: [{ label: 'Sommeil', tone: 'mercury' }, { label: 'Stress', tone: '' }],
      description: "Ashwagandha extrait standardisé KSM-66, l'unique extrait avec > 24 études cliniques publiées. Standardisé à 5 % de withanolides.",
      scoreEfficacy: 92, scorePrice: 70,
      breakdown: { dosage: 38, purity: 28, certif: 18, trace: 8 },
      whyScore: [
        "600 mg par dose, dose moyenne validée par les études cliniques KSM-66",
        "Standardisation 5 % withanolides certifiée par Ixoreal Biomed (fabricant unique)",
        "USDA Organic + GMP + KSM-66 trademark = trinité de transparence",
        "Origine Inde traçable à la ferme (district Madhya Pradesh)",
        "Score prix moyen : reste 30 % plus cher que les extraits non standardisés"
      ],
      composition: {
        ingredients: [
          { name: 'Extrait de racine d\'ashwagandha KSM-66 (5 % withanolides)', dose: '600 mg' },
          { name: 'Gélule pullulane (fungique)', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Ashwagandha', value: '600 mg' },
          { label: 'Withanolides', value: '30 mg (5 %)' },
          { label: 'Forme', value: 'KSM-66' },
          { label: 'Source', value: 'Racine pure' }
        ]
      },
      reviews: [
        { author: 'Jules M.', rating: 5, weeks: 8, verified: true, helpful: 22,
          comment: "Cure de 8 semaines à 600 mg/soir. Sommeil amélioré dès la 2e semaine, anxiété matinale en baisse nette. Renouvellement direct." },
        { author: 'Léa P.', rating: 4, weeks: 12, verified: true, helpful: 13,
          comment: "Efficace mais effet plus lent que la mélatonine. Convient en fond, pas en aigu. Score 92 cohérent." },
        { author: 'Marc D.', rating: 5, weeks: 6, verified: false, helpful: 5,
          comment: "La certification KSM-66 fait la différence vs un ashwagandha basique. Confiance dans la marque." }
      ]
    },
    {
      id: 'mlt', mark: 'MLT', brand: 'Apyforme', name: 'Mélatonine 1,9 mg', category: 'sleep',
      price: 14.90, pricePerDose: '0,25 € / dose', servings: 60, activeDose: '1,9 mg',
      purity: 88, origin: 'France', certifications: ['ISO 22000', 'Made in France'], additives: [],
      badges: [{ label: 'Sommeil', tone: 'mercury' }],
      description: "Mélatonine de synthèse au dosage légal maximal autorisé en France (1,9 mg). Formulation à libération immédiate, à prendre 30 min avant le coucher.",
      scoreEfficacy: 84, scorePrice: 88,
      breakdown: { dosage: 32, purity: 26, certif: 16, trace: 10 },
      whyScore: [
        "1,9 mg : dose plafond légale française, validée par l'ANSES pour l'endormissement",
        "Pureté 88 % : pas d'arôme synthétique, capsule végétale",
        "Made in France certifié, ISO 22000 sur la chaîne de production",
        "Score prix excellent : 0,25 € / dose contre 0,40 € moyen catégorie",
        "Pénalité dosage : 1,9 mg est sous-dosé vs les protocoles internationaux (3-5 mg)"
      ],
      composition: {
        ingredients: [
          { name: 'Mélatonine pure', dose: '1,9 mg' },
          { name: 'Capsule HPMC végétale', dose: 'qsp' },
          { name: 'Maltodextrine', dose: '180 mg' }
        ],
        perDose: [
          { label: 'Mélatonine', value: '1,9 mg' },
          { label: 'Forme', value: 'Libération immédiate' },
          { label: 'Délai d\'action', value: '30 min' },
          { label: 'AJR', value: 'N/A' }
        ]
      },
      reviews: [
        { author: 'Nathan F.', rating: 5, weeks: 4, verified: true, helpful: 17,
          comment: "Efficace dès la première nuit. Rapport qualité-prix imbattable, je prenais une marque pharmacie à 22 €." },
        { author: 'Camille T.', rating: 4, weeks: 8, verified: true, helpful: 9,
          comment: "Marche bien pour l'endormissement, mais 1,9 mg ne tient pas la nuit entière pour moi. Le plafond français est trop bas." },
        { author: 'Antoine L.', rating: 4, weeks: 12, verified: false, helpful: 6,
          comment: "Fait le job, sans plus. Origine France appréciable. Je vais essayer un mix mélatonine + ashwagandha." }
      ]
    },
    {
      id: 'prb', mark: 'PRB', brand: 'D-Lab', name: 'Probio Daily 10M', category: 'digestion',
      price: 34.90, pricePerDose: '1,16 € / dose', servings: 30, activeDose: '10 milliards UFC',
      purity: 90, origin: 'France', certifications: ['Microbiote-Tested', 'Pharmacopée européenne', 'GMP'], additives: [],
      badges: [{ label: 'Digestion', tone: 'lime' }, { label: 'Microbiote', tone: '' }],
      description: "10 milliards d'UFC garantis à péremption, 10 souches scientifiquement validées (Lactobacillus + Bifidobacterium). Capsule gastro-résistante.",
      scoreEfficacy: 86, scorePrice: 64,
      breakdown: { dosage: 33, purity: 27, certif: 18, trace: 8 },
      whyScore: [
        "10 milliards UFC garantis à péremption (pas seulement à la production)",
        "10 souches identifiées au niveau espèce + souche (rare dans la catégorie)",
        "Capsule gastro-résistante DR-Caps : ≥ 80 % des bactéries arrivent vivantes au côlon",
        "Triple certif : Microbiote-Tested + Pharmacopée européenne + GMP",
        "Pénalité prix : 1,16 € / dose, presque le double de la médiane catégorie"
      ],
      composition: {
        ingredients: [
          { name: 'Lactobacillus rhamnosus GG', dose: '2 milliards UFC' },
          { name: 'Lactobacillus acidophilus LA-5', dose: '1,5 milliards UFC' },
          { name: 'Bifidobacterium lactis BB-12', dose: '1,5 milliards UFC' },
          { name: '7 autres souches probiotiques', dose: '5 milliards UFC' },
          { name: 'Capsule DR-Caps gastro-résistante', dose: 'qsp' }
        ],
        perDose: [
          { label: 'UFC totales', value: '10 milliards' },
          { label: 'Souches', value: '10' },
          { label: 'Capsule', value: 'DR-Caps gastro' },
          { label: 'Conservation', value: 'À température ambiante' }
        ]
      },
      reviews: [
        { author: 'Hélène G.', rating: 5, weeks: 12, verified: true, helpful: 26,
          comment: "Cure post-antibiotiques. Transit revenu à la normale en 2 semaines, ballonnements disparus. Cher mais ça marche." },
        { author: 'Mathieu R.', rating: 4, weeks: 6, verified: true, helpful: 11,
          comment: "Bon produit mais 35 €/mois c'est cher en routine. J'ai switché vers une alternative à 18 € que Skynova recommande, score équivalent." },
        { author: 'Sarah V.', rating: 5, weeks: 8, verified: false, helpful: 7,
          comment: "La transparence sur les souches change tout. Beaucoup de marques cachent ce détail." }
      ]
    },
    {
      id: 'psy', mark: 'PSY', brand: 'Nutrimea', name: 'Psyllium Blond Bio', category: 'digestion',
      price: 16.90, pricePerDose: '0,17 € / dose', servings: 100, activeDose: '5 g',
      purity: 95, origin: 'Inde', certifications: ['AB', 'EU Organic', 'GMP'], additives: [],
      badges: [{ label: 'Digestion', tone: 'lime' }, { label: 'Fibres', tone: '' }],
      description: "Psyllium blond bio (Plantago ovata) en téguments. 5 g de fibres solubles par dose. À prendre avec un grand verre d'eau, 30 min avant repas.",
      scoreEfficacy: 83, scorePrice: 94,
      breakdown: { dosage: 30, purity: 28, certif: 17, trace: 8 },
      whyScore: [
        "5 g par dose, dose efficace validée par l'EFSA pour la régularité du transit",
        "Pureté 95 % : téguments purs, sans amidon ni excipient",
        "Triple certif : AB + EU Organic + GMP",
        "Score prix excellent : 0,17 € / dose, dans le top 10 % catégorie",
        "Origine Inde non française mais traçable à la coopérative"
      ],
      composition: {
        ingredients: [
          { name: 'Psyllium blond bio (téguments)', dose: '5 g' }
        ],
        perDose: [
          { label: 'Fibres solubles', value: '4,5 g' },
          { label: 'Fibres insolubles', value: '0,5 g' },
          { label: 'Calories', value: '8 kcal' },
          { label: 'Forme', value: 'Poudre' }
        ]
      },
      reviews: [
        { author: 'Olivier C.', rating: 5, weeks: 20, verified: true, helpful: 19,
          comment: "Constipation chronique réglée en 1 semaine. Goût neutre, se mélange bien dans un yaourt. Imbattable au prix au gramme." },
        { author: 'Aurélie M.', rating: 4, weeks: 8, verified: true, helpful: 8,
          comment: "Très efficace mais attention à bien boire beaucoup d'eau, sinon ça bloque." },
        { author: 'Pierre B.', rating: 5, weeks: 12, verified: false, helpful: 4,
          comment: "Bio + prix correct + score 83. Aucun reproche." }
      ]
    },
    {
      id: 'col', mark: 'COL', brand: 'Apyforme', name: 'Collagène Marin Type I', category: 'beauty',
      price: 28.90, pricePerDose: '0,96 € / dose', servings: 30, activeDose: '10 g',
      purity: 94, origin: 'France', certifications: ['Friend of the Sea', 'Naticol', 'ISO 22000'], additives: [],
      badges: [{ label: 'Beauté', tone: 'lime' }, { label: 'Peau', tone: '' }],
      description: "Collagène marin Type I hydrolysé Naticol, peptides de bas poids moléculaire (2 kDa). Pêche durable côte atlantique française.",
      scoreEfficacy: 92, scorePrice: 68,
      breakdown: { dosage: 36, purity: 28, certif: 18, trace: 10 },
      whyScore: [
        "10 g par dose, dose efficace validée par les études cliniques (≥ 5 g/jour minimum)",
        "Peptides bas poids moléculaire (2 kDa) Naticol : assimilation > 90 %",
        "Friend of the Sea + Naticol trademark : pêche durable garantie",
        "Origine France traçable côte atlantique, peaux de poissons issues de filière alimentaire",
        "Pénalité prix : 0,96 € / dose contre médiane 0,55 € catégorie"
      ],
      composition: {
        ingredients: [
          { name: 'Peptides de collagène marin Type I Naticol', dose: '10 g' }
        ],
        perDose: [
          { label: 'Collagène hydrolysé', value: '10 g' },
          { label: 'Poids moléculaire', value: '2 kDa' },
          { label: 'Type', value: 'I' },
          { label: 'Source', value: 'Peaux de poissons' }
        ]
      },
      reviews: [
        { author: 'Marion T.', rating: 5, weeks: 12, verified: true, helpful: 23,
          comment: "Cure de 3 mois. Cheveux plus brillants, ongles plus solides, peau visiblement plus tonique. Cher mais ça vaut le prix." },
        { author: 'Léa B.', rating: 4, weeks: 8, verified: true, helpful: 10,
          comment: "Bon goût neutre (à mélanger dans un café), résultats visibles à 6 semaines. Je vais essayer une cure 6 mois." },
        { author: 'Stéphanie F.', rating: 5, weeks: 16, verified: false, helpful: 6,
          comment: "Origine France appréciable pour un collagène marin. Confiance totale dans Apyforme." }
      ]
    },
    {
      id: 'cur', mark: 'CUR', brand: 'Nutripure', name: 'Curcumine + Pipérine', category: 'joints',
      price: 21.90, pricePerDose: '0,73 € / dose', servings: 30, activeDose: '500 mg',
      purity: 95, origin: 'Inde', certifications: ['BCM-95', 'GMP', 'Sans gluten'], additives: [],
      badges: [{ label: 'Articulaire', tone: 'lime' }, { label: 'Inflammation', tone: '' }],
      description: "Curcumine BCM-95 standardisée à 95 % de curcuminoïdes + pipérine 5 mg pour multiplier la biodisponibilité par 20.",
      scoreEfficacy: 90, scorePrice: 75,
      breakdown: { dosage: 36, purity: 28, certif: 16, trace: 10 },
      whyScore: [
        "500 mg de curcumine BCM-95 par dose, biodisponibilité 7× supérieure au curcuma standard",
        "Pipérine 5 mg ajoutée : multiplie l'assimilation par 20 (cf. étude Shoba 1998)",
        "Pureté 95 % : standardisation curcuminoïdes garantie",
        "BCM-95 trademark + GMP + Sans gluten",
        "Sans curcuma indien lambda : la curcumine est l'unique principe actif efficace"
      ],
      composition: {
        ingredients: [
          { name: 'Extrait de curcuma standardisé BCM-95', dose: '500 mg' },
          { name: 'Pipérine (extrait de poivre noir)', dose: '5 mg' },
          { name: 'Capsule pullulane', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Curcuminoïdes', value: '475 mg (95 %)' },
          { label: 'Pipérine', value: '5 mg' },
          { label: 'Biodisponibilité', value: 'x 20' },
          { label: 'Forme', value: 'BCM-95' }
        ]
      },
      reviews: [
        { author: 'Bernard M.', rating: 5, weeks: 16, verified: true, helpful: 21,
          comment: "Arthrose du genou. Cure de 4 mois, douleur réduite de 60 % au questionnaire WOMAC. La pipérine fait toute la différence." },
        { author: 'Élise D.', rating: 4, weeks: 6, verified: true, helpful: 9,
          comment: "Pris contre les douleurs cervicales post-confinement. Effet net après 4 semaines. Bon prix au mg actif." },
        { author: 'Tom S.', rating: 5, weeks: 10, verified: false, helpful: 5,
          comment: "Sans pipérine, le curcuma c'est rien. Heureux que Skynova le dise enfin." }
      ]
    },
    {
      id: 'omg', mark: 'OMG', brand: 'Nutripure', name: 'Oméga-3 EPA/DHA', category: 'targeted',
      price: 32.90, pricePerDose: '0,55 € / dose', servings: 60, activeDose: '2 g',
      purity: 96, origin: 'Pérou', certifications: ['EPAX', 'Friend of the Sea', 'IFOS 5-stars'], additives: [],
      badges: [{ label: 'Targeted', tone: 'lime' }, { label: 'Cerveau', tone: '' }],
      description: "Huile de poisson EPAX, 2 g d'oméga-3 dont 1200 mg d'EPA et 800 mg de DHA par dose. Pêche anchois sauvages Pérou, désoxydée à froid.",
      scoreEfficacy: 91, scorePrice: 78,
      breakdown: { dosage: 36, purity: 28, certif: 19, trace: 8 },
      whyScore: [
        "2 g d'oméga-3 par dose dont 1200 EPA + 800 DHA, doses efficaces validées EFSA",
        "Pureté 96 % avec norme IFOS 5 étoiles (la plus stricte sur l'oxydation et la pollution)",
        "Triple certif : EPAX (fabricant norvégien référence) + Friend of the Sea + IFOS",
        "Anchois sauvages Pérou : espèce non endémique, pêche durable certifiée",
        "Désoxydation à froid : pas de rancissement, pas d'arrière-goût"
      ],
      composition: {
        ingredients: [
          { name: 'Huile de poisson EPAX (anchois)', dose: '2,1 g' },
          { name: 'Tocophérols mixtes (anti-oxydant naturel)', dose: '8 mg' },
          { name: 'Capsule gélatine de poisson', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Oméga-3 totaux', value: '2 g' },
          { label: 'EPA', value: '1200 mg' },
          { label: 'DHA', value: '800 mg' },
          { label: 'Vitamine E', value: '8 mg' }
        ]
      },
      reviews: [
        { author: 'Caroline H.', rating: 5, weeks: 16, verified: true, helpful: 18,
          comment: "Aucun goût de poisson en remontée. Triglycérides en baisse aux dernières analyses. La certification IFOS 5★ rassure." },
        { author: 'Marc K.', rating: 5, weeks: 8, verified: true, helpful: 11,
          comment: "Top en complément d'un régime peu poissonneux. Le rapport EPA/DHA est cohérent avec la littérature." },
        { author: 'Jeanne A.', rating: 4, weeks: 24, verified: false, helpful: 7,
          comment: "Boîte de 60 = 1 mois si 2 capsules/jour. C'est cher mais la qualité Nutripure est constante." }
      ]
    },
    /* ----- Phase 10 — 18 produits supplémentaires (30 total) ----- */
    {
      id: 'vtc', mark: 'VTC', brand: 'D-Lab', name: 'Vitamine C Liposomale', category: 'vitality',
      price: 26.90, pricePerDose: '0,90 € / dose', servings: 30, activeDose: '1000 mg',
      purity: 92, origin: 'France', certifications: ['ISO 22000', 'GMP'], additives: [],
      badges: [{ label: 'Vitalité', tone: 'lime' }, { label: 'Immunité', tone: '' }],
      description: "Vitamine C liposomale, encapsulation dans des phospholipides pour multiplier l'absorption par 3 vs ascorbate classique.",
      scoreEfficacy: 89, scorePrice: 68,
      breakdown: { dosage: 38, purity: 27, certif: 14, trace: 10 },
      whyScore: [
        "1000 mg par dose, dose efficace pour soutien immunitaire (vs 80 mg AJR de maintenance)",
        "Forme liposomale : absorption 3× supérieure aux ascorbates classiques",
        "Pureté 92 % : pas d'agent d'enrobage controversé",
        "Origine France, certifications ISO 22000 + GMP"
      ],
      composition: {
        ingredients: [
          { name: 'Acide L-ascorbique liposomé', dose: '1000 mg' },
          { name: 'Phospholipides de tournesol (lécithine)', dose: '500 mg' },
          { name: 'Glycérine végétale', dose: '100 mg' }
        ],
        perDose: [
          { label: 'Vitamine C', value: '1000 mg' },
          { label: 'AJR couvert', value: '1250 %' },
          { label: 'Forme', value: 'Liposomale' },
          { label: 'Absorption', value: 'x 3' }
        ]
      },
      reviews: [
        { author: 'Sophie B.', rating: 5, weeks: 8, verified: true, helpful: 14,
          comment: "Pris en cure d'attaque sur 8 semaines. Aucun trouble digestif contrairement à la vitamine C classique." },
        { author: 'Thomas D.', rating: 4, weeks: 12, verified: false, helpful: 7,
          comment: "Bon produit, format liquide pratique. Cher mais ça vaut le coup en hiver." }
      ]
    },
    {
      id: 'znc', mark: 'ZNC', brand: 'Nutripure', name: 'Zinc Bisglycinate', category: 'vitality',
      price: 14.90, pricePerDose: '0,12 € / dose', servings: 120, activeDose: '15 mg',
      purity: 90, origin: 'France', certifications: ['Albion TRAACS', 'ISO 22000'], additives: [],
      badges: [{ label: 'Vitalité', tone: 'lime' }],
      description: "Zinc bisglycinate Albion, la forme chélatée la mieux assimilée. 15 mg par dose, couvre les besoins quotidiens.",
      scoreEfficacy: 88, scorePrice: 95,
      breakdown: { dosage: 36, purity: 27, certif: 16, trace: 9 },
      whyScore: [
        "15 mg par dose, 150 % des AJR sans dépasser la limite ANSES (25 mg)",
        "Forme bisglycinate Albion TRAACS : assimilation supérieure aux oxydes/sulfates",
        "Pureté 90 % avec gélule pullulane végétale",
        "Score prix excellent : 0,12 € / dose, dans le top 5 % catégorie"
      ],
      composition: {
        ingredients: [
          { name: 'Zinc bisglycinate Albion TRAACS', dose: '75 mg' },
          { name: 'Gélule pullulane', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Zinc élément', value: '15 mg' },
          { label: 'Forme', value: 'Bisglycinate' },
          { label: 'AJR couvert', value: '150 %' },
          { label: 'Source', value: 'Albion' }
        ]
      },
      reviews: [
        { author: 'Léo M.', rating: 5, weeks: 16, verified: true, helpful: 12,
          comment: "Cure tous les hivers, prix imbattable. Aucun arrière-goût métallique." },
        { author: 'Inès R.', rating: 5, weeks: 8, verified: false, helpful: 6,
          comment: "Acné régulée après 6 semaines. Format gélule pratique." }
      ]
    },
    {
      id: 'fer', mark: 'FER', brand: 'Apyforme', name: 'Fer Bisglycinate', category: 'vitality',
      price: 18.90, pricePerDose: '0,32 € / dose', servings: 60, activeDose: '14 mg',
      purity: 88, origin: 'France', certifications: ['Albion TRAACS', 'Vegan'], additives: [],
      badges: [{ label: 'Vitalité', tone: 'lime' }, { label: 'Femme', tone: '' }],
      description: "Fer bisglycinate Albion 14 mg, dose AJR adaptée à la supplémentation féminine. Vegan, sans gluten.",
      scoreEfficacy: 85, scorePrice: 78,
      breakdown: { dosage: 34, purity: 26, certif: 15, trace: 10 },
      whyScore: [
        "14 mg de fer élément par dose, 100 % des AJR femme adulte",
        "Bisglycinate Albion : assimilation supérieure et tolérance digestive",
        "Vegan certifié + Made in France traçable",
        "Sans constipation aux retours utilisateurs (vs fumarate/sulfate)"
      ],
      composition: {
        ingredients: [
          { name: 'Fer bisglycinate Albion TRAACS', dose: '70 mg' },
          { name: 'Vitamine C ascorbique (cofacteur)', dose: '40 mg' },
          { name: 'Gélule HPMC végétale', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Fer élément', value: '14 mg' },
          { label: 'Vitamine C', value: '40 mg' },
          { label: 'AJR femme', value: '100 %' },
          { label: 'Forme', value: 'Bisglycinate' }
        ]
      },
      reviews: [
        { author: 'Camille S.', rating: 5, weeks: 12, verified: true, helpful: 17,
          comment: "Anémie ferriprive post-grossesse. Ferritine remontée de 14 à 42 ng/mL en 3 mois. Aucun trouble digestif." },
        { author: 'Élodie F.', rating: 4, weeks: 8, verified: true, helpful: 9,
          comment: "Cure semestrielle. Vitamine C ajoutée intéressante pour l'absorption." }
      ]
    },
    {
      id: 'val', mark: 'VAL', brand: 'Solgar', name: 'Valériane Standardisée', category: 'sleep',
      price: 19.90, pricePerDose: '0,66 € / dose', servings: 30, activeDose: '500 mg',
      purity: 85, origin: 'États-Unis', certifications: ['Kosher', 'GMP'], additives: ['Stéarate de magnésium'],
      badges: [{ label: 'Sommeil', tone: 'mercury' }],
      description: "Extrait sec de racine de valériane, standardisé à 0,8 % d'acides valéréniques. 500 mg par dose, prise 30 min avant le coucher.",
      scoreEfficacy: 81, scorePrice: 72,
      breakdown: { dosage: 32, purity: 23, certif: 12, trace: 14 },
      whyScore: [
        "500 mg d'extrait sec, dose validée par EMA pour l'endormissement léger",
        "Standardisation 0,8 % acides valéréniques (principe actif quantifié)",
        "Pénalité : présence de stéarate de magnésium en excipient",
        "Origine États-Unis non détaillée à la ferme"
      ],
      composition: {
        ingredients: [
          { name: 'Extrait sec de racine de valériane', dose: '500 mg' },
          { name: 'Stéarate de magnésium', dose: '15 mg' },
          { name: 'Capsule gélatine bovine', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Valériane', value: '500 mg' },
          { label: 'Acides valéréniques', value: '4 mg (0,8 %)' },
          { label: 'Forme', value: 'Extrait sec' },
          { label: 'Délai d\'action', value: '30-60 min' }
        ]
      },
      reviews: [
        { author: 'Bertrand T.', rating: 4, weeks: 6, verified: true, helpful: 8,
          comment: "Efficace en complément d'une mauvaise hygiène de sommeil. Odeur forte mais s'oublie une fois la gélule avalée." },
        { author: 'Aurélie P.', rating: 3, weeks: 4, verified: false, helpful: 3,
          comment: "Effet modéré. Je préfère désormais l'ashwagandha selon les recommandations Skynova." }
      ]
    },
    {
      id: 'gab', mark: 'GAB', brand: 'Nutrimea', name: 'GABA Pure 500 mg', category: 'sleep',
      price: 17.50, pricePerDose: '0,29 € / dose', servings: 60, activeDose: '500 mg',
      purity: 89, origin: 'Japon', certifications: ['Pharma-GABA', 'GMP'], additives: [],
      badges: [{ label: 'Sommeil', tone: 'mercury' }, { label: 'Stress', tone: '' }],
      description: "GABA naturel issu de la fermentation Pharma-GABA (Lactobacillus hilgardii). 500 mg par dose, effet relaxant rapide.",
      scoreEfficacy: 78, scorePrice: 84,
      breakdown: { dosage: 30, purity: 24, certif: 16, trace: 8 },
      whyScore: [
        "500 mg de GABA Pharma-GABA fermenté, vs GABA synthétique générique",
        "Pureté 89 % : pas d'excipient controversé",
        "Pharma-GABA + GMP : certifications spécifiques de la matière première",
        "Pénalité dosage : limite assimilation BHE débattue scientifiquement"
      ],
      composition: {
        ingredients: [
          { name: 'GABA Pharma-GABA (fermentation Lactobacillus)', dose: '500 mg' },
          { name: 'Gélule HPMC végétale', dose: 'qsp' }
        ],
        perDose: [
          { label: 'GABA', value: '500 mg' },
          { label: 'Source', value: 'Pharma-GABA' },
          { label: 'Origine', value: 'Fermentation' },
          { label: 'Délai', value: '30 min' }
        ]
      },
      reviews: [
        { author: 'Pierre L.', rating: 4, weeks: 4, verified: true, helpful: 6,
          comment: "Effet calmant net en 30 min. Je le prends en cas de stress aigu, pas en routine." },
        { author: 'Marie K.', rating: 4, weeks: 8, verified: false, helpful: 4,
          comment: "Bon prix au gramme, à utiliser ponctuellement plutôt qu'en fond." }
      ]
    },
    {
      id: 'enz', mark: 'ENZ', brand: 'Now Foods', name: 'Enzymes Digestives Complètes', category: 'digestion',
      price: 22.50, pricePerDose: '0,30 € / dose', servings: 75, activeDose: '1 capsule',
      purity: 86, origin: 'États-Unis', certifications: ['GMP', 'Kosher'], additives: ['Stéarate de magnésium'],
      badges: [{ label: 'Digestion', tone: 'lime' }],
      description: "Complexe 9 enzymes digestives (amylase, lipase, protéase, lactase, cellulase…) pour soutenir la digestion des repas lourds.",
      scoreEfficacy: 79, scorePrice: 81,
      breakdown: { dosage: 30, purity: 24, certif: 12, trace: 13 },
      whyScore: [
        "9 enzymes complémentaires (protéase, lipase, amylase, lactase, cellulase…)",
        "Concentration totale 200 mg, dose unique par repas",
        "Pénalité : stéarate de magnésium présent comme glidant",
        "Origine États-Unis non détaillée à la souche"
      ],
      composition: {
        ingredients: [
          { name: 'Complexe enzymatique (9 enzymes)', dose: '200 mg' },
          { name: 'Bromélaïne', dose: '50 mg' },
          { name: 'Stéarate de magnésium', dose: '10 mg' }
        ],
        perDose: [
          { label: 'Enzymes', value: '9 souches' },
          { label: 'Complexe', value: '200 mg' },
          { label: 'Bromélaïne', value: '50 mg' },
          { label: 'Capsule', value: 'Végétale' }
        ]
      },
      reviews: [
        { author: 'Jean-Marc V.', rating: 4, weeks: 6, verified: true, helpful: 10,
          comment: "Pris avant les repas copieux. Ballonnements en nette baisse, plus de somnolence post-repas." },
        { author: 'Sandra B.', rating: 4, weeks: 4, verified: false, helpful: 5,
          comment: "Utile en voyage avec changements alimentaires. À avoir dans la trousse." }
      ]
    },
    {
      id: 'cha', mark: 'CHA', brand: 'Nutrimea', name: 'Charbon Végétal Activé', category: 'digestion',
      price: 12.90, pricePerDose: '0,11 € / dose', servings: 120, activeDose: '500 mg',
      purity: 95, origin: 'France', certifications: ['AB', 'EU Organic'], additives: [],
      badges: [{ label: 'Digestion', tone: 'lime' }],
      description: "Charbon végétal activé issu de coques de noix de coco bio. 500 mg par dose, absorbe les gaz intestinaux et toxines.",
      scoreEfficacy: 82, scorePrice: 95,
      breakdown: { dosage: 30, purity: 28, certif: 14, trace: 10 },
      whyScore: [
        "500 mg de charbon activé par dose, dose efficace validée par l'EFSA pour les gaz",
        "Pureté 95 % issue de coques de noix de coco bio",
        "AB + EU Organic + origine France traçable",
        "Score prix imbattable : 0,11 € / dose"
      ],
      composition: {
        ingredients: [
          { name: 'Charbon végétal activé bio (coque de noix de coco)', dose: '500 mg' },
          { name: 'Gélule HPMC végétale', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Charbon activé', value: '500 mg' },
          { label: 'Source', value: 'Noix de coco bio' },
          { label: 'Pouvoir absorbant', value: '950 m²/g' },
          { label: 'Forme', value: 'Activé' }
        ]
      },
      reviews: [
        { author: 'Élodie K.', rating: 5, weeks: 8, verified: true, helpful: 11,
          comment: "Imbattable contre les ballonnements post-repas. Goût neutre, pas de coloration des dents." },
        { author: 'Vincent R.', rating: 4, weeks: 12, verified: false, helpful: 6,
          comment: "Attention à espacer des médicaments de 2h (interaction absorbante)." }
      ]
    },
    {
      id: 'bio', mark: 'BIO', brand: 'Solgar', name: 'Biotine 10 000 µg', category: 'beauty',
      price: 16.50, pricePerDose: '0,28 € / dose', servings: 60, activeDose: '10 000 µg',
      purity: 84, origin: 'États-Unis', certifications: ['Kosher', 'GMP'], additives: ['Stéarate de magnésium'],
      badges: [{ label: 'Beauté', tone: 'lime' }, { label: 'Cheveux', tone: '' }],
      description: "Biotine (vitamine B8) à haut dosage 10 000 µg pour la croissance des cheveux et la santé de la peau.",
      scoreEfficacy: 84, scorePrice: 82,
      breakdown: { dosage: 38, purity: 22, certif: 12, trace: 12 },
      whyScore: [
        "10 000 µg par dose, dose haute validée pour cure cheveux/ongles",
        "Pureté 84 % avec présence de stéarate (pénalité)",
        "Origine États-Unis traçable à Carlstadt (NJ)",
        "Sans gluten, sans soja, sans levure"
      ],
      composition: {
        ingredients: [
          { name: 'Biotine (D-biotine)', dose: '10 000 µg' },
          { name: 'Cellulose microcristalline', dose: '180 mg' },
          { name: 'Stéarate de magnésium', dose: '12 mg' }
        ],
        perDose: [
          { label: 'Biotine', value: '10 000 µg' },
          { label: 'AJR couvert', value: '20 000 %' },
          { label: 'Forme', value: 'D-biotine' },
          { label: 'Capsule', value: 'Végétale' }
        ]
      },
      reviews: [
        { author: 'Léna G.', rating: 5, weeks: 12, verified: true, helpful: 15,
          comment: "Cheveux visiblement plus épais à 3 mois. Repousse plus rapide. Marque historique, confiance." },
        { author: 'Marc B.', rating: 4, weeks: 8, verified: false, helpful: 7,
          comment: "Bon produit mais le stéarate de magnésium est dommage à ce prix-là." }
      ]
    },
    {
      id: 'hya', mark: 'HYA', brand: 'D-Lab', name: 'Acide Hyaluronique 200 mg', category: 'beauty',
      price: 32.90, pricePerDose: '1,10 € / dose', servings: 30, activeDose: '200 mg',
      purity: 92, origin: 'France', certifications: ['Pharmacopée européenne', 'ISO 22000'], additives: [],
      badges: [{ label: 'Beauté', tone: 'lime' }, { label: 'Peau', tone: '' }],
      description: "Acide hyaluronique bas et haut poids moléculaire combinés. 200 mg par dose pour hydratation profonde et superficielle.",
      scoreEfficacy: 81, scorePrice: 58,
      breakdown: { dosage: 32, purity: 28, certif: 12, trace: 9 },
      whyScore: [
        "200 mg par dose, dose suprathérapeutique pour effet hydratation cutanée",
        "Bas + haut poids moléculaire : couverture biologique complète",
        "Made in France + Pharmacopée européenne (qualité pharma)",
        "Pénalité prix : 1,10 € / dose, parmi les plus chers du marché"
      ],
      composition: {
        ingredients: [
          { name: 'Acide hyaluronique bas PM (50 kDa)', dose: '100 mg' },
          { name: 'Acide hyaluronique haut PM (1500 kDa)', dose: '100 mg' },
          { name: 'Gélule HPMC végétale', dose: 'qsp' }
        ],
        perDose: [
          { label: 'AH total', value: '200 mg' },
          { label: 'Bas PM', value: '100 mg' },
          { label: 'Haut PM', value: '100 mg' },
          { label: 'Origine', value: 'France' }
        ]
      },
      reviews: [
        { author: 'Mathilde C.', rating: 5, weeks: 12, verified: true, helpful: 13,
          comment: "Peau visiblement plus rebondie à 2 mois. Cher mais résultats au rendez-vous." },
        { author: 'Karim L.', rating: 4, weeks: 8, verified: false, helpful: 5,
          comment: "Bon produit pour les peaux matures. Le prix freine en routine." }
      ]
    },
    {
      id: 'ker', mark: 'KER', brand: 'Apyforme', name: 'Kératine + Silice', category: 'beauty',
      price: 24.90, pricePerDose: '0,83 € / dose', servings: 30, activeDose: '500 mg',
      purity: 88, origin: 'France', certifications: ['ISO 22000', 'Made in France'], additives: [],
      badges: [{ label: 'Beauté', tone: 'lime' }, { label: 'Ongles', tone: '' }],
      description: "Kératine hydrolysée + silice organique de bambou. Cure cheveux ongles 30 jours, 500 mg par dose.",
      scoreEfficacy: 79, scorePrice: 68,
      breakdown: { dosage: 28, purity: 25, certif: 14, trace: 12 },
      whyScore: [
        "500 mg de kératine hydrolysée + 80 mg silice bambou par dose",
        "Combinaison synergique cheveux/ongles validée études cliniques",
        "Made in France ISO 22000",
        "Pénalité dosage : kératine seule sous-dosée vs études (≥ 700 mg/jour)"
      ],
      composition: {
        ingredients: [
          { name: 'Kératine hydrolysée', dose: '500 mg' },
          { name: 'Silice de bambou (70 % silicium)', dose: '80 mg' },
          { name: 'Gélule HPMC', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Kératine', value: '500 mg' },
          { label: 'Silice', value: '80 mg' },
          { label: 'Silicium', value: '56 mg' },
          { label: 'Cure', value: '30 jours' }
        ]
      },
      reviews: [
        { author: 'Aïcha M.', rating: 4, weeks: 8, verified: true, helpful: 8,
          comment: "Ongles visiblement plus solides. Cheveux moins cassants. Cure de 2 mois recommandée minimum." },
        { author: 'Anne D.', rating: 4, weeks: 12, verified: false, helpful: 4,
          comment: "Bon produit en cure printemps/automne. Marque française appréciable." }
      ]
    },
    {
      id: 'glu', mark: 'GLU', brand: 'Yves Ponroy', name: 'Glucosamine 1500 mg', category: 'joints',
      price: 19.90, pricePerDose: '0,66 € / dose', servings: 30, activeDose: '1500 mg',
      purity: 87, origin: 'France', certifications: ['Crustacés tracé', 'ISO 22000'], additives: [],
      badges: [{ label: 'Articulaire', tone: 'lime' }],
      description: "Glucosamine sulfate 1500 mg en dose unique journalière. Issue de la chitine de crustacés tracée.",
      scoreEfficacy: 82, scorePrice: 74,
      breakdown: { dosage: 34, purity: 26, certif: 12, trace: 10 },
      whyScore: [
        "1500 mg par dose, dose validée EMA pour l'arthrose modérée",
        "Sulfate (forme la plus étudiée, > 200 essais cliniques)",
        "Origine crustacés tracée filière France",
        "Sans certification bio (origine animale marine)"
      ],
      composition: {
        ingredients: [
          { name: 'Glucosamine sulfate (chitine de crustacés)', dose: '1500 mg' },
          { name: 'Gélule gélatine bovine', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Glucosamine', value: '1500 mg' },
          { label: 'Forme', value: 'Sulfate' },
          { label: 'Source', value: 'Crustacés FR' },
          { label: 'Dose unique', value: 'Oui' }
        ]
      },
      reviews: [
        { author: 'Pierre G.', rating: 4, weeks: 24, verified: true, helpful: 16,
          comment: "Arthrose genou. Effet net à 3 mois sur la mobilité. Yves Ponroy reste une référence en pharmacie." },
        { author: 'Geneviève F.', rating: 5, weeks: 16, verified: false, helpful: 9,
          comment: "Pris quotidiennement depuis 1 an. Crises moins fréquentes." }
      ]
    },
    {
      id: 'msm', mark: 'MSM', brand: 'Now Foods', name: 'MSM Pur 1500 mg', category: 'joints',
      price: 18.50, pricePerDose: '0,31 € / dose', servings: 60, activeDose: '1500 mg',
      purity: 99, origin: 'États-Unis', certifications: ['OptiMSM', 'GMP'], additives: [],
      badges: [{ label: 'Articulaire', tone: 'lime' }, { label: 'Inflammation', tone: '' }],
      description: "MSM (méthylsulfonylméthane) OptiMSM, la forme la plus pure du marché. 1500 mg par dose pour soutien articulaire.",
      scoreEfficacy: 78, scorePrice: 85,
      breakdown: { dosage: 32, purity: 28, certif: 12, trace: 6 },
      whyScore: [
        "1500 mg de MSM par dose, dose validée pour l'inflammation chronique",
        "Pureté 99 % OptiMSM (marque brevetée Bergstrom)",
        "Sans additif controversé, capsule pure",
        "Pénalité origine : États-Unis sans traçabilité au producteur"
      ],
      composition: {
        ingredients: [
          { name: 'MSM OptiMSM (méthylsulfonylméthane)', dose: '1500 mg' },
          { name: 'Gélule HPMC végétale', dose: 'qsp' }
        ],
        perDose: [
          { label: 'MSM', value: '1500 mg' },
          { label: 'Source', value: 'OptiMSM' },
          { label: 'Pureté', value: '99,9 %' },
          { label: 'Soufre bio', value: '510 mg' }
        ]
      },
      reviews: [
        { author: 'Marc R.', rating: 4, weeks: 12, verified: true, helpful: 9,
          comment: "Pris en complément de la curcumine. Synergie nette sur les douleurs cervicales." },
        { author: 'Hélène M.', rating: 4, weeks: 8, verified: false, helpful: 5,
          comment: "Bon rapport qualité-prix, surtout en combo avec un autre actif articulaire." }
      ]
    },
    {
      id: 'ct2', mark: 'CT2', brand: 'Nutripure', name: 'Collagène Type II UC-II', category: 'joints',
      price: 29.90, pricePerDose: '1,00 € / dose', servings: 30, activeDose: '40 mg',
      purity: 95, origin: 'États-Unis', certifications: ['UC-II', 'GMP'], additives: [],
      badges: [{ label: 'Articulaire', tone: 'lime' }, { label: 'Cartilage', tone: '' }],
      description: "Collagène Type II non dénaturé UC-II. 40 mg par dose, dose efficace prouvée pour le cartilage articulaire.",
      scoreEfficacy: 87, scorePrice: 65,
      breakdown: { dosage: 36, purity: 27, certif: 14, trace: 10 },
      whyScore: [
        "40 mg UC-II par dose, dose efficace cliniquement validée (vs 1500 mg de glucosamine)",
        "Type II non dénaturé : action immuno-modulatrice ciblée cartilage",
        "UC-II trademark + GMP : qualité contrôlée Lonza",
        "Pénalité prix : 1 €/dose vs 0,66 € glucosamine"
      ],
      composition: {
        ingredients: [
          { name: 'Collagène natif Type II UC-II', dose: '40 mg' },
          { name: 'Gélule HPMC', dose: 'qsp' }
        ],
        perDose: [
          { label: 'UC-II', value: '40 mg' },
          { label: 'Collagène actif', value: '10 mg' },
          { label: 'Type', value: 'II non dénaturé' },
          { label: 'Source', value: 'Cartilage poulet' }
        ]
      },
      reviews: [
        { author: 'Brigitte C.', rating: 5, weeks: 16, verified: true, helpful: 14,
          comment: "Arthrose des doigts (couture). Souplesse retrouvée à 4 mois. Dose minuscule, efficacité maximale." },
        { author: 'Patrick V.', rating: 4, weeks: 12, verified: false, helpful: 7,
          comment: "Coût élevé mais 40 mg/jour = boîte qui dure. Score Skynova mérité." }
      ]
    },
    {
      id: 'bca', mark: 'BCA', brand: 'MyProtein', name: 'BCAA 2:1:1', category: 'sport',
      price: 21.90, pricePerDose: '0,55 € / dose', servings: 40, activeDose: '7 g',
      purity: 92, origin: 'Royaume-Uni', certifications: ['Informed Sport', 'GMP'], additives: [],
      badges: [{ label: 'Sport', tone: 'lime' }, { label: 'Récupération', tone: '' }],
      description: "BCAA ratio 2:1:1 (leucine/isoleucine/valine). 7 g par dose pour soutenir la récupération musculaire post-entraînement.",
      scoreEfficacy: 84, scorePrice: 82,
      breakdown: { dosage: 34, purity: 26, certif: 16, trace: 8 },
      whyScore: [
        "7 g par dose dont 3,5 g de leucine, atteint le seuil d'activation mTOR",
        "Ratio 2:1:1 validé scientifiquement (vs 4:1:1 ou 8:1:1 marketing)",
        "Informed Sport (zéro contamination) + GMP",
        "Origine Royaume-Uni, fabricant tracé"
      ],
      composition: {
        ingredients: [
          { name: 'L-Leucine instantanée', dose: '3,5 g' },
          { name: 'L-Isoleucine', dose: '1,75 g' },
          { name: 'L-Valine', dose: '1,75 g' },
          { name: 'Arôme naturel + édulcorant sucralose', dose: 'qsp' }
        ],
        perDose: [
          { label: 'BCAA totaux', value: '7 g' },
          { label: 'Leucine', value: '3,5 g' },
          { label: 'Ratio', value: '2:1:1' },
          { label: 'Calories', value: '28 kcal' }
        ]
      },
      reviews: [
        { author: 'Anthony L.', rating: 4, weeks: 8, verified: true, helpful: 11,
          comment: "Pris intra-entrainement. Récupération améliorée, courbatures J+1 réduites. Bon rapport prix." },
        { author: 'Inès B.', rating: 4, weeks: 12, verified: false, helpful: 5,
          comment: "Goût citron correct. Préférable à la whey en cas d'estomac sensible." }
      ]
    },
    {
      id: 'bal', mark: 'BAL', brand: 'Nutrimuscle', name: 'Beta-Alanine Carnosyn', category: 'sport',
      price: 27.90, pricePerDose: '0,46 € / dose', servings: 60, activeDose: '3 g',
      purity: 99, origin: 'États-Unis', certifications: ['CarnoSyn', 'Cologne List'], additives: [],
      badges: [{ label: 'Sport', tone: 'lime' }, { label: 'Endurance', tone: '' }],
      description: "Beta-alanine CarnoSyn brevetée. 3 g par dose pour augmenter la carnosine musculaire et différer la fatigue.",
      scoreEfficacy: 88, scorePrice: 80,
      breakdown: { dosage: 36, purity: 28, certif: 16, trace: 8 },
      whyScore: [
        "3 g par dose, dose efficace pour saturation carnosine après 4 semaines",
        "CarnoSyn (seule beta-alanine brevetée Natural Alternatives Inc.)",
        "Cologne List : zéro contamination anabolisante",
        "Picotements normaux (paresthésie sans danger, signe d'absorption)"
      ],
      composition: {
        ingredients: [
          { name: 'Beta-alanine CarnoSyn', dose: '3 g' },
          { name: 'Gélule HPMC', dose: 'qsp' }
        ],
        perDose: [
          { label: 'Beta-alanine', value: '3 g' },
          { label: 'Source', value: 'CarnoSyn' },
          { label: 'Pureté', value: '99 %' },
          { label: 'Cure', value: '4-12 sem.' }
        ]
      },
      reviews: [
        { author: 'Yann C.', rating: 5, weeks: 8, verified: true, helpful: 13,
          comment: "Effet net sur les efforts longs (CrossFit, sprints). Picotements 20 min après prise, parfaitement inoffensif." },
        { author: 'Sarah F.', rating: 4, weeks: 6, verified: false, helpful: 6,
          comment: "CarnoSyn fait la différence vs beta-alanine générique. Cher mais ça se ressent." }
      ]
    },
    {
      id: 'gnk', mark: 'GNK', brand: 'Solgar', name: 'Ginkgo Biloba 6000', category: 'targeted',
      price: 24.50, pricePerDose: '0,41 € / dose', servings: 60, activeDose: '60 mg',
      purity: 86, origin: 'États-Unis', certifications: ['Standardisé 24/6', 'GMP'], additives: ['Stéarate de magnésium'],
      badges: [{ label: 'Targeted', tone: 'lime' }, { label: 'Cognition', tone: '' }],
      description: "Extrait de Ginkgo Biloba standardisé 24 % flavonoïdes / 6 % terpénoïdes. 60 mg d'extrait (eq. 6000 mg de feuilles).",
      scoreEfficacy: 83, scorePrice: 76,
      breakdown: { dosage: 32, purity: 24, certif: 17, trace: 10 },
      whyScore: [
        "60 mg d'extrait standardisé (24/6), équivalent 6000 mg feuilles fraîches",
        "Standardisation flavonoïdes/terpénoïdes garantie",
        "Pénalité : stéarate de magnésium présent",
        "GMP Solgar, marque historique 1947"
      ],
      composition: {
        ingredients: [
          { name: 'Extrait de Ginkgo Biloba standardisé', dose: '60 mg' },
          { name: 'Cellulose microcristalline', dose: '180 mg' },
          { name: 'Stéarate de magnésium', dose: '12 mg' }
        ],
        perDose: [
          { label: 'Ginkgo extrait', value: '60 mg' },
          { label: 'Flavonoïdes', value: '14 mg (24%)' },
          { label: 'Terpénoïdes', value: '4 mg (6%)' },
          { label: 'Equivalent feuilles', value: '6000 mg' }
        ]
      },
      reviews: [
        { author: 'Robert M.', rating: 4, weeks: 12, verified: true, helpful: 10,
          comment: "Concentration améliorée à 6 semaines. Effet circulatoire jambes lourdes intéressant en plus." },
        { author: 'Christine V.', rating: 4, weeks: 8, verified: false, helpful: 6,
          comment: "Pris pour la mémoire après 60 ans. Effet subtil mais réel selon mon entourage." }
      ]
    },
    {
      id: 'lut', mark: 'LUT', brand: 'Now Foods', name: 'Lutéine 20 mg + Zéaxanthine', category: 'targeted',
      price: 19.90, pricePerDose: '0,33 € / dose', servings: 60, activeDose: '20 mg',
      purity: 90, origin: 'États-Unis', certifications: ['FloraGLO', 'GMP'], additives: [],
      badges: [{ label: 'Targeted', tone: 'lime' }, { label: 'Vision', tone: '' }],
      description: "Lutéine FloraGLO 20 mg + zéaxanthine 4 mg, pour la santé maculaire et la protection contre la lumière bleue.",
      scoreEfficacy: 79, scorePrice: 82,
      breakdown: { dosage: 30, purity: 27, certif: 14, trace: 8 },
      whyScore: [
        "20 mg de lutéine + 4 mg zéaxanthine, ratio 5:1 validé études AREDS2",
        "Source FloraGLO (Kemin) : seule lutéine cliniquement étudiée à grande échelle",
        "Pureté 90 % : huile de carthame comme excipient",
        "Origine États-Unis (Kemin) traçable au lot"
      ],
      composition: {
        ingredients: [
          { name: 'Lutéine FloraGLO', dose: '20 mg' },
          { name: 'Zéaxanthine', dose: '4 mg' },
          { name: 'Huile de carthame', dose: '300 mg' }
        ],
        perDose: [
          { label: 'Lutéine', value: '20 mg' },
          { label: 'Zéaxanthine', value: '4 mg' },
          { label: 'Ratio', value: '5:1' },
          { label: 'Forme', value: 'Softgel' }
        ]
      },
      reviews: [
        { author: 'Henri F.', rating: 4, weeks: 24, verified: true, helpful: 8,
          comment: "Cure préventive DMLA suite à antécédent familial. Bonne tolérance, pas d'effets secondaires." },
        { author: 'Isabelle G.', rating: 4, weeks: 8, verified: false, helpful: 4,
          comment: "Pris pour fatigue oculaire travail écran. Effet subtil mais constant." }
      ]
    },
    {
      id: 'can', mark: 'CAN', brand: 'Apyforme', name: 'Canneberge Bio 36 mg PAC', category: 'targeted',
      price: 22.90, pricePerDose: '0,76 € / dose', servings: 30, activeDose: '36 mg PAC',
      purity: 93, origin: 'France', certifications: ['AB', 'EU Organic', 'Made in France'], additives: [],
      badges: [{ label: 'Targeted', tone: 'lime' }, { label: 'Urinaire', tone: '' }],
      description: "Canneberge bio standardisée 36 mg de proanthocyanidines (PAC), dose validée EFSA pour le confort urinaire.",
      scoreEfficacy: 86, scorePrice: 70,
      breakdown: { dosage: 36, purity: 28, certif: 12, trace: 10 },
      whyScore: [
        "36 mg de PAC par dose, dose efficace prouvée pour prévention cystite",
        "Standardisation PAC dosage HPLC (vs méthode BL-DMAC moins fiable)",
        "AB + EU Organic + Made in France : triple traçabilité bio",
        "Pénalité certifications : pas de Cosmos / Demeter à ce stade"
      ],
      composition: {
        ingredients: [
          { name: 'Extrait de canneberge bio standardisé', dose: '500 mg' },
          { name: 'Gélule HPMC végétale', dose: 'qsp' }
        ],
        perDose: [
          { label: 'PAC', value: '36 mg' },
          { label: 'Canneberge', value: '500 mg' },
          { label: 'Standardisation', value: 'HPLC' },
          { label: 'Origine', value: 'France bio' }
        ]
      },
      reviews: [
        { author: 'Émilie R.', rating: 5, weeks: 16, verified: true, helpful: 18,
          comment: "Cystites récidivantes finies depuis 4 mois de cure. La dose PAC fait toute la différence vs jus de canneberge classique." },
        { author: 'Aline P.', rating: 5, weeks: 8, verified: false, helpful: 9,
          comment: "Apyforme reste ma marque de confiance, qualité française constante." }
      ]
    }
  ];

  function getProductById(id) {
    return PRODUCTS.find(function (p) { return p.id === id; }) || null;
  }

  /* ---------- Phase 10 — Favoris (Supabase + localStorage fallback) ---------- */
  function getFavorites() {
    try {
      const raw = localStorage.getItem('skynova_favorites');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function isFavorite(id) {
    return getFavorites().indexOf(id) !== -1;
  }
  async function toggleFavorite(id) {
    const favs = getFavorites();
    const i = favs.indexOf(id);
    const becomesFav = (i === -1);
    if (becomesFav) favs.push(id);
    else favs.splice(i, 1);
    localStorage.setItem('skynova_favorites', JSON.stringify(favs));

    // If Supabase configured + session active, persist server-side too
    if (supabase) {
      try {
        const uRes = await supabase.auth.getUser();
        const user = uRes.data && uRes.data.user;
        if (user) {
          if (becomesFav) {
            await supabase.from('favorites').insert({ user_id: user.id, product_id: id });
          } else {
            await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', id);
          }
        }
      } catch (e) { /* silent — local stays source of truth in demo */ }
    }
    return becomesFav;
  }
  window.skynova.favorites = { get: getFavorites, is: isFavorite, toggle: toggleFavorite };

  function getCategoryName(catId) {
    const c = CATEGORIES.find(function (x) { return x.id === catId; });
    return c ? c.name : catId;
  }

  function getAlternatives(p, n) {
    n = n || 3;
    return PRODUCTS.filter(function (x) {
      return x.id !== p.id && x.category === p.category;
    }).slice(0, n);
  }

  function getStackFor(p, n) {
    n = n || 2;
    const complement = {
      sport:     ['vitality', 'sleep'],
      sleep:     ['vitality', 'digestion'],
      digestion: ['vitality', 'beauty'],
      beauty:    ['vitality', 'sleep'],
      joints:    ['vitality', 'sport'],
      vitality:  ['sport',    'sleep'],
      targeted:  ['vitality', 'sleep']
    };
    const targets = complement[p.category] || ['vitality'];
    const stack = [];
    for (let i = 0; i < targets.length && stack.length < n; i++) {
      const found = PRODUCTS.find(function (x) {
        return x.category === targets[i] && x.id !== p.id && !stack.find(function (s) { return s.id === x.id; });
      });
      if (found) stack.push(found);
    }
    return stack;
  }

  /* ---------- /search ---------- */
  let searchState = null;
  function getSearchState() {
    if (!searchState) {
      searchState = {
        query: '',
        category: 'all',
        minScore: 0,
        maxPrice: 50,
        certifications: [],
        sort: 'score'
      };
    }
    return searchState;
  }

  const SEARCH_CERTS = ['ISO 22000', 'GMP', 'AB', 'KSM-66', 'Creapure', 'Friend of the Sea'];
  const SEARCH_SORTS = [
    { id: 'score',     label: 'Score décroissant' },
    { id: 'price-asc', label: 'Prix croissant' },
    { id: 'price-desc',label: 'Prix décroissant' },
    { id: 'name',      label: 'Nom (A → Z)' }
  ];

  function applySearchFilters() {
    const s = getSearchState();
    const q = s.query.trim().toLowerCase();
    let list = PRODUCTS.filter(function (p) {
      if (q && (p.name + ' ' + p.brand).toLowerCase().indexOf(q) === -1) return false;
      if (s.category !== 'all' && p.category !== s.category) return false;
      if (p.scoreEfficacy < s.minScore) return false;
      if (p.price > s.maxPrice) return false;
      if (s.certifications.length) {
        const has = s.certifications.every(function (c) {
          return p.certifications.indexOf(c) !== -1;
        });
        if (!has) return false;
      }
      return true;
    });
    list.sort(function (a, b) {
      if (s.sort === 'score')      return b.scoreEfficacy - a.scoreEfficacy;
      if (s.sort === 'price-asc')  return a.price - b.price;
      if (s.sort === 'price-desc') return b.price - a.price;
      if (s.sort === 'name')       return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }

  function searchProductCard(p) {
    const tone = getTone(p.scoreEfficacy);
    return el('a', { href: '#product/' + p.id, class: 'sp-card' }, [
      el('div', { class: 'sp-card__image' }, [
        el('span', { class: 'sp-card__mark mono' }, p.mark),
        el('span', { class: 'sp-card__cat overline mono' }, '· ' + getCategoryName(p.category).split(' ')[0].toUpperCase() + ' ·')
      ]),
      el('div', { class: 'sp-card__body' }, [
        el('span', { class: 'overline sp-card__brand' }, '· ' + p.brand + ' ·'),
        el('h3', { class: 'sp-card__name' }, p.name),
        el('div', { class: 'sp-card__pills' },
          p.badges.map(function (b) {
            return el('span', { class: 'pill' + (b.tone ? ' pill--' + b.tone : '') }, b.label);
          })
        ),
        el('div', { class: 'sp-card__bottom' }, [
          el('div', { class: 'sp-card__price-block' }, [
            el('span', { class: 'sp-card__price mono' }, p.price.toFixed(2).replace('.', ',') + ' €'),
            el('span', { class: 'sp-card__price-per mono' }, p.pricePerDose)
          ]),
          el('span', { class: 'sp-card__score sp-card__score--' + tone + ' mono' }, [
            el('span', null, String(p.scoreEfficacy)),
            el('span', { class: 'sp-card__score-of' }, '/100')
          ])
        ])
      ])
    ]);
  }

  function renderSearch() {
    function rerender() {
      const main = wrap.querySelector('.app-main');
      if (!main) return;
      main.innerHTML = '';
      main.appendChild(buildSearchContent());
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    }

    function buildSearchContent() {
      const s = getSearchState();
      const results = applySearchFilters();

      const filtersPanel = el('aside', { class: 'search-filters' }, [
        el('div', { class: 'search-filters__head' }, [
          el('span', { class: 'overline' }, '· FILTRES ·'),
          el('button', {
            type: 'button',
            class: 'search-filters__reset mono',
            onclick: function () {
              searchState = null;
              rerender();
            }
          }, '× Reset')
        ]),

        // Categories
        el('div', { class: 'search-filter' }, [
          el('span', { class: 'overline search-filter__label' }, '· Catégorie ·'),
          el('div', { class: 'search-filter__chips' }, [
            el('button', {
              type: 'button',
              class: 'sf-chip' + (s.category === 'all' ? ' is-active' : ''),
              onclick: function () { s.category = 'all'; rerender(); }
            }, 'Toutes (' + PRODUCTS.length + ')')
          ].concat(CATEGORIES.map(function (c) {
            const count = PRODUCTS.filter(function (p) { return p.category === c.id; }).length;
            return el('button', {
              type: 'button',
              class: 'sf-chip' + (s.category === c.id ? ' is-active' : ''),
              onclick: function () { s.category = c.id; rerender(); }
            }, c.name + ' (' + count + ')');
          })))
        ]),

        // Min score
        el('div', { class: 'search-filter' }, [
          el('div', { class: 'search-filter__head-row' }, [
            el('span', { class: 'overline search-filter__label' }, '· Score minimum ·'),
            el('span', { class: 'search-filter__value mono' }, String(s.minScore) + ' / 100')
          ]),
          el('input', {
            type: 'range', min: '0', max: '100', step: '5',
            value: String(s.minScore),
            class: 'search-filter__slider',
            oninput: function (e) {
              s.minScore = parseInt(e.target.value, 10);
              const v = wrap.querySelectorAll('.search-filter__value')[0];
              if (v) v.textContent = s.minScore + ' / 100';
              // Defer rerender to avoid sliding lag
              clearTimeout(s._scoreTO);
              s._scoreTO = setTimeout(rerender, 180);
            }
          })
        ]),

        // Max price
        el('div', { class: 'search-filter' }, [
          el('div', { class: 'search-filter__head-row' }, [
            el('span', { class: 'overline search-filter__label' }, '· Prix maximum ·'),
            el('span', { class: 'search-filter__value mono' }, s.maxPrice + ' €')
          ]),
          el('input', {
            type: 'range', min: '10', max: '50', step: '5',
            value: String(s.maxPrice),
            class: 'search-filter__slider',
            oninput: function (e) {
              s.maxPrice = parseInt(e.target.value, 10);
              const v = wrap.querySelectorAll('.search-filter__value')[1];
              if (v) v.textContent = s.maxPrice + ' €';
              clearTimeout(s._priceTO);
              s._priceTO = setTimeout(rerender, 180);
            }
          })
        ]),

        // Certifications
        el('div', { class: 'search-filter' }, [
          el('span', { class: 'overline search-filter__label' }, '· Certifications ·'),
          el('div', { class: 'search-filter__chips' },
            SEARCH_CERTS.map(function (c) {
              return el('button', {
                type: 'button',
                class: 'sf-chip sf-chip--sm' + (s.certifications.indexOf(c) !== -1 ? ' is-active' : ''),
                onclick: function () {
                  const i = s.certifications.indexOf(c);
                  if (i === -1) s.certifications.push(c);
                  else s.certifications.splice(i, 1);
                  rerender();
                }
              }, c);
            })
          )
        ])
      ]);

      const resultsArea = el('section', { class: 'search-results' }, [
        // Search bar
        el('div', { class: 'search-bar' }, [
          el('i', { 'data-lucide': 'search', class: 'search-bar__icon' }),
          el('input', {
            type: 'search',
            placeholder: 'Cherche par nom, marque ou principe actif…',
            value: s.query,
            class: 'search-bar__input',
            oninput: function (e) {
              s.query = e.target.value;
              clearTimeout(s._qTO);
              s._qTO = setTimeout(rerender, 180);
            }
          })
        ]),

        // Sort bar
        el('div', { class: 'search-sort-bar' }, [
          el('span', { class: 'overline mono search-sort-bar__count' },
            '· ' + results.length + ' / ' + PRODUCTS.length + ' produits ·'),
          el('div', { class: 'search-sort-bar__sort' }, [
            el('span', { class: 'overline search-sort-bar__sort-label' }, 'Trier par'),
            el('div', { class: 'search-sort-bar__chips' },
              SEARCH_SORTS.map(function (so) {
                return el('button', {
                  type: 'button',
                  class: 'sf-chip sf-chip--sm' + (s.sort === so.id ? ' is-active' : ''),
                  onclick: function () { s.sort = so.id; rerender(); }
                }, so.label);
              })
            )
          ])
        ]),

        // Grid or empty state
        results.length === 0
          ? el('div', { class: 'search-empty' }, [
              el('i', { 'data-lucide': 'search-x', class: 'search-empty__icon' }),
              el('h3', { class: 'search-empty__title' }, 'Aucun produit ne correspond.'),
              el('p', { class: 'search-empty__sub' }, "Essaie d'élargir tes filtres ou de réinitialiser."),
              el('button', {
                type: 'button',
                class: 'cta cta--secondary',
                onclick: function () { searchState = null; rerender(); }
              }, '× Réinitialiser')
            ])
          : el('div', { class: 'search-grid' }, results.map(searchProductCard))
      ]);

      return el('div', { class: 'search-page' }, [
        el('header', { class: 'search-page__head' }, [
          el('span', { class: 'overline mono' }, '· EXPLORATION · 2 200 RÉFÉRENCES ·'),
          el('h1', { class: 'search-page__title' }, [
            'Trouve ',
            el('span', { class: 'search-page__title-lime' }, 'le bon complément.')
          ])
        ]),
        el('div', { class: 'search-layout' }, [filtersPanel, resultsArea])
      ]);
    }

    const wrap = appLayout('search', buildSearchContent());
    return wrap;
  }

  /* ---------- /product/:id ---------- */
  function bigGauge(value, label, tone) {
    const wrap = el('div', { class: 'big-gauge' });
    const g = renderGauge(value, { size: 200, stroke: 10, tone: tone, delay: 200 });
    wrap.appendChild(g);
    wrap.appendChild(el('div', { class: 'big-gauge__meta' }, [
      el('span', { class: 'overline big-gauge__label' }, label),
      el('span', { class: 'big-gauge__hint mono' },
        value >= 85 ? 'EXCELLENT' :
        value >= 70 ? 'BON' :
        value >= 50 ? 'MOYEN' : 'À ÉVITER')
    ]));
    return wrap;
  }

  function breakdownRow(label, weight, value, color) {
    const pct = value / weight * 100;
    return el('div', { class: 'breakdown-row' }, [
      el('span', { class: 'breakdown-row__label' }, label),
      el('div', { class: 'breakdown-row__bar' }, [
        el('div', { class: 'breakdown-row__fill breakdown-row__fill--' + color, style: { width: pct + '%' } })
      ]),
      el('span', { class: 'breakdown-row__val mono' }, value + ' / ' + weight)
    ]);
  }

  function reviewItem(r) {
    return el('article', { class: 'review-item' }, [
      el('header', { class: 'review-item__head' }, [
        el('div', { class: 'review-item__author' }, [
          el('span', { class: 'review-item__author-name' }, r.author),
          el('span', { class: 'review-item__rating', 'aria-label': r.rating + ' étoiles sur 5' },
            '★★★★★'.slice(0, r.rating) + '☆☆☆☆☆'.slice(0, 5 - r.rating)
          )
        ]),
        el('div', { class: 'review-item__meta mono' }, [
          r.verified ? el('span', { class: 'review-item__verified' }, '✓ Achat vérifié') : null,
          el('span', null, '· Cure ' + r.weeks + ' semaines'),
          el('span', { class: 'review-item__helpful' }, '· ' + r.helpful + ' utiles')
        ])
      ]),
      el('p', { class: 'review-item__body' }, r.comment)
    ]);
  }

  function altMiniCard(p) {
    const tone = getTone(p.scoreEfficacy);
    return el('a', { href: '#product/' + p.id, class: 'alt-mini' }, [
      el('div', { class: 'alt-mini__image' }, [
        el('span', { class: 'alt-mini__mark mono' }, p.mark)
      ]),
      el('div', { class: 'alt-mini__body' }, [
        el('span', { class: 'overline alt-mini__brand' }, '· ' + p.brand + ' ·'),
        el('span', { class: 'alt-mini__name' }, p.name),
        el('div', { class: 'alt-mini__bottom' }, [
          el('span', { class: 'alt-mini__price mono' }, p.price.toFixed(2).replace('.', ',') + ' €'),
          el('span', { class: 'alt-mini__score alt-mini__score--' + tone + ' mono' },
            String(p.scoreEfficacy) + '/100')
        ])
      ])
    ]);
  }

  function renderProduct(params) {
    const id = (params && params[0]) || 'whe';
    const p = getProductById(id) || PRODUCTS[0];
    const tone = getTone(p.scoreEfficacy);
    const priceTone = getTone(p.scorePrice);

    const content = el('article', { class: 'product-page' }, [
      el('div', { class: 'product-page__back-row' }, [
        el('a', { href: '#search', class: 'product-page__back mono' }, '← Retour à la recherche')
      ]),

      // HERO
      el('section', { class: 'product-hero' }, [
        el('div', { class: 'product-hero__image' }, [
          el('div', { class: 'product-hero__image-top' }, [
            el('span', { class: 'mono product-hero__image-tag' }, 'REF · SKY-' + p.id.toUpperCase() + '-001'),
            el('span', { class: 'mono product-hero__image-tag product-hero__image-tag--live' }, [
              el('span', { class: 'product-hero__live-dot', 'aria-hidden': 'true' }),
              'SCAN OK'
            ])
          ]),
          el('div', { class: 'product-hero__mark mono', 'aria-hidden': 'true' }, p.mark),
          el('div', { class: 'product-hero__image-bottom' }, [
            el('span', { class: 'mono product-hero__image-tag' }, p.activeDose + ' / dose')
          ])
        ]),
        el('div', { class: 'product-hero__body' }, [
          el('span', { class: 'overline product-hero__cat' }, '· ' + getCategoryName(p.category).toUpperCase() + ' ·'),
          el('span', { class: 'overline product-hero__brand mono' }, '· ' + p.brand + ' ·'),
          el('h1', { class: 'product-hero__name' }, p.name),
          el('p', { class: 'product-hero__desc' }, p.description),
          el('div', { class: 'product-hero__pills' },
            p.badges.map(function (b) {
              return el('span', { class: 'pill' + (b.tone ? ' pill--' + b.tone : '') }, b.label);
            })
          ),
          el('div', { class: 'product-hero__price-row' }, [
            el('div', null, [
              el('span', { class: 'product-hero__price mono' }, p.price.toFixed(2).replace('.', ',') + ' €'),
              el('span', { class: 'product-hero__price-per mono' }, ' · ' + p.pricePerDose)
            ]),
            el('span', { class: 'product-hero__servings mono' }, p.servings + ' doses')
          ]),
          el('div', { class: 'product-hero__actions' }, [
            (function () {
              const fav = isFavorite(p.id);
              const btn = el('button', {
                type: 'button',
                class: 'cta cta--primary product-hero__cta fav-btn' + (fav ? ' is-favorited' : ''),
                onclick: async function () {
                  const now = await toggleFavorite(p.id);
                  btn.classList.toggle('is-favorited', now);
                  const lbl = btn.querySelector('.fav-btn__label');
                  if (lbl) lbl.textContent = now ? '✓ Dans tes favoris' : 'Ajouter aux favoris';
                }
              }, [
                el('i', { 'data-lucide': 'heart', class: 'cta__icon' }),
                el('span', { class: 'fav-btn__label' }, fav ? '✓ Dans tes favoris' : 'Ajouter aux favoris')
              ]);
              return btn;
            })(),
            el('a', { href: '#', class: 'cta cta--secondary' }, [
              el('i', { 'data-lucide': 'external-link', class: 'cta__icon' }),
              el('span', null, 'Voir le produit')
            ])
          ])
        ])
      ]),

      // STICKY TABS
      el('nav', { class: 'product-tabs', 'aria-label': 'Navigation fiche produit' },
        ['scores', 'why', 'composition', 'alternatives', 'stack', 'reviews'].map(function (k, i) {
          const labels = {
            scores: 'Scores',
            why: 'Pourquoi ce score',
            composition: 'Composition',
            alternatives: 'Alternatives',
            stack: 'Stack recommandé',
            reviews: 'Avis communauté'
          };
          return el('a', {
            href: '#product/' + p.id,
            class: 'product-tabs__link' + (i === 0 ? ' is-active' : ''),
            dataset: { target: k }
          }, [
            el('span', { class: 'product-tabs__num mono' }, '0' + (i + 1)),
            el('span', { class: 'product-tabs__lbl' }, labels[k])
          ]);
        })
      ),

      el('div', { class: 'product-sections' }, [
        // 01 — Scores
        el('section', { id: 'scores', class: 'product-section' }, [
          el('header', { class: 'product-section__head' }, [
            el('span', { class: 'overline mono' }, '· 01 · SCORES ·'),
            el('h2', { class: 'product-section__title' }, 'Deux scores indépendants, un verdict.')
          ]),
          el('div', { class: 'product-scores' }, [
            bigGauge(p.scoreEfficacy, "Efficacité", tone),
            bigGauge(p.scorePrice,    "Prix au mg actif", priceTone)
          ]),
          el('div', { class: 'product-breakdown' }, [
            el('span', { class: 'overline' }, '· DÉCOMPOSITION DU SCORE D\'EFFICACITÉ ·'),
            breakdownRow('Dosage',         40, p.breakdown.dosage, 'lime'),
            breakdownRow('Pureté',         30, p.breakdown.purity, 'mercury'),
            breakdownRow('Certifications', 20, p.breakdown.certif, 'amber'),
            breakdownRow('Traçabilité',    10, p.breakdown.trace,  'coral')
          ])
        ]),

        // 02 — Why
        el('section', { id: 'why', class: 'product-section' }, [
          el('header', { class: 'product-section__head' }, [
            el('span', { class: 'overline mono' }, '· 02 · POURQUOI CE SCORE ·'),
            el('h2', { class: 'product-section__title' }, 'Le détail factuel.')
          ]),
          el('ul', { class: 'why-list' },
            p.whyScore.map(function (w, i) {
              return el('li', { class: 'why-item' }, [
                el('span', { class: 'why-item__num mono' }, '0' + (i + 1)),
                el('span', { class: 'why-item__text' }, w)
              ]);
            })
          )
        ]),

        // 03 — Composition (accordion)
        el('section', { id: 'composition', class: 'product-section' }, [
          el('header', { class: 'product-section__head' }, [
            el('span', { class: 'overline mono' }, '· 03 · COMPOSITION ·'),
            el('h2', { class: 'product-section__title' }, 'Ingrédients & valeurs par dose.')
          ]),
          el('details', { class: 'composition-block', open: 'open' }, [
            el('summary', { class: 'composition-block__head' }, [
              el('span', { class: 'overline mono composition-block__tag' }, '· INGRÉDIENTS ·'),
              el('span', { class: 'composition-block__icon mono', 'aria-hidden': 'true' }, '+')
            ]),
            el('table', { class: 'composition-table' }, [
              el('tbody', null,
                p.composition.ingredients.map(function (ing) {
                  return el('tr', null, [
                    el('td', { class: 'composition-table__name' }, ing.name),
                    el('td', { class: 'composition-table__dose mono' }, ing.dose)
                  ]);
                })
              )
            ])
          ]),
          el('details', { class: 'composition-block' }, [
            el('summary', { class: 'composition-block__head' }, [
              el('span', { class: 'overline mono composition-block__tag' }, '· VALEURS PAR DOSE ·'),
              el('span', { class: 'composition-block__icon mono', 'aria-hidden': 'true' }, '+')
            ]),
            el('div', { class: 'perdose-grid' },
              p.composition.perDose.map(function (d) {
                return el('div', { class: 'perdose-cell' }, [
                  el('span', { class: 'overline perdose-cell__label' }, d.label),
                  el('span', { class: 'perdose-cell__val mono' }, d.value)
                ]);
              })
            )
          ]),
          el('details', { class: 'composition-block' }, [
            el('summary', { class: 'composition-block__head' }, [
              el('span', { class: 'overline mono composition-block__tag' }, '· CERTIFICATIONS ·'),
              el('span', { class: 'composition-block__icon mono', 'aria-hidden': 'true' }, '+')
            ]),
            el('div', { class: 'certif-list' },
              p.certifications.length
                ? p.certifications.map(function (c) {
                    return el('span', { class: 'pill pill--lime' }, '✓ ' + c);
                  })
                : [el('span', { class: 'mono perdose-cell__val' }, 'Aucune certification déclarée.')]
            )
          ])
        ]),

        // 04 — Alternatives
        el('section', { id: 'alternatives', class: 'product-section' }, [
          el('header', { class: 'product-section__head' }, [
            el('span', { class: 'overline mono' }, '· 04 · ALTERNATIVES ·'),
            el('h2', { class: 'product-section__title' }, "3 produits que Skynova recommande à la place."),
            el('p', { class: 'product-section__sub' }, "Sélectionnés dans la même catégorie selon le score d'efficacité et le score prix combinés.")
          ]),
          el('div', { class: 'alt-mini-grid' }, getAlternatives(p, 3).map(altMiniCard))
        ]),

        // 05 — Stack
        el('section', { id: 'stack', class: 'product-section' }, [
          el('header', { class: 'product-section__head' }, [
            el('span', { class: 'overline mono' }, '· 05 · STACK RECOMMANDÉ ·'),
            el('h2', { class: 'product-section__title' }, "Avec quoi le combiner."),
            el('p', { class: 'product-section__sub' }, "2 compléments d'autres catégories qui agissent en synergie avec celui-ci.")
          ]),
          el('div', { class: 'alt-mini-grid' }, getStackFor(p, 2).map(altMiniCard))
        ]),

        // 06 — Reviews
        el('section', { id: 'reviews', class: 'product-section' }, [
          el('header', { class: 'product-section__head' }, [
            el('span', { class: 'overline mono' }, '· 06 · AVIS COMMUNAUTÉ ·'),
            el('h2', { class: 'product-section__title' }, "Ce qu'en disent ceux qui l'ont testé."),
            el('p', { class: 'product-section__sub' }, p.reviews.length + " avis vérifiés et triés par utilité.")
          ]),
          el('div', { class: 'review-list' }, p.reviews.map(reviewItem))
        ])
      ])
    ]);

    const wrap = appLayout('product', content);

    // Setup scroll-spy after DOM insertion
    setTimeout(function () { setupScrollSpy(wrap); }, 0);
    return wrap;
  }

  /* ---------- Scroll-spy for sticky tabs ---------- */
  function setupScrollSpy(root) {
    const tabs = root.querySelectorAll('.product-tabs__link');
    const sections = root.querySelectorAll('.product-section[id]');
    if (!tabs.length || !sections.length) return;

    // Smooth scroll on tab click
    tabs.forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        const target = t.dataset.target;
        const sec = root.querySelector('#' + target);
        if (!sec) return;
        const rect = sec.getBoundingClientRect();
        const top = window.scrollY + rect.top - 70;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });

    // IntersectionObserver to update active tab on scroll
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            tabs.forEach(function (t) {
              t.classList.toggle('is-active', t.dataset.target === id);
            });
          }
        });
      }, { rootMargin: '-30% 0px -55% 0px' });
      sections.forEach(function (s) { io.observe(s); });
    }
  }

  /* ---------- Renderers ---------- */
  const RENDERERS = {
    home:         renderHome,
    methodologie: renderMethodo,
    decode:       renderDecode,
    categories:   renderCategories,
    manifesto:    renderManifesto,
    pricing:      renderPricing,
    auth:         renderAuth,
    onboarding:   renderOnboarding,
    lab:          renderLab,
    scan:         renderScan,
    search:       renderSearch,
    product:      renderProduct
  };
  window.skynova.renderers = RENDERERS;

  /* ---------- Routing (Mission 7 : fade-out → swap → fade-in) ---------- */
  let routeTransitionTimeout = null;
  function route() {
    const raw = (window.location.hash || '').replace(/^#/, '');
    const parts = raw.split('/').filter(Boolean);
    const pageId = parts[0] || 'home';
    const params = parts.slice(1);

    const renderer = RENDERERS[pageId] || RENDERERS.home;
    const app = document.getElementById('app');
    if (!app) return;

    stopHeroCycle();

    // Cancel any pending route swap (double-click protection)
    if (routeTransitionTimeout) {
      clearTimeout(routeTransitionTimeout);
      routeTransitionTimeout = null;
    }

    function finalize() {
      setupCountUp(app);
      initCounters(app);
      initGauges(app);
      initMagneticButtons(app);

      if (pageId === 'home') setTimeout(startHeroCycle, 0);

      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();

      document.querySelectorAll('.site-nav__link, .mobile-drawer__link').forEach(function (a) {
        const href = a.getAttribute('href') || '';
        a.classList.toggle('is-active', href === '#' + pageId);
      });

      closeDrawer();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const isFirstRender = app.children.length === 0;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isFirstRender || reduceMotion) {
      // First load (or reduced-motion) : render directly, no fade-out
      app.innerHTML = '';
      app.appendChild(renderer(params));
      app.style.opacity = '1';
      app.style.transform = '';
      finalize();
      return;
    }

    // Subsequent renders : fade out → swap → fade in
    app.style.transition = 'opacity 200ms ease-out, transform 200ms ease-out';
    app.style.opacity = '0';
    app.style.transform = 'translateY(8px)';

    routeTransitionTimeout = setTimeout(function () {
      routeTransitionTimeout = null;
      app.innerHTML = '';
      app.appendChild(renderer(params));

      app.style.transition = 'opacity 280ms ease-out, transform 280ms ease-out';
      app.style.opacity = '1';
      app.style.transform = 'translateY(0)';

      finalize();
    }, 220);
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

  /* ---------- Premium · Mission 3 — Generic counters ([data-counter]) ---------- */
  function initCounters(root) {
    root = root || document;
    const counters = root.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function animateNode(node) {
      if (node.dataset.animated) return;
      node.dataset.animated = 'true';

      const target   = parseFloat(node.dataset.counter);
      const decimals = parseInt(node.dataset.decimals, 10) || 0;
      const suffix   = node.dataset.suffix || '';
      const prefix   = node.dataset.prefix || '';
      const useSep   = node.dataset.separator === 'true';
      const duration = parseInt(node.dataset.duration, 10) || 1400;
      const start    = performance.now();

      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = easeOutCubic(t);
        const value = target * eased;
        let formatted = value.toFixed(decimals);
        if (useSep) {
          formatted = parseFloat(formatted).toLocaleString('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          });
        }
        node.textContent = prefix + formatted + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateNode(entry.target);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      counters.forEach(function (c) { io.observe(c); });
    } else {
      counters.forEach(animateNode);
    }
  }
  window.skynova.initCounters = initCounters;

  /* ---------- Premium · Mission 6 — Magnetic hover on primary CTAs ---------- */
  function initMagneticButtons(root) {
    root = root || document;
    // Skip on touch-only devices (no real hover)
    if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;

    const buttons = root.querySelectorAll('.cta--primary, .scan-action--primary');

    function clamp(v, max) {
      return Math.max(-max, Math.min(max, v));
    }

    buttons.forEach(function (btn) {
      if (btn.dataset.magnetic === 'true') return;
      btn.dataset.magnetic = 'true';

      const intensity = 0.3;
      const maxX = 14;
      const maxY = 8;

      btn.addEventListener('mousemove', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = clamp((e.clientX - rect.left - rect.width / 2) * intensity, maxX);
        const y = clamp((e.clientY - rect.top - rect.height / 2) * intensity, maxY);
        btn.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(1.02)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }
  window.skynova.initMagneticButtons = initMagneticButtons;

  /* ---------- Premium · Mission 2 — Scroll progress bar ---------- */
  function setupScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    const onScroll = function () {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      bar.style.width = scrolled + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Also recompute on resize (scrollHeight changes when layout reflows)
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Boot ---------- */
  function boot() {
    setupHeaderScroll();
    setupBurger();
    setupScrollProgress();
    initMagneticButtons(document);
    route();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('hashchange', route);
})();
