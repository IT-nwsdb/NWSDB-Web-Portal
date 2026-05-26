/* script.js — Public landing + auth + charts + UX helpers + Maps + HRM RSC(C)
   - Firebase bootstrap (v12.3.0 via dynamic imports)
   - Session + roles (user/admin)
   - Landing KPIs and charts (with lazy Chart.js loading)
   - Page toggling + a11y
   - Region panel (links to data entry pages from core.js)
   - Extended sections builder for Scheme
   - Admin prompt always asks credentials (every time)
   - Map page (Leaflet) for plant locations + photos
   - Plant map picker modal to set lat/lng
   - Public landing page map with plant locations and photos
   - HRM RSC(C) staff cadre management template
   Note: core.js provides persistence (LS + Firebase) and admin config.
*/

/* ===========================
   Firebase bootstrap (v12.3.0 via dynamic imports)
   =========================== */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDONOM5vrhAJsaerwJSUW71WAbdyi3wGqM",
  authDomain: "web-portal-ac49e.firebaseapp.com",
  projectId: "web-portal-ac49e",
  storageBucket: "web-portal-ac49e.appspot.com",
  messagingSenderId: "613964862307",
  appId: "1:613964862307:web:a6e83dc5550d90b3ddb956",
  measurementId: "G-C2CREDS85T"
};

const FB = {
  initialized: false,
  app: null,
  analytics: null,
  auth: null,
  db: null,
  storage: null,
  mod: null
};

async function initFirebase() {
  if (FB.initialized) return FB;
  try {
    const appMod = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js');
    const analyticsMod = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js');
    const authMod = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
    const fsMod = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
    const storageMod = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js');

    FB.app = appMod.initializeApp(FIREBASE_CONFIG);

    try {
      const supported = await analyticsMod.isSupported?.();
      if (supported) FB.analytics = analyticsMod.getAnalytics(FB.app);
    } catch (_) {}

    FB.auth = authMod.getAuth(FB.app);
    try {
      await authMod.signInAnonymously(FB.auth);
    } catch (e) {
      console.warn('Anonymous auth failed:', e?.message || e);
    }

    FB.db = fsMod.getFirestore(FB.app);
    FB.storage = storageMod.getStorage(FB.app);

    FB.mod = { authMod, fsMod, storageMod };
    FB.initialized = true;
    console.log('Firebase initialized successfully');
  } catch (e) {
    console.error('Firebase init failed:', e?.message || e);
  }
  return FB;
}

function isOnline() { return navigator.onLine; }
function makeDocId(region, location) {
  return `${String(region)}__${encodeURIComponent(String(location || '')).replace(/\./g, '%2E')}`;
}

const SERVER_COMMIT_TIMEOUT_MS = 5000; // Reduced from 12000 to 5000 for faster response

async function ensureOnlineAuth() {
  try {
    await initFirebase();
    if (!isOnline()) throw new Error('No internet connection');
    if (!FB?.mod || !FB.auth || !FB.db) throw new Error('Firebase not ready');
    
    const { authMod } = FB.mod;
    
    // Check if we already have a user, if not try anonymous auth
    if (!FB.auth.currentUser) {
      try {
        await authMod.signInAnonymously(FB.auth);
      } catch (authError) {
        console.warn('Anonymous auth failed, continuing offline:', authError);
        throw new Error('Authentication failed');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Online auth failed:', error);
    throw error;
  }
}

function waitForServerCommit(timeoutMs = SERVER_COMMIT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Server commit timeout')), timeoutMs);
    FB.mod.fsMod.waitForPendingWrites(FB.db)
      .then(() => { clearTimeout(t); resolve(); })
      .catch(err => { clearTimeout(t); reject(err); });
  });
}

/* ===========================
   Constants and Data
   =========================== */
const REGION_ITEMS = {
  CENTRALEAST: [
    'Ampitiya','Medadumbara','Pallekele','Marassana','Haragama',
    'Digana I','Digana II','Manikhinna','Buluwamuduna','Rikillagaskada',
    'Ragala','Walapane'
  ],
  CENTRALNORTH: [
    'Akurana','Ankumbura','Bokkawala','Galagedara','Harispattuwa',
    'Galewela','Hedeniya','Pathadumbara'
  ],
  CENTRALSOUTH: [
    'Udaperadeniya','Kadugannawa','Hanthna','Gannoruwa','Eriyagama',
    'Nillambe','Hanthana','Welamboda','CY-1 Gampola','CY-4 Pussellawa',
    'Nawalapitiya','Hatton','Maskeliya','Nallathanniya','Sripada',
    'PudaluOya','Thalawakale','Ginigathhena','Meepilimanna'
  ],
  MATALE: [
    'Matale','Raththota','Pussella','Ukuwela','Dambulla',
    'Wilgamuwa','Ambanganga','Naula','Galewela'
  ]
};

