-- =========================================
-- SEED SKYNOVA — 20 PRODUITS RÉALISTES
-- À coller dans Supabase Dashboard → SQL Editor
-- =========================================

-- Catégories (7 univers Skynova)
INSERT INTO categories (id, name, description, icon, recommended_dose_mg) VALUES
  ('vitality',  'Vitalité & immunité',      'Vitamines, minéraux, plantes adaptogènes',     'zap',        100),
  ('sleep',     'Sommeil & stress',         'Mélatonine, ashwagandha, plantes calmantes',   'moon',       300),
  ('digestion', 'Digestion & transit',      'Probiotiques, fibres, enzymes',                'leaf',      1000),
  ('beauty',    'Beauté & nutricosmétique', 'Collagène, biotine, antioxydants',             'sparkles',  5000),
  ('joints',    'Santé articulaire',        'Curcumine, glucosamine, anti-inflammatoires',  'activity',   500),
  ('sport',     'Sport & performance',      'Whey, créatine, BCAA, gainers',                'dumbbell', 25000),
  ('targeted',  'Santé ciblée',             'Ginkgo, canneberge, lutéine, mémoire',         'target',     120)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 20 PRODUITS RÉELS
-- image_url contient une CLÉ vers PRODUCT_IMAGES (résolue côté JS via getProductImage)
-- =========================================

INSERT INTO products (
  ean, name, brand, category_id, image_url, price_eur, weight_g, servings_per_container,
  active_ingredient_mg_per_serving, active_ingredient_purity_pct, certifications, origin_country,
  ingredients_list, controversial_additives,
  quality_score, price_score, quality_breakdown,
  description, affiliate_url, community_rating, community_review_count
) VALUES

-- =========================================
-- 1. PROTÉINES & SPORT (4 produits)
-- =========================================

('3760273920018', 'Whey Native Vanille', 'Nutripure', 'sport',
 'whey_native', 32.90, 1000, 33, 24000, 92,
 ARRAY['Made in France', 'Sans aspartame', 'Lait de pâturage'], 'France',
 'Protéines de lait native, arôme naturel vanille, lécithine de tournesol',
 ARRAY[]::TEXT[],
 88, 76, '{"dosage": 38, "purity": 28, "certif": 15, "trace": 10}'::jsonb,
 'Whey native française issue de lait de pâturage, micro-filtrée à froid pour préserver les fractions protéiques.',
 'https://www.nutripure.fr', 4.7, 234),

('5060418094799', 'Impact Whey Protein', 'MyProtein', 'sport',
 'whey_isolate', 22.99, 1000, 40, 21000, 80,
 ARRAY['Informed Sport'], 'Royaume-Uni',
 'Concentré de protéine de lactosérum, arômes, édulcorants (sucralose)',
 ARRAY['sucralose'],
 65, 88, '{"dosage": 33, "purity": 16, "certif": 10, "trace": 6}'::jsonb,
 'La whey la plus vendue d''Europe, prix très accessible mais composition avec édulcorants.',
 'https://www.myprotein.fr', 4.1, 1842),

('3760273920095', 'Créatine Creapure', 'Nutrimuscle', 'sport',
 'creatine', 28.00, 500, 100, 5000, 99.9,
 ARRAY['Creapure', 'Made in Germany', 'Vegan'], 'Allemagne',
 'Créatine monohydrate Creapure pure',
 ARRAY[]::TEXT[],
 95, 91, '{"dosage": 40, "purity": 30, "certif": 18, "trace": 7}'::jsonb,
 'La référence absolue. Créatine la plus pure du marché, certifiée Creapure.',
 'https://www.nutrimuscle.com', 4.9, 567),

('3760102541286', 'Protéine Vegan Pois-Riz', 'Eric Favre', 'sport',
 'protein_vegan', 36.90, 750, 25, 20000, 78,
 ARRAY['Vegan', 'Bio', 'Made in France'], 'France',
 'Protéine de pois bio, protéine de riz bio, cacao, stevia',
 ARRAY[]::TEXT[],
 79, 62, '{"dosage": 32, "purity": 23, "certif": 15, "trace": 9}'::jsonb,
 'Mélange protéines végétales bio avec profil acides aminés complet.',
 'https://www.ericfavre.com', 4.3, 156),

-- =========================================
-- 2. VITALITÉ & IMMUNITÉ (4 produits)
-- =========================================

('3760273920347', 'Magnésium Bisglycinate', 'Nutripure', 'vitality',
 'magnesium_caps', 22.90, 200, 60, 300, 100,
 ARRAY['Vegan', 'Made in France', 'Sans additifs'], 'France',
 'Bisglycinate de magnésium, gélule végétale',
 ARRAY[]::TEXT[],
 91, 84, '{"dosage": 40, "purity": 30, "certif": 14, "trace": 7}'::jsonb,
 'La meilleure forme de magnésium pour la biodisponibilité, sans additif controversé.',
 'https://www.nutripure.fr', 4.8, 432),

