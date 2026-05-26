/* modal.js — Submissions & Analytics + Admin Page
   - Submissions filters, KPIs, charts, table, CSV export
   - Developer Options (Admin): regions/locations management
   - Note: Admin buttons are wired in script.js to always prompt via showAdminPrompt
   - Uses global helpers from script.js/core.js
   Dependencies (from script.js/core.js):
   - getAllRecords, fmtDateTime, toDate, chartsAvailable, CHARTS, formatRegionName
   - getMergedRegions, getMergedLocations, getRegionLabelForDataset, getDefaultLocations, loadAdminConfig
   - adminAddRegion, adminAddLocation, adminDeleteLocation, adminDeleteRegion
   - buildHomeDropdownMenus, showToast, togglePage, showHomePage
*/

/* ===========================
   Submissions & Analytics
   =========================== */
function initSubmissionsIfNeeded() {
  // Bridge across let subPageInited (script.js) and window.subPageInited
  const alreadyInited = (typeof subPageInited !== 'undefined' && subPageInited) || !!window.subPageInited;
  if (alreadyInited) return;

  // Rebind all references each time (safe if DOM changed)
  window.subDatasetSel = document.getElementById('sub-dataset');
  window.subRegionSel = document.getElementById('sub-region');
  window.subLocationSel = document.getElementById('sub-location');
  window.subFromEl = document.getElementById('sub-from');
  window.subToEl = document.getElementById('sub-to');
  window.subApplyBtn = document.getElementById('sub-apply');
  window.subResetBtn = document.getElementById('sub-reset');
  window.subExportBtn = document.getElementById('sub-export');

  window.kpiTotalEl = document.getElementById('kpi-total');
  window.kpiLocsEl = document.getElementById('kpi-locations');
  window.kpiRegionsEl = document.getElementById('kpi-regions');
  window.kpiLatestEl = document.getElementById('kpi-latest');
  window.chartsUnavailableEl = document.getElementById('charts-unavailable');

  if (!subDatasetSel || !subRegionSel) {
    console.warn('Submissions page elements not found');
    return;
  }

  try {
    populateSubRegions();
    populateSubLocations();
    updateChartsVisibility();

    if (subDatasetSel) {
      subDatasetSel.addEventListener('change', () => {
        populateSubRegions();
        populateSubLocations();
        updateChartsVisibility();
        scheduleRenderSubmissions();
      });
    }

    if (subRegionSel) {
      subRegionSel.addEventListener('change', () => {
        populateSubLocations();
        scheduleRenderSubmissions();
      });
    }

    if (subLocationSel) {
      subLocationSel.addEventListener('change', () => {
        scheduleRenderSubmissions();
      });
    }

    if (subApplyBtn) {
      subApplyBtn.addEventListener('click', () => scheduleRenderSubmissions());
    }

    if (subResetBtn) {
      subResetBtn.addEventListener('click', () => {
        if (subRegionSel) subRegionSel.value = '';
        populateSubLocations();
        if (subFromEl) subFromEl.value = '';
        if (subToEl) subToEl.value = '';
        scheduleRenderSubmissions();
      });
    }

    document.querySelectorAll('.sub-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        const days = parseInt(btn.getAttribute('data-range'), 10) || 7;
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - days + 1);

        if (subFromEl) subFromEl.value = toInputDate(from);
        if (subToEl) subToEl.value = toInputDate(to);
        scheduleRenderSubmissions();
      });
    });

    if (subExportBtn) {
      subExportBtn.addEventListener('click', () => exportSubmissionsCSV());
    }

    // Mark initialized in both places
    window.subPageInited = true;
    try { subPageInited = true; } catch(_) {}

    renderSubmissions();
    
    console.log('Submissions page initialized successfully');
  } catch (error) {
    console.error('Failed to initialize submissions page:', error);
    showToast('Failed to initialize submissions page', 'danger');
  }
}

function toInputDate(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    console.warn('Invalid date provided to toInputDate:', d);
    return '';
  }
  
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function populateSubRegions() {
  if (!subDatasetSel || !subRegionSel) return;

  try {
    const dataset = subDatasetSel.value;
    const locked = (typeof window.isRegionalUser === 'function' && window.isRegionalUser() && typeof window.getUserRegion === 'function') ? window.getUserRegion() : '';

    const regions = (typeof getMergedRegions === 'function')
      ? getMergedRegions(dataset)
      : (dataset === 'scheme' ? Object.keys(REGION_ITEMS) : Object.keys(LABS_REGION_ITEMS));

    const prev = subRegionSel.value;
    subRegionSel.textContent = '';

    if (locked) {
      const lbl = getRegionLabelForDataset(dataset, locked);
      subRegionSel.add(new Option(lbl, locked));
      subRegionSel.value = locked;
      subRegionSel.setAttribute('disabled', 'true');
    } else {
      subRegionSel.removeAttribute('disabled');
      subRegionSel.add(new Option('All Regions', ''));
      regions.forEach(r => {
        const lbl = getRegionLabelForDataset(dataset, r);
        subRegionSel.add(new Option(lbl, r));
      });
      if ([...subRegionSel.options].some(o => o.value === prev)) subRegionSel.value = prev;
    }
  } catch (error) {
    console.error('Failed to populate regions:', error);
    showToast('Failed to load regions', 'warning');
  }
}

