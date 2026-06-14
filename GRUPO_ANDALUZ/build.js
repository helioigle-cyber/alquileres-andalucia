'use strict';
/**
 * build.js — Generador estático del sitio gruponacionalistaandaluz.com
 *
 * Lee plantillas (src/) y contenido (content/) y genera HTML estático en dist/.
 * Pensado para desplegarse en Cloudflare Pages.
 */

const fs = require('fs');
const path = require('path');

const { renderLayout, adBlock, SITE_URL } = require('./src/layout');
const { parseFrontMatter, markdownToHtml } = require('./src/markdown');

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

function loadMarkdownFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, body } = parseFrontMatter(raw);
  return { ...data, html: markdownToHtml(body) };
}

// ── Limpiar dist ───────────────────────────────────────────────────────────
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// ── Copiar estáticos ──────────────────────────────────────────────────────
copyDir(path.join(ROOT, 'public'), DIST);

// ── Cargar contenido ──────────────────────────────────────────────────────
const posts = loadMarkdownDir(path.join(ROOT, 'content', 'blog'));
const manifiesto = loadMarkdownFile(path.join(ROOT, 'content', 'manifiesto.md'));

// ── Página de inicio ───────────────────────────────────────────────────────
function pageIndex() {
  const latestPosts = posts.slice(0, 3).map(p => `
        <div class="card">
          <div class="meta">${p.date}</div>
          <h3>${p.title}</h3>
          <p>${p.description || ''}</p>
          <a href="/noticias/${p.slug}.html">Leer noticia &rarr;</a>
        </div>`).join('\n');

  const content = `
    <section class="hero">
      <div class="container">
        <h1>Andalucía primero. Siempre.</h1>
        <p class="slogan">Un movimiento ciudadano por la gestión real de nuestra tierra</p>
        <div class="cta-group">
          <a href="/unete.html" class="btn btn-primary">Únete al movimiento</a>
          <a href="/manifiesto.html" class="btn btn-outline">Leer el manifiesto</a>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <h2>¿Qué es el Grupo Nacionalista Andaluz?</h2>
        <div class="pillars-grid">
          <div class="card">
            <div class="icon">🤝</div>
            <h3>Inclusivo</h3>
            <p>Abierto a cualquier ciudadano andaluz, sea cual sea su ideología, origen, religión u orientación. Lo único que pedimos es compromiso con Andalucía.</p>
          </div>
          <div class="card">
            <div class="icon">📊</div>
            <h3>Gestión, no folclore</h3>
            <p>Nos centramos en la gestión eficiente, transparente y rigurosa del territorio andaluz. Sin discursos vacíos.</p>
          </div>
          <div class="card">
            <div class="icon">🏛️</div>
            <h3>Independiente</h3>
            <p>Sin depender de las decisiones de los partidos centralistas de Madrid. Andalucía primero, siempre.</p>
          </div>
          <div class="card">
            <div class="icon">🎓</div>
            <h3>Liderazgo preparado</h3>
            <p>Impulsado por personas con formación universitaria y experiencia contrastada, que puedan explicar con rigor cómo se hace.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-alt">
      <div class="container">
        <h2>Últimas noticias</h2>
        <div class="card-grid">
          ${latestPosts || '<p>Próximamente nuevos artículos.</p>'}
        </div>
      </div>
    </section>

    <section>
      <div class="container" style="text-align:center;">
        <h2>Participa en el debate por el futuro de Andalucía</h2>
        <p style="color:var(--gray); max-width:640px; margin: 0 auto 24px;">
          Si crees que Andalucía merece una gestión mejor, este es tu espacio.
          Súmate al movimiento, comparte tus ideas y ayúdanos a construir
          una propuesta seria para nuestra tierra.
        </p>
        <div class="cta-group">
          <a href="/unete.html" class="btn btn-primary" style="background:var(--green); color:var(--white);">Quiero unirme</a>
          <a href="/donaciones.html" class="btn btn-outline" style="border-color:var(--green); color:var(--green);">Financia el movimiento</a>
        </div>
      </div>
    </section>
  `;

  writeFile('index.html', renderLayout({
    title: '',
    description: 'Grupo Nacionalista Andaluz: movimiento ciudadano andaluz por la gestión real, transparente y eficiente de Andalucía, independiente de los partidos centralistas.',
    content,
    activeHref: '/',
  }));
}

// ── Manifiesto ──────────────────────────────────────────────────────────────
function pageManifiesto() {
  const content = `
    <article class="article">
      <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; Manifiesto</div>
      <h1>${manifiesto.title}</h1>
      ${manifiesto.html}
      <div style="text-align:center; margin-top:30px;">
        <a href="/unete.html" class="btn btn-primary" style="background:var(--green); color:var(--white);">Únete al movimiento</a>
      </div>
    </article>
  `;

  writeFile('manifiesto.html', renderLayout({
    title: 'Manifiesto Fundacional',
    description: manifiesto.description || '',
    content,
    activeHref: '/manifiesto.html',
  }));
}

