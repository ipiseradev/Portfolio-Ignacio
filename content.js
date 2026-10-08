// ─────────────────────────────────────────────────────────────
//  Todo el contenido del portfolio vive acá.
//  Editá este archivo para cambiar textos, proyectos, links y skills.
//  Cada texto tiene versión "es" y "en".
// ─────────────────────────────────────────────────────────────

export const PROFILE = {
  name: 'Ignacio Pisera',
  email: 'piseraignacio@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ignacio-pisera-16851a2b6/',
  github: 'https://github.com/ipiseradev',
  cv: '', // TODO: copiá tu CV a esta carpeta (ej. 'cv.pdf') y poné el nombre acá
};

export const ABOUT = {
  paragraphs: {
    es: [
      'Soy desarrollador full stack con foco en backend e IA aplicada. Mi base es Java con Spring Boot (Hibernate y Spring IoC), y también trabajo con Node.js, Express y GraphQL para construir APIs sólidas y mantenibles. En el frontend me gusta trabajar con React, Angular y TypeScript para que las APIs que construyo tengan interfaces de usuario claras y rápidas.',
    ],
    en: [
      "I'm a full stack developer focused on backend and applied AI. My foundation is Java with Spring Boot (Hibernate and Spring IoC), and I also work with Node.js, Express and GraphQL to build solid, maintainable APIs. On the frontend I enjoy working with React, Angular and TypeScript so the APIs I build come with clear, fast user interfaces.",
    ],
  },
  facts: [], // opcional: datos rápidos debajo del texto, ej. { label: { es: 'Enfoque', en: 'Focus' }, value: { es: '...', en: '...' } }
};

