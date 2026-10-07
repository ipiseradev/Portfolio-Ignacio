import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PROFILE, ABOUT, PROJECTS, SKILLS, GUIDE, UI } from './content.js';

/* ════════════════════════════════════════════════════════════
   Utilidades
   ════════════════════════════════════════════════════════════ */
const $ = (s) => document.querySelector(s);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin storage */ } },
};
const FIRST = PROFILE.name.split(' ')[0];
let lang = store.get('lang') === 'en' ? 'en' : 'es';

const fill = (s, vars = {}) =>
  String(s).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : k === 'first' ? FIRST : k === 'name' ? PROFILE.name : ''));
const t = (key, vars) => fill(UI[lang][key] ?? key, vars);
const L = (v) => (v && typeof v === 'object' && !Array.isArray(v) && 'es' in v ? v[lang] : v);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isNarrow = () => innerWidth < 760;
const isTouch = matchMedia('(hover: none)').matches;

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(11);
const rr = (a, b) => a + (b - a) * rand();

let caught = new Set();
try { caught = new Set(JSON.parse(store.get('caught') || '[]')); } catch { caught = new Set(); }
const saveCaught = () => store.set('caught', JSON.stringify([...caught]));

/* ════════════════════════════════════════════════════════════
   Interfaz (HTML)
   ════════════════════════════════════════════════════════════ */
const panel = $('#panel');
const panelBody = $('#panelBody');
const expressEl = $('#express');
let currentSection = null; // { id, project }
let expressOpen = false;

function fishSVG(f) {
  const spots = f.spots
    ? [[30, 13], [38, 19], [46, 12], [52, 18], [24, 19]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${f.spots}"/>`).join('')
    : '';
  return `<svg viewBox="0 0 72 34" aria-hidden="true">
    <path d="M14 17 L2 5 L4 17 L2 29 Z" fill="${f.fin}" stroke="#1e2a33" stroke-width="2" stroke-linejoin="round"/>
    <path d="M30 6 L40 1 L44 8 Z" fill="${f.fin}" stroke="#1e2a33" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="38" cy="17" rx="27" ry="11" fill="${f.body}" stroke="#1e2a33" stroke-width="2.4"/>
    ${spots}
    <circle cx="55" cy="14" r="3" fill="#fff" stroke="#1e2a33" stroke-width="1.6"/>
    <circle cx="55.6" cy="14" r="1.3" fill="#1e2a33"/>
    <path d="M62 19 q3 1 3 -1" fill="none" stroke="#1e2a33" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}

function lureSVG(c) {
  return `<svg viewBox="0 0 64 32" aria-hidden="true">
    <path d="M6 16 C14 4, 40 4, 50 16 C40 28, 14 28, 6 16Z" fill="${c}" stroke="#1e2a33" stroke-width="2.5"/>
    <path d="M22 9 L26 23 M32 8 L35 24" stroke="rgba(255,255,255,.55)" stroke-width="2.5"/>
    <circle cx="14" cy="14" r="3" fill="#fff" stroke="#1e2a33" stroke-width="2"/>
    <path d="M50 16 L57 16 M57 16 q4 0 3 5 q-1 4 -5 2" fill="none" stroke="#1e2a33" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

function contactButtons() {
  let html = `<a class="btn yellow" href="mailto:${esc(PROFILE.email)}">✉ ${t('email')}</a>`;
  html += `<button type="button" class="btn" data-action="copy">${t('copyEmail')}</button>`;
  if (PROFILE.linkedin) html += `<a class="btn" href="${esc(PROFILE.linkedin)}" target="_blank" rel="noopener">${t('linkedin')} ↗</a>`;
  if (PROFILE.github) html += `<a class="btn" href="${esc(PROFILE.github)}" target="_blank" rel="noopener">${t('github')} ↗</a>`;
  if (PROFILE.cv) html += `<a class="btn" href="${esc(PROFILE.cv)}" download>⤓ ${t('downloadCv')}</a>`;
  return html;
}

function projectCard(p, { showStatus = true } = {}) {
  const isCaught = caught.has(p.id);
  const pill = showStatus
    ? `<span class="pill ${isCaught ? 'ok' : ''}">${isCaught ? '✓ ' + t('caughtTag') : t('inWater')}</span>`
    : '';
  const links = p.links?.length
    ? `<div class="links">${p.links.map((l) => `<a class="btn small" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(L(l.label))} ↗</a>`).join('')}</div>`
    : '';
  return `<article class="catch-card">
    <div class="fish-badge">${fishSVG(p.fish)}<div class="who"><strong>${esc(L(p.species))}</strong><em>${esc(p.latin)}</em></div>${pill}</div>
    <h3>${esc(L(p.name))}</h3>
    ${p.status ? `<p><span class="pill warn">${esc(L(p.status))}</span></p>` : ''}
    <p>${esc(L(p.desc))}</p>
    <ul class="tags">${p.tags.map((tag) => `<li>${esc(tag)}</li>`).join('')}</ul>
    ${links}
  </article>`;
}

const sections = {
  about: () => ({
    eyebrow: t('hsAbout'),
    title: PROFILE.name,
    body: `${L(ABOUT.paragraphs).map((p, i) => `<p class="${i === 0 ? 'lead' : ''}">${esc(p)}</p>`).join('')}
      <dl class="facts">${ABOUT.facts.map((f) => `<div><dt>${esc(L(f.label))}</dt><dd>${esc(L(f.value))}</dd></div>`).join('')}</dl>
      <div class="row"><button type="button" class="btn yellow" data-action="cast">🎣 ${t('ctaCast')}</button>
      <button type="button" class="btn" data-action="open:contact">${t('hsContact')}</button></div>`,
  }),
  skills: () => ({
    eyebrow: t('hsSkills'),
    title: t('skillsTitle'),
    body: `<p class="lead">${t('skillsIntro')}</p>
      <ul class="lures">${SKILLS.map((s) => `<li class="lure">${lureSVG(s.color)}<div><strong>${esc(L(s.name))}</strong><span>${esc(L(s.lure))}</span></div></li>`).join('')}</ul>`,
  }),
  log: () => {
    const n = PROJECTS.filter((p) => caught.has(p.id)).length;
    return {
      eyebrow: t('hsLog'),
      title: t('logTitle'),
      body: `<div class="progress"><strong>${t('progress', { n, total: PROJECTS.length })}</strong>
        <div class="progress-bar"><span style="width:${(n / PROJECTS.length) * 100}%"></span></div></div>
        <p class="lead">${t('logIntro')}</p>
        ${PROJECTS.map((p) => projectCard(p)).join('')}
        <div class="row"><button type="button" class="btn yellow" data-action="cast">🎣 ${t('ctaCast')}</button></div>`,
    };
  },
  contact: () => ({
    eyebrow: t('contactEyebrow'),
    title: t('contactTitle'),
    body: `<p class="lead">${t('contactText')}</p>
      <p><strong>${esc(PROFILE.email)}</strong></p>
      <div class="row">${contactButtons()}</div>`,
  }),
  catch: (p) => ({
    eyebrow: t('caught', { species: L(p.species) }),
    title: L(p.name),
    body: `<div class="catch-hero">${fishSVG(p.fish)}</div>
      <div class="fish-badge"><div class="who"><strong>${esc(L(p.species))}</strong><em>${esc(p.latin)}</em></div>
      <span class="pill">${t('weight')}: ${esc(L(p.weight))}</span></div>
      <h3 style="font-family:var(--font-display);font-size:19px;margin:14px 0 6px">${esc(L(p.summary))}</h3>
      ${p.status ? `<p><span class="pill warn">${esc(L(p.status))}</span></p>` : ''}
      <p>${esc(L(p.desc))}</p>
      <ul class="tags">${p.tags.map((tag) => `<li>${esc(tag)}</li>`).join('')}</ul>
      ${p.links?.length ? `<div class="links">${p.links.map((l) => `<a class="btn small" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(L(l.label))} ↗</a>`).join('')}</div>` : ''}
      <p class="note" style="margin-top:14px">🐟 ${t('release')}</p>
      <div class="row"><button type="button" class="btn yellow" data-action="recast">🎣 ${t('castAgain')}</button>
      <button type="button" class="btn" data-action="open:log">${t('seeLog')}</button></div>`,
  }),
};

function renderPanel() {
  if (!currentSection) return;
  const { eyebrow, title, body } = sections[currentSection.id](currentSection.project);
  $('#panelEyebrow').textContent = eyebrow;
  $('#panelTitle').textContent = title;
  panelBody.innerHTML = body;
}

function showPanel(id, project) {
  currentSection = { id, project };
  renderPanel();
  panelBody.scrollTop = 0;
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('panel-open');
  updateHotspotStates();
}

function closePanel() {
  if (!currentSection) return;
  const wasCatch = currentSection.id === 'catch';
  currentSection = null;
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('panel-open');
  updateHotspotStates();
  if (wasCatch) releaseFish(false);
}

panelBody.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'cast') startCast();
  else if (action === 'recast') recast(); else if (action === 'copy') {
    navigator.clipboard?.writeText(PROFILE.email).then(() => showToast(t('copied'), 1600)).catch(() => {});
  } else if (action.startsWith('open:')) {
    const id = action.slice(5);
    if (currentSection?.id === 'catch') releaseFish(false);
    openSection(id);
  }
});
$('#panelClose').addEventListener('click', closePanel);

