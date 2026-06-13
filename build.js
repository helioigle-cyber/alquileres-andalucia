'use strict';
/**
 * build.js — Generador estático del sitio alquileresandalucia.es
 *
 * Lee plantillas (src/) y contenido (content/) y genera HTML estático en dist/.
 * Pensado para desplegarse en Cloudflare Pages.
 */

const fs = require('fs');
const path = require('path');

const { renderLayout, adBlock, SITE_URL } = require('./src/layout');
const { parseFrontMatter, markdownToHtml } = require('./src/markdown');
const { afiliadosBox } = require('./src/templates/afiliados-box');
const provincias = require('./src/data/provincias');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// ── Utilidades ──────────────────────────────────────────────────────────────
function writeFile(relPath, content) {
  const fullPath = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function loadMarkdownDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { data, body } = parseFrontMatter(raw);
      return {
        slug: f.replace(/\.md$/, ''),
        ...data,
        html: markdownToHtml(body),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // más recientes primero
}

// ── Limpiar dist ───────────────────────────────────────────────────────────
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// ── Copiar estáticos ──────────────────────────────────────────────────────
copyDir(path.join(ROOT, 'public'), DIST);

// ── Cargar contenido ──────────────────────────────────────────────────────
const posts = loadMarkdownDir(path.join(ROOT, 'content', 'blog'));
const guias = loadMarkdownDir(path.join(ROOT, 'content', 'guias'));

// ── Página de inicio ──────────────────────────────────────────────────────
function pageIndex() {
  const provinciaOptions = provincias.map(p => `<option value="${p.slug}">${p.nombre}</option>`).join('\n          ');

  const provinciasCards = provincias.map(p => `
        <div class="card">
          <span class="price-tag">Desde ${p.precioMedio}</span>
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
          <a href="/alquileres/${p.slug}.html">Ver alquileres en ${p.nombre} &rarr;</a>
        </div>`).join('\n');

  const latestPosts = posts.slice(0, 3).map(p => `
        <div class="card">
          <div class="meta">${p.date}</div>
          <h3>${p.title}</h3>
          <p>${p.description || ''}</p>
          <a href="/blog/${p.slug}.html">Leer artículo &rarr;</a>
        </div>`).join('\n');

  const content = `
    <section class="hero">
      <div class="container">
        <h1>Alquileres asequibles en Andalucía</h1>
        <p class="slogan">Vivienda digna, un derecho, no un lujo</p>
        <form class="search-form" action="/alquileres/" method="get">
          <select name="provincia" aria-label="Provincia">
            <option value="">Elige una provincia</option>
            ${provinciaOptions}
          </select>
          <input type="number" name="precio_max" placeholder="Precio máximo (€)" min="0" step="50">
          <button type="submit">Buscar alquiler</button>
        </form>
      </div>
    </section>

    <section>
      <div class="container">
        <h2>Alquileres por provincia</h2>
        <div class="card-grid">
          ${provinciasCards}
        </div>
      </div>
    </section>

    <section class="section-alt">
      <div class="container">
        <h2>Últimos artículos del blog</h2>
        <div class="card-grid">
          ${latestPosts || '<p>Próximamente nuevos artículos.</p>'}
        </div>
        ${adBlock('home-middle')}
      </div>
    </section>

    <section>
      <div class="container">
        <h2>Guías útiles para inquilinos</h2>
        <div class="card-grid">
          ${guias.map(g => `
          <div class="card">
            <h3>${g.title}</h3>
            <p>${g.description || ''}</p>
            <a href="/guias/${g.slug}.html">Leer guía &rarr;</a>
          </div>`).join('\n')}
        </div>
      </div>
    </section>
  `;

  writeFile('index.html', renderLayout({
    title: '',
    description: 'Portal de alquileres asequibles en Andalucía. Busca piso por provincia y precio, lee guías para inquilinos y artículos actualizados sobre el mercado del alquiler.',
    content,
    activeHref: '/',
  }));
}

// ── Páginas de provincia ──────────────────────────────────────────────────
function pageProvinciaIndex() {
  const cards = provincias.map(p => `
        <div class="card">
          <span class="price-tag">Desde ${p.precioMedio}</span>
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
          <a href="/alquileres/${p.slug}.html">Ver alquileres en ${p.nombre} &rarr;</a>
        </div>`).join('\n');

  const content = `
    <section>
      <div class="container">
        <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; Alquileres por provincia</div>
        <h2>Alquileres por provincia en Andalucía</h2>
        <div class="card-grid">
          ${cards}
        </div>
        ${adBlock('provincias-index')}
      </div>
    </section>
  `;

  writeFile('alquileres/index.html', renderLayout({
    title: 'Alquileres por provincia',
    description: 'Encuentra alquileres asequibles en las 8 provincias de Andalucía: Almería, Cádiz, Córdoba, Granada, Huelva, Jaén, Málaga y Sevilla.',
    content,
    activeHref: '/alquileres/',
  }));
}

function pageProvincia(p) {
  const otras = provincias.filter(o => o.slug !== p.slug).map(o => `
        <div class="card">
          <span class="price-tag">Desde ${o.precioMedio}</span>
          <h3>${o.nombre}</h3>
          <a href="/alquileres/${o.slug}.html">Ver alquileres en ${o.nombre} &rarr;</a>
        </div>`).join('\n');

  const content = `
    <section class="province-hero">
      <div class="container">
        <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; <a href="/alquileres/">Provincias</a> &rsaquo; ${p.nombre}</div>
        <h1>Alquiler en ${p.nombre}</h1>
        <p>${p.descripcion}</p>
        <span class="price-tag">Precio medio: ${p.precioMedio}</span>
      </div>
    </section>

    <section>
      <div class="container layout-columns">
        <div>
          <h2>Encuentra tu próximo hogar en ${p.nombre}</h2>
          <p>Consulta la oferta actualizada de pisos y casas en alquiler en ${p.nombre} a través de los principales portales inmobiliarios. Compara precios, zonas y condiciones antes de decidir.</p>
          ${adBlock('provincia-' + p.slug)}
        </div>
        <div>
          ${afiliadosBox()}
        </div>
      </div>
    </section>

    <section class="section-alt">
      <div class="container">
        <h2>Otras provincias</h2>
        <div class="card-grid">
          ${otras}
        </div>
      </div>
    </section>
  `;

  writeFile(`alquileres/${p.slug}.html`, renderLayout({
    title: `Alquiler en ${p.nombre} — Precio medio ${p.precioMedio}`,
    description: `Pisos y casas en alquiler en ${p.nombre}. Precio medio ${p.precioMedio}. Compara ofertas y encuentra vivienda asequible en ${p.nombre}.`,
    content,
    activeHref: `/alquileres/${p.slug}.html`,
  }));
}

// ── Blog ─────────────────────────────────────────────────────────────────
function pageBlogIndex() {
  const items = posts.map(p => `
        <div class="card">
          <div class="meta">${p.date} &middot; ${p.author || 'ALEXIA'}</div>
          <h3>${p.title}</h3>
          <p>${p.description || ''}</p>
          <a href="/blog/${p.slug}.html">Leer artículo &rarr;</a>
        </div>`).join('\n');

  const content = `
    <section>
      <div class="container">
        <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; Blog</div>
        <h2>Blog: noticias y consejos sobre alquiler en Andalucía</h2>
        <div class="post-list">
          ${items || '<p>Próximamente nuevos artículos.</p>'}
        </div>
        ${adBlock('blog-index')}
      </div>
    </section>
  `;

  writeFile('blog/index.html', renderLayout({
    title: 'Blog',
    description: 'Artículos actualizados sobre precios de alquiler, zonas asequibles y consejos para inquilinos en Andalucía.',
    content,
    activeHref: '/blog/',
  }));
}

function pagePost(post) {
  const schema = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || '',
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Alquileres Andalucía' },
  })}</script>`;

  const content = `
    <article class="article">
      <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; <a href="/blog/">Blog</a> &rsaquo; ${post.title}</div>
      <h1>${post.title}</h1>
      <div class="meta">Publicado el ${post.date} &middot; ${post.author || 'ALEXIA'}</div>
      ${post.html}
      ${adBlock('post-' + post.slug)}
      ${afiliadosBox()}
    </article>
  `;

  writeFile(`blog/${post.slug}.html`, renderLayout({
    title: post.title,
    description: post.description || '',
    content,
    activeHref: `/blog/${post.slug}.html`,
    schema,
  }));
}

// ── Guías ────────────────────────────────────────────────────────────────
function pageGuiasIndex() {
  const items = guias.map(g => `
        <div class="card">
          <h3>${g.title}</h3>
          <p>${g.description || ''}</p>
          <a href="/guias/${g.slug}.html">Leer guía &rarr;</a>
        </div>`).join('\n');

  const content = `
    <section>
      <div class="container">
        <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; Guías</div>
        <h2>Guías útiles para inquilinos en Andalucía</h2>
        <div class="card-grid">
          ${items || '<p>Próximamente nuevas guías.</p>'}
        </div>
        ${adBlock('guias-index')}
      </div>
    </section>
  `;

  writeFile('guias/index.html', renderLayout({
    title: 'Guías para inquilinos',
    description: 'Guías prácticas sobre derechos del inquilino, cómo negociar el alquiler y todo lo que necesitas saber antes de alquilar en Andalucía.',
    content,
    activeHref: '/guias/',
  }));
}

function pageGuia(guia) {
  const content = `
    <article class="article">
      <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; <a href="/guias/">Guías</a> &rsaquo; ${guia.title}</div>
      <h1>${guia.title}</h1>
      <div class="meta">Actualizado el ${guia.date}</div>
      ${guia.html}
      ${adBlock('guia-' + guia.slug)}
      ${afiliadosBox()}
    </article>
  `;

  writeFile(`guias/${guia.slug}.html`, renderLayout({
    title: guia.title,
    description: guia.description || '',
    content,
    activeHref: `/guias/${guia.slug}.html`,
  }));
}

// ── FAQ ──────────────────────────────────────────────────────────────────
function pageFaq() {
  const faqs = [
    {
      q: '¿AlquileresAndalucia.es gestiona o publica anuncios de pisos?',
      a: 'No. Somos un portal informativo: te ayudamos a orientarte en el mercado del alquiler y te dirigimos a los principales portales inmobiliarios y servicios relacionados.',
    },
    {
      q: '¿Cómo se actualizan los precios medios por provincia?',
      a: 'Los precios medios se revisan periódicamente a partir de datos públicos del mercado y se actualizan en los artículos del blog.',
    },
    {
      q: '¿Qué son las "zonas tensionadas"?',
      a: 'Son áreas declaradas oficialmente con mercado de alquiler tensionado, donde se aplican límites adicionales a la subida de precios en nuevos contratos.',
    },
    {
      q: '¿Por qué aparecen enlaces a otras páginas (Idealista, Fotocasa, seguros...)?',
      a: 'Son enlaces de afiliados. Si realizas una acción a través de ellos, podemos recibir una pequeña comisión sin coste adicional para ti. Esto nos permite mantener el portal gratuito.',
    },
    {
      q: '¿Con qué frecuencia se publican nuevos artículos?',
      a: 'Publicamos contenido nuevo de forma regular sobre precios de alquiler, zonas recomendadas y derechos del inquilino en toda Andalucía.',
    },
  ];

  const items = faqs.map(f => `
      <div class="faq-item">
        <h3>${f.q}</h3>
        <p>${f.a}</p>
      </div>`).join('\n');

  const schema = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  })}</script>`;

  const content = `
    <section>
      <div class="container">
        <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; FAQ</div>
        <h2>Preguntas frecuentes</h2>
        ${items}
        ${adBlock('faq')}
      </div>
    </section>
  `;

  writeFile('faq.html', renderLayout({
    title: 'Preguntas frecuentes',
    description: 'Respuestas a las preguntas más frecuentes sobre alquileresandalucia.es: cómo funciona el portal, enlaces de afiliados y datos de precios.',
    content,
    activeHref: '/faq.html',
    schema,
  }));
}

