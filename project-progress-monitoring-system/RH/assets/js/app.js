import {
  loadState,
  writeLocalState,
  syncRemoteState
} from "../../../shared/firebase-store.js";

// Rehab Budget – Data Entry (Firestore connected)

const STORAGE_KEY = "rehab_budget_entry_v4";
const REMOTE_PATH = ["ppms_modules", "rh"];

const DEFAULTS = {
  theme: "light",
  compact: false,
  regions: ["CENTRAL EAST", "CENTRAL NORTH", "MATALE", "CENTRAL SOUTH"],
  categories: ["ONGOING CONTRACTS", "COMMITTED CONTRACTS", "NEW CONTRACTS"],
  rows: []
};

function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

function normalizeRow(row){
  return {
    id: row?.id || uid(),
    no: row?.no === "" || row?.no == null ? "" : Number(row.no) || "",
    description: String(row?.description ?? ""),
    contractNo: String(row?.contractNo ?? ""),
    region: String(row?.region ?? ""),
    category: String(row?.category ?? ""),
    responsibility: String(row?.responsibility ?? ""),
    contractor: String(row?.contractor ?? ""),
    awardDate: String(row?.awardDate ?? ""),
    duration: row?.duration === "" || row?.duration == null ? "" : Number(row.duration) || "",
    endDate: String(row?.endDate ?? ""),
    tec: Number(row?.tec) || 0,
    allocation: Number(row?.allocation) || 0,
    expenditure: Number(row?.expenditure) || 0,
    billsFinance: Number(row?.billsFinance) || 0,
    billsHand: Number(row?.billsHand) || 0,
    status: String(row?.status ?? "")
  };
}

function normalizeState(source){
  const data = source && typeof source === "object" ? source : DEFAULTS;
  return {
    theme: data.theme === "dark" ? "dark" : "light",
    compact: !!data.compact,
    regions: Array.isArray(data.regions) && data.regions.length ? data.regions.map(v => String(v)) : clone(DEFAULTS.regions),
    categories: Array.isArray(data.categories) && data.categories.length ? data.categories.map(v => String(v)) : clone(DEFAULTS.categories),
    rows: Array.isArray(data.rows) ? data.rows.map(normalizeRow) : []
  };
}

function isValidState(value){
  return !!value && Array.isArray(value.regions) && Array.isArray(value.categories) && Array.isArray(value.rows);
}

let state = normalizeState(DEFAULTS);
let syncWarningShown = false;

function persistLocalState(){
  writeLocalState(STORAGE_KEY, state);
}

async function syncRemoteNow(){
  persistLocalState();
  await syncRemoteState({ remotePath: REMOTE_PATH, data: state });
}

function handleSyncFailure(error, context){
  console.error(`RH Firestore sync failed during ${context}`, error);
  if (!syncWarningShown) {
    showToast("Database", "Saved locally. Paste the Firestore rules, then refresh.");
    syncWarningShown = true;
  }
}

// DOM
const filterRegion = document.getElementById("filterRegion");
const filterCategory = document.getElementById("filterCategory");
const filterSearch = document.getElementById("filterSearch");
const btnClearSearch = document.getElementById("btnClearSearch");

const btnAddRow = document.getElementById("btnAddRow");
const btnQuickAdd = document.getElementById("btnQuickAdd");
const btnAddRegion = document.getElementById("btnAddRegion");
const btnAddCategory = document.getElementById("btnAddCategory");
const btnTheme = document.getElementById("btnTheme");
const themeIcon = document.getElementById("themeIcon");
const btnReset = document.getElementById("btnReset");
const btnPrint = document.getElementById("btnPrint");
const toggleCompact = document.getElementById("toggleCompact");

const tbody = document.getElementById("activitiesTbody");
const countBadge = document.getElementById("countBadge");
const summaryTbody = document.getElementById("summaryTbody");
const healthChecks = document.getElementById("healthChecks");

const mAlloc = document.getElementById("mAlloc");
const mExp = document.getElementById("mExp");
const mFin = document.getElementById("mFin");
const mProg = document.getElementById("mProg");
const mProgBar = document.getElementById("mProgBar");