('3401596316687', 'Magnésium 300', 'Arkopharma', 'vitality',
 'magnesium_caps', 12.90, 75, 30, 300, 60,
 ARRAY[]::TEXT[], 'France',
 'Oxyde de magnésium, stéarate de magnésium, dioxyde de titane',
 ARRAY['dioxyde de titane', 'stéarate de magnésium'],
 34, 71, '{"dosage": 18, "purity": 8, "certif": 0, "trace": 8}'::jsonb,
 'Forme d''oxyde peu assimilable, présence de dioxyde de titane controversé.',
 'https://www.arkopharma.fr', 3.2, 289),

('0733739003348', 'Vitamine D3 5000 UI', 'Now Foods', 'vitality',
 'vitamin_d', 14.00, 240, 240, 0.125, 100,
 ARRAY['GMP'], 'États-Unis',
 'Cholécalciférol (D3) lanoline, huile d''olive extra vierge, gélule softgel',
 ARRAY[]::TEXT[],
 84, 89, '{"dosage": 38, "purity": 28, "certif": 10, "trace": 8}'::jsonb,
 'D3 hautement dosée à prix imbattable, format softgel huileux pour absorption optimale.',
 'https://www.iherb.com', 4.7, 1245),

('3760269732001', 'Spiruline Bio Phycocyanine', 'France Spiruline', 'vitality',
 'spirulina', 39.00, 200, 50, 4000, 95,
 ARRAY['Bio AB', 'Made in France', 'Vegan'], 'France',
 'Spiruline platensis biologique pure',
 ARRAY[]::TEXT[],
 88, 65, '{"dosage": 36, "purity": 27, "certif": 17, "trace": 8}'::jsonb,
 'Spiruline cultivée en France, riche en phycocyanine, sans contaminants.',
 'https://www.france-spiruline.fr', 4.6, 178),

-- =========================================
-- 3. SOMMEIL & STRESS (3 produits)
-- =========================================

('3760102540357', 'Ashwagandha KSM-66', 'Apyforme', 'sleep',
 'ashwagandha', 24.90, 60, 30, 600, 95,
 ARRAY['Bio', 'Vegan', 'KSM-66'], 'Inde',
 'Extrait standardisé d''ashwagandha KSM-66 (5% withanolides), gélule végétale',
 ARRAY[]::TEXT[],
 89, 78, '{"dosage": 38, "purity": 28, "certif": 18, "trace": 5}'::jsonb,
 'L''extrait KSM-66 est la forme la plus étudiée scientifiquement, dosage cliniquement efficace.',
 'https://www.apyforme.com', 4.7, 312),

('3401577540123', 'Mélatonine 1.9mg', 'Yves Ponroy', 'sleep',
 'melatonin', 9.90, 30, 30, 1.9, 100,
 ARRAY['Made in France'], 'France',
 'Mélatonine, agent de charge: cellulose microcristalline',
 ARRAY[]::TEXT[],
 72, 82, '{"dosage": 28, "purity": 24, "certif": 10, "trace": 10}'::jsonb,
 'Dosage standard 1.9mg, prix correct, sans additif controversé.',
 'https://www.yves-ponroy.fr', 4.2, 156),

('3401596580286', 'Valériane Bio', 'Vit''all+', 'sleep',
 'valerian', 12.00, 60, 30, 500, 90,
 ARRAY['Bio', 'Vegan'], 'France',
 'Extrait sec de racine de valériane bio standardisé',
 ARRAY[]::TEXT[],
 68, 74, '{"dosage": 26, "purity": 20, "certif": 15, "trace": 7}'::jsonb,
 'Valériane bio à dosage efficace pour l''endormissement.',
 'https://www.vitalplus.com', 4.0, 89),

-- =========================================
-- 4. DIGESTION (2 produits)
-- =========================================

('3401599540123', 'Lactibiane Référence 50 milliards', 'PiLeJe', 'digestion',
 'probiotic', 27.00, 15, 30, 10000000000, 95,
 ARRAY['Made in France', 'Pharmacien'], 'France',
 '5 souches probiotiques (lactobacillus, bifidobacterium), inuline, gélule gastro-résistante',
 ARRAY[]::TEXT[],
 86, 72, '{"dosage": 36, "purity": 27, "certif": 15, "trace": 8}'::jsonb,
 'Probiotique de référence en pharmacie, dosage élevé, gélule gastro-résistante.',
 'https://www.pileje.fr', 4.6, 245),

('3596710432189', 'Probiotique Bien-être', 'Carrefour', 'digestion',
 'probiotic', 6.90, 9, 30, 1000000000, 60,
 ARRAY[]::TEXT[], 'Chine',
 'Souches probiotiques non spécifiées, amidon, dioxyde de silicium',
 ARRAY['origine peu transparente'],
 41, 78, '{"dosage": 18, "purity": 12, "certif": 0, "trace": 11}'::jsonb,
 'Probiotique d''entrée de gamme, dosage faible, traçabilité limitée.',
 'https://www.carrefour.fr', 3.4, 178),

