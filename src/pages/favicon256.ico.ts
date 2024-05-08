import type { APIRoute } from 'astro';
import sharp from 'sharp';
import ico from 'sharp-ico';
import path from 'node:path';

// relative to project root
const faviconSrc = path.resolve('src/assets/favicons/favicon.png');

export const GET: APIRoute = async () => {
  const buffer = await sharp(faviconSrc).resize(256).toFormat('png').toBuffer();
  const icoBuffer = ico.encode([buffer]);

  return new Response(icoBuffer, {
    headers: { 'Content-Type': 'image/x-icon' },
  });
};
