'use strict';

const SITE_NAME    = 'Grupo Nacionalista Andaluz';
const SITE_URL     = 'https://gruponacionalistaandaluz.com';
const SLOGAN       = 'Un movimiento ciudadano por la gestión real de nuestra tierra';
const ADSENSE_ID   = 'ca-pub-4279812118625857';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/noticias/', label: 'Noticias' },
  { href: '/unete.html', label: 'Únete' },
  { href: '/manifiesto.html', label: 'Manifiesto' },
  { href: '/donaciones.html', label: 'Donaciones' },
  { href: '/contacto.html', label: 'Contacto' },
];

// Bloque de anuncio AdSense (solo se usa en la sección Noticias)
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

function renderLayout({ title, description, content, activeHref = '', extraHead = '', schema = '', includeAdsense = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SLOGAN}`;
  const navHtml = NAV.map(item => {
    const cls = item.href === activeHref ? ' class="active"' : '';
    return `<a href="${item.href}"${cls}>${item.label}</a>`;
  }).join('\n        ');

  const adsenseScript = includeAdsense
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}" crossorigin="anonymous"></script>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${description || SLOGAN}">
  <meta name="keywords" content="autonomía andaluza, partido andaluz, movimiento ciudadano andalucía, andalucismo">
  <link rel="canonical" href="${SITE_URL}${activeHref}">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  ${adsenseScript}
  ${extraHead}
  ${schema}
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="logo">
        <img src="/img/escudo.svg" alt="Grupo Nacionalista Andaluz — Las Columnas de Hércules" class="logo__icon">
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
        <h3>Grupo Nacionalista Andaluz</h3>
        <p>${SLOGAN}</p>
        <p class="footer-disclaimer">Movimiento ciudadano andaluz, independiente de partidos centralistas. Abierto a todas las ideologías, razas, religiones y orientaciones.</p>
      </div>
      <div class="footer-col">
        <h3>Navegación</h3>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/noticias/">Noticias</a></li>
          <li><a href="/manifiesto.html">Manifiesto</a></li>
          <li><a href="/unete.html">Únete</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Participa</h3>
        <ul>
          <li><a href="/donaciones.html">Donaciones</a></li>
          <li><a href="/contacto.html">Contacto</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Grupo Nacionalista Andaluz. Andalucía primero. Siempre.</p>
    </div>
  </footer>
  <script>
    fetch('https://api.alquileresandalucia.es/api/stats/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: 'gruponacionalistaandaluz.com', page: location.pathname })
    }).catch(function(){});
  </script>
</body>
</html>`;
}

module.exports = { renderLayout, adBlock, SITE_NAME, SITE_URL, SLOGAN, NAV, ADSENSE_ID };
