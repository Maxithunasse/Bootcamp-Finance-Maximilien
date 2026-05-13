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
          el('span', { class: 'cat-hub-card__stat-val mono' }, String(d.productCount || '—')),
          el('span', { class: 'overline cat-hub-card__stat-lbl' }, 'références')
        ]),
        el('div', { class: 'cat-hub-card__stat' }, [
          el('span', { class: 'cat-hub-card__stat-val mono cat-hub-card__stat-val--lime' }, String(d.avgScore || '—')),
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

  /* ---------- Renderers ---------- */
  const RENDERERS = {
    home:         renderHome,
    methodologie: renderMethodo,
    decode:       renderDecode,
    categories:   renderCategories,
    manifesto:    renderManifesto,
    pricing:      renderPricing,
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
