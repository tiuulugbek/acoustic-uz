-- Export all products to JSON
-- Run: psql -h localhost -U acoustic_user -d acousticwebdb -f export-products-sql.sql -o products-export.json

\set ON_ERROR_STOP on
\timing off

-- JSON formatida export qilish
\o /root/acoustic.uz/scripts/products-export.json

SELECT json_agg(
  json_build_object(
    'id', p.id,
    'numericId', p."numericId"::text,
    'name_uz', p."name_uz",
    'name_ru', p."name_ru",
    'slug', p.slug,
    'description_uz', p."description_uz",
    'description_ru', p."description_ru",
    'price', p.price,
    'stock', p.stock,
    'productType', p."productType",
    'status', p.status,
    'brand', json_build_object('id', b.id, 'name', b.name, 'slug', b.slug),
    'category', CASE WHEN pc.id IS NOT NULL THEN json_build_object('id', pc.id, 'name_uz', pc."name_uz", 'name_ru', pc."name_ru", 'slug', pc.slug) ELSE NULL END,
    'catalogs', COALESCE(
      (SELECT json_agg(json_build_object('id', c.id, 'name_uz', c."name_uz", 'name_ru', c."name_ru", 'slug', c.slug))
       FROM "_ProductToCatalog" ptc
       JOIN "Catalog" c ON ptc."A" = c.id
       WHERE ptc."B" = p.id),
      '[]'::json
    ),
    'audience', p.audience,
    'formFactors', p."formFactors",
    'smartphoneCompatibility', p."smartphoneCompatibility",
    'signalProcessing', p."signalProcessing",
    'powerLevel', p."powerLevel",
    'hearingLossLevels', p."hearingLossLevels",
    'paymentOptions', p."paymentOptions",
    'availabilityStatus', p."availabilityStatus",
    'tinnitusSupport', p."tinnitusSupport",
    'specsText', p."specsText",
    'tech_uz', p."tech_uz",
    'tech_ru', p."tech_ru",
    'fittingRange_uz', p."fittingRange_uz",
    'fittingRange_ru', p."fittingRange_ru",
    'galleryIds', p."galleryIds",
    'createdAt', p."createdAt",
    'updatedAt', p."updatedAt"
  )
)
FROM (
  SELECT * FROM "Product" ORDER BY "createdAt" DESC
) p
LEFT JOIN "Brand" b ON p."brandId" = b.id
LEFT JOIN "ProductCategory" pc ON p."categoryId" = pc.id;

\o