// Cada proyecto es un pez. El orden es el orden en que se pescan.
export const PROJECTS = [
  {
    id: 'kinerdos',
    name: { es: 'Kinerdos · Página de producto', en: 'Kinerdos · Product page' },
    species: { es: 'Dorado', en: 'Golden Dorado' },
    latin: 'Salminus brasiliensis',
    fish: { body: '#e9a91b', fin: '#e0561f' },
    weight: { es: '13 secciones Liquid', en: '13 Liquid sections' },
    summary: {
      es: 'Página de producto de alta conversión para una tienda Shopify sobre el tema Dawn.',
      en: 'High-converting product page for a Shopify store built on the Dawn theme.',
    },
    desc: {
      es: 'Desarrollé el main-product y un set de secciones CRO a medida: barra de compra fija, beneficios, comparativa, pasos, testimonios, garantía, FAQ y CTA final, más header y footer propios. Todo mobile-first y pensado para que el visitante llegue al botón de compra sin fricción.',
      en: 'I built the main-product template and a custom set of CRO sections: sticky buy bar, benefits, comparison, steps, testimonials, guarantee, FAQ and final CTA, plus a custom header and footer. Mobile-first and designed to get visitors to the buy button without friction.',
    },
    tags: ['Shopify', 'Liquid', 'CSS', 'JavaScript', 'CRO'],
    links: [], // ej: [{ label: { es: 'Ver tienda', en: 'See store' }, url: 'https://...' }]
  },
  {
    id: 'tryon',
    name: { es: 'Virtual Try-On AI', en: 'Virtual Try-On AI' },
    species: { es: 'Surubí', en: 'Surubí catfish' },
    latin: 'Pseudoplatystoma corruscans',
    fish: { body: '#9aa39a', fin: '#4d564f', spots: '#2f3532' },
    weight: { es: '1 modelo de difusión', en: '1 diffusion model' },
    summary: {
      es: 'Subís tu foto y una prenda, y la IA te la prueba en segundos.',
      en: 'Upload your photo and a garment, and AI tries it on you in seconds.',
    },
    desc: {
      es: 'Demo web que viste a una persona con una prenda usando el modelo IDM-VTON vía Replicate. Interfaz en Gradio con tipo de prenda (superior, inferior, vestido) y una descripción opcional para guiar al modelo. Pensada como herramienta para tiendas de moda online.',
      en: 'Web demo that dresses a person in a garment using the IDM-VTON model on Replicate. Gradio interface with garment type (top, bottom, dress) and an optional description to guide the model. Built as a tool for online fashion stores.',
    },
    tags: ['Python', 'Gradio', 'Replicate', 'IA generativa'],
    links: [],
  },
  {
    id: 'estafas',
    name: { es: 'Detector de estafas en alquileres', en: 'Rental scam detector' },
    species: { es: 'Tararira', en: 'Trahira' },
    latin: 'Hoplias malabaricus',
    fish: { body: '#6f6b3c', fin: '#3d3a20', spots: '#2c2a17' },
    weight: { es: '3 tipos de bandera roja', en: '3 kinds of red flags' },
    status: { es: 'MVP en desarrollo', en: 'MVP in progress' },
    summary: {
      es: 'Pegás el link de un aviso y te devuelve las banderas rojas con un nivel de riesgo.',
      en: 'Paste a listing link and get its red flags with a risk level.',
    },
    desc: {
      es: 'Analiza avisos de Mercado Libre y Zonaprop: compara el precio contra el promedio del barrio (dataset abierto de Properati), detecta fotos reutilizadas en otros avisos con CLIP / pHash y revisa texto e imágenes con Llama 3.2 Vision corriendo local en Ollama. Sin costo de API por uso.',
      en: 'Analyzes Mercado Libre and Zonaprop listings: compares the price with the neighborhood average (Properati open dataset), finds photos reused across listings with CLIP / pHash, and reviews text and images with Llama 3.2 Vision running locally on Ollama. Zero per-use API cost.',
    },
    tags: ['Python', 'Scraping', 'Llama 3.2 Vision', 'Ollama', 'CLIP'],
    links: [],
  },
  {
    id: 'muelle',
    name: { es: 'Este muelle', en: 'This dock' },
    species: { es: 'Pejerrey', en: 'Silverside' },
    latin: 'Odontesthes bonariensis',
    fish: { body: '#c9d8e3', fin: '#6f97b8' },
    weight: { es: '0 modelos 3D descargados', en: '0 downloaded 3D models' },
    summary: {
      es: 'El portfolio que estás recorriendo: un lago 3D generado 100% con código.',
      en: 'The portfolio you are exploring: a 3D lake generated 100% with code.',
    },
    desc: {
      es: 'Escena en Three.js sin modelos externos: el terreno, el agua animada, la cabaña, el bote y cada pez se generan por código. Incluye un mini-juego de pesca, modo día/noche, versión en inglés y un modo express para leer todo rápido.',
      en: 'A Three.js scene with no external models: terrain, animated water, cabin, boat and every fish are generated in code. Includes a fishing mini-game, day/night mode, Spanish/English and an express mode to read everything fast.',
    },
    tags: ['Three.js', 'JavaScript', 'WebGL', 'HTML & CSS'],
    links: [],
  },
];