const LABS_REGION_ITEMS = {
  CENTRALEAST: [
    'Kundasale-Balagolla WTP','Kundasale-Araththana WTP','Ampitiya',
    'Medadumbara','Haragama /Thennekumbura','Marassana',
    'Rikillagaskada','Ragala','Walapane'
  ],
  CENTRALNORTH: [
    'Katugasthota','Matale','Dambulla','Ukuwela',
    'Udathenna','Naula','Pussella','Wilgamuwa'
  ],
  CENTRALSOUTH: [
    'Meewatura','Nillambe','University','Doluwa','Datry','Nawalapitiya',
    'Gampolawatta','Paradeka','Ulapane','Pussellawa','Elpitiya',
    'Hantana','Hatton','Kotagala','Pundaluoya','Ginigathhena',
    'Maskeliya','Thalawakele','Nallathanniya','Sri Pada'
  ],
  MATALE: [
    'Matale','Dambulla','Ukuwela','Naula','Pussella','Wilgamuwa'
  ]
};

const CONNECTION_CATEGORIES = [
  'Domestic','Board Quarters','Schools','Govt Quarters','Tenaman Garden',
  'Assisted Schools','Condominium $4','Domestic NonVAT','Domestic Samurdhi','Tenaman Samurdhi',
  'Stand Posts','Stand Posts','Stand Post (C.S.)','Stand Post Tenemani','Govt Institution','Army',
  'Police','Hospitals','CMC Premises','SOBE','Commercial Institutes','Tourist/Guest','Shipping',
  'Indust/Construt','BOI Approved Industries','Small & Medium Industries','Commercial_NonVAT',
  'Other Comm and Priv.','Religious','NWSDB premises','Religious 2','Housing Authority',
  'Other nonProfit Organizations','Bulk (L.A.)','Bulk (C.B.O.)','Bulk (Halgahakubura)',
  'Bulk Supply (Sp. Inst)','Bulk Spl (Sp Inst)','Bulk Spl (Sp Inst)','Bulk Supply (Sp. Inst)'
];

const CATEGORY_LABEL = { scheme: 'Scheme', plant: 'Plant', labs: 'Labs' };

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/* ===========================
   Reporting year (Scheme)
   ===========================
   Default year is 2026.
   Admin can change the year in Developer Options.
   When changed, we migrate Scheme "Connection Target (YYYY)" keys in
   locally cached extended data to the new year label.
*/
const YEAR_KEY = 'nwsdb:reportingYear';

function getAppYear() {
  const raw = localStorage.getItem(YEAR_KEY);
  const y = parseInt(raw || '2026', 10);
  return Number.isFinite(y) && y >= 1900 && y <= 2100 ? y : 2026;
}

function normalizeMonthlyFieldKey(key) {
  // Normalize both old/new variants and allow minor whitespace differences.
  const s = String(key || '').trim();
  const m = /^Connection\s*Target\s*\((\d{4})\)$/i.exec(s);
  if (m) return { type: 'connectionTarget', year: parseInt(m[1], 10), raw: s };
  return { type: 'other', raw: s };
}

function migrateMonthlyObjectToYear(monthlyObj, year) {
  if (!monthlyObj || typeof monthlyObj !== 'object') return monthlyObj;
  const targetKey = `Connection Target (${year})`;
  const out = {};
  Object.entries(monthlyObj).forEach(([month, fields]) => {
    const f = (fields && typeof fields === 'object') ? { ...fields } : {};
    // If any "Connection Target (YYYY)" exists, move it to the chosen year.
    Object.keys(f).forEach(k => {
      const info = normalizeMonthlyFieldKey(k);
      if (info.type === 'connectionTarget') {
        const v = f[k];
        delete f[k];
        // Prefer existing value on the new key; otherwise move.
        if (f[targetKey] == null && v != null) f[targetKey] = v;
      }
    });
    out[month] = f;
  });
  return out;
}

// Expose for other modules (system.js / modal.js)
window.migrateMonthlyObjectToYear = migrateMonthlyObjectToYear;

function migrateExtendedLocalCacheToYear(year) {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('nwsdb:extended:')) continue;
      try {
        const payload = JSON.parse(localStorage.getItem(k) || 'null');
        if (!payload || typeof payload !== 'object') continue;
        if (payload.monthly && typeof payload.monthly === 'object') {
          payload.monthly = migrateMonthlyObjectToYear(payload.monthly, year);
          localStorage.setItem(k, JSON.stringify(payload));
        }
      } catch (e) {
        console.warn('Year migration skipped for', k, e);
      }
    }
  } catch (e) {
    console.warn('Year migration failed', e);
  }
}

