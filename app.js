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
