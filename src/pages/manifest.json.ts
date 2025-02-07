import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import favicon from '~/assets/favicons/favicon.png';
import { METADATA } from '../utils/config';
import type { WebAppManifest } from 'web-app-manifest';

const faviconPngSizes = [192, 256, 512];

export const GET: APIRoute = async () => {
  const icons = await Promise.all(
    faviconPngSizes.map(async (size) => {
      const image = await getImage({
        src: favicon,
        width: size,
        height: size,
        format: 'png',
      });
      return {
        src: image.src,
        type: `image/${image.options.format}`,
        sizes: `${image.options.width}x${image.options.height}`,
      };
    })
  );

  const manifest: WebAppManifest = {
    description: METADATA.description,
    name: METADATA.title?.default,
    short_name: 'TCHA',
    start_url: '/',
    display: 'standalone',
    id: '?homescreen=1',
    icons,
  };

  return new Response(JSON.stringify(manifest), { headers: { 'Content-Type': 'application/manifest+json' } });
};
