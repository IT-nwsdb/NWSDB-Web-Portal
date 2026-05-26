/* ===========================
   app2.js (updated)
   - Photo Gallery system (public + private map popups)
   - Public Landing Map (Leaflet) + observer
   - Landing charts (lazy init) + KPIs
   - Navigation + routing helpers
   - HRM RSC(C) sheet builder
   =========================== */

/* ===========================
   Safe helpers + fallbacks
   =========================== */
(function ensureHelpers() {
  // Simple $ helper fallback (by id)
  if (typeof window.$ !== 'function') {
    window.$ = function $(id) { return document.getElementById(id); };
  }

  // CHART registry fallback
  if (typeof window.CHARTS === 'undefined') {
    window.CHARTS = {};
  }

  // formatRegionName fallback
  if (typeof window.formatRegionName !== 'function') {
    window.formatRegionName = function(r) { return r || ''; };
  }

  // showToast fallback
  if (typeof window.showToast !== 'function') {
    window.showToast = function(msg, type = 'info') {
      console[type === 'danger' ? 'error' : type === 'warning' ? 'warn' : 'log']('[Toast]', msg);
    };
  }

  // toDate fallback
  if (typeof window.toDate !== 'function') {
    window.toDate = function(v) {
      if (!v) return null;
      const d = (v instanceof Date) ? v : new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };
  }

  // Reduced motion pref + Chart sync
  if (typeof window.prefersReducedMotion !== 'function') {
    window.prefersReducedMotion = function() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };
  }

  if (typeof window.chartsAvailable !== 'function') {
    window.chartsAvailable = function() { return typeof window.Chart !== 'undefined'; };
  }

  if (typeof window.ensureChartJs !== 'function') {
    window.ensureChartJs = async function() {
      return typeof window.Chart !== 'undefined';
    };
  }

  if (typeof window.syncChartMotionPref !== 'function') {
    window.syncChartMotionPref = function() {
      if (!window.Chart) return;
      const reduce = window.prefersReducedMotion();
      Chart.defaults.animation = Chart.defaults.animation || {};
      Chart.defaults.animation.duration = reduce ? 0 : 400;
    };
  }

  // Ensure globals for the public map and gallery exist (HTML already seeds these, but keep safe)
  if (typeof window.PUBLIC_PLANT_MAP === 'undefined') window.PUBLIC_PLANT_MAP = null;
  if (typeof window.PUBLIC_PLANT_MARKERS === 'undefined') window.PUBLIC_PLANT_MARKERS = [];
  if (typeof window.CURRENT_GALLERY === 'undefined') {
    window.CURRENT_GALLERY = { plantMeta: { region: null, location: null }, photos: [], currentIndex: 0 };
  }
})();

/* ===========================
   Photo Gallery System
   =========================== */
function initPhotoGallery() {
  console.log('Initializing photo gallery system...');

  // Delegated click handling for popup images and 'View All Photos' buttons
  document.addEventListener('click', function(e) {
    // Click on individual photo in map popup
    if (e.target.classList?.contains('plant-popup-photo')) {
      const region = e.target.getAttribute('data-region');
      const location = e.target.getAttribute('data-location');
      const photoIndex = parseInt(e.target.getAttribute('data-index'), 10) || 0;
      openPhotoGallery({ region, location }, photoIndex);
      return;
    }

    // Click on "View All Photos" button (direct or ancestor)
    const btn = e.target.classList?.contains('view-all-photos-btn') ? e.target : e.target.closest?.('.view-all-photos-btn');
    if (btn) {
      const region = btn.getAttribute('data-region');
      const location = btn.getAttribute('data-location');
      openPhotoGallery({ region, location }, 0);
      return;
    }
  });

  // Gallery navigation
  const prevBtn = document.getElementById('prevPhotoBtn');
  const nextBtn = document.getElementById('nextPhotoBtn');
  if (prevBtn) prevBtn.addEventListener('click', showPreviousPhoto);
  if (nextBtn) nextBtn.addEventListener('click', showNextPhoto);

  console.log('Photo gallery system initialized');
}

function openPhotoGallery(plantMeta, startIndex = 0) {
  try {
    const plantRecords = (typeof window.getPublicPlantRecords === 'function') ? window.getPublicPlantRecords() : [];
    const plant = plantRecords.find(p => p.region === plantMeta.region && p.location === plantMeta.location);

    if (!plant) {
      console.warn('Plant not found for gallery:', plantMeta);
      showToast('Plant data not found', 'warning');
      return;
    }

    if (!plant.photos || !plant.photos.length) {
      showToast('No photos found for this plant', 'warning');
      return;
    }

    window.CURRENT_GALLERY = {
      plantMeta,
      photos: plant.photos,
      currentIndex: Math.min(startIndex, plant.photos.length - 1)
    };

    updateGalleryDisplay();

    // Show modal
    const modalEl = document.getElementById('photoGalleryModal');
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  } catch (err) {
    console.error('openPhotoGallery error:', err);
  }
}

function safeFilename(s) {
  return String(s).replace(/[^\w.-]+/g, '_').slice(0, 80);
}

function updateGalleryDisplay() {
  const { photos, currentIndex, plantMeta } = window.CURRENT_GALLERY || {};
  if (!Array.isArray(photos) || photos.length === 0) {
    showToast('No photos available', 'warning');
    return;
  }

  const mainPhoto = document.getElementById('galleryMainPhoto');
  const currentPhoto = photos[currentIndex];

  if (mainPhoto && currentPhoto) {
    mainPhoto.onerror = function() {
      console.warn('Failed to load photo:', this.src);
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
      showToast('Failed to load photo', 'warning');
    };
    mainPhoto.onload = function() {};
    mainPhoto.src = currentPhoto;
    mainPhoto.alt = `Plant photo ${currentIndex + 1}`;
  }

  const photoInfo = document.getElementById('currentPhotoInfo');
  if (photoInfo) {
    const regionName = window.formatRegionName ? window.formatRegionName(plantMeta.region) : plantMeta.region;
    photoInfo.textContent = `${regionName} — ${plantMeta.location} • Photo ${currentIndex + 1} of ${photos.length}`;
  }

  const photoCounter = document.getElementById('photoCounter');
  if (photoCounter) {
    photoCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
  }

  const downloadBtn = document.getElementById('downloadPhotoBtn');
  if (downloadBtn && currentPhoto) {
    downloadBtn.href = currentPhoto;
    downloadBtn.download = `plant_${safeFilename(plantMeta.region)}_${safeFilename(plantMeta.location)}_${currentIndex + 1}.jpg`;
  }

  updateThumbnails();

  const prevBtn = document.getElementById('prevPhotoBtn');
  const nextBtn = document.getElementById('nextPhotoBtn');
  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) nextBtn.disabled = currentIndex === photos.length - 1;
}

function updateThumbnails() {
  const { photos, currentIndex } = window.CURRENT_GALLERY || {};
  const container = document.getElementById('photoThumbnails');
  if (!container || !photos) return;

  container.innerHTML = '';
  photos.forEach((photo, index) => {
    const thumb = document.createElement('div');
    thumb.className = `photo-thumb ${index === currentIndex ? 'active' : ''}`;

    const img = document.createElement('img');
    img.src = photo;
    img.alt = `Thumb ${index + 1}`;
    img.setAttribute('data-index', index);
    img.onerror = function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGh1bWI8L3RleHQ+PC9zdmc+';
    };

    thumb.addEventListener('click', () => {
      window.CURRENT_GALLERY.currentIndex = index;
      updateGalleryDisplay();
    });

    thumb.appendChild(img);
    container.appendChild(thumb);
  });
}

function showPreviousPhoto() {
  if (!window.CURRENT_GALLERY) return;
  if (window.CURRENT_GALLERY.currentIndex > 0) {
    window.CURRENT_GALLERY.currentIndex--;
    updateGalleryDisplay();
  }
}

function showNextPhoto() {
  if (!window.CURRENT_GALLERY) return;
  if (window.CURRENT_GALLERY.currentIndex < window.CURRENT_GALLERY.photos.length - 1) {
    window.CURRENT_GALLERY.currentIndex++;
    updateGalleryDisplay();
  }
}