// Tabs
const tabButtons = document.querySelectorAll(".tab[data-tab]");
const paneActivities = document.getElementById("pane-activities");
const paneSummary = document.getElementById("pane-summary");

// Drawer preview
const drawer = document.getElementById("preview");
const backdrop = document.getElementById("backdrop");
const previewTitle = document.getElementById("previewTitle");
const previewBody = document.getElementById("previewBody");
const previewClose = document.getElementById("previewClose");
const previewEdit = document.getElementById("previewEdit");
const previewDelete = document.getElementById("previewDelete");
let previewId = null;

// Dialogs
const rowDialog = document.getElementById("rowDialog");
const rowDialogTitle = document.getElementById("rowDialogTitle");
const rowDialogClose = document.getElementById("rowDialogClose");
const rowDialogBack = document.getElementById("rowDialogBack");
const rowCancel = document.getElementById("rowCancel");
const rowForm = document.getElementById("rowForm");

const quickDialog = document.getElementById("quickDialog");
const quickDialogClose = document.getElementById("quickDialogClose");
const quickDialogBack = document.getElementById("quickDialogBack");
const quickCancel = document.getElementById("quickCancel");
const quickForm = document.getElementById("quickForm");

const simpleDialog = document.getElementById("simpleDialog");
const simpleTitle = document.getElementById("simpleTitle");
const simpleLabel = document.getElementById("simpleLabel");
const simpleInput = document.getElementById("simpleInput");
const simpleHelp = document.getElementById("simpleHelp");
const simpleDialogClose = document.getElementById("simpleDialogClose");
const simpleDialogBack = document.getElementById("simpleDialogBack");
const simpleCancel = document.getElementById("simpleCancel");
const simpleForm = document.getElementById("simpleForm");
let simpleMode = null; // 'region' | 'category'

// Form fields
const rowId = document.getElementById("rowId");
const fNo = document.getElementById("fNo");
const fDescription = document.getElementById("fDescription");
const fContractNo = document.getElementById("fContractNo");
const fRegion = document.getElementById("fRegion");
const fCategory = document.getElementById("fCategory");
const fResponsibility = document.getElementById("fResponsibility");
const fContractor = document.getElementById("fContractor");
const fAwardDate = document.getElementById("fAwardDate");
const fDuration = document.getElementById("fDuration");
const fEndDate = document.getElementById("fEndDate");
const fTec = document.getElementById("fTec");
const fAlloc = document.getElementById("fAlloc");
const fExp = document.getElementById("fExp");
const fBillsFinance = document.getElementById("fBillsFinance");
const fBillsHand = document.getElementById("fBillsHand");
const fStatus = document.getElementById("fStatus");

// Quick fields
const qDescription = document.getElementById("qDescription");
const qRegion = document.getElementById("qRegion");
const qCategory = document.getElementById("qCategory");
const qContractNo = document.getElementById("qContractNo");
const qContractor = document.getElementById("qContractor");
const qAlloc = document.getElementById("qAlloc");
const qFin = document.getElementById("qFin");
const qStatus = document.getElementById("qStatus");

// Toast
const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastBody = document.getElementById("toastBody");
let toastTimer = null;

function showToast(title, body){
  toastTitle.textContent = title || "Done";
  toastBody.textContent = body || "";
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2400);
}

// Utilities
function uid(){
  return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "_" + Math.random().toString(16).slice(2));
}

function normalize(s){ return String(s||"").trim().replace(/\s+/g," "); }

function parseMoney(v){
  const s = String(v || "").replace(/,/g,"").trim();
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(n){
  const v = Number(n);
  const safe = Number.isFinite(v) ? v : 0;
  return safe.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
}

function fmtPct(x){
  return (x*100).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) + "%";
}

function getUsedActivityNos(excludeId = ""){
  return new Set(
    state.rows
      .filter(row => row.id !== excludeId)
      .map(row => Number(row.no))
      .filter(no => Number.isInteger(no) && no > 0)
  );
}

function generateNextActivityNo(excludeId = ""){
  const used = getUsedActivityNos(excludeId);
  let next = 1;
  while (used.has(next)) next += 1;
  return next;
}