/* ---------- guía ---------- */
const guideEl = $('#guide');
let guide = null; // { key, idx }

function say(key) {
  guide = { key, idx: 0 };
  renderGuide();
  guideEl.hidden = false;
}
function renderGuide() {
  if (!guide) return;
  const lines = GUIDE[lang][guide.key];
  const last = guide.idx >= lines.length - 1;
  $('#guideSpeaker').textContent = GUIDE[lang].speaker;
  $('#guideText').textContent = fill(lines[guide.idx]);
  $('#guideNext').textContent = last ? t('gotIt') : `${t('next')} →`;
  $('#guideSkip').textContent = t('skip');
  $('#guideSkip').hidden = last;
}
function hideGuide() { guide = null; guideEl.hidden = true; }
$('#guideNext').addEventListener('click', () => {
  const lines = GUIDE[lang][guide.key];
  if (guide.idx < lines.length - 1) { guide.idx++; renderGuide(); } else hideGuide();
});
$('#guideSkip').addEventListener('click', hideGuide);
$('#helpBtn').addEventListener('click', () => say('intro'));

/* ---------- toast ---------- */
const toastEl = $('#toast');
let toastTimer = 0;
function showToast(text, ms = 0, cls = '') {
  toastEl.textContent = text;
  toastEl.className = `toast show ${cls}`;
  clearTimeout(toastTimer);
  if (ms) toastTimer = setTimeout(hideToast, ms);
}
function hideToast() { toastEl.className = 'toast'; }

/* ---------- modo express ---------- */
function renderExpress() {
  const paras = L(ABOUT.paragraphs);
  expressEl.innerHTML = `<div class="ex-wrap">
    <div class="ex-hero">
      <span class="eyebrow">${t('tagline')}</span>
      <h2>${esc(PROFILE.name)}</h2>
      <p>${esc(paras[0])}</p>
      <div class="row">${contactButtons()}</div>
    </div>
    <h3 class="section">${t('projectsTitle')}</h3>
    <div class="ex-grid">${PROJECTS.map((p) => projectCard(p, { showStatus: false })).join('')}</div>
    <h3 class="section">${t('skillsTitle')}</h3>
    <div class="chips">${SKILLS.map((s) => `<span>${esc(L(s.name))}</span>`).join('')}</div>
    <h3 class="section">${t('aboutTitle')}</h3>
    ${paras.slice(1).map((p) => `<p class="body">${esc(p)}</p>`).join('')}
  </div>`;
}
expressEl.addEventListener('click', (e) => {
  if (e.target.closest('[data-action="copy"]')) {
    navigator.clipboard?.writeText(PROFILE.email).then(() => showToast(t('copied'), 1600)).catch(() => {});
  }
});
function setExpress(open) {
  expressOpen = open;
  if (open) { renderExpress(); closePanel(); hideGuide(); }
  expressEl.hidden = !open;
  document.body.classList.toggle('express-open', open);
  $('#expressBtn').textContent = open ? t('exitExpress') : t('express');
  if (open) expressEl.scrollTop = 0;
}
$('#expressBtn').addEventListener('click', () => setExpress(!expressOpen));

/* ---------- idioma y tema ---------- */
let theme = store.get('theme') === 'night' ? 1 : 0;

function applyLang() {
  document.documentElement.lang = lang;
  store.set('lang', lang);
  document.title = t('docTitle');
  $('#brandEyebrow').textContent = t('brandEyebrow');
  $('#brandTitle').textContent = t('brandTitle');
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  $('#expressBtn').textContent = expressOpen ? t('exitExpress') : t('express');
  $('#hint').textContent = isTouch ? t('hintTouch') : t('hint');
  $('#helpBtn').setAttribute('aria-label', t('help'));
  $('#panelClose').setAttribute('aria-label', t('close'));
  $('#loaderText').textContent = t('loading');
  updateThemeBtn();
  updateHotspotLabels();
  renderGuide();
  renderPanel();
  if (expressOpen) renderExpress();
  if (signTexture) drawSign();
}
document.querySelectorAll('.lang button').forEach((b) =>
  b.addEventListener('click', () => { lang = b.dataset.lang; applyLang(); }),
);

function updateThemeBtn() {
  const btn = $('#themeBtn');
  btn.textContent = theme ? '☀️' : '🌙';
  btn.setAttribute('aria-label', theme ? t('toDay') : t('toNight'));
  btn.title = btn.getAttribute('aria-label');
}
$('#themeBtn').addEventListener('click', () => {
  theme = theme ? 0 : 1;
  store.set('theme', theme ? 'night' : 'day');
  updateThemeBtn();
});

if (PROFILE.cv) { const cv = $('#cvBtn'); cv.href = PROFILE.cv; cv.hidden = false; }

$('#homeBtn').addEventListener('click', goHome);

addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (currentSection) closePanel();
  else if (expressOpen) setExpress(false);
  else hideGuide();
});

/* ════════════════════════════════════════════════════════════
   Escena 3D
   ════════════════════════════════════════════════════════════ */
const canvas = $('#scene');
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch {
  renderer = null;
}

let scene, camera, controls, HOME;
let waterGeo, waterMat, skyMat, starsMat, sunLight, hemi, celestial, windowMat, lanternMat, lanternLight, firefliesMat, fireflies;
let rod, rodTip, line, bobber, boat, signTexture, signCtx;
const smoke = [];
const clouds = [];
const ripples = [];
const drops = [];
const fishModels = {};
const interactives = {};
const pickables = [];
let jumper;
let time = 0;
let themeVal = theme;
let fly = null;
let hovered = null;

const DECK_Y = 1.0;
const ROD_REST = 0.85;
const ROD_BACK = 0.05;
const ROD_FWD = 1.25;
const BOBBER_REST = new THREE.Vector3(0.9, 0, 17.4);
const CABIN_POS = new THREE.Vector3(-12, 0, -16);
const TACKLE_POS = new THREE.Vector3(-0.85, DECK_Y, 5);
const COOLER_POS = new THREE.Vector3(0.95, DECK_Y, 2.2);
const BOAT_POS = new THREE.Vector3(3.7, 0, 8);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

const wave = (x, z, tm) =>
  Math.sin(x * 0.18 + tm * 0.9) * 0.1 + Math.cos(z * 0.21 + tm * 0.75) * 0.09 + Math.sin((x + z) * 0.4 + tm * 1.5) * 0.035;

function noise2(x, z) {
  return Math.sin(x * 0.15) * Math.cos(z * 0.13) * 0.6 + Math.sin(x * 0.05 + 1.3) * Math.sin(z * 0.07) * 1.2 + Math.sin(x * 0.37 + z * 0.29) * 0.25;
}
function terrainH(x, z) {
  const n = noise2(x, z);
  const shoreZ = -6 + Math.sin(x * 0.08) * 3 + Math.sin(x * 0.21) * 1.2;
  const d = shoreZ - z; // > 0 en tierra
  let h = d > 0 ? Math.min(d * 0.35, 2.2) + Math.max(0, d - 14) * 0.15 + n * Math.min(1, d / 8) : Math.max(d * 0.25, -3.5);
  const r = Math.hypot(x, z - 15);
  if (r > 92) {
    const ang = Math.atan2(x, z - 15);
    const rim = (r - 92) * 0.75 * (0.7 + 0.3 * Math.sin(ang * 9)) + n * 2 - 1;
    h = Math.max(h, rim);
  }
  return h;
}