// Cada categoría de habilidades es un señuelo de la caja de pesca.
export const SKILLS = [
  {
    name: { es: 'Lenguajes', en: 'Languages' },
    lure: { es: 'Cucharita', en: 'Spoon' },
    color: '#f2b632',
    items: ['Java', 'C', 'JavaScript', 'TypeScript', 'Python'],
  },
  {
    name: { es: 'Backend y frameworks', en: 'Backend & frameworks' },
    lure: { es: 'Rapala', en: 'Minnow' },
    color: '#3f7cc4',
    items: ['Spring Boot', 'Spring IoC', 'Hibernate', 'Node.js', 'Express', 'GraphQL'],
  },
  {
    name: { es: 'Frontend y UI/UX', en: 'Frontend & UI/UX' },
    lure: { es: 'Popper', en: 'Popper' },
    color: '#ff7a3d',
    items: ['HTML5', 'CSS3', 'React', 'Angular', 'Redux', 'Bootstrap'],
  },
  {
    name: { es: 'Bases de datos', en: 'Databases' },
    lure: { es: 'Jig', en: 'Jig' },
    color: '#2fa37a',
    items: ['PostgreSQL', 'MySQL', 'MariaDB', 'MongoDB', 'Redis', 'SQLite'],
  },
  {
    name: { es: 'DevOps y cloud', en: 'DevOps & cloud' },
    lure: { es: 'Crankbait', en: 'Crankbait' },
    color: '#25a8c4',
    items: ['Docker', 'Kubernetes', 'Jenkins', 'Nginx', 'AWS', 'Azure'],
  },
  {
    name: { es: 'Versionado y testing', en: 'Version control & testing' },
    lure: { es: 'Spinner', en: 'Spinner' },
    color: '#e04f5f',
    items: ['Git', 'GitHub', 'GitLab', 'JUnit 5', 'Selenium'],
  },
  {
    name: { es: 'IDEs y herramientas', en: 'IDEs & tools' },
    lure: { es: 'Paleta', en: 'Paddle tail' },
    color: '#b05cd6',
    items: ['IntelliJ / JetBrains', 'Eclipse', 'VS Code', 'Postman', 'Ubuntu'],
  },
  {
    name: { es: 'Ecommerce e IA', en: 'Ecommerce & AI' },
    lure: { es: 'Mosca', en: 'Fly' },
    color: '#f7df1e',
    items: ['Shopify & Liquid', 'CRO', 'Gradio', 'Replicate', 'Ollama', 'Three.js'],
  },
];

export const GUIDE = {
  es: {
    speaker: 'El Dorado · guía del muelle',
    intro: [
      '¡Buenas! Soy el Dorado, el tigre del río y guía de este muelle.',
      'Acá {first} juntó sus dos pasiones: programar y pescar. Cada proyecto es una captura.',
      'Tocá la caña al final del muelle para lanzar. En la caja están sus señuelos (su stack), en la cabaña quién es y en el bote cómo contactarlo.',
    ],
    firstCatch: ['¡Linda pieza! Tranquilo, acá se pesca con devolución: el pez vuelve al agua.'],
    allCaught: ['¡Bitácora completa! Ya sacaste todos los proyectos. Si te gustó lo que viste, subite al bote y escribile a {first}.'],
  },
  en: {
    speaker: 'The Dorado · dock guide',
    intro: [
      "Hey there! I'm the Dorado, tiger of the river and guide of this dock.",
      'Here {first} brought together two passions: coding and fishing. Every project is a catch.',
      'Tap the rod at the end of the dock to cast. The tackle box holds the lures (the stack), the cabin tells you about {first} and the boat how to reach out.',
    ],
    firstCatch: ["Nice one! Don't worry, this is catch and release: the fish goes back to the water."],
    allCaught: ['Catch log complete! You landed every project. If you liked what you saw, hop on the boat and say hi to {first}.'],
  },
};