function setState(next, options = {}){
  state = normalizeState(next);
  persistLocalState();
  if (options.syncRemote === false) return;
  syncRemoteNow().then(() => {
    syncWarningShown = false;
  }).catch(error => {
    handleSyncFailure(error, options.context || "save");
  });
}

function hydrateSelect(selectEl, items, includeAll=false, allLabel="All"){
  const cur = selectEl.value;
  selectEl.innerHTML = "";
  if (includeAll){
    const o = document.createElement("option");
    o.value = "ALL";
    o.textContent = allLabel;
    selectEl.appendChild(o);
  }
  for (const it of items){
    const o = document.createElement("option");
    o.value = it;
    o.textContent = it;
    selectEl.appendChild(o);
  }
  if ([...selectEl.options].some(o => o.value === cur)) selectEl.value = cur;
}

function refreshSelects(){
  hydrateSelect(filterRegion, state.regions, true, "All Regions");
  hydrateSelect(filterCategory, state.categories, true, "All Categories");
  hydrateSelect(fRegion, state.regions, false);
  hydrateSelect(fCategory, state.categories, false);
  hydrateSelect(qRegion, state.regions, false);
  hydrateSelect(qCategory, state.categories, false);
}

function getFilteredRows(){
  const r = filterRegion.value;
  const c = filterCategory.value;
  const q = normalize(filterSearch.value).toLowerCase();

  return state.rows.filter(row => {
    if (r !== "ALL" && row.region !== r) return false;
    if (c !== "ALL" && row.category !== c) return false;
    if (!q) return true;

    const blob = [
      row.no, row.description, row.contractNo, row.responsibility,
      row.contractor, row.status, row.region, row.category
    ].join(" ").toLowerCase();

    return blob.includes(q);
  });
}

function computeSummary(){
  const perRegion = {};
  for (const region of state.regions){
    perRegion[region] = { allocation:0, expenditure:0, billsFinance:0, billsHand:0 };
  }

  for (const row of state.rows){
    if (!perRegion[row.region]) perRegion[row.region] = { allocation:0, expenditure:0, billsFinance:0, billsHand:0 };
    perRegion[row.region].allocation += row.allocation;
    perRegion[row.region].expenditure += row.expenditure;
    perRegion[row.region].billsFinance += row.billsFinance;
    perRegion[row.region].billsHand += row.billsHand;
  }

  const totals = Object.values(perRegion).reduce((a,v) => {
    a.allocation += v.allocation;
    a.expenditure += v.expenditure;
    a.billsFinance += v.billsFinance;
    a.billsHand += v.billsHand;
    return a;
  }, { allocation:0, expenditure:0, billsFinance:0, billsHand:0 });

  return { perRegion, totals };
}

function renderMetrics(){
  if (!mAlloc || !mExp || !mFin || !mProg || !mProgBar) return;

  const { totals } = computeSummary();
  const totalExpFinance = totals.expenditure + totals.billsFinance;
  const prog = totals.allocation > 0 ? (totalExpFinance / totals.allocation) : 0;

  mAlloc.textContent = fmtMoney(totals.allocation);
  mExp.textContent = fmtMoney(totals.expenditure);
  mFin.textContent = fmtMoney(totals.billsFinance);
  mProg.textContent = fmtPct(prog);

  const width = Math.max(0, Math.min(100, prog * 100));
  mProgBar.style.width = width.toFixed(2) + "%";
}

