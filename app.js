/* ===========================
   app.js (updated)
   - KCWTP page
   - CE (NRW) page
   - Map page (Leaflet)
   - Login system
   - M(PROD) manpower document
   - DOM init hooks
   =========================== */

/* ===========================
   Globals + Safe fallbacks
   =========================== */
(function ensureGlobals() {
  // Map state (private app map)
  if (typeof window.PLANT_MAP === 'undefined') window.PLANT_MAP = null;
  if (typeof window.PLANT_MARKERS === 'undefined') window.PLANT_MARKERS = [];
  if (typeof window.MAP_UI_BOUND === 'undefined') window.MAP_UI_BOUND = false;

  // parseNum fallback
  if (typeof window.parseNum !== 'function') {
    window.parseNum = function(v) {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
  }

  // Leaflet loader fallback
  if (typeof window.ensureLeaflet !== 'function') {
    window.ensureLeaflet = function ensureLeaflet() {
      return new Promise(resolve => {
        if (window.L && window.L.map) return resolve(true);

        // CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // JS
        if (!document.getElementById('leaflet-js')) {
          const s = document.createElement('script');
          s.id = 'leaflet-js';
          s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          s.onload = () => resolve(true);
          s.onerror = () => resolve(false);
          document.body.appendChild(s);
        }

        let tries = 0;
        const iv = setInterval(() => {
          if (window.L && window.L.map) { clearInterval(iv); resolve(true); }
          if (++tries > 60) { clearInterval(iv); resolve(false); }
        }, 100);
      });
    };
  }
})();

/* ===========================
   HRM KCWTP (Kandy City Wastewater Treatment Plant)
   =========================== */

function showHRMKCWTPPage() {
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) { 
    if (typeof showLoginPrompt === 'function') showLoginPrompt({ adminTab: false }); 
    return; 
  }
  if (typeof togglePage === 'function') togglePage('hrm-kcwtp-page');
  setTimeout(buildKCWTPTemplate, 100);
}

function buildKCWTPTemplate() {
  const table = document.getElementById('hrm-kcwtp-table');
  if (!table) return;

  table.innerHTML = '';

  const roleOfConnection = document.getElementById('hrm-kcwtp-connection-input')?.value || '';
  const plantCapacity = document.getElementById('hrm-kcwtp-capacity-input')?.value || '';

  const designations = [
    "Manager",
    "Electrical engineer", 
    "Chemist",
    "Engineer Assistant Civil",
    "Engineer Assistant Mechanical",
    "Management Assistant",
    "Treatment Plant Technician",
    "Laboratory Assistant",
    "Driver",
    "Labour",
    "Electrician", 
    "Mechanic",
    "Pump operator"
  ];

  let tableHTML = '';

  // Fix colspan to 12 to match data columns
  tableHTML += `
    <tr>
      <th colspan="12" id="hrm-kcwtp-title" style="text-align: center; font-size: 16px; padding: 15px;">
        <div style="font-weight: bold; font-size: 18px;">CAREK: Central</div>
        <div style="margin-top: 5px;">Manager Zone: Kandy City Wastewater Treatment Plant</div>
        <div style="margin-top: 5px;">
          ${roleOfConnection ? 'Role of Connection: ' + roleOfConnection : ''}
          ${plantCapacity ? (roleOfConnection ? ' • ' : '') + 'Plant Capacity: ' + plantCapacity : ''}
        </div>
      </th>
    </tr>
  `;

  tableHTML += `<tr><td colspan="12" style="height: 15px; background-color: #f8f9fa;"></td></tr>`;

  tableHTML += `
    <tr style="background-color: #e9ecef;">
      <th rowspan="2" style="width: 5%;">No.</th>
      <th rowspan="2" style="width: 20%;">Designation</th>
      <th rowspan="2" style="width: 8%;">2014 approved<br>Gafre (A)</th>
      <th colspan="3" style="width: 18%;">Nos. Available</th>
      <th rowspan="2" style="width: 8%;">Total Available<br>Staff<br>(E = B+C+D)</th>
      <th colspan="3" style="width: 18%;">For New Gafre (2015 onwards)</th>
      <th rowspan="2" style="width: 8%;">Vacancies to be<br>Filled<br>(I = H - E)</th>
      <th rowspan="2" style="width: 15%;">Remarks</th>
    </tr>
  `;

  tableHTML += `
    <tr style="background-color: #e9ecef;">
      <th style="width: 6%;">In Permanent<br>(B)</th>
      <th style="width: 6%;">In Active<br>(C)</th>
      <th style="width: 6%;">In Manpower<br>Controls (D)</th>
      <th style="width: 6%;">Total Nos.<br>Proposed for<br>Permanent (F)</th>
      <th style="width: 6%;">Total Nos.<br>Proposed for<br>Manpower (G)</th>
      <th style="width: 6%;">Total Proposed<br>Staff<br>(H = F+G)</th>
    </tr>
  `;

  for (let i = 0; i < designations.length; i++) {
    const rowNum = i + 5;
    const designation = designations[i];
    const serialNo = String(i + 1).padStart(2, '0');

    tableHTML += `
      <tr>
        <td style="text-align: center; font-weight: bold;">${serialNo}</td>
        <td style="font-weight: 500;">${designation}</td>
        <td><input type="number" class="form-control form-control-sm kcwtp-input" data-col="A" data-row="${rowNum}" min="0" style="text-align: center;"></td>
        <td><input type="number" class="form-control form-control-sm kcwtp-input" data-col="B" data-row="${rowNum}" min="0" style="text-align: center;"></td>
        <td><input type="number" class="form-control form-control-sm kcwtp-input" data-col="C" data-row="${rowNum}" min="0" style="text-align: center;"></td>
        <td><input type="number" class="form-control form-control-sm kcwtp-input" data-col="D" data-row="${rowNum}" min="0" style="text-align: center;"></td>
        <td style="text-align: center; font-weight: bold; background-color: #f8f9fa;" id="total-available-${rowNum}">0</td>
        <td><input type="number" class="form-control form-control-sm kcwtp-input" data-col="F" data-row="${rowNum}" min="0" style="text-align: center;"></td>
        <td><input type="number" class="form-control form-control-sm kcwtp-input" data-col="G" data-row="${rowNum}" min="0" style="text-align: center;"></td>
        <td style="text-align: center; font-weight: bold; background-color: #f8f9fa;" id="total-proposed-${rowNum}">0</td>
        <td style="text-align: center; font-weight: bold; background-color: #f8f9fa;" id="vacancies-${rowNum}">0</td>
        <td><input type="text" class="form-control form-control-sm kcwtp-input" data-col="K" data-row="${rowNum}" style="text-align: center;"></td>
      </tr>
    `;
  }

  tableHTML += `
    <tr style="background-color: #dee2e6; font-weight: bold;">
      <td colspan="2" style="text-align: center;">Total</td>
      <td style="text-align: center;" id="total-A">0</td>
      <td style="text-align: center;" id="total-B">0</td>
      <td style="text-align: center;" id="total-C">0</td>
      <td style="text-align: center;" id="total-D">0</td>
      <td style="text-align: center;" id="total-E">0</td>
      <td style="text-align: center;" id="total-F">0</td>
      <td style="text-align: center;" id="total-G">0</td>
      <td style="text-align: center;" id="total-H">0</td>
      <td style="text-align: center;" id="total-I">0</td>
      <td></td>
    </tr>
  `;

  table.innerHTML = tableHTML;

  attachKCWTPCalculations();
}