export const UI = {
  es: {
    docTitle: 'El Muelle de {first} · Portfolio 3D',
    brandEyebrow: 'Portfolio de {name}',
    brandTitle: 'El Muelle de {first}',
    tagline: 'Desarrollador Full Stack · Java & Spring · Pescador',
    overview: 'Vista general',
    express: 'Modo express',
    exitExpress: 'Volver al muelle',
    toNight: 'Pasar a la noche',
    toDay: 'Pasar al día',
    hint: 'Arrastrá para mirar · rueda para acercarte · tocá los carteles',
    hintTouch: 'Deslizá para mirar · pellizcá para acercarte · tocá los carteles',
    loading: 'Preparando la carnada…',
    next: 'Siguiente',
    gotIt: '¡A pescar!',
    skip: 'Saltar',
    close: 'Cerrar',
    help: 'Ayuda',
    hsRod: 'Lanzar la caña',
    hsRodBusy: 'Pescando…',
    hsSkills: 'Caja de señuelos',
    hsLog: 'Bitácora',
    hsAbout: 'Sobre mí',
    hsContact: 'Contacto',
    casting: '¡Allá va!',
    waiting: 'Esperando el pique…',
    bite: '¡Pica! ¡Pica!',
    reeling: '¡Recogiendo!',
    caught: '¡Sacaste un {species}!',
    weight: 'Peso',
    release: 'Pesca con devolución: el pez vuelve al agua al cerrar.',
    castAgain: 'Volver a lanzar',
    seeLog: 'Ver bitácora',
    ctaCast: 'Lanzar la caña',
    caughtTag: 'Pescado',
    inWater: 'Todavía en el agua',
    progress: '{n} de {total} especies en la bitácora',
    logIntro: 'Todos los proyectos que viven en este lago. Los que ya pescaste quedan marcados.',
    skillsIntro: 'Cada señuelo es un grupo de herramientas que uso para que el proyecto pique.',
    aboutTitle: 'Sobre mí',
    skillsTitle: 'Caja de señuelos',
    logTitle: 'Bitácora de capturas',
    contactTitle: '¿Salimos a pescar?',
    contactEyebrow: 'Contacto',
    contactText: 'Si tenés un proyecto, una propuesta o querés charlar de código (o de pesca), escribime.',
    projectsTitle: 'Proyectos',
    email: 'Escribime',
    copyEmail: 'Copiar email',
    copied: 'Email copiado',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    downloadCv: 'Descargar CV',
    noWebgl: 'Tu navegador no pudo cargar la escena 3D, así que te muestro la versión express.',
  },
  en: {
    docTitle: "{first}'s Dock · 3D Portfolio",
    brandEyebrow: "{name}'s portfolio",
    brandTitle: "{first}'s Dock",
    tagline: 'Full Stack Developer · Java & Spring · Angler',
    overview: 'Overview',
    express: 'Express mode',
    exitExpress: 'Back to the dock',
    toNight: 'Switch to night',
    toDay: 'Switch to day',
    hint: 'Drag to look around · scroll to zoom · tap the signs',
    hintTouch: 'Swipe to look around · pinch to zoom · tap the signs',
    loading: 'Baiting the hook…',
    next: 'Next',
    gotIt: "Let's fish!",
    skip: 'Skip',
    close: 'Close',
    help: 'Help',
    hsRod: 'Cast the line',
    hsRodBusy: 'Fishing…',
    hsSkills: 'Tackle box',
    hsLog: 'Catch log',
    hsAbout: 'About me',
    hsContact: 'Contact',
    casting: 'There it goes!',
    waiting: 'Waiting for a bite…',
    bite: "Fish on! Fish on!",
    reeling: 'Reeling in!',
    caught: 'You landed a {species}!',
    weight: 'Weight',
    release: 'Catch and release: the fish goes back when you close this.',
    castAgain: 'Cast again',
    seeLog: 'See catch log',
    ctaCast: 'Cast the line',
    caughtTag: 'Caught',
    inWater: 'Still in the water',
    progress: '{n} of {total} species in the log',
    logIntro: 'Every project living in this lake. The ones you already caught are marked.',
    skillsIntro: 'Each lure is a set of tools I use to make a project bite.',
    aboutTitle: 'About me',
    skillsTitle: 'Tackle box',
    logTitle: 'Catch log',
    contactTitle: "Let's go fishing?",
    contactEyebrow: 'Contact',
    contactText: "If you have a project, an offer or just want to talk code (or fishing), drop me a line.",
    projectsTitle: 'Projects',
    email: 'Email me',
    copyEmail: 'Copy email',
    copied: 'Email copied',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    downloadCv: 'Download CV',
    noWebgl: "Your browser couldn't load the 3D scene, so here's the express version.",
  },
};