function populateSubLocations() {
  if (!subDatasetSel || !subRegionSel || !subLocationSel) return;
  
  try {
    const dataset = subDatasetSel.value;
    const region = subRegionSel.value;

    const prev = subLocationSel.value;
    subLocationSel.textContent = '';
    subLocationSel.add(new Option('All Locations', ''));

    if (!region) return;

    const items = (typeof getMergedLocations === 'function')
      ? getMergedLocations(dataset, region)
      : (dataset === 'scheme' ? (REGION_ITEMS[region] || []) : (LABS_REGION_ITEMS[region] || []));

    items.forEach(i => subLocationSel.add(new Option(i, i)));

    // Restore previous selection if still valid
    if ([...subLocationSel.options].some(o => o.value === prev)) subLocationSel.value = prev;
  } catch (error) {
    console.error('Failed to populate locations:', error);
    showToast('Failed to load locations', 'warning');
  }
}

function updateChartsVisibility() {
  if (!subDatasetSel) return;
  
  try {
    const ds = subDatasetSel.value;
    const setGroup = (sel, on) => {
      document.querySelectorAll(sel).forEach(el => {
        el.classList.toggle('sub-visible', on);
        if (on) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', 'true');
        try { el.inert = !on; } catch(_) {}
      });
    };
    setGroup('.scheme-chart', ds === 'scheme');
    setGroup('.plant-chart', ds === 'plant');
    setGroup('.labs-chart', ds === 'labs');
  } catch (error) {
    console.error('Failed to update charts visibility:', error);
  }
}

// Debounced rendering to avoid multiple rapid re-renders
let __renderPending = false;
function scheduleRenderSubmissions() {
  if (__renderPending) return;
  __renderPending = true;
  requestAnimationFrame(() => {
    __renderPending = false;
    try {
      renderSubmissions();
    } catch (error) {
      console.error('Error in scheduled render:', error);
    }
  });
}

function renderSubmissions() {
  if (!window.subPageInited) {
    console.warn('Submissions page not initialized');
    return;
  }

  try {
    const dataset = subDatasetSel ? subDatasetSel.value : 'scheme';
    let region = subRegionSel ? subRegionSel.value : '';
    try {
      const locked = (typeof window.isRegionalUser === 'function' && window.isRegionalUser() && typeof window.getUserRegion === 'function') ? window.getUserRegion() : '';
      if (locked) region = locked;
    } catch (_) {}
    const location = subLocationSel ? subLocationSel.value : '';
    const from = subFromEl && subFromEl.value ? new Date(subFromEl.value + 'T00:00:00') : null;
    const to = subToEl && subToEl.value ? new Date(subToEl.value + 'T23:59:59') : null;

    // Validate date range
    if (from && to && from > to) {
      showToast('End date cannot be before start date', 'warning');
      return;
    }

    const all = getAllRecords(dataset);
    const filtered = all.filter(r => {
      if (region && r.region !== region) return false;
      if (location && r.location !== location) return false;
      if (from || to) {
        const dt = toDate(r.submittedAt);
        if (!dt) return false;
        if (from && dt < from) return false;
        if (to && dt > to) return false;
      }
      return true;
    });

    // Update KPIs with safe fallbacks
    const safeSetText = (el, value) => {
      if (el) el.textContent = value != null ? value : '0';
    };

    safeSetText(kpiTotalEl, filtered.length);
    safeSetText(kpiLocsEl, new Set(filtered.map(r => `${r.region}|${r.location}`)).size);
    safeSetText(kpiRegionsEl, new Set(filtered.map(r => r.region)).size);

    const latest = filtered.reduce((acc, r) => {
      const dt = toDate(r.submittedAt);
      if (!dt) return acc;
      return (!acc || dt > acc) ? dt : acc;
    }, null);

    safeSetText(kpiLatestEl, latest ? latest.toLocaleString() : '-');

    renderCharts(dataset, filtered);
    renderSubmissionsTable(dataset, filtered);

    console.log(`Rendered ${filtered.length} submissions for dataset: ${dataset}`);
  } catch (error) {
    console.error('Error rendering submissions:', error);
    showToast('Failed to render submissions data', 'danger');
  }
}

function getChartsUnavailableEl() {
  return chartsUnavailableEl || document.getElementById('charts-unavailable');
}

function setChartA11y(id, label) {
  try {
    const c = document.getElementById(id);
    if (c) { 
      c.setAttribute('role', 'img'); 
      c.setAttribute('aria-label', label); 
    }
  } catch (error) {
    console.warn('Failed to set chart accessibility:', error);
  }
}