function renderActivities(){
  const rows = getFilteredRows();
  rows.sort((a, b) => {
    const aNo = Number(a.no);
    const bNo = Number(b.no);
    const aHasNo = Number.isFinite(aNo) && aNo > 0;
    const bHasNo = Number.isFinite(bNo) && bNo > 0;

    if (aHasNo && bHasNo && aNo !== bNo) return aNo - bNo;
    if (aHasNo !== bHasNo) return aHasNo ? -1 : 1;

    const desc = String(a.description || "").localeCompare(String(b.description || ""));
    if (desc) return desc;

    const region = String(a.region || "").localeCompare(String(b.region || ""));
    if (region) return region;

    return String(a.category || "").localeCompare(String(b.category || ""));
  });

  tbody.innerHTML = "";
  countBadge.textContent = String(rows.length);

  for (const row of rows){
    const tr = document.createElement("tr");
    tr.dataset.id = row.id;
    tr.innerHTML = `
      <td class="mono">${row.no ?? ""}</td>
      <td class="wrap">${escapeHtml(row.description ?? "")}</td>
      <td class="mono">${escapeHtml(row.contractNo ?? "")}</td>
      <td>${escapeHtml(row.responsibility ?? "")}</td>
      <td class="right mono">${fmtMoney(row.tec)}</td>
      <td class="mono">${escapeHtml(row.awardDate ?? "")}</td>
      <td class="right mono">${escapeHtml(row.duration ?? "")}</td>
      <td class="mono">${escapeHtml(row.endDate ?? "")}</td>
      <td>${escapeHtml(row.contractor ?? "")}</td>
      <td class="right mono">${fmtMoney(row.allocation)}</td>
      <td class="right mono">${fmtMoney(row.expenditure)}</td>
      <td class="right mono">${fmtMoney(row.billsFinance)}</td>
      <td class="right mono">${fmtMoney(row.billsHand)}</td>
      <td class="wrap">${escapeHtml(row.status ?? "")}</td>
      <td>${escapeHtml(row.region)}</td>
      <td>${escapeHtml(row.category)}</td>
      <td class="right nowrap">
        <div class="actions">
          <button class="btn btn-sm btn-edit" data-action="edit" data-id="${row.id}">Edit</button>
          <button class="btn btn-sm btn-del" data-action="delete" data-id="${row.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function renderSummary(){
  const { perRegion, totals } = computeSummary();
  const regions = Object.keys(perRegion).sort((a,b)=>a.localeCompare(b));
  summaryTbody.innerHTML = "";

  for (const region of regions){
    const v = perRegion[region];
    const totalEF = v.expenditure + v.billsFinance;
    const prog = v.allocation > 0 ? totalEF / v.allocation : 0;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(region)}</td>
      <td class="right mono">${fmtMoney(v.allocation)}</td>
      <td class="right mono">${fmtMoney(v.expenditure)}</td>
      <td class="right mono">${fmtMoney(v.billsFinance)}</td>
      <td class="right mono">${fmtMoney(v.billsHand)}</td>
      <td class="right mono">${fmtMoney(totalEF)}</td>
      <td class="right mono">${fmtPct(prog)}</td>
    `;
    summaryTbody.appendChild(tr);
  }

  const totalEF = totals.expenditure + totals.billsFinance;
  const prog = totals.allocation > 0 ? totalEF / totals.allocation : 0;

  const trT = document.createElement("tr");
  trT.innerHTML = `
    <td><strong>TOTAL</strong></td>
    <td class="right mono"><strong>${fmtMoney(totals.allocation)}</strong></td>
    <td class="right mono"><strong>${fmtMoney(totals.expenditure)}</strong></td>
    <td class="right mono"><strong>${fmtMoney(totals.billsFinance)}</strong></td>
    <td class="right mono"><strong>${fmtMoney(totals.billsHand)}</strong></td>
    <td class="right mono"><strong>${fmtMoney(totalEF)}</strong></td>
    <td class="right mono"><strong>${fmtPct(prog)}</strong></td>
  `;
  summaryTbody.appendChild(trT);

  renderHealthChecks({ perRegion, totals });
}

function renderHealthChecks({ perRegion, totals }){
  const checks = [];

  for (const [region, v] of Object.entries(perRegion)){
    const total = v.expenditure + v.billsFinance;
    if (v.allocation > 0 && total === 0){
      checks.push(`No progress recorded yet for ${region} (0 expenditure + 0 finance bills).`);
    }
  }
  if (totals.billsHand > 0) checks.push(`Bills still in hand: ${fmtMoney(totals.billsHand)}.`);

  const missingContract = state.rows.filter(r => !normalize(r.contractNo)).length;
  if (missingContract) checks.push(`Missing contract number: ${missingContract} activities.`);

  const missingDates = state.rows.filter(r => !normalize(r.awardDate) || !normalize(r.endDate)).length;
  if (missingDates) checks.push(`Missing award/end dates: ${missingDates} activities.`);

  healthChecks.innerHTML = "";
  (checks.length ? checks : ["No issues detected based on the current entries."]).forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    healthChecks.appendChild(li);
  });
}

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

