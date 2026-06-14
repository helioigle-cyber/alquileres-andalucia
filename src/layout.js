'use strict';

const SITE_NAME    = 'Alquileres Andalucía';
const SITE_URL     = 'https://alquileresandalucia.es';
const SLOGAN       = 'Vivienda digna, un derecho, no un lujo';
const ADSENSE_ID   = 'ca-pub-4279812118625857';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/alquileres/', label: 'Alquileres por provincia' },
  { href: '/blog/', label: 'Blog' },
  { href: '/guias/', label: 'Guías' },
  { href: '/faq.html', label: 'FAQ' },
  { href: '/contacto.html', label: 'Contacto' },
];

// Bloque de anuncio AdSense (auto ads + unidad responsive)
function adBlock(id) {
  return `
  <div class="ad-slot" data-ad-id="${id}">
    <span class="ad-slot__label">Publicidad</span>
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="${ADSENSE_ID}"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </div>`;
}

function renderLayout({ title, description, content, activeHref = '', extraHead = '', schema = '' }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SLOGAN}`;
  const navHtml = NAV.map(item => {
    const cls = item.href === activeHref ? ' class="active"' : '';
    return `<a href="${item.href}"${cls}>${item.label}</a>`;
  }).join('\n        ');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${description || SLOGAN}">
  <link rel="canonical" href="${SITE_URL}${activeHref}">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}" crossorigin="anonymous"></script>
  ${extraHead}
  ${schema}
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="logo">
        <span class="logo__icon">🏠</span>
        <span class="logo__text">Alquileres<strong>Andalucía</strong></span>
      </a>
      <nav class="main-nav">
        ${navHtml}
      </nav>
    </div>
  </header>

  <main>
    ${content}
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-col">
        <h3>Alquileres Andalucía</h3>
        <p>${SLOGAN}</p>
        <p class="footer-disclaimer">Este sitio contiene enlaces de afiliados. Podemos recibir una comisión sin coste adicional para ti si realizas una acción a través de ellos.</p>
      </div>
      <div class="footer-col">
        <h3>Navegación</h3>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/guias/">Guías</a></li>
          <li><a href="/faq.html">FAQ</a></li>
          <li><a href="/contacto.html">Contacto</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Provincias</h3>
        <ul>
          <li><a href="/alquileres/">Ver todas las provincias</a></li>
        </ul>
      </div>
      ${adBlock('footer')}
    </div>
    <div class="container footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Alquileres Andalucía. Todos los derechos reservados.</p>
    </div>
  </footer>
  <script>
    fetch('https://api.alquileresandalucia.es/api/stats/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: 'alquileresandalucia.es', page: location.pathname })
    }).catch(function(){});
  </script>
</body>
</html>`;
}

module.exports = { renderLayout, adBlock, SITE_NAME, SITE_URL, SLOGAN, NAV };