function renderCharts(dataset, rows) {
  if (!chartsAvailable || !chartsAvailable()) {
    const cu = getChartsUnavailableEl();
    if (cu) cu.classList.remove('d-none');

    // Only destroy submissions charts, keep landing charts intact
    const SUB_CHART_KEYS = ['schemeConnections','schemeGrowth','plantCapacity','plantTreatment','labsSubmissions'];
    SUB_CHART_KEYS.forEach(k => {
      if (CHARTS[k]) {
        try {
          CHARTS[k].destroy();
        } catch (error) {
          console.warn('Error destroying chart:', k, error);
        }
        CHARTS[k] = null;
      }
    });
    return;
  }

  try {
    const cu = getChartsUnavailableEl();
    if (cu) cu.classList.add('d-none');

    // Respect reduced motion if helper exists
    try { if (typeof syncChartMotionPref === 'function') syncChartMotionPref(); } catch(_) {}

    if (dataset === 'scheme') {
      const byCat = {};
      rows.forEach(r => {
        (r.connections || []).forEach(c => {
          byCat[c.category] = (byCat[c.category] || 0) + (Number(c.count) || 0);
        });
      });

      const catLabels = Object.keys(byCat);
      const catData = catLabels.map(l => byCat[l]);

      if (catLabels.length > 0) {
        CHARTS.schemeConnections = createOrUpdateChart(
          CHARTS.schemeConnections,
          'chart-scheme-connections',
          'doughnut',
          {
            labels: catLabels,
            datasets: [{ data: catData, backgroundColor: genColors(catLabels.length) }]
          },
          { responsive: true, plugins: { legend: { position: 'bottom' } } }
        );
        setChartA11y('chart-scheme-connections','Connections by category donut chart');
      }

      const appYear = (typeof window.getAppYear === 'function') ? window.getAppYear() : 2026;
      const startYear = 2015;
      const endYear = Math.max(startYear, (Number(appYear) || 2026) - 1);
      const years = Array.from({ length: (endYear - startYear + 1) }, (_, i) => String(startYear + i));
      const sums = years.map(y => rows.reduce((s, r) => s + (Number(r?.growth?.[y]) || 0), 0));

      if (sums.some(s => s > 0)) {
        CHARTS.schemeGrowth = createOrUpdateChart(
          CHARTS.schemeGrowth,
          'chart-scheme-growth',
          'line',
          {
            labels: years,
            datasets: [{
              label: 'Connections',
              data: sums,
              borderColor: '#0d6efd',
              backgroundColor: 'rgba(13,110,253,.2)',
              tension: .3,
              fill: true
            }]
          },
          { responsive: true, scales: { y: { beginAtZero: true } } }
        );
        setChartA11y('chart-scheme-growth',`Connections growth line chart (${startYear}-${endYear})`);
      }
    }

      // Additional charts from Bulk meta
      const supplierTotals = {};
      const locationQty = {};
      rows.forEach(r => {
        (r.connections||[]).forEach(c => {
          const m = c.meta || {};
          const bill = Number(m.monthlyBill)||0;
          const qty = Number(m.quantity)||0;
          const supplier = m.supplierName || 'Unknown';
          const lloc = m.location || r.location || 'Unknown';
          if (bill) supplierTotals[supplier] = (supplierTotals[supplier]||0) + bill;
          if (qty) {
            const key = `${formatRegionName(r.region)} — ${lloc}`;
            locationQty[key] = (locationQty[key]||0) + qty;
          }
        });
      });

      const supLabels = Object.keys(supplierTotals);
      const supData = supLabels.map(k => supplierTotals[k]);
      if (supLabels.length) {
        CHARTS.schemeSupplier = createOrUpdateChart(
          CHARTS.schemeSupplier,
          'chart-supplier-bill',
          'bar',
          { labels: supLabels, datasets: [{ label: 'Total Monthly Bill', data: supData, backgroundColor: genColors(supLabels.length) }] },
          { responsive:true, scales:{ y:{beginAtZero:true} }, plugins:{legend:{display:false}}, indexAxis: supLabels.length>8?'y':'x' }
        );
        setChartA11y('chart-supplier-bill','Total monthly bill by supplier');
      }

      const locLabels = Object.keys(locationQty);
      const locData = locLabels.map(k => locationQty[k]);
      if (locLabels.length) {
        CHARTS.schemeLocQty = createOrUpdateChart(
          CHARTS.schemeLocQty,
          'chart-location-qty',
          'bar',
          { labels: locLabels, datasets: [{ label: 'Quantity', data: locData, backgroundColor: genColors(locLabels.length) }] },
          { responsive:true, scales:{ y:{beginAtZero:true} }, plugins:{legend:{display:false}}, indexAxis: locLabels.length>8?'y':'x' }
        );
        setChartA11y('chart-location-qty','Quantity by location (bulk connections)');
      }


    if (dataset === 'plant') {
      const sumDesigned = rows.reduce((s, r) => s + (Number(r.designedCapacity) || 0), 0);
      const sumOperational = rows.reduce((s, r) => s + (Number(r.operationalCapacity) || 0), 0);

      if (sumDesigned > 0 || sumOperational > 0) {
        CHARTS.plantCapacity = createOrUpdateChart(
          CHARTS.plantCapacity,
          'chart-plant-capacity',
          'bar',
          {
            labels: ['Designed', 'Operational'],
            datasets: [{
              label: 'Capacity (cum/day)',
              data: [sumDesigned, sumOperational],
              backgroundColor: ['#0d6efd', '#20c997']
            }]
          },
          { responsive: true, scales: { y: { beginAtZero: true } } }
        );
        setChartA11y('chart-plant-capacity','Designed vs Operational capacity bar chart');
      }

      const counts = {};
      rows.forEach(r => {
        const key = String(r.treatmentType || 'Unknown').toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
      });

      const labels = Object.keys(counts).map(k => k.toUpperCase());
      const data = Object.values(counts);

      if (labels.length > 0) {
        CHARTS.plantTreatment = createOrUpdateChart(
          CHARTS.plantTreatment,
          'chart-plant-treatment',
          'pie',
          {
            labels,
            datasets: [{ data, backgroundColor: genColors(labels.length) }]
          },
          { responsive: true, plugins: { legend: { position: 'bottom' } } }
        );
        setChartA11y('chart-plant-treatment','Treatment type distribution pie chart');
      }
    }

    if (dataset === 'labs') {
      const perLoc = {};
      rows.forEach(r => {
        const key = `${formatRegionName(r.region)} — ${r.location}`;
        perLoc[key] = (perLoc[key] || 0) + 1;
      });

      const labels = Object.keys(perLoc);
      const data = labels.map(k => perLoc[k]);

      if (labels.length > 0) {
        CHARTS.labsSubmissions = createOrUpdateChart(
          CHARTS.labsSubmissions,
          'chart-labs-submissions',
          'bar',
          {
            labels,
            datasets: [{ label: 'Submissions', data, backgroundColor: '#6f42c1' }]
          },
          {
            responsive: true,
            maintainAspectRatio: false, // easier for long lists
            indexAxis: labels.length > 8 ? 'y' : 'x',
            scales: {
              x: { beginAtZero: true },
              y: { beginAtZero: true }
            }
          }
        );
        setChartA11y('chart-labs-submissions','Labs submissions per location bar chart');
      }
    }
  } catch (error) {
    console.error('Error rendering charts:', error);
    const cu = getChartsUnavailableEl();
    if (cu) cu.classList.remove('d-none');
    showToast('Failed to render charts', 'warning');
  }
}