const PALETTE = {
  skyTop: ['#4f9fd8', '#0a1430'],
  skyBottom: ['#ffd29a', '#2b3d70'],
  fog: ['#f2d3ad', '#1a2648'],
  sun: ['#fff0d0', '#a9bcff'],
  hemiSky: ['#d6ecff', '#41558f'],
  hemiGround: ['#6e5a3a', '#11141f'],
  water: ['#2c93a8', '#173d5e'],
  celestial: ['#ffcf73', '#eef2ff'],
};
const PAL = Object.fromEntries(Object.entries(PALETTE).map(([k, [a, b]]) => [k, [new THREE.Color(a), new THREE.Color(b)]]));
const SUN_POS = [V(-300, 55, -230), V(-160, 190, -250)];

const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0, ...opts });
function mesh(geo, material, x = 0, y = 0, z = 0, cast = true) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = true;
  return m;
}

function homeView() {
  if (isNarrow()) return { pos: V(17, 15, 43), target: V(-0.5, 1.5, 6) };
  // en pantallas menos anchas alejamos la cámara para que entre la caña
  const target = V(-1.5, 2.3, 4);
  const k = clamp(1.75 / (innerWidth / innerHeight), 1, 1.6);
  const pos = V(17, 4.4, 17).multiplyScalar(k).add(target);
  return { pos, target };
}

/* ---------- cielo y luces ---------- */
function buildSky() {
  skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } },
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 top;
      uniform vec3 bottom;
      varying vec3 vDir;
      void main() {
        float h = clamp(vDir.y * 1.7 + 0.06, 0.0, 1.0);
        gl_FragColor = vec4(mix(bottom, top, pow(h, 0.75)), 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(460, 32, 16), skyMat);
  sky.renderOrder = -1;
  scene.add(sky);

  const starPos = [];
  for (let i = 0; i < 700; i++) {
    const v = new THREE.Vector3(rr(-1, 1), rr(0.08, 1), rr(-1, 1)).normalize().multiplyScalar(420);
    starPos.push(v.x, v.y, v.z);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  starsMat = new THREE.PointsMaterial({ color: '#ffffff', size: 1.8, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  scene.add(new THREE.Points(sg, starsMat));

  celestial = new THREE.Mesh(new THREE.SphereGeometry(14, 20, 14), new THREE.MeshBasicMaterial({ color: '#ffcf73', fog: false }));
  scene.add(celestial);

  for (let i = 0; i < 9; i++) {
    const c = new THREE.Group();
    const m = mat('#ffffff', { roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.15 });
    const n = 4 + Math.floor(rr(0, 3));
    for (let j = 0; j < n; j++) {
      const s = rr(2.5, 4.5);
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), m);
      puff.position.set(j * 3.2 - n * 1.6, rr(-0.6, 0.8), rr(-1.5, 1.5));
      puff.scale.y = 0.65;
      c.add(puff);
    }
    c.position.set(rr(-150, 150), rr(38, 62), rr(-140, 120));
    c.userData.speed = rr(0.6, 1.4);
    clouds.push(c);
    scene.add(c);
  }
}

function buildLights() {
  hemi = new THREE.HemisphereLight('#ffffff', '#444444', 1);
  scene.add(hemi);
  sunLight = new THREE.DirectionalLight('#ffffff', 2.5);
  sunLight.position.set(-30, 42, 22);
  sunLight.target.position.set(0, 0, 4);
  sunLight.castShadow = true;
  const sc = sunLight.shadow.camera;
  sc.left = -38; sc.right = 38; sc.top = 38; sc.bottom = -38; sc.near = 1; sc.far = 140;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.bias = -0.0004;
  sunLight.shadow.normalBias = 0.03;
  scene.add(sunLight, sunLight.target);
}

/* ---------- terreno, agua, bosque, montañas ---------- */
function buildTerrain() {
  const geo = new THREE.PlaneGeometry(270, 270, 135, 135);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = [];
  const c = new THREE.Color();
  const sandWet = new THREE.Color('#b39867'), sand = new THREE.Color('#e3cb94'), grassA = new THREE.Color('#78a347'),
    grassB = new THREE.Color('#5b8a3a'), rock = new THREE.Color('#8b8478'), snow = new THREE.Color('#eef2f5');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = terrainH(x, z);
    pos.setY(i, h);
    if (h < -0.15) c.copy(sandWet);
    else if (h < 0.55) c.copy(sand);
    else if (h < 11) c.copy(grassA).lerp(grassB, clamp(0.5 + noise2(x * 2.3, z * 2.3) * 0.6, 0, 1));
    else if (h < 21) c.copy(rock);
    else c.copy(snow);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  terrain.receiveShadow = true;
  scene.add(terrain);
}

function buildWater() {
  waterGeo = new THREE.PlaneGeometry(300, 300, 120, 120);
  waterGeo.rotateX(-Math.PI / 2);
  waterMat = new THREE.MeshStandardMaterial({ color: '#2c93a8', flatShading: true, roughness: 0.28, metalness: 0.08, transparent: true, opacity: 0.86 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.receiveShadow = true;
  water.position.z = 20;
  water.userData.offsetZ = 20;
  scene.add(water);
}
function updateWater() {
  const p = waterGeo.attributes.position;
  const arr = p.array;
  for (let i = 0; i < p.count; i++) {
    arr[i * 3 + 1] = wave(arr[i * 3], arr[i * 3 + 2] + 20, time);
  }
  p.needsUpdate = true;
}

function buildForest() {
  const spots = [];
  let tries = 0;
  while (spots.length < 110 && tries < 3000) {
    tries++;
    const x = rr(-75, 75), z = rr(-70, -8);
    const h = terrainH(x, z);
    if (h < 0.7) continue;
    if (Math.hypot(x - CABIN_POS.x, z - CABIN_POS.z) < 8) continue;
    if (Math.abs(x) < 5 && z > -16) continue;
    if (Math.hypot(x - 3, z + 9) < 3) continue; // cartel
    if (spots.some((s) => Math.hypot(s.x - x, s.z - z) < 2.6)) continue;
    spots.push({ x, z, h, s: rr(0.8, 1.5) });
  }
  // árboles en la orilla de enfrente
  for (let i = 0; i < 90; i++) {
    const ang = rr(-Math.PI, Math.PI), r = rr(94, 110);
    const x = Math.sin(ang) * r, z = 15 + Math.cos(ang) * r;
    const h = terrainH(x, z);
    if (h < 0.7 || h > 14) continue;
    spots.push({ x, z, h, s: rr(1.4, 2.4) });
  }

  const trunkGeo = new THREE.CylinderGeometry(0.13, 0.2, 1, 5).translate(0, 0.5, 0);
  const coneGeo = new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0);
  const trunks = new THREE.InstancedMesh(trunkGeo, mat('#6b4a2f'), spots.length);
  const levels = [
    { y: 0.8, w: 1.45, h: 2.3 },
    { y: 2.0, w: 1.05, h: 1.9 },
    { y: 3.0, w: 0.65, h: 1.45 },
  ].map((lv) => ({ ...lv, im: new THREE.InstancedMesh(coneGeo, mat('#ffffff'), spots.length) }));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), col = new THREE.Color();
  const greens = ['#3f7a3d', '#4d8a42', '#2f6b3a', '#5b9446', '#356f45'];
  spots.forEach((sp, i) => {
    q.setFromAxisAngle(V(0, 1, 0), rr(0, Math.PI));
    m4.compose(p.set(sp.x, sp.h - 0.1, sp.z), q, s.set(sp.s, sp.s * 1.1, sp.s));
    trunks.setMatrixAt(i, m4);
    col.set(greens[i % greens.length]);
    levels.forEach((lv) => {
      m4.compose(p.set(sp.x, sp.h + lv.y * sp.s, sp.z), q, s.set(lv.w * sp.s, lv.h * sp.s, lv.w * sp.s));
      lv.im.setMatrixAt(i, m4);
      lv.im.setColorAt(i, col);
    });
  });
  for (const im of [trunks, ...levels.map((l) => l.im)]) {
    im.castShadow = true;
    im.receiveShadow = true;
    scene.add(im);
  }

  // piedras y juncos en la orilla
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  const rocks = new THREE.InstancedMesh(rockGeo, mat('#8f8a80'), 34);
  const reedGeo = new THREE.CylinderGeometry(0.03, 0.05, 1, 4).translate(0, 0.5, 0);
  const reeds = new THREE.InstancedMesh(reedGeo, mat('#6f8f3a'), 160);
  let ri = 0, rdi = 0;
  for (let i = 0; i < 600 && (ri < 34 || rdi < 160); i++) {
    const x = rr(-45, 45);
    if (Math.abs(x) < 4.5) continue;
    const shoreZ = -6 + Math.sin(x * 0.08) * 3 + Math.sin(x * 0.21) * 1.2;
    const z = shoreZ + rr(-1.2, 2.2);
    const h = terrainH(x, z);
    if (rand() < 0.25 && ri < 34) {
      const sc = rr(0.3, 0.9);
      m4.compose(p.set(x, h, z), q.setFromEuler(new THREE.Euler(rr(0, 3), rr(0, 3), rr(0, 3))), s.set(sc * 1.3, sc * 0.8, sc));
      rocks.setMatrixAt(ri++, m4);
    } else if (rdi < 160) {
      const n = 3;
      for (let k = 0; k < n && rdi < 160; k++) {
        q.setFromEuler(new THREE.Euler(rr(-0.2, 0.2), 0, rr(-0.2, 0.2)));
        m4.compose(p.set(x + rr(-0.3, 0.3), h - 0.2, z + rr(-0.3, 0.3)), q, s.set(1, rr(1.2, 2.2), 1));
        reeds.setMatrixAt(rdi++, m4);
      }
    }
  }
  rocks.count = ri;
  reeds.count = rdi;
  rocks.castShadow = rocks.receiveShadow = true;
  scene.add(rocks, reeds);
}

function buildMountains() {
  const mMat = mat('#6f8299');
  const snowMat = mat('#f1f4f7');
  for (let i = 0; i < 30; i++) {
    const ang = (i / 30) * Math.PI * 2 + rr(-0.08, 0.08);
    const r = rr(175, 235);
    const h = rr(35, 85), w = rr(35, 60);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.ConeGeometry(w, h, 6), mMat));
    if (h > 55) {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(w * 0.3, h * 0.3, 6), snowMat);
      cap.position.y = h * 0.35 + 0.2;
      g.add(cap);
    }
    g.position.set(Math.sin(ang) * r, h / 2 - 6, 15 + Math.cos(ang) * r);
    g.rotation.y = rr(0, Math.PI);
    scene.add(g);
  }
}