// Drawer preview
function openDrawer(id){
  const row = state.rows.find(r => r.id === id);
  if (!row) return;
  previewId = id;
  previewTitle.textContent = `Activity Preview${row.no ? " (No. " + row.no + ")" : ""}`;

  const items = [
    ["Description", row.description],
    ["Contract No", row.contractNo],
    ["Region", row.region],
    ["Category", row.category],
    ["Responsibility", row.responsibility],
    ["Contractor", row.contractor],
    ["Award Date", row.awardDate],
    ["Duration (Days)", row.duration],
    ["End/Completion", row.endDate],
    ["TEC/Awarded Sum", fmtMoney(row.tec)],
    ["Approved Allocation (2026)", fmtMoney(row.allocation)],
    ["Expenditure (2026)", fmtMoney(row.expenditure)],
    ["Bills in Finance", fmtMoney(row.billsFinance)],
    ["Bills in Hand", fmtMoney(row.billsHand)],
    ["Status", row.status]
  ].filter(([_,v]) => normalize(v) !== "");

  previewBody.innerHTML = items.map(([k,v]) => `
    <div style="margin-bottom:12px;">
      <div class="small">${escapeHtml(k)}</div>
      <div style="font-weight:800;">${escapeHtml(String(v))}</div>
    </div>
  `).join("");

  drawer.classList.add("open");
  backdrop.hidden = false;

  previewEdit.onclick = () => { closeDrawer(); openEditModal(previewId); };
  previewDelete.onclick = () => { closeDrawer(); deleteRow(previewId); };
}

function closeDrawer(){
  drawer.classList.remove("open");
  backdrop.hidden = true;
}

// Modals
function openAddModal(){
  rowDialogTitle.textContent = "Add Activity";
  rowId.value = "";
  fNo.value = String(generateNextActivityNo());
  fDescription.value = "";
  fContractNo.value = "";
  fRegion.value = state.regions[0] || "";
  fCategory.value = state.categories[0] || "";
  fResponsibility.value = "";
  fContractor.value = "";
  fAwardDate.value = "";
  fDuration.value = "";
  fEndDate.value = "";
  fTec.value = "";
  fAlloc.value = "";
  fExp.value = "";
  fBillsFinance.value = "";
  fBillsHand.value = "";
  fStatus.value = "";
  rowDialog.showModal();
}

function openEditModal(id){
  const row = state.rows.find(r => r.id === id);
  if (!row) return;
  rowDialogTitle.textContent = "Edit Activity";
  rowId.value = row.id;
  fNo.value = row.no || generateNextActivityNo(row.id);
  fDescription.value = row.description ?? "";
  fContractNo.value = row.contractNo ?? "";
  fRegion.value = row.region;
  fCategory.value = row.category;
  fResponsibility.value = row.responsibility ?? "";
  fContractor.value = row.contractor ?? "";
  fAwardDate.value = row.awardDate ?? "";
  fDuration.value = row.duration ?? "";
  fEndDate.value = row.endDate ?? "";
  fTec.value = fmtMoney(row.tec);
  fAlloc.value = fmtMoney(row.allocation);
  fExp.value = fmtMoney(row.expenditure);
  fBillsFinance.value = fmtMoney(row.billsFinance);
  fBillsHand.value = fmtMoney(row.billsHand);
  fStatus.value = row.status ?? "";
  rowDialog.showModal();
}

function closeDialog(d){ try{ d.close(); }catch{} }

function upsertRow(payload){
  const idx = state.rows.findIndex(r => r.id === payload.id);
  if (idx >= 0) state.rows[idx] = payload;
  else state.rows.push(payload);
}

function deleteRow(id){
  if (!confirm("Delete this activity?")) return;
  const next = clone(state);
  next.rows = next.rows.filter(r => r.id !== id);
  setState(next);
  rerenderAll();
  showToast("Deleted", "Activity removed.");
}

function rerenderAll(){
  refreshSelects();
  applyTheme();
  applyCompact();
  renderMetrics();
  renderActivities();
  renderSummary();
}

