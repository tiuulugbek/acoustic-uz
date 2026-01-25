\copy (
  SELECT 
    json_agg(
      json_build_object(
        'id', p.id,
        'numericId', p."numericId"::text,
        'name_uz', p."name_uz",
        'name_ru', p."name_ru",
        'slug', p.slug,
        'description_uz', COALESCE(p."description_uz", ''),
        'description_ru', COALESCE(p."description_ru", ''),
        'price', p.price,
        'stock', p.stock,
        'productType', p."productType",
        'status', p.status,
        'brand', CASE WHEN b.id IS NOT NULL THEN json_build_object('id', b.id, 'name', b.name, 'slug', b.slug) ELSE NULL END,
        'catalogs', COALESCE(
          (SELECT json_agg(json_build_object('id', c.id, 'name_uz', c."name_uz", 'name_ru', c."name_ru", 'slug', c.slug))
           FROM "_ProductToCatalog" ptc
           JOIN "Catalog" c ON ptc."A" = c.id
           WHERE ptc."B" = p.id),
          '[]'::json
        ),
        'audience', COALESCE(p.audience, '[]'::text[]),
        'formFactors', COALESCE(p."formFactors", '[]'::text[]),
        'smartphoneCompatibility', COALESCE(p."smartphoneCompatibility", '[]'::text[]),
        'signalProcessing', p."signalProcessing",
        'powerLevel', p."powerLevel",
        'hearingLossLevels', COALESCE(p."hearingLossLevels", '[]'::text[]),
        'paymentOptions', COALESCE(p."paymentOptions", '[]'::text[]),
        'availabilityStatus', p."availabilityStatus",
        'tinnitusSupport', COALESCE(p."tinnitusSupport", false),
        'specsText', COALESCE(p."specsText", ''),
        'tech_uz', COALESCE(p."tech_uz", ''),
        'tech_ru', COALESCE(p."tech_ru", ''),
        'fittingRange_uz', COALESCE(p."fittingRange_uz", ''),
        'fittingRange_ru', COALESCE(p."fittingRange_ru", ''),
        'galleryIds', COALESCE(p."galleryIds", '[]'::text[]),
        'createdAt', p."createdAt",
        'updatedAt', p."updatedAt"
      )
    )
  FROM "Product" p
  LEFT JOIN "Brand" b ON p."brandId" = b.id
  ORDER BY p."createdAt" DESC
) TO '/root/acoustic.uz/scripts/products-export.json';