/* ---------- muelle y objetos ---------- */
function buildDock() {
  const dock = new THREE.Group();
  for (let z = -7.5, i = 0; z <= 14.6; z += 0.56, i++) {
    const plank = mesh(new THREE.BoxGeometry(3.2, 0.14, 0.5), mat(i % 3 ? '#b08355' : '#a07448'), 0, DECK_Y - 0.07, z);
    plank.rotation.y = rr(-0.015, 0.015);
    dock.add(plank);
  }
  for (const x of [-1.2, 1.2]) dock.add(mesh(new THREE.BoxGeometry(0.25, 0.25, 22.4), mat('#7a5634'), x, DECK_Y - 0.26, 3.5));
  for (let z = -6; z <= 15; z += 3) {
    for (const x of [-1.5, 1.5]) {
      const tall = z >= 14;
      const hTop = DECK_Y + (tall ? 0.7 : 0.05);
      const post = mesh(new THREE.CylinderGeometry(0.16, 0.18, hTop + 3, 7), mat('#6e4c2e'), x, (hTop - 3) / 2, Math.min(z, 14.5));
      dock.add(post);
    }
  }
  scene.add(dock);

  // farol
  const lp = mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.9, 6), mat('#2b2f33'), -1.45, DECK_Y + 0.95, 14.3);
  lanternMat = mat('#ffd28a', { emissive: '#ffb347', emissiveIntensity: 0.2 });
  const lantern = mesh(new THREE.BoxGeometry(0.32, 0.4, 0.32), lanternMat, -1.45, DECK_Y + 2.05, 14.3);
  const lcap = mesh(new THREE.ConeGeometry(0.28, 0.2, 4), mat('#2b2f33'), -1.45, DECK_Y + 2.35, 14.3);
  lcap.rotation.y = Math.PI / 4;
  lanternLight = new THREE.PointLight('#ffbf66', 0, 16, 1.6);
  lanternLight.position.set(-1.45, DECK_Y + 2.05, 14.3);
  scene.add(lp, lantern, lcap, lanternLight);

  // caja de pesca
  const tackle = new THREE.Group();
  tackle.add(mesh(new THREE.BoxGeometry(1.1, 0.5, 0.62), mat('#2f7d4f'), 0, 0.25, 0));
  tackle.add(mesh(new THREE.BoxGeometry(1.15, 0.13, 0.66), mat('#25643f'), 0, 0.56, 0));
  const handle = mesh(new THREE.TorusGeometry(0.2, 0.04, 6, 12, Math.PI), mat('#1e2a33'), 0, 0.62, 0);
  tackle.add(handle);
  tackle.add(mesh(new THREE.BoxGeometry(0.14, 0.12, 0.05), mat('#ffc93c'), 0, 0.42, 0.33));
  for (const [x, z, c] of [[0.85, 0.2, '#e04f5f'], [0.75, -0.25, '#3f7cc4'], [-0.85, 0.1, '#f2b632']]) {
    const lure = mesh(new THREE.CapsuleGeometry(0.06, 0.16, 3, 6), mat(c), x, 0.07, z);
    lure.rotation.z = Math.PI / 2;
    lure.rotation.y = rr(0, 3);
    tackle.add(lure);
  }
  tackle.position.copy(TACKLE_POS);
  tackle.rotation.y = 0.25;
  scene.add(tackle);

  // conservadora
  const cooler = new THREE.Group();
  cooler.add(mesh(new THREE.BoxGeometry(0.95, 0.6, 0.62), mat('#f3f1ea'), 0, 0.3, 0));
  cooler.add(mesh(new THREE.BoxGeometry(1.0, 0.14, 0.67), mat('#2d6fb5'), 0, 0.67, 0));
  cooler.add(mesh(new THREE.BoxGeometry(0.6, 0.05, 0.08), mat('#1e2a33'), 0, 0.77, 0));
  // libreta (bitácora) arriba
  const book = mesh(new THREE.BoxGeometry(0.42, 0.06, 0.32), mat('#c0392b'), 0.1, 0.77, 0.05);
  book.rotation.y = 0.3;
  cooler.add(book);
  cooler.position.copy(COOLER_POS);
  cooler.rotation.y = -0.2;
  scene.add(cooler);

  // balde y banquito
  const bucket = mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.45, 10), mat('#d9d4c7'), -0.9, DECK_Y + 0.22, 12.6);
  const stool = new THREE.Group();
  stool.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 10), mat('#3f6f8f'), 0, 0.5, 0));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 4), mat('#2b2f33'), Math.cos(a) * 0.22, 0.25, Math.sin(a) * 0.22);
    stool.add(leg);
  }
  stool.position.set(-0.3, DECK_Y, 11.8);
  scene.add(bucket, stool);

  register('skills', tackle, () => TACKLE_POS.clone().add(V(-0.6, 1.2, 0)), () => ({ pos: TACKLE_POS.clone().add(V(5.2, 3.6, 4.2)), target: TACKLE_POS.clone().add(V(0, 0.4, 0)) }), '🧰');
  register('log', cooler, () => COOLER_POS.clone().add(V(0.4, 1.3, -1.2)), () => ({ pos: COOLER_POS.clone().add(V(5, 3.4, 4.6)), target: COOLER_POS.clone().add(V(0, 0.5, 0)) }), '📒');
}

