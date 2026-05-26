/* ===========================
   Region panel builder (Home)
   =========================== */
function getItemsForCategoryRegion(category, region) {
  try {
    // Prefer dynamic merged list from admin config (provided by core.js)
    if (typeof getMergedLocations === 'function') {
      return getMergedLocations(category, region) || [];
    }
    // Fallback to static lists if admin helpers not yet loaded
    if (category === 'labs' || category === 'plant') return LABS_REGION_ITEMS[region] || [];
    return REGION_ITEMS[region] || [];
  } catch (error) {
    console.error('Error getting items for category region:', error);
    return [];
  }
}

function chunkArray(arr, parts) {
  if (!Array.isArray(arr) || parts <= 0) return [];
  
  const result = [];
  const size = Math.ceil(arr.length / parts);
  for (let i = 0; i < parts; i++) result.push(arr.slice(i * size, (i + 1) * size));
  return result;
}

function renderRegionPanel(category, region) {
  if (!isLoggedIn()) {
    showLoginPrompt();
    return;
  }

  // Region lock for non-RSC users
  try {
    if (typeof window.isRegionalUser === 'function' && window.isRegionalUser()) {
      const locked = (typeof window.getUserRegion === 'function') ? window.getUserRegion() : '';
      if (locked && String(region || '').toUpperCase() !== String(locked).toUpperCase()) {
        region = locked;
      }
    }
  } catch (_) {}

  try {
    const items = getItemsForCategoryRegion(category, region);
    const label = CATEGORY_LABEL[category] || 'Items';
    
    if (!items || !items.length) {
      showToast(`No data found for ${formatRegionName(region)}.`, 'info');
      return;
    }

    const container = document.querySelector('#home-page .container');
    if (!container) {
      console.error('Home page container not found');
      return;
    }

    let panel = document.getElementById('region-results');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'region-results';
      panel.className = 'card border-0 shadow-sm mt-4';
      panel.innerHTML = `
        <div class="card-body">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <h4 class="mb-1" id="region-results-title"></h4>
              <div class="text-muted small" id="region-results-meta"></div>
            </div>
            <div class="ms-auto">
              <button class="btn btn-sm btn-outline-secondary me-2" type="button" id="copy-region-list">
                <i class="fa-solid fa-copy me-1"></i> Copy
              </button>
              <button class="btn btn-sm btn-outline-secondary" type="button" id="close-region-results">
                <i class="fa-solid fa-xmark me-1"></i> Close
              </button>
            </div>
          </div>
          <div class="mt-3" id="region-list-container"></div>
        </div>
      `;
      container.appendChild(panel);
      
      // Add close button event listener
      const closeBtn = panel.querySelector('#close-region-results');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          try {
            panel.remove();
          } catch (error) {
            console.error('Error removing region panel:', error);
          }
        });
      }
    }

    // Update panel content
    const titleEl = panel.querySelector('#region-results-title');
    const metaEl = panel.querySelector('#region-results-meta');
    
    if (titleEl) titleEl.textContent = `${label} — ${formatRegionName(region)}`;
    if (metaEl) metaEl.textContent = `${items.length} locations`;

    // Update copy button
    const copyBtn = panel.querySelector('#copy-region-list');
    if (copyBtn) {
      copyBtn.onclick = () => {
        copyToClipboard(items.join('\n'))
          .then(() => showToast('Region list copied to clipboard.', 'success'))
          .catch((error) => {
            console.error('Failed to copy to clipboard:', error);
            showToast('Failed to copy.', 'danger');
          });
      };
    }

    // Render location list
    const listWrap = panel.querySelector('#region-list-container');
    if (!listWrap) return;
    
    listWrap.innerHTML = '';
    const cols = items.length >= 15 ? 3 : (items.length > 8 ? 2 : 1);
    const chunks = chunkArray(items, cols);
    const row = document.createElement('div');
    row.className = 'row';

    chunks.forEach(chunk => {
      const col = document.createElement('div');
      col.className = cols === 1 ? 'col-12' : (cols === 2 ? 'col-md-6' : 'col-md-4');
      const ul = document.createElement('ul');
      ul.className = 'list-group list-group-flush';

      chunk.forEach(name => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action d-flex align-items-center';
        li.style.cursor = 'pointer';
        
        // Determine icon based on category
        let icon;
        switch (category) {
          case 'plant':
            icon = 'industry';
            break;
          case 'labs':
            icon = 'flask';
            break;
          default:
            icon = 'droplet';
        }

        // Build safe DOM
        const i = document.createElement('i');
        i.className = `fa-solid fa-${icon} me-2 text-primary`;
        const span = document.createElement('span');
        span.textContent = name;
        li.appendChild(i);
        li.appendChild(span);

        // Add click event with error handling
        li.addEventListener('click', () => {
          try {
            if (category === 'labs') {
              if (typeof showLabsEntryPage === 'function') {
                showLabsEntryPage(region, name);
              } else {
                console.error('showLabsEntryPage function not available');
                showToast('Labs entry page not available', 'warning');
              }
            } else if (category === 'plant') {
              if (typeof showPlantEntryPage === 'function') {
                showPlantEntryPage(region, name); // defined in core.js
              } else {
                console.error('showPlantEntryPage function not available');
                showToast('Plant entry page not available', 'warning');
              }
            } else {
              if (typeof showDataEntryPage === 'function') {
                showDataEntryPage(region, name);
              } else {
                console.error('showDataEntryPage function not available');
                showToast('Data entry page not available', 'warning');
              }
            }
          } catch (error) {
            console.error('Error navigating to entry page:', error);
            showToast('Failed to open entry page', 'danger');
          }
        });

        ul.appendChild(li);
      });

      col.appendChild(ul);
      row.appendChild(col);
    });

    listWrap.appendChild(row);
    
    // Scroll to panel with accessibility considerations
    if (prefersReducedMotion()) {
      panel.scrollIntoView();
    } else {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    console.log(`Region panel rendered for ${category}/${region} with ${items.length} items`);
  } catch (error) {
    console.error('Error rendering region panel:', error);
    showToast('Failed to load region data', 'danger');
  }
}