// ── Contacto ─────────────────────────────────────────────────────────────
function pageContacto() {
  const content = `
    <section>
      <div class="container">
        <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; Contacto</div>
        <h2>Contacto</h2>
        <p>¿Tienes alguna duda, sugerencia o quieres proponer una colaboración? Escríbenos y te responderemos lo antes posible.</p>
        <form class="contact-form" action="#" method="post">
          <input type="text" name="nombre" placeholder="Nombre" required>
          <input type="email" name="email" placeholder="Correo electrónico" required>
          <textarea name="mensaje" rows="5" placeholder="Tu mensaje" required></textarea>
          <button type="submit">Enviar mensaje</button>
        </form>
        ${adBlock('contacto')}
      </div>
    </section>
  `;

  writeFile('contacto.html', renderLayout({
    title: 'Contacto',
    description: 'Ponte en contacto con el equipo de Alquileres Andalucía.',
    content,
    activeHref: '/contacto.html',
  }));
}

// ── Sitemap y robots.txt ────────────────────────────────────────────────
function generateSitemap() {
  const urls = [
    '/',
    '/alquileres/',
    '/blog/',
    '/guias/',
    '/faq.html',
    '/contacto.html',
    ...provincias.map(p => `/alquileres/${p.slug}.html`),
    ...posts.map(p => `/blog/${p.slug}.html`),
    ...guias.map(g => `/guias/${g.slug}.html`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${SITE_URL}${u}</loc>\n  </url>`).join('\n')}
</urlset>`;

  writeFile('sitemap.xml', xml);
  writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

// ── Ejecutar build ──────────────────────────────────────────────────────
pageIndex();
pageProvinciaIndex();
provincias.forEach(pageProvincia);
pageBlogIndex();
posts.forEach(pagePost);
pageGuiasIndex();
guias.forEach(pageGuia);
pageFaq();
pageContacto();
generateSitemap();

console.log(`Build completado: ${1 + 1 + provincias.length + 1 + posts.length + 1 + guias.length + 2} páginas generadas en /dist`);
