/* enhance-bulk.js — Robust Bulk panel + Firestore Save button placement
   - Inserts Bulk panel right BEFORE "Connection Growth..." section if present,
     otherwise just below the connection categories row.
   - Button: "Add" (green), with spinner while saving
   - Saves to LocalStorage + Firestore, then refreshes charts
*/
(function(){
  const $ = (id) => document.getElementById(id);
  const isBulkCategory = (val) => /bulk/i.test(String(val||''));
  const toNumberOrNull = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  function toast(msg, type){ try{ (window.showToast||console.log)(msg, type); }catch(_){ console.log(`[${type||'info'}]`, msg); } }

  function findGrowthAnchor(){
    // Prefer explicit "extended-sections" (created by builder)
    const ext = document.getElementById('extended-sections');
    if (ext && ext.parentElement) return ext;
    // Try to locate the first H4 that looks like "Connection Growth During Last 10 Years"
    const hs = Array.from(document.querySelectorAll('h4'));
    for (const h of hs){
      const t = (h.textContent||'').toLowerCase();
      if (t.includes('connection growth') || t.includes('monthly data') || t.includes('expenditure categorization')){
        return h.closest('.card') || h;
      }
    }
    return null;
  }

  function findCategoriesAnchor(){
    // Whole "Connection Categories" section if it has an id
    const sec = document.querySelector('#connectionCategories');
    if (sec) return sec;
    // Row containing number of connections
    const countEl = document.getElementById('existingConnections');
    if (countEl){
      const row = countEl.closest('.row') || countEl.parentElement;
      if (row && row.parentElement) return row.parentElement;
    }
    // Fallback
    return document.getElementById('connectionsCard') || document.querySelector('#data-entry-page .container') || document.body;
  }

  function ensureBulkFieldsInjected(){
    if (document.getElementById('bulk-extra-fields')) return;

    const wrap = document.createElement('div');
    wrap.id = 'bulk-extra-fields';
    wrap.className = 'card border-0 shadow-sm mt-3';
    wrap.innerHTML = `
      <div class="card-body">
        <h6 class="mb-2">Bulk-only Details</h6>
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label small">Account Number</label>
            <select id="bulk-account-select" class="form-select form-select-sm">
              <option value="">Select account number (optional)</option>
            </select>
            <input id="bulk-account" class="form-control form-control-sm mt-2" type="text" placeholder="Account # (fallback)">
          </div>
          <div class="col-md-3">
            <label class="form-label small">Quantity</label>
            <input id="bulk-quantity" class="form-control form-control-sm" type="number" step="any" min="0" placeholder="0">
          </div>
          <div class="col-md-3">
            <label class="form-label small">Billing Month</label>
            <select id="bulk-month" class="form-select form-select-sm">
              <option value="">Select month</option>
              <option>January</option>
              <option>February</option>
              <option>March</option>
              <option>April</option>
              <option>May</option>
              <option>June</option>
              <option>July</option>
              <option>August</option>
              <option>September</option>
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small">Monthly Bill</label>
            <input id="bulk-monthly" class="form-control form-control-sm" type="number" step="any" min="0" placeholder="0">
          </div>
          <div class="col-md-3">
            <label class="form-label small">Officer Tel</label>
            <input id="bulk-officer" class="form-control form-control-sm" type="text" placeholder="Phone">
          </div>
          <div class="col-md-3">
            <label class="form-label small">Supplier Name</label>
            <input id="bulk-supplier" class="form-control form-control-sm" type="text" placeholder="Supplier name">
          </div>
          <div class="col-md-9">
            <label class="form-label small">Location</label>
            <input id="bulk-location" class="form-control form-control-sm" type="text" placeholder="Location">
          </div>
        </div>
        <div class="d-flex justify-content-end mt-3">
          <button id="bulk-add-btn" style="position:relative; z-index: 2005; pointer-events:auto" type="button" class="btn btn-success px-4 bulk-add-btn">
            <i class="fa-solid fa-plus me-1"></i> Add
          </button>
        </div>
      </div>`;

    // Try to place it *before* the growth/extended sections
    const growth = findGrowthAnchor();
    if (growth && growth.parentElement){
      growth.parentElement.insertBefore(wrap, growth);
    } else {
      // Otherwise, place right after the categories area
      const cats = findCategoriesAnchor();
      if (cats && cats.parentElement) cats.parentElement.insertBefore(wrap, cats.nextSibling);
      else document.body.appendChild(wrap);
    }

    // Visibility by category
    const catSel = document.getElementById('categorySelect');
    const setVisible = () => { wrap.style.display = isBulkCategory(catSel?.value) ? '' : 'none'; };
    setVisible();
    if (catSel) catSel.addEventListener('change', setVisible);

    // Click handler
    document.getElementById('bulk-add-btn')?.addEventListener('click', onAddBulk);
    document.getElementById('bulkAddBtn')?.addEventListener('click', onAddBulk);
    document.querySelector('.bulk-add-btn')?.addEventListener('click', onAddBulk);
  }

  async function onAddBulk(){
    const addBtn = document.getElementById('bulk-add-btn');
    try {
      const ctx = window.DATA_CTX || {};
      if (!ctx.region || !ctx.location) { toast('Select region & location first.', 'danger'); return; }

      const catSel = document.getElementById('categorySelect');
      const category = catSel?.value || '';
      if (!isBulkCategory(category)) { toast('Pick a Bulk category first.', 'warning'); return; }

      const countStr = document.getElementById('existingConnections')?.value ?? '';
      const count = Number(countStr);
      if (!Number.isFinite(count)) { toast('Enter a valid count for this Bulk item.', 'warning'); return; }

      const read = (id) => (document.getElementById(id)?.value || '').trim();
      const sel = document.getElementById('bulk-account-select');
      const accountNumber = sel && sel.value ? sel.value : read('bulk-account');

      const m = {
        accountNumber,
        quantity:   toNumberOrNull(read('bulk-quantity')),
        monthlyBill:toNumberOrNull(read('bulk-monthly')),
        officerTel: read('bulk-officer'),
        supplierName: read('bulk-supplier'),
        location: read('bulk-location'),
        billingMonth: read('bulk-month')
      };
      const meta = Object.fromEntries(Object.entries(m).filter(([_,v]) => v !== '' && v != null && !Number.isNaN(v)));

      ctx.entries = Array.isArray(ctx.entries) ? ctx.entries : [];
      ctx.entries.push({ category, count, meta });
      try { window.saveConnectionsLS?.(ctx.region, ctx.location, ctx.entries); } catch(_){}
      try { window.renderConnectionsList?.(); } catch(_){}

      const prevHTML = addBtn.innerHTML; addBtn.disabled = true; addBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Adding...';
      try {
        if (typeof window.saveSchemeData === 'function') {
          await window.saveSchemeData({ region: ctx.region, location: ctx.location, connections: ctx.entries });
        } else {
          toast('saveSchemeData not found. Saved locally only.', 'warning');
        }
        toast('Added successfully.', 'success');
      } finally {
        addBtn.disabled = false; addBtn.innerHTML = prevHTML;
      }

      try { if (typeof window.initSubmissionsIfNeeded === 'function') window.initSubmissionsIfNeeded(); } catch(_){}
      try { if (window.subPageInited && typeof window.renderSubmissions === 'function') window.renderSubmissions(); } catch(_){}
      try { if (typeof window.initLandingCharts === 'function') window.initLandingCharts(); } catch(_){}

      ['bulk-quantity','bulk-monthly','bulk-officer','bulk-supplier','bulk-location','bulk-account'].forEach(id => { const el = document.getElementById(id); if (el) el.value=''; });
      if (sel) sel.selectedIndex = 0;
      if (catSel) { catSel.selectedIndex = 0; catSel.dispatchEvent(new Event('change')); }
      const countEl = document.getElementById('existingConnections'); if (countEl) countEl.value = '';
    } catch (e) {
      console.warn('Bulk Add (cloud) failed:', e);
      toast('Could not save to Firebase. Kept a local copy.', 'danger');
      if (addBtn){ addBtn.disabled = false; addBtn.innerHTML = '<i class="fa-solid fa-plus me-1"></i> Add'; }
    }
  }

  function init(){ try { ensureBulkFieldsInjected(); } catch(_){ } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


/* === Inject secondary Add button under Bulk fields === */
(function(){
  function addSecondaryBulkAdd(){
    try{
      var container = document.getElementById('bulk-extra-fields');
      if (!container) return;
      if (document.getElementById('bulk-add-extended-btn')) return; // already added

      var wrap = document.createElement('div');
      wrap.className = 'mt-3 d-flex';
      wrap.innerHTML = '<button id="bulk-add-extended-btn" type="button" class="btn btn-success"><i class="fa-solid fa-plus me-1"></i> Add</button>';
      container.appendChild(wrap);

      var trigger = function(){
        var topBtn = document.getElementById('bulk-add-btn');
        if (topBtn) {
          topBtn.click(); // reuse the exact same save logic
        }
      };
      document.getElementById('bulk-add-extended-btn').addEventListener('click', trigger);
    }catch(e){ console.warn('Failed to add secondary Add button', e); }
  }

  // Run now and also when DOM changes (e.g., when category switches to Bulk)
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', addSecondaryBulkAdd);
  } else {
    addSecondaryBulkAdd();
  }
  // Observe DOM for dynamic injection of bulk panel
  try{
    var mo = new MutationObserver(function(){
      addSecondaryBulkAdd();
    });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }catch(e){}
})();
/* === End secondary Add button patch === */
