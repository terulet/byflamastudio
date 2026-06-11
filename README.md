# FLAMA Studio — Web lista para publicar

Esta carpeta contiene **la web completa y limpia**, lista para subir a GitHub Pages.
Sube **el contenido de esta carpeta** (no la carpeta entera) a la raíz del repositorio.

## Archivos

```
index.html        ← La web (una sola página)
style.css         ← Estilos
script.js         ← Calculadora, menú móvil y animaciones
founder.jpg       ← Foto del fundador
favicon.svg       ← Icono de la pestaña
robots.txt        ← Para Google
sitemap.xml       ← Para Google
CNAME             ← Dominio byflamastudio.com (GitHub Pages)
assets/
  └── og-flama.jpg  ← Imagen que sale al compartir el link en WhatsApp/redes
```

## Cómo publicar en GitHub Pages

1. Sube el contenido de esta carpeta a tu repositorio (rama `main`, carpeta raíz).
2. GitHub → Settings → Pages → Source: `main` / `root`.
3. En tu proveedor de dominio, apunta `byflamastudio.com` a GitHub Pages.
4. El archivo `CNAME` ya deja configurado el dominio.

## ⚠️ Pendiente antes de publicar (solo tú puedes completarlo)

1. **Datos legales** (resaltados en amarillo dentro de la web, en "Aviso legal" y
   "Política de privacidad"): faltan tu **nombre y apellidos** y tu **NIF/DNI**.
   Búscalos en `index.html` por `fcro-pendiente` y sustituye el texto amarillo.
2. **Imagen OG** (`assets/og-flama.jpg`): ahora es un mockup de tu web. Si quieres,
   reemplázala por una imagen diseñada de 1200×630 px con tu logo y tu claim.
3. **Formulario**: la `access_key` de Web3Forms ya está puesta. Haz **un envío de
   prueba** para confirmar que te llegan los correos.
4. **Analítica (opcional)**: cuando tengas tu ID de Google Tag Manager, pégalo donde
   pone "Google Tag Manager: PENDIENTE de configurar" (dos sitios en `index.html`).

## Cambios ya aplicados en esta versión

- Consolidada en una sola carpeta (antes había versiones duplicadas y enlaces rotos).
- Email unificado a `terix@byflamastudio.com`.
- Imagen de WhatsApp/redes (OG) creada y enlazada.
- Favicon, robots.txt, sitemap.xml y CNAME añadidos.
- GTM a medias eliminado (ya no da error ni carga cookies).
- Foto del fundador con dimensiones fijas (evita saltos de maquetación).
- Datos de negocio (teléfono y email) añadidos a los datos estructurados de Google.
- Sección de cookies añadida a la política de privacidad.
- Corregida una incoherencia de copy (años de experiencia).