// ── Noticias (blog con AdSense) ─────────────────────────────────────────────
function pageNoticiasIndex() {
  const items = posts.map(p => `
        <div class="card">
          <div class="meta">${p.date} &middot; ${p.author || 'ALEXIA'}</div>
          <h3>${p.title}</h3>
          <p>${p.description || ''}</p>
          <a href="/noticias/${p.slug}.html">Leer noticia &rarr;</a>
        </div>`).join('\n');

  const content = `
    <section>
      <div class="container">
        <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; Noticias</div>
        <h2>Noticias: política, economía y cultura andaluza</h2>
        <div class="post-list">
          ${items || '<p>Próximamente nuevos artículos.</p>'}
        </div>
        ${adBlock('noticias-index')}
      </div>
    </section>
  `;

  writeFile('noticias/index.html', renderLayout({
    title: 'Noticias',
    description: 'Artículos sobre política, economía, financiación autonómica y cultura andaluza, con datos y comparativas con otras comunidades.',
    content,
    activeHref: '/noticias/',
    includeAdsense: true,
  }));
}

function pagePost(post) {
  const schema = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || '',
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Grupo Nacionalista Andaluz' },
  })}</script>`;

  const content = `
    <article class="article">
      <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; <a href="/noticias/">Noticias</a> &rsaquo; ${post.title}</div>
      <h1>${post.title}</h1>
      <div class="meta">Publicado el ${post.date} &middot; ${post.author || 'ALEXIA'}</div>
      ${adBlock('post-top-' + post.slug)}
      ${post.html}
      ${adBlock('post-bottom-' + post.slug)}
    </article>
  `;

  writeFile(`noticias/${post.slug}.html`, renderLayout({
    title: post.title,
    description: post.description || '',
    content,
    activeHref: `/noticias/${post.slug}.html`,
    schema,
    includeAdsense: true,
  }));
}

// ── Únete ────────────────────────────────────────────────────────────────────
function pageUnete() {
  const content = `
    <section>
      <div class="container">
        <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; Únete</div>
        <h2>Únete al movimiento</h2>
        <p style="text-align:center; color:var(--gray); max-width:640px; margin: 0 auto 30px;">
          ¿Quieres aportar tus ideas, tu tiempo o tu formación a este proyecto?
          Rellena este formulario y nos pondremos en contacto contigo.
          La formación universitaria es obligatoria para los roles de liderazgo,
          pero cualquier persona puede sumarse como simpatizante.
        </p>
        <form class="join-form" id="join-form">
          <div class="form-grid">
            <div>
              <label for="nombre">Nombre completo *</label>
              <input type="text" id="nombre" name="nombre" required>
            </div>
            <div>
              <label for="email">Email *</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div>
              <label for="provincia">Provincia de Andalucía *</label>
              <select id="provincia" name="provincia" required>
                <option value="">Selecciona una provincia</option>
                <option>Almería</option>
                <option>Cádiz</option>
                <option>Córdoba</option>
                <option>Granada</option>
                <option>Huelva</option>
                <option>Jaén</option>
                <option>Málaga</option>
                <option>Sevilla</option>
              </select>
            </div>
            <div>
              <label for="formacion">Formación académica *</label>
              <select id="formacion" name="formacion" required>
                <option value="">Selecciona tu formación</option>
                <option>Universitaria — Grado</option>
                <option>Universitaria — Máster</option>
                <option>Universitaria — Doctorado</option>
                <option>Formación Profesional</option>
                <option>Bachillerato / ESO</option>
                <option>Otra</option>
              </select>
            </div>
            <div class="full">
              <label for="area">Área de interés *</label>
              <select id="area" name="area" required>
                <option value="">Selecciona un área</option>
                <option value="politica">Política</option>
                <option value="comunicacion">Comunicación</option>
                <option value="juridico">Jurídico</option>
                <option value="economia">Economía</option>
                <option value="cultura">Cultura</option>
                <option value="tecnologia">Tecnología</option>
              </select>
            </div>
            <div class="full">
              <label for="mensaje">Mensaje de presentación *</label>
              <textarea id="mensaje" name="mensaje" rows="5" required placeholder="Cuéntanos quién eres y cómo te gustaría participar"></textarea>
            </div>
          </div>
          <button type="submit">Enviar adhesión</button>
          <p class="form-note" id="join-form-status"></p>
          <p class="form-note">Tus datos se utilizarán únicamente para contactar contigo sobre el movimiento y no se compartirán con terceros.</p>
        </form>
      </div>
    </section>

    <script>
      document.getElementById('join-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const form = e.target;
        const status = document.getElementById('join-form-status');
        const data = Object.fromEntries(new FormData(form).entries());
        data.fecha = new Date().toISOString();
        try {
          const key = 'gna_simpatizantes';
          const lista = JSON.parse(localStorage.getItem(key) || '[]');
          lista.push(data);
          localStorage.setItem(key, JSON.stringify(lista));
        } catch (err) {}
        status.textContent = 'Gracias por tu interés, te contactaremos pronto.';
        form.reset();
      });
    </script>
  `;

  writeFile('unete.html', renderLayout({
    title: 'Únete al movimiento',
    description: 'Súmate al movimiento ciudadano nacionalista andaluz: política, comunicación, economía, jurídico, cultura o tecnología. Tu formación y tu compromiso cuentan.',
    content,
    activeHref: '/unete.html',
  }));
}

// ── Donaciones ───────────────────────────────────────────────────────────────
function pageDonaciones() {
  const paypalEmail = 'helioigle@gmail.com';
  const paypalUrl = `https://www.paypal.com/donate/?business=${encodeURIComponent(paypalEmail)}&no_recurring=0&item_name=${encodeURIComponent('Financia el movimiento - Grupo Nacionalista Andaluz')}&currency_code=EUR`;

  const content = `
    <section>
      <div class="container">
        <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; Donaciones</div>
        <div class="donation-box">
          <h2>Financia el movimiento</h2>
          <p>
            Este movimiento se sostiene gracias a las personas que creen en él.
            Cualquier aportación, grande o pequeña, nos ayuda a seguir generando
            contenido, organizando el proyecto y llegando a más ciudadanos andaluces.
          </p>
          <a class="paypal-btn" href="${paypalUrl}" target="_blank" rel="noopener">Donar con PayPal</a>
          <p class="form-note" style="margin-top:20px;">Donación libre y segura a través de PayPal. No se requiere cuenta de PayPal para donar.</p>
        </div>
      </div>
    </section>
  `;

  writeFile('donaciones.html', renderLayout({
    title: 'Donaciones',
    description: 'Financia el movimiento ciudadano nacionalista andaluz mediante una donación libre a través de PayPal.',
    content,
    activeHref: '/donaciones.html',
  }));
}