/* ===========================
   Scheme Data Entry (extended sections builder)
   =========================== */
function ensureExtendedSectionsInjected() {
  const container = document.querySelector('#data-entry-page .container');
  if (!container) {
    console.error('Data entry page container not found');
    return;
  }

  try {
    let ext = document.getElementById('extended-sections');
    if (!ext) {
      ext = document.createElement('div');
      ext.id = 'extended-sections';
      container.appendChild(ext);
    }

    // Rebuild if year changed
    const appYear = (typeof window.getAppYear === 'function') ? window.getAppYear() : 2026;
    if (ext.childElementCount > 0 && String(ext.dataset.year || '') === String(appYear)) return;
    ext.dataset.year = String(appYear);
    ext.innerHTML = '';

    const startYear = 2015;
    const endYear = Math.max(startYear, (Number(appYear) || 2026) - 1);
    const years = Array.from({ length: (endYear - startYear + 1) }, (_, i) => startYear + i);

    ext.innerHTML = `
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h4 class="mb-3">Connection Growth During Last 10 Years (${startYear}-${endYear})</h4>
          <div class="row g-3">
            ${years.map(y => `
              <div class="col-md-3">
                <label class="form-label">${y}</label>
                <input type="number" step="any" class="form-control growth-input" data-year="${y}" placeholder="Value" />
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h4 class="mb-3">Monthly Data (${appYear})</h4>
          <div class="table-responsive">
            <table class="table table-bordered align-middle small text-center">
              <thead class="table-light">
                <tr>
                  <th>Month</th>
                  ${MONTHLY_FIELDS.map(f => `<th>${f}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${MONTHS.map(mon => `
                  <tr>
                    <td>${mon}</td>
                    ${MONTHLY_FIELDS.map((f) => `
                      <td>
                        <input type="number" step="any" class="form-control form-control-sm monthly-input"
                          placeholder="-"
                          data-month="${mon}"
                          data-field="${f}">
                      </td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h4 class="mb-3">Expenditure Categorization</h4>
          <div class="row g-3">
            <div class="col-md-5"><input type="text" id="exp-item" class="form-control" placeholder="Item" /></div>
            <div class="col-md-5"><input type="number" step="any" id="exp-value" class="form-control" placeholder="Value" /></div>
            <div class="col-md-2 d-grid"><button class="btn btn-primary" type="button" id="add-exp-btn"><i class="fa-solid fa-plus me-1"></i> Add</button></div>
          </div>
          <ul class="list-group list-group-flush mt-3" id="exp-list"></ul>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h4 class="mb-3">Per Cum/Cost</h4>
          <div class="row g-3">
            <div class="col-md-3"><label class="form-label">Quarter 1</label><input class="form-control" type="number" step="any" id="percum-q1" placeholder="Value"></div>
            <div class="col-md-3"><label class="form-label">Quarter 2</label><input class="form-control" type="number" step="any" id="percum-q2" placeholder="Value"></div>
            <div class="col-md-3"><label class="form-label">Quarter 3</label><input class="form-control" type="number" step="any" id="percum-q3" placeholder="Value"></div>
            <div class="col-md-3"><label class="form-label">Quarter 4</label><input class="form-control" type="number" step="any" id="percum-q4" placeholder="Value"></div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h4 class="mb-3">WSP Status</h4>
          <textarea class="form-control" rows="3" id="wsp-status" placeholder="Enter WSP Status..."></textarea>
        </div>
      </div>

      <div class="text-center mb-5">
        <button class="btn btn-success btn-lg" id="submit-data-btn"><i class="fa-solid fa-floppy-disk me-1"></i> Submit All Data</button>
      </div>
    `;

    // After injection, bind the new refs
    expListEl = document.getElementById("exp-list");
    const addExpBtnEl = document.getElementById("add-exp-btn");
    submitExtendedBtnEl = document.getElementById("submit-data-btn");

    if (addExpBtnEl) {
      addExpBtnEl.addEventListener('click', () => {
        try {
          const itemEl = document.getElementById("exp-item");
          const valueEl = document.getElementById("exp-value");

          if (!itemEl || !valueEl) {
            showToast("Form elements not found", "danger");
            return;
          }

          const item = itemEl.value.trim();
          const valueStr = valueEl.value.trim();

          if (!item || valueStr === '') {
            showToast("Fill in item and value", "danger");
            return;
          }

          const value = parseNum(valueStr);
          if (value === null) {
            showToast("Value must be a number", "danger");
            return;
          }

          EXP_ITEMS.push({ item, value });
          itemEl.value = "";
          valueEl.value = "";
          renderExpList();
        } catch (error) {
          console.error('Error adding expenditure item:', error);
          showToast('Failed to add expenditure item', 'danger');
        }
      });
    }

    if (submitExtendedBtnEl) {
      submitExtendedBtnEl.addEventListener('click', async () => {
        try {
          const payload = collectExtendedDataPayload();
          if (typeof saveSchemeData === 'function') {
            await saveSchemeData(payload); // from core.js
          } else {
            throw new Error('saveSchemeData function not available');
          }
        } catch (error) {
          console.error('Error submitting extended data:', error);
          showToast('Failed to submit data', 'danger');
        }
      });
    }

    console.log('Extended sections injected successfully');
  } catch (error) {
    console.error('Error injecting extended sections:', error);
    showToast('Failed to load data entry form', 'danger');
  }
}

function resetExtendedDataFields() {
  try {
    // Reset growth inputs
    document.querySelectorAll('.growth-input').forEach(inp => {
      if (inp) inp.value = '';
    });
    
    // Reset monthly inputs
    document.querySelectorAll('.monthly-input').forEach(inp => {
      if (inp) inp.value = '';
    });
    
    // Reset expenditure items
    EXP_ITEMS = [];
    renderExpList();

    // Reset per cum inputs
    ['percum-q1','percum-q2','percum-q3','percum-q4'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    // Reset WSP status
    const wsp = document.getElementById("wsp-status");
    if (wsp) wsp.value = '';

    console.log('Extended data fields reset');
  } catch (error) {
    console.error('Error resetting extended data fields:', error);
  }
}

function populateExtendedDataFields(data) {
  if (!data) {
    console.warn('No data provided to populateExtendedDataFields');
    return;
  }

  try {
    // Populate growth data
    if (data.growth) {
      Object.entries(data.growth).forEach(([year, value]) => {
        const input = document.querySelector(`.growth-input[data-year="${year}"]`);
        if (input && value !== null && value !== undefined) {
          input.value = value;
        }
      });
    }

    // Populate monthly data (migrate Connection Target label to current year)
    if (data.monthly) {
      const appYear = (typeof window.getAppYear === 'function') ? window.getAppYear() : 2026;
      let monthly = data.monthly;
      try {
        if (typeof window.migrateMonthlyObjectToYear === 'function') {
          monthly = window.migrateMonthlyObjectToYear(monthly, appYear);
        }
      } catch (_) {}

      Object.entries(monthly).forEach(([month, fields]) => {
        Object.entries(fields).forEach(([field, value]) => {
          const input = document.querySelector(`.monthly-input[data-month="${month}"][data-field="${field}"]`);
          if (input && value !== null && value !== undefined) {
            input.value = value;
          }
        });
      });
    }

    // Populate expenditure items
    if (Array.isArray(data.expenditures)) {
      EXP_ITEMS = data.expenditures.slice();
      renderExpList();
    }

    // Populate per cum data
    if (data.perCum) {
      const map = {
        'percum-q1': data.perCum.q1,
        'percum-q2': data.perCum.q2,
        'percum-q3': data.perCum.q3,
        'percum-q4': data.perCum.q4
      };
      Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el && val !== null && val !== undefined) el.value = val;
      });
    }

    // Populate WSP status
    if (typeof data.wspStatus === 'string') {
      const wsp = document.getElementById("wsp-status");
      if (wsp) wsp.value = data.wspStatus;
    }

    console.log('Extended data fields populated');
  } catch (error) {
    console.error('Error populating extended data fields:', error);
    showToast('Failed to load saved data', 'warning');
  }
}

function renderExpList() {
  if (!expListEl) {
    console.warn('Expenditure list element not found');
    return;
  }

  try {
    expListEl.innerHTML = '';

    if (!EXP_ITEMS || EXP_ITEMS.length === 0) {
      const emptyMsg = document.createElement('li');
      emptyMsg.className = 'list-group-item text-muted text-center';
      emptyMsg.textContent = 'No expenditure items added';
      expListEl.appendChild(emptyMsg);
      return;
    }

    EXP_ITEMS.forEach((exp, idx) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';

      const left = document.createElement('span');
      const strong = document.createElement('strong');
      strong.textContent = exp.item;
      const sep = document.createTextNode(': ');
      const val = document.createTextNode(String(exp.value));
      left.append(strong, sep, val);

      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-outline-danger';
      btn.type = 'button';
      btn.innerHTML = `<i class="fa-solid fa-trash-can me-1"></i> Delete`;
      btn.addEventListener('click', () => {
        try {
          EXP_ITEMS.splice(idx, 1);
          renderExpList();
        } catch (error) {
          console.error('Error deleting expenditure item:', error);
          showToast('Failed to delete item', 'danger');
        }
      });

      li.append(left, btn);
      expListEl.appendChild(li);
    });
  } catch (error) {
    console.error('Error rendering expenditure list:', error);
  }
}

function collectExtendedDataPayload() {
  try {
    const growth = {};
    document.querySelectorAll('.growth-input').forEach(inp => {
      const year = inp.getAttribute('data-year');
      const val = parseNum(inp.value);
      if (year) growth[year] = val;
    });

    const monthly = {};
    MONTHS.forEach(mon => monthly[mon] = {});
    document.querySelectorAll('.monthly-input').forEach(inp => {
      const month = inp.getAttribute('data-month');
      const field = inp.getAttribute('data-field');
      if (!month || !field) return;
      monthly[month][field] = parseNum(inp.value);
    });

    // Ensure the stored key matches the active reporting year
    try {
      const appYear = (typeof window.getAppYear === 'function') ? window.getAppYear() : 2026;
      if (typeof window.migrateMonthlyObjectToYear === 'function') {
        Object.assign(monthly, window.migrateMonthlyObjectToYear(monthly, appYear));
      }
    } catch (_) {}

    const perCum = {
      q1: parseNum(document.getElementById('percum-q1')?.value ?? null),
      q2: parseNum(document.getElementById('percum-q2')?.value ?? null),
      q3: parseNum(document.getElementById('percum-q3')?.value ?? null),
      q4: parseNum(document.getElementById('percum-q4')?.value ?? null)
    };

    const wspStatus = (document.getElementById('wsp-status')?.value || '').trim();

    return {
      region: DATA_CTX.region,
      location: DATA_CTX.location,
      connections: DATA_CTX.entries,
      growth,
      monthly,
      expenditures: EXP_ITEMS.slice(),
      perCum,
      wspStatus,
      submittedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error collecting extended data payload:', error);
    throw new Error('Failed to collect form data');
  }
}

// Expose key helpers for other modules
window.ensureExtendedSectionsInjected = ensureExtendedSectionsInjected;
window.populateExtendedDataFields = populateExtendedDataFields;
window.resetExtendedDataFields = resetExtendedDataFields;

/* ===========================
   Connections UI (Scheme)
   =========================== */
function normalizeCat(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim(); }
const BULK_CATS = new Set(['bulk l a','bulk c b o','bulk halgahakubura','bulk supply sp inst','bulk spl sp inst']);
function isBulkCategory(cat){ const n=normalizeCat(cat); return n.startsWith('bulk') || BULK_CATS.has(n); }
const ACCOUNT_NUMBERS_BY_REGION = {
  'Central South': ['42/54/559/155/11','42/54/559/211/13','42/48/300/001/15','42/48/300/002/14','42/24/754/545/14','42/13/236/001/12','42/13/239/013/12','42/20/004/767/19','42/20/081/372/14','42/21/412/627/13','42/23/645/238/17','42/51/115/179/17','42/51/115/267/10','42/51/115/284/19','42/51/115/288/15','42/51/206/533/15','42/51/210/214/13','42/51/210/278/16','42/54/506/156/11'],
  'Central North': ['42/01/118/131/19','42/12/400/001/15','42/39/142/135/11','42/01/114/182/16','42/01/118/132/18','42/01/152/295/10','42/01/319/185/18','42/01/337/096/18','42/01/344/205/12','42/12/291/818/11','42/39/127/116/15','42/39/138/232/11','42/39/344/143/13'],
  'Central East': ['42/03/201/645/10','42/03/308/094/19','42/66/375/179/10','42/67/135/616/18','42/67/155/284/17','42/72/301/216/13'],
  'Matale': ['42/46/248/020/15','42/09/105/001/15','42/14/160/016/16','42/14/203/042/12']
};
function populateAccountNumbersForRegion(region){
  try {
    const sel = document.getElementById('bulk-account'); if (!sel) return;
    sel.innerHTML = '';
    const ph = new Option('Select account number (optional)', '', true, true); ph.disabled = false; sel.add(ph);
    const raw = String(region || '');
    const norm = raw.toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
    const has = (w) => norm.split(' ').includes(w);
    let key = null;
    if (norm === 'matale') key = 'Matale';
    else if ((has('central') && has('south')) || norm === 'centralsouth') key = 'Central South';
    else if ((has('central') && has('north')) || norm === 'centralnorth' || has('north')) key = 'Central North';
    else if ((has('central') && has('east')) || norm === 'centraleast' || has('east')) key = 'Central East';
    const list = key ? (ACCOUNT_NUMBERS_BY_REGION[key] || []) : [];
    list.forEach(acc => sel.add(new Option(acc, acc)));
  } catch(e) { console.error('populateAccountNumbersForRegion failed', e); }
}
function showHideBulkFields(){
  const sel = document.getElementById('categorySelect');
  const wrap = document.getElementById('bulk-extra-fields');
  if (!sel || !wrap) return; const on = isBulkCategory(sel.value);
  wrap.style.display = on ? '' : 'none';
  if (on) { try { populateAccountNumbersForRegion(DATA_CTX?.region); } catch(e){} }
}

function populateCategories() {
  const sel = document.getElementById('categorySelect');
  if (!sel) {
    console.warn('Category select element not found');
    return;
  }

  try {
    sel.innerHTML = '';
    const unique = [...new Set(CONNECTION_CATEGORIES)];
    const placeholder = new Option('Select a category...', '', true, true);
    placeholder.disabled = true;
    sel.add(placeholder);

    unique.forEach(opt => sel.add(new Option(opt, opt)));

    console.log('Categories populated successfully');
    try { sel.removeEventListener('change', showHideBulkFields); } catch(_){}
    sel.addEventListener('change', showHideBulkFields);
    showHideBulkFields();
  } catch (error) {
    console.error('Error populating categories:', error);
  }
}

function handleAddCategoryClick() {
  try {
    const catSel = document.getElementById('categorySelect');
    const numInp = document.getElementById('existingConnections');

    if (!catSel || !numInp) {
      showToast('Form elements not found', 'danger');
      return;
    }

    const cat = (catSel?.value || '').trim();
    const num = parseInt(numInp?.value ?? '', 10);

    if (!DATA_CTX.region || !DATA_CTX.location) {
      showToast('Select a region and location first.', 'danger');
      return;
    }

    if (!cat) {
      showToast('Please select a category.', 'danger');
      return;
    }

    if (!Number.isFinite(num) || num < 0) {
      showToast('Enter a valid non-negative number.', 'danger');
      return;
    }

    const idx = DATA_CTX.entries.findIndex(e => e.category === cat);
    if (idx >= 0) {
      DATA_CTX.entries[idx].count = num;
      showToast(`Updated ${cat}.`);
    } else {
      DATA_CTX.entries.push({ category: cat, count: num });
      showToast(`Added ${cat}.`);
    }

    try {
      saveConnectionsLS(DATA_CTX.region, DATA_CTX.location, DATA_CTX.entries);
    } catch (storageError) {
      console.error('Failed to save connections to localStorage:', storageError);
      showToast('Failed to save locally', 'warning');
    }
    
    renderConnectionsList();

    if (numInp) numInp.value = '';
    if (catSel) catSel.focus();
  } catch (error) {
    console.error('Error adding category:', error);
    showToast('Failed to add category', 'danger');
  }
}

function renderConnectionsList() {
  if (!connectionsCard || !connectionsList) {
    bindUIRefs();
    if (!connectionsCard || !connectionsList) {
      console.warn('Connections UI elements not found');
      return;
    }
  }

  try {
    connectionsList.innerHTML = '';

    if (!DATA_CTX.entries || DATA_CTX.entries.length === 0) {
      connectionsCard.style.display = 'none';
      return;
    }

    DATA_CTX.entries.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      
      const left = document.createElement('div');
      const name = document.createElement('span');
      name.className = 'fw-semibold';
      name.textContent = item.category;
      const sep = document.createElement('span');
      sep.className = 'text-muted';
      sep.textContent = ` — ${item.count}`;
      left.append(name, sep);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline-danger';
      btn.innerHTML = `<i class="fa-solid fa-trash-can me-1"></i> Remove`;
      btn.addEventListener('click', () => {
        try {
          DATA_CTX.entries.splice(idx, 1);
          try {
            saveConnectionsLS(DATA_CTX.region, DATA_CTX.location, DATA_CTX.entries);
          } catch (storageError) {
            console.error('Failed to save connections to localStorage:', storageError);
            showToast('Failed to save locally', 'warning');
          }
          renderConnectionsList();
        } catch (error) {
          console.error('Error removing connection:', error);
          showToast('Failed to remove connection', 'danger');
        }
      });

      li.append(left, btn);
      connectionsList.appendChild(li);
    });

    connectionsCard.style.display = 'block';
  } catch (error) {
    console.error('Error rendering connections list:', error);
  }
}

