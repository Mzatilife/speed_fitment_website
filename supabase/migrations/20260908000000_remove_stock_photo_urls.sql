-- Remove the stock-photo URLs supplied by the initial catalog. The frontend
-- displays the matching Speed Fitment images when an item has no custom upload.
UPDATE public.services
SET image_url = ''
WHERE image_url LIKE 'https://images.pexels.com/%';

UPDATE public.parts
SET image_url = ''
WHERE image_url LIKE 'https://images.pexels.com/%';