function applyTheme(){
  document.documentElement.setAttribute("data-theme", state.theme);
  themeIcon.textContent = state.theme === "dark" ? "☀️" : "🌙";
}

function applyCompact(){
  const table = document.getElementById("activitiesTable");
  if (state.compact) table.classList.add("compact");
  else table.classList.remove("compact");
  toggleCompact.checked = !!state.compact;
}

function switchTab(name){
  tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  paneActivities.classList.toggle("active", name === "activities");
  paneSummary.classList.toggle("active", name === "summary");
}

function normalizeUpper(s){ return normalize(s).toUpperCase(); }

// Money formatting on blur
function wireMoneyInputs(){
  document.querySelectorAll(".money-input").forEach(inp => {
    inp.addEventListener("blur", () => {
      const raw = normalize(inp.value);
      if (!raw) return;
      inp.value = fmtMoney(parseMoney(raw));
    });
  });
}

// Events
btnAddRow.addEventListener("click", openAddModal);
if (btnQuickAdd) {
  btnQuickAdd.addEventListener("click", () => {
    qDescription.value = "";
    qRegion.value = state.regions[0] || "";
    qCategory.value = state.categories[0] || "";
    qContractNo.value = "";
    qContractor.value = "";
    qAlloc.value = "";
    qFin.value = "";
    qStatus.value = "";
    quickDialog.showModal();
  });
}

btnAddRegion.addEventListener("click", () => {
  simpleMode = "region";
  simpleTitle.textContent = "Add Region";
  simpleLabel.textContent = "Region name";
  simpleInput.value = "";
  simpleInput.placeholder = "e.g., CENTRAL EAST";
  simpleHelp.textContent = "Used for filtering and summary totals.";
  simpleDialog.showModal();
  simpleInput.focus();
});

btnAddCategory.addEventListener("click", () => {
  simpleMode = "category";
  simpleTitle.textContent = "Add Category";
  simpleLabel.textContent = "Category name";
  simpleInput.value = "";
  simpleInput.placeholder = "e.g., ONGOING CONTRACTS";
  simpleHelp.textContent = "Groups activities inside a region.";
  simpleDialog.showModal();
  simpleInput.focus();
});

btnTheme.addEventListener("click", () => {
  const next = clone(state);
  next.theme = (next.theme === "dark") ? "light" : "dark";
  setState(next);
  rerenderAll();
  showToast("Theme", next.theme === "dark" ? "Dark mode enabled." : "Light mode enabled.");
});

btnReset.addEventListener("click", async () => {
  if (!confirm("This will clear all saved data on this computer/browser. Continue?")) return;
  state = normalizeState(clone(DEFAULTS));
  persistLocalState();
  try {
    await syncRemoteNow();
    syncWarningShown = false;
  } catch (error) {
    handleSyncFailure(error, "reset");
  }
  rerenderAll();
  showToast("Reset", "All data cleared.");
});

btnPrint.addEventListener("click", () => window.print());

toggleCompact.addEventListener("change", () => {
  const next = clone(state);
  next.compact = toggleCompact.checked;
  setState(next);
  applyCompact();
});

filterRegion.addEventListener("change", renderActivities);
filterCategory.addEventListener("change", renderActivities);
filterSearch.addEventListener("input", () => {
  clearTimeout(window.__qTimer);
  window.__qTimer = setTimeout(renderActivities, 120);
});
btnClearSearch.addEventListener("click", () => {
  filterSearch.value = "";
  renderActivities();
  filterSearch.focus();
});

tabButtons.forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));

backdrop.addEventListener("click", closeDrawer);
previewClose.addEventListener("click", closeDrawer);

// Table actions + row click
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (btn){
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === "edit") return openEditModal(id);
    if (action === "delete") return deleteRow(id);
  }
  const tr = e.target.closest("tr[data-id]");
  if (tr) openDrawer(tr.dataset.id);
});