/* ===========================
   Plant Map Picker (modal)
   =========================== */
async function openPlantMapPicker() {
  try {
    if (typeof showToast === 'function') showToast('Map picker has been removed from this build.', 'info');
  } catch (_) {}
  return;
}

function placePickerMarker(lat, lng) {
  if (!MAP_PICKER.map) return;
  
  try {
    if (MAP_PICKER.marker) MAP_PICKER.marker.remove();
    
    MAP_PICKER.marker = L.marker([lat, lng], { draggable: true }).addTo(MAP_PICKER.map);
    
    MAP_PICKER.marker.on('dragend', () => {
      try {
        const ll = MAP_PICKER.marker.getLatLng();
        if (plantLatEl) plantLatEl.value = String(ll.lat.toFixed(6));
        if (plantLngEl) plantLngEl.value = String(ll.lng.toFixed(6));
      } catch (error) {
        console.error('Error updating coordinates after drag:', error);
      }
    });
  } catch (error) {
    console.error('Error placing map marker:', error);
  }
}

/* ===========================
   Auth/UI wiring + boot
   =========================== */
function wireAuthUI() {
  try {
    const loginForm = document.getElementById('loginForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    } else {
      console.warn('Login form not found');
    }

    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', handleAdminLogin);
    } else {
      console.warn('Admin login form not found');
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    } else {
      console.warn('Logout button not found');
    }

    console.log('Auth UI wired successfully');
  } catch (error) {
    console.error('Error wiring auth UI:', error);
  }
}