function attachKCWTPCalculations() {
  // Remove any existing listeners by cloning inputs
  const numberInputs = document.querySelectorAll('.kcwtp-input[type="number"]');
  numberInputs.forEach(input => {
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
  });

  // Re-attach listeners
  document.querySelectorAll('.kcwtp-input[type="number"]').forEach(input => {
    input.addEventListener('input', calculateKCWTPRow);
  });

  // Title inputs
  ['hrm-kcwtp-connection-input', 'hrm-kcwtp-capacity-input'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.addEventListener('input', updateKCWTPTitle);
  });

  // Initial totals
  calculateKCWTPTotal();
}

function calculateKCWTPRow() {
  const input = this;
  const row = input.getAttribute('data-row');
  if (!row) return;

  try {
    const bVal = parseFloat(document.querySelector(`.kcwtp-input[data-col="B"][data-row="${row}"]`)?.value) || 0;
    const cVal = parseFloat(document.querySelector(`.kcwtp-input[data-col="C"][data-row="${row}"]`)?.value) || 0;
    const dVal = parseFloat(document.querySelector(`.kcwtp-input[data-col="D"][data-row="${row}"]`)?.value) || 0;
    const fVal = parseFloat(document.querySelector(`.kcwtp-input[data-col="F"][data-row="${row}"]`)?.value) || 0;
    const gVal = parseFloat(document.querySelector(`.kcwtp-input[data-col="G"][data-row="${row}"]`)?.value) || 0;

    const totalAvailable = bVal + cVal + dVal;
    const totalProposed = fVal + gVal;
    const vacancies = totalProposed - totalAvailable;

    const totalAvailableEl = document.getElementById(`total-available-${row}`);
    const totalProposedEl = document.getElementById(`total-proposed-${row}`);
    const vacanciesEl = document.getElementById(`vacancies-${row}`);

    if (totalAvailableEl) totalAvailableEl.textContent = totalAvailable;
    if (totalProposedEl) totalProposedEl.textContent = totalProposed;
    if (vacanciesEl) vacanciesEl.textContent = vacancies;

    calculateKCWTPTotal();
  } catch (error) {
    console.error('Error in calculateKCWTPRow:', error);
  }
}

function calculateKCWTPTotal() {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  columns.forEach(col => {
    let total = 0;
    if (['E', 'H', 'I'].includes(col)) {
      for (let i = 5; i <= 17; i++) {
        let elementId, value;
        if (col === 'E') {
          elementId = `total-available-${i}`;
          value = parseFloat(document.getElementById(elementId)?.textContent) || 0;
        } else if (col === 'H') {
          elementId = `total-proposed-${i}`;
          value = parseFloat(document.getElementById(elementId)?.textContent) || 0;
        } else if (col === 'I') {
          elementId = `vacancies-${i}`;
          value = parseFloat(document.getElementById(elementId)?.textContent) || 0;
        }
        total += value;
      }
    } else {
      document.querySelectorAll(`.kcwtp-input[data-col="${col}"]`).forEach(input => {
        total += parseFloat(input.value) || 0;
      });
    }
    const totalEl = document.getElementById(`total-${col}`);
    if (totalEl) totalEl.textContent = total;
  });
}

function updateKCWTPTitle() {
  const roleOfConnection = document.getElementById('hrm-kcwtp-connection-input')?.value || '';
  const plantCapacity = document.getElementById('hrm-kcwtp-capacity-input')?.value || '';

  const titleEl = document.getElementById('hrm-kcwtp-title');
  if (titleEl) {
    let titleHTML = '<div style="font-weight: bold; font-size: 18px;">CAREK: Central</div><div style="margin-top: 5px;">Manager Zone: Kandy City Wastewater Treatment Plant</div>';
    if (roleOfConnection || plantCapacity) {
      titleHTML += '<div style="margin-top: 5px;">';
      if (roleOfConnection) titleHTML += 'Role of Connection: ' + roleOfConnection;
      if (roleOfConnection && plantCapacity) titleHTML += ' • ';
      if (plantCapacity) titleHTML += 'Plant Capacity: ' + plantCapacity;
      titleHTML += '</div>';
    }
    titleEl.innerHTML = titleHTML;
  }
}

// Debug helper (prevent undefined export crash)
function debugKCWTPTable() {
  const rows = document.querySelectorAll('#hrm-kcwtp-table tbody tr');
  console.log('[KCWTP] rows:', rows.length);
  console.log('[KCWTP] totals:', {
    A: document.getElementById('total-A')?.textContent,
    B: document.getElementById('total-B')?.textContent,
    C: document.getElementById('total-C')?.textContent,
    D: document.getElementById('total-D')?.textContent,
    E: document.getElementById('total-E')?.textContent,
    F: document.getElementById('total-F')?.textContent,
    G: document.getElementById('total-G')?.textContent,
    H: document.getElementById('total-H')?.textContent,
    I: document.getElementById('total-I')?.textContent
  });
}

window.showHRMKCWTPPage = showHRMKCWTPPage;
window.attachKCWTPCalculations = attachKCWTPCalculations;
window.debugKCWTPTable = debugKCWTPTable;

/* ===========================
   HRM CE (NRW) — Chief Engineer Non-Revenue Water
   =========================== */

function showHRMCENRWPage() {
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) { 
    if (typeof showLoginPrompt === 'function') showLoginPrompt({ adminTab: false }); 
    return; 
  }
  if (typeof togglePage === 'function') togglePage('hrm-ce-nrw-page');
  setTimeout(buildCENRWTemplate, 100);
}