function setAppYear(year) {
  const y = parseInt(String(year || ''), 10);
  if (!Number.isFinite(y) || y < 1900 || y > 2100) return;
  localStorage.setItem(YEAR_KEY, String(y));

  // Update year-dependent globals used by UI builders.
  MONTHLY_FIELDS = buildMonthlyFields(y);
  migrateExtendedLocalCacheToYear(y);

  // Refresh UI if available.
  try {
    if (typeof window.refreshYearDependentUI === 'function') {
      window.refreshYearDependentUI();
    }
  } catch (_) {}
}

window.getAppYear = getAppYear;
window.setAppYear = setAppYear;

function buildMonthlyFields(year) {
  return [
    `Connection Target (${year})`,
    'Connection Achieved',
    'Billing Target',
    'Billing Achieved',
    'Income',
    'Expenditure',
    'Current Debtage',
    'Operational Ratio',
    'Staff/1000 Connection',
    'NRW',
    'Per Connection Income',
    'Specific Energy'
  ];
}

let MONTHLY_FIELDS = buildMonthlyFields(getAppYear());

const DEMO_CREDENTIALS = { email: 'nwsbrsccit@gmail.com', password: '123' };

const REGION_LABELS = {
  CENTRALEAST: 'Central East',
  CENTRALNORTH: 'Central North',
  CENTRALSOUTH: 'Central South',
  MATALE: 'Matale'
};

/* ===========================
   Session + Roles
   =========================== */
const SESSION_KEY = 'nwsdb_logged_in';
const ROLE_KEY = 'nwsdb_role';

function isLoggedIn() {
  return localStorage.getItem(SESSION_KEY) === 'true' || sessionStorage.getItem(SESSION_KEY) === 'true';
}
function setLoggedIn(remember) {
  if (remember) localStorage.setItem(SESSION_KEY, 'true');
  else sessionStorage.setItem(SESSION_KEY, 'true');
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  localStorage.removeItem('nwsdb_user_scope');
  sessionStorage.removeItem('nwsdb_user_scope');
  localStorage.removeItem('nwsdb_user_region');
  sessionStorage.removeItem('nwsdb_user_region');
}
function setRole(role, remember = false) {
  if (remember) localStorage.setItem(ROLE_KEY, role);
  else sessionStorage.setItem(ROLE_KEY, role);
}
function getRole() {
  return localStorage.getItem(ROLE_KEY) || sessionStorage.getItem(ROLE_KEY) || 'guest';
}
function isAdmin() { return getRole() === 'admin'; }

/* Expose for inline or other modules */
window.setLoggedIn = setLoggedIn;
window.setRole = setRole;
window.isAdmin = isAdmin;

/* ===========================
   User scope (RSC / Region lock)
   =========================== */
const USER_SCOPE_KEY = 'nwsdb_user_scope';
const USER_REGION_KEY = 'nwsdb_user_region';

// Main-login credentials (NOT the Admin tab)
const MAIN_LOGIN_CREDENTIALS = {
  CENTRALNORTH: { username: 'admincn', password: '123cn' },
  CENTRALSOUTH: { username: 'admincs', password: '123cs' },
  CENTRALEAST:  { username: 'admince', password: '123ce' },
  MATALE:       { username: 'admincma', password: '123ma' }
};

function setUserScope(scope, remember = false) {
  const v = String(scope || '').trim().toUpperCase();
  if (remember) localStorage.setItem(USER_SCOPE_KEY, v);
  else sessionStorage.setItem(USER_SCOPE_KEY, v);
}
function getUserScope() {
  return (localStorage.getItem(USER_SCOPE_KEY) || sessionStorage.getItem(USER_SCOPE_KEY) || 'RSC').toUpperCase();
}
function setUserRegion(regionKey, remember = false) {
  const v = String(regionKey || '').trim().toUpperCase();
  if (remember) localStorage.setItem(USER_REGION_KEY, v);
  else sessionStorage.setItem(USER_REGION_KEY, v);
}
function getUserRegion() {
  const v = (localStorage.getItem(USER_REGION_KEY) || sessionStorage.getItem(USER_REGION_KEY) || '').toUpperCase();
  return v || (getUserScope() !== 'RSC' ? getUserScope() : '');
}
function isRSCUser() { return getUserScope() === 'RSC'; }
function isRegionalUser() { return !isRSCUser(); }

window.setUserScope = setUserScope;
window.getUserScope = getUserScope;
window.setUserRegion = setUserRegion;
window.getUserRegion = getUserRegion;
window.isRSCUser = isRSCUser;
window.isRegionalUser = isRegionalUser;
window.MAIN_LOGIN_CREDENTIALS = MAIN_LOGIN_CREDENTIALS;


/* ===========================
   LocalStorage keys
   =========================== */
const lsKey = {
  conn: (r,l) => `nwsdb:connections:${r}:${l}`,
  ext:  (r,l) => `nwsdb:extended:${r}:${l}`,
  labs: (r,l) => `nwsdb:labs:${r}:${l}`,
  plant:(r,l) => `nwsdb:plant:${r}:${l}`
};

