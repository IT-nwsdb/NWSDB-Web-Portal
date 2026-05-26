/* hrm.js — Full HRM module (sheets UI + Firebase save/load)
   ----------------------------------------------------------
   - Builds each Excel-like sheet as a tabbed table with inputs
   - Exact designations per sheet (no prefilled values)
   - Auto-calcs: E=B+C+D, H=F+G, I=H-E, plus totals row
   - Save/Load from Firestore using existing Firebase init (script.js)
   - Uses collections:
       hrmSheets/<SHEET_KEY>  -> { meta, rows: [...] }
   - Requires:
       - Bootstrap + your app shell already in index.html
       - FB object from script.js (initFirebase, ensureOnlineAuth, etc.)
       - showToast(), togglePage() helpers from script.js
*/

(function () {
  const HRM_COMPACT_MODE = true; // show only 10 columns
  const HRM_PREVIEW_LIMIT = 200; // rows to render in preview table


  function buildDesignationOptions(def, selectedName) {
    const opts = def.designations.map(d => {
      const sel = (d === selectedName) ? ' selected' : '';
      return `<option value="${d.replace(/"/g, '&quot;')}"${sel}>${d}</option>`;
    }).join('');
    return `<select class="form-select form-select-sm hrm-designation">${opts}</select>`;
  }

  // ----------------------------
  // 1) Sheet schemas & designations
  // ----------------------------
  // Common column headers (match your workbook)
  const BASE_HEADERS = [
    "No.",
    "Designation",
    "2011 approved Cadre (A)",
    "In Permanent (B)",
    "In Acting (C)",
    "In Manpower Contract (D)",
    "Total Available Staff (E = B+C+D)",
    "Total Proposed Staff (H)",
    "Vacancies to be Filled (I = H - E)",
    "Remarks"
  ];

  // NOTE:
  // These designation lists are built to match the workbook sheets
  // you provided. If you spot any name to tweak, just edit the list
  // and it will flow through everywhere instantly.

  const SHEET_DEFINITIONS = {
    "RSC(C)": {
      title: "RSC (Central) — Staff Cadre",
      headers: BASE_HEADERS,
      designations: [
        "DGM ( C )",
        "AGM (Development)",
        "AGM (O&M )",
        "CE (Civil)",
        "CE -  (M&E)",
        "Manager (Commercial)",
        "Manager (HR)",
        "Chief Accountant",
        "Engineer- (Civil)",
        "Engineer- (Electrical)",
        "Engineer- (Mechanical)",
        "Engineer - (Electronic)",
        "Hydrogeologist",
        "Quantity Surveyor",
        "D.O.A (Drawing Office Assistant)",
        "Draughtsman",
        "Internal Auditor",
        "EA - (Civil)",
        "EA - (Mechanical)",
        "EA - (Electrical)",
        "EA - (Mechanical) GW",
        "EA - (Electronic)",
        "Sociologist",
        "Land Acquisition Officer",
        "Training Officer",
        "Human Resourse Officer",
        "Human Resourse Officer (Investigation)",
        "Accountant (Payment)",
        "Accountant (Costing)",
        "Supplies Officer",
        "Asset Officer",
        "Personal Secretary",
        "MA (Supra) Accounts",
        "MA (Suppra) Audit",
        "MA (Supra) HR",
        "MA (HR)",
        "MA (Accounts)",
        "MA (Stores)",
        "MA - (Accounts) - Costing",
        "MA (Cashier)",
        "Drivers",
        "Fitter",
        "W0RK Supervisor",
        "Drillers",
        "Labourer (Office Assistant)",
        "Carpenter"
      ]
    },

    "M (KCWTP)": {
      title: "Manager — KCWTP",
      headers: BASE_HEADERS,
      designations: [
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
      ]
    },

    "CE (NRW)": {
      title: "Chief Engineer (NRW)",
      headers: BASE_HEADERS,
      designations: [
        "Chief Engineer (Civil)",
        "Engineer (Civil)",
        "Engineering Assistant (Civil)",
        "Management Assistant (HR)",
        "Skilled Labour",
        "Laborer"
      ]
    },

    "M (PROD)": {
      title: "Manager (Production)",
      headers: BASE_HEADERS,
      designations: [
        "Manager",
        "Engineer (Mech)",
        "Chemist",
        "Lab Assisstant",
        "Lab Attendant",
        "EA (Civil)",
        "EA (Mech)",
        "EA (Electrical/ Electronic)",
        "Electronic technician",
        "Electrician",
        "Mechanic",
        "Pipe Fitter",
        "Treatemtn Plant Technician",
        "Driver",
        "MA (HR)",
        "MA (SK)",
        "MA (Supply)",
        "Labourer",
        "Water meter repireman",
        "Engineer (Elec)",
        "EA (Electrical)",
        "Treatement Plant Technician",
        "MA",
        "Water meter repairmen"
      ]
    },

    "CE (ME-Matale)": {
      title: "Chief Engineer (M&E) — Matale",
      headers: BASE_HEADERS,
      designations: [
        "Chief Engineer (M&E)",
        "Engineer (E&M)",
        "EA - (E&M)",
        "MA - (Computer Operating)",
        "Driver",
        "Chemist",
        "Lab Assistant",
        "Lab Attendant",
        "Engineering Assistant (Mech)",
        "Treatment Plant technician",
        "Pump operator",
        "Mechanic",
        "Electritian",
        "Laborer",
        "Management Assistant",
        "Fitter (mechanic)",
        "Engineering Assitant (Mech)",
        "Engineering Assitant (Elect )",
        "Labourer",
        "Engineering Assistant, Mech (OIC)",
        "Engineering Assistant, Elect",
        "Fiitters (Mecanical  works)",
        "Electrician",
        "Care taker",
        "Engineering Assistant, Elect. & Mech. (OIC)",
        "Caretaker",
        "Engineer (Elec)",
        "EA - (Mechanic)",
        "EA - (Electrical)",
        "MA",
        "Treatment Plant Technician",
        "Pump Operator",
        "Fitter"
      ]
    },

    "M (M)": {
      title: "Manager (O&M)",
      headers: BASE_HEADERS,
      designations: [
        "Manager (O&M)",
        "Engineer (O&M)",
        "System Adminstrator",
        "Accountant",
        "Comercial Officer",
        "EA (Civil)",
        "Comercial Assistant",
        "MA (Stores)",
        "MA -Accounts (Supra)",
        "MA -HR (Supra)",
        "MA -Supplies (Supra)",
        "MA -Accounts",
        "MA -HR",
        "MA -Supplies",
        "MA - (Word Processing)",
        "MA-(Cash & Funds)",
        "Drivers",
        "Labourer (Office)",
        "Labourer (Stores)",
        "Area Engineer/Distric Enginner",
        "EA - (Civil)",
        "MA- (HR)",
        "MA- (CRC) Comsumer Relation",
        "MA - (Computer Operating)",
        "Meter Reader Inspector",
        "Driver",
        "Labourer(Office activities)",
        "MA (HR)",
        "Meter Reader",
        "Work Supervisor",
        "Caretaker",
        "Fitter",
        "Labourer",
        "Pump Operator",
        "TA Civil",
        "Plant Technician",
        "MA",
        "Meter Readers",
        "Area Engineer",
        "MA- (WP)",
        "MA (CRA)",
        "Backhoe operator",
        "Driver (Leak Repairs)",
        "MA -(HR)",
        "EA (Elec)",
        "Electrician",
        "Mechanic",
        "Management Assistant",
        "Engineer (Civil)",
        "Engineer (Mech)",
        "Engineer (Elec)",
        "Draughtsman",
        "EA (Mech)",
        "MA - Supra (Audit)",
        "Management Assistant (supra-HR)",
        "MA (Cashier)",
        "Revenue Assistant",
        "Pump Operator/ Caretaker",
        "Treatment Plant Technician",
        "Backhoe Operator",
        "Quantity Surveyor",
        "Hardware Technician"
      ]
    },

    "M (CE)": {
      title: "Manager (CE)",
      headers: BASE_HEADERS,
      designations: [
        "Manager (O&M)",
        "Engineer (O & M)",
        "Engineer (Mechanical)",
        "Engineer (Electrical)",
        "TA",
        "System Administrator",
        "System Operator",
        "IT Technician",
        "Accountant",
        "Chemist",
        "Commercial Officer",
        "E.A. (Civil)",
        "E.A. (Elec)",
        "E.A. (Mech)",
        "Commercial Assistant",
        "Lab Assistant",
        "Lab attendent",
        "MA",
        "Electricians",
        "Mechanic",
        "Drivers",
        "Labourer (Office)",
        "Labourer (Stores)",
        "Area Engineer/Distric Enginner",
        "EA - (Civil)",
        "Meter Reader Inspector",
        "Revenue Assistant",
        "Driver",
        "Labourer(Office activities)",
        "Work Supervisor",
        "Fitter",
        "Labourer",
        "pump Operators",
        "Pump Operators",
        "Pump Operator",
        "Care taker",
        "Caretaker",
        "TA (Civil)",
        "Plant Technician",
        "Laboures",
        "Laboure",
        "Driver (Leak Repairs)",
        "FITTER",
        "Treatment Plant Technician",
        "Labour",
        "EA - (Civil/Mech/Electrical)",
        "Opump Operators",
        "Engineer (Civil)",
        "Engineer (Mech)",
        "Engineer (Elec)",
        "Lab Attendent",
        "Comercial Officer",
        "EA (Civil)",
        "Draughtsman",
        "EA (Mech)",
        "EA (Elec)",
        "Comercial Assistant",
        "MA (Supra)",
        "MA - Supra (Audit)",
        "MA (Cashier)",
        "MA (Stores)",
        "Pump Operator/ Caretaker",
        "Electrician",
        "Quantity Surveyor",
        "Hardware Technician"
      ]
    },

    "M (CN)": {
      title: "Manager (CN)",
      headers: BASE_HEADERS,
      designations: [
        "CHIEF ENGINEER(CIVIL -  MANAGER(O&M)",
        "ENGINEER (CIVIL)",
        "ENGINEER(MECHANICAL)",
        "CHEMIST",
        "ACCOUNTANT",
        "COMMERCIAL OFFICER  (OPERATION / INVESTIGATIONS)",
        "ENGINEERING ASSISTANT (CIVIL)",
        "System Administrator",
        "IT Technician",
        "ENGINEERING ASSISTANT (M&E)",
        "DRAUGHTSMAN",
        "MANAGEMENT ASSISTANT (SUPRA) - ACCOUNTS",
        "MA - Supra (Audit)"
      ]
    },

    "M (CS)": {
      title: "Manager (CS)",
      headers: BASE_HEADERS,
      designations: [
        // Add the full list per the Excel sheet "M (CS)"
        // If the sheet contains many rows, paste them here.
      ]
    },

    "AGM(O&M)": {
      title: "AGM (O&M)",
      headers: BASE_HEADERS,
      designations: [
        "AGM (O&M)",
        "Chief Engineer",
        "Management Assistant (Technical)",
        "Management Assistant (HR)",
        "Office Assistant",
        "Driver"
      ]
    }
  };

  // If you want to hide particular sheets, remove them from ORDER:
  const SHEET_ORDER = [
    "RSC(C)",
    "M (KCWTP)",
    "CE (NRW)",
    "M (PROD)",
    "CE (ME-Matale)",
    "M (M)",
    "M (CE)",
    "M (CN)",
    "M (CS)",
    "AGM(O&M)"
  ];

  // ----------------------------
  // 2) Routing (open HRM page)
  // ----------------------------
  window.showHRMPage = function () {
    if (typeof togglePage === 'function') togglePage('hrm-page');
    // Build tabs when first opened
    const host = document.getElementById('hrm-main');
    if (host && !host.dataset.hrmBuilt) {
      buildTabs();
      host.dataset.hrmBuilt = '1';
    }
  };

  // ----------------------------
  // 3) Build tab UI
  // ----------------------------
  function buildTabs() {
    try {
      // Tabs list exists in index.html already; we refill panes
      const panes = {
        "hrm-summary": document.getElementById('hrm-summary'),
        "hrm-m-kcwtp": document.getElementById('hrm-m-kcwtp'),
        "hrm-ce-nrw": document.getElementById('hrm-ce-nrw'),
        "hrm-m-prod": document.getElementById('hrm-m-prod'),
        "hrm-ce-me-matale": document.getElementById('hrm-ce-me-matale'),
        "hrm-m-m": document.getElementById('hrm-m-m'),
        "hrm-m-ce": document.getElementById('hrm-m-ce'),
        "hrm-m-cn": document.getElementById('hrm-m-cn'),
        "hrm-m-cs": document.getElementById('hrm-m-cs')
      };

      // Summary: simple quick-help
      if (panes["hrm-summary"]) {
        panes["hrm-summary"].innerHTML = `
          <div class="alert alert-info">
            <i class="fa-solid fa-circle-info me-1"></i>
            Pick a sheet tab above to enter cadre data. Use <b>Save</b> to persist to cloud and load it back next time.
          </div>
        `;
      }

      // Map sheet -> pane id
      const sheetToPaneId = {
        "M (KCWTP)": "hrm-m-kcwtp",
        "CE (NRW)": "hrm-ce-nrw",
        "M (PROD)": "hrm-m-prod",
        "CE (ME-Matale)": "hrm-ce-me-matale",
        "M (M)": "hrm-m-m",
        "M (CE)": "hrm-m-ce",
        "M (CN)": "hrm-m-cn",
        "M (CS)": "hrm-m-cs"
      };

      // For all sheet panes, build the table
      SHEET_ORDER.forEach((key) => {
        if (key === "RSC(C)") {
          // RSC(C) lives on dedicated page in your HTML; leave it to its page builder if used.
          return;
        }
        const paneId = sheetToPaneId[key];
        const pane = panes[paneId];
        if (pane) {
          pane.innerHTML = buildSheetHTML(key, SHEET_DEFINITIONS[key]);
          attachSheetBehavior(pane, key, SHEET_DEFINITIONS[key]);
          // Attempt to load saved data
          loadSheetFromCloud(key, pane);
        }
      });
    } catch (e) {
      console.error('Failed to build HRM tabs:', e);
      showToast?.('Failed to build HRM tabs', 'danger');
    }
  }

  // ----------------------------
  // 4) Build one sheet table HTML
  // ----------------------------
  function buildSheetHTML(sheetKey, def) {
    const { title, headers, designations } = def;
    const headerRow1 = `
      <tr class="table-light">
        ${headers.map((h, i) => `<th scope="col"${i === 1 ? ' style="min-width:260px"' : ''}>${h}</th>`).join('')}
      </tr>
    `;

    const rows = designations.map((name, i) => {
      const no = String(i + 1).padStart(2, '0');
      return `
        <tr data-row="${i}">
          <td class="text-center fw-semibold">${String(i + 1).padStart(2,'0')}</td>
          <td class="text-start">${buildDesignationOptions(def, name)}</td>
          <td><input type="number" class="form-control form-control-sm hrm-input" data-col="A"></td>
          <td><input type="number" class="form-control form-control-sm hrm-input" data-col="B"></td>
          <td><input type="number" class="form-control form-control-sm hrm-input" data-col="C"></td>
          <td><input type="number" class="form-control form-control-sm hrm-input" data-col="D"></td>
          <td class="text-center fw-semibold hrm-calc" data-col="E">0</td>
          <td><input type="number" class="form-control form-control-sm hrm-input" data-col="Hc" placeholder="H"></td>
          <td class="text-center fw-semibold hrm-calc" data-col="I">0</td>
          <td><input type="text" class="form-control form-control-sm hrm-input" data-col="R"></td>
        </tr>
`;
    }).join('');

    const totals = `
      <tr class="table-secondary fw-semibold">
        <td colspan="2" class="text-center">Total</td>
        <td id="totA" class="text-center">0</td>
        <td id="totB" class="text-center">0</td>
        <td id="totC" class="text-center">0</td>
        <td id="totD" class="text-center">0</td>
        <td id="totE" class="text-center">0</td>
        
        
        <td id="totH" class="text-center">0</td>
        <td id="totI" class="text-center">0</td>
        <td></td>
      </tr>
    `;

    const ctxBar = `
      <div class="d-flex flex-wrap gap-2 mb-3">
        <input type="text" class="form-control" id="hrm-meta-region" placeholder="Region (optional)" style="max-width: 220px;">
        <input type="text" class="form-control" id="hrm-meta-zone" placeholder="Manager Zone (optional)" style="max-width: 260px;">
        <input type="text" class="form-control" id="hrm-meta-conn" placeholder="No. of Connection (optional)" style="max-width: 220px;">
        <input type="text" class="form-control" id="hrm-meta-capacity" placeholder="Plant Capacity (optional)" style="max-width: 220px;">
        <div class="ms-auto d-flex gap-2">
          <button type="button" class="btn btn-outline-secondary" id="hrm-back"><i class="fa-solid fa-arrow-left me-1"></i> Back</button>
<button type="button" class="btn btn-outline-secondary" id="hrm-clear"><i class="fa-solid fa-eraser me-1"></i> Clear</button>
          <button type="button" class="btn btn-success" id="hrm-save"><i class="fa-solid fa-floppy-disk me-1"></i> Save</button>
        </div>
          <hr/>
          <div class="mt-3" id="hrm-preview-${sheetKey}"></div>
        </div>
      </div>
    `;

    return `
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h4 class="mb-3">${title}</h4>
          ${ctxBar}
          <div class="table-responsive">
            <table class="table table-bordered align-middle small text-center hrm-table" data-sheet="${sheetKey}">
              <thead>${headerRow1}</thead>
              <tbody>${rows}</tbody>
              <tfoot>${totals}</tfoot>
            </table>
          </div>
        </div>
          <hr/>
          <div class="mt-3" id="hrm-preview-${sheetKey}"></div>
        </div>
      </div>
    `;
  }

  // ----------------------------
  // 5) Wire up one sheet: calcs + save/load
  // ----------------------------
  function attachSheetBehavior(pane, sheetKey, def) {
    const table = pane.querySelector('.hrm-table');
    if (!table) return;

    // Input events
    table.addEventListener('input', (e) => {
      if (!(e.target instanceof HTMLInputElement)) return;
      if (!e.target.classList.contains('hrm-input')) return;
      const rowEl = e.target.closest('tr[data-row]');
      if (!rowEl) return;
      recalcRow(rowEl);
      recalcTotals(table);
    });

    // Buttons
    pane.querySelector('#hrm-save')?.addEventListener('click', async () => {
      try {
        await saveSheetToCloud(sheetKey, table, pane);
    pane.querySelector('#hrm-back')?.addEventListener('click', () => {
      try { if (typeof showHRMPage === 'function') { showHRMPage(); return; } } catch(e){}
      try { if (typeof showHomePage === 'function') { showHomePage(); return; } } catch(e){}
      history.back();
    });
      } catch (err) {
        console.error('Save failed:', err);
        showToast?.('Failed to save HRM sheet', 'danger');
      }
    });

    pane.querySelector('#hrm-clear')?.addEventListener('click', () => {
      table.querySelectorAll('input.hrm-input').forEach(inp => inp.value = '');
      table.querySelectorAll('.hrm-calc').forEach(td => td.textContent = '0');
      recalcTotals(table);
    });

    // Initial totals
    recalcTotals(table);
  }

  function valNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function recalcRow(rowEl) {
    const B = valNum(rowEl.querySelector('input[data-col="B"]')?.value);
    const C = valNum(rowEl.querySelector('input[data-col="C"]')?.value);
    const D = valNum(rowEl.querySelector('input[data-col="D"]')?.value);
    const Hc = valNum(rowEl.querySelector('input[data-col="Hc"]')?.value);

    const E = B + C + D;
    const H = Hc;
    const I = H - E;

    rowEl.querySelector('.hrm-calc[data-col="E"]').textContent = String(E);
    rowEl.querySelector('.hrm-calc[data-col="H"]').textContent = String(H);
    rowEl.querySelector('.hrm-calc[data-col="I"]').textContent = String(I);
  }

  function recalcTotals(table) {
    const cols = ['A','B','C','D','E','H','I'];
    const totals = { A:0, B:0, C:0, D:0, E:0, H:0, I:0 };

    // Sum input columns
    ['A','B','C','D','Hc'].forEach(col => {
      table.querySelectorAll(`tbody input[data-col="${col}"]`).forEach(inp => {
        if(col==='Hc'){ totals['H'] += valNum(inp.value);} else { totals[col] += valNum(inp.value);}
      });
    });

    // Sum calc columns
    ['E','I'].forEach(col => {
      table.querySelectorAll(`tbody .hrm-calc[data-col="${col}"]`).forEach(td => {
        totals[col] += valNum(td.textContent);
      });
    });

    Object.entries(totals).forEach(([k,v]) => {
      const cell = table.querySelector(`#tot${k}`);
      if (cell) cell.textContent = String(v);
    });
  }

  // ----------------------------
  // 6) Cloud save/load (Firestore)
  // ----------------------------
  function collectSheetPayload(sheetKey, table, pane) {
    const meta = {
      region: pane.querySelector('#hrm-meta-region')?.value?.trim() || '',
      zone: pane.querySelector('#hrm-meta-zone')?.value?.trim() || '',
      connections: pane.querySelector('#hrm-meta-conn')?.value?.trim() || '',
      capacity: pane.querySelector('#hrm-meta-capacity')?.value?.trim() || ''
    };

    const rows = Array.from(table.querySelectorAll('tbody tr[data-row]')).map((tr, i) => {
      const name = tr.querySelector("select.hrm-designation")?.value?.trim() || tr.children[1]?.textContent?.trim() || `Row ${i+1}`;
      const A = valNum(tr.querySelector('input[data-col="A"]')?.value);
      const B = valNum(tr.querySelector('input[data-col="B"]')?.value);
      const C = valNum(tr.querySelector('input[data-col="C"]')?.value);
      const D = valNum(tr.querySelector('input[data-col="D"]')?.value);
      const E = valNum(tr.querySelector('.hrm-calc[data-col="E"]')?.textContent);
      const F = 0;
      const G = 0;
      const H = valNum(tr.querySelector('input[data-col="Hc"]')?.value);
      const I = valNum(tr.querySelector('.hrm-calc[data-col="I"]')?.textContent);
      const remarks = tr.querySelector('input[data-col="R"]')?.value?.trim() || '';
      return { name, A,B,C,D,E,F,G,H,I, remarks };
    });

    const totals = {
      A: valNum(table.querySelector('#totA')?.textContent),
      B: valNum(table.querySelector('#totB')?.textContent),
      C: valNum(table.querySelector('#totC')?.textContent),
      D: valNum(table.querySelector('#totD')?.textContent),
      E: valNum(table.querySelector('#totE')?.textContent),
      F: valNum(table.querySelector('#totF')?.textContent),
      G: valNum(table.querySelector('#totG')?.textContent),
      H: valNum(table.querySelector('#totH')?.textContent),
      I: valNum(table.querySelector('#totI')?.textContent),
    };

    return { sheetKey, meta, rows, totals, updatedAt: new Date().toISOString() };
  }

  async function saveSheetToCloud(sheetKey, table, pane) {
    // Use your existing Firebase bootstrap (script.js)
    try {
      if (!window.FB || !window.FB.mod) {
        await window.initFirebase?.();
      }
      await window.ensureOnlineAuth?.();

      const payload = collectSheetPayload(sheetKey, table, pane);

      const { fsMod } = FB.mod;
      const ref = fsMod.doc(FB.db, 'hrmSheets', sheetKey);
      await fsMod.setDoc(ref, payload, { merge: true });

      try {
        await window.waitForServerCommit?.(4000);
      } catch (_) {}

      showToast?.('HRM sheet saved successfully!', 'success');
    } catch (e) {
      console.warn('Saving online failed, caching locally:', e);
      // Local fallback
      try {
        localStorage.setItem(`nwsdb:hrm:${sheetKey}`, JSON.stringify(collectSheetPayload(sheetKey, table, pane)));
        showToast?.("Saved locally (offline). Will sync when you're online.", "warning");
      } catch (err) {
        console.error('Local fallback failed:', err);
        showToast?.("Save failed.", "danger");
      }
    }
  }

  async function loadSheetFromCloud(sheetKey, pane) {
    const table = pane.querySelector('.hrm-table');
    if (!table) return;

    const hydrate = (data) => {
      try {
        if (data?.meta) {
          pane.querySelector('#hrm-meta-region').value = data.meta.region || '';
          pane.querySelector('#hrm-meta-zone').value = data.meta.zone || '';
          pane.querySelector('#hrm-meta-conn').value = data.meta.connections || '';
          pane.querySelector('#hrm-meta-capacity').value = data.meta.capacity || '';
        }
        if (Array.isArray(data?.rows)) {
          const trs = table.querySelectorAll('tbody tr[data-row]');
          data.rows.forEach((r, idx) => {
            const tr = trs[idx];
            if (!tr) return;
            const set = (sel, v) => { const el = tr.querySelector(sel); if (el) el.value = (v ?? '') === 0 ? '' : String(v ?? ''); };
            const setSel = (sel, v) => { const el = tr.querySelector(sel); if (el) el.value = String(v ?? ''); };
            setSel('select.hrm-designation', r.name);
            set('input[data-col="A"]', r.A);
            set('input[data-col="B"]', r.B);
            set('input[data-col="C"]', r.C);
            set('input[data-col="D"]', r.D);
            tr.querySelector('.hrm-calc[data-col="E"]').textContent = String(r.E ?? 0);
            set('input[data-col="Hc"]', r.H);
            tr.querySelector('.hrm-calc[data-col="I"]').textContent = String(r.I ?? 0);
            set('input[data-col="R"]', r.remarks || '');
          });
          recalcTotals(table);
        }
      } catch (err) {
        console.error('Failed hydrating sheet:', err);
      }
    };

    // Try cloud first
    try {
      if (!window.FB || !window.FB.mod) {
        await window.initFirebase?.();
      }
      const { fsMod } = FB.mod;
      const ref = fsMod.doc(FB.db, 'hrmSheets', sheetKey);
      const snap = await fsMod.getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        hydrate(data);
        showToast?.('Loaded from cloud.', 'info');
        return;
      }
    } catch (e) {
      console.warn('Cloud load failed, falling back to local:', e);
    }

    // Local fallback
    try {
      const raw = localStorage.getItem(`nwsdb:hrm:${sheetKey}`);
      if (raw) hydrate(JSON.parse(raw));
    } catch (err) {
      console.warn('No local cache for', sheetKey);
    }
  }

  // Expose small helpers (optional)
  window.__HRM_DEBUG = {
    SHEET_DEFINITIONS,
    SHEET_ORDER
  };
})();
  function renderHRMSavedPreview(sheetKey, pane, data){
    try{
      const previewId = `hrm-preview-${sheetKey}`;
      const host = pane.querySelector(`#${previewId}`);
      if(!host) return;
      if(!data || !Array.isArray(data.rows)){ host.innerHTML=''; return; }
      const rows = data.rows;
      const head = `<thead><tr><th>No.</th><th>Designation</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>H</th><th>I</th><th>Remarks</th></tr></thead>`;
      const body = rows.map((r,idx)=>`<tr><td>${String(idx+1).padStart(2,'0')}</td><td>${r.name||''}</td><td>${r.A||0}</td><td>${r.B||0}</td><td>${r.C||0}</td><td>${r.D||0}</td><td>${r.E||0}</td><td>${r.H||0}</td><td>${r.I||0}</td><td>${r.remarks||''}</td></tr>`).join('');
      host.innerHTML = `<div class="card"><div class="card-body"><h6 class="mb-2">Saved Data</h6><div class="table-responsive"><table class="table table-sm table-bordered">${head}<tbody>${body}</tbody></table></div></div></div>`;
    }catch(e){ console.warn('preview render failed', e); }
  }



