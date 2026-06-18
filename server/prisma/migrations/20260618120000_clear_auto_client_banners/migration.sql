-- Remove stock banner keys auto-assigned at booking signup (not user-uploaded covers).
UPDATE "clients"
SET "banner_asset_key" = NULL
WHERE "banner_asset_key" = 'landing/gallery/portrait/gallery-portrait-outdoor';