/* ===========================
   Global state
   =========================== */
let DATA_CTX = { region: null, location: null, entries: [] };
let LABS_CTX = { region: null, location: null };
let PLANT_CTX = { region: null, location: null };

let EXP_ITEMS = [];
let PLANT_PHOTOS = [];

let categorySelect, existingConnections, addCategoryBtn, connectionsCard, connectionsList;
let expListEl = null;
let submitExtendedBtnEl = null;
let labRawEl = null, labTreatedTpEl = null, labTreatedDistEl = null, labIssuesEl = null, labsSubmitBtn = null;
let plantRegionEl = null, plantLocationEl = null, plantSchemeBriefEl = null, plantPhotosInputEl = null, plantPhotosPreviewEl = null;
let plantDesignedCapEl = null, plantOperationalCapEl = null, plantWaterSourceEl = null, plantApprovedExtractionEl = null, plantTreatmentTypeEl = null, plantCoverageEl = null, plantSubmitBtn = null;
let plantLatEl = null, plantLngEl = null, plantOpenMapPickerBtn = null;

let subPageInited = false; // Submissions page init flag (modal.js will set true)
let subDatasetSel, subRegionSel, subLocationSel, subFromEl, subToEl, subApplyBtn, subResetBtn, subExportBtn;
let kpiTotalEl, kpiLocsEl, kpiRegionsEl, kpiLatestEl;
let chartsUnavailableEl;

// Map state
let PLANT_MAP = null;
let PLANT_MARKERS = [];
let MAP_PICKER = { map: null, marker: null };
let MAP_UI_BOUND = false;

// Public map state
let PUBLIC_PLANT_MAP = null;
let PUBLIC_PLANT_MARKERS = [];

// Photo Gallery state
let CURRENT_GALLERY = {
  plantMeta: { region: null, location: null },
  photos: [],
  currentIndex: 0
};

// Live getters so devtools see current values
Object.defineProperty(window, 'PLANT_MAP', { get: () => PLANT_MAP });
Object.defineProperty(window, 'PUBLIC_PLANT_MAP', { get: () => PUBLIC_PLANT_MAP });
Object.defineProperty(window, 'PLANT_MARKERS', { get: () => PLANT_MARKERS });
Object.defineProperty(window, 'PUBLIC_PLANT_MARKERS', { get: () => PUBLIC_PLANT_MARKERS });
Object.defineProperty(window, 'CURRENT_GALLERY', { get: () => CURRENT_GALLERY });

// Ensure global variables are properly exposed (compat)
window.PLANT_PHOTOS = PLANT_PHOTOS;
window.PLANT_CTX = PLANT_CTX;

const CHARTS = {
  schemeConnections: null,
  schemeGrowth: null,
  plantCapacity: null,
  plantTreatment: null,
  labsSubmissions: null,
  landingShare: null,
  landingMonthly: null,
  landingRegion: null
};
window.CHARTS = CHARTS;

/* ===========================
   Utilities
   =========================== */
const $ = (id) => document.getElementById(id);

/* Polyfill: lsAll(prefix) if core.js hasn't defined it yet */
if (typeof window.lsAll !== 'function') {
  window.lsAll = function(prefix) {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          const raw = localStorage.getItem(k);
          try { out.push(JSON.parse(raw)); } catch (_) {}
        }
      }
    } catch (_) {}
    return out;
  };
}

function bindUIRefs() {
  // Scheme connections UI
  categorySelect      = $('categorySelect');
  existingConnections = $('existingConnections');
  addCategoryBtn      = $('addCategoryBtn');
  connectionsCard     = $('connectionsCard');
  connectionsList     = $('connectionsList');

  // Extended sections dynamic refs may be null until injected
  expListEl           = $('exp-list');
  submitExtendedBtnEl = $('submit-data-btn');

  // Labs UI
  labRawEl            = $('lab-raw');
  labTreatedTpEl      = $('lab-treated-tp');
  labTreatedDistEl    = $('lab-treated-dist');
  labIssuesEl         = $('lab-issues');
  labsSubmitBtn       = $('labsSubmitBtn');

  // Plant UI
  plantRegionEl            = $('plant-region');
  plantLocationEl          = $('plant-location');
  plantSchemeBriefEl       = $('plant-scheme-brief');
  plantDesignedCapEl       = $('plant-designed-capacity');
  plantOperationalCapEl    = $('plant-operational-capacity');
  plantWaterSourceEl       = $('plant-water-source');
  plantApprovedExtractionEl= $('plant-approved-extraction');
  plantTreatmentTypeEl     = $('plant-treatment-type');
  plantCoverageEl          = $('plant-coverage');
  plantPhotosInputEl       = $('plant-photos-input');
  plantPhotosPreviewEl     = $('plant-photos-preview');
  plantSubmitBtn           = $('plantSubmitBtn');

  // Plant map picker fields
  plantLatEl               = $('plant-lat');
  plantLngEl               = $('plant-lng');
  plantOpenMapPickerBtn    = $('plant-open-map-picker');

  // Submissions UI
  subDatasetSel = $('sub-dataset');
  subRegionSel  = $('sub-region');
  subLocationSel= $('sub-location');
  subFromEl     = $('sub-from');
  subToEl       = $('sub-to');
  subApplyBtn   = $('sub-apply');
  subResetBtn   = $('sub-reset');
  subExportBtn  = $('sub-export');

  kpiTotalEl    = $('kpi-total');
  kpiLocsEl     = $('kpi-locations');
  kpiRegionsEl  = $('kpi-regions');
  kpiLatestEl   = $('kpi-latest');
  chartsUnavailableEl = $('charts-unavailable');
}

