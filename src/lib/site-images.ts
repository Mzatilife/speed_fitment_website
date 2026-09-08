import heroImage from '../../images/SPEED (16).JPG';
import bodyworkImage from '../../images/IMG_1420.jpg';
import diagnosticsImage from '../../images/IMG_1430.jpg';
import alignmentImage from '../../images/SPEED (34).JPG';
import tyreServiceImage from '../../images/SPEED (10).JPG';
import tyreStockImage from '../../images/SPEED (1).JPG';
import workshopImage from '../../images/SPEED (20).JPG';

export const defaultServiceImages: Record<string, string> = {
  Alignment: alignmentImage,
  Diagnostics: diagnosticsImage,
  Bodywork: bodyworkImage,
  Electrical: workshopImage,
  Security: workshopImage,
};

export const defaultPartImages: Record<string, string> = {
  Wheels: tyreServiceImage,
  default: tyreStockImage,
};

/** Photos supplied by Speed Fitment, bundled with the site rather than loaded from stock-photo services. */
export const siteImages = {
  hero: heroImage,
  bodywork: bodyworkImage,
  diagnostics: diagnosticsImage,
  alignment: alignmentImage,
  tyreService: tyreServiceImage,
  tyreStock: tyreStockImage,
  workshop: workshopImage,
};

const stockImage = (url?: string | null) => !url || url.includes('images.pexels.com');

export function serviceImage(category: string, imageUrl?: string | null) {
  if (!stockImage(imageUrl)) return imageUrl ?? siteImages.workshop;
  return defaultServiceImages[category] || siteImages.workshop;
}

export function partImage(category: string, imageUrl?: string | null) {
  if (!stockImage(imageUrl)) return imageUrl ?? defaultPartImages.default;
  return defaultPartImages[category] || defaultPartImages.default;
}
