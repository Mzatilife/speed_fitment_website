import { supabase } from './supabase';
import { defaultPartImages, defaultServiceImages } from './site-images';
import type { Part, Service } from '../types';

type CatalogImage = {
  source: string;
  path: string;
};

const suppliedImages: Record<string, CatalogImage> = {
  alignment: { source: defaultServiceImages.Alignment, path: 'catalog-defaults/alignment.jpg' },
  diagnostics: { source: defaultServiceImages.Diagnostics, path: 'catalog-defaults/diagnostics.jpg' },
  bodywork: { source: defaultServiceImages.Bodywork, path: 'catalog-defaults/bodywork.jpg' },
  workshop: { source: defaultServiceImages.Electrical, path: 'catalog-defaults/workshop.jpg' },
  wheels: { source: defaultPartImages.Wheels, path: 'catalog-defaults/wheels.jpg' },
  parts: { source: defaultPartImages.default, path: 'catalog-defaults/parts.jpg' },
};

const usesStockImage = (url?: string | null) => Boolean(url?.includes('images.pexels.com'));
const needsImage = (url?: string | null) => !url || usesStockImage(url);

function serviceImageKey(category: string) {
  return ({ Alignment: 'alignment', Diagnostics: 'diagnostics', Bodywork: 'bodywork', Electrical: 'workshop', Security: 'workshop' } as Record<string, string>)[category] || 'workshop';
}

function partImageKey(category: string) {
  return category === 'Wheels' ? 'wheels' : 'parts';
}

async function uploadSuppliedImages() {
  const urls: Record<string, string> = {};

  await Promise.all(Object.entries(suppliedImages).map(async ([key, image]) => {
    const response = await fetch(image.source);
    if (!response.ok) throw new Error(`Could not read the supplied ${key} image.`);

    const { error } = await supabase.storage.from('images').upload(image.path, await response.blob(), {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
      upsert: false,
    });

    // Re-running the action should reuse a photo that has already been uploaded.
    // Storage returns a conflict when a previous sync has already created this file.
    if (error && !error.message.toLowerCase().includes('already exists')) throw error;
    urls[key] = supabase.storage.from('images').getPublicUrl(image.path).data.publicUrl;
  }));

  return urls;
}

/** Uploads supplied defaults once, then stores their public URLs on records that have no image yet. */
export async function syncCatalogDefaultImages(services: Service[], parts: Part[]) {
  const servicesToUpdate = services.filter(service => needsImage(service.image_url));
  const partsToUpdate = parts.filter(part => needsImage(part.image_url));

  if (!servicesToUpdate.length && !partsToUpdate.length) return { updated: 0 };

  const urls = await uploadSuppliedImages();
  const updates = [
    ...servicesToUpdate.map(service => supabase.from('services').update({ image_url: urls[serviceImageKey(service.category)] }).eq('id', service.id)),
    ...partsToUpdate.map(part => supabase.from('parts').update({ image_url: urls[partImageKey(part.category)] }).eq('id', part.id)),
  ];
  const results = await Promise.all(updates);
  const failed = results.find(result => result.error);
  if (failed?.error) throw failed.error;

  return { updated: updates.length };
}