// Use admin label if available (falls back to static labels)
function formatRegionName(key) {
  if (typeof getRegionLabelForAny === 'function') {
    const lbl = getRegionLabelForAny(key);
    if (lbl) return lbl;
  }
  return REGION_LABELS[key] || String(key).replace(/_/g, ' ');
}

function parseNum(val) { if (val === '' || val === null || val === undefined) return null; const n = Number(val); return Number.isFinite(n) ? n : null; }
function toDate(d) { const dt = new Date(d); return isNaN(dt) ? null : dt; }
function fmtDateTime(s) { const d = toDate(s); return d ? d.toLocaleString() : '-'; }

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy') ? resolve() : reject(); }
    catch (e) { reject(e); }
    finally { document.body.removeChild(ta); }
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

function isSafeImageSrc(src) {
  return typeof src === 'string' && (
    src.startsWith('data:image/') ||
    src.startsWith('https://') ||
    src.startsWith('http://') ||
    src.startsWith('blob:')
  );
}

function showToast(message, type = 'success') {
  const iconMap = { success: 'circle-check', danger: 'circle-exclamation', warning: 'triangle-exclamation', info: 'circle-info' };
  const icon = iconMap[type] || 'circle-info';

  const el = document.createElement('div');
  el.className = `success-alert alert alert-${type} d-flex align-items-center`;
  el.setAttribute('role', 'alert');

  const i = document.createElement('i');
  i.className = `fa-solid fa-${icon} me-2`;

  const msg = document.createElement('div');
  msg.textContent = String(message);

  el.append(i, msg);
  document.body.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 3500);
}
window.showToast = showToast;

function chartsAvailable() {
  return typeof Chart !== 'undefined' && Chart?.constructor;
}

/* ===========================
   Firebase Connection Test
   =========================== */
async function testFirebaseConnection() {
  try {
    await ensureOnlineAuth();
    return true;
  } catch (error) {
    console.warn('Firebase connection test failed:', error);
    return false;
  }
}
window.testFirebaseConnection = testFirebaseConnection;

/* ===========================
   Chart.js lazy loader (perf) + reduced motion - FIXED VERSION
   =========================== */
function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

function loadStylesheet(href) {
  return new Promise((res, rej) => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    l.onload = res;
    l.onerror = rej;
    document.head.appendChild(l);
  });
}

function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function syncChartMotionPref() {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.animation = prefersReducedMotion() ? false : { duration: 300 };
}

async function ensureChartJs() {
  if (window.Chart) { syncChartMotionPref(); return true; }
  try {
    // Match the version used in index.html to avoid mismatches
    await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js');
    syncChartMotionPref();
    try {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      mql.addEventListener?.('change', syncChartMotionPref);
    } catch(_) {}
    return true;
  } catch {
    console.warn('Chart.js failed to load');
    return false;
  }
}

/* ===========================
   Leaflet (Maps) lazy loader
   =========================== */
async function ensureLeaflet() {
  if (window.L && typeof L.map === 'function') return true;
  try {
    await loadStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
    await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
    return true;
  } catch (e) {
    console.warn('Leaflet failed to load', e);
    showToast('Map library failed to load. Check your internet.', 'warning');
    return false;
  }
}

/* ===========================
   Missing Utility Functions - ADDED FOR PUBLIC MAP FIXES
   =========================== */

// Ensure parseNum function exists with enhanced validation
if (typeof window.parseNum !== 'function') {
  window.parseNum = function(val) { 
    if (val === '' || val === null || val === undefined) return null; 
    const n = Number(val); 
    return Number.isFinite(n) ? n : null; 
  };
}

// Ensure formatRegionName function exists
if (typeof window.formatRegionName !== 'function') {
  window.formatRegionName = function(key) {
    if (typeof getRegionLabelForAny === 'function') {
      const lbl = getRegionLabelForAny(key);
      if (lbl) return lbl;
    }
    return REGION_LABELS[key] || String(key).replace(/_/g, ' ');
  };
}