function createOrUpdateChart(inst, canvasId, type, data, options) {
  try {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return inst;

    // Default, sensible chart options to prevent oversized canvases
    const defaultOpts = {
      responsive: true,
      maintainAspectRatio: false,   // allow CSS height control
      animation: { duration: 300 },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { intersect: false }
      },
      resizeDelay: 150
    };

    // Merge user options (shallow)
    const mergedOpts = Object.assign({}, defaultOpts, options || {});

    if (inst && inst.config && inst.config.type === type) {
      // Update instead of destroy/recreate (prevents flicker + refresh bugs)
      inst.data = data || inst.data;
      inst.options = mergedOpts;
      inst.update();
      return inst;
    }

    // Otherwise, destroy and recreate with new type
    if (inst && typeof inst.destroy === 'function') {
      try { inst.destroy(); } catch (e) { console.warn('Chart destroy failed:', e); }
    }

    return new Chart(ctx, { type, data, options: mergedOpts });
  } catch (error) {
    console.error('Error creating/updating chart:', error);
    return inst;
  }
}

function genColors(n) {
  const base = [
    '#0d6efd', '#6f42c1', '#20c997', '#ffc107', '#dc3545',
    '#198754', '#fd7e14', '#0dcaf0', '#6610f2', '#1982c4'
  ];
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(base[i % base.length]);
  return arr;
}