function buildCENRWTemplate() {
  const table = document.getElementById('hrm-ce-nrw-table');
  if (!table) return;

  table.innerHTML = '';

  const yearOnwards = document.getElementById('hrm-ce-nrw-year-input')?.value || '[Year]';

  const designations = [
    "Chief Engineer (Civil)",
    "Engineer (Civil)", 
    "Engineering Assistant (Civil)",
    "Management Assistant (MR)",
    "Skilled Labour",
    "Laborer"
  ];

  let tableHTML = '';

  // Fix colspan to 12 to match data columns
  tableHTML += `
    <tr>
      <th colspan="12" id="hrm-ce-nrw-title" style="text-align: center; padding: 20px;">
        <div style="font-weight: bold; font-size: 18px;">RSC: Central</div>
        <div style="margin-top: 8px; font-size: 16px;">Manager Zone : Chief Engineer (NRW)</div>
        <div style="margin-top: 5px; font-size: 14px;">For New Cadre (${yearOnwards} onwards)</div>
      </th>
    </tr>
  `;

  tableHTML += `<tr><td colspan="12" style="height: 15px; background-color: #f8f9fa;"></td></tr>`;

  tableHTML += `
    <tr style="background-color: #e9ecef;">
      <th rowspan="2" style="width: 5%;">No.</th>
      <th rowspan="2" style="width: 22%;">Designation</th>
      <th rowspan="2" style="width: 8%;">Approved<br>Cadre (A)</th>
      <th colspan="3" style="width: 20%;">Nos. Available</th>
      <th rowspan="2" style="width: 10%;">Total Available<br>Staff<br>(E = B+C+D)</th>
      <th colspan="3" id="ce-nrw-new-cadre-header" style="width: 20%;">For New Cadre (${yearOnwards} onwards)</th>
      <th rowspan="2" style="width: 8%;">Vacancies to be<br>Filled<br>(I = H - E)</th>
      <th rowspan="2" style="width: 7%;">Remarks</th>
    </tr>
  `;

  tableHTML += `
    <tr style="background-color: #e9ecef;">
      <th style="width: 7%;">In Permanent<br>(B)</th>
      <th style="width: 7%;">In Attempted<br>(C)</th>
      <th style="width: 6%;">In Manpower<br>Contracts (D)</th>
      <th style="width: 7%;">Total Nos.<br>Proposed for<br>Permanent (F)</th>
      <th style="width: 7%;">Total Nos.<br>Proposed for<br>Manpower (G)</th>
      <th style="width: 6%;">Total Proposed<br>Staff<br>(H = F+G)</th>
    </tr>
  `;

  for (let i = 0; i < designations.length; i++) {
    const rowNum = i + 5;
    const designation = designations[i];
    const serialNo = String(i + 1).padStart(2, '0');

    tableHTML += `
      <tr>
        <td class="ce-nrw-readonly">${serialNo}</td>
        <td class="ce-nrw-readonly" style="text-align: left;">${designation}</td>
        <td><input type="number" class="form-control form-control-sm ce-nrw-input" data-col="A" data-row="${rowNum}" min="0"></td>
        <td><input type="number" class="form-control form-control-sm ce-nrw-input" data-col="B" data-row="${rowNum}" min="0"></td>
        <td><input type="number" class="form-control form-control-sm ce-nrw-input" data-col="C" data-row="${rowNum}" min="0"></td>
        <td><input type="number" class="form-control form-control-sm ce-nrw-input" data-col="D" data-row="${rowNum}" min="0"></td>
        <td class="ce-nrw-readonly" id="total-available-${rowNum}">0</td>
        <td><input type="number" class="form-control form-control-sm ce-nrw-input" data-col="F" data-row="${rowNum}" min="0"></td>
        <td><input type="number" class="form-control form-control-sm ce-nrw-input" data-col="G" data-row="${rowNum}" min="0"></td>
        <td class="ce-nrw-readonly" id="total-proposed-${rowNum}">0</td>
        <td class="ce-nrw-readonly" id="vacancies-${rowNum}">0</td>
        <td><input type="text" class="form-control form-control-sm ce-nrw-input" data-col="K" data-row="${rowNum}" style="text-align: left;"></td>
      </tr>
    `;
  }

  tableHTML += `
    <tr class="ce-nrw-total-row">
      <td colspan="2" style="text-align: center;">Total</td>
      <td style="text-align: center;" id="total-A">0</td>
      <td style="text-align: center;" id="total-B">0</td>
      <td style="text-align: center;" id="total-C">0</td>
      <td style="text-align: center;" id="total-D">0</td>
      <td style="text-align: center;" id="total-E">0</td>
      <td style="text-align: center;" id="total-F">0</td>
      <td style="text-align: center;" id="total-G">0</td>
      <td style="text-align: center;" id="total-H">0</td>
      <td style="text-align: center;" id="total-I">0</td>
      <td></td>
    </tr>
  `;

  table.innerHTML = tableHTML;

  attachCENRWCalculations();
}

function attachCENRWCalculations() {
  // Remove duplicates
  const numberInputs = document.querySelectorAll('.ce-nrw-input[type="number"]');
  numberInputs.forEach(input => {
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
  });

  document.querySelectorAll('.ce-nrw-input[type="number"]').forEach(input => {
    input.addEventListener('input', calculateCENRWRow);
  });

  const yearInput = document.getElementById('hrm-ce-nrw-year-input');
  if (yearInput) {
    yearInput.addEventListener('input', updateCENRWTitle);
  }

  calculateCENRWTotal();
}

function calculateCENRWRow() {
  const input = this;
  const row = input.getAttribute('data-row');
  if (!row) return;

  try {
    const bVal = parseFloat(document.querySelector(`.ce-nrw-input[data-col="B"][data-row="${row}"]`)?.value) || 0;
    const cVal = parseFloat(document.querySelector(`.ce-nrw-input[data-col="C"][data-row="${row}"]`)?.value) || 0;
    const dVal = parseFloat(document.querySelector(`.ce-nrw-input[data-col="D"][data-row="${row}"]`)?.value) || 0;
    const fVal = parseFloat(document.querySelector(`.ce-nrw-input[data-col="F"][data-row="${row}"]`)?.value) || 0;
    const gVal = parseFloat(document.querySelector(`.ce-nrw-input[data-col="G"][data-row="${row}"]`)?.value) || 0;

    const totalAvailable = bVal + cVal + dVal;
    const totalProposed = fVal + gVal;
    const vacancies = totalProposed - totalAvailable;

    const totalAvailableEl = document.getElementById(`total-available-${row}`);
    const totalProposedEl = document.getElementById(`total-proposed-${row}`);
    const vacanciesEl = document.getElementById(`vacancies-${row}`);

    if (totalAvailableEl) totalAvailableEl.textContent = totalAvailable;
    if (totalProposedEl) totalProposedEl.textContent = totalProposed;
    if (vacanciesEl) vacanciesEl.textContent = vacancies;

    calculateCENRWTotal();
  } catch (error) {
    console.error('Error in calculateCENRWRow:', error);
  }
}

function calculateCENRWTotal() {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  columns.forEach(col => {
    let total = 0;

    if (['E', 'H', 'I'].includes(col)) {
      for (let i = 5; i <= 10; i++) {
        let value = 0;
        if (col === 'E') value = parseFloat(document.getElementById(`total-available-${i}`)?.textContent) || 0;
        if (col === 'H') value = parseFloat(document.getElementById(`total-proposed-${i}`)?.textContent) || 0;
        if (col === 'I') value = parseFloat(document.getElementById(`vacancies-${i}`)?.textContent) || 0;
        total += value;
      }
    } else {
      document.querySelectorAll(`.ce-nrw-input[data-col="${col}"]`).forEach(input => {
        total += parseFloat(input.value) || 0;
      });
    }

    const totalEl = document.getElementById(`total-${col}`);
    if (totalEl) totalEl.textContent = total;
  });
}