// Ensure refreshPublicPlantMap function exists
if (typeof window.refreshPublicPlantMap !== 'function') {
  window.refreshPublicPlantMap = function() {
    if (typeof window.getPublicPlantRecords === 'function' && typeof window.addPublicPlantMarkers === 'function') {
      try {
        const plantRecords = window.getPublicPlantRecords();
        console.log('Refreshing public map with', plantRecords.length, 'plant records');
        window.addPublicPlantMarkers(plantRecords);
        
        // Force map resize if needed
        if (window.PUBLIC_PLANT_MAP) {
          setTimeout(() => {
            window.PUBLIC_PLANT_MAP.invalidateSize(true);
          }, 100);
        }
      } catch (e) {
        console.warn('Could not refresh public map:', e?.message || e);
      }
    } else {
      console.warn('Public map functions not available for refresh');
    }
  };
}

// Ensure throttle function exists
if (typeof window.throttleRefreshPublicPlantMap !== 'function') {
  let __refreshPublicMapPending = false;
  window.throttleRefreshPublicPlantMap = function(delay = 200) {
    if (__refreshPublicMapPending) return;
    __refreshPublicMapPending = true;
    setTimeout(() => {
      __refreshPublicMapPending = false;
      try { window.refreshPublicPlantMap(); } catch (e) { console.warn(e); }
    }, delay);
  };
}

// Ensure estimateDataUrlBytes function exists
if (typeof window.estimateDataUrlBytes !== 'function') {
  window.estimateDataUrlBytes = function(dataUrl) {
    if (typeof dataUrl !== 'string') return 0;
    const i = dataUrl.indexOf(',');
    if (i === -1) return 0;
    const base64 = dataUrl.slice(i + 1);
    const padding = (base64.match(/=+$/) || [''])[0].length;
    return Math.floor(base64.length * 3 / 4) - padding;
  };
}

// Ensure validatePlantData function exists
if (typeof window.validatePlantData !== 'function') {
  window.validatePlantData = function(payload) {
    const errors = [];
    
    if (!payload?.region || !payload?.location) {
      errors.push('Region and location are required');
    }
    
    
    
    if (payload.designedCapacity && payload.designedCapacity < 0) {
      errors.push('Designed capacity cannot be negative');
    }
    
    if (payload.operationalCapacity && payload.operationalCapacity < 0) {
      errors.push('Operational capacity cannot be negative');
    }
    
    if (payload.approvedExtraction && payload.approvedExtraction < 0) {
      errors.push('Approved extraction cannot be negative');
    }
    
    // Validate photos
    if (payload.photosInline && Array.isArray(payload.photosInline)) {
      payload.photosInline.forEach((photo, index) => {
        if (photo?.dataUrl && window.estimateDataUrlBytes(photo.dataUrl) > 5 * 1024 * 1024) {
          errors.push(`Photo ${index + 1} is too large (max 5MB)`);
        }
      });
    }
    
    return errors;
  };
}

/* ===========================
   Utility Functions - ENHANCED
   =========================== */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Create debounced versions of expensive functions
const debouncedRefreshPublicPlantMap = debounce(refreshPublicPlantMap, 300);
const debouncedRenderSubmissions = debounce(renderSubmissions, 250);

// Expose debounced functions globally
window.debouncedRefreshPublicPlantMap = debouncedRefreshPublicPlantMap;
window.debouncedRenderSubmissions = debouncedRenderSubmissions;

/* ===========================
   Global Error Handler - ENHANCED
   =========================== */
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
  console.error('File:', e.filename);
  console.error('Line:', e.lineno);
  console.error('Column:', e.colno);
  
  // Don't show toast for every error, only critical ones
  if (e.error && (
      e.error.message?.includes('Critical') || 
      e.error.message?.includes('Network') ||
      e.error.message?.includes('Firebase') ||
      e.error.message?.includes('Map') ||
      e.error.message?.includes('auth') ||
      e.error.message?.includes('permission')
  )) {
    showToast('An unexpected error occurred. Please check your connection.', 'danger');
  }
});

// Promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', e.reason);
  
  // Show toast for critical promise rejections
  if (e.reason && (
      e.reason.message?.includes('Network') ||
      e.reason.message?.includes('Firebase') ||
      e.reason.message?.includes('auth') ||
      e.reason.message?.includes('permission')
  )) {
    showToast('Operation failed. Please check your connection.', 'warning');
  }
});

/* ===========================
   Enhanced Firebase Error Handling
   =========================== */
async function enhancedEnsureOnlineAuth() {
  try {
    await ensureOnlineAuth();
    return true;
  } catch (error) {
    console.error('Enhanced online auth failed:', error);
    
    // More specific error messages
    if (error.message?.includes('No internet')) {
      showToast('No internet connection. Working in offline mode.', 'warning');
    } else if (error.message?.includes('Firebase not ready')) {
      showToast('Database not ready. Please refresh the page.', 'danger');
    } else if (error.message?.includes('Authentication failed')) {
      showToast('Authentication issue. Some features may not work.', 'warning');
    } else {
      showToast('Connection issue. Working in offline mode.', 'warning');
    }
    
    throw error;
  }
}