function buildCabin() {
  const g = new THREE.Group();
  const W = 5, D = 4, H = 2.6, base = 0.3;
  const wall = mat('#8b5a3c');
  const logM = mat('#6f4529');
  g.add(mesh(new THREE.BoxGeometry(W + 0.4, 1.6, D + 0.4), mat('#8c8c86'), 0, -0.5, 0));
  g.add(mesh(new THREE.BoxGeometry(W, H, D), wall, 0, base + H / 2, 0));
  for (let y = base + 0.25; y < base + H; y += 0.42) {
    g.add(mesh(new THREE.BoxGeometry(W + 0.12, 0.09, 0.12), logM, 0, y, D / 2 + 0.03, false));
    g.add(mesh(new THREE.BoxGeometry(0.12, 0.09, D + 0.12), logM, W / 2 + 0.03, y, 0, false));
  }
  const top = base + H;
  const pitch = 0.6, half = D / 2 + 0.35;
  const slabLen = half / Math.cos(pitch);
  const ridge = half * Math.tan(pitch);
  const roofM = mat('#7a3b2e');
  for (const sgn of [1, -1]) {
    const slab = mesh(new THREE.BoxGeometry(W + 0.7, 0.16, slabLen + 0.1), roofM, 0, top + ridge / 2 - 0.05, (sgn * half) / 2);
    slab.rotation.x = sgn * pitch;
    g.add(slab);
  }
  const tri = new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(0, (D / 2) * Math.tan(pitch))]);
  for (const sgn of [1, -1]) {
    const gable = new THREE.Mesh(new THREE.ShapeGeometry(tri), new THREE.MeshStandardMaterial({ color: '#8b5a3c', flatShading: true, side: THREE.DoubleSide }));
    gable.rotation.y = Math.PI / 2;
    gable.position.set((sgn * W) / 2, top, 0);
    g.add(gable);
  }
  windowMat = mat('#2e3d4a', { emissive: '#ffb347', emissiveIntensity: 0 });
  const frameM = mat('#f1e3c6');
  g.add(mesh(new THREE.BoxGeometry(0.95, 1.7, 0.1), mat('#5a3a22'), -1.1, base + 0.85, D / 2 + 0.06));
  for (const x of [0.9, 1.9]) {
    g.add(mesh(new THREE.BoxGeometry(0.75, 0.72, 0.12), frameM, x - 0.45, base + 1.55, D / 2 + 0.05, false));
    g.add(mesh(new THREE.BoxGeometry(0.6, 0.58, 0.14), windowMat, x - 0.45, base + 1.55, D / 2 + 0.06, false));
  }
  g.add(mesh(new THREE.BoxGeometry(0.12, 0.85, 0.95), frameM, W / 2 + 0.05, base + 1.5, 0, false));
  g.add(mesh(new THREE.BoxGeometry(0.14, 0.7, 0.8), windowMat, W / 2 + 0.06, base + 1.5, 0, false));
  g.add(mesh(new THREE.BoxGeometry(W + 0.6, 0.15, 1.5), mat('#a07448'), 0, base - 0.05, D / 2 + 0.75));
  const chimney = mesh(new THREE.BoxGeometry(0.55, 2.1, 0.55), mat('#7d7a74'), -1.5, top + 0.9, -0.7);
  g.add(chimney);
  // caña de repuesto apoyada en la pared
  const spare = mesh(new THREE.CylinderGeometry(0.02, 0.04, 3.2, 5), mat('#1d2b3a'), 2.1, base + 1.5, D / 2 + 0.45);
  spare.rotation.x = -0.25;
  g.add(spare);

  const y = terrainH(CABIN_POS.x, CABIN_POS.z);
  CABIN_POS.y = y;
  g.position.copy(CABIN_POS);
  g.rotation.y = 0.45;
  scene.add(g);

  const chimneyTop = new THREE.Vector3(-1.5, top + 2, -0.7).applyEuler(g.rotation).add(CABIN_POS);
  for (let i = 0; i < 7; i++) {
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), new THREE.MeshStandardMaterial({ color: '#e9e6e1', flatShading: true, transparent: true, opacity: 0 }));
    puff.userData = { phase: i / 7, origin: chimneyTop };
    smoke.push(puff);
    scene.add(puff);
  }

  register('about', g, () => CABIN_POS.clone().add(V(0, 6.3, 0)), () => ({ pos: CABIN_POS.clone().add(V(12.5, 6.5, 14.5)), target: CABIN_POS.clone().add(V(0, 1.6, 0)) }), '🏠');
}

function buildBoat() {
  boat = new THREE.Group();
  const geo = new THREE.BoxGeometry(1.7, 0.8, 4.2, 4, 2, 8);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i);
    const z = p.getZ(i);
    if (y < 0) x *= 0.55;
    const bow = Math.max(0, (z - 0.9) / 1.2);
    x *= 1 - bow * 0.88;
    if (y >= 0) y += bow * 0.28;
    p.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  boat.add(mesh(geo, mat('#c8462f')));
  const stripe = mesh(new THREE.BoxGeometry(1.72, 0.1, 3.0), mat('#f3f1ea'), 0, 0.22, -0.6, false);
  boat.add(stripe);
  boat.add(mesh(new THREE.BoxGeometry(1.5, 0.06, 3.0), mat('#b08355'), 0, 0.42, -0.6));
  for (const z of [-1.4, 0.4]) boat.add(mesh(new THREE.BoxGeometry(1.55, 0.09, 0.38), mat('#8b5a3c'), 0, 0.62, z));
  for (const sgn of [1, -1]) {
    const oar = mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.8, 5), mat('#c49a6c'), sgn * 0.35, 0.72, -0.5);
    oar.rotation.x = Math.PI / 2;
    oar.rotation.z = sgn * 0.08;
    boat.add(oar);
  }
  boat.position.copy(BOAT_POS);
  boat.rotation.y = 0.08;
  scene.add(boat);

  // cabo hasta el muelle
  const ropeM = new THREE.LineBasicMaterial({ color: '#e9dcc0' });
  const rope = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(1.5, DECK_Y + 0.05, 9), V(2.5, 0.6, 9.4), V(3.5, 0.45, 9.9)]), ropeM);
  scene.add(rope);

  register('contact', boat, () => boat.position.clone().add(V(0, 2.1, 0)), () => ({ pos: BOAT_POS.clone().add(V(7.5, 4.4, 5)), target: BOAT_POS.clone().add(V(0, 0.5, 0)) }), '🛶');
}

function buildSign() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  signCtx = c.getContext('2d');
  signTexture = new THREE.CanvasTexture(c);
  signTexture.colorSpace = THREE.SRGBColorSpace;
  signTexture.anisotropy = 4;
  drawSign();
  const wood = mat('#8b5a3c');
  const face = new THREE.MeshStandardMaterial({ map: signTexture, roughness: 0.9 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 0.12), [wood, wood, wood, wood, face, wood]);
  board.castShadow = true;
  const g = new THREE.Group();
  board.position.y = 1.75;
  g.add(board);
  for (const x of [-1.1, 1.1]) g.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.6, 6), mat('#6e4c2e'), x, 1.1, -0.08));
  const x = 3.2, z = -8.6;
  g.position.set(x, terrainH(x, z) - 0.2, z);
  g.rotation.y = 0.65;
  scene.add(g);
}
function drawSign() {
  const ctx = signCtx;
  ctx.fillStyle = '#c99a62';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = 'rgba(110,70,35,.35)';
  ctx.lineWidth = 3;
  for (let y = 30; y < 256; y += 46) { ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(170, y + 8, 340, y - 8, 512, y + 4); ctx.stroke(); }
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 498, 242);
  ctx.fillStyle = '#2b1c10';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontFam = '"Fredoka", "Nunito", sans-serif';
  const l1 = lang === 'es' ? 'EL MUELLE DE' : 'WELCOME TO';
  const l2 = lang === 'es' ? FIRST.toUpperCase() : `${FIRST.toUpperCase()}'S DOCK`;
  ctx.font = `600 38px ${fontFam}`;
  ctx.fillText(l1, 256, 82);
  let size = 78;
  ctx.font = `700 ${size}px ${fontFam}`;
  while (ctx.measureText(l2).width > 440 && size > 30) { size -= 4; ctx.font = `700 ${size}px ${fontFam}`; }
  ctx.fillText(l2, 256, 162);
  ctx.font = `600 24px ${fontFam}`;
  ctx.fillText('</>  ·  🎣', 256, 218);
  if (signTexture) signTexture.needsUpdate = true;
}

/* ---------- caña, línea, boya, peces ---------- */
function makeFish(spec, scale = 1) {
  const g = new THREE.Group();
  const bodyM = mat(spec.body, { roughness: 0.45, metalness: 0.2 });
  const finM = mat(spec.fin);
  const body = mesh(new THREE.SphereGeometry(0.5, 10, 8), bodyM);
  body.scale.set(1.5, 0.62, 0.36);
  g.add(body);
  const tail = mesh(new THREE.ConeGeometry(0.34, 0.55, 4), finM, -0.86, 0, 0);
  tail.rotation.z = -Math.PI / 2;
  tail.scale.z = 0.3;
  g.add(tail);
  const dorsal = mesh(new THREE.ConeGeometry(0.17, 0.38, 3), finM, 0.02, 0.33, 0);
  dorsal.rotation.z = 0.45;
  dorsal.scale.z = 0.3;
  g.add(dorsal);
  const eyeM = mat('#111111');
  for (const sgn of [1, -1]) g.add(mesh(new THREE.SphereGeometry(0.055, 6, 5), eyeM, 0.52, 0.07, sgn * 0.135, false));
  if (spec.spots) {
    const sm = mat(spec.spots);
    for (const [x, y] of [[-0.3, 0.12], [0, 0.18], [0.25, 0.05], [-0.15, -0.08], [0.15, -0.12]]) {
      for (const sgn of [1, -1]) {
        const zz = 0.18 * Math.sqrt(Math.max(0, 1 - (x / 0.75) ** 2 - (y / 0.31) ** 2)) + 0.005;
        g.add(mesh(new THREE.SphereGeometry(0.045, 5, 4), sm, x, y, sgn * zz, false));
      }
    }
  }
  g.userData.tail = tail;
  g.scale.setScalar(scale);
  g.visible = false;
  return g;
}