// Dialog close buttons
rowDialogClose.addEventListener("click", () => closeDialog(rowDialog));
rowDialogBack.addEventListener("click", () => closeDialog(rowDialog));
rowCancel.addEventListener("click", () => closeDialog(rowDialog));
quickDialogClose.addEventListener("click", () => closeDialog(quickDialog));
quickDialogBack.addEventListener("click", () => closeDialog(quickDialog));
quickCancel.addEventListener("click", () => closeDialog(quickDialog));
simpleDialogClose.addEventListener("click", () => closeDialog(simpleDialog));
simpleDialogBack.addEventListener("click", () => closeDialog(simpleDialog));
simpleCancel.addEventListener("click", () => closeDialog(simpleDialog));

// Form submits
rowForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!fDescription.value.trim()){
    showToast("Missing", "Description is required.");
    fDescription.focus();
    return;
  }
  if (!fRegion.value || !fCategory.value){
    showToast("Missing", "Region and Category are required.");
    return;
  }

  const resolvedId = rowId.value || uid();
  const payload = {
    id: resolvedId,
    no: rowId.value ? (fNo.value ? Number(fNo.value) : generateNextActivityNo(resolvedId)) : generateNextActivityNo(),
    description: normalize(fDescription.value),
    contractNo: normalize(fContractNo.value),
    region: fRegion.value,
    category: fCategory.value,
    responsibility: normalize(fResponsibility.value),
    contractor: normalize(fContractor.value),
    awardDate: fAwardDate.value || "",
    duration: fDuration.value ? Number(fDuration.value) : "",
    endDate: fEndDate.value || "",
    tec: parseMoney(fTec.value),
    allocation: parseMoney(fAlloc.value),
    expenditure: parseMoney(fExp.value),
    billsFinance: parseMoney(fBillsFinance.value),
    billsHand: parseMoney(fBillsHand.value),
    status: normalize(fStatus.value)
  };

  const next = clone(state);
  // ensure values are numbers
  payload.tec = Number(payload.tec) || 0;
  payload.allocation = Number(payload.allocation) || 0;
  payload.expenditure = Number(payload.expenditure) || 0;
  payload.billsFinance = Number(payload.billsFinance) || 0;
  payload.billsHand = Number(payload.billsHand) || 0;

  const idx = next.rows.findIndex(r => r.id === payload.id);
  if (idx >= 0) next.rows[idx] = payload;
  else next.rows.push(payload);

  setState(next);
  closeDialog(rowDialog);
  rerenderAll();
  showToast("Saved", "Activity saved.");
});

quickForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!qDescription.value.trim()){
    showToast("Missing", "Description is required.");
    qDescription.focus();
    return;
  }

  const payload = {
    id: uid(),
    no: generateNextActivityNo(),
    description: normalize(qDescription.value),
    contractNo: normalize(qContractNo.value),
    region: qRegion.value,
    category: qCategory.value,
    responsibility: "",
    contractor: normalize(qContractor.value),
    awardDate: "",
    duration: "",
    endDate: "",
    tec: 0,
    allocation: parseMoney(qAlloc.value),
    expenditure: 0,
    billsFinance: parseMoney(qFin.value),
    billsHand: 0,
    status: normalize(qStatus.value)
  };

  const next = clone(state);
  next.rows.push(payload);
  setState(next);
  closeDialog(quickDialog);
  rerenderAll();
  showToast("Added", "Quick activity added.");
});

simpleForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = normalizeUpper(simpleInput.value);
  if (!name){
    showToast("Missing", "Name is required.");
    simpleInput.focus();
    return;
  }

  const next = clone(state);
  if (simpleMode === "region"){
    if (next.regions.includes(name)) return showToast("Duplicate", "Region already exists.");
    next.regions.push(name);
  } else if (simpleMode === "category"){
    if (next.categories.includes(name)) return showToast("Duplicate", "Category already exists.");
    next.categories.push(name);
  }
  setState(next);
  closeDialog(simpleDialog);
  rerenderAll();
  showToast("Added", simpleMode === "region" ? "Region added." : "Category added.");
});

// Init
async function initializeApp(){
  const loaded = await loadState({
    localKey: STORAGE_KEY,
    remotePath: REMOTE_PATH,
    defaultValue: clone(DEFAULTS),
    validate: isValidState
  });
  setState(loaded, { syncRemote: false });
  applyTheme();
  refreshSelects();
  wireMoneyInputs();
  switchTab("activities");
  rerenderAll();
}

await initializeApp();