/* ===========================
   Public Landing Map (Leaflet)
   =========================== */

// Read plant records from localStorage (public dataset)
window.getPublicPlantRecords = function() {
  const arr = window.lsAll ? window.lsAll('nwsdb:plant:') : [];
  const parseNum = window.parseNum || (v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  });
  return arr
    .filter(p => {
      const lat = parseNum(p?.lat);
      const lng = parseNum(p?.lng);
      return lat != null && lng != null && !isNaN(lat) && !isNaN(lng);
    })
    .map(p => ({
      region: p.region,
      location: p.location,
      lat: parseNum(p.lat),
      lng: parseNum(p.lng),
      treatmentType: p.treatmentType || '',
      designedCapacity: p.designedCapacity ?? null,
      operationalCapacity: p.operationalCapacity ?? null,
      photos: Array.isArray(p.photoUrls) && p.photoUrls.length ? p.photoUrls
             : (Array.isArray(p.photosInline) ? p.photosInline.map(x => x?.dataUrl).filter(Boolean) : [])
    }));
};

window.initPublicPlantMap = async function(){ /* map removed */ return; };

window.addPublicPlantMarkers = function(){ /* map removed */ return; };

window.plantPopupHTMLPublic = function(){ return ''; };

function clearPublicPlantMarkers(){ /* map removed */ }

window.initLandingPageMap = function(){ /* map removed */ };

// Observer + retry logic for landing page map
window.initPublicMapObserverWithRetry = function(){ /* map removed */ };

/* ===========================
   Landing: Chart lazy init when in viewport
   =========================== */
function initLandingChartObserver() {
  const containers = document.querySelectorAll('#landing-page .chart-container');
  if (!containers.length) return;

  const io = new IntersectionObserver(async (entries, obs) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const ok = await window.ensureChartJs();
      if (ok) {
        initLandingCharts();
      } else {
        $('lp-charts-unavailable')?.classList.remove('d-none');
      }
      obs.unobserve(e.target);
    }
  }, { rootMargin: '200px' });

  containers.forEach(c => io.observe(c));
}

/* ===========================
   Landing: KPIs + Charts
   =========================== */
function getAllRecords(dataset) {
  if (typeof lsAll !== 'function') return [];
  if (dataset === 'scheme') {
    const ext = lsAll('nwsdb:extended:') || [];
    return ext.map(e => {
      const connTotal = Array.isArray(e.connections) ? e.connections.reduce((s, c) => s + (Number(c.count) || 0), 0) : 0;
      const growthFilled = e.growth ? Object.values(e.growth).filter(v => v != null).length : 0;
      const expCount = Array.isArray(e.expenditures) ? e.expenditures.length : 0;
      return { ...e, type: 'scheme', connTotal, growthFilled, expCount };
    });
  }
  if (dataset === 'plant') {
    const arr = lsAll('nwsdb:plant:') || [];
    return arr.map(p => ({
      ...p,
      type: 'plant',
      photosCount: Array.isArray(p.photoUrls) ? p.photoUrls.length : (Array.isArray(p.photosInline) ? p.photosInline.length : 0)
    }));
  }
  if (dataset === 'labs') {
    const arr = lsAll('nwsdb:labs:') || [];
    return arr.map(l => ({ ...l, type: 'labs' }));
  }
  return [];
}

function computeLandingStats() {
  const schemes = getAllRecords('scheme');
  const plants  = getAllRecords('plant');
  const labs    = getAllRecords('labs');

  const total = schemes.length + plants.length + labs.length;

  // Monthly submissions (last 6 months)
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, label: d.toLocaleString(undefined, { month: 'short' }) });
  }
  const all = [...schemes, ...plants, ...labs];
  const monthlyCounts = months.map(m => {
    const c = all.filter(r => {
      const dt = toDate(r.submittedAt);
      if (!dt) return false;
      const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
      return key === m.key;
    }).length;
    return c;
  });

  // Region coverage across datasets
  const byRegion = {};
  all.forEach(r => {
    const reg = r.region || 'UNKNOWN';
    byRegion[reg] = (byRegion[reg] || 0) + 1;
  });

  // Fallback static values if no data
  const fallback = (arr, val, n) => (arr.every(v => v === 0) ? Array(n).fill(val) : arr);

  return {
    counts: {
      total,
      schemes: schemes.length,
      plants: plants.length,
      labs: labs.length
    },
    share: {
      labels: ['Schemes', 'Plants', 'Labs'],
      data: [
        schemes.length || 3,
        plants.length  || 2,
        labs.length    || 1
      ]
    },
    monthly: {
      labels: months.map(m => m.label),
      data: fallback(monthlyCounts, 2, months.length)
    },
    regions: {
      labels: Object.keys(byRegion).length ? Object.keys(byRegion).map(r => (window.formatRegionName ? window.formatRegionName(r) : r)) : ['Central East','Central North','Central South','Matale'],
      data: Object.keys(byRegion).length ? Object.values(byRegion) : [4,3,5,2]
    }
  };
}