function buildFishing() {
  // portacaña
  scene.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 8), mat('#2b2f33'), 0.9, DECK_Y + 0.3, 13.4));

  rod = new THREE.Group();
  rod.position.set(0.9, DECK_Y + 0.35, 13.4);
  rod.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.9, 8), mat('#c49a6c'), 0, 0.3, 0));
  rod.add(mesh(new THREE.CylinderGeometry(0.022, 0.05, 3.7, 6), mat('#1d2b3a'), 0, 2.55, 0));
  const reel = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 12), mat('#b8c2cc', { metalness: 0.5, roughness: 0.4 }), 0.14, 0.75, 0);
  reel.rotation.z = Math.PI / 2;
  rod.add(reel);
  rod.add(mesh(new THREE.BoxGeometry(0.03, 0.2, 0.03), mat('#e04f5f'), 0.25, 0.75, 0.05, false));
  rodTip = new THREE.Object3D();
  rodTip.position.set(0, 4.4, 0);
  rod.add(rodTip);
  rod.rotation.x = ROD_REST;
  scene.add(rod);

  const N = 44;
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: '#f4f1e8', transparent: true, opacity: 0.9 }));
  line.frustumCulled = false;
  scene.add(line);

  bobber = new THREE.Group();
  bobber.add(mesh(new THREE.SphereGeometry(0.2, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat('#e64a3b', { emissive: '#e64a3b', emissiveIntensity: 0.15 })));
  bobber.add(mesh(new THREE.SphereGeometry(0.2, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat('#ffffff')));
  bobber.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 4), mat('#ffffff'), 0, 0.3, 0));
  bobber.position.copy(BOBBER_REST);
  scene.add(bobber);

  for (const p of PROJECTS) {
    fishModels[p.id] = makeFish(p.fish, 1.1);
    scene.add(fishModels[p.id]);
  }

  register('rod', rod, () => V(0.9, 4.75, 16.6), () => ({ pos: V(9.5, 5.4, 6.8), target: V(0.6, 1.9, 19) }), '🎣');
}

function setLine(a, b, sag) {
  const arr = line.geometry.attributes.position.array;
  const N = arr.length / 3;
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    arr[i * 3] = lerp(a.x, b.x, u);
    arr[i * 3 + 1] = lerp(a.y, b.y, u) - sag * Math.sin(Math.PI * u);
    arr[i * 3 + 2] = lerp(a.z, b.z, u);
  }
  line.geometry.attributes.position.needsUpdate = true;
}

/* ---------- ambiente: ondas, gotas, pez saltarín, luciérnagas ---------- */
const rippleGeo = new THREE.RingGeometry(0.32, 0.44, 28).rotateX(-Math.PI / 2);
function ripple(x, z, big = 1) {
  let r = ripples.find((rp) => !rp.active);
  if (!r) {
    const m = new THREE.Mesh(rippleGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false }));
    r = { mesh: m };
    ripples.push(r);
    scene.add(m);
  }
  Object.assign(r, { active: true, life: 0, big, x, z });
  r.mesh.visible = true;
}
function splash(x, z, n = 10) {
  ripple(x, z, 1.2);
  for (let i = 0; i < n; i++) {
    let d = drops.find((dp) => !dp.active);
    if (!d) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), new THREE.MeshBasicMaterial({ color: '#e6f6ff' }));
      d = { mesh: m, vel: new THREE.Vector3() };
      drops.push(d);
      scene.add(m);
    }
    d.active = true;
    d.mesh.visible = true;
    d.mesh.position.set(x, wave(x, z, time), z);
    const a = rr(0, Math.PI * 2), sp = rr(0.8, 2.2);
    d.vel.set(Math.cos(a) * sp, rr(2.5, 4.5), Math.sin(a) * sp);
  }
}

function buildAmbient() {
  jumper = { fish: makeFish({ body: '#e9a91b', fin: '#e0561f' }, 0.75), next: 4, t: -1 };
  scene.add(jumper.fish);

  const fp = [];
  for (let i = 0; i < 60; i++) {
    const x = rr(-28, 28), z = rr(-16, -3);
    fp.push(x, terrainH(x, z) + rr(0.6, 2.6), z);
  }
  const fg = new THREE.BufferGeometry();
  fg.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
  const dot = document.createElement('canvas');
  dot.width = dot.height = 64;
  const dctx = dot.getContext('2d');
  const grad = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  dctx.fillStyle = grad;
  dctx.fillRect(0, 0, 64, 64);
  const dotTex = new THREE.CanvasTexture(dot);
  fireflies = new THREE.Points(fg, (firefliesMat = new THREE.PointsMaterial({ map: dotTex, color: '#ffe680', size: 0.45, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })));
  fireflies.userData.base = fp.slice();
  scene.add(fireflies);
}

/* ---------- interactivos ---------- */
const hotspotsEl = $('#hotspots');
function register(id, group, anchor, focus, icon) {
  group.traverse((o) => {
    if (o.isMesh) { o.userData.interactive = id; pickables.push(o); }
  });
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `hs ${id === 'rod' ? 'rod' : ''}`;
  el.innerHTML = `<span class="hs-icon">${icon}</span><span class="hs-label"></span>`;
  el.addEventListener('click', () => activate(id));
  el.addEventListener('mouseenter', () => setHover(id));
  el.addEventListener('mouseleave', () => setHover(null));
  hotspotsEl.appendChild(el);
  interactives[id] = { id, group, anchor, focus, el };
}

const LABELS = { rod: 'hsRod', skills: 'hsSkills', log: 'hsLog', about: 'hsAbout', contact: 'hsContact' };
function updateHotspotLabels() {
  for (const it of Object.values(interactives)) {
    let key = LABELS[it.id];
    if (it.id === 'rod' && cast.state === 'caught') key = 'castAgain';
    else if (it.id === 'rod' && cast.state !== 'idle') key = 'hsRodBusy';
    it.el.querySelector('.hs-label').textContent = t(key);
    it.el.setAttribute('aria-label', t(key));
  }
}
function updateHotspotStates() {
  for (const it of Object.values(interactives)) {
    it.el.classList.toggle('active', currentSection?.id === it.id);
    if (it.id === 'rod') it.el.classList.toggle('busy', cast.state !== 'idle' && cast.state !== 'caught');
  }
}

function setHover(id) {
  if (hovered === id) return;
  if (hovered) highlight(interactives[hovered].group, false);
  hovered = id;
  if (id) highlight(interactives[id].group, true);
  canvas.style.cursor = id ? 'pointer' : '';
}
function highlight(group, on) {
  group.traverse((o) => {
    if (!o.isMesh || !o.material.emissive || o.material === windowMat || o.material === lanternMat) return;
    const m = o.material;
    if (on) {
      m.userData.e ??= { c: m.emissive.clone(), i: m.emissiveIntensity };
      m.emissive.set('#ff9a3c');
      m.emissiveIntensity = 0.32;
    } else if (m.userData.e) {
      m.emissive.copy(m.userData.e.c);
      m.emissiveIntensity = m.userData.e.i;
    }
  });
}

function activate(id) {
  if (id === 'rod') recast();
  else openSection(id);
}
function openSection(id) {
  if (expressOpen) setExpress(false);
  if (!isNarrow()) hideGuide();
  showPanel(id);
  if (renderer && interactives[id]) {
    const f = interactives[id].focus();
    flyTo(f.pos, f.target, true);
  }
}

/* ---------- cámara ---------- */
function shifted(pos, target) {
  const p = pos.clone(), tg = target.clone();
  const dir = tg.clone().sub(p).normalize();
  const dist = p.distanceTo(tg);
  if (isNarrow()) {
    const up = V(0, 1, 0);
    const right = dir.clone().cross(up).normalize();
    const camUp = right.clone().cross(dir).normalize();
    const off = camUp.multiplyScalar(-dist * 0.24);
    p.add(off); tg.add(off);
    p.add(dir.clone().multiplyScalar(-dist * 0.55));
  } else {
    const right = dir.clone().cross(V(0, 1, 0)).normalize().multiplyScalar(dist * 0.26);
    p.add(right); tg.add(right);
  }
  return { pos: p, target: tg };
}
function flyTo(pos, target, withPanel = false, dur = 1.4) {
  const dest = withPanel ? shifted(pos, target) : { pos, target };
  fly = { fromP: camera.position.clone(), fromT: controls.target.clone(), toP: dest.pos, toT: dest.target, t: 0, dur: reducedMotion ? 0.001 : dur };
  controls.enabled = false;
}
function goHome() {
  closePanel();
  if (expressOpen) setExpress(false);
  if (renderer) { HOME = homeView(); flyTo(HOME.pos, HOME.target); }
}