// ===== HRM Save Buttons (Generic Serializer + Firestore Save) =====
(function(){
  function serializeFields(root) {
    const data = {};
    if (!root) return data;
    const fields = root.querySelectorAll('input, select, textarea');
    fields.forEach(el => {
      const key = (el.name || el.id || '').trim();
      if (!key) return;
      if (el.type === 'checkbox') data[key] = !!el.checked;
      else if (el.type === 'radio') { if (el.checked) data[key] = el.value; }
      else data[key] = el.value;
    });
    return data;
  }

  async function saveHRMSheet(sheetKey) {
    try {
      if (typeof ensureOnlineAuth === 'function') await ensureOnlineAuth();
      if (!window.FB || !FB.db || !FB.mod || !FB.mod.fsMod) throw new Error('Firestore not ready');

      const pane = document.getElementById(sheetKey.toLowerCase().replace(/_/g,'-'));
      // Fallback: try hrm-* mapping if ids differ from key
      const candidates = [
        pane,
        document.getElementById('hrm-' + sheetKey.toLowerCase().replace(/_/g,'-')),
        document.querySelector(`[data-sheet-id="${sheetKey}"]`)
      ];
      const container = candidates.find(Boolean) || document.getElementById('hrm-page');
      const payload = serializeFields(container);
      payload.sheetKey = sheetKey;
      payload.updatedAt = (FB.mod?.fsMod?.serverTimestamp?.() || new Date().toISOString());

      const id = sheetKey; // One doc per sheetKey
      const { fsMod } = FB.mod;
      await fsMod.setDoc(fsMod.doc(FB.db, 'hrmSheets', id), payload, { merge: true });
      try { await (window.waitForServerCommit ? waitForServerCommit(5000) : Promise.resolve()); } catch(_){}

      if (typeof showToast === 'function') showToast(`Saved ${sheetKey} to Firestore`, 'success');
      console.log('HRM sheet saved:', sheetKey, payload);
    } catch (e) {
      console.error('Save HRM sheet failed:', sheetKey, e);
      if (typeof showToast === 'function') {
        const msg = (e && e.message) ? e.message : String(e);
        showToast(`Save failed (${sheetKey}): ${msg}`, 'danger');
      }
    }
  }
  window.saveHRMSheet = saveHRMSheet;

  function bindHRMSaveButtons() {
    document.querySelectorAll('.hrm-save-btn').forEach(btn => {
      if (btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        const sheet = btn.getAttribute('data-sheet');
        if (!sheet) return;
        saveHRMSheet(sheet);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', bindHRMSaveButtons);
  // Re-bind after tab switches or dynamic content updates
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-bs-toggle="tab"], .nav-link');
    if (target) setTimeout(bindHRMSaveButtons, 100);
  });
  window.addEventListener('nwsdb:adminConfigUpdated', () => setTimeout(bindHRMSaveButtons, 100));
})();
// ===== End HRM Save Buttons =====