function initLandingCharts() {
  const chartsUnavailable = $('lp-charts-unavailable');
  if (!chartsAvailable()) {
    if (chartsUnavailable) chartsUnavailable.classList.remove('d-none');
    return;
  }
  if (chartsUnavailable) chartsUnavailable.classList.add('d-none');

  // Respect reduced motion in charts
  syncChartMotionPref();

  const stats = computeLandingStats();
  const palette = ['#0d6efd','#20c997','#6f42c1','#ffc107','#dc3545','#198754'];

  // Share (pie)
  const shareCtx = $('lp-chart-share');
  if (shareCtx) {
    if (CHARTS.landingShare) CHARTS.landingShare.destroy();
    CHARTS.landingShare = new Chart(shareCtx, {
      type: 'pie',
      data: {
        labels: stats.share.labels,
        datasets: [{ data: stats.share.data, backgroundColor: palette }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }

  // Monthly (line)
  const monthlyCtx = $('lp-chart-monthly');
  if (monthlyCtx) {
    if (CHARTS.landingMonthly) CHARTS.landingMonthly.destroy();
    CHARTS.landingMonthly = new Chart(monthlyCtx, {
      type: 'line',
      data: {
        labels: stats.monthly.labels,
        datasets: [{
          label: 'Submissions',
          data: stats.monthly.data,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,.15)',
          tension: .3,
          fill: true
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  }

  // Regions (bar)
  const regionCtx = $('lp-chart-region');
  if (regionCtx) {
    if (CHARTS.landingRegion) CHARTS.landingRegion.destroy();
    CHARTS.landingRegion = new Chart(regionCtx, {
      type: 'bar',
      data: {
        labels: stats.regions.labels,
        datasets: [{
          label: 'Submissions',
          data: stats.regions.data,
          backgroundColor: '#20c997'
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });
  }

  // KPIs
  const { total, schemes, plants, labs } = stats.counts;
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('lp-kpi-total', total || (3+2+1));
  set('lp-kpi-scheme', schemes || 3);
  set('lp-kpi-plant', plants || 2);
  set('lp-kpi-labs', labs || 1);
}

/* ===========================
   Navigation + routing
   =========================== */
function setActiveNav(selector) {
  const navbars = document.querySelectorAll('.navbar');
  let link = null, navbar = null;

  for (const nb of navbars) {
    const el = nb.querySelector(selector);
    if (el) {
      link = el.classList.contains('nav-link') ? el : el.closest('.nav-link');
      navbar = nb;
      break;
    }
  }
  if (!link || !navbar) return;

  navbar.querySelectorAll('.nav-link').forEach(l => {
    l.classList.remove('active');
    l.removeAttribute('aria-current');
  });

  link.classList.add('active');
  link.setAttribute('aria-current', 'page');
}

function updateSkipAndFocus(pageId) {
  const skip = document.querySelector('.skip-link');
  if (!skip) return;
  const page = document.getElementById(pageId);
  if (!page) return;
  let main = page.querySelector('[role="main"]') || page.querySelector('.container') || page;
  if (!main.id) main.id = 'main-content';
  skip.setAttribute('href', `#${main.id}`);

  const heading = page.querySelector('.dashboard-header h1, h1');
  if (heading) {
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    try { heading.focus({ preventScroll: true }); } catch(_) { heading.focus(); }
    if (prefersReducedMotion()) heading.scrollIntoView();
    else heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function togglePage(pageId) {
  const pages = [
    'home-page', 'about-page', 'contact-page',
    'data-entry-page', 'labs-entry-page', 'plant-entry-page',
    'submissions-page', 'admin-page',
    'map-page',
    'hrm-page', 'hrm-rsc-page', 'hrm-kcwtp-page', 'hrm-ce-nrw-page'
  ];
  pages.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const show = (id === pageId);
    el.style.display = show ? 'block' : 'none';
    if (show) el.removeAttribute('aria-hidden');
    else el.setAttribute('aria-hidden', 'true');
    try { el.inert = !show; } catch(_) {}
  });

  const footer = document.querySelector('footer');
  if (footer) {
    const hide = (pageId === 'data-entry-page' || pageId === 'labs-entry-page' || pageId === 'plant-entry-page');
    footer.style.display = hide ? 'none' : 'block';
  }

  updateSkipAndFocus(pageId);
}

function showHomePage() {
  if (typeof isLoggedIn === 'function' && isLoggedIn()) {
    togglePage('home-page');
    setActiveNav('[onclick="showHomePage()"]');
  } else {
    togglePage('landing-page'); // harmless if not in list
    setActiveNav('[onclick="showHomePage()"]');
    // Reinitialize public map when showing landing page
    setTimeout(window.initLandingPageMap, 100);
  }
}
function showAboutPage() {
  togglePage('about-page');
  setActiveNav('[onclick="showAboutPage()"]');
}
function showContactPage() {
  togglePage('contact-page');
  setActiveNav('[onclick="showContactPage()"]');
}
function showHRMPage() {
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) { 
    if (typeof showLoginPrompt === 'function') showLoginPrompt({ adminTab: false });
    return; 
  }
  togglePage('hrm-page');
  // No dedicated navbar icon; skip setActiveNav
}

function showLoginPrompt(opts = { adminTab: false }) {
  const modalEl = $('loginModal');
  if (!modalEl) return;
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();

  if (opts.adminTab) {
    const adminTabBtn = document.getElementById('admin-tab');
    if (adminTabBtn) {
      setTimeout(() => bootstrap.Tab.getOrCreateInstance(adminTabBtn).show(), 60);
    }
  }
}

// Always-prompt Admin login flow
let adminPromptActive = false;

function showAdminPrompt() {
  const modalEl = document.getElementById('loginModal');
  if (!modalEl) return;

  adminPromptActive = true;

  // Hide user tab + pane so only admin credentials are visible
  const userTab = document.getElementById('user-tab');
  const userPane = document.getElementById('user-login');
  const adminTabBtn = document.getElementById('admin-tab');

  userTab?.classList.add('d-none');
  userPane?.classList.add('d-none');

  // Show modal and switch to Admin tab
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
  if (adminTabBtn) {
    setTimeout(() => bootstrap.Tab.getOrCreateInstance(adminTabBtn).show(), 50);
  }

  // Restore the user tab/pane once modal closes
  const restore = () => {
    if (!adminPromptActive) return;
    userTab?.classList.remove('d-none');
    userPane?.classList.remove('d-none');
    adminPromptActive = false;
    modalEl.removeEventListener('hidden.bs.modal', restore);
  };
  modalEl.addEventListener('hidden.bs.modal', restore);
}
window.showAdminPrompt = showAdminPrompt;

/* ===========================
   Access Control (Main Login)
   - RSC: full access (current behaviour)
   - Regional: locked to own region (no region dropdowns)
   =========================== */
function applyAccessControlUI() {
  try {
    const isRegional = (typeof window.isRegionalUser === 'function') ? window.isRegionalUser() : false;
    const lockedRegion = (typeof window.getUserRegion === 'function') ? window.getUserRegion() : '';

    const schemeWrap = document.getElementById('schemeDropdownWrap');
    const labsWrap = document.getElementById('labsDropdownWrap');
    const schemeAddBtn = document.getElementById('schemeAddDataBtn');
    const labsAddBtn = document.getElementById('labsAddDataBtn');

    if (isRegional && lockedRegion) {
      // Hide region dropdowns
      if (schemeWrap) schemeWrap.classList.add('d-none');
      if (labsWrap) labsWrap.classList.add('d-none');

      // Show ADD Data buttons
      if (schemeAddBtn) {
        schemeAddBtn.classList.remove('d-none');
        schemeAddBtn.onclick = () => {
          try { typeof window.renderRegionPanel === 'function' && window.renderRegionPanel('scheme', lockedRegion); } catch (_) {}
        };
      }
      if (labsAddBtn) {
        labsAddBtn.classList.remove('d-none');
        labsAddBtn.onclick = () => {
          try { typeof window.renderRegionPanel === 'function' && window.renderRegionPanel('labs', lockedRegion); } catch (_) {}
        };
      }
    } else {
      // RSC (default)
      if (schemeWrap) schemeWrap.classList.remove('d-none');
      if (labsWrap) labsWrap.classList.remove('d-none');
      if (schemeAddBtn) schemeAddBtn.classList.add('d-none');
      if (labsAddBtn) labsAddBtn.classList.add('d-none');
    }
  } catch (error) {
    console.warn('applyAccessControlUI failed:', error);
  }
}
window.applyAccessControlUI = applyAccessControlUI;

function wireLoginScopeToggle() {
  try {
    const scopeSel = document.getElementById('loginScope');
    const emailWrap = document.getElementById('loginEmailWrap');
    const userWrap = document.getElementById('loginUsernameWrap');
    const emailInput = document.getElementById('email');
    const userInput = document.getElementById('loginUsername');

    if (!scopeSel) return;

    const sync = () => {
      const scope = String(scopeSel.value || 'RSC').toUpperCase();
      const isRSC = scope === 'RSC';

      // Toggle field visibility
      if (emailWrap) emailWrap.classList.toggle('d-none', !isRSC);
      if (userWrap) userWrap.classList.toggle('d-none', isRSC);

      // Toggle required validations
      if (emailInput) {
        emailInput.required = isRSC;
        emailInput.type = isRSC ? 'email' : 'text';
        if (!isRSC) emailInput.value = '';
      }
      if (userInput) {
        userInput.required = !isRSC;
        if (isRSC) userInput.value = '';
      }
    };

    if (!scopeSel.dataset.bound) {
      scopeSel.dataset.bound = '1';
      scopeSel.addEventListener('change', sync);
    }
    sync();
  } catch (e) {
    console.warn('wireLoginScopeToggle failed:', e);
  }
}
window.wireLoginScopeToggle = wireLoginScopeToggle;


async function showSubmissionsPage() {
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
    showLoginPrompt();
    return;
  }
  togglePage('submissions-page');
  setActiveNav('[onclick="showSubmissionsPage()"]');
  try { typeof initSubmissionsIfNeeded === 'function' && initSubmissionsIfNeeded(); } catch(_){}
  const ok = await window.ensureChartJs();
  if (!ok) $('charts-unavailable')?.classList.remove('d-none');
  try { typeof syncAllFromCloudToLS === 'function' && await syncAllFromCloudToLS(); } catch(_){}
  try { typeof renderSubmissions === 'function' && renderSubmissions(); } catch(_){}
}
window.showSubmissionsPage = showSubmissionsPage;

/* ===========================
   HRM RSC(C) Page Functions
   =========================== */
function showHRMRSCPage() {
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) { 
    showLoginPrompt({ adminTab: false }); 
    return; 
  }
  togglePage('hrm-rsc-page');
  setTimeout(buildRSCTemplate, 100);
}


// Build a dropdown for the RSC designation column
function buildRSCDesignationOptions(list, selectedName) {
  const opts = list.map(d => {
    const sel = (d === selectedName) ? ' selected' : '';
    return `<option value="${d.replace(/"/g, '&quot;')}"${sel}>${d}</option>`;
  }).join('');
  return `<select class="form-select form-select-sm hrm-rsc-designation">${opts}</select>`;
}
function buildRSCTemplate() {
  const table = document.getElementById('hrm-rsc-table');
  if (!table) return;

  // Clear existing content
  table.innerHTML = '';

  // Get input values for dynamic title
  const region = document.getElementById('hrm-rsc-region-input')?.value || '[Region Name]';
  const zone = document.getElementById('hrm-rsc-zone-input')?.value || '[Zone Name]';
  const connections = document.getElementById('hrm-rsc-connections-input')?.value || '';
  const capacity = document.getElementById('hrm-rsc-capacity-input')?.value || '';

  // Designations array (46 items)
  const designations = [
    "DGM ( C )", "AGM (Development)", "AGM (O&M )", "CE (Civil)", "CE - (M&E)", 
    "Manager (Commercial)", "Manager (HR)", "Chief Accountant", "Engineer- (Civil)", 
    "Engineer- (Electrical)", "Engineer- (Mechanical)", "Engineer - (Electronic)", 
    "Hydrogeologist", "Quantity Surveyor", "D.O.A (Drawing Office Assistant)", 
    "Draughtsman", "Internal Auditor", "EA - (Civil)", "EA - (Mechanical)", 
    "EA - (Electrical)", "EA - (Mechanical) GW", "EA - (Electronic)", "Sociologist", 
    "Land Acquisition Officer", "Training Officer", "Human Resourse Officer", 
    "Human Resourse Officer (Investigation)", "Accountant (Payment)", 
    "Accountant (Costing)", "Supplies Officer", "Asset Officer", "Personal Secretary", 
    "MA (Supra) Accounts", "MA (Suppra) Audit", "MA (Supra) HR", "MA (HR)", 
    "MA (Accounts)", "MA (Stores)", "MA - (Accounts) - Costing", "MA (Cashier)", 
    "Drivers", "Fitter", "W0RK Supervisor", "Drillers", "Labourer (Office Assistant)", 
    "Carpenter"
  ];

  let tableHTML = '';

  // Row 1: Main Title (merged A1:M1)
  tableHTML += `
    <tr>
      <th colspan="13" id="hrm-rsc-title">
        RSC : ${region}<br>
        Manager Zone : ${zone}<br>
        ${connections ? 'No: of Connection: ' + connections + '<br>' : ''}
        ${capacity ? 'Plant Capacity : ' + capacity : ''}
      </th>
    </tr>
  `;

  // Row 2: Empty row for spacing
  tableHTML += `<tr><td colspan="13" style="height: 10px;"></td></tr>`;

  // Row 3: Main Headers
  tableHTML += `
    <tr>
      <th rowspan="2" class="hrm-col-small">No.</th>
      <th rowspan="2" class="hrm-col-med">Designation</th>
      <th rowspan="2" class="hrm-col-small">2011 approved<br>Cadre (A)</th>
      <th colspan="3">Nos. Available</th>
      <th rowspan="2" class="hrm-col-small">Total Available<br>Staff<br>(E = B+C+D)</th>
      <th colspan="3">For New Cadre (2025 onwards)</th>
      <th rowspan="2" class="hrm-col-small">Vacancies to be<br>Filled<br>(I = H - E)</th>
      <th rowspan="2" class="hrm-col-med">Remarks</th>
      <th rowspan="2" class="hrm-col-med">Justification for Additional<br>Proposed Staff</th>
    </tr>
  `;

  // Row 4: Sub-headers
  tableHTML += `
    <tr>
      <th class="hrm-col-small">In Permanent<br>(B)</th>
      <th class="hrm-col-small">In Acting<br>(C)</th>
      <th class="hrm-col-small">In Manpower<br>Contract (D)</th>
      <th class="hrm-col-small">Total Nos.<br>Proposed for<br>Permanent (F)</th>
      <th class="hrm-col-small">Total Nos.<br>Proposed for<br>Manpower (G)</th>
      <th class="hrm-col-small">Total Proposed<br>Staff<br>(H = F+G)</th>
    </tr>
  `;

  // Data Rows (5-50)
  for (let i = 0; i < designations.length; i++) {
    const rowNum = i + 5;
    const designation = designations[i];
    const serialNo = String(i + 1).padStart(2, '0');

    tableHTML += `
      <tr>
        <td class="hrm-num hrm-readonly">${serialNo}</td>
        <td class="text-start">${buildRSCDesignationOptions(designations, designation)}</td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="C" data-row="${rowNum}" min="0"></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="D" data-row="${rowNum}" min="0"></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="E" data-row="${rowNum}" min="0"></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="F" data-row="${rowNum}" min="0"></td>
        <td class="hrm-num hrm-readonly" id="total-available-${rowNum}">0</td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="H" data-row="${rowNum}" min="0"></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="I" data-row="${rowNum}" min="0"></td>
        <td class="hrm-num hrm-readonly" id="total-proposed-${rowNum}">0</td>
        <td class="hrm-num hrm-readonly" id="vacancies-${rowNum}">0</td>
        <td><input type="text" class="form-control form-control-sm hrm-input" data-col="L" data-row="${rowNum}"></td>
        <td><input type="text" class="form-control form-control-sm hrm-input" data-col="M" data-row="${rowNum}"></td>
      </tr>
    `;
  }

  // Total Row (51)
  tableHTML += `
    <tr class="hrm-total-row">
      <th colspan="2">Total</th>
      <th class="hrm-num" id="total-C">0</th>
      <th class="hrm-num" id="total-D">0</th>
      <th class="hrm-num" id="total-E">0</th>
      <th class="hrm-num" id="total-F">0</th>
      <th class="hrm-num" id="total-G">0</th>
      <th class="hrm-num" id="total-H">0</th>
      <th class="hrm-num" id="total-I">0</th>
      <th class="hrm-num" id="total-J">0</th>
      <th class="hrm-num" id="total-K">0</th>
      <td colspan="2"></td>
    </tr>
  `;

  table.innerHTML = tableHTML;

  // Add event listeners for calculations
  
// Ensure Save/Clear buttons exist and wire events
function setupRSCActionBar() {
  const header = document.querySelector('#hrm-rsc-main .mb-3');
  if (!header) return;
  if (!document.getElementById('hrm-rsc-save')) {
    const btns = document.createElement('div');
    btns.className = 'd-flex gap-2 ms-auto';
    btns.innerHTML = `<button type="button" class="btn btn-outline-secondary" id="hrm-rsc-clear"><i class="fa-solid fa-eraser me-1"></i> Clear</button>
      <button type="button" class="btn btn-success" id="hrm-rsc-save"><i class="fa-solid fa-floppy-disk me-1"></i> Save</button>`;
    header.appendChild(btns);
  }
  document.getElementById('hrm-rsc-clear')?.addEventListener('click', () => {
    document.querySelectorAll('#hrm-rsc-table .hrm-input').forEach(inp => { inp.value=''; });
    document.querySelectorAll('#hrm-rsc-table select.hrm-rsc-designation').forEach(sel => { /* keep existing option */ });
    // Reset calculated cells
    for (let row = 5; row <= 50; row++) {
      const ids = [`total-available-${row}`, `total-proposed-${row}`, `vacancies-${row}`];
      ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent='0';});
    }
    // Reset totals
    ['C','D','E','F','G','H','I','J','K'].forEach(col => {
      const el = document.getElementById(`total-${col}`); if (el) el.textContent='0';
    });
  });
  document.getElementById('hrm-rsc-save')?.addEventListener('click', async () => {
    try {
      await saveRSCSheetToCloud();
    } catch (e) {
      console.error('RSC save failed:', e);
      if (typeof showToast === 'function') showToast('Failed to save RSC sheet', 'danger');
    }
  });
}

function rscValNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

function collectRSCPayload() {
  const meta = {
    region: document.getElementById('hrm-rsc-region-input')?.value?.trim() || '',
    zone: document.getElementById('hrm-rsc-zone-input')?.value?.trim() || '',
    connections: document.getElementById('hrm-rsc-connections-input')?.value?.trim() || '',
    capacity: document.getElementById('hrm-rsc-capacity-input')?.value?.trim() || ''
  };
  const rows = [];
  const designSel = Array.from(document.querySelectorAll('#hrm-rsc-table select.hrm-rsc-designation'));
  for (let i = 0; i < designSel.length; i++) {
    const rowNum = i + 5;
    const name = designSel[i]?.value?.trim() || '';
    const C = rscValNum(document.querySelector(`.hrm-input[data-col="C"][data-row="${rowNum}"]`)?.value);
    const D = rscValNum(document.querySelector(`.hrm-input[data-col="D"][data-row="${rowNum}"]`)?.value);
    const E = rscValNum(document.querySelector(`.hrm-input[data-col="E"][data-row="${rowNum}"]`)?.value);
    const F = rscValNum(document.querySelector(`.hrm-input[data-col="F"][data-row="${rowNum}"]`)?.value);
    const G = rscValNum(document.getElementById(`total-available-${rowNum}`)?.textContent);
    const H = rscValNum(document.querySelector(`.hrm-input[data-col="Hc"][data-row="${rowNum}"]`)?.value) || rscValNum(document.querySelector(`.hrm-input[data-col="H"][data-row="${rowNum}"]`)?.value);
    const I = rscValNum(document.querySelector(`.hrm-input[data-col="I"][data-row="${rowNum}"]`)?.value);
    const J = rscValNum(document.getElementById(`total-proposed-${rowNum}`)?.textContent);
    const K = rscValNum(document.getElementById(`vacancies-${rowNum}`)?.textContent);
    const L = document.querySelector(`.hrm-input[data-col="L"][data-row="${rowNum}"]`)?.value?.trim() || '';
    const M = document.querySelector(`.hrm-input[data-col="M"][data-row="${rowNum}"]`)?.value?.trim() || '';
    rows.push({ name, C,D,E,F,G,H,I,J,K,L,M });
  }
  const totals = {};
  ['C','D','E','F','G','H','I','J','K'].forEach(col => {
    totals[col] = rscValNum(document.getElementById(`total-${col}`)?.textContent);
  });
  return { sheetKey: 'RSC(C)', meta, rows, totals, updatedAt: new Date().toISOString() };
}

async function saveRSCSheetToCloud() {
  try {
    if (!window.FB || !window.FB.mod) {
      await window.initFirebase?.();
    }
    await window.ensureOnlineAuth?.();

    const payload = collectRSCPayload();
    const { fsMod } = FB.mod;
    const ref = fsMod.doc(FB.db, 'hrmSheets', 'RSC(C)');
    await fsMod.setDoc(ref, payload, { merge: true });

    if (typeof waitForServerCommit === 'function') {
      try { await waitForServerCommit(4000); } catch(_) {}
    }
    if (typeof showToast === 'function') showToast('RSC sheet saved successfully!', 'success');
  } catch (e) {
    console.warn('RSC cloud save failed, caching locally', e);
    try {
      localStorage.setItem('nwsdb:hrm:RSC(C)', JSON.stringify(collectRSCPayload()));
      if (typeof showToast === 'function') showToast('Saved locally (offline). Will sync when online.', 'warning');
    } catch (err) {
      console.error('RSC local save failed:', err);
      if (typeof showToast === 'function') showToast('Save failed.', 'danger');
    }
  }
}

async function loadRSCSheetFromCloud() {
  const hydrate = (data) => {
    try {
      if (data?.meta) {
        const m = data.meta;
        const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
        setVal('hrm-rsc-region-input', m.region);
        setVal('hrm-rsc-zone-input', m.zone);
        setVal('hrm-rsc-connections-input', m.connections);
        setVal('hrm-rsc-capacity-input', m.capacity);
      }
      if (Array.isArray(data?.rows)) {
        data.rows.forEach((r, i) => {
          const rowNum = i + 5;
          const set = (sel, v) => { const el = document.querySelector(sel); if (el) el.value = String(v ?? ''); };
          // designation
          const s = document.querySelectorAll('#hrm-rsc-table select.hrm-rsc-designation')[i];
          if (s) s.value = r.name || s.value;
          // numeric inputs
          set(`.hrm-input[data-col="C"][data-row="${rowNum}"]`, r.C);
          set(`.hrm-input[data-col="D"][data-row="${rowNum}"]`, r.D);
          set(`.hrm-input[data-col="E"][data-row="${rowNum}"]`, r.E);
          set(`.hrm-input[data-col="F"][data-row="${rowNum}"]`, r.F);
          set(`.hrm-input[data-col="H"][data-row="${rowNum}"]`, r.H);
          set(`.hrm-input[data-col="I"][data-row="${rowNum}"]`, r.I);
          set(`.hrm-input[data-col="L"][data-row="${rowNum}"]`, r.L);
          set(`.hrm-input[data-col="M"][data-row="${rowNum}"]`, r.M);
          // calculated cells
          const ta = document.getElementById(`total-available-${rowNum}`);
          const tp = document.getElementById(`total-proposed-${rowNum}`);
          const vac = document.getElementById(`vacancies-${rowNum}`);
          if (ta) ta.textContent = String(r.G ?? 0);
          if (tp) tp.textContent = String(r.J ?? 0);
          if (vac) vac.textContent = String(r.K ?? 0);
        });
        // refresh totals
        if (typeof calculateHRMTotal === 'function') calculateHRMTotal();
      }
    } catch (err) {
      console.error('RSC hydrate failed:', err);
    }
  };

  // Try cloud first
  try {
    if (!window.FB || !window.FB.mod) {
      await window.initFirebase?.();
    }
    const { fsMod } = FB.mod;
    const ref = fsMod.doc(FB.db, 'hrmSheets', 'RSC(C)');
    const snap = await fsMod.getDoc(ref);
    if (snap.exists()) {
      hydrate(snap.data());
      if (typeof showToast === 'function') showToast('Loaded RSC from cloud.', 'info');
      return;
    }
  } catch (e) {
    console.warn('RSC cloud load failed, trying local', e);
  }
  // Local
  try {
    const raw = localStorage.getItem('nwsdb:hrm:RSC(C)');
    if (raw) hydrate(JSON.parse(raw));
  } catch (_) {}
}
attachHRMCalculations();
}

function attachHRMCalculations() {
  // Add input event listeners to all number inputs
  document.querySelectorAll('.hrm-input[type="number"]').forEach(input => {
    input.addEventListener('input', calculateHRMRow);
  });

  // Title inputs for dynamic title updates
  ['hrm-rsc-region-input', 'hrm-rsc-zone-input', 'hrm-rsc-connections-input', 'hrm-rsc-capacity-input'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.addEventListener('input', updateHRMTitle);
  });
}

function calculateHRMRow() {
  const input = this;
  const row = input.getAttribute('data-row');
  if (!row) return;

  const dVal = parseFloat(document.querySelector(`.hrm-input[data-col="D"][data-row="${row}"]`)?.value) || 0;
  const eVal = parseFloat(document.querySelector(`.hrm-input[data-col="E"][data-row="${row}"]`)?.value) || 0;
  const fVal = parseFloat(document.querySelector(`.hrm-input[data-col="F"][data-row="${row}"]`)?.value) || 0;
  const hVal = parseFloat(document.querySelector(`.hrm-input[data-col="H"][data-row="${row}"]`)?.value) || 0;
  const iVal = parseFloat(document.querySelector(`.hrm-input[data-col="I"][data-row="${row}"]`)?.value) || 0;

  const totalAvailable = dVal + eVal + fVal;
  const totalProposed = hVal + iVal;
  const vacancies = totalProposed - totalAvailable;

  const totalAvailableEl = document.getElementById(`total-available-${row}`);
  const totalProposedEl = document.getElementById(`total-proposed-${row}`);
  const vacanciesEl = document.getElementById(`vacancies-${row}`);

  if (totalAvailableEl) totalAvailableEl.textContent = totalAvailable;
  if (totalProposedEl) totalProposedEl.textContent = totalProposed;
  if (vacanciesEl) vacanciesEl.textContent = vacancies;

  // Update grand totals
  calculateHRMTotal();
}

function calculateHRMTotal() {
  const columns = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  
  columns.forEach(col => {
    let total = 0;
    
    if (['G', 'J', 'K'].includes(col)) {
      // Calculated columns from per-row totals (E=total-available, J=total-proposed, K=vacancies)
      for (let i = 5; i <= 50; i++) {
        const id = (col === 'G') ? `total-available-${i}` : (col === 'J') ? `total-proposed-${i}` : `vacancies-${i}`;
        const value = parseFloat(document.getElementById(id)?.textContent) || 0;
        total += value;
      }
    } else {
      // Input columns
      document.querySelectorAll(`.hrm-input[data-col="${col}"]`).forEach(input => {
        total += parseFloat(input.value) || 0;
      });
    }
    
    const totalEl = document.getElementById(`total-${col}`);
    if (totalEl) totalEl.textContent = total;
  });
}

function updateHRMTitle() {
  const region = document.getElementById('hrm-rsc-region-input')?.value || '[Region Name]';
  const zone = document.getElementById('hrm-rsc-zone-input')?.value || '[Zone Name]';
  const connections = document.getElementById('hrm-rsc-connections-input')?.value || '';
  const capacity = document.getElementById('hrm-rsc-capacity-input')?.value || '';

  const titleEl = document.getElementById('hrm-rsc-title');
  if (titleEl) {
    titleEl.innerHTML = `RSC : ${region}<br>Manager Zone : ${zone}<br>${connections ? 'No: of Connection: ' + connections + '<br>' : ''}${capacity ? 'Plant Capacity : ' + capacity : ''}`;
  }
}

window.showHRMRSCPage = showHRMRSCPage;

/* ===========================
   DOM init for landing observers
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  // Lazy init charts when any chart container intersects
  initLandingChartObserver();

  // Login scope selector (Main Login)
  try { typeof window.wireLoginScopeToggle === 'function' && window.wireLoginScopeToggle(); } catch(_) {}

  // Apply access control UI for persisted sessions
  try { typeof window.isLoggedIn === 'function' && window.isLoggedIn() && typeof window.applyAccessControlUI === 'function' && window.applyAccessControlUI(); } catch(_) {}
});
// Compact 10-column view for RSC
function compactRSCColumns(){
  const tbl = document.getElementById('hrm-rsc-table');
  if(!tbl) return;
  const hideByIncludes = (phrases) => {
    const ths = tbl.querySelectorAll('thead th');
    ths.forEach((th,idx)=>{
      const t=th.textContent.trim().toLowerCase();
      if(phrases.some(p=>t.includes(p))){
        th.style.display='none';
        // hide each body cell for this column
        tbl.querySelectorAll('tbody tr').forEach(tr=>{
          const td = tr.children[idx];
          if(td) td.style.display='none';
        });
      }
    });
  };
  hideByIncludes(["proposed for permanent", "proposed for manpower", "justification"]);
  // Turn H into input
  let hIdx=-1;
  tbl.querySelectorAll('thead th').forEach((th,idx)=>{
    if(th.textContent.toLowerCase().includes("total proposed staff")) hIdx=idx;
  });
  if(hIdx>-1){
    tbl.querySelectorAll('tbody tr').forEach(tr=>{
      const td = tr.children[hIdx];
      if(td && !td.querySelector('input')){
        const row = tr.getAttribute('data-row') || '';
        td.innerHTML = `<input type="number" class="form-control form-control-sm hrm-input" data-col="Hc" data-row="${row}">`;
      }
    });
  }
}

function renderRSCPreview(data){
  const host=document.getElementById('hrm-rsc-preview');
  if(!host) return;
  if(!data || !Array.isArray(data.rows)){ host.innerHTML=''; return; }
  const head = `<thead><tr><th>No.</th><th>Designation</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>H</th><th>I</th><th>Remarks</th></tr></thead>`;
  const body = data.rows.map((r,i)=>`<tr><td>${String(i+1).padStart(2,'0')}</td><td>${r.name||''}</td><td>${r.C||0}</td><td>${r.D||0}</td><td>${r.E||0}</td><td>${r.F||0}</td><td>${r.G||0}</td><td>${r.H||0}</td><td>${r.K||0}</td><td>${r.L||''}</td></tr>`).join('');
  host.innerHTML = `<div class="card"><div class="card-body"><h6 class="mb-2">Saved Data</h6><div class="table-responsive"><table class="table table-sm table-bordered">${head}<tbody>${body}</tbody></table></div></div></div>`;
}



/* ========================= RSC(C) SHEET — OFFICIAL HEADER & COLUMNS (auto-appended) =========================
   This overrides earlier RSC(C) builders to match the official format with a two-level header:
   A,B,C,D,E; F,G under "For New Cadre (2025 onwards)", H = F+G, I = H-E; Remarks; Justification.
   Totals: A,B,C,D,E,F,G,H,I.
============================================================================================================== */

function buildRSCTemplate() {
  const table = document.getElementById('hrm-rsc-table');
  if (!table) return;

  table.innerHTML = '';

  const region = document.getElementById('hrm-rsc-region-input')?.value?.trim() || '[Region Name]';
  const zone = document.getElementById('hrm-rsc-zone-input')?.value?.trim() || '[Zone Name]';
  const connections = document.getElementById('hrm-rsc-connections-input')?.value?.trim() || '';
  const capacity = document.getElementById('hrm-rsc-capacity-input')?.value?.trim() || '';

  const designations = [
    "DGM ( C )","AGM (Development)","AGM (O&M )","CE (Civil)","CE - (M&E)",
    "Manager (Commercial)","Manager (HR)","Chief Accountant","Engineer- (Civil)",
    "Engineer- (Electrical)","Engineer- (Mechanical)","Engineer - (Electronic)",
    "Hydrogeologist","Quantity Surveyor","D.O.A (Drawing Office Assistant)",
    "Draughtsman","Internal Auditor","EA - (Civil)","EA - (Mechanical)",
    "EA - (Electrical)","EA - (Mechanical) GW","EA - (Electronic)","Sociologist",
    "Land Acquisition Officer","Training Officer","Human Resourse Officer",
    "Human Resourse Officer (Investigation)","Accountant (Payment)",
    "Accountant (Costing)","Supplies Officer","Asset Officer","Personal Secretary",
    "MA (Supra) Accounts","MA (Suppra) Audit","MA (Supra) HR","MA (HR)",
    "MA (Accounts)","MA (Stores)","MA - (Accounts) - Costing","MA (Cashier)",
    "Drivers","Fitter","W0RK Supervisor","Drillers","Labourer (Office Assistant)",
    "Carpenter"
  ];

  let html = '';
  // Title row
  html += `
    <tr>
      <th colspan="14" id="hrm-rsc-title">
        RSC : ${region}<br>
        Manager Zone : ${zone}<br>
        ${connections ? 'No: of Connection: ' + connections + '<br>' : ''}
        ${capacity ? 'Plant Capacity : ' + capacity : ''}
      </th>
    </tr>
    <tr><td colspan="14" style="height:10px;"></td></tr>
  `;

  // Two-level header
  html += `
    <tr class="table-light">
      <th rowspan="2">No.</th>
      <th rowspan="2">Designation</th>
      <th rowspan="2">2011 approved Cadre (A)</th>
      <th rowspan="2">Nos. Available in Permanent (B)</th>
      <th rowspan="2">Nos. Available in Acting (C)</th>
      <th rowspan="2">Nos. Available in Manpower Contract (D)</th>
      <th rowspan="2">Total Available Staff<br>(E = B+C+D)</th>
      <th colspan="3">For New Cadre (2025 onwards)</th>
      <th rowspan="2">Vacancies to be Filled<br>(I = H - E)</th>
      <th rowspan="2">Remarks</th>
      <th rowspan="2">Justification for Additional Proposed Staff</th>
    </tr>
    <tr class="table-light">
      <th>Total Nos. Proposed for Permanent (F)</th>
      <th>Total Nos. Proposed for Manpower (G)</th>
      <th>Total Proposed Staff (H = F + G)</th>
    </tr>
  `;

  // Rows
  for (let i = 0; i < designations.length; i++) {
    const rowNum = i + 5;
    html += `
      <tr data-row="${rowNum}">
        <td class="text-center fw-semibold">${String(i + 1).padStart(2,'0')}</td>
        <td>${buildRSCDesignationOptions(designations, designations[i])}</td>

        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="A" data-row="${rowNum}" /></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="B" data-row="${rowNum}" /></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="C" data-row="${rowNum}" /></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="D" data-row="${rowNum}" /></td>

        <td class="text-center fw-semibold hrm-calc" id="E-${rowNum}">0</td>

        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="F" data-row="${rowNum}" /></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="G" data-row="${rowNum}" /></td>

        <td class="text-center fw-semibold hrm-calc" id="H-${rowNum}">0</td>
        <td class="text-center fw-semibold hrm-calc" id="I-${rowNum}">0</td>

        <td><input type="text" class="form-control form-control-sm hrm-input" data-col="R" data-row="${rowNum}" /></td>
        <td><input type="text" class="form-control form-control-sm hrm-input" data-col="J" data-row="${rowNum}" /></td>
      </tr>
    `;
  }

  // Totals row
  html += `
    <tr class="hrm-total-row">
      <th colspan="2">Total</th>
      <th class="hrm-num" id="total-A">0</th>
      <th class="hrm-num" id="total-B">0</th>
      <th class="hrm-num" id="total-C">0</th>
      <th class="hrm-num" id="total-D">0</th>
      <th class="hrm-num" id="total-E">0</th>
      <th class="hrm-num" id="total-F">0</th>
      <th class="hrm-num" id="total-G">0</th>
      <th class="hrm-num" id="total-H">0</th>
      <th class="hrm-num" id="total-I">0</th>
      <td></td>
      <td></td>
    </tr>
  `;

  table.innerHTML = html;

  attachRSCOfficialCalculations();
  if (typeof setupRSCActionBar === 'function') { try { setupRSCActionBar(); } catch(_) {} }
  if (typeof updateHRMTitle === 'function') { try { updateHRMTitle(); } catch(_) {} }
  if (typeof loadRSCSheetFromCloud === 'function') { try { loadRSCSheetFromCloud(); } catch(_) {} }
}

// re-use existing designation options helper if present; otherwise define a minimal one
if (typeof buildRSCDesignationOptions !== 'function') {
  function buildRSCDesignationOptions(list, selectedName) {
    const opts = list.map(d => {
      const sel = (d === selectedName) ? ' selected' : '';
      return `<option value="${String(d).replace(/"/g, '&quot;')}"${sel}>${d}</option>`;
    }).join('');
    return `<select class="form-select form-select-sm hrm-rsc-designation">${opts}</select>`;
  }
}

function attachRSCOfficialCalculations() {
  document.querySelectorAll('#hrm-rsc-table .hrm-input').forEach(inp => {
    inp.addEventListener('input', onRscOfficialRowInput);
  });

  ['hrm-rsc-region-input','hrm-rsc-zone-input','hrm-rsc-connections-input','hrm-rsc-capacity-input']
    .forEach(id => document.getElementById(id)?.addEventListener('input', function(){
      if (typeof updateHRMTitle === 'function') updateHRMTitle();
    }));
}

function onRscOfficialRowInput(e) {
  const row = e.target.getAttribute('data-row');
  if (!row) return;

  const B = parseFloat(document.querySelector(`.hrm-input[data-col="B"][data-row="${row}"]`)?.value) || 0;
  const C = parseFloat(document.querySelector(`.hrm-input[data-col="C"][data-row="${row}"]`)?.value) || 0;
  const D = parseFloat(document.querySelector(`.hrm-input[data-col="D"][data-row="${row}"]`)?.value) || 0;
  const F = parseFloat(document.querySelector(`.hrm-input[data-col="F"][data-row="${row}"]`)?.value) || 0;
  const G = parseFloat(document.querySelector(`.hrm-input[data-col="G"][data-row="${row}"]`)?.value) || 0;

  const E = B + C + D;
  const H = F + G;
  const I = H - E;

  const eCell = document.getElementById(`E-${row}`);
  if (eCell) eCell.textContent = String(E);
  const hCell = document.getElementById(`H-${row}`);
  if (hCell) hCell.textContent = String(H);
  const iCell = document.getElementById(`I-${row}`);
  if (iCell) iCell.textContent = String(I);

  rscOfficialTotals();
}

function rscOfficialTotals() {
  const cols = ['A','B','C','D','F','G'];
  const totals = { A:0,B:0,C:0,D:0,E:0,F:0,G:0,H:0,I:0 };

  cols.forEach(col => {
    document.querySelectorAll(`#hrm-rsc-table .hrm-input[data-col="${col}"]`).forEach(inp => {
      totals[col] += parseFloat(inp.value) || 0;
    });
  });

  for (let row = 5; row <= 50; row++) {
    totals.E += parseFloat(document.getElementById(`E-${row}`)?.textContent) || 0;
    totals.H += parseFloat(document.getElementById(`H-${row}`)?.textContent) || 0;
    totals.I += parseFloat(document.getElementById(`I-${row}`)?.textContent) || 0;
  }

  ['A','B','C','D','E','F','G','H','I'].forEach(k => {
    const el = document.getElementById(`total-${k}`);
    if (el) el.textContent = String(totals[k]);
  });
}

function collectRSCPayload() {
  const meta = {
    region: document.getElementById('hrm-rsc-region-input')?.value?.trim() || '',
    zone: document.getElementById('hrm-rsc-zone-input')?.value?.trim() || '',
    connections: document.getElementById('hrm-rsc-connections-input')?.value?.trim() || '',
    capacity: document.getElementById('hrm-rsc-capacity-input')?.value?.trim() || ''
  };

  const rows = [];
  const selects = Array.from(document.querySelectorAll('#hrm-rsc-table select.hrm-rsc-designation'));
  for (let i = 0; i < selects.length; i++) {
    const rowNum = i + 5;
    const name = selects[i]?.value?.trim() || '';
    const A = +(document.querySelector(`.hrm-input[data-col="A"][data-row="${rowNum}"]`)?.value || 0);
    const B = +(document.querySelector(`.hrm-input[data-col="B"][data-row="${rowNum}"]`)?.value || 0);
    const C = +(document.querySelector(`.hrm-input[data-col="C"][data-row="${rowNum}"]`)?.value || 0);
    const D = +(document.querySelector(`.hrm-input[data-col="D"][data-row="${rowNum}"]`)?.value || 0);
    const E = +(document.getElementById(`E-${rowNum}`)?.textContent || 0);
    const F = +(document.querySelector(`.hrm-input[data-col="F"][data-row="${rowNum}"]`)?.value || 0);
    const G = +(document.querySelector(`.hrm-input[data-col="G"][data-row="${rowNum}"]`)?.value || 0);
    const H = +(document.getElementById(`H-${rowNum}`)?.textContent || 0);
    const I = +(document.getElementById(`I-${rowNum}`)?.textContent || 0);
    const R = (document.querySelector(`.hrm-input[data-col="R"][data-row="${rowNum}"]`)?.value || '').trim();
    const J = (document.querySelector(`.hrm-input[data-col="J"][data-row="${rowNum}"]`)?.value || '').trim();

    rows.push({ name, A, B, C, D, E, F, G, H, I, R, J });
  }

  const totals = {};
  ['A','B','C','D','E','F','G','H','I'].forEach(col => {
    totals[col] = +(document.getElementById(`total-${col}`)?.textContent || 0);
  });

  return { sheetKey: 'RSC(C)', meta, rows, totals, updatedAt: new Date().toISOString() };
}

function renderRSCPreview(data){
  const host = document.getElementById('hrm-rsc-preview');
  if(!host) return;
  if(!data || !Array.isArray(data.rows)){ host.innerHTML=''; return; }
  const head1 = `<tr class="table-light">
    <th rowspan="2">No.</th>
    <th rowspan="2">Designation</th>
    <th rowspan="2">2011 approved Cadre (A)</th>
    <th rowspan="2">Nos. Available in Permanent (B)</th>
    <th rowspan="2">Nos. Available in Acting (C)</th>
    <th rowspan="2">Nos. Available in Manpower Contract (D)</th>
    <th rowspan="2">Total Available Staff (E = B+C+D)</th>
    <th colspan="3">For New Cadre (2025 onwards)</th>
    <th rowspan="2">Vacancies to be Filled (I = H - E)</th>
    <th rowspan="2">Remarks</th>
    <th rowspan="2">Justification for Additional Proposed Staff</th>
  </tr>`;
  const head2 = `<tr class="table-light">
    <th>Total Nos. Proposed for Permanent (F)</th>
    <th>Total Nos. Proposed for Manpower (G)</th>
    <th>Total Proposed Staff (H = F + G)</th>
  </tr>`;

  const body = data.rows.map((r,i)=>{
    const E = (r.E!=null)?r.E:((r.B||0)+(r.C||0)+(r.D||0));
    const H = (r.H!=null)?r.H:((r.F||0)+(r.G||0));
    const I = (r.I!=null)?r.I:(H - E);
    return `<tr>
      <td>${String(i+1).padStart(2,'0')}</td>
      <td>${r.name||''}</td>
      <td>${r.A||0}</td>
      <td>${r.B||0}</td>
      <td>${r.C||0}</td>
      <td>${r.D||0}</td>
      <td>${E}</td>
      <td>${r.F||0}</td>
      <td>${r.G||0}</td>
      <td>${H}</td>
      <td>${I}</td>
      <td>${r.R||''}</td>
      <td>${r.J||''}</td>
    </tr>`;
  }).join('');

  host.innerHTML = `<div class="card"><div class="card-body">
    <h6 class="mb-2">Saved Data</h6>
    <div class="table-responsive"><table class="table table-sm table-bordered">
      <thead>${head1}${head2}</thead>
      <tbody>${body}</tbody>
    </table></div></div></div>`;
}
/* ======================= End RSC(C) official columns patch ======================= */


/* === RSC(C) THEAD/COLGROUP FIX (prevent header text overlap) === */
function buildRSCTemplate() {
  const table = document.getElementById('hrm-rsc-table');
  if (!table) return;

  const region = document.getElementById('hrm-rsc-region-input')?.value?.trim() || '[Region Name]';
  const zone = document.getElementById('hrm-rsc-zone-input')?.value?.trim() || '[Zone Name]';
  const connections = document.getElementById('hrm-rsc-connections-input')?.value?.trim() || '';
  const capacity = document.getElementById('hrm-rsc-capacity-input')?.value?.trim() || '';

  const designations = [
    "DGM ( C )","AGM (Development)","AGM (O&M )","CE (Civil)","CE - (M&E)",
    "Manager (Commercial)","Manager (HR)","Chief Accountant","Engineer- (Civil)",
    "Engineer- (Electrical)","Engineer- (Mechanical)","Engineer - (Electronic)",
    "Hydrogeologist","Quantity Surveyor","D.O.A (Drawing Office Assistant)",
    "Draughtsman","Internal Auditor","EA - (Civil)","EA - (Mechanical)",
    "EA - (Electrical)","EA - (Mechanical) GW","EA - (Electronic)","Sociologist",
    "Land Acquisition Officer","Training Officer","Human Resourse Officer",
    "Human Resourse Officer (Investigation)","Accountant (Payment)",
    "Accountant (Costing)","Supplies Officer","Asset Officer","Personal Secretary",
    "MA (Supra) Accounts","MA (Suppra) Audit","MA (Supra) HR","MA (HR)",
    "MA (Accounts)","MA (Stores)","MA - (Accounts) - Costing","MA (Cashier)",
    "Drivers","Fitter","W0RK Supervisor","Drillers","Labourer (Office Assistant)",
    "Carpenter"
  ];

  // Start HTML with a clear title row inside a separate caption block
  let html = '';
  html += `
    <caption style="caption-side: top; text-align:center;">
      <div id="hrm-rsc-title" style="padding:6px 0;">
        RSC : ${region}<br>
        Manager Zone : ${zone}<br>
        ${connections ? 'No: of Connection: ' + connections + '<br>' : ''}
        ${capacity ? 'Plant Capacity : ' + capacity : ''}
      </div>
    </caption>
    <colgroup>
      <col style="width:60px">
      <col style="width:40%">
      <col span="9" style="width:6%">
      <col style="width:9%">
      <col style="width:10%">
    </colgroup>
    <thead>
      <tr class="table-light">
        <th rowspan="2">No.</th>
        <th rowspan="2">Designation</th>
        <th rowspan="2">2011 approved Cadre (A)</th>
        <th rowspan="2">Nos. Available in Permanent (B)</th>
        <th rowspan="2">Nos. Available in Acting (C)</th>
        <th rowspan="2">Nos. Available in Manpower Contract (D)</th>
        <th rowspan="2">Total Available Staff<br>(E = B + C + D)</th>
        <th colspan="3" class="new-cadre-head">For New Cadre (2025 onwards)</th>
        <th rowspan="2">Vacancies to be Filled<br>(I = H - E)</th>
        <th rowspan="2">Remarks</th>
        <th rowspan="2">Justification for Additional Proposed Staff</th>
      </tr>
      <tr class="table-light subhead">
        <th>Total Nos. Proposed for Permanent (F)</th>
        <th>Total Nos. Proposed for Manpower (G)</th>
        <th>Total Proposed Staff (H = F + G)</th>
      </tr>
    </thead>
    <tbody>
  `;

  // Body rows
  for (let i = 0; i < designations.length; i++) {
    const rowNum = i + 5;
    html += `
      <tr data-row="${rowNum}">
        <td class="text-center fw-semibold">${String(i + 1).padStart(2,'0')}</td>
        <td>${buildRSCDesignationOptions(designations, designations[i])}</td>

        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="A" data-row="${rowNum}" /></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="B" data-row="${rowNum}" /></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="C" data-row="${rowNum}" /></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="D" data-row="${rowNum}" /></td>

        <td class="text-center fw-semibold hrm-calc" id="E-${rowNum}">0</td>

        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="F" data-row="${rowNum}" /></td>
        <td><input type="number" class="form-control form-control-sm hrm-input" data-col="G" data-row="${rowNum}" /></td>

        <td class="text-center fw-semibold hrm-calc" id="H-${rowNum}">0</td>
        <td class="text-center fw-semibold hrm-calc" id="I-${rowNum}">0</td>

        <td><input type="text" class="form-control form-control-sm hrm-input" data-col="R" data-row="${rowNum}" /></td>
        <td><input type="text" class="form-control form-control-sm hrm-input" data-col="J" data-row="${rowNum}" /></td>
      </tr>
    `;
  }

  // Totals row
  html += `
    <tr class="hrm-total-row">
      <th colspan="2">Total</th>
      <th class="hrm-num" id="total-A">0</th>
      <th class="hrm-num" id="total-B">0</th>
      <th class="hrm-num" id="total-C">0</th>
      <th class="hrm-num" id="total-D">0</th>
      <th class="hrm-num" id="total-E">0</th>
      <th class="hrm-num" id="total-F">0</th>
      <th class="hrm-num" id="total-G">0</th>
      <th class="hrm-num" id="total-H">0</th>
      <th class="hrm-num" id="total-I">0</th>
      <td></td>
      <td></td>
    </tr>
    </tbody>
  `;

  table.innerHTML = html;

  attachRSCOfficialCalculations();
  if (typeof setupRSCActionBar === 'function') { try { setupRSCActionBar(); } catch(_) {} }
  if (typeof updateHRMTitle === 'function') { try { updateHRMTitle(); } catch(_) {} }
  if (typeof loadRSCSheetFromCloud === 'function') { try { loadRSCSheetFromCloud(); } catch(_) {} }
}