/* ---------- pesca ---------- */
const cast = { state: 'idle', t: 0, from: V(0, 0, 0), to: V(0, 0, 0), wait: 0, project: null, fish: null, recast: false, bites: 0, relFrom: V(0, 0, 0), relTo: V(0, 0, 0) };
const tipW = new THREE.Vector3();

function setCastState(s) {
  cast.state = s;
  cast.t = 0;
  updateHotspotLabels();
  updateHotspotStates();
}

function startCast() {
  if (!renderer) { openSection('log'); return; }
  if (cast.state !== 'idle') return;
  if (currentSection) closePanel();
  if (expressOpen) setExpress(false);
  hideGuide();
  const f = interactives.rod.focus();
  flyTo(f.pos, f.target, false, 1.1);
  setCastState('windup');
}

function nextProject() {
  const left = PROJECTS.filter((p) => !caught.has(p.id));
  if (left.length) return left[0];
  const pool = PROJECTS.filter((p) => p.id !== cast.project?.id);
  return pool[Math.floor(Math.random() * pool.length)] || PROJECTS[0];
}

function recast() {
  if (cast.state === 'caught') {
    closePanel(); // suelta el pez
    cast.recast = true;
  } else startCast();
}

function releaseFish(again) {
  if (cast.state !== 'caught') return;
  cast.recast = again;
  cast.relFrom.copy(cast.fish.position);
  cast.relTo.set(rr(-1.5, 3.5), -0.6, rr(17, 20));
  setCastState('release');
}

function updateCast(dt) {
  cast.t += dt;
  const T = cast.t;
  rod.updateMatrixWorld();
  rodTip.getWorldPosition(tipW);

  switch (cast.state) {
    case 'idle': {
      rod.rotation.x = lerp(rod.rotation.x, ROD_REST, Math.min(1, dt * 4));
      bobber.position.set(BOBBER_REST.x, wave(BOBBER_REST.x, BOBBER_REST.z, time) + 0.05, BOBBER_REST.z);
      bobber.rotation.z = Math.sin(time * 1.3) * 0.12;
      setLine(tipW, bobber.position.clone().add(V(0, 0.42, 0)), 0.15);
      break;
    }
    case 'windup': {
      const k = easeInOut(Math.min(1, T / 0.7));
      rod.rotation.x = lerp(ROD_REST, ROD_BACK, k);
      rod.updateMatrixWorld();
      rodTip.getWorldPosition(tipW);
      const hang = tipW.clone().add(V(0, -0.7, 0));
      bobber.position.lerpVectors(V(BOBBER_REST.x, wave(BOBBER_REST.x, BOBBER_REST.z, time), BOBBER_REST.z), hang, k);
      setLine(tipW, bobber.position.clone().add(V(0, 0.42, 0)), 0.05);
      if (T > 0.75) {
        cast.from.copy(bobber.position);
        cast.to.set(rr(-5, 6), 0, rr(24, 31));
        showToast(t('casting'), 900);
        setCastState('cast');
      }
      break;
    }
    case 'cast': {
      rod.rotation.x = T < 0.22 ? lerp(ROD_BACK, ROD_FWD, easeOut(T / 0.22)) : lerp(ROD_FWD, ROD_REST, easeInOut(Math.min(1, (T - 0.22) / 0.7)));
      const u = Math.min(1, T / 1.0);
      const y0 = wave(cast.to.x, cast.to.z, time);
      bobber.position.set(lerp(cast.from.x, cast.to.x, u), lerp(cast.from.y, y0, u) + 5 * 4 * u * (1 - u) * 0.6, lerp(cast.from.z, cast.to.z, u));
      bobber.rotation.z += dt * 8;
      setLine(tipW, bobber.position.clone().add(V(0, 0.42, 0)), 0.3 * u);
      if (u >= 1) {
        bobber.rotation.z = 0;
        splash(cast.to.x, cast.to.z, 6);
        cast.wait = rr(1.4, 2.6);
        showToast(t('waiting'));
        setCastState('waiting');
      }
      break;
    }
    case 'waiting': {
      rod.rotation.x = lerp(rod.rotation.x, ROD_REST, Math.min(1, dt * 4));
      bobber.position.set(cast.to.x, wave(cast.to.x, cast.to.z, time) + 0.05, cast.to.z);
      bobber.rotation.z = Math.sin(time * 1.5) * 0.15;
      setLine(tipW, bobber.position.clone().add(V(0, 0.42, 0)), 0.9);
      if (T > cast.wait) {
        cast.bites = 0;
        showToast(t('bite'), 0, 'bite');
        setCastState('bite');
      }
      break;
    }
    case 'bite': {
      const dip = Math.abs(Math.sin(T * 9)) * 0.38;
      bobber.position.set(cast.to.x + Math.sin(T * 23) * 0.05, wave(cast.to.x, cast.to.z, time) + 0.05 - dip, cast.to.z);
      rod.rotation.x = ROD_REST + Math.sin(T * 26) * 0.035 + 0.05;
      const bites = Math.floor(T * 9 / Math.PI);
      if (bites > cast.bites) { cast.bites = bites; ripple(cast.to.x, cast.to.z, 0.6); }
      setLine(tipW, bobber.position.clone().add(V(0, 0.42, 0)), 0.2);
      if (T > 1.15) {
        cast.project = nextProject();
        cast.fish = fishModels[cast.project.id];
        cast.fish.visible = true;
        cast.fish.position.set(cast.to.x, -0.4, cast.to.z);
        bobber.visible = false;
        splash(cast.to.x, cast.to.z, 14);
        showToast(t('reeling'), 1200);
        setCastState('reel');
      }
      break;
    }
    case 'reel': {
      const u = easeInOut(Math.min(1, T / 1.35));
      rod.rotation.x = ROD_REST - 0.35 * Math.sin(Math.PI * Math.min(1, T / 1.35));
      rod.updateMatrixWorld();
      rodTip.getWorldPosition(tipW);
      const end = tipW.clone().add(V(0, -2.45, 0));
      const start = V(cast.to.x, -0.4, cast.to.z);
      const pos = start.clone().lerp(end, u);
      pos.y += Math.sin(Math.PI * u) * 3.2;
      const prev = cast.fish.position.clone();
      cast.fish.position.copy(pos);
      const vel = pos.clone().sub(prev);
      if (vel.lengthSq() > 1e-6) cast.fish.quaternion.setFromUnitVectors(V(1, 0, 0), vel.normalize());
      cast.fish.userData.tail.rotation.y = Math.sin(time * 30) * 0.5;
      setLine(tipW, mouthOf(cast.fish), 0);
      if (T >= 1.35) {
        const first = caught.size === 0;
        const isNew = !caught.has(cast.project.id);
        caught.add(cast.project.id);
        saveCaught();
        hideToast();
        setCastState('caught');
        showPanel('catch', cast.project);
        if (first) setTimeout(() => say('firstCatch'), 900);
        else if (isNew && caught.size === PROJECTS.length) setTimeout(() => say('allCaught'), 900);
      }
      break;
    }
    case 'caught': {
      rod.rotation.x = lerp(rod.rotation.x, ROD_REST - 0.1, Math.min(1, dt * 3));
      rod.updateMatrixWorld();
      rodTip.getWorldPosition(tipW);
      const qUp = new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), V(0, 1, 0));
      const qSpin = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), time * 0.9);
      cast.fish.quaternion.copy(qSpin.multiply(qUp));
      cast.fish.position.copy(tipW).add(V(0, -1.6 - 0.83 + Math.sin(time * 2) * 0.05, 0));
      cast.fish.userData.tail.rotation.y = Math.sin(time * 9) * 0.35;
      setLine(tipW, mouthOf(cast.fish), 0);
      break;
    }
    case 'release': {
      const u = Math.min(1, T / 0.9);
      const pos = cast.relFrom.clone().lerp(cast.relTo, u);
      pos.y += Math.sin(Math.PI * u) * 1.2;
      const prev = cast.fish.position.clone();
      cast.fish.position.copy(pos);
      const vel = pos.clone().sub(prev);
      if (vel.lengthSq() > 1e-6) cast.fish.quaternion.setFromUnitVectors(V(1, 0, 0), vel.normalize());
      rod.rotation.x = lerp(rod.rotation.x, ROD_REST, Math.min(1, dt * 4));
      bobber.visible = true;
      bobber.position.set(BOBBER_REST.x, wave(BOBBER_REST.x, BOBBER_REST.z, time) + 0.05, BOBBER_REST.z);
      setLine(tipW, bobber.position.clone().add(V(0, 0.42, 0)), 0.15);
      if (u >= 1) {
        cast.fish.visible = false;
        splash(cast.relTo.x, cast.relTo.z, 12);
        setCastState('idle');
        if (cast.recast) { cast.recast = false; setTimeout(startCast, 350); }
      }
      break;
    }
  }
}
function mouthOf(fish) {
  return V(0.8, 0, 0).applyQuaternion(fish.quaternion).multiplyScalar(fish.scale.x).add(fish.position);
}