function updateCENRWTitle() {
  const yearOnwards = document.getElementById('hrm-ce-nrw-year-input')?.value || '[Year]';
  const titleEl = document.getElementById('hrm-ce-nrw-title');
  if (titleEl) {
    titleEl.innerHTML = `
      <div style="font-weight: bold; font-size: 18px;">RSC: Central</div>
      <div style="margin-top: 8px; font-size: 16px;">Manager Zone : Chief Engineer (NRW)</div>
      <div style="margin-top: 5px; font-size: 14px;">For New Cadre (${yearOnwards} onwards)</div>
    `;
  }
  const hdr = document.getElementById('ce-nrw-new-cadre-header');
  if (hdr) hdr.textContent = `For New Cadre (${yearOnwards} onwards)`;
}

window.showHRMCENRWPage = showHRMCENRWPage;

// Debug helper
function debugCENRWTable() {
  console.log('=== CE NRW Table Debug ===');
  const inputs = document.querySelectorAll('.ce-nrw-input');
  console.log('Total CE NRW inputs:', inputs.length);
  for (let i = 5; i <= 10; i++) {
    const availableEl = document.getElementById(`total-available-${i}`);
    const proposedEl = document.getElementById(`total-proposed-${i}`);
    const vacanciesEl = document.getElementById(`vacancies-${i}`);
    console.log(`Row ${i}:`, {
      available: !!availableEl,
      proposed: !!proposedEl,
      vacancies: !!vacanciesEl
    });
  }
}
window.debugCENRWTable = debugCENRWTable;

/* ===========================
   Map Page (Leaflet): Plants map + filters + geolocate
   =========================== */
function getPlantRecordsWithGeo() {
  if (typeof lsAll !== 'function') return [];
  const arr = lsAll('nwsdb:plant:');
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
}

function plantPopupHTML(p) {
  const cap = [];
  if (p.designedCapacity != null) cap.push(`Designed: ${p.designedCapacity}`);
  if (p.operationalCapacity != null) cap.push(`Operational: ${p.operationalCapacity}`);
  const capLine = cap.length ? `<div class="small text-muted mb-2">${cap.join(' • ')}</div>` : '';
  const tt = p.treatmentType ? `<div class="small mb-2">Treatment: ${p.treatmentType}</div>` : '';

  const regionLabel = (typeof window.formatRegionName === 'function') ? window.formatRegionName(p.region) : p.region;

  let gallery = '';
  if (p.photos && p.photos.length > 0) {
    const validPhotos = p.photos.filter(photo => photo && (photo.startsWith('http') || photo.startsWith('data:image')));
    const photoHTML = validPhotos.slice(0, 6).map((photoUrl, index) => {
      const safeUrl = photoUrl.startsWith('data:image') ? photoUrl : `${photoUrl}?t=${Date.now()}`;
      return `<img src="${safeUrl}" alt="Plant photo ${index + 1}" class="plant-popup-photo" data-region="${p.region}" data-location="${p.location}" data-index="${index}" loading="lazy" style="cursor:pointer; width: 80px; height: 60px; object-fit: cover; margin: 2px; border-radius: 4px;" onerror="this.style.display='none'">`;
    }).join('');
    gallery = `
      <div class="plant-popup-section mt-3">
        <div class="small fw-semibold mb-2">Photos (${validPhotos.length})</div>
        <div class="plant-popup-photos-grid" style="display: flex; flex-wrap: wrap; gap: 4px;">${photoHTML}</div>
        ${validPhotos.length > 6 ? `<div class="small text-muted mt-1">+${validPhotos.length - 6} more photos</div>` : ''}
        <button class="btn btn-sm btn-outline-primary mt-2 w-100 view-all-photos-btn" data-region="${p.region}" data-location="${p.location}">
          <i class="fa-solid fa-images me-1"></i>View All Photos
        </button>
      </div>
    `;
  }

  return `
    <div style="max-width: 280px;">
      <div class="fw-semibold mb-2">${regionLabel} — ${p.location}</div>
      ${capLine}
      ${tt}
      ${gallery}
    </div>
  `;
}

function clearPlantMarkers() {
  if (!window.PLANT_MAP || !Array.isArray(window.PLANT_MARKERS) || !window.PLANT_MARKERS.length) return;
  window.PLANT_MARKERS.forEach(m => m.remove());
  window.PLANT_MARKERS = [];
}

function addPlantMarkers(records) {
  clearPlantMarkers();
  if (!window.PLANT_MAP) return;
  const group = [];
  records.forEach(p => {
    try {
      const m = L.marker([p.lat, p.lng]);
      m.bindPopup(plantPopupHTML(p));
      m.addTo(window.PLANT_MAP);
      group.push(m);
    } catch (err) {
      console.warn('Marker add failed', err);
    }
  });
  window.PLANT_MARKERS = group;
  if (group.length) {
    const b = L.latLngBounds(group.map(m => m.getLatLng()));
    window.PLANT_MAP.fitBounds(b.pad(0.2));
  }
}

function showMapPage() {
  if (typeof showToast === 'function') showToast('Map feature has been removed from this build.', 'info');
  return;
}
window.showMapPage = showMapPage;

/* ===========================
   Login System (Modal)
   =========================== */
