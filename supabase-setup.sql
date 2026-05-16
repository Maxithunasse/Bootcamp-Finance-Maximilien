-- ============================================================
-- SKYNOVA — SETUP SUPABASE COMPLET (1 SEUL COPIER-COLLER)
-- À coller dans : Supabase Dashboard → SQL Editor → New query → RUN
-- Idempotent : ré-exécutable sans casser (IF NOT EXISTS / ON CONFLICT)
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  recommended_dose_mg NUMERIC(14,2)
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ean VARCHAR(13) UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id),
  image_url TEXT,
  price_eur NUMERIC(10,2),
  weight_g INTEGER,
  servings_per_container INTEGER,
  active_ingredient_mg_per_serving NUMERIC(16,4),
  active_ingredient_purity_pct NUMERIC(5,2),
  certifications TEXT[],
  origin_country TEXT,
  ingredients_list TEXT,
  controversial_additives TEXT[],
  quality_score INTEGER,
  price_score INTEGER,
  quality_breakdown JSONB,
  description TEXT,
  affiliate_url TEXT,
  community_rating NUMERIC(3,2) DEFAULT 0,
  community_review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  health_goals TEXT[],
  gender TEXT,
  age_range TEXT,
  monthly_budget_eur INTEGER,
  allergens TEXT[],
  total_savings_eur NUMERIC(10,2) DEFAULT 0,
  total_scans INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  author_name TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  cure_duration_weeks INTEGER,
  perceived_benefits TEXT[],
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews      ENABLE ROW LEVEL SECURITY;