// ── Contacto ─────────────────────────────────────────────────────────────────
function pageContacto() {
  const content = `
    <section>
      <div class="container">
        <div class="breadcrumbs"><a href="/">Inicio</a> &rsaquo; Contacto</div>
        <h2>Contacto</h2>
        <p style="text-align:center; color:var(--gray); max-width:640px; margin: 0 auto 30px;">
          ¿Tienes alguna duda, sugerencia o quieres proponer una colaboración? Escríbenos y te responderemos lo antes posible.
        </p>
        <form class="contact-form" id="contact-form">
          <div>
            <label for="c-nombre">Nombre *</label>
            <input type="text" id="c-nombre" name="nombre" required>
          </div>
          <div>
            <label for="c-email">Correo electrónico *</label>
            <input type="email" id="c-email" name="email" required>
          </div>
          <div>
            <label for="c-mensaje">Mensaje *</label>
            <textarea id="c-mensaje" name="mensaje" rows="5" required></textarea>
          </div>
          <button type="submit">Enviar mensaje</button>
          <p class="form-note" id="contact-form-status"></p>
        </form>
      </div>
    </section>

    <script>
      document.getElementById('contact-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const form = e.target;
        const status = document.getElementById('contact-form-status');
        status.textContent = 'Mensaje recibido, te responderemos a la mayor brevedad en helioigle@gmail.com.';
        form.reset();
      });
    </script>
  `;

  writeFile('contacto.html', renderLayout({
    title: 'Contacto',
    description: 'Ponte en contacto con el Grupo Nacionalista Andaluz.',
    content,
    activeHref: '/contacto.html',
  }));
}

// ── Sitemap y robots.txt ────────────────────────────────────────────────────
function generateSitemap() {
  const urls = [
    '/',
    '/noticias/',
    '/manifiesto.html',
    '/unete.html',
    '/donaciones.html',
    '/contacto.html',
    ...posts.map(p => `/noticias/${p.slug}.html`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${SITE_URL}${u}</loc>\n  </url>`).join('\n')}
</urlset>`;

  writeFile('sitemap.xml', xml);
  writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

// ── Ejecutar build ──────────────────────────────────────────────────────────
pageIndex();
pageManifiesto();
pageNoticiasIndex();
posts.forEach(pagePost);
pageUnete();
pageDonaciones();
pageContacto();
generateSitemap();

console.log(`Build completado: ${2 + 1 + posts.length + 3 + 1} páginas generadas en /dist`);
