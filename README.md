# 🎣 El Muelle — Portfolio 3D de Ignacio Pisera

> Un portfolio interactivo en 3D donde cada proyecto es un pez y cada stack técnico es una carnada. Hecho 100% con código: sin modelos 3D externos, sin librerías de UI.

**[Ver demo en vivo](https://github.com/ipiseradev/Portfolio-Ignacio)** · [LinkedIn](https://www.linkedin.com/in/ignacio-pisera-16851a2b6/) · [GitHub](https://github.com/ipiseradev)

![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=flat&logo=javascript&logoColor=black)
![WebGL](https://img.shields.io/badge/WebGL-990000?style=flat&logo=webgl&logoColor=white)
![No build step](https://img.shields.io/badge/build_step-none-brightgreen?style=flat)

---

## Sobre mí

Soy **Software Engineer** especializado en **backend con Python** y automatización de procesos mediante IA. Diseño y construyo productos de punta a punta —APIs escalables, sistemas SaaS multi-tenant, aplicaciones de escritorio en capas— aplicando patrones formales como **Clean Architecture**, **Repository Pattern** y **Dependency Injection**. También trabajo con **Java/Spring Boot**, **Node.js** y, en el frontend, con **React**, **Angular** y **TypeScript**.

Tengo experiencia integrando modelos de IA en flujos de negocio reales: desde agentes autónomos que generan código hasta dashboards de analítica predictiva para optimizar campañas publicitarias. Mi foco actual es construir **software empresarial escalable y mantenible** para producción.

| | |
|---|---|
| 🎯 **Especialización** | Backend & IA aplicada |
| 🕐 **Disponibilidad** | Full-time y freelance |
| 🌐 **Modalidad** | Remoto o híbrido |
| 📍 **Ubicación** | Buenos Aires, Argentina |

---

## Qué es este proyecto

Este repo es mi portfolio personal, pero en vez de ser una lista de cards, es una **escena 3D navegable**: un muelle de pesca de noche/día generado íntegramente por código (terreno, agua animada, cabaña, bote, cardumen con IA de enjambre tipo *boids*). Cada proyecto que pesco con la caña abre una ficha con su descripción, stack y links.

**Highlights técnicos de la escena:**

- Renderizado 3D con **Three.js** / WebGL, sin assets ni modelos externos — toda la geometría y los shaders se generan en runtime.
- Cardumen de peces animado con un algoritmo de **swarm AI (boids)**.
- **Bloom** en tiempo real, ciclo día/noche, mini-juego de pesca.
- Soporte bilingüe (ES/EN) y modo *express* para recorrer el contenido rápido.
- Sin frameworks de UI ni paso de build: HTML + CSS + JS modular servido directo.

## Stack

| Categoría | Tecnologías |
|---|---|
| **Lenguajes** | Java, C, JavaScript, TypeScript, Python |
| **Backend** | Spring Boot, Spring IoC, Hibernate, Node.js, Express, GraphQL, FastAPI |
| **Frontend / UI** | HTML5, CSS3, React, Angular, Redux, Bootstrap, Tailwind |
| **Bases de datos** | PostgreSQL, MySQL, MariaDB, MongoDB, Redis, SQLite |
| **DevOps / Cloud** | Docker, Kubernetes, Jenkins, Nginx, AWS, Azure |
| **Testing / VCS** | Git, GitHub, GitLab, JUnit 5, Selenium |
| **IA / Ecommerce** | Shopify & Liquid, CRO, Gradio, Replicate, Ollama, Three.js |

## Proyectos destacados

| Proyecto | Descripción | Stack |
|---|---|---|
| **[Huella Clínica Veterinaria](https://github.com/ipiseradev/Landing-Huella)** | Landing 3D para una clínica veterinaria 24hs con personajes procedurales animados | Three.js, GSAP, Lenis, Vite |
| **[PostPilot](https://github.com/ipiseradev/postpilot-frontend)** | Copiloto con IA que analiza posts de LinkedIn antes de publicarlos | React, Tailwind, FastAPI, IA generativa |
| **[StockControl](https://github.com/ipiseradev/StockControl)** | Sistema multi-tenant de control de stock en tiempo real con cobro de suscripción | ASP.NET Core, Blazor WASM, SignalR, PostgreSQL |
| **[Vittra](https://github.com/ipiseradev/Vittra)** | SaaS de gestión para clínicas: turnos, historias clínicas, recetas y facturación | React, TypeScript, FastAPI, PostgreSQL |
| **[ClariAD](https://github.com/ipiseradev/ClariAD)** | Dashboard con IA que unifica Meta Ads, Google Ads y TikTok Ads | Next.js, TypeScript, Tailwind, IA generativa |
| **AduaERP** | ERP de escritorio para agencias aduanales con arquitectura en capas | C#, .NET 10, WPF, EF Core |
| **DevJarvis** | Asistente de IA conversacional con LLMs 100% locales vía Ollama | Python, FastAPI, Tauri, Ollama |

El detalle completo de cada proyecto (y los que faltan acá) está en [`content.js`](content.js).

## Cómo correrlo localmente

```bash
python -m http.server 5180
```

Después abrí `http://localhost:5180`. **No funciona** abriendo `index.html` con doble clic, porque usa módulos JS (`type="module"`).

## Estructura del proyecto

```
├── index.html     # Markup y layout de la UI (topbar, panel, guía, loader)
├── main.js        # Lógica de la escena 3D, interacción y estado de la app
├── content.js      # Todo el contenido editable: perfil, proyectos, skills, textos ES/EN
├── style.css       # Estilos de la interfaz
└── cv.pdf          # CV descargable
```

Para editar el contenido (nombre, proyectos, skills, textos), todo vive en `content.js` — no hace falta tocar la lógica de la escena.

## Deploy

Es un sitio estático, no necesita build ni backend. Se puede publicar gratis en **Netlify**, **Vercel**, **Cloudflare Pages** o **GitHub Pages** arrastrando la carpeta o conectando el repo.

---

## Contacto

- ✉️ [piseraignacio@gmail.com](mailto:piseraignacio@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/ignacio-pisera-16851a2b6/)
- 💻 [GitHub](https://github.com/ipiseradev)
