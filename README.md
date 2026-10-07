# El Muelle — portfolio 3D de pesca

Sitio estático (HTML + CSS + JS con Three.js desde CDN). No necesita instalar nada.

## Editar el contenido
Todo está en `content.js`: nombre, email, LinkedIn, GitHub, CV, textos, proyectos (cada uno es un pez) y skills (señuelos).
Para el CV: copiá `cv.pdf` en esta carpeta y poné `cv: 'cv.pdf'` en `PROFILE`.

## Verlo en tu compu
```
python -m http.server 5180
```
y abrí http://localhost:5180 (no funciona abriendo el index.html con doble clic, porque usa módulos JS).

## Publicarlo gratis
Subí la carpeta a Netlify Drop (arrastrar y soltar), Vercel, Cloudflare Pages o GitHub Pages.