// Replace the original ensureOnlineAuth with enhanced version for critical operations
window.enhancedEnsureOnlineAuth = enhancedEnsureOnlineAuth;

/* ===========================
   Performance Monitoring
   =========================== */
function measurePerformance(name, fn) {
  return async function(...args) {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      console.log(`⏱️ ${name} completed in ${duration.toFixed(2)}ms`);
      
      // Log slow operations
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`⏱️ ${name} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };
}

// Wrap critical functions with performance monitoring
window.measurePerformance = measurePerformance;

/* ===========================
   Network Status Monitoring
   =========================== */
let networkStatus = {
  online: navigator.onLine,
  lastChecked: Date.now()
};

function updateNetworkStatus() {
  const wasOnline = networkStatus.online;
  networkStatus.online = navigator.onLine;
  networkStatus.lastChecked = Date.now();
  
  if (wasOnline !== networkStatus.online) {
    console.log(`Network status changed: ${wasOnline ? 'online' : 'offline'} -> ${networkStatus.online ? 'online' : 'offline'}`);
    
    if (networkStatus.online) {
      showToast('Connection restored. Syncing data...', 'success');
      // Trigger sync when coming back online
      setTimeout(() => {
        if (typeof syncLocalToCloud === 'function') {
          syncLocalToCloud().catch(console.error);
        }
        if (typeof syncAllFromCloudToLS === 'function') {
          syncAllFromCloudToLS().catch(console.error);
        }
      }, 1000);
    } else {
      showToast('Working in offline mode. Changes will sync when online.', 'warning');
    }
  }
}

// Listen for network status changes
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// Initialize network status
updateNetworkStatus();

/* ===========================
   Memory Management Helpers
   =========================== */
function cleanupOldData() {
  try {
    const now = Date.now();
    const MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    
    // Clean up old localStorage entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nwsdb:')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.submittedAt) {
            const submittedTime = new Date(data.submittedAt).getTime();
            if (now - submittedTime > MAX_AGE) {
              localStorage.removeItem(key);
              console.log(`Cleaned up old data: ${key}`);
            }
          }
        } catch (e) {
          // Skip if data is not valid JSON
        }
      }
    }
  } catch (error) {
    console.warn('Data cleanup failed:', error);
  }
}

// Run cleanup on startup and periodically
setTimeout(cleanupOldData, 5000);
setInterval(cleanupOldData, 24 * 60 * 60 * 1000); // Daily cleanup

/* ===========================
   Enhanced Data Validation
   =========================== */
function validatePlantData(payload) {
  const errors = [];
  
  if (!payload?.region || !payload?.location) {
    errors.push('Region and location are required');
  }
  

  
  if (payload.designedCapacity && payload.designedCapacity < 0) {
    errors.push('Designed capacity cannot be negative');
  }
  
  if (payload.operationalCapacity && payload.operationalCapacity < 0) {
    errors.push('Operational capacity cannot be negative');
  }
  
  if (payload.approvedExtraction && payload.approvedExtraction < 0) {
    errors.push('Approved extraction cannot be negative');
  }
  
  // Validate photos
  if (payload.photosInline && Array.isArray(payload.photosInline)) {
    payload.photosInline.forEach((photo, index) => {
      if (photo?.dataUrl && estimateDataUrlBytes(photo.dataUrl) > 5 * 1024 * 1024) {
        errors.push(`Photo ${index + 1} is too large (max 5MB)`);
      }
    });
  }
  
  return errors;
}

window.validatePlantData = validatePlantData;

/* ===========================
   Enhanced Image Handling
   =========================== */
function estimateDataUrlBytes(dataUrl) {
  if (typeof dataUrl !== 'string') return 0;
  const i = dataUrl.indexOf(',');
  if (i === -1) return 0;
  const base64 = dataUrl.slice(i + 1);
  const padding = (base64.match(/=+$/) || [''])[0].length;
  return Math.floor(base64.length * 3 / 4) - padding;
}

window.estimateDataUrlBytes = estimateDataUrlBytes;

/* ===========================
   Public Map Helper Functions - ADDED FOR FIXES
   =========================== */

// Initialize global variables if they don't exist
if (typeof window.PUBLIC_PLANT_MAP === 'undefined') window.PUBLIC_PLANT_MAP = null;
if (typeof window.PUBLIC_PLANT_MARKERS === 'undefined') window.PUBLIC_PLANT_MARKERS = [];

// Public map initialization helper
window.initPublicMapIfNeeded = function(){ /* map removed */ };

// Auto-initialize public map when landing page is visible
window.initPublicMapObserver = function(){ /* map removed */ };

/* ===========================
   Export all enhanced functions
   =========================== */
window.debounce = debounce;
window.measurePerformance = measurePerformance;
window.cleanupOldData = cleanupOldData;
window.validatePlantData = validatePlantData;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function(){ console.log('script.js loaded successfully (maps removed)'); });

// Make sure essential functions are available globally
window.parseNum = parseNum;
window.formatRegionName = formatRegionName;
window.showToast = showToast;
window.isLoggedIn = isLoggedIn;


// === Safe lazy wrapper for renderSubmissions to avoid ReferenceError ===
(function(){
  const root = (typeof window!=='undefined') ? window : globalThis;
  function debounce(fn, wait){
    let t; return function(){ clearTimeout(t); const ctx=this, args=arguments; t=setTimeout(function(){ fn.apply(ctx,args); }, wait||250); };
  }
  if (!root.debouncedRenderSubmissions) {
    root.debouncedRenderSubmissions = (function(){
      let actual;
      const fallback = function(){ if (typeof root.renderSubmissions === 'function') { actual = debounce(root.renderSubmissions, 250); actual(); } };
      return function(){ if (actual) { actual(); } else { fallback(); } };
    })();
  }
})();
// === end safe wrapper ===



// ========= HRM Header Normalizer =========
// Ensures the header inputs appear in this exact order on ALL HRM sheets:
// [Region] [Manager Zone] [No. of Connection] [Plant Capacity]
// It reuses existing inputs when found (by placeholder/label), or creates them if missing.

(function(){
  const ORDER = [
    {key:'region',       placeholder: 'Region (optional)'},
    {key:'zone',         placeholder: 'Manager Zone (optional)'},
    {key:'connections',  placeholder: 'No. of Connection (optional)'},
    {key:'capacity',     placeholder: 'Plant Capacity (optional)'},
  ];

  function makeInput(placeholder, id){
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.placeholder = placeholder;
    if (id) input.id = id;
    input.setAttribute('data-hrm-field', placeholder);
    return input;
  }

  function findOrCreate(container, placeholder, id){
    // Try by id first:
    if (id) {
      const byId = container.querySelector('#'+CSS.escape(id));
      if (byId) return byId;
    }
    // Try by placeholder match (case-insensitive contains)
    const allInputs = Array.from(container.querySelectorAll('input,select,textarea'));
    const found = allInputs.find(el => (el.placeholder||'').toLowerCase().includes(placeholder.toLowerCase().split(' (')[0]));
    if (found) return found;
    // Create if not found
    return makeInput(placeholder, id);
  }

  function standardizeHeaderForCard(card){
    // Heuristic: header toolbar row is the first .hrm-toolbar or .d-flex area under the card
    const header = card.querySelector('.hrm-toolbar, .hrm-header, .d-flex') || card;
    if (!header) return;

    // Wrap inputs in a row container if not present
    let row = header.querySelector('.hrm-header-row');
    if (!row){
      row = document.createElement('div');
      row.className = 'hrm-header-row d-flex gap-2 mb-2 flex-wrap';
      header.insertBefore(row, header.firstChild);
    }

    // Determine sheet key for stable ids (try by data-key or by card title text)
    let sheetKey = card.getAttribute('data-sheet') || '';
    if (!sheetKey){
      const h = card.querySelector('h1,h2,h3,.card-title');
      if (h) sheetKey = (h.textContent||'').toLowerCase().replace(/\W+/g,'-').slice(0,20);
    }
    sheetKey = sheetKey || 'hrm';

    const wanted = ORDER.map(item => {
      const id = `hrm-${sheetKey}-${item.key}-input`;
      const el = findOrCreate(card, item.placeholder, id);
      // Place each in a wrapper for spacing
      const wrap = document.createElement('div');
      wrap.className = 'flex-grow-1';
      wrap.appendChild(el);
      return wrap;
    });

    // Clear previous header row children and append in required order
    while (row.firstChild) row.removeChild(row.firstChild);
    wanted.forEach(w => row.appendChild(w));
  }

  function normalizeAll(){
    document.querySelectorAll('.hrm-card, [data-hrm-card], #hrm-rsc, #hrm-om, #hrm-container').forEach(standardizeHeaderForCard);
  }

  // Run on load and whenever sheets are rebuilt
  document.addEventListener('DOMContentLoaded', normalizeAll);
  // Also observe DOM mutations to re-run when a sheet is rendered
  const mo = new MutationObserver((muts)=>{
    let should = false;
    for (const m of muts){
      if (m.addedNodes && m.addedNodes.length) { should = true; break; }
    }
    if (should) normalizeAll();
  });
  mo.observe(document.documentElement, {childList:true, subtree:true});
})();
// ========= end HRM Header Normalizer =========