-- Catalogue : lecture publique (pas besoin d'auth pour voir produits/catégories)
DROP POLICY IF EXISTS "categories public read" ON categories;
CREATE POLICY "categories public read" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "products public read" ON products;
CREATE POLICY "products public read" ON products FOR SELECT USING (true);

-- Reviews : lecture publique, écriture par l'utilisateur connecté uniquement
DROP POLICY IF EXISTS "reviews public read" ON reviews;
CREATE POLICY "reviews public read" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "reviews insert own" ON reviews;
CREATE POLICY "reviews insert own" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Profils : chaque utilisateur ne voit/modifie que le sien
DROP POLICY IF EXISTS "profiles read own" ON profiles;
CREATE POLICY "profiles read own" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles insert own" ON profiles;
CREATE POLICY "profiles insert own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles update own" ON profiles;
CREATE POLICY "profiles update own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Favoris : chaque utilisateur gère les siens
DROP POLICY IF EXISTS "favorites read own" ON favorites;
CREATE POLICY "favorites read own" ON favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "favorites insert own" ON favorites;
CREATE POLICY "favorites insert own" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "favorites delete own" ON favorites;
CREATE POLICY "favorites delete own" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Historique de scans : privé à l'utilisateur
DROP POLICY IF EXISTS "scan_history read own" ON scan_history;
CREATE POLICY "scan_history read own" ON scan_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "scan_history insert own" ON scan_history;
CREATE POLICY "scan_history insert own" ON scan_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-création du profil à l'inscription (trigger sur auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, split_part(NEW.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. SEED — 7 CATÉGORIES
-- ============================================================

INSERT INTO categories (id, name, description, icon, recommended_dose_mg) VALUES
  ('vitality',  'Vitalité & immunité',      'Vitamines, minéraux, plantes adaptogènes',    'zap',        100),
  ('sleep',     'Sommeil & stress',         'Mélatonine, ashwagandha, plantes calmantes',  'moon',       300),
  ('digestion', 'Digestion & transit',      'Probiotiques, fibres, enzymes',               'leaf',      1000),
  ('beauty',    'Beauté & nutricosmétique', 'Collagène, biotine, antioxydants',            'sparkles',  5000),
  ('joints',    'Santé articulaire',        'Curcumine, glucosamine, anti-inflammatoires', 'activity',   500),
  ('sport',     'Sport & performance',      'Whey, créatine, BCAA, gainers',               'dumbbell', 25000),
  ('targeted',  'Santé ciblée',             'Ginkgo, canneberge, lutéine, mémoire',        'target',     120)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. SEED — 20 PRODUITS
-- ============================================================

INSERT INTO products (
  ean, name, brand, category_id, image_url, price_eur, weight_g, servings_per_container,
  active_ingredient_mg_per_serving, active_ingredient_purity_pct, certifications, origin_country,
  ingredients_list, controversial_additives, quality_score, price_score, quality_breakdown,
  description, affiliate_url, community_rating, community_review_count
) VALUES
('3760273920018','Whey Native Vanille','Nutripure','sport','whey_native',32.90,1000,33,24000,92,ARRAY['Made in France','Sans aspartame','Lait de pâturage'],'France','Protéines de lait native, arôme naturel vanille, lécithine de tournesol',ARRAY[]::TEXT[],88,76,'{"dosage":38,"purity":28,"certif":15,"trace":10}'::jsonb,'Whey native française issue de lait de pâturage, micro-filtrée à froid pour préserver les fractions protéiques.','https://www.nutripure.fr',4.7,234),
('5060418094799','Impact Whey Protein','MyProtein','sport','whey_isolate',22.99,1000,40,21000,80,ARRAY['Informed Sport'],'Royaume-Uni','Concentré de protéine de lactosérum, arômes, édulcorants (sucralose)',ARRAY['sucralose'],65,88,'{"dosage":33,"purity":16,"certif":10,"trace":6}'::jsonb,'La whey la plus vendue d''Europe, prix très accessible mais composition avec édulcorants.','https://www.myprotein.fr',4.1,1842),
('3760273920095','Créatine Creapure','Nutrimuscle','sport','creatine',28.00,500,100,5000,99.9,ARRAY['Creapure','Made in Germany','Vegan'],'Allemagne','Créatine monohydrate Creapure pure',ARRAY[]::TEXT[],95,91,'{"dosage":40,"purity":30,"certif":18,"trace":7}'::jsonb,'La référence absolue. Créatine la plus pure du marché, certifiée Creapure.','https://www.nutrimuscle.com',4.9,567),
('3760102541286','Protéine Vegan Pois-Riz','Eric Favre','sport','protein_vegan',36.90,750,25,20000,78,ARRAY['Vegan','Bio','Made in France'],'France','Protéine de pois bio, protéine de riz bio, cacao, stevia',ARRAY[]::TEXT[],79,62,'{"dosage":32,"purity":23,"certif":15,"trace":9}'::jsonb,'Mélange protéines végétales bio avec profil acides aminés complet.','https://www.ericfavre.com',4.3,156),
('3760273920347','Magnésium Bisglycinate','Nutripure','vitality','magnesium_caps',22.90,200,60,300,100,ARRAY['Vegan','Made in France','Sans additifs'],'France','Bisglycinate de magnésium, gélule végétale',ARRAY[]::TEXT[],91,84,'{"dosage":40,"purity":30,"certif":14,"trace":7}'::jsonb,'La meilleure forme de magnésium pour la biodisponibilité, sans additif controversé.','https://www.nutripure.fr',4.8,432),
('3401596316687','Magnésium 300','Arkopharma','vitality','magnesium_caps',12.90,75,30,300,60,ARRAY[]::TEXT[],'France','Oxyde de magnésium, stéarate de magnésium, dioxyde de titane',ARRAY['dioxyde de titane','stéarate de magnésium'],34,71,'{"dosage":18,"purity":8,"certif":0,"trace":8}'::jsonb,'Forme d''oxyde peu assimilable, présence de dioxyde de titane controversé.','https://www.arkopharma.fr',3.2,289),
('0733739003348','Vitamine D3 5000 UI','Now Foods','vitality','vitamin_d',14.00,240,240,0.125,100,ARRAY['GMP'],'États-Unis','Cholécalciférol (D3) lanoline, huile d''olive extra vierge, gélule softgel',ARRAY[]::TEXT[],84,89,'{"dosage":38,"purity":28,"certif":10,"trace":8}'::jsonb,'D3 hautement dosée à prix imbattable, format softgel huileux pour absorption optimale.','https://www.iherb.com',4.7,1245),
('3760269732001','Spiruline Bio Phycocyanine','France Spiruline','vitality','spirulina',39.00,200,50,4000,95,ARRAY['Bio AB','Made in France','Vegan'],'France','Spiruline platensis biologique pure',ARRAY[]::TEXT[],88,65,'{"dosage":36,"purity":27,"certif":17,"trace":8}'::jsonb,'Spiruline cultivée en France, riche en phycocyanine, sans contaminants.','https://www.france-spiruline.fr',4.6,178),
('3760102540357','Ashwagandha KSM-66','Apyforme','sleep','ashwagandha',24.90,60,30,600,95,ARRAY['Bio','Vegan','KSM-66'],'Inde','Extrait standardisé d''ashwagandha KSM-66 (5% withanolides), gélule végétale',ARRAY[]::TEXT[],89,78,'{"dosage":38,"purity":28,"certif":18,"trace":5}'::jsonb,'L''extrait KSM-66 est la forme la plus étudiée scientifiquement, dosage cliniquement efficace.','https://www.apyforme.com',4.7,312),
('3401577540123','Mélatonine 1.9mg','Yves Ponroy','sleep','melatonin',9.90,30,30,1.9,100,ARRAY['Made in France'],'France','Mélatonine, agent de charge: cellulose microcristalline',ARRAY[]::TEXT[],72,82,'{"dosage":28,"purity":24,"certif":10,"trace":10}'::jsonb,'Dosage standard 1.9mg, prix correct, sans additif controversé.','https://www.yves-ponroy.fr',4.2,156),
('3401596580286','Valériane Bio','Vit''all+','sleep','valerian',12.00,60,30,500,90,ARRAY['Bio','Vegan'],'France','Extrait sec de racine de valériane bio standardisé',ARRAY[]::TEXT[],68,74,'{"dosage":26,"purity":20,"certif":15,"trace":7}'::jsonb,'Valériane bio à dosage efficace pour l''endormissement.','https://www.vitalplus.com',4.0,89),
('3401599540123','Lactibiane Référence 50 milliards','PiLeJe','digestion','probiotic',27.00,15,30,10000000000,95,ARRAY['Made in France','Pharmacien'],'France','5 souches probiotiques (lactobacillus, bifidobacterium), inuline, gélule gastro-résistante',ARRAY[]::TEXT[],86,72,'{"dosage":36,"purity":27,"certif":15,"trace":8}'::jsonb,'Probiotique de référence en pharmacie, dosage élevé, gélule gastro-résistante.','https://www.pileje.fr',4.6,245),
('3596710432189','Probiotique Bien-être','Carrefour','digestion','probiotic',6.90,9,30,1000000000,60,ARRAY[]::TEXT[],'Chine','Souches probiotiques non spécifiées, amidon, dioxyde de silicium',ARRAY['origine peu transparente'],41,78,'{"dosage":18,"purity":12,"certif":0,"trace":11}'::jsonb,'Probiotique d''entrée de gamme, dosage faible, traçabilité limitée.','https://www.carrefour.fr',3.4,178),
('3760269750028','Collagène Marin Type I','D-Lab Nutricosmetics','beauty','collagen_powder',49.00,150,30,5000,92,ARRAY['Sans gluten','Sans lactose','Made in France'],'France','Peptides de collagène marin hydrolysé, vitamine C, acide hyaluronique',ARRAY[]::TEXT[],87,58,'{"dosage":38,"purity":26,"certif":13,"trace":10}'::jsonb,'Peptides de collagène hautement assimilables, formule enrichie en cofacteurs.','https://www.d-lab.fr',4.5,198),
('3760102545432','Biotine 10000 mcg','Vit''all+','beauty','biotin',18.00,60,60,10,100,ARRAY['Vegan','Made in France'],'France','Biotine (vitamine B8), cellulose, gélule végétale',ARRAY[]::TEXT[],81,88,'{"dosage":36,"purity":25,"certif":12,"trace":8}'::jsonb,'Biotine très haute dose, idéal pour cure cheveux/ongles, sans additif controversé.','https://www.vitalplus.com',4.4,267),
('3760273920422','Acide Hyaluronique 120mg','Nutrimea','beauty','hyaluronic',21.00,45,30,120,95,ARRAY['Vegan'],'France','Acide hyaluronique haute pureté, gélule végétale',ARRAY[]::TEXT[],74,71,'{"dosage":30,"purity":24,"certif":13,"trace":7}'::jsonb,'Acide hyaluronique pour hydratation cutanée, dosage correct.','https://www.nutrimea.com',4.2,134),
('3760273954024','Curcumine Solaris C3 Reduct','Vit''all+','joints','curcumin',29.00,60,60,500,95,ARRAY['Vegan','Made in France'],'France','Extrait standardisé de curcuma (95% curcuminoïdes), pipérine, gélule',ARRAY[]::TEXT[],92,82,'{"dosage":40,"purity":28,"certif":14,"trace":10}'::jsonb,'Curcumine ultra-biodisponible avec pipérine, dosage cliniquement validé.','https://www.vitalplus.com',4.8,312),
('3401577810234','Glucosamine Chondroïtine MSM','Granions','joints','glucosamine',34.00,90,30,1500,92,ARRAY['Made in France','Pharmacien'],'France','Glucosamine HCl, chondroïtine, MSM, vitamine C',ARRAY[]::TEXT[],79,65,'{"dosage":32,"purity":23,"certif":14,"trace":10}'::jsonb,'Triple complexe articulaire, dosage thérapeutique pour cure de 3 mois.','https://www.granions.fr',4.4,189),
('0033984015449','Ginkgo Biloba 120mg','Solgar','targeted','ginkgo',22.00,60,60,120,95,ARRAY['Vegan','Sans gluten','GMP'],'États-Unis','Extrait standardisé de ginkgo biloba (24% flavonglycosides), gélule végétale',ARRAY[]::TEXT[],81,73,'{"dosage":34,"purity":25,"certif":15,"trace":7}'::jsonb,'Ginkgo standardisé pour mémoire et microcirculation, qualité Solgar reconnue.','https://www.solgar.fr',4.5,245),
('3760273990123','Canneberge Cranberry','Nutrimea','targeted','default',19.00,60,30,500,90,ARRAY['Vegan'],'France','Extrait sec de canneberge (36mg PAC), gélule végétale',ARRAY[]::TEXT[],76,76,'{"dosage":30,"purity":24,"certif":13,"trace":9}'::jsonb,'Canneberge concentrée pour confort urinaire, dosage standard.','https://www.nutrimea.com',4.3,156)
ON CONFLICT (ean) DO NOTHING;

-- ============================================================
-- 5. SEED — REVIEWS (2 par produit, liées par EAN)
-- Idempotent : on purge d'abord les reviews seedées (user_id NULL),
-- les avis réels utilisateurs (user_id renseigné) sont préservés.
-- ============================================================

DELETE FROM reviews WHERE user_id IS NULL;

INSERT INTO reviews (product_id, author_name, rating, comment, cure_duration_weeks, verified_purchase, helpful_count)
SELECT p.id, v.author_name, v.rating, v.comment, v.weeks, v.verified, v.helpful
FROM (VALUES
  ('3760273920018','Thomas B.',5,'Goût vanille naturel, dilution parfaite, zéro grumeau. La meilleure whey que j''ai testée.',12,true,24),
  ('3760273920018','Léa M.',4,'Très bonne whey, un peu chère mais la qualité du lait de pâturage se ressent.',8,true,11),
  ('5060418094799','Antoine K.',4,'Imbattable au kilo. Le sucralose me dérange un peu mais le rapport prix reste roi.',16,true,38),
  ('5060418094799','Sarah P.',3,'Fait le job en sèche. Goût artificiel, je préfère une whey plus clean en off-saison.',6,false,9),
  ('3760273920095','Maxime R.',5,'Creapure = la seule créatine à acheter. Aucun ballonnement, effet net après 3 semaines.',16,true,31),
  ('3760273920095','Julien T.',5,'Pureté irréprochable, sans arôme, je la mixe dans ma whey. Renouvellement direct.',24,false,14),
  ('3760102541286','Inès D.',4,'Bonne alternative vegan, goût cacao correct. Texture un peu épaisse à l''eau.',8,true,7),
  ('3760102541286','Karim L.',4,'Profil acides aminés complet, je ne sens pas de différence avec une whey. Bio en plus.',12,false,5),
  ('3760273920347','Camille L.',5,'Sommeil nettement amélioré en 2 semaines, zéro effet laxatif. Le bisglycinate change tout.',10,true,28),
  ('3760273920347','Paul D.',5,'Cure d''attaque 600mg puis entretien. Crampes nocturnes finies. Sans additif, parfait.',14,true,19),
  ('3401596316687','Marie F.',2,'Le dioxyde de titane à ce prix, non merci. Effet quasi nul, je suis passée à du bisglycinate.',6,true,22),
  ('3401596316687','Bertrand M.',3,'Pas cher mais oxyde peu assimilable. Skynova a raison, le score 34 est mérité.',4,false,8),
  ('0733739003348','Sophie B.',5,'Cure d''hiver parfaite, format softgel huileux qui s''absorbe bien. Prix imbattable.',24,true,41),
  ('0733739003348','Thomas D.',5,'5000 UI bien dosé, taux sanguin remonté aux analyses. Now Foods fiable.',12,false,16),
  ('3760269732001','Lucas A.',5,'Spiruline française sans goût terreux, dissolution propre. Top sur la fatigue.',10,true,11),
  ('3760269732001','Inès G.',4,'Qualité au top mais le prix au gramme est élevé. La traçabilité France rassure.',6,false,7),
  ('3760102540357','Jules M.',5,'KSM-66 : anxiété matinale en baisse nette dès la 2e semaine. Renouvellement direct.',8,true,22),
  ('3760102540357','Léa P.',4,'Effet plus lent que la mélatonine mais agit en profondeur. Bio appréciable.',12,true,13),
  ('3401577540123','Nathan F.',5,'Efficace dès la première nuit, prix mini. Je prenais une marque pharmacie 2x plus chère.',4,true,17),
  ('3401577540123','Camille T.',4,'Marche bien pour l''endormissement, ne tient pas toute la nuit. Le plafond 1.9mg est bas.',8,false,9),
  ('3401596580286','Bernard T.',4,'Efficace en complément d''une bonne hygiène de sommeil. Odeur forte de la racine.',6,true,8),
  ('3401596580286','Aurélie P.',3,'Effet modéré, je préfère désormais l''ashwagandha. Bio mais sous-dosé pour moi.',4,false,4),
  ('3401599540123','Hélène G.',5,'Cure post-antibiotiques, transit revenu à la normale en 2 semaines. Gélule gastro top.',12,true,26),
  ('3401599540123','Mathieu R.',4,'Excellent mais 27€/mois c''est cher en routine. Référence pharmacie quand même.',6,true,11),
  ('3596710432189','Sarah V.',3,'Pas cher mais souches non spécifiées, je ne sais pas ce que je prends. Bof.',4,false,12),
  ('3596710432189','Vincent R.',3,'Entrée de gamme, effet faible. On a ce qu''on paie. Score 41 cohérent.',8,false,6),
  ('3760269750028','Marion T.',5,'Cure 3 mois : cheveux brillants, ongles solides, peau tonique. Cher mais ça vaut.',12,true,23),
  ('3760269750028','Stéphanie F.',4,'Bon goût neutre dans le café, résultats à 6 semaines. Formule enrichie intéressante.',8,false,9),
  ('3760102545432','Léna G.',5,'Cheveux visiblement plus épais à 3 mois, repousse rapide. Très haute dose efficace.',12,true,15),
  ('3760102545432','Marc B.',4,'Bon produit cure cheveux/ongles, prix correct. Sans additif controversé, parfait.',8,false,7),
  ('3760273920422','Mathilde C.',5,'Peau visiblement plus rebondie à 2 mois. Acide hyaluronique pur, bon dosage.',8,true,13),
  ('3760273920422','Aïcha M.',4,'Bon pour les peaux matures, effet hydratation réel. Le prix freine en routine.',6,false,5),
  ('3760273954024','Bernard M.',5,'Arthrose genou : douleur réduite de 60%. La pipérine fait toute la différence.',16,true,21),
  ('3760273954024','Élise D.',4,'Pris contre douleurs cervicales, effet net après 4 semaines. Bon prix au mg actif.',6,true,9),
  ('3401577810234','Pierre G.',4,'Triple complexe efficace sur l''arthrose, effet à 3 mois. Qualité pharmacie.',24,true,16),
  ('3401577810234','Geneviève F.',5,'Pris quotidiennement 1 an, crises moins fréquentes. Dosage thérapeutique sérieux.',48,false,12),
  ('0033984015449','Robert M.',4,'Concentration améliorée à 6 semaines, jambes lourdes en plus. Solgar fiable.',12,true,10),
  ('0033984015449','Christine V.',4,'Pris pour la mémoire après 60 ans, effet subtil mais réel selon mon entourage.',8,false,6),
  ('3760273990123','Émilie R.',5,'Cystites récidivantes finies après 4 mois. La dose PAC fait la différence vs jus.',16,true,18),
  ('3760273990123','Aline P.',4,'Confort urinaire net, Nutrimea marque de confiance. Dosage standard mais efficace.',8,false,9)
) AS v(ean, author_name, rating, comment, weeks, verified, helpful)
JOIN products p ON p.ean = v.ean;

-- ============================================================
-- FIN — 6 tables, RLS, 7 catégories, 20 produits, 40 reviews
-- ============================================================