function handleLogin(event) {
  if (event) event.preventDefault();

  const scopeSel = document.getElementById('loginScope');
  const scope = String(scopeSel?.value || 'RSC').trim().toUpperCase();

  const emailInput = document.getElementById('email');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('password');
  const rememberMe = document.getElementById('rememberMe');
  const submitBtn = document.getElementById('loginSubmitBtn');

  if (!passwordInput) {
    if (typeof showToast === 'function') showToast('Login form not properly loaded', 'danger');
    return false;
  }

  const password = passwordInput.value || '';
  const remember = rememberMe ? rememberMe.checked : false;

  // UI loading
  submitBtn?.classList.add('loading');
  submitBtn?.setAttribute('disabled', 'true');
  submitBtn?.querySelector('.btn-spinner')?.classList.remove('d-none');

  const finish = (ok, msg, toastType='success') => {
    if (ok) {
      if (typeof setLoggedIn === 'function') setLoggedIn(remember);
      if (typeof setRole === 'function') setRole('user', remember);
      if (typeof showToast === 'function') showToast(msg, toastType);

      const modalEl = document.getElementById('loginModal');
      if (modalEl && window.bootstrap?.Modal) bootstrap.Modal.getOrCreateInstance(modalEl).hide();

      document.getElementById('landing-page')?.setAttribute('style','display:none');
      document.getElementById('public-nav')?.setAttribute('style','display:none');
      document.getElementById('app-shell')?.setAttribute('style','display:block');

      try { typeof window.applyAccessControlUI === 'function' && window.applyAccessControlUI(); } catch(_) {}
      try { typeof buildHomeDropdownMenus === 'function' && buildHomeDropdownMenus(); } catch(_) {}
      if (typeof showHomePage === 'function') showHomePage();
    } else {
      if (typeof showToast === 'function') showToast(msg, toastType);
    }

    submitBtn?.classList.remove('loading');
    submitBtn?.removeAttribute('disabled');
    submitBtn?.querySelector('.btn-spinner')?.classList.add('d-none');
  };

  // Basic validation
  if (!password) {
    finish(false, 'Please enter your password', 'danger');
    return false;
  }

  setTimeout(() => { // simulate auth latency
    // RSC (full access): use the existing email/password demo login
    if (scope === 'RSC') {
      const email = String(emailInput?.value || '').trim();
      if (!email) return finish(false, 'Please enter your email', 'danger');

      if (typeof DEMO_CREDENTIALS !== 'undefined' && email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        try { typeof setUserScope === 'function' && setUserScope('RSC', remember); } catch(_) {}
        try { typeof setUserRegion === 'function' && setUserRegion('', remember); } catch(_) {}
        return finish(true, 'Login successful! Welcome to NWSDB Portal.', 'success');
      }
      return finish(false, 'Invalid email or password. Use: nwsbrsccit@gmail.com / 123', 'danger');
    }

    // Regional (restricted): username/password per office
    const user = String(usernameInput?.value || '').trim();
    if (!user) return finish(false, 'Please enter your username', 'danger');

    const creds = (typeof MAIN_LOGIN_CREDENTIALS !== 'undefined') ? MAIN_LOGIN_CREDENTIALS[scope] : null;
    if (!creds) return finish(false, 'Invalid office selection', 'danger');

    if (user === creds.username && password === creds.password) {
      try { typeof setUserScope === 'function' && setUserScope(scope, remember); } catch(_) {}
      try { typeof setUserRegion === 'function' && setUserRegion(scope, remember); } catch(_) {}
      return finish(true, `Login successful! (${scope.replace(/([A-Z]+)(NORTH|SOUTH|EAST)/, '$1 $2')})`, 'success');
    }

    return finish(false, 'Invalid username or password for selected office', 'danger');
  }, 450);

  return true;
}

function handleAdminLogin(e) {
  e?.preventDefault();
  const u = document.getElementById('adminUsername')?.value.trim();
  const p = document.getElementById('adminPassword')?.value || '';
  if (!u || !p) { if (typeof showToast === 'function') showToast('Enter username and password', 'danger'); return; }

  if (u === 'admin' && p === 'pass1') {
    if (typeof setLoggedIn === 'function') setLoggedIn(true);
    if (typeof setRole === 'function') setRole('admin', true);

    if (typeof showToast === 'function') showToast('Admin login successful', 'success');

    const lp  = document.getElementById('landing-page');
    const pub = document.getElementById('public-nav');
    const app = document.getElementById('app-shell');
    if (lp && pub && app) {
      lp.style.display = 'none';
      pub.style.display = 'none';
      app.style.display = 'block';
    }

    const modalEl = document.getElementById('loginModal');
    if (modalEl && window.bootstrap?.Modal) bootstrap.Modal.getOrCreateInstance(modalEl).hide();

    if (typeof showAdminPage === 'function') showAdminPage();
  } else {
    if (typeof showToast === 'function') showToast('Invalid admin credentials', 'danger');
  }
}

function handleLogout() {
  if (typeof clearSession === 'function') clearSession();
  if (typeof showToast === 'function') showToast('Logged out successfully.', 'info');

  document.getElementById('app-shell')?.setAttribute('style','display:none');
  document.getElementById('landing-page')?.setAttribute('style','display:block');
  document.getElementById('public-nav')?.setAttribute('style','display:block');

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.reset();
}

/* ===========================
   HRM M(PROD) — Production Dept Manpower Document
   =========================== */
