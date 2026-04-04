with seed_products (
  id,
  slug,
  sku,
  name,
  description,
  product_type,
  brand_slug,
  expansion_slug,
  format_slug,
  language_code,
  variant_label,
  price,
  compare_at_price,
  featured,
  is_preorder,
  active,
  main_image_path,
  attributes,
  tags
) as (
  values
    ('22222222-2222-2222-2222-222222222201', 'pokemon-prismatic-evolutions-etb', 'PKM-PRISM-ETB', 'Pokemon Prismatic Evolutions Elite Trainer Box', 'ETB de fuerte presencia visual para vitrina, aperturas premium y coleccionismo moderno.', 'sealed', 'pokemon', 'prismatic-evolutions', 'etb', 'ES', null, 79.90, 89.90, true, false, true, 'products/22222222-2222-2222-2222-222222222201/cover.webp', '{"expansion":"Prismatic Evolutions","badge":"Featured Drop"}'::jsonb, array['pokemon', 'sellado', 'etb', 'featured']::text[]),
    ('22222222-2222-2222-2222-222222222202', 'pokemon-151-ultra-premium-collection-preventa', 'PKM-151-UPC-PRE', 'Pokemon 151 Ultra Premium Collection Preventa', 'Reserva premium con aura nostálgica y fuerte traccion para coleccionismo sealed.', 'sealed', 'pokemon', '151', 'ediciones-especiales', 'ES', null, 149.90, null, true, true, true, 'products/22222222-2222-2222-2222-222222222202/cover.webp', '{"expansion":"151","badge":"Preventa"}'::jsonb, array['pokemon', 'preventa', 'special-edition']::text[]),
    ('22222222-2222-2222-2222-222222222203', 'charizard-ex-special-illustration-rare', 'PKM-CHARIZARD-SIR', 'Charizard ex Special Illustration Rare', 'Single chase con alto impacto visual para modulos premium de cartas individuales.', 'single', 'pokemon', 'paldean-fates', 'cartas-individuales', 'EN', null, 219.90, null, true, false, true, 'products/22222222-2222-2222-2222-222222222203/cover.webp', '{"expansion":"Paldean Fates","language":"EN","rarity":"SIR","condition":"NM","badge":"Hot Pull"}'::jsonb, array['pokemon', 'single', 'chase']::text[]),
    ('22222222-2222-2222-2222-222222222204', 'one-piece-op08-two-legends-booster-box', 'OP-08-TWO-LEGENDS', 'One Piece OP-08 Two Legends Booster Box', 'Booster box sellado para aperturas competitivas y coleccionismo con fuerte identidad shonen.', 'sealed', 'one-piece', 'op-08-two-legends', 'cajas', 'ES', null, 109.90, 119.90, true, false, true, 'products/22222222-2222-2222-2222-222222222204/cover.webp', '{"expansion":"OP-08 Two Legends"}'::jsonb, array['one-piece', 'sealed', 'box']::text[]),
    ('22222222-2222-2222-2222-222222222205', 'one-piece-op10-royal-blood-booster-box-preventa', 'OP-10-ROYAL-BLOOD', 'One Piece OP-10 Royal Blood Booster Box Preventa', 'Reserva de alto interes para drops hero y campañas de captacion temprana.', 'sealed', 'one-piece', 'op-10-royal-blood', 'cajas', 'ES', null, 119.90, null, true, true, true, 'products/22222222-2222-2222-2222-222222222205/cover.webp', '{"expansion":"OP-10 Royal Blood","badge":"Preventa"}'::jsonb, array['one-piece', 'preventa', 'box']::text[]),
    ('22222222-2222-2222-2222-222222222206', 'monkey-d-luffy-alt-art-leader', 'OP-LUFFY-ALT-LEADER', 'Monkey D. Luffy Alt Art Leader', 'Single de fuerte identidad anime, ideal para bloques de cartas premium y compra aspiracional.', 'single', 'one-piece', 'awakening-of-the-new-era', 'cartas-individuales', 'JP', null, 174.90, null, true, false, true, 'products/22222222-2222-2222-2222-222222222206/cover.webp', '{"expansion":"Awakening of the New Era","language":"JP","rarity":"Alt Art","condition":"NM","badge":"Collector Pick"}'::jsonb, array['one-piece', 'single', 'alt-art']::text[]),
    ('22222222-2222-2222-2222-222222222207', 'riftbound-founders-booster-box-preventa', 'RIFT-FOUNDERS-BOX', 'Riftbound Founders Booster Box Preventa', 'Caja de primera ola con enfoque de lanzamiento y narrativa arcano-tecnologica.', 'sealed', 'riftbound', 'founders-set', 'cajas', 'ES', null, 109.90, null, true, true, true, 'products/22222222-2222-2222-2222-222222222207/cover.webp', '{"expansion":"Founders Set","badge":"Launch Drop"}'::jsonb, array['riftbound', 'launch', 'preventa']::text[]),
    ('22222222-2222-2222-2222-222222222208', 'riftbound-ignite-commander-deck', 'RIFT-IGNITE-DECK', 'Riftbound Ignite Commander Deck', 'Baraja lista para jugar, clara para onboarding y muy útil en landings de marca.', 'sealed', 'riftbound', 'ignite', 'commander-decks', 'ES', null, 44.90, null, false, false, true, 'products/22222222-2222-2222-2222-222222222208/cover.webp', '{"expansion":"Ignite","badge":"Ready to Play"}'::jsonb, array['riftbound', 'commander', 'starter']::text[]),
    ('22222222-2222-2222-2222-222222222209', 'magic-modern-horizons-3-collector-booster', 'MTG-MH3-COLLECTOR', 'Magic Modern Horizons 3 Collector Booster', 'Producto premium con lectura instantanea de valor para cliente experto y coleccionista.', 'sealed', 'magic', 'modern-horizons-3', 'collector-booster-packs', 'ES', null, 39.90, 44.90, true, false, true, 'products/22222222-2222-2222-2222-222222222209/cover.webp', '{"expansion":"Modern Horizons 3","badge":"Collector"}'::jsonb, array['magic', 'collector', 'sealed']::text[]),
    ('22222222-2222-2222-2222-222222222210', 'magic-bloomburrow-commander-deck', 'MTG-BLOOM-CMD', 'Magic Bloomburrow Commander Deck', 'Commander listo para jugar con lectura clara de valor y estética muy reconocible.', 'sealed', 'magic', 'bloomburrow', 'commander-decks', 'ES', null, 49.90, null, false, false, true, 'products/22222222-2222-2222-2222-222222222210/cover.webp', '{"expansion":"Bloomburrow","badge":"Commander"}'::jsonb, array['magic', 'commander', 'sealed']::text[]),
    ('22222222-2222-2222-2222-222222222211', 'sheoldred-the-apocalypse-borderless', 'MTG-SHEOLDRED-BORDERLESS', 'Sheoldred, the Apocalypse Borderless', 'Single premium de alto ticket para una PDP de carta con carácter y metadatos claros.', 'single', 'magic', 'dominaria-united', 'cartas-individuales', 'EN', null, 89.90, null, true, false, true, 'products/22222222-2222-2222-2222-222222222211/cover.webp', '{"expansion":"Dominaria United","language":"EN","rarity":"Mythic Rare","condition":"NM","badge":"Staple"}'::jsonb, array['magic', 'single', 'mythic']::text[]),
    ('22222222-2222-2222-2222-222222222212', 'dragon-shield-matte-nebula-sleeves', 'ACC-DS-NEBULA', 'Dragon Shield Matte Nebula Sleeves', 'Fundas premium con acabado mate para completar ticket medio sin perder look de tienda seria.', 'accessory', 'accesorios', 'general', 'fundas', 'ES', null, 12.90, null, true, false, true, 'products/22222222-2222-2222-2222-222222222212/cover.webp', '{"badge":"Best Seller"}'::jsonb, array['accesorios', 'fundas', 'premium']::text[]),
    ('22222222-2222-2222-2222-222222222213', 'ultimate-guard-boulder-100-deck-box', 'ACC-UG-BOULDER-100', 'Ultimate Guard Boulder 100+ Deck Box', 'Deck box de perfil premium para almacenamiento compacto y elegante.', 'accessory', 'accesorios', 'general', 'deck-boxes', 'ES', null, 14.90, 16.90, false, false, true, 'products/22222222-2222-2222-2222-222222222213/cover.webp', '{"badge":"Low Stock"}'::jsonb, array['accesorios', 'deck-box', 'storage']::text[])
)
insert into public.products (
  id,
  slug,
  sku,
  name,
  description,
  product_type,
  brand_slug,
  brand_id,
  expansion_id,
  format_id,
  language_code,
  variant_label,
  price,
  compare_at_price,
  featured,
  is_preorder,
  active,
  main_image_path,
  attributes,
  tags
)
select
  sp.id,
  sp.slug,
  sp.sku,
  sp.name,
  sp.description,
  sp.product_type,
  sp.brand_slug,
  b.id,
  e.id,
  f.id,
  sp.language_code,
  sp.variant_label,
  sp.price,
  sp.compare_at_price,
  sp.featured,
  sp.is_preorder,
  sp.active,
  sp.main_image_path,
  sp.attributes,
  sp.tags
