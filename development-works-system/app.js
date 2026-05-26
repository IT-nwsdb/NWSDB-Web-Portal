/* Project Data Entry - Firebase Firestore + local browser backup */
(function () {
  'use strict';

  const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyCjRd-bHpMwHXjXMYu9PgXFcHiLXXGW8bE',
    authDomain: 'project-data-entry-198d0.firebaseapp.com',
    projectId: 'project-data-entry-198d0',
    storageBucket: 'project-data-entry-198d0.firebasestorage.app',
    messagingSenderId: '756259806254',
    appId: '1:756259806254:web:65762883c470107e6c93bf'
  };

  const COLLECTION_NAME = 'project_data_entry_sheets';
  const DOCUMENT_VERSION = 4;
  const IS_FILE_PROTOCOL = window.location.protocol === 'file:';

  const SHEETS = {
    proposed: {
      title: 'Proposed Projects',
      subtitle: 'Saved to Firebase Firestore when opened over http or https. Local browser backup is always kept.',
      storageKey: 'pde_sheet_proposed_v3',
      legacyStorageKeys: ['pde_sheet_proposed_v2', 'pde_sheet_proposed_v1'],
      autoNumber: true,
      columns: [
        { key: 'No', label: 'No', type: 'number', className: 'numeric', placeholder: '1' },
        { key: 'ProjectName', label: 'Project Name', type: 'text', placeholder: 'e.g., Kundasale Haragama WSP' },
        { key: 'District', label: 'District', type: 'text', placeholder: 'e.g., Kandy' },
        { key: 'Connections', label: 'No of Connections', type: 'text', placeholder: 'e.g., 39000' },
        { key: 'TEC', label: 'TEC (Rs. Mn)', type: 'number', className: 'numeric', placeholder: '0' },
        { key: 'PACApproval', label: 'PAC Approval', type: 'date', placeholder: '' },
        { key: 'BoardApproval', label: 'Board Approval', type: 'date', placeholder: '' },
        { key: 'NPDApproval', label: 'NPD Approval', type: 'text', placeholder: 'e.g., No / Sent to Ministry' },
        { key: 'PresentStatus', label: 'Present Status', type: 'textarea', placeholder: 'Enter current status...' }
      ]
    },
    feasibility: {
      title: 'Under Feasibility',
      subtitle: 'Saved to Firebase Firestore when opened over http or https. Local browser backup is always kept.',
      storageKey: 'pde_sheet_feasibility_v3',
      legacyStorageKeys: ['pde_sheet_feasibility_v2', 'pde_sheet_feasibility_v1'],
      autoNumber: true,
      columns: [
        { key: 'No', label: 'No', type: 'number', className: 'numeric', placeholder: '1' },
        { key: 'Project', label: 'Project', type: 'text', placeholder: 'e.g., Norwood Water Supply Project' },
        { key: 'WaterSource', label: 'Water Source', type: 'text', placeholder: 'e.g., Kehelgamu Oya' },
        { key: 'PresentStatus', label: 'Present Status', type: 'textarea', placeholder: 'Enter present status...' },
        { key: 'ExpectedCompletion', label: 'Expected Completion Date of Feasibility', type: 'date', placeholder: '' }
      ]
    },
    rechargable: {
      title: 'Rechargeable',
      subtitle: 'Saved to Firebase Firestore when opened over http or https. Local browser backup is always kept.',
      storageKey: 'pde_sheet_rechargable_v3',
      legacyStorageKeys: ['pde_sheet_rechargable_v2', 'pde_sheet_rechargable_v1'],
      autoNumber: true,
      columns: [
        { key: 'No', label: 'No', type: 'number', className: 'numeric', placeholder: '1' },
        { key: 'Scheme', label: 'Scheme', type: 'text', placeholder: 'e.g., Thennelanda CBO' },
        { key: 'ScopeOfWork', label: 'Scope of Work', type: 'textarea', placeholder: 'Describe scope of work...' },
        { key: 'Progress', label: 'Progress', type: 'textarea', placeholder: 'Progress updates...' },
        { key: 'PaymentReceived', label: 'Payment Received (Rs)', type: 'number', className: 'numeric', placeholder: '0' },
        { key: 'NWSDBCharges', label: 'NWSDB Charges (Rs)', type: 'number', className: 'numeric', placeholder: '0' }
      ]
    }
  };

  const homeView = document.getElementById('homeView');
  const sheetView = document.getElementById('sheetView');
  const homeIntro = document.getElementById('homeIntro');
  const sheetTitle = document.getElementById('sheetTitle');
  const sheetSubtitle = document.getElementById('sheetSubtitle');
  const dataTable = document.getElementById('dataTable');
  const thead = dataTable.querySelector('thead');
  const tbody = dataTable.querySelector('tbody');
  const rowCountBadge = document.getElementById('rowCountBadge');
  const lastSavedMeta = document.getElementById('lastSavedMeta');
  const dbStatus = document.getElementById('dbStatus');
  const btnAddRow = document.getElementById('btnAddRow');
  const btnSave = document.getElementById('btnSave');
  const btnClear = document.getElementById('btnClear');
  const toastEl = document.getElementById('appToast');
  const toastBody = document.getElementById('toastBody');
  const toastClose = toastEl.querySelector('.toast-close');

  let toastTimer = null;
  let firebaseReadyPromise = null;
  let db = null;
  let currentSheetKey = null;
  let currentRows = [];
  let currentSheetMeta = null;
  let editingRows = {};
  let rowDrafts = {};
  let isDirty = false;
  let isBusy = false;

  function showToast(message, delay) {
    window.clearTimeout(toastTimer);
    toastBody.textContent = message;
    toastEl.classList.remove('hidden');
    toastTimer = window.setTimeout(hideToast, delay || 3200);
  }

  function hideToast() {
    window.clearTimeout(toastTimer);
    toastEl.classList.add('hidden');
  }

  function setDbStatus(text, tone) {
    dbStatus.textContent = text;
    dbStatus.className = 'pill';
    dbStatus.classList.add(
      tone === 'success' ? 'pill-success' :
      tone === 'danger' ? 'pill-danger' :
      tone === 'secondary' ? 'pill-secondary' :
      'pill-warning'
    );
  }

  function setControlsEnabled(enabled) {
    const active = Boolean(enabled) && !isBusy;
    btnAddRow.disabled = !active;
    btnSave.disabled = !active;
    btnClear.disabled = !active;
  }

  function setBusy(value, label) {
    isBusy = Boolean(value);
    setControlsEnabled(currentSheetKey);
    if (isBusy) {
      btnSave.textContent = label || 'Working...';
      btnSave.disabled = true;
    } else {
      btnSave.textContent = isDirty ? 'Save*' : 'Save';
    }
  }

  function markDirty(value) {
    isDirty = Boolean(value);
    btnSave.classList.remove('btn-warning', 'btn-outline');
    btnSave.classList.add(isDirty ? 'btn-warning' : 'btn-outline');
    btnSave.textContent = isDirty ? 'Save*' : 'Save';
  }

  function safeJSONParse(str, fallback) {
    try {
      return JSON.parse(str);
    } catch (error) {
      return fallback;
    }
  }

  function storageAvailable() {
    try {
      const key = '__pde_storage_test__';
      window.localStorage.setItem(key, '1');
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  function readLocalBackup(sheetKey) {
    if (!storageAvailable()) {
      return [];
    }
    try {
      const cfg = SHEETS[sheetKey];
      const keys = [cfg.storageKey].concat(cfg.legacyStorageKeys || []);

      for (let i = 0; i < keys.length; i += 1) {
        const raw = window.localStorage.getItem(keys[i]);
        if (!raw) {
          continue;
        }
        const rows = safeJSONParse(raw, []);
        if (Array.isArray(rows)) {
          if (keys[i] !== cfg.storageKey) {
            window.localStorage.setItem(cfg.storageKey, JSON.stringify(rows));
          }
          return rows;
        }
      }

      return [];
    } catch (error) {
      return [];
    }
  }

  function writeLocalBackup(sheetKey, rows) {
    if (!storageAvailable()) {
      return false;
    }
    try {
      window.localStorage.setItem(SHEETS[sheetKey].storageKey, JSON.stringify(rows));
      return true;
    } catch (error) {
      return false;
    }
  }

  function describeLocalSource(hasRows) {
    if (!storageAvailable()) {
      return 'Browser storage unavailable';
    }
    return hasRows ? 'Stored in this browser' : 'Ready';
  }

  function updateLastSaved(meta) {
    if (!meta) {
      lastSavedMeta.textContent = '';
      return;
    }
    const parts = [];
    if (meta.source) {
      parts.push('Source: ' + meta.source);
    }
    if (meta.updatedAtText) {
      parts.push('Last saved: ' + meta.updatedAtText);
    }
    lastSavedMeta.textContent = parts.join(' | ');
  }

  function formatTimestamp(value) {
    if (!value) {
      return '';
    }
    let date = null;
    if (typeof value.toDate === 'function') {
      date = value.toDate();
    } else {
      date = new Date(value);
    }
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function normalizeDateInputValue(value) {
    const raw = value == null ? '' : String(value).trim();
    if (!raw) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }

    const dotted = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (dotted) {
      const day = dotted[1].padStart(2, '0');
      const month = dotted[2].padStart(2, '0');
      const year = dotted[3];
      return year + '-' + month + '-' + day;
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function humanizeFirebaseError(error) {
    const code = error && error.code ? String(error.code) : '';
    if (IS_FILE_PROTOCOL) {
      return 'Opened directly from a file. Firebase sync is disabled in file mode. Use Live Server or GitHub Pages.';
    }
    if (code === 'permission-denied') {
      return 'Firestore rules are blocking access. Publish the rules from FIRESTORE_RULES.txt.';
    }
    if (code === 'unavailable') {
      return 'Firebase is temporarily unavailable. Local browser backup is still active.';
    }
    if (code === 'failed-precondition') {
      return 'Firestore is not fully set up yet. Make sure Firestore Database has been created in Firebase Console.';
    }
    return 'Firebase connection failed. Local browser backup is still active.';
  }

  async function initFirebase() {
    if (firebaseReadyPromise) {
      return firebaseReadyPromise;
    }

    firebaseReadyPromise = (async function () {
      if (IS_FILE_PROTOCOL) {
        setDbStatus('Local File Mode', 'warning');
        homeIntro.textContent = 'Opened directly from a local file. Local browser backup is active. To use Firebase, run this folder with Live Server or GitHub Pages.';
        return false;
      }

      if (!window.firebase || typeof window.firebase.initializeApp !== 'function' || typeof window.firebase.firestore !== 'function') {
        setDbStatus('Offline Cache', 'warning');
        showToast('Firebase libraries did not load. Local browser backup only.');
        return false;
      }

      try {
        if (!window.firebase.apps || !window.firebase.apps.length) {
          window.firebase.initializeApp(FIREBASE_CONFIG);
        }

        db = window.firebase.firestore();
        setDbStatus('Connecting...', 'warning');

        await db.collection(COLLECTION_NAME).doc('proposed').get();

        setDbStatus('Firestore Ready', 'success');
        homeIntro.textContent = 'Select a sheet to begin entering data. Data is saved to Firebase Firestore and cached locally in your browser.';
        return true;
      } catch (error) {
        db = null;
        setDbStatus('Offline Cache', 'warning');
        showToast(humanizeFirebaseError(error), 5200);
        return false;
      }
    })();

    return firebaseReadyPromise;
  }

  async function loadSheetRows(sheetKey) {
    const cfg = SHEETS[sheetKey];
    const localRows = readLocalBackup(sheetKey);
    const remoteEnabled = await initFirebase();

    if (!remoteEnabled || !db) {
      currentSheetMeta = {
        source: 'Local backup',
        updatedAtText: describeLocalSource(localRows.length > 0)
      };
      return localRows;
    }

    try {
      const ref = db.collection(COLLECTION_NAME).doc(sheetKey);
      const snapshot = await ref.get();

      if (snapshot.exists) {
        const data = snapshot.data() || {};
        const rows = Array.isArray(data.rows) ? data.rows : [];
        writeLocalBackup(sheetKey, rows);
        currentSheetMeta = {
          source: 'Firebase',
          updatedAtText: formatTimestamp(data.updatedAt)
        };
        return rows;
      }

      if (localRows.length) {
        await ref.set({
          sheetKey: sheetKey,
          title: cfg.title,
          version: DOCUMENT_VERSION,
          rows: localRows,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: 'browser-client'
        }, { merge: true });

        currentSheetMeta = {
          source: 'Firebase (migrated from local)',
          updatedAtText: 'Just now'
        };
        return localRows;
      }

      currentSheetMeta = {
        source: 'Firebase',
        updatedAtText: ''
      };
      return [];
    } catch (error) {
      currentSheetMeta = {
        source: 'Local backup',
        updatedAtText: describeLocalSource(localRows.length > 0)
      };
      showToast(humanizeFirebaseError(error), 5200);
      return localRows;
    }
  }

  async function saveSheetRows(sheetKey, rows) {
    const cfg = SHEETS[sheetKey];
    const localSaved = writeLocalBackup(sheetKey, rows);
    const remoteEnabled = await initFirebase();

    if (!remoteEnabled || !db) {
      currentSheetMeta = {
        source: localSaved ? 'Local backup' : 'Memory only',
        updatedAtText: localSaved ? describeLocalSource(true) : 'Browser storage unavailable'
      };
      return { remoteSaved: false, localSaved: localSaved };
    }

    await db.collection(COLLECTION_NAME).doc(sheetKey).set({
      sheetKey: sheetKey,
      title: cfg.title,
      version: DOCUMENT_VERSION,
      rows: rows,
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'browser-client'
    }, { merge: true });

    currentSheetMeta = {
      source: 'Firebase',
      updatedAtText: 'Just now'
    };

    return { remoteSaved: true, localSaved: localSaved };
  }

  function nextAutoNo(rows) {
    let maxNo = 0;
    rows.forEach(function (row) {
      const value = Number(row && row.No);
      if (Number.isFinite(value)) {
        maxNo = Math.max(maxNo, value);
      }
    });
    return maxNo + 1;
  }

  function makeInput(col, value, rowIndex, onChange, disabled) {
    const fieldValue = value == null ? '' : value;
    let el;

    if (col.type === 'textarea') {
      el = document.createElement('textarea');
      el.className = 'cell-textarea';
      el.value = fieldValue;
    } else {
      el = document.createElement('input');
      el.className = 'cell-input';
      el.type = col.type === 'date' ? 'date' : (col.type || 'text');
      el.value = col.type === 'date' ? normalizeDateInputValue(fieldValue) : fieldValue;
      if (col.type === 'number') {
        el.inputMode = 'decimal';
      }
    }

    if (col.placeholder) {
      el.placeholder = col.placeholder;
    }
    if (col.className) {
      el.classList.add(col.className);
    }
    el.dataset.rowIndex = String(rowIndex);
    el.dataset.key = col.key;
    if (disabled) {
      el.disabled = true;
    }

    el.addEventListener('input', function (event) {
      const target = event.target;
      const index = Number(target.dataset.rowIndex);
      const key = target.dataset.key;
      if (typeof onChange === 'function') {
        onChange(index, key, target.value);
        return;
      }
      currentRows[index] = currentRows[index] || {};
      currentRows[index][key] = target.value;
      markDirty(true);
    });

    return el;
  }

  function cloneRow(row) {
    return Object.assign({}, row || {});
  }

  function beginEditRow(sheetKey, index) {
    editingRows[index] = true;
    rowDrafts[index] = cloneRow(currentRows[index]);
    renderTable(sheetKey);
  }

  function cancelEditRow(sheetKey, index) {
    delete editingRows[index];
    delete rowDrafts[index];
    renderTable(sheetKey);
  }

  function applyEditRow(sheetKey, index) {
    currentRows[index] = cloneRow(rowDrafts[index]);
    delete editingRows[index];
    delete rowDrafts[index];
    renderTable(sheetKey);
    markDirty(true);
  }

  function updateRowCount() {
    rowCountBadge.textContent = currentRows.length + ' row' + (currentRows.length === 1 ? '' : 's');
  }

  function renderTable(sheetKey) {
    const cfg = SHEETS[sheetKey];
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (sheetKey === 'proposed') {
      const trTop = document.createElement('tr');
      const trSub = document.createElement('tr');

      ['No', 'ProjectName', 'District', 'Connections'].forEach(function (key) {
        const col = cfg.columns.find(function (entry) { return entry.key === key; });
        const th = document.createElement('th');
        th.textContent = col ? col.label : '';
        th.rowSpan = 2;
        trTop.appendChild(th);
      });

      const group = document.createElement('th');
      group.textContent = 'Previous Approval';
      group.colSpan = 4;
      group.className = 'group-header';
      trTop.appendChild(group);

      const presentStatusCol = cfg.columns.find(function (entry) { return entry.key === 'PresentStatus'; });
      const presentStatusTh = document.createElement('th');
      presentStatusTh.textContent = presentStatusCol ? presentStatusCol.label : 'Present Status';
      presentStatusTh.rowSpan = 2;
      trTop.appendChild(presentStatusTh);

      ['TEC', 'PACApproval', 'BoardApproval', 'NPDApproval'].forEach(function (key) {
        const col = cfg.columns.find(function (entry) { return entry.key === key; });
        const th = document.createElement('th');
        th.textContent = col ? col.label : '';
        trSub.appendChild(th);
      });

      const thAction = document.createElement('th');
      thAction.textContent = 'Actions';
      thAction.rowSpan = 2;
      trTop.appendChild(thAction);

      thead.appendChild(trTop);
      thead.appendChild(trSub);
    } else {
      const tr = document.createElement('tr');

      cfg.columns.forEach(function (col) {
        const th = document.createElement('th');
        th.textContent = col.label;
        tr.appendChild(th);
      });

      const thAction = document.createElement('th');
      thAction.textContent = 'Actions';
      tr.appendChild(thAction);

      thead.appendChild(tr);
    }

    currentRows.forEach(function (row, index) {
      const tr = document.createElement('tr');
      const isEditing = Boolean(editingRows[index]);
      const sourceRow = isEditing ? (rowDrafts[index] || cloneRow(row)) : row;

      const tdDelete = document.createElement('td');

      if (isEditing) {
        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'btn btn-primary btn-small';
        applyBtn.textContent = 'Apply';
        applyBtn.addEventListener('click', function () {
          applyEditRow(sheetKey, index);
        });
        tdDelete.appendChild(applyBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-secondary-outline btn-small';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.marginLeft = '6px';
        cancelBtn.addEventListener('click', function () {
          cancelEditRow(sheetKey, index);
        });
        tdDelete.appendChild(cancelBtn);
      } else {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn btn-light-outline btn-small';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function () {
          beginEditRow(sheetKey, index);
        });
        tdDelete.appendChild(editBtn);
      }

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-danger-outline btn-small';
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.marginLeft = '6px';
      deleteBtn.addEventListener('click', function () {
        if (!window.confirm('Delete this row?')) {
          return;
        }
        currentRows.splice(index, 1);
        const nextEditingRows = {};
        const nextRowDrafts = {};
        Object.keys(editingRows).forEach(function (key) {
          const numericKey = Number(key);
          if (numericKey < index) {
            nextEditingRows[numericKey] = true;
            nextRowDrafts[numericKey] = rowDrafts[numericKey];
          } else if (numericKey > index) {
            nextEditingRows[numericKey - 1] = true;
            nextRowDrafts[numericKey - 1] = rowDrafts[numericKey];
          }
        });
        editingRows = nextEditingRows;
        rowDrafts = nextRowDrafts;
        renderTable(sheetKey);
        markDirty(true);
      });
      tdDelete.appendChild(deleteBtn);

      cfg.columns.forEach(function (col) {
        const td = document.createElement('td');
        td.appendChild(makeInput(col, sourceRow[col.key], index, isEditing ? function (rowIndex, key, value) {
          rowDrafts[rowIndex] = rowDrafts[rowIndex] || cloneRow(currentRows[rowIndex]);
          rowDrafts[rowIndex][key] = value;
        } : null, !isEditing));
        tr.appendChild(td);
      });

      tr.appendChild(tdDelete);
      tbody.appendChild(tr);
    });

    updateRowCount();
    updateLastSaved(currentSheetMeta);
    markDirty(false);
  }

  function confirmDiscardUnsaved() {
    if (!isDirty) {
      return true;
    }
    return window.confirm('You have unsaved changes. Continue without saving?');
  }

  async function openSheet(sheetKey) {
    if (currentSheetKey && currentSheetKey !== sheetKey && !confirmDiscardUnsaved()) {
      return;
    }

    const cfg = SHEETS[sheetKey];
    currentSheetKey = sheetKey;
    currentRows = [];
    currentSheetMeta = null;
    editingRows = {};
    rowDrafts = {};

    sheetTitle.textContent = cfg.title;
    sheetSubtitle.textContent = cfg.subtitle || '';

    homeView.classList.add('hidden');
    sheetView.classList.remove('hidden');
    setControlsEnabled(true);

    document.querySelectorAll('[data-sheet].nav-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.sheet === sheetKey);
    });

    rowCountBadge.textContent = 'Loading...';
    lastSavedMeta.textContent = 'Loading data...';
    thead.innerHTML = '';
    tbody.innerHTML = '';
    setBusy(true, 'Loading...');

    try {
      currentRows = await loadSheetRows(sheetKey);
      renderTable(sheetKey);
    } finally {
      setBusy(false);
    }
  }

  function goHome() {
    if (!confirmDiscardUnsaved()) {
      return;
    }
    currentSheetKey = null;
    currentRows = [];
    currentSheetMeta = null;
    editingRows = {};
    rowDrafts = {};
    homeView.classList.remove('hidden');
    sheetView.classList.add('hidden');
    updateLastSaved(null);
    markDirty(false);
    setControlsEnabled(false);
    document.querySelectorAll('[data-sheet].nav-btn').forEach(function (btn) {
      btn.classList.remove('active');
    });
  }

  function addRow() {
    if (!currentSheetKey) {
      return;
    }
    const cfg = SHEETS[currentSheetKey];
    const row = {};
    if (cfg.autoNumber) {
      row.No = String(nextAutoNo(currentRows));
    }
    currentRows.push(row);
    editingRows[currentRows.length - 1] = true;
    rowDrafts[currentRows.length - 1] = cloneRow(row);
    renderTable(currentSheetKey);
    markDirty(true);

    const lastRow = tbody.querySelector('tr:last-child');
    if (!lastRow) {
      return;
    }
    const firstEditable = lastRow.querySelector('td:nth-child(3) input, td:nth-child(3) textarea');
    if (firstEditable) {
      firstEditable.focus();
    }
  }

  async function clearSheet() {
    if (!currentSheetKey) {
      return;
    }
    if (!window.confirm('Clear all rows in "' + SHEETS[currentSheetKey].title + '"?')) {
      return;
    }
    currentRows = [];
    editingRows = {};
    rowDrafts = {};
    setBusy(true, 'Clearing...');
    try {
      await saveSheetRows(currentSheetKey, currentRows);
      renderTable(currentSheetKey);
      markDirty(false);
      showToast('Sheet cleared.');
    } catch (error) {
      showToast('Could not clear the sheet. Local backup was kept.', 4200);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!currentSheetKey) {
      return;
    }
    setBusy(true, 'Saving...');
    try {
      const result = await saveSheetRows(currentSheetKey, currentRows);
      markDirty(false);
      updateLastSaved(currentSheetMeta);
      if (result.remoteSaved) {
        showToast('Saved to Firebase.');
      } else if (result.localSaved) {
        showToast('Saved locally in this browser.');
      } else {
        showToast('Save is only in memory right now. Browser storage is unavailable.', 4200);
      }
    } catch (error) {
      showToast(humanizeFirebaseError(error), 5200);
    } finally {
      setBusy(false);
    }
  }

  document.querySelectorAll('[data-sheet]').forEach(function (el) {
    el.addEventListener('click', function () {
      const sheetKey = el.dataset.sheet;
      if (SHEETS[sheetKey]) {
        openSheet(sheetKey);
      }
    });
  });

  document.getElementById('homeLink').addEventListener('click', goHome);
  btnAddRow.addEventListener('click', addRow);
  btnSave.addEventListener('click', save);
  btnClear.addEventListener('click', clearSheet);
  toastClose.addEventListener('click', hideToast);

  window.addEventListener('beforeunload', function (event) {
    if (!isDirty) {
      return;
    }
    event.preventDefault();
    event.returnValue = '';
  });

  if (!storageAvailable()) {
    showToast('Browser storage is blocked. Save data after enabling local storage.', 4200);
  }

  setDbStatus(IS_FILE_PROTOCOL ? 'Local File Mode' : 'Starting...', 'warning');
  initFirebase();
  goHome();
})();