function renderSubmissionsTable(dataset, rows) {
  const headRow = document.getElementById('sub-table-head'); // <tr>
  const tbody = document.getElementById('sub-table-body');
  if (!headRow || !tbody) return;

  try {
    let cols;
    if (dataset === 'scheme') cols = ['Date', 'Region', 'Location', 'Conn total', 'Growth filled', 'Exp items', 'WSP?'];
    else if (dataset === 'plant') cols = ['Date', 'Region', 'Location', 'Designed', 'Operational', 'Treatment', 'Photos'];
    else cols = ['Date', 'Region', 'Location', 'Raw', 'TP', 'Distribution', 'Issues'];

    // header
    headRow.textContent = '';
    cols.forEach(c => {
      const th = document.createElement('th');
      th.textContent = c;
      th.setAttribute('scope', 'col');
      headRow.appendChild(th);
    });

    // body
    tbody.textContent = '';
    
    if (rows.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = cols.length;
      td.className = 'text-center text-muted py-4';
      td.textContent = 'No data found for the selected filters';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    const frag = document.createDocumentFragment();
    rows.forEach(r => {
      let cells;
      if (dataset === 'scheme') {
        cells = [
          fmtDateTime(r.submittedAt),
          formatRegionName(r.region),
          r.location,
          String(r.connTotal || 0),
          String(r.growthFilled || 0),
          String(r.expCount || 0),
          (r.wspStatus && String(r.wspStatus).trim() ? 'Yes' : 'No')
        ];
      } else if (dataset === 'plant') {
        cells = [
          fmtDateTime(r.submittedAt),
          formatRegionName(r.region),
          r.location,
          (r.designedCapacity ?? '-'),
          (r.operationalCapacity ?? '-'),
          (r.treatmentType || '-'),
          String((r.photoUrls?.length || r.photosInline?.length || 0))
        ];
      } else {
        const has = s => (s && String(s).trim().length ? 'Yes' : 'No');
        cells = [
          fmtDateTime(r.submittedAt),
          formatRegionName(r.region),
          r.location,
          has(r.rawWater),
          has(r.treatedTp),
          has(r.treatedDistribution),
          has(r.issues)
        ];
      }

      const tr = document.createElement('tr');
      cells.forEach(v => {
        const td = document.createElement('td');
        td.textContent = String(v);
        tr.appendChild(td);
      });
      frag.appendChild(tr);
    });
    tbody.appendChild(frag);
  } catch (error) {
    console.error('Error rendering submissions table:', error);
    showToast('Failed to render table data', 'warning');
  }
}

function exportSubmissionsCSV() {
  if (!subDatasetSel || !subFromEl || !subToEl) {
    showToast('Export functionality not ready', 'warning');
    return;
  }

  try {
    const dataset = subDatasetSel.value;
    const region = subRegionSel ? subRegionSel.value : '';
    const location = subLocationSel ? subLocationSel.value : '';
    const from = subFromEl.value ? new Date(subFromEl.value + 'T00:00:00') : null;
    const to = subToEl.value ? new Date(subToEl.value + 'T23:59:59') : null;

    // Validate date range
    if (from && to && from > to) {
      showToast('End date cannot be before start date', 'warning');
      return;
    }

    const all = getAllRecords(dataset);
    const filtered = all.filter(r => {
      if (region && r.region !== region) return false;
      if (location && r.location !== location) return false;
      if (from || to) {
        const dt = toDate(r.submittedAt);
        if (!dt) return false;
        if (from && dt < from) return false;
        if (to && dt > to) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      showToast('No data to export', 'warning');
      return;
    }

    let cols = [];
    if (dataset === 'scheme') cols = ['submittedAt', 'region', 'location', 'connTotal', 'growthFilled', 'expCount', 'wspStatus'];
    else if (dataset === 'plant') cols = ['submittedAt', 'region', 'location', 'designedCapacity', 'operationalCapacity', 'treatmentType', 'photosCount'];
    else if (dataset === 'labs') cols = ['submittedAt', 'region', 'location', 'rawWater', 'treatedTp', 'treatedDistribution', 'issues'];

    const rows = [cols.join(',')];

    filtered.forEach(r => {
      const record = { ...r };

      if (dataset === 'scheme') {
        record.connTotal = Array.isArray(r.connections) ? r.connections.reduce((s, c) => s + (Number(c.count) || 0), 0) : 0;
        record.growthFilled = r.growth ? Object.values(r.growth).filter(v => v != null).length : 0;
        record.expCount = Array.isArray(r.expenditures) ? r.expenditures.length : 0;
      }

      if (dataset === 'plant') {
        record.photosCount = (r.photoUrls?.length || r.photosInline?.length || 0);
      }

      const line = cols.map(k => {
        let v = record[k];
        if (v == null) v = '';
        v = String(v).replace(/"/g, '""');
        if (v.includes(',') || v.includes('"') || v.includes('\n')) v = `"${v}"`;
        return v;
      }).join(',');

      rows.push(line);
    });

    const csv = rows.join('\n');
    const BOM = '\uFEFF'; // Excel-friendly
    const blob = new Blob([BOM, csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    a.download = `nwsdb_${dataset}_submissions_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`CSV exported successfully! (${filtered.length} records)`, 'success');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    showToast('Failed to export CSV', 'danger');
  }
}

/* ===========================
   Admin Page
   =========================== */
function showAdminPage() {
  // Called after successful admin login by script.js
  togglePage?.('admin-page');
  initAdminPage();
}

function initAdminPage() {
  const dsRadios = document.querySelectorAll('input[name="adm-dataset"]');
  const regionSel = document.getElementById('adm-region');
  const regionKeyEl = document.getElementById('adm-region-key');
  const regionLabelEl = document.getElementById('adm-region-label');
  const addRegionBtn = document.getElementById('adm-add-region');
  const locInput = document.getElementById('adm-location-name');
  const addLocBtn = document.getElementById('adm-add-location');
  const yearInput = document.getElementById('adm-reporting-year');
  const yearSaveBtn = document.getElementById('adm-save-year');

  if (!dsRadios.length || !regionSel) {
    console.warn('Admin page elements not found');
    return;
  }

  try {
    // Reporting year controls
    try {
      if (yearInput) yearInput.value = String((typeof window.getAppYear === 'function') ? window.getAppYear() : 2026);
      if (yearSaveBtn) {
        yearSaveBtn.onclick = () => {
          const y = parseInt(String(yearInput?.value || ''), 10);
          if (!Number.isFinite(y) || y < 1900 || y > 2100) {
            showToast('Enter a valid year', 'danger');
            return;
          }
          if (typeof window.setAppYear === 'function') {
            window.setAppYear(y);
            showToast(`Year set to ${y}`, 'success');
          } else {
            showToast('Year setting not available', 'danger');
          }
        };
      }
    } catch (e) {
      console.warn('Failed to init reporting year controls', e);
    }

    const getDS = () => (document.querySelector('input[name="adm-dataset"]:checked')?.value || 'scheme');

    function generateRegionKey(label) {
      return String(label || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, '');
    }

    function fillRegions() {
      try {
        const ds = getDS();
        const keys = (typeof getMergedRegions === 'function') ? getMergedRegions(ds) : [];
        const prev = regionSel.value;

        regionSel.textContent = '';
        regionSel.add(new Option('Select a region...', ''));

        keys.forEach(k => {
          const lbl = getRegionLabelForDataset(ds, k);
          regionSel.add(new Option(`${lbl} (${k})`, k));
        });

        // Restore selection where possible
        if ([...regionSel.options].some(o => o.value === prev)) regionSel.value = prev;

        renderLocations();
      } catch (error) {
        console.error('Failed to fill regions:', error);
        showToast('Failed to load regions', 'danger');
      }
    }

    function renderLocations() {
      try {
        const ds = getDS();
        const reg = regionSel.value;
        const listEl = document.getElementById('adm-location-list');
        if (!listEl) return;
        listEl.textContent = '';
        if (!reg) return;

        const def = (typeof getDefaultLocations === 'function') ? getDefaultLocations(ds, reg) : [];
        const merged = (typeof getMergedLocations === 'function') ? getMergedLocations(ds, reg) : [];
        const adminOnly = new Set(merged.filter(x => !def.includes(x)));

        merged.forEach(loc => {
          const li = document.createElement('li');
          li.className = 'list-group-item d-flex justify-content-between align-items-center';

          const left = document.createElement('span');
          left.textContent = loc;

          if (!adminOnly.has(loc)) {
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary ms-2';
            badge.textContent = 'default';
            left.appendChild(badge);
          }

          li.appendChild(left);

          if (adminOnly.has(loc)) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-outline-danger';
            btn.type = 'button';
            btn.innerHTML = '<i class="fa-solid fa-trash-can me-1"></i>Delete';
            btn.addEventListener('click', () => {
              if (!confirm(`Delete "${loc}" from this region?`)) return;
              try {
                adminDeleteLocation(ds, reg, loc);
                showToast('Location deleted', 'info');
                renderLocations();
                buildHomeDropdownMenus?.();
                if (typeof window.subPageInited !== 'undefined' && window.subPageInited) populateSubLocations();
              } catch (error) {
                console.error('Failed to delete location:', error);
                showToast('Failed to delete location', 'danger');
              }
            });
            li.appendChild(btn);
          }

          listEl.appendChild(li);
        });
      } catch (error) {
        console.error('Failed to render locations:', error);
        showToast('Failed to load locations', 'danger');
      }
    }

    function renderAdminTable() {
      try {
        const tbody = document.getElementById('adm-added-table');
        if (!tbody) return;
        const cfg = loadAdminConfig();
        const rows = [];
        ['scheme','plant','labs'].forEach(ds => {
          const regions = cfg.datasets[ds]?.regions || {};
          Object.entries(regions).forEach(([rk, rdata]) => {
            const label = rdata.label || '';
            if (Array.isArray(rdata.locations) && rdata.locations.length) {
              rdata.locations.forEach(loc => rows.push({ ds, rk, label, loc, type: 'loc' }));
            } else {
              rows.push({ ds, rk, label, loc: '—', type: 'region' });
            }
          });
        });

        tbody.textContent = '';

        if (!rows.length) {
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          td.colSpan = 5;
          td.className = 'text-center text-muted';
          td.textContent = 'No admin-added items yet.';
          tr.appendChild(td);
          tbody.appendChild(tr);
          return;
        }

        rows.forEach(r => {
          const tr = document.createElement('tr');

          const tdDs = document.createElement('td');
          tdDs.className = 'text-nowrap text-capitalize';
          tdDs.textContent = r.ds;

          const tdKey = document.createElement('td');
          const code = document.createElement('code');
          code.textContent = r.rk;
          tdKey.appendChild(code);

          const tdLabel = document.createElement('td');
          tdLabel.textContent = r.label || '-';

          const tdLoc = document.createElement('td');
          tdLoc.textContent = r.loc;

          const tdAct = document.createElement('td');
          const btn = document.createElement('button');
          btn.className = 'btn btn-sm btn-outline-danger';
          btn.type = 'button';
          btn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

          if (r.type === 'loc') {
            btn.addEventListener('click', () => {
              if (!confirm(`Delete location "${r.loc}"?`)) return;
              try {
                adminDeleteLocation(r.ds, r.rk, r.loc);
                showToast('Location deleted', 'info');
                fillRegions();
                renderAdminTable();
                buildHomeDropdownMenus?.();
                if (typeof window.subPageInited !== 'undefined' && window.subPageInited) { 
                  populateSubRegions(); 
                  populateSubLocations(); 
                }
              } catch (error) {
                console.error('Failed to delete location:', error);
                showToast('Failed to delete location', 'danger');
              }
            });
          } else {
            btn.addEventListener('click', () => {
              if (!confirm(`Remove region "${r.rk}" (admin-added only)?`)) return;
              try {
                adminDeleteRegion(r.ds, r.rk);
                showToast('Region removed', 'info');
                fillRegions();
                renderAdminTable();
                buildHomeDropdownMenus?.();
                if (typeof window.subPageInited !== 'undefined' && window.subPageInited) { 
                  populateSubRegions(); 
                  populateSubLocations(); 
                }
              } catch (error) {
                console.error('Failed to delete region:', error);
                showToast('Failed to delete region', 'danger');
              }
            });
          }
          tdAct.appendChild(btn);

          tr.append(tdDs, tdKey, tdLabel, tdLoc, tdAct);
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error('Failed to render admin table:', error);
        showToast('Failed to load admin table', 'danger');
      }
    }

    dsRadios.forEach(r => r.addEventListener('change', () => { 
      try {
        fillRegions(); 
        renderAdminTable(); 
      } catch (error) {
        console.error('Error handling dataset change:', error);
      }
    }));
    
    regionSel.addEventListener('change', () => { 
      try {
        renderLocations(); 
      } catch (error) {
        console.error('Error handling region change:', error);
      }
    });

    addRegionBtn?.addEventListener('click', () => {
      try {
        const ds = getDS();
        const inputKey = regionKeyEl?.value || '';
        const label = regionLabelEl?.value || '';
        if (!label.trim()) { 
          showToast('Enter a region label', 'danger'); 
          return; 
        }
        const key = (inputKey.trim() ? inputKey.trim().toUpperCase() : generateRegionKey(label));
        const addedKey = adminAddRegion(ds, key, label);
        showToast(`Region ${addedKey} added`, 'success');
        if (regionKeyEl) regionKeyEl.value = '';
        if (regionLabelEl) regionLabelEl.value = '';
        fillRegions();
        renderAdminTable();
        buildHomeDropdownMenus?.();
        if (typeof window.subPageInited !== 'undefined' && window.subPageInited) populateSubRegions();
      } catch (e) {
        console.error('Failed to add region:', e);
        showToast(e?.message || 'Failed to add region', 'danger');
      }
    });

    addLocBtn?.addEventListener('click', () => {
      try {
        const ds = getDS();
        const reg = regionSel.value;
        const name = locInput?.value || '';
        if (!reg) { 
          showToast('Select a region first', 'danger'); 
          return; 
        }
        if (!name.trim()) { 
          showToast('Enter a location name', 'danger'); 
          return; 
        }

        // Support comma or newline separated bulk entries, trimmed and de-duped
        const names = Array.from(new Set(name.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)));
        if (names.length === 0) {
          showToast('Enter valid location names', 'warning');
          return;
        }

        names.forEach(n => adminAddLocation(ds, reg, n));
        showToast(`${names.length} location(s) added`, 'success');
        if (locInput) locInput.value = '';
        renderLocations();
        renderAdminTable();
        buildHomeDropdownMenus?.();
        if (typeof window.subPageInited !== 'undefined' && window.subPageInited) populateSubLocations();
      } catch (e) {
        console.error('Failed to add locations:', e);
        showToast(e?.message || 'Failed to add location', 'danger');
      }
    });

    // Initial setup
    fillRegions();
    renderAdminTable();

    // Keep admin UI in sync if config changes elsewhere
    window.addEventListener('nwsdb:adminConfigUpdated', () => {
      try {
        fillRegions();
        renderAdminTable();
      } catch (error) {
        console.error('Error handling admin config update:', error);
      }
    });

    console.log('Admin page initialized successfully');
  } catch (error) {
    console.error('Failed to initialize admin page:', error);
    showToast('Failed to initialize admin page', 'danger');
  }
}

/* ===========================
   Year-dependent UI refresh
   =========================== */
function refreshYearDependentUI() {
  try {
    const appYear = (typeof window.getAppYear === 'function') ? window.getAppYear() : 2026;
    const startYear = 2015;
    const endYear = Math.max(startYear, (Number(appYear) || 2026) - 1);

    // Dashboard label
    const rangeEl = document.getElementById('scheme-growth-range');
    if (rangeEl) rangeEl.textContent = `${startYear}-${endYear}`;

    // If admin page is open, keep input synced
    const yearInput = document.getElementById('adm-reporting-year');
    if (yearInput) yearInput.value = String(appYear);

    // Rebuild scheme extended form sections (data entry)
    if (typeof window.ensureExtendedSectionsInjected === 'function') {
      window.ensureExtendedSectionsInjected();
    }

    // If submissions page is initialized, refresh charts/tables
    if (typeof window.renderSubmissions === 'function' && window.subPageInited) {
      window.renderSubmissions();
    }
  } catch (e) {
    console.warn('refreshYearDependentUI failed', e);
  }
}

window.refreshYearDependentUI = refreshYearDependentUI;

/* ===========================
   Exports
   =========================== */
window.initSubmissionsIfNeeded = initSubmissionsIfNeeded;
window.renderSubmissions = renderSubmissions;
window.exportSubmissionsCSV = exportSubmissionsCSV;
window.showAdminPage = showAdminPage;

/* ============================
   Submissions — Report (Scheme)
   ============================ */
function renderSubmissionsReport(dataset, rows) {
  try {
    const host = document.getElementById('sub-report-body');
    if (!host) return;
    host.innerHTML = '';
    if (dataset !== 'scheme') {
      host.innerHTML = '<div class="text-muted small">Select the Scheme dataset to view the report.</div>';
      return;
    }

    // Build a table of BULK connection entries with meta
    const items = [];
    rows.forEach(r => {
      (r.connections||[]).forEach(c => {
        const m = c.meta || {};
        if (m.accountNumber || m.quantity || m.monthlyBill || m.officerTel || m.supplierName || m.location) {
          items.push({
            date: r.submittedAt ? (new Date(r.submittedAt)).toLocaleDateString() : '',
            region: r.region,
            location: r.location,
            category: c.category,
            count: c.count,
            accountNumber: m.accountNumber || '',
            quantity: m.quantity ?? '',
            monthlyBill: m.monthlyBill ?? '',
            officerTel: m.officerTel || '',
            supplierName: m.supplierName || '',
            bulkLocation: m.location || ''
          });
        }
      });
    });

    if (!items.length) {
      host.innerHTML = '<div class="text-muted small">No bulk-connection meta found yet. Add connections with the Bulk fields to populate this report.</div>';
      return;
    }

    const totalQty = items.reduce((s,i)=>s+(Number(i.quantity)||0),0);
    const totalBill = items.reduce((s,i)=>s+(Number(i.monthlyBill)||0),0);

    const hdr = document.createElement('div');
    hdr.className = 'mb-2';
    hdr.innerHTML = `<div class="fw-semibold">Bulk Connections Report</div>
                     <div class="small text-muted">Rows: ${items.length} • Total Qty: ${totalQty} • Total Monthly Bill: ${totalBill.toLocaleString()}</div>`;
    host.appendChild(hdr);

    const table = document.createElement('table');
    table.className = 'table table-sm table-hover align-middle mb-0';
    table.innerHTML = `<thead><tr>
      <th>Date</th><th>Region</th><th>Location</th><th>Category</th><th>Count</th>
      <th>Account #</th><th>Quantity</th><th>Monthly Bill</th><th>Officer Tel</th><th>Supplier</th><th>Bulk Loc</th>
    </tr></thead><tbody></tbody>`;
    const tbody = table.querySelector('tbody');
    items.forEach(i => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i.date}</td><td>${formatRegionName(i.region)}</td><td>${i.location}</td>
                      <td>${i.category}</td><td>${i.count}</td>
                      <td>${i.accountNumber}</td><td>${i.quantity}</td><td>${i.monthlyBill}</td>
                      <td>${i.officerTel}</td><td>${i.supplierName}</td><td>${i.bulkLocation}</td>`;
      tbody.appendChild(tr);
    });
    host.appendChild(table);
  } catch(e){
    console.error('renderSubmissionsReport failed', e);
  }
}


// Simple CSV export + print for report
document.addEventListener('click', function(e){
  if (e.target && (e.target.id === 'sub-report-export' || e.target.closest('#sub-report-export'))) {
    const host = document.getElementById('sub-report-body');
    const table = host ? host.querySelector('table') : null;
    if (!table) return;
    const rows = Array.from(table.querySelectorAll('tr')).map(tr => Array.from(tr.children).map(td => ('"'+String(td.textContent).replace(/"/g,'""')+'"')));
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'submissions_report.csv'; a.click();
    URL.revokeObjectURL(url);
  }
  if (e.target && (e.target.id === 'sub-report-print' || e.target.closest('#sub-report-print'))) {
    const host = document.getElementById('sub-report-body');
    if (!host) return;
    const w = window.open('', '_blank');
    w.document.write('<html><head><title>Report</title></head><body>'+host.innerHTML+'</body></html>');
    w.document.close();
    w.focus();
    w.print();
  }
});