/* ---------- tema ---------- */
function applyTheme(k) {
  const mix = (key, target) => target.copy(PAL[key][0]).lerp(PAL[key][1], k);
  mix('skyTop', skyMat.uniforms.top.value);
  mix('skyBottom', skyMat.uniforms.bottom.value);
  mix('fog', scene.fog.color);
  mix('sun', sunLight.color);
  mix('hemiSky', hemi.color);
  mix('hemiGround', hemi.groundColor);
  mix('water', waterMat.color);
  mix('celestial', celestial.material.color);
  sunLight.intensity = lerp(2.5, 0.8, k);
  hemi.intensity = lerp(1.05, 0.85, k);
  celestial.position.lerpVectors(SUN_POS[0], SUN_POS[1], k);
  sunLight.position.set(lerp(-30, -18, k), lerp(42, 50, k), lerp(22, -8, k));
  starsMat.opacity = k;
  windowMat.emissiveIntensity = k * 2.4;
  lanternMat.emissiveIntensity = 0.2 + k * 3;
  lanternLight.intensity = k * 9;
  firefliesMat.opacity = k * 0.9;
  renderer.toneMappingExposure = lerp(1.0, 1.15, k);
}

/* ---------- loop ---------- */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const proj = new THREE.Vector3();

function pick(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObjects(pickables, false)[0];
  return hit ? hit.object.userData.interactive : null;
}

function updateHotspots() {
  const w = innerWidth, h = innerHeight;
  for (const it of Object.values(interactives)) {
    proj.copy(it.anchor()).project(camera);
    const behind = proj.z > 1;
    const x = (proj.x * 0.5 + 0.5) * w;
    const y = (-proj.y * 0.5 + 0.5) * h;
    const hide = behind || x < -50 || x > w + 50 || y < -50 || y > h + 50 || (it.id === 'rod' && cast.state !== 'idle' && cast.state !== 'caught');
    it.el.classList.toggle('hidden', hide);
    if (!hide) it.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  }
}

function tick(dt) {
  time += dt;

  if (fly) {
    fly.t += dt;
    const k = easeInOut(Math.min(1, fly.t / fly.dur));
    camera.position.lerpVectors(fly.fromP, fly.toP, k);
    controls.target.lerpVectors(fly.fromT, fly.toT, k);
    if (k >= 1) { fly = null; controls.enabled = true; }
  }
  controls.update();
  controls.target.x = clamp(controls.target.x, -35, 35);
  controls.target.y = clamp(controls.target.y, 0, 10);
  controls.target.z = clamp(controls.target.z, -30, 45);
  if (camera.position.y < 1.2) camera.position.y = 1.2;

  themeVal += (theme - themeVal) * Math.min(1, dt * 2.2);
  applyTheme(themeVal);

  updateWater();
  updateCast(dt);

  boat.position.y = wave(BOAT_POS.x, BOAT_POS.z, time) + 0.08;
  boat.rotation.z = Math.sin(time * 1.1) * 0.045;
  boat.rotation.x = Math.sin(time * 0.8 + 1) * 0.03;

  for (const c of clouds) {
    c.position.x += c.userData.speed * dt;
    if (c.position.x > 170) c.position.x = -170;
  }
  for (const p of smoke) {
    const k = (time * 0.18 + p.userData.phase) % 1;
    p.position.copy(p.userData.origin).add(V(k * 1.6 + Math.sin(k * 6 + p.userData.phase * 9) * 0.25, k * 4.5, k * 0.6));
    p.scale.setScalar(0.5 + k * 1.6);
    p.material.opacity = Math.sin(k * Math.PI) * 0.55;
  }
  for (const r of ripples) {
    if (!r.active) continue;
    r.life += dt;
    const k = r.life / 1.7;
    if (k >= 1) { r.active = false; r.mesh.visible = false; continue; }
    r.mesh.position.set(r.x, wave(r.x, r.z, time) + 0.04, r.z);
    r.mesh.scale.setScalar(1 + k * 5 * r.big);
    r.mesh.material.opacity = (1 - k) * 0.75;
  }
  for (const d of drops) {
    if (!d.active) continue;
    d.vel.y -= 9.8 * dt;
    d.mesh.position.addScaledVector(d.vel, dt);
    if (d.mesh.position.y < -0.2) { d.active = false; d.mesh.visible = false; }
  }

  // pez que salta de vez en cuando
  if (jumper.t < 0) {
    jumper.next -= dt;
    if (jumper.next <= 0) {
      const a = rr(0, Math.PI * 2);
      jumper.from = V(rr(-18, 22), -0.4, rr(16, 40));
      jumper.dir = V(Math.cos(a), 0, Math.sin(a));
      jumper.t = 0;
      jumper.fish.visible = true;
      splash(jumper.from.x, jumper.from.z, 6);
    }
  } else {
    jumper.t += dt;
    const u = Math.min(1, jumper.t / 0.95);
    const pos = jumper.from.clone().addScaledVector(jumper.dir, u * 3);
    pos.y = -0.4 + Math.sin(Math.PI * u) * 1.9;
    const prev = jumper.fish.position.clone();
    jumper.fish.position.copy(pos);
    const vel = pos.clone().sub(prev);
    if (vel.lengthSq() > 1e-6) jumper.fish.quaternion.setFromUnitVectors(V(1, 0, 0), vel.normalize());
    if (u >= 1) {
      splash(pos.x, pos.z, 8);
      jumper.fish.visible = false;
      jumper.t = -1;
      jumper.next = rr(6, 12);
    }
  }

  if (themeVal > 0.02) {
    const arr = fireflies.geometry.attributes.position.array;
    const base = fireflies.userData.base;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = base[i] + Math.sin(time * 0.6 + i) * 0.6;
      arr[i + 1] = base[i + 1] + Math.sin(time * 0.9 + i * 0.7) * 0.35;
      arr[i + 2] = base[i + 2] + Math.cos(time * 0.5 + i) * 0.6;
    }
    fireflies.geometry.attributes.position.needsUpdate = true;
  }

  updateHotspots();
  renderer.render(scene, camera);
}

function init3D() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#ffffff', 90, 330);
  camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 900);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  HOME = homeView();
  camera.position.copy(HOME.pos);
  controls = new OrbitControls(camera, canvas);
  controls.target.copy(HOME.target);
  Object.assign(controls, {
    enableDamping: true, dampingFactor: 0.07, minDistance: 5, maxDistance: 70,
    maxPolarAngle: 1.36, minPolarAngle: 0.2, rotateSpeed: 0.6, zoomSpeed: 0.8, panSpeed: 0.8,
  });
  controls.addEventListener('start', () => { fly = null; controls.enabled = true; });

  buildSky();
  buildLights();
  buildTerrain();
  buildWater();
  buildForest();
  buildMountains();
  buildDock();
  buildCabin();
  buildBoat();
  buildSign();
  buildFishing();
  buildAmbient();
  updateHotspotLabels();

  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]);
    down = null;
    if (moved < 6) {
      const id = pick(e);
      if (id) activate(id);
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' && !down) setHover(pick(e));
  });
  canvas.addEventListener('pointerleave', () => setHover(null));

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  });

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => tick(Math.min(clock.getDelta(), 0.05)));
}

/* ════════════════════════════════════════════════════════════
   Arranque
   ════════════════════════════════════════════════════════════ */
applyLang();
const loader = $('#loader');
if (renderer) {
  init3D();
  document.fonts?.ready.then(() => drawSign());
  setTimeout(() => {
    loader.classList.add('done');
    setTimeout(() => { if (!expressOpen && !currentSection) say('intro'); }, 500);
  }, 700);
} else {
  setExpress(true);
  $('#homeBtn').hidden = true;
  $('#expressBtn').hidden = true;
  $('#themeBtn').hidden = true;
  loader.classList.add('done');
  showToast(t('noWebgl'), 5000);
}
