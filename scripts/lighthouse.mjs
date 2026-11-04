// Corre Lighthouse (la prueba de Google) en celular y en computadora y guarda los reportes.
//   npm run serve          (en otra terminal)
//   npm run lighthouse     → lighthouse-reports/celular.html y computadora.html
//   URL=https://... npm run lighthouse   → para probar el sitio ya publicado
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const URL = process.env.URL || 'http://localhost:8080/';
const OUT = path.join(ROOT, 'lighthouse-reports');
await fs.mkdir(OUT, { recursive: true });

const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'] });
const resumen = [];
try {
  for (const [nombre, preset] of [['celular', undefined], ['computadora', 'desktop']]) {
    const config = preset ? (await import('lighthouse/core/config/desktop-config.js')).default : undefined;
    const r = await lighthouse(URL, { port: chrome.port, output: ['html', 'json'], logLevel: 'error', locale: 'es' }, config);
    await fs.writeFile(path.join(OUT, `${nombre}.html`), r.report[0]);
    await fs.writeFile(path.join(OUT, `${nombre}.json`), r.report[1]);
    const c = r.lhr.categories, a = r.lhr.audits;
    resumen.push({
      prueba: nombre,
      rendimiento: Math.round(c.performance.score * 100),
      accesibilidad: Math.round(c.accessibility.score * 100),
      practicas: Math.round(c['best-practices'].score * 100),
      seo: Math.round(c.seo.score * 100),
      FCP: a['first-contentful-paint'].displayValue,
      LCP: a['largest-contentful-paint'].displayValue,
      TBT: a['total-blocking-time'].displayValue,
      CLS: a['cumulative-layout-shift'].displayValue,
      SI: a['speed-index'].displayValue,
    });
    const fallas = Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'manual' && x.scoreDisplayMode !== 'notApplicable');
    if (fallas.length) console.log(`\n[${nombre}] por revisar:\n` + fallas.map((x) => `  - ${x.id} (${x.score}) ${x.displayValue || ''}`).join('\n'));
  }
} finally {
  await chrome.kill();
}
console.table(resumen);