(() => {
  // Toggle formulas: true = standard (E=B+C+D, H=F+G, I=H-E), false = literal variants
  const MPROD_USE_STANDARD_FORMULAS = true;

  const fLabel = {
    sectionE: () => MPROD_USE_STANDARD_FORMULAS ? 'E = B + C + D' : 'E = B - C + D',
    sectionH: () => MPROD_USE_STANDARD_FORMULAS ? 'H = F + G'     : 'H = F + C',
    sectionI: () => 'I = H - E',
    summaryE: () => MPROD_USE_STANDARD_FORMULAS ? 'E = B + C + D' : 'E = B + C + B',
    summaryH: () => MPROD_USE_STANDARD_FORMULAS ? 'H = F + G'     : 'H = F + C',
    summaryI: () => MPROD_USE_STANDARD_FORMULAS ? 'I = H - E'     : 'I = H - G'
  };

  function parseN(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
    }

  function computeSectionRow(tr) {
    const B = parseN(tr.querySelector('input[data-col="B"]')?.value);
    const C = parseN(tr.querySelector('input[data-col="C"]')?.value);
    const D = parseN(tr.querySelector('input[data-col="D"]')?.value);
    const F = parseN(tr.querySelector('input[data-col="F"]')?.value);
    const G = parseN(tr.querySelector('input[data-col="G"]')?.value);
    const E = MPROD_USE_STANDARD_FORMULAS ? (B + C + D) : (B - C + D);
    const H = MPROD_USE_STANDARD_FORMULAS ? (F + G)     : (F + C);
    const I = H - E;
    const eCell = tr.querySelector('td[data-out="E"]');
    const hCell = tr.querySelector('td[data-out="H"]');
    const iCell = tr.querySelector('td[data-out="I"]');
    if (eCell) eCell.textContent = String(E);
    if (hCell) hCell.textContent = String(H);
    if (iCell) iCell.textContent = String(I);
  }

  function computeSummaryRow(tr) {
    const B = parseN(tr.querySelector('input[data-col="B"]')?.value);
    const C = parseN(tr.querySelector('input[data-col="C"]')?.value);
    const D = parseN(tr.querySelector('input[data-col="D"]')?.value);
    const F = parseN(tr.querySelector('input[data-col="F"]')?.value);
    const G = parseN(tr.querySelector('input[data-col="G"]')?.value);

    const E = MPROD_USE_STANDARD_FORMULAS ? (B + C + D) : (B + C + B);
    const H = MPROD_USE_STANDARD_FORMULAS ? (F + G)     : (F + C);
    const I = MPROD_USE_STANDARD_FORMULAS ? (H - E)     : (H - G);

    const eCell = tr.querySelector('td[data-out="E"]');
    const hCell = tr.querySelector('td[data-out="H"]');
    const iCell = tr.querySelector('td[data-out="I"]');
    if (eCell) eCell.textContent = String(E);
    if (hCell) hCell.textContent = String(H);
    if (iCell) iCell.textContent = String(I);
  }

  function attachMProdCalculations(root) {
    root.querySelectorAll('.mprod-table-section').forEach(tbl => {
      tbl.querySelectorAll('input[type="number"]').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const tr = e.target.closest('tr');
          if (tr) computeSectionRow(tr);
        });
      });
    });
    const sumTbl = root.querySelector('.mprod-table-summary');
    if (sumTbl) {
      sumTbl.querySelectorAll('input[type="number"]').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const tr = e.target.closest('tr');
          if (tr && tr.dataset.role === 'data') computeSummaryRow(tr);
        });
      });
    }
  }

  function renderSection(num, sub) {
    return `
      <section class="mprod-section mb-4" data-section="${num}">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h5 class="mb-0">Section ${num} — ${sub}</h5>
          <span class="text-muted small">Production Department</span>
          <div class="d-flex align-items-center gap-2">
            <button type="button" class="btn btn-sm btn-success" data-action="mprod-save-section" data-section="${num}">
              <i class="fa-solid fa-cloud-arrow-up me-1"></i> Save Section ${num}
            </button>
          </div>
        </div>

        <div class="mprod-header p-2 bg-light rounded border mb-2">
          <div class="mprod-headline fw-semibold">RSC: Central Manager Insert Manager (Production)</div>
          <div class="mprod-connections small text-muted">Mark Connections:</div>
        </div>

        <div class="table-responsive">
          <table class="table mprod-table mprod-table-section">
            <colgroup>
              <col style="width:14%">
              <col style="width:14%">
              <col style="width:8%">
              <col style="width:8%">
              <col style="width:8%">
              <col style="width:8%">
              <col style="width:10%">
              <col style="width:8%">
              <col style="width:8%">
              <col style="width:10%">
              <col style="width:10%">
              <col style="width:12%">
              <col style="width:14%">
            </colgroup>
            <thead>
              <tr>
                <th rowspan="2">Name</th>
                <th rowspan="2">Designation</th>
                <th rowspan="2">Nom approved Code (A)</th>
                <th rowspan="2">Non-Available in Permanent (B)</th>
                <th rowspan="2">Non-Available In Permeable Acting (C)</th>
                <th rowspan="2">Non- Available In Manpower Contract (D)</th>
                <th rowspan="2">Total Available Staff <span class="text-muted small">(${fLabel.sectionE()})</span></th>
                <th colspan="3">For New Code (Long onwards)</th>
                <th rowspan="2">Valuation to be Title <span class="text-muted small">(${fLabel.sectionI()})</span></th>
                <th rowspan="2">Remarks</th>
                <th rowspan="2">Justification for Additional Proposed Staff</th>
              </tr>
              <tr>
                <th>Total Non-Proposed for Permanent (F)</th>
                <th>Total Non-Proposed for Manpower (G)</th>
                <th>Total Proposed Staff <span class="text-muted small">(${fLabel.sectionH()})</span></th>
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: 23 }).map(() => `
                <tr>
                  <td><input type="text" class="form-control form-control-sm" placeholder=""></td>
                  <td><input type="text" class="form-control form-control-sm" placeholder=""></td>
                  <td><input type="number" class="form-control form-control-sm" data-col="A" min="0"></td>
                  <td><input type="number" class="form-control form-control-sm" data-col="B" min="0"></td>
                  <td><input type="number" class="form-control form-control-sm" data-col="C" min="0"></td>
                  <td><input type="number" class="form-control form-control-sm" data-col="D" min="0"></td>
                  <td class="mprod-calc" data-out="E">0</td>
                  <td><input type="number" class="form-control form-control-sm" data-col="F" min="0"></td>
                  <td><input type="number" class="form-control form-control-sm" data-col="G" min="0"></td>
                  <td class="mprod-calc" data-out="H">0</td>
                  <td class="mprod-calc" data-out="I">0</td>
                  <td><input type="text" class="form-control form-control-sm"></td>
                  <td><input type="text" class="form-control form-control-sm"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderSummary() {
    const designations = [
      'Designer', 'Engineer (Elec)', 'Chemist', 'Jb Assistant', 'Jb Attendant',
      'AA (Coin)', 'AA (Medv)', 'AA (Electrical)', 'Electronic technician',
      'Electronics', 'Macalyne'
    ];
    return `
      <section class="mprod-summary mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3"><h5 class="mb-0">Summary</h5><button type="button" class="btn btn-sm btn-success" data-action="mprod-save-summary"><i class="fa-solid fa-cloud-arrow-up me-1"></i> Save Summary</button></div>
        <div class="table-responsive">
          <table class="table mprod-table mprod-table-summary">
            <colgroup>
              <col style="width:6%">
              <col style="width:18%">
              <col style="width:8%">
              <col style="width:8%">
              <col style="width:8%">
              <col style="width:8%">
              <col style="width:9%">
              <col style="width:8%">
              <col style="width:8%">
              <col style="width:9%">
              <col style="width:9%">
              <col style="width:10%">
              <col style="width:14%">
            </colgroup>
            <thead>
              <tr>
                <th rowspan="2">No.</th>
                <th rowspan="2">Designation</th>
                <th rowspan="2">Zaw approved Cake (A)</th>
                <th rowspan="2">Non-Available in Permanent (B)</th>
                <th rowspan="2">Non-Available in Adings (C)</th>
                <th rowspan="2">Non-Available in Mappower Contract (D)</th>
                <th rowspan="2">Total Available Staff <span class="text-muted small">(${fLabel.summaryE()})</span></th>
                <th colspan="3">For New Cake (Jasq onwards)</th>
                <th rowspan="2">Vacancies to be Filled <span class="text-muted small">(${fLabel.summaryI()})</span></th>
                <th rowspan="2">Remarks</th>
                <th rowspan="2">Justification for Additional Proposed Staff</th>
              </tr>
              <tr>
                <th>Total Non-Proposed for Permanent (F)</th>
                <th>Total Non-Proposed for Mappower (G)</th>
                <th>Total Proposed Staff <span class="text-muted small">(${fLabel.summaryH()})</span></th>
              </tr>
            </thead>
            <tbody>
              ${designations.map((d, idx) => `
                <tr data-role="data">
                  <td class="text-center fw-semibold">${String(idx + 1).padStart(2, '0')}</td>
                  <td>${d}</td>
                  <td><input type="number" class="form-control form-control-sm" data-col="A" min="0"></td>
                  <td><input type="number" class="form-control form-control-sm" data-col="B" min="0"></td>
                  <td><input type="number" class="form-control form-control-sm" data-col="C" min="0"></td>
                  <td><input type="number" class="form-control form-control-sm" data-col="D" min="0"></td>
                  <td class="mprod-calc" data-out="E">0</td>
                  <td><input type="number" class="form-control form-control-sm" data-col="F" min="0"></td>
                  <td><input type="number" class="form-control form-control-sm" data-col="G" min="0"></td>
                  <td class="mprod-calc" data-out="H">0</td>
                  <td class="mprod-calc" data-out="I">0</td>
                  <td><input type="text" class="form-control form-control-sm"></td>
                  <td><input type="text" class="form-control form-control-sm"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  window.buildMProdTemplate = function buildMProdTemplate() {
    const host = document.getElementById('hrm-m-prod');
    if (!host) return;

    host.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 class="mb-1">Fork</h3>
          <div class="text-muted small">Staff Manpower Planning — Production Department</div>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <input id="mprod-manager" class="form-control" placeholder="Insert Manager" style="min-width: 220px;">
          <input id="mprod-connections" class="form-control" placeholder="Mark Connections" style="min-width: 220px;">
          <button class="btn btn-outline-primary" id="mprod-print" type="button">
            <i class="fa-solid fa-print me-1"></i> Print
          </button>
        </div>
      </div>

      <style>
        .mprod-table { border-collapse: collapse; width: 100%; font-size: .95rem; }
        .mprod-table th, .mprod-table td { border: 1px solid rgba(0,0,0,.3); padding: .4rem .5rem; vertical-align: middle; }
        .mprod-table th { background: var(--bs-light, #f8f9fa); font-weight: 600; text-align: center; }
        .mprod-calc { background: var(--bs-tertiary-bg, #f3f4f5); text-align: center; font-weight: 600; }
        .mprod-header { font-size: .95rem; }
        @media print {
          .navbar, #public-nav, #app-shell nav, footer, .btn, .password-toggle { display: none !important; }
          .mprod-section { page-break-inside: avoid; }
        }
      </style>

      <div id="mprod-sections">
        ${renderSection('01','A')}
        ${renderSection('02','B')}
        ${renderSection('03','C')}
      </div>

      <hr class="my-4">

      ${renderSummary()}

      <section class="mt-4">
        <h5>Justification for intake as it is not automated and critical operation requirement</h5>
        <ul class="mb-0">
          <li>one-electrician for water meter testing library section</li>
          <li>one-electrician for Water meter testing library section</li>
          <li>three for intake as it is not automated and critical operation requirement</li>
          <li>For transmission (share chambers, valves, FRV, Bedi) that uses cell2 jobs for maintenance</li>
        </ul>
      </section>
    `;

    // Live header updates across sections
    const refreshHeaders = () => {
      const mgr = host.querySelector('#mprod-manager')?.value?.trim() || 'Insert Manager';
      const mark = host.querySelector('#mprod-connections')?.value?.trim() || '';
      host.querySelectorAll('.mprod-header').forEach(h => {
        const hl = h.querySelector('.mprod-headline');
        const mc = h.querySelector('.mprod-connections');
        if (hl) hl.textContent = `RSC: Central Manager ${mgr} (Production)`;
        if (mc) mc.textContent = `Mark Connections: ${mark}`;
      });
    };
    host.querySelector('#mprod-manager')?.addEventListener('input', refreshHeaders);
    host.querySelector('#mprod-connections')?.addEventListener('input', refreshHeaders);
    refreshHeaders();

    attachMProdCalculations(host);
    host.querySelector('#mprod-print')?.addEventListener('click', () => window.print());
  };

  // Build when tab first shown
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('hrm-tab-m-prod');
    if (btn) {
      btn.addEventListener('shown.bs.tab', () => {
        if (!window.MPROD_BUILT) {
          window.MPROD_BUILT = true;
          window.buildMProdTemplate();
        }
      });
    }
  });

/* === M(PROD) Save: Firestore wiring === */
(function setupMProdSave(){
  const DOC_ID = 'M (PROD)';

  function getTextOrVal(el){
    if (!el) return '';
    return 'value' in el ? (el.value ?? '').toString().trim() : (el.textContent ?? '').toString().trim();
  }
  function getNum(el){
    if (!el) return 0;
    const v = ('value' in el) ? el.value : el.textContent;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function collectSectionPayload(sectionEl){
    const sectionNo = sectionEl?.getAttribute('data-section') || '';
    const meta = {
      sheetKey: 'M (PROD)',
      section: sectionNo,
      manager: document.getElementById('mprod-manager')?.value?.trim() || '',
      connections: document.getElementById('mprod-connections')?.value?.trim() || '',
      updatedAt: new Date().toISOString()
    };
    const rows = [];
    sectionEl.querySelectorAll('tbody tr').forEach(tr=>{
      const row = {
        name: getTextOrVal(tr.querySelector('td:nth-child(1) input')),
        designation: getTextOrVal(tr.querySelector('td:nth-child(2) input')),
        A: getNum(tr.querySelector('input[data-col="A"]')),
        B: getNum(tr.querySelector('input[data-col="B"]')),
        C: getNum(tr.querySelector('input[data-col="C"]')),
        D: getNum(tr.querySelector('input[data-col="D"]')),
        E: getNum(tr.querySelector('td[data-out="E"]')),
        F: getNum(tr.querySelector('input[data-col="F"]')),
        G: getNum(tr.querySelector('input[data-col="G"]')),
        H: getNum(tr.querySelector('td[data-out="H"]')),
        I: getNum(tr.querySelector('td[data-out="I"]')),
        remarks: getTextOrVal(tr.querySelector('td:nth-child(12) input')),
        justification: getTextOrVal(tr.querySelector('td:nth-child(13) input'))
      };
      // Skip empty rows (no designation and all numbers 0)
      const hasAny = row.designation || row.name || row.A || row.B || row.C || row.D || row.F || row.G || row.remarks || row.justification;
      if (hasAny) rows.push(row);
    });
    return { meta, rows };
  }

  function collectSummaryPayload(host){
    const sumEl = host.querySelector('.mprod-summary');
    const meta = {
      sheetKey: 'M (PROD)',
      updatedAt: new Date().toISOString()
    };
    const rows = [];
    sumEl?.querySelectorAll('table.mprod-table-summary tbody tr[data-role="data"]').forEach(tr=>{
      const row = {
        no: getTextOrVal(tr.querySelector('td:nth-child(1)')),
        designation: getTextOrVal(tr.querySelector('td:nth-child(2)')),
        A: getNum(tr.querySelector('input[data-col="A"]')),
        B: getNum(tr.querySelector('input[data-col="B"]')),
        C: getNum(tr.querySelector('input[data-col="C"]')),
        D: getNum(tr.querySelector('input[data-col="D"]')),
        E: getNum(tr.querySelector('td[data-out="E"]')),
        F: getNum(tr.querySelector('input[data-col="F"]')),
        G: getNum(tr.querySelector('input[data-col="G"]')),
        H: getNum(tr.querySelector('td[data-out="H"]')),
        I: getNum(tr.querySelector('td[data-out="I"]')),
        remarks: getTextOrVal(tr.querySelector('td:nth-child(12) input')),
        justification: getTextOrVal(tr.querySelector('td:nth-child(13) input'))
      };
      const hasAny = row.A||row.B||row.C||row.D||row.F||row.G||row.remarks||row.justification;
      if (hasAny) rows.push(row);
    });
    return { meta, rows };
  }

  async function ensureFirebaseReady(){
    if (!window.FB || !window.FB.mod) { await window.initFirebase?.(); }
    await window.ensureOnlineAuth?.();
    return window.FB?.mod?.fsMod;
  }

  async function saveSectionToCloud(sectionEl){
    const fsMod = await ensureFirebaseReady();
    const dataset = collectSectionPayload(sectionEl);
    const ref = fsMod.doc(FB.db, 'hrmSheets', DOC_ID);
    const sectionNo = sectionEl?.getAttribute('data-section') || '';
    const patch = {};
    patch['sections'] = {};
    patch['sections'][sectionNo] = dataset;
    await fsMod.setDoc(ref, patch, { merge: true });
    try { await window.waitForServerCommit?.(3000); } catch(_){}
    window.showToast?.(`M (PROD) — Section ${sectionNo} saved.`, 'success');
  }

  async function saveSummaryToCloud(host){
    const fsMod = await ensureFirebaseReady();
    const dataset = collectSummaryPayload(host);
    const ref = fsMod.doc(FB.db, 'hrmSheets', DOC_ID);
    await fsMod.setDoc(ref, { summary: dataset }, { merge: true });
    try { await window.waitForServerCommit?.(3000); } catch(_){}
    window.showToast?.('M (PROD) — Summary saved.', 'success');
  }

  // Click delegation
  document.addEventListener('click', async (e)=>{
    const secBtn = e.target?.closest && e.target.closest('button[data-action="mprod-save-section"]');
    if (secBtn){
      e.preventDefault();
      const host = document.getElementById('hrm-m-prod');
      const secNo = secBtn.getAttribute('data-section');
      const sectionEl = host?.querySelector(`.mprod-section[data-section="${secNo}"]`);
      try {
        await saveSectionToCloud(sectionEl);
      } catch(err){
        console.warn('M(PROD) save section failed, caching locally', err);
        try {
          const key = `nwsdb:hrm:M (PROD):section:${secNo}`;
          localStorage.setItem(key, JSON.stringify(collectSectionPayload(sectionEl)));
          window.showToast?.("Saved locally (offline). Will sync when you're online.", "warning");
        } catch(e2){
          window.showToast?.("Save failed.", "danger");
        }
      }
      return;
    }
    const sumBtn = e.target?.closest && e.target.closest('button[data-action="mprod-save-summary"]');
    if (sumBtn){
      e.preventDefault();
      const host = document.getElementById('hrm-m-prod');
      try {
        await saveSummaryToCloud(host);
      } catch(err){
        console.warn('M(PROD) save summary failed, caching locally', err);
        try {
          localStorage.setItem('nwsdb:hrm:M (PROD):summary', JSON.stringify(collectSummaryPayload(host)));
          window.showToast?.("Saved locally (offline). Will sync when you're online.", "warning");
        } catch(e2){
          window.showToast?.("Save failed.", "danger");
        }
      }
    }
  });
})();
})();

/* ===========================
   DOMContentLoaded init
   =========================== */
document.addEventListener('DOMContentLoaded', function() {
  console.log('app.js loaded - initializing gallery, public map observer, and admin controls');

  // Initialize photo gallery system (from app2.js) if available
  try {
    if (typeof initPhotoGallery === 'function') initPhotoGallery();
  } catch (e) {
    console.warn('initPhotoGallery not available yet', e);
  }
  
  // Initialize public map observer for landing page if provided in app2.js
  setTimeout(() => {
    if (typeof initPublicMapObserverWithRetry === 'function') {
      initPublicMapObserverWithRetry();
    }
  }, 1000);

  // Wire Developer options buttons to Admin prompt if available
  const openAdmin = () => {
    try {
      const rsc = (typeof window.isRSCUser === 'function') ? window.isRSCUser() : false;
      const logged = (typeof window.isLoggedIn === 'function') ? window.isLoggedIn() : false;
      if (logged && rsc && typeof window.showAdminPage === 'function') {
        window.showAdminPage();
        return;
      }
    } catch (_) {}

    if (typeof window.showAdminPrompt === 'function') window.showAdminPrompt();
    else document.getElementById('loginModal') && bootstrap?.Modal.getOrCreateInstance(document.getElementById('loginModal')).show();
  };

  document.getElementById('openAdminBtnPublic')?.addEventListener('click', openAdmin);
  document.getElementById('openAdminBtnApp')?.addEventListener('click', openAdmin);
});

/** Injected: CE (NRW) Stand-alone Save Support **/
function collectCENRWPpayload() {
  const meta = {
    region: '',
    zone: '',
    connections: '',
    capacity: '',
    year: document.getElementById('hrm-ce-nrw-year-input')?.value?.trim() || ''
  };
  const table = document.getElementById('hrm-ce-nrw-table');
  const rows = [];
  if (table) {
    const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
    bodyRows.forEach(tr => {
      const name = tr.querySelector('select, .name-cell')?.value?.trim()
                || tr.querySelector('td:nth-child(2)')?.textContent?.trim()
                || '';
      const getNum = (sel) => {
        const node = tr.querySelector(sel);
        if (!node) return 0;
        const v = ('value' in node) ? node.value : node.textContent;
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };
      const A = getNum('input[data-col="A"]');
      const B = getNum('input[data-col="B"]');
      const C = getNum('input[data-col="C"]');
      const D = getNum('input[data-col="D"]');
      const E = getNum('.ce-nrw-e, .hrm-calc[data-col="E"]');
      const H = getNum('input[data-col="Hc"], input[data-col="H"]');
      const I = getNum('.ce-nrw-i, .hrm-calc[data-col="I"]');
      const remarks = tr.querySelector('input[data-col="R"], textarea[data-col="R"]')?.value?.trim() || '';
      rows.push({ name, A,B,C,D,E,H,I, remarks });
    });
  }
  const totals = {};
  ['A','B','C','D','E','H','I'].forEach(col => {
    const el = document.getElementById(`total-${col}`) || document.getElementById(`tot${col}`);
    const n = Number(el?.textContent);
    totals[col] = Number.isFinite(n) ? n : 0;
  });
  return { sheetKey: 'CE (NRW)', meta, rows, totals, updatedAt: new Date().toISOString() };
}

async function saveCENRWSheetToCloud() {
  try {
    if (!window.FB || !window.FB.mod) await window.initFirebase?.();
    await window.ensureOnlineAuth?.();
    const payload = collectCENRWPpayload();
    const { fsMod } = FB.mod;
    const ref = fsMod.doc(FB.db, 'hrmSheets', 'CE (NRW)');
    await fsMod.setDoc(ref, payload, { merge: true });
    try { await window.waitForServerCommit?.(4000); } catch(_) {}
    showToast?.('HRM CE (NRW) sheet saved successfully!', 'success');
  } catch (e) {
    console.warn('CE (NRW) cloud save failed, caching locally:', e);
    try {
      localStorage.setItem('nwsdb:hrm:CE (NRW)', JSON.stringify(collectCENRWPpayload()));
      showToast?.("Saved locally (offline). Will sync when you're online.", "warning");
    } catch (err) {
      console.error('Local fallback failed:', err);
      showToast?.("Save failed.", "danger");
    }
  }
}

(function wireCENRWSave(){
  document.addEventListener('click', (e)=>{
    const btn = e.target?.closest && e.target.closest('#hrm-ce-nrw-save');
    if (btn) {
      e.preventDefault();
      saveCENRWSheetToCloud();
    }
  });
})();