function wirePasswordToggle() {
  const toggle = document.getElementById('passwordToggle');
  const pwd = document.getElementById('password');
  
  if (!toggle || !pwd) {
    console.warn('Password toggle elements not found');
    return;
  }

  if (toggle.dataset.bound) return;
  
  try {
    toggle.dataset.bound = '1';

    // Make span behave like a button if markup isn't updated to <button>
    if (toggle.tagName !== 'BUTTON') {
      toggle.setAttribute('role', 'button');
      toggle.tabIndex = 0;
    }
    
    const setPressed = (show) => {
      toggle.setAttribute('aria-pressed', String(show));
      const i = toggle.querySelector('i');
      if (i) {
        i.classList.toggle('fa-eye', !show);
        i.classList.toggle('fa-eye-slash', show);
      }
    };
    
    const flip = () => {
      const show = pwd.type === 'password';
      pwd.type = show ? 'text' : 'password';
      setPressed(show);
    };
    
    toggle.addEventListener('click', flip);
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); 
        flip(); 
      }
    });

    console.log('Password toggle wired successfully');
  } catch (error) {
    console.error('Error wiring password toggle:', error);
  }
}

function initAppShellVisibility() {
  try {
    const app = document.getElementById('app-shell');
    const lp  = document.getElementById('landing-page');
    const pub = document.getElementById('public-nav');
    
    if (isLoggedIn()) {
      if (lp) lp.style.display = 'none';
      if (pub) pub.style.display = 'none';
      if (app) app.style.display = 'block';
      
      try { 
        if (typeof buildHomeDropdownMenus === 'function') {
          buildHomeDropdownMenus(); 
        }
      } catch(menuError) {
        console.error('Error building home dropdown menus:', menuError);
      }
      
      
      try { typeof window.applyAccessControlUI === 'function' && window.applyAccessControlUI(); } catch(_) {}

      showHomePage();
    } else {
      if (app) app.style.display = 'none';
      if (lp) lp.style.display = 'block';
      if (pub) pub.style.display = 'block';
    }

    console.log('App shell visibility initialized');
  } catch (error) {
    console.error('Error initializing app shell visibility:', error);
  }
}

