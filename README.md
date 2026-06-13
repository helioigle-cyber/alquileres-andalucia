# Alquileres Andalucía — alquileresandalucia.es

Portal estático de alquileres asequibles en Andalucía. Generado con un
generador de sitios estáticos propio (sin dependencias externas).

## Desarrollo local

```bash
npm run build   # genera dist/
npm run serve   # sirve dist/ en http://localhost:5050
```

## Estructura

- `src/` — plantillas (layout, markdown parser, datos de provincias y afiliados)
- `content/blog/` — artículos del blog (Markdown + front matter). ALEXIA añade
  uno nuevo cada día a las 10:00 (hora Madrid) vía `modules/blogScheduler.js`.
- `content/guias/` — guías para inquilinos (Markdown + front matter)
- `public/` — estáticos (CSS, favicon, `ads.txt`, `_headers`)
- `dist/` — salida generada por `npm run build` (no editar a mano)

## Monetización

- **Google AdSense**: script ya insertado en el `<head>` de todas las páginas
  (cliente `ca-pub-4279812118625857`) + `ads.txt` en `public/ads.txt`. Los
  bloques de anuncio (`adBlock`) están en sidebar, entre artículos y footer.
- **Afiliados**: enlaces en `src/data/afiliados.js` (Idealista, Fotocasa,
  seguros de hogar, mudanzas, energía, Amazon). Sustituir los placeholders
  (`#`) por enlaces de afiliado reales cuando estén disponibles.

## Despliegue en Cloudflare Pages

1. Sube este repositorio (o la carpeta `ALQUILERES_ANDALUCIA`) a un repositorio
   Git (GitHub/GitLab).
2. En Cloudflare Pages → **Crear un proyecto** → conectar el repositorio.
3. Configuración de build:
   - **Comando de compilación**: `npm run build`
   - **Directorio de salida**: `dist`
   - **Directorio raíz** (si el repo contiene más proyectos): `ALQUILERES_ANDALUCIA`
4. Desplegar. Cloudflare asignará un dominio `*.pages.dev` de prueba.
5. En **Custom domains**, añade `alquileresandalucia.es` y `www.alquileresandalucia.es`.

## Cambiar el DNS en IONOS

Una vez Cloudflare Pages confirme el dominio personalizado, te dará registros
DNS (CNAME o un registro de verificación). En el panel de IONOS:

1. Ve a **Dominios** → `alquileresandalucia.es` → **DNS**.
2. Elimina los registros antiguos que apuntan a Google Sites.
3. Añade los registros que indique Cloudflare Pages (normalmente un `CNAME`
   apuntando a `<proyecto>.pages.dev` para `www`, y un registro `A`/`CNAME`
   de redirección para el dominio raíz).
4. Espera la propagación DNS (puede tardar hasta 24h).

## Artículos automáticos (ALEXIA)

`modules/blogScheduler.js` genera 1 artículo/día a las 10:00 (hora Madrid):
escribe un `.md` en `content/blog/`, ejecuta `node build.js` y regenera
`dist/`. Para que el nuevo `dist/` se publique en Cloudflare Pages tras un
artículo nuevo, el proyecto debe desplegarse de nuevo (por ejemplo, mediante
un commit/push automático del repo, o un webhook de despliegue de Cloudflare
Pages llamado tras `buildSite()`).
