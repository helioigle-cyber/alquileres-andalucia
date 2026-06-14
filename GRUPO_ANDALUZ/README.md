# Grupo Nacionalista Andaluz — gruponacionalistaandaluz.com

Sitio del movimiento ciudadano nacionalista andaluz. Generado con un
generador de sitios estáticos propio (sin dependencias externas), igual
que `ALQUILERES_ANDALUCIA`.

## Desarrollo local

```bash
npm run build   # genera dist/
npm run serve   # sirve dist/ en http://localhost:5051
```

## Estructura

- `src/` — plantillas (layout)
- `content/blog/` — artículos de Noticias (Markdown + front matter). ALEXIA
  añade uno nuevo cada día a las 11:00 (hora Madrid) vía
  `modules/grupoAndaluzScheduler.js`.
- `public/` — estáticos (CSS, escudo/favicon SVG, `ads.txt`)
- `dist/` — salida generada por `npm run build` (no editar a mano)
- `data/` — `simpatizantes.csv` generado por el formulario "Únete" (no se
  versiona, ver `.gitignore`)

## Monetización

- **Google AdSense**: script insertado en el `<head>` de todas las páginas
  (cliente `ca-pub-4279812118625857`) + `ads.txt` en `public/ads.txt`. Los
  bloques de anuncio (`adBlock`) están en la sección Noticias.
- **Donaciones**: botón de PayPal (donación libre) en `donaciones.html`,
  destino `helioigle@gmail.com`.

## Formularios

- **Únete** (`unete.html`): hace POST a `/api/grupoandaluz/unete`, que
  guarda los datos en `GRUPO_ANDALUZ/data/simpatizantes.csv` (fecha, nombre,
  email, provincia, formacion, area_interes, mensaje).
- **Contacto** (`contacto.html`): hace POST a `/api/grupoandaluz/contacto`,
  que envía un email a `helioigle@gmail.com` vía Nodemailer
  (`modules/emailSender.js`). Requiere `GMAIL_USER` y `GMAIL_APP_PASSWORD`
  configurados en el `.env` del proyecto principal.

Ambas rutas viven en `server.js` (proyecto ALEXIA) y son **relativas**, por
lo que `gruponacionalistaandaluz.com/api/*` debe enrutarse hacia el servidor
donde corre ALEXIA (mismo origen) para que funcionen en producción.

## Despliegue en Cloudflare Pages

1. Sube este repositorio (o la carpeta `GRUPO_ANDALUZ`) a un repositorio Git
   (GitHub/GitLab).
2. En Cloudflare Pages → **Crear un proyecto** → conectar el repositorio.
3. Configuración de build:
   - **Comando de compilación**: `npm run build`
   - **Directorio de salida**: `dist`
   - **Directorio raíz** (si el repo contiene más proyectos): `GRUPO_ANDALUZ`
4. Desplegar. Cloudflare asignará un dominio `*.pages.dev` de prueba.
5. En **Custom domains**, añade `gruponacionalistaandaluz.com` y
   `www.gruponacionalistaandaluz.com`.

## Cambiar el DNS del dominio

Una vez Cloudflare Pages confirme el dominio personalizado, te dará registros
DNS (CNAME o un registro de verificación). En el panel del proveedor del
dominio:

1. Entra en la gestión DNS de `gruponacionalistaandaluz.com`.
2. Añade los registros que indique Cloudflare Pages (normalmente un `CNAME`
   apuntando a `<proyecto>.pages.dev` para `www`, y un registro `A`/`CNAME`
   de redirección para el dominio raíz).
3. Espera la propagación DNS (puede tardar hasta 24h).

## Artículos automáticos (ALEXIA)

`modules/grupoAndaluzScheduler.js` genera 1 artículo/día a las 11:00 (hora
Madrid) sobre política, economía o cultura andaluza, con tono informativo y
constructivo (sin extremismos). Escribe un `.md` en `content/blog/`, añade
2-3 enlaces acortados con ShrinkMe.io, ejecuta `node build.js` y regenera
`dist/`. Para que el nuevo `dist/` se publique en Cloudflare Pages tras un
artículo nuevo, el proyecto debe desplegarse de nuevo (commit/push automático
del repo, o un webhook de despliegue de Cloudflare Pages llamado tras
`buildSite()`).
