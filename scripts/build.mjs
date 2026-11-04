// Arma el sitio publicable en /docs a partir de /src.
//   npm run build                     → usa la dirección provisional de GitHub Pages
//   SITE_URL=https://midominio.mx/ npm run build   → cuando ya haya dominio
import { build, transform } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'docs');
const SITE = (process.env.SITE_URL || 'https://diegotristan101-a.github.io/snroque/').replace(/\/?$/, '/');
const read = (f) => fs.readFile(path.join(SRC, f), 'utf8');

// 1) JavaScript: un archivo principal + la escena 3D aparte (se descarga después)
const jsDir = path.join(OUT, 'assets', 'js');
await fs.rm(jsDir, { recursive: true, force: true });
const res = await build({
  entryPoints: [path.join(SRC, 'app.js')],
  bundle: true, splitting: true, format: 'esm', minify: true,
  target: ['es2022'], legalComments: 'none', metafile: true,
  outdir: jsDir, entryNames: 'app-[hash]', chunkNames: '[name]-[hash]',
  logLevel: 'warning',
});
const outputs = Object.entries(res.metafile.outputs);
const main = outputs.find(([, o]) => o.entryPoint)[0];
const jsUrl = path.relative(OUT, main).split(path.sep).join('/');

// 2) CSS: tipografías + estilos, minificado y en línea (no bloquea la primera pintura)
const css = (await transform((await read('fonts.css')) + '\n' + (await read('styles.css')), { loader: 'css', minify: true })).code.trim();

// 3) Datos estructurados para Google (organización / marca)
const jsonld = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Quesos Sn Roque',
  alternateName: 'Quesos San Roque',
  url: SITE,
  logo: SITE + 'assets/img/icon-512.png',
  description: 'Quesos de verdad hechos con 100% leche en San Roque de Montes, Guanajuato: asadero, Oaxaca, panela, ranchero, mozzarella, cremas y cajeta.',
  slogan: '¡Sn Roque, quesos de verdad!',
  telephone: '+52 1 477 231 2260',
  address: { '@type': 'PostalAddress', streetAddress: 'Cerrada Muñoz 109', addressLocality: 'San Roque de Montes, San Francisco del Rincón', addressRegion: 'Guanajuato', addressCountry: 'MX' },
  parentOrganization: { '@type': 'Organization', name: 'Famo Alimentos S.A. de C.V.' },
  sameAs: [
    'https://www.instagram.com/quesosnroque/',
    'https://www.tiktok.com/@quesos.snroque',
    'https://www.facebook.com/profile.php?id=61567377028323',
    'https://www.quesossnroque.com/',
  ],
}).replace(/</g, '\\u003c');

// 4) HTML final
const body = (await read('body.html')).trim();
const html = (await read('index.html'))
  .replaceAll('{{SITE}}', SITE)
  .replaceAll('{{JS}}', jsUrl)
  .replace('{{CSS}}', () => css)
  .replace('{{JSONLD}}', () => jsonld)
  .replace('{{BODY}}', () => body);
await fs.writeFile(path.join(OUT, 'index.html'), html);

// 5) Archivos para buscadores, íconos y GitHub Pages
await fs.writeFile(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
await fs.writeFile(path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`);
await fs.writeFile(path.join(OUT, 'site.webmanifest'), JSON.stringify({
  name: 'Quesos Sn Roque', short_name: 'Sn Roque', lang: 'es-MX', start_url: './', display: 'browser',
  background_color: '#ffffff', theme_color: '#00843D',
  icons: [
    { src: 'assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
}, null, 2) + '\n');
await fs.writeFile(path.join(OUT, '.nojekyll'), '');
await fs.writeFile(path.join(OUT, '404.html'), `<!doctype html>
<html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Página no encontrada · Quesos Sn Roque</title><meta name="robots" content="noindex">
<link rel="icon" type="image/png" href="${SITE}assets/img/favicon-32.png">
<style>body{margin:0;min-height:100svh;display:grid;place-items:center;font:400 1.05rem/1.5 system-ui,sans-serif;background:#00843D;color:#fff;text-align:center;padding:1.5rem}a{display:inline-block;margin-top:1rem;padding:.8rem 1.4rem;border-radius:999px;background:#fff;color:#005A2A;font-weight:700;text-decoration:none}</style>
</head><body><main><h1>Esta página no existe</h1><p>Pero los quesos sí.</p><a href="${SITE}">Ir a Quesos Sn Roque</a></main></body></html>
`);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log('Sitio listo en docs/  ·  dirección:', SITE);
for (const [f, o] of outputs) console.log('  ' + path.relative(ROOT, f).padEnd(40), kb(o.bytes));
console.log('  docs/index.html'.padEnd(42), kb(Buffer.byteLength(html)), '(CSS en línea:', kb(css.length) + ')');
