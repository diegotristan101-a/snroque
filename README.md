# Quesos Sn Roque · Landing

Página de **Quesos Sn Roque** (marca de Famo Alimentos S.A. de C.V.).

**Contenido de la página:**
- Un queso Ranchero 3D que se parte con el scroll y deja ver el queso por dentro.
- Las 10 familias de producto con sus 42 presentaciones (en celular el carril se desliza con el dedo).
- Recetas en video.
- Ruta de reparto para negocios.
- Alta de clientes por WhatsApp.
- Contacto y aviso de privacidad.

- **Sitio publicado (GitHub Pages):** https://diegotristan101-a.github.io/snroque/ (cuando se active, ver abajo)
- **Carpeta que se publica:** `docs/`
- **Código fuente:** `src/`

## Calificación de Google (Lighthouse)

Medido el 4 de noviembre de 2026 con Lighthouse 12.8, en local con compresión gzip igual que GitHub Pages. Los reportes completos están en [`lighthouse-reports/`](lighthouse-reports/) (abrir los `.html` en el navegador).

| Prueba | Rendimiento | Accesibilidad | Prácticas recomendadas | SEO |
|---|:-:|:-:|:-:|:-:|
| Celular (4G lenta simulada) | **99** | **100** | **100** | **100** |
| Computadora | **100** | **100** | **100** | **100** |

Métricas en celular: primera pintura 1.0 s, elemento más grande 2.1 s, bloqueo 10 ms, movimiento de la página 0.

Para volver a medir cuando ya esté en línea, usa https://pagespeed.web.dev con la dirección del sitio, o `URL=https://… npm run lighthouse`.

### Qué se hizo para que cargue rápido
- **Sin servicios de terceros:** las librerías (three.js, GSAP, Lenis) y las tipografías se sirven desde el mismo sitio, sin CDN ni Google Fonts.
- **Lo primero que se pinta es el inicio:** el título y una imagen de la rueda de queso. El resto de la página se arma después, en pedacitos, para que el celular no se trabe.
- **El queso 3D se descarga al primer gesto** (mover el mouse, tocar o desplazar) o cuando el navegador queda libre. La imagen fija ocupa exactamente su lugar, así que el cambio no se nota. En equipos sin tarjeta de video el 3D se omite y se queda la imagen.
- **Los videos de recetas se cargan solo al acercarse a su sección:** tanto el archivo como su portada.
- **Imágenes en WebP con tamaños para cada pantalla** (`srcset`), con ancho y alto declarados para que nada brinque.
- **El CSS va dentro de la página y las tipografías se precargan.**

### Lo que Google premia y ya tiene
- **SEO:** título y descripción, dirección canónica y `robots.txt`. También `sitemap.xml`, datos estructurados (Organization), Open Graph para WhatsApp y Facebook (`og.jpg`), ícono y manifiesto.
- **Accesibilidad:** contraste suficiente, botones y ligas con nombre, idioma `es-MX`, diálogos con `aria-modal` y foco que regresa al cerrar.
- **Buenas prácticas:** sin errores en consola, imágenes con la proporción correcta y sin librerías viejas.

## Estructura

```
docs/                  ← lo que se publica (no editar index.html a mano: se genera)
  index.html           (generado)
  assets/js/           (generado: app-*.js y scene-*.js)
  assets/fonts/        Latina Essential, Fineday (tipografías oficiales de Sn Roque) y Nunito
  assets/img/          logo, sello 100% leche, rueda fija, íconos, og.jpg
  assets/prod/         fotos de empaque por SKU (820 px, s/ = 400 px, t/ = 128 px)
  assets/fam/          fotos fuera del empaque para cada familia
  assets/video/        recetas (Oaxaca, Asadero, Panela, Ranchero, Pizza, Chiles)
  robots.txt, sitemap.xml, site.webmanifest, 404.html, .nojekyll  (generados)
src/
  index.html           plantilla (head, SEO, precargas)
  body.html            contenido de la página
  styles.css, fonts.css
  app.js               comportamiento (scroll, familias, formulario, aviso, videos)
  data.js              catálogo: 42 presentaciones, 10 familias, características
  scene.js             queso Ranchero 3D (three.js)
scripts/
  build.mjs            arma docs/ a partir de src/
  serve.mjs            servidor local igual a GitHub Pages
  lighthouse.mjs       prueba de Google en celular y computadora
```

## Cómo hacer cambios

Se necesita Node.js 20 o más nuevo.

```bash
npm install
npm run build        # genera docs/
npm run serve        # http://localhost:8080
npm run lighthouse   # en otra terminal, con el servidor encendido
```

- **Textos:** `src/body.html`.
- **Productos, presentaciones y familias:** `src/data.js`.
- **Colores:** `src/styles.css` (verde Sn Roque `#00843D`, Pantone 348 C).
- Agrega `?3d` a la dirección (`http://localhost:8080/?3d`) para forzar el queso 3D en equipos sin tarjeta de video.

## Publicar en GitHub Pages

1. En el repositorio entra a **Settings → Pages**.
2. En **Build and deployment → Source** elige **Deploy from a branch**.
3. Elige la rama **main** y la carpeta **/docs**, y da clic en **Save**.
4. En uno o dos minutos queda en https://diegotristan101-a.github.io/snroque/

**Cuando haya dominio propio:**
1. Arma el sitio con la dirección nueva: `SITE_URL=https://www.midominio.mx/ npm run build`. Así se actualizan la dirección canónica, el sitemap y la imagen para redes.
2. Configura el dominio en **Settings → Pages → Custom domain**.
3. Da de alta el sitio en Google Search Console.

## Privacidad

La página no usa cookies de rastreo ni publicidad, y no carga servicios de otras empresas. Los datos del formulario se guardan solo en el navegador de la persona hasta que ella los envía por WhatsApp.

El aviso de privacidad completo sigue el mismo contenido base que la landing de Famo Alimentos (LFPDPPP). Se abre desde el pie de página, desde el formulario o con la liga `…/#aviso-de-privacidad`.

**Pendiente:**
- Que lo revise Jurídico.
- Definir un correo para solicitudes de datos personales.

## Pendientes de contenido

- **Fotos de queso fuera del empaque para Manchego, Adobera y Jocoque.** Panela, Oaxaca, Asadero, Ranchero, Mozzarella, Cremas y Cajeta ya tienen foto real.
- **Queso 3D "real":** un video del queso girando en tornamesa (vuelta completa, cámara fija, fondo liso) o un escaneo 3D en formato `.glb`. Hoy el queso 3D está hecho en código.