from seed_products sp
inner join public.brands b on b.slug = sp.brand_slug
inner join public.expansions e on e.brand_id = b.id and e.slug = sp.expansion_slug
inner join public.product_formats f on f.slug = sp.format_slug
on conflict (slug) do update
set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  product_type = excluded.product_type,
  brand_slug = excluded.brand_slug,
  brand_id = excluded.brand_id,
  expansion_id = excluded.expansion_id,
  format_id = excluded.format_id,
  language_code = excluded.language_code,
  variant_label = excluded.variant_label,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  featured = excluded.featured,
  is_preorder = excluded.is_preorder,
  active = excluded.active,
  main_image_path = excluded.main_image_path,
  attributes = excluded.attributes,
  tags = excluded.tags;

insert into public.product_images (id, product_id, storage_path, alt_text, sort_order, is_primary)
values
  (
    '33333333-3333-3333-3333-333333333301',
    '22222222-2222-2222-2222-222222222201',
    'products/22222222-2222-2222-2222-222222222201/gallery/01.webp',
    'Pokemon Prismatic Evolutions ETB frontal alternativo',
    1,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    '22222222-2222-2222-2222-222222222201',
    'products/22222222-2222-2222-2222-222222222201/gallery/02.webp',
    'Pokemon Prismatic Evolutions ETB detalle lateral',
    2,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    '22222222-2222-2222-2222-222222222202',
    'products/22222222-2222-2222-2222-222222222202/gallery/01.webp',
    'Pokemon 151 UPC vista detalle',
    1,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333304',
    '22222222-2222-2222-2222-222222222203',
    'products/22222222-2222-2222-2222-222222222203/gallery/01.webp',
    'Charizard ex reverso o detalle',
    1,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333305',
    '22222222-2222-2222-2222-222222222204',
    'products/22222222-2222-2222-2222-222222222204/gallery/01.webp',
    'One Piece OP-08 booster box frontal secundario',
    1,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333306',
    '22222222-2222-2222-2222-222222222204',
    'products/22222222-2222-2222-2222-222222222204/gallery/02.webp',
    'One Piece OP-08 booster box detalle lateral',
    2,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333307',
    '22222222-2222-2222-2222-222222222205',
    'products/22222222-2222-2222-2222-222222222205/gallery/01.webp',
    'One Piece OP-10 Royal Blood teaser packaging',
    1,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333308',
    '22222222-2222-2222-2222-222222222206',
    'products/22222222-2222-2222-2222-222222222206/gallery/01.webp',
    'Luffy Alt Art detalle adicional',
    1,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333309',
    '22222222-2222-2222-2222-222222222207',
    'products/22222222-2222-2222-2222-222222222207/gallery/01.webp',
    'Riftbound Founders Booster Box vista secundaria',
    1,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333310',
    '22222222-2222-2222-2222-222222222209',
    'products/22222222-2222-2222-2222-222222222209/gallery/01.webp',
    'Magic MH3 Collector Booster alternate front',
    1,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333311',
    '22222222-2222-2222-2222-222222222209',
    'products/22222222-2222-2222-2222-222222222209/gallery/02.webp',
    'Magic MH3 Collector Booster foil detail',
    2,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333312',
    '22222222-2222-2222-2222-222222222211',
    'products/22222222-2222-2222-2222-222222222211/gallery/01.webp',
    'Sheoldred borderless detalle adicional',
    1,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333313',
    '22222222-2222-2222-2222-222222222212',
    'products/22222222-2222-2222-2222-222222222212/gallery/01.webp',
    'Dragon Shield Nebula sleeves packaging reverse',
    1,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333314',
    '22222222-2222-2222-2222-222222222213',
    'products/22222222-2222-2222-2222-222222222213/gallery/01.webp',
    'Ultimate Guard Boulder interior',
    1,
    false
  )
on conflict (product_id, storage_path) do update
set
  alt_text = excluded.alt_text,
  sort_order = excluded.sort_order,
  is_primary = excluded.is_primary;

insert into public.inventory (product_id, available_quantity)
values
  ('22222222-2222-2222-2222-222222222201', 12),
  ('22222222-2222-2222-2222-222222222202', 0),
  ('22222222-2222-2222-2222-222222222203', 1),
  ('22222222-2222-2222-2222-222222222204', 9),
  ('22222222-2222-2222-2222-222222222205', 0),
  ('22222222-2222-2222-2222-222222222206', 1),
  ('22222222-2222-2222-2222-222222222207', 0),
  ('22222222-2222-2222-2222-222222222208', 14),
  ('22222222-2222-2222-2222-222222222209', 20),
  ('22222222-2222-2222-2222-222222222210', 7),
  ('22222222-2222-2222-2222-222222222211', 2),
  ('22222222-2222-2222-2222-222222222212', 42),
  ('22222222-2222-2222-2222-222222222213', 0)
on conflict (product_id) do update
set
  available_quantity = excluded.available_quantity;