-- =========================================
-- 5. BEAUTÉ (3 produits)
-- =========================================

('3760269750028', 'Collagène Marin Type I', 'D-Lab Nutricosmetics', 'beauty',
 'collagen_powder', 49.00, 150, 30, 5000, 92,
 ARRAY['Sans gluten', 'Sans lactose', 'Made in France'], 'France',
 'Peptides de collagène marin hydrolysé, vitamine C, acide hyaluronique',
 ARRAY[]::TEXT[],
 87, 58, '{"dosage": 38, "purity": 26, "certif": 13, "trace": 10}'::jsonb,
 'Peptides de collagène hautement assimilables, formule enrichie en cofacteurs.',
 'https://www.d-lab.fr', 4.5, 198),

('3760102545432', 'Biotine 10000 mcg', 'Vit''all+', 'beauty',
 'biotin', 18.00, 60, 60, 10, 100,
 ARRAY['Vegan', 'Made in France'], 'France',
 'Biotine (vitamine B8), cellulose, gélule végétale',
 ARRAY[]::TEXT[],
 81, 88, '{"dosage": 36, "purity": 25, "certif": 12, "trace": 8}'::jsonb,
 'Biotine très haute dose, idéal pour cure cheveux/ongles, sans additif controversé.',
 'https://www.vitalplus.com', 4.4, 267),

('3760273920422', 'Acide Hyaluronique 120mg', 'Nutrimea', 'beauty',
 'hyaluronic', 21.00, 45, 30, 120, 95,
 ARRAY['Vegan'], 'France',
 'Acide hyaluronique haute pureté, gélule végétale',
 ARRAY[]::TEXT[],
 74, 71, '{"dosage": 30, "purity": 24, "certif": 13, "trace": 7}'::jsonb,
 'Acide hyaluronique pour hydratation cutanée, dosage correct.',
 'https://www.nutrimea.com', 4.2, 134),

-- =========================================
-- 6. ARTICULAIRE (2 produits)
-- =========================================

('3760273954024', 'Curcumine Solaris C3 Reduct', 'Vit''all+', 'joints',
 'curcumin', 29.00, 60, 60, 500, 95,
 ARRAY['Vegan', 'Made in France'], 'France',
 'Extrait standardisé de curcuma (95% curcuminoïdes), pipérine, gélule',
 ARRAY[]::TEXT[],
 92, 82, '{"dosage": 40, "purity": 28, "certif": 14, "trace": 10}'::jsonb,
 'Curcumine ultra-biodisponible avec pipérine, dosage cliniquement validé.',
 'https://www.vitalplus.com', 4.8, 312),

('3401577810234', 'Glucosamine Chondroïtine MSM', 'Granions', 'joints',
 'glucosamine', 34.00, 90, 30, 1500, 92,
 ARRAY['Made in France', 'Pharmacien'], 'France',
 'Glucosamine HCl, chondroïtine, MSM, vitamine C',
 ARRAY[]::TEXT[],
 79, 65, '{"dosage": 32, "purity": 23, "certif": 14, "trace": 10}'::jsonb,
 'Triple complexe articulaire, dosage thérapeutique pour cure de 3 mois.',
 'https://www.granions.fr', 4.4, 189),

-- =========================================
-- 7. SANTÉ CIBLÉE (2 produits)
-- =========================================

('0033984015449', 'Ginkgo Biloba 120mg', 'Solgar', 'targeted',
 'ginkgo', 22.00, 60, 60, 120, 95,
 ARRAY['Vegan', 'Sans gluten', 'GMP'], 'États-Unis',
 'Extrait standardisé de ginkgo biloba (24% flavonglycosides), gélule végétale',
 ARRAY[]::TEXT[],
 81, 73, '{"dosage": 34, "purity": 25, "certif": 15, "trace": 7}'::jsonb,
 'Ginkgo standardisé pour mémoire et microcirculation, qualité Solgar reconnue.',
 'https://www.solgar.fr', 4.5, 245),

('3760273990123', 'Canneberge Cranberry', 'Nutrimea', 'targeted',
 'default', 19.00, 60, 30, 500, 90,
 ARRAY['Vegan'], 'France',
 'Extrait sec de canneberge (36mg PAC), gélule végétale',
 ARRAY[]::TEXT[],
 76, 76, '{"dosage": 30, "purity": 24, "certif": 13, "trace": 9}'::jsonb,
 'Canneberge concentrée pour confort urinaire, dosage standard.',
 'https://www.nutrimea.com', 4.3, 156);

-- =========================================
-- FIN DU SEED — 20 produits, 7 catégories
-- =========================================