function enhanceLandingKpisA11y() {
  try {
    ['lp-kpi-total','lp-kpi-scheme','lp-kpi-plant','lp-kpi-labs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute('aria-live','polite');
        el.setAttribute('aria-atomic','true');
      }
    });
    console.log('Landing KPIs accessibility enhanced');
  } catch (error) {
    console.error('Error enhancing landing KPIs accessibility:', error);
  }
}

/* ===========================
   HRM navigation (exported)
   =========================== */
window.showHRMPage = showHRMPage;

/* ===========================
   DOM Ready - ENHANCED WITH DEBUGGING
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing NWSDB Portal system...');
  
  try {
    // Add debug event listeners for photo gallery
  document.addEventListener('click', (e) => {
    try {
      if (e.target.classList.contains('plant-popup-photo') || e.target.closest('.plant-popup-photo')) {
        console.log('Map photo click detected');
      }
      if (e.target.classList.contains('view-all-photos-btn') || e.target.closest('.view-all-photos-btn')) {
        console.log('View all photos button click detected');
      }
      // Public map observer with retry - ADD THIS
      if (typeof initPublicMapObserverWithRetry === 'function') {
        setTimeout(() => {
          initPublicMapObserverWithRetry();
        }, 1000);
      }
    } catch (error) {
      console.error('Error during DOM initialization:', error);
    }
  });
    
    // Firebase (optional eager init)
    initFirebase().catch(err => console.error('Firebase initialization failed:', err));

    // Bind refs, wire UI
    bindUIRefs();
    wireAuthUI();
    wirePasswordToggle();
    enhanceLandingKpisA11y();
    
    // Initialize photo gallery system
    if (typeof initPhotoGallery === 'function') {
      initPhotoGallery();
    } else {
      console.warn('initPhotoGallery function not available');
    }

    // Wire admin buttons to always prompt admin login
    const adminBtnPublic = document.getElementById('openAdminBtnPublic');
    const adminBtnApp = document.getElementById('openAdminBtnApp');
    
    if (adminBtnPublic) {
      adminBtnPublic.addEventListener('click', showAdminPrompt);
    }
    if (adminBtnApp) {
      adminBtnApp.addEventListener('click', showAdminPrompt);
    }

    // Wire Plant map picker
    const mapPickerBtn = document.getElementById('plant-open-map-picker');
    if (mapPickerBtn) {
      mapPickerBtn.addEventListener('click', openPlantMapPicker);
    }

    // Build menus (if core.js loaded later, will rebuild again)
    try { 
      if (typeof buildHomeDropdownMenus === 'function') {
        buildHomeDropdownMenus();
        console.log('Home dropdown menus built successfully');
      } else {
        console.warn('buildHomeDropdownMenus function not available yet');
      }
    } catch(e) {
      console.error('Error building home dropdown menus:', e);
    }

    // Landing charts: lazy if possible
    if (typeof IntersectionObserver !== 'undefined') {
      if (typeof initLandingChartObserver === 'function') {
        initLandingChartObserver();
        console.log('Landing chart observer initialized');
      }
    } else {
      console.log('IntersectionObserver not available');
      if (typeof initLandingCharts === 'function') {
        initLandingCharts();
      }
    }

    // Public map observer with retry
    if (typeof initPublicMapObserverWithRetry === 'function') {
      initPublicMapObserverWithRetry();
    }

    // Admin config updates -> rebuild menus + filters
    window.addEventListener('nwsdb:adminConfigUpdated', () => {
      console.log('Admin config updated, rebuilding menus...');
      try { 
        if (typeof buildHomeDropdownMenus === 'function') {
          buildHomeDropdownMenus(); 
        }
      } catch(e) {
        console.error('Error rebuilding menus after admin config update:', e);
      }
      if (typeof subPageInited !== 'undefined' && subPageInited) {
        try { 
          if (typeof populateSubRegions === 'function') populateSubRegions(); 
        } catch(e) {
          console.error('Error populating sub regions:', e);
        }
        try { 
          if (typeof populateSubLocations === 'function') populateSubLocations(); 
        } catch(e) {
          console.error('Error populating sub locations:', e);
        }
      }
    });

    // Prevent accidental jumps for stub links
    document.querySelectorAll('a[href="#"]').forEach(a => {
      a.addEventListener('click', (e) => e.preventDefault());
    });

    // Restore proper shell
    initAppShellVisibility();

    // Debug: Check if core functions are available
    console.log('System functions availability check:');
    console.log('- savePlantData:', typeof savePlantData === 'function');
    console.log('- showDataEntryPage:', typeof showDataEntryPage === 'function');
    console.log('- showLabsEntryPage:', typeof showLabsEntryPage === 'function');
    console.log('- showPlantEntryPage:', typeof showPlantEntryPage === 'function');
    console.log('- Region links count:', document.querySelectorAll('.region-link').length);
    console.log('- Login form available:', document.getElementById('loginForm') !== null);

    // Expose navigation for inline handlers (and other modules)
    window.showHomePage = showHomePage;
    window.showAboutPage = showAboutPage;
    window.showContactPage = showContactPage;
    window.showSubmissionsPage = showSubmissionsPage;
    window.renderRegionPanel = renderRegionPanel;

    // Expose public plant records for core.js
    window.getPublicPlantRecords = getPublicPlantRecords;

	    // Sync year-dependent labels (growth range, monthly headers, etc.)
	    try { if (typeof window.refreshYearDependentUI === 'function') window.refreshYearDependentUI(); } catch(_) {}

    console.log('NWSDB Portal (system.js) ready and initialized');
  } catch (error) {
    console.error('Error during DOM initialization:', error);
    showToast('Failed to initialize application', 'danger');
  }
});