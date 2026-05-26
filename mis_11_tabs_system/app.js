const STORAGE_KEY = "water_supply_mis_simple_11_tabs_v3_firestore";
const LAST_REPORT_KEY = "water_supply_mis_last_report_id";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDcJy70rtOzkrNhp2R0Q4aM-JM3kv0vxsg",
  authDomain: "nwsdb-mis.firebaseapp.com",
  projectId: "nwsdb-mis",
  storageBucket: "nwsdb-mis.firebasestorage.app",
  messagingSenderId: "315284304641",
  appId: "1:315284304641:web:bc29624855fc38afcfe100"
};
const FIREBASE_SDK_VERSION = "12.12.1";
const FIRESTORE_COLLECTION = "misReports";

let firebaseState = {
  ready: false,
  app: null,
  db: null,
  doc: null,
  setDoc: null,
  getDoc: null,
  serverTimestamp: null
};
let firebaseInitPromise = null;
let cloudSaveTimer = null;


const productionRows = [
  "Kandegedara Tank",
  "Kaludewala Tank",
  "Udugama Tank",
  "Udupihilla Bulk Meter",
  "Weragama Bulk Meter",
  "Pumping To Harasgama",
  "Pumping To Dodamdeniya",
  "Pumping to Kaludewala",
  "Kandegedara New pump",
  "From Abangaga",
  "Bowser Supply"
];

const leakRows = [
  ["Service line", "PVC"], ["Service line", "PE"],
  ["50/63", "PVC"], ["50/63", "HDPE"],
  ["90/80", "GI"], ["90/80", "PVC"], ["90/80", "HDPE"], ["90/80", "DI"], ["90/80", "AC"],
  ["110/100", "PVC"], ["110/100", "HDPE"], ["110/100", "DI"], ["110/100", "AC"],
  ["160/150", "PVC"], ["160/150", "HDPE"], ["160/150", "DI"], ["160/150", "AC"],
  ["225", "HDPE"], ["225", "PVC"], ["280", "PVC"], ["315", "DI"], ["150", "DI"], ["Others (Please specify)", ""]
];

const pipelineDefaultRoads = ["Sarannakara rd", "Weragama watta", "Kurudugaspitiya rd", "Nandasiri Land Sale", "Wariyapola watta", "", "", "", "", "", "", ""];
const valveDefaultRoads = ["Athuparayaya (Replaced)", "Hilton janapadaya (Replaced)", "", "", "", "", "", "", "", ""];

const expenditureItems = [
  ["11.1", "No of Employees", "count", false],
  ["11.2", "Permanent staff Salary", "money", true],
  ["11.3", "Permanent staff Overtime", "money", true],
  ["11.4", "Casual staff Salary", "money", true],
  ["11.5", "Casual staff Overtime", "money", true],
  ["11.6", "Electricity Cost", "money", true],
  ["11.7", "Chlorine", "money", true],
  ["11.8", "PAC", "money", true],
  ["11.9", "Alum, Lime", "money", true],
  ["11.10", "Bleaching Powder", "money", true],
  ["11.11", "Repair & Maintenance", "money", true],
  ["11.12", "Repair & Maintenance Contract Cost", "money", true],
  ["11.13", "Extension Cost", "money", true],
  ["11.14", "New Connection Material Cost", "money", true],
  ["11.15", "New Connection Contract Cost", "money", true],
  ["11.16", "Defective Meters Change Cost", "money", true],
  ["11.17", "Defective Meter Change Contract Cost", "money", true],
  ["11.18", "Printing & Stationaries Cost", "money", true],
  ["11.19", "Telephone", "money", true],
  ["11.20", "Subsistence", "money", true],
  ["11.21", "Board Vehicle Running Cost", "money", true],
  ["11.22", "Hired Vehicle Running Cost", "money", true]
];

function esc(value) {
  return String(value ?? "").replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[ch]));
}
function textInput(key, value = "", placeholder = "") {
  return `<input class="form-control form-control-sm" data-store="${esc(key)}" value="${esc(value)}" placeholder="${esc(placeholder)}">`;
}
function numberInput(key, value = "", placeholder = "") {
  return `<input type="number" step="any" inputmode="decimal" class="form-control form-control-sm" data-store="${esc(key)}" value="${esc(value)}" placeholder="${esc(placeholder)}">`;
}
function dateInput(key) {
  return `<input type="date" class="form-control form-control-sm" data-store="${esc(key)}">`;
}
function selectInput(key, options, selected = "") {
  return `<select class="form-select form-select-sm" data-store="${esc(key)}">${options.map(o => `<option value="${esc(o)}" ${o === selected ? "selected" : ""}>${esc(o || "-")}</option>`).join("")}</select>`;
}
function n(keyOrElement) {
  const el = typeof keyOrElement === "string" ? document.querySelector(`[data-store="${CSS.escape(keyOrElement)}"]`) : keyOrElement;
  if (!el) return 0;
  const raw = String(el.value || "").replace(/,/g, "").trim();
  if (raw === "" || raw === "-") return 0;
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}
function hasValue(key) {
  const el = document.querySelector(`[data-store="${CSS.escape(key)}"]`);
  return el && String(el.value).trim() !== "";
}
function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}
function format(value, decimals = 2) {
  if (!Number.isFinite(value)) value = 0;
  return value.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
}
function setStatus(text, good = true) {
  const el = document.getElementById("autoSaveStatus");
  if (!el) return;
  el.textContent = text;
  el.style.color = good ? "#047857" : "#b45309";
  el.style.borderColor = good ? "#bbf7d0" : "#fed7aa";
  el.style.background = good ? "#ecfdf5" : "#fff7ed";
}
function setDbStatus(text, good = true) {
  const el = document.getElementById("dbStatus");
  if (!el) return;
  el.textContent = text;
  el.style.color = good ? "#0f766e" : "#b45309";
  el.style.borderColor = good ? "#99f6e4" : "#fed7aa";
  el.style.background = good ? "#f0fdfa" : "#fff7ed";
}
function readInputRaw(key) {
  const el = document.querySelector(`[data-store="${CSS.escape(key)}"]`);
  return String(el?.value || "").trim();
}
function safeDocumentId(value) {
  return String(value || "")
    .trim()
    .replace(/[\/#?\[\]]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}
function getReportId() {
  const input = document.querySelector('[data-store="meta.reportId"]');
  let reportId = safeDocumentId(input?.value || localStorage.getItem(LAST_REPORT_KEY));
  if (!reportId) {
    const scheme = readInputRaw("meta.scheme") || "mis-report";
    const month = readInputRaw("meta.month") || new Date().toISOString().slice(0, 10);
    reportId = safeDocumentId(`${scheme}-${month}`) || "mis-report";
  }
  if (input && input.value !== reportId) input.value = reportId;
  localStorage.setItem(LAST_REPORT_KEY, reportId);
  return reportId;
}
function collectFormData() {
  const data = {};
  document.querySelectorAll("[data-store]").forEach(el => data[el.dataset.store] = el.value);
  return data;
}
function applyFormData(saved) {
  if (!saved || typeof saved !== "object") return;
  document.querySelectorAll("[data-store]").forEach(el => {
    if (Object.prototype.hasOwnProperty.call(saved, el.dataset.store)) el.value = saved[el.dataset.store];
  });
}
function firebaseErrorMessage(error) {
  const message = String(error?.message || error || "Unknown Firebase error");
  if (/permission|insufficient/i.test(message)) return "Database permission denied. Publish the Firestore rules first.";
  if (/network|failed to fetch|offline/i.test(message)) return "Database network error. Check internet connection.";
  return message;
}
async function initFirebase() {
  if (firebaseState.ready) return true;
  setDbStatus("Database connecting...", true);
  try {
    const [appModule, firestoreModule] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`)
    ]);
    const app = appModule.initializeApp(FIREBASE_CONFIG);
    firebaseState = {
      ready: true,
      app,
      db: firestoreModule.getFirestore(app),
      doc: firestoreModule.doc,
      setDoc: firestoreModule.setDoc,
      getDoc: firestoreModule.getDoc,
      serverTimestamp: firestoreModule.serverTimestamp
    };
    setDbStatus("Database connected ✓", true);
    return true;
  } catch (error) {
    firebaseState.ready = false;
    setDbStatus("Database offline - local save only", false);
    console.error("Firebase initialization failed:", error);
    return false;
  }
}
async function ensureFirebaseReady() {
  if (firebaseState.ready) return true;
  if (!firebaseInitPromise) {
    firebaseInitPromise = initFirebase().finally(() => {
      firebaseInitPromise = null;
    });
  }
  await firebaseInitPromise;
  return firebaseState.ready;
}
function saveLocal(showMessage = false) {
  const data = collectFormData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  setStatus(showMessage ? "Local saved ✓" : "Local auto-saved ✓", true);
  return data;
}
function loadLocal() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  applyFormData(saved);
}
async function saveToFirestore(data = collectFormData(), showMessage = false) {
  const reportId = getReportId();
  data["meta.reportId"] = reportId;
  const connected = await ensureFirebaseReady();
  if (!connected) return false;

  try {
    setDbStatus("Saving database...", true);
    const ref = firebaseState.doc(firebaseState.db, FIRESTORE_COLLECTION, reportId);
    await firebaseState.setDoc(ref, {
      reportId,
      scheme: data["meta.scheme"] || "",
      oic: data["meta.oic"] || "",
      month: data["meta.month"] || "",
      appVersion: "mis-11-tabs-firestore-v1",
      data,
      updatedAt: firebaseState.serverTimestamp()
    }, { merge: true });
    setDbStatus(showMessage ? `Database saved ✓ ${reportId}` : "Database auto-saved ✓", true);
    return true;
  } catch (error) {
    setDbStatus(firebaseErrorMessage(error), false);
    console.error("Firestore save failed:", error);
    return false;
  }
}
async function loadFromFirestore(showMessage = true) {
  const reportId = getReportId();
  const connected = await ensureFirebaseReady();
  if (!connected) return false;

  try {
    setDbStatus(`Loading ${reportId}...`, true);
    const ref = firebaseState.doc(firebaseState.db, FIRESTORE_COLLECTION, reportId);
    const snapshot = await firebaseState.getDoc(ref);
    if (!snapshot.exists()) {
      setDbStatus(`No database record found for ${reportId}`, false);
      return false;
    }
    const cloudDoc = snapshot.data();
    applyFormData(cloudDoc.data || {});
    getReportId();
    updateCalculations();
    saveLocal(false);
    setDbStatus(showMessage ? `Database loaded ✓ ${reportId}` : "Database loaded ✓", true);
    return true;
  } catch (error) {
    setDbStatus(firebaseErrorMessage(error), false);
    console.error("Firestore load failed:", error);
    return false;
  }
}
function scheduleCloudSave() {
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(() => {
    saveToFirestore(saveLocal(false), false);
  }, 1200);
}

function renderProduction() {
  document.getElementById("productionRows").innerHTML = productionRows.map((name, i) => `<tr>
    <td class="name-cell">${esc(name)}</td>
    <td>${numberInput(`production.${i}.start`)}</td>
    <td>${dateInput(`production.${i}.startDate`)}</td>
    <td>${numberInput(`production.${i}.end`)}</td>
    <td>${dateInput(`production.${i}.endDate`)}</td>
    <td>${numberInput(`production.${i}.factor`, i < 4 ? "1" : "", "-")}</td>
    <td><input class="form-control form-control-sm calc-box" id="production.${i}.output" readonly></td>
  </tr>`).join("");

  document.getElementById("bulkRegionRows").innerHTML = [0, 1, 2].map(i => `<tr>
    <td>${textInput(`production.region.${i}.name`, "", "Region")}</td>
    <td>${numberInput(`production.region.${i}.quantity`, "", "Quantity")}</td>
  </tr>`).join("");
}
function renderLeaks() {
  document.getElementById("leakRows").innerHTML = leakRows.map(([size, type], i) => `<tr>
    <td class="name-cell">${size === "Others (Please specify)" ? textInput(`leaks.${i}.size`, size, "Specify size") : esc(size)}</td>
    <td>${type ? `<strong>${esc(type)}</strong>` : textInput(`leaks.${i}.type`, "", "Pipe type")}</td>
    <td>${numberInput(`leaks.${i}.reported`)}</td>
    <td>${numberInput(`leaks.${i}.repaired`)}</td>
    <td><input class="form-control form-control-sm calc-box" id="leaks.${i}.outstanding" readonly></td>
  </tr>`).join("");
}
function renderPipeline() {
  document.getElementById("pipelineRows").innerHTML = pipelineDefaultRoads.map((road, i) => `<tr>
    <td>${textInput(`pipeline.${i}.road`, road, "Name of road")}</td>
    <td>${numberInput(`pipeline.${i}.diameter`, road ? "63" : "", "mm")}</td>
    <td>${textInput(`pipeline.${i}.type`, "", "Type")}</td>
    <td>${numberInput(`pipeline.${i}.length`, "", "m")}</td>
    <td>${textInput(`pipeline.${i}.oldPipe`, "", "Old pipe")}</td>
    <td>${textInput(`pipeline.${i}.newPipe`, "", "New pipe")}</td>
  </tr>`).join("");
}
function renderValves() {
  document.getElementById("valveRows").innerHTML = valveDefaultRoads.map((road, i) => `<tr>
    <td>${textInput(`valves.${i}.road`, road, "Name of road")}</td>
    <td>${textInput(`valves.${i}.valveSize`, i === 0 ? "50mm" : i === 1 ? "32mm" : "", "mm")}</td>
    <td>${numberInput(`valves.${i}.pipeDia`, i === 0 ? "63" : i === 1 ? "160" : "", "mm")}</td>
    <td>${selectInput(`valves.${i}.type`, ["", "S/V", "A/V", "WO", "PRV", "PSV", "Other"], i === 0 ? "S/V" : i === 1 ? "A/V" : "")}</td>
    <td>${selectInput(`valves.${i}.service`, ["", "O&M", "Repairs", "Replaced", "New installation", "Preventive maintenance", "Other"], road ? "O&M" : "")}</td>
    <td>${textInput(`valves.${i}.x`, "", "x")}</td>
    <td>${textInput(`valves.${i}.y`, "", "y")}</td>
  </tr>`).join("");
}
function renderBulk() {
  document.getElementById("bulkRows").innerHTML = Array.from({length: 8}, (_, i) => `<tr>
    <td>${textInput(`bulk.${i}.size`, "", "Size")}</td>
    <td>${textInput(`bulk.${i}.location`, "", "Location")}</td>
    <td>${textInput(`bulk.${i}.service`, "", "Service done")}</td>
    <td>${textInput(`bulk.${i}.x`, "", "x")}</td>
    <td>${textInput(`bulk.${i}.y`, "", "y")}</td>
  </tr>`).join("");
}
function renderExpenditure() {
  document.getElementById("expenditureRows").innerHTML = expenditureItems.map(([no, label, type, sum]) => `<tr>
    <td><strong>${esc(no)}</strong></td>
    <td class="name-cell">${esc(label)}</td>
    <td>${numberInput(`expenditure.${no}`, "", type === "money" ? "0.00" : "0")}</td>
  </tr>`).join("");
}

async function saveAll(showMessage = false, options = {}) {
  const data = saveLocal(showMessage);
  if (options.cloud) await saveToFirestore(data, showMessage);
  return data;
}
function loadAll() {
  loadLocal();
}
function resetControl(el) {
  if (!el) return;
  if (el.tagName === "SELECT") {
    el.selectedIndex = 0;
    return;
  }
  if (el.type === "checkbox" || el.type === "radio") {
    el.checked = false;
    return;
  }
  el.value = "";
}
function clearCurrentTab() {
  const activePane = document.querySelector(".tab-pane.active");
  if (!activePane) return;
  if (!confirm("Clear all data in this current tab only?")) return;
  activePane.querySelectorAll("[data-store]").forEach(resetControl);
  updateCalculations();
  saveAll(true, { cloud: true });
}
async function clearAllTabs() {
  const confirmed = confirm(
    "Are you sure you want to clear all data in all 11 tabs?\n\nPress OK/Yes to clear all tables. Press Cancel/No to keep the data."
  );
  if (!confirmed) {
    setStatus("Clear cancelled - data kept", false);
    return;
  }

  document.querySelectorAll("#mainTabContent [data-store]").forEach(resetControl);
  updateCalculations();
  const clearedData = saveLocal(true);
  const cloudSaved = await saveToFirestore(clearedData, true);
  setStatus("All 11 tabs cleared ✓", true);
  if (cloudSaved) setDbStatus("Database updated with cleared tab data ✓", true);
}

function updateProduction() {
  let total = 0;
  productionRows.forEach((_, i) => {
    const start = n(`production.${i}.start`);
    const end = n(`production.${i}.end`);
    const factorRaw = document.querySelector(`[data-store="production.${i}.factor"]`)?.value;
    const factor = String(factorRaw || "").trim() === "" ? 1 : n(`production.${i}.factor`);
    let prod = 0;
    if (hasValue(`production.${i}.start`) || hasValue(`production.${i}.end`)) prod = (end - start) * factor;
    const out = document.getElementById(`production.${i}.output`);
    if (out) out.value = (hasValue(`production.${i}.start`) || hasValue(`production.${i}.end`)) ? format(prod, 2) : "";
    total += prod;
  });
  setValue("productionTotal", format(total, 2));
}
function updateService() {
  const beginning = n("service.beginning");
  const newConnections = n("service.newConnections");
  const received = n("service.applicationReceived");
  const estimated = n("service.estimateIssued");
  setValue("serviceEndTotal", (hasValue("service.beginning") || hasValue("service.newConnections")) ? beginning + newConnections : "");
  setValue("serviceInHand", (hasValue("service.applicationReceived") || hasValue("service.estimateIssued")) ? received - estimated : "");
}
function updateComplaints() {
  const received = n("complaints.received");
  const solved = n("complaints.solved");
  const operational = n("complaints.operational");
  const commercial = n("complaints.commercial");
  setValue("complaintsOutstanding", (hasValue("complaints.received") || hasValue("complaints.solved")) ? received - solved : "");
  const summary = document.getElementById("complaintBreakupSummary");
  if (summary) {
    const total = operational + commercial;
    const matches = total === received || received === 0;
    summary.textContent = `Operational + Commercial = ${total}${received ? ` / Received = ${received}` : ""}`;
    summary.className = `message-pill ${matches ? "" : "warn"}`;
  }
}
function updateLeaks() {
  let reportedTotal = 0, repairedTotal = 0, outstandingTotal = 0;
  leakRows.forEach((_, i) => {
    const reported = n(`leaks.${i}.reported`);
    const repaired = n(`leaks.${i}.repaired`);
    const outstanding = reported - repaired;
    reportedTotal += reported;
    repairedTotal += repaired;
    outstandingTotal += outstanding;
    const out = document.getElementById(`leaks.${i}.outstanding`);
    if (out) out.value = (hasValue(`leaks.${i}.reported`) || hasValue(`leaks.${i}.repaired`)) ? outstanding : "";
  });
  document.getElementById("leakReportedTotal").textContent = reportedTotal;
  document.getElementById("leakRepairedTotal").textContent = repairedTotal;
  document.getElementById("leakOutstandingTotal").textContent = outstandingTotal;
}
function updatePipeline() {
  let total = 0;
  pipelineDefaultRoads.forEach((_, i) => total += n(`pipeline.${i}.length`));
  setValue("pipelineTotalLength", format(total, 2));
}
function updateMeters() {
  const reported = n("meters.reported");
  const replaced = n("meters.replaced");
  setValue("meterPending", (hasValue("meters.reported") || hasValue("meters.replaced")) ? reported - replaced : "");
}
function updateIllegal() {
  const detected = n("illegal.detected");
  const disconnected = n("illegal.disconnected");
  setValue("illegalRemaining", (hasValue("illegal.detected") || hasValue("illegal.disconnected")) ? detected - disconnected : "");
}
function updateArrears() {
  const orders = n("arrears.orders");
  const paid = n("arrears.paid");
  const disconnected = n("arrears.disconnected");
  setValue("arrearsRemaining", (hasValue("arrears.orders") || hasValue("arrears.paid") || hasValue("arrears.disconnected")) ? orders - paid - disconnected : "");
}
function updateExpenditure() {
  let total = 0;
  expenditureItems.forEach(([no, , , sum]) => { if (sum) total += n(`expenditure.${no}`); });
  setValue("expenditureTotal", format(total, 2));
}
function updateCalculations() {
  updateProduction();
  updateService();
  updateComplaints();
  updateLeaks();
  updatePipeline();
  updateMeters();
  updateIllegal();
  updateArrears();
  updateExpenditure();
}

function exportData() {
  saveAll(false);
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "water-supply-mis-data.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function tabButtons() {
  return Array.from(document.querySelectorAll("#mainTabs .nav-link"));
}
function showTab(index) {
  const buttons = tabButtons();
  if (!buttons.length) return;
  const safeIndex = Math.max(0, Math.min(index, buttons.length - 1));
  buttons.forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active", "show"));
  const activeBtn = buttons[safeIndex];
  activeBtn.classList.add("active");
  const pane = document.querySelector(activeBtn.dataset.tabTarget);
  if (pane) pane.classList.add("active", "show");
  document.getElementById("stepText").textContent = `Step ${safeIndex + 1} of ${buttons.length}`;
  document.getElementById("stepProgress").style.width = `${((safeIndex + 1) / buttons.length) * 100}%`;
  document.getElementById("prevTabBtn").disabled = safeIndex === 0;
  document.getElementById("nextTabBtn").disabled = safeIndex === buttons.length - 1;
  activeBtn.scrollIntoView({behavior: "smooth", block: "nearest", inline: "center"});
  window.scrollTo({top: 0, behavior: "smooth"});
}
function currentTabIndex() {
  return tabButtons().findIndex(btn => btn.classList.contains("active"));
}


function startLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (!loadingScreen) return;
  setTimeout(() => {
    loadingScreen.classList.add("is-hidden");
    setTimeout(() => loadingScreen.remove(), 650);
  }, 2000);
}

function getControlText(el) {
  if (!el) return "";
  if (el.tagName === "SELECT") {
    const option = el.options[el.selectedIndex];
    return option ? option.textContent.trim() : "";
  }
  return String(el.value || "").trim();
}
function displayValue(value) {
  const text = String(value ?? "").trim();
  return text ? text : "—";
}
function readStoreValue(key) {
  const el = document.querySelector(`[data-store="${CSS.escape(key)}"]`);
  return displayValue(getControlText(el));
}
function replaceControlsForPrint(container) {
  container.querySelectorAll("input, select, textarea").forEach(el => {
    const value = displayValue(getControlText(el));
    const span = document.createElement("span");
    span.className = `print-value${value === "—" ? " is-empty" : ""}`;
    span.textContent = value;
    el.replaceWith(span);
  });
}
function countTableColumns(table) {
  let max = 0;
  table.querySelectorAll("tr").forEach(row => {
    let count = 0;
    row.querySelectorAll("th, td").forEach(cell => {
      count += Number(cell.getAttribute("colspan") || 1);
    });
    max = Math.max(max, count);
  });
  return max;
}

const PRINT_HEADER_LABELS = {
  productionTable: [
    "Name of the reservoir",
    "Beginning of the month (A)",
    "Reading Date",
    "End of the month (B)",
    "Reading Date",
    "Correction Factor",
    "Production (m³) (B - A)"
  ],
  pipelineTable: [
    "Name of the road",
    "Diameter (mm)",
    "Type",
    "Length (m)",
    "Dia of old pipe",
    "Dia of new pipe"
  ],
  valvesTable: [
    "Name of the road",
    "Size of the valve (mm)",
    "Dia of pipe (mm)",
    "Type of valve",
    "Type of service",
    "X Coordinate",
    "Y Coordinate"
  ]
};
function cleanPrintText(value) {
  return displayValue(String(value || "").replace(/\s+/g, " ").trim());
}
function tableLabels(table, columns) {
  if (PRINT_HEADER_LABELS[table.id]) return PRINT_HEADER_LABELS[table.id];
  const lastHeaderRow = table.querySelector("thead tr:last-child");
  const labels = lastHeaderRow ? Array.from(lastHeaderRow.cells).map(cell => cleanPrintText(cell.textContent)) : [];
  while (labels.length < columns) labels.push(`Column ${labels.length + 1}`);
  return labels.slice(0, columns);
}

const PRINT_SIMPLE_HEADERS = {
  productionTable: [
    "Reservoir",
    "Start (A)",
    "Start Date",
    "End (B)",
    "End Date",
    "Factor",
    "Prod. (m³)"
  ],
  leaksTable: ["Size", "Pipe Type", "Reported", "Repaired", "Balance"],
  pipelineTable: ["Road Name", "Dia. (mm)", "Type", "Length", "Old Dia.", "New Dia."],
  valvesTable: ["Road Name", "Valve Size", "Pipe Dia.", "Valve", "Service", "X", "Y"],
  bulkTable: ["Meter Size", "Location", "Service Done", "X", "Y"]
};
const PRINT_COL_WIDTHS = {
  productionTable: ["30%", "10%", "10%", "10%", "10%", "10%", "20%"],
  leaksTable: ["19%", "17%", "21%", "21%", "22%"],
  pipelineTable: ["34%", "12%", "14%", "13%", "13.5%", "13.5%"],
  valvesTable: ["28%", "13%", "12%", "12%", "17%", "9%", "9%"],
  bulkTable: ["20%", "31%", "29%", "10%", "10%"],
  expenditureTable: ["16%", "52%", "32%"]
};
function applyPrintTableHeaderAndColumns(table) {
  const headers = PRINT_SIMPLE_HEADERS[table.id];
  if (headers && table.tHead) {
    table.tHead.innerHTML = `<tr>${headers.map(label => `<th>${esc(label)}</th>`).join("")}</tr>`;
  }
  const widths = PRINT_COL_WIDTHS[table.id];
  if (widths && !table.querySelector("colgroup")) {
    const colgroup = document.createElement("colgroup");
    widths.forEach(width => {
      const col = document.createElement("col");
      col.style.width = width;
      colgroup.appendChild(col);
    });
    table.insertBefore(colgroup, table.firstChild);
  }
  if (table.id) table.classList.add(`print-table-${table.id}`);
}
function convertWideTableToPortraitCards(table, columns) {
  const labels = tableLabels(table, columns);
  const holder = document.createElement("div");
  holder.className = "portrait-record-table";
  holder.setAttribute("role", "table");

  Array.from(table.querySelectorAll("tbody tr")).forEach((row, index) => {
    const cells = Array.from(row.cells);
    if (!cells.length) return;

    const card = document.createElement("div");
    card.className = "portrait-record-card";
    card.setAttribute("role", "row");

    const title = document.createElement("div");
    title.className = "portrait-record-title";
    const firstValue = cleanPrintText(cells[0]?.textContent);
    title.textContent = `${index + 1}. ${firstValue === "—" ? "Record" : firstValue}`;
    card.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "portrait-field-grid";
    cells.forEach((cell, cellIndex) => {
      const item = document.createElement("div");
      item.className = "portrait-field";

      const label = document.createElement("div");
      label.className = "portrait-field-label";
      label.textContent = labels[cellIndex] || `Column ${cellIndex + 1}`;

      const value = document.createElement("div");
      value.className = "portrait-field-value";
      value.textContent = cleanPrintText(cell.textContent);

      item.appendChild(label);
      item.appendChild(value);
      grid.appendChild(item);
    });
    card.appendChild(grid);
    holder.appendChild(card);
  });

  Array.from(table.querySelectorAll("tfoot tr")).forEach(row => {
    const summary = document.createElement("div");
    summary.className = "portrait-summary-row";
    Array.from(row.cells).forEach(cell => {
      const part = document.createElement("div");
      part.className = "portrait-summary-cell";
      part.textContent = cleanPrintText(cell.textContent);
      summary.appendChild(part);
    });
    holder.appendChild(summary);
  });

  table.replaceWith(holder);
}

function convertExpenditureTableToOnePage(table) {
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  if (!rows.length) return;

  const holder = document.createElement("div");
  holder.className = "expenditure-one-page";

  const makeSide = (sideRows, sideLabel) => {
    const side = document.createElement("div");
    side.className = "expenditure-side";

    const sideTitle = document.createElement("div");
    sideTitle.className = "expenditure-side-title";
    sideTitle.textContent = sideLabel;
    side.appendChild(sideTitle);

    const mini = document.createElement("table");
    mini.className = "print-table expenditure-mini-table";
    mini.innerHTML = '<thead><tr><th>Item No</th><th>Description</th><th>Amount / Count</th></tr></thead><tbody></tbody>';
    const body = mini.querySelector("tbody");
    sideRows.forEach(row => body.appendChild(row.cloneNode(true)));
    side.appendChild(mini);
    return side;
  };

  const midpoint = Math.ceil(rows.length / 2);
  const leftRows = rows.slice(0, midpoint);
  const rightRows = rows.slice(midpoint);

  const grid = document.createElement("div");
  grid.className = "expenditure-two-column-grid";
  grid.appendChild(makeSide(leftRows, "Expenditure Items 11.1 - 11.11"));
  grid.appendChild(makeSide(rightRows, "Expenditure Items 11.12 - 11.22"));
  holder.appendChild(grid);

  const totalText = cleanPrintText(table.querySelector("tfoot tr")?.cells?.[2]?.textContent || "0.00");
  const totalBox = document.createElement("div");
  totalBox.className = "expenditure-total-box";
  totalBox.innerHTML = '<span class="total-label">11.23&nbsp;&nbsp; Total</span><span class="total-value">' + esc(totalText) + '</span>';
  holder.appendChild(totalBox);

  table.replaceWith(holder);
}

function preparePrintSection(card) {
  const section = document.createElement("section");
  section.className = "print-section";
  const clone = card.cloneNode(true);

  replaceControlsForPrint(clone);

  clone.querySelectorAll(".table-responsive, .simple-table-wrap, .expenditure-wrap").forEach(wrapper => {
    wrapper.classList.add("print-table-wrap");
  });
  clone.querySelectorAll("table").forEach(table => {
    if (table.id === "expenditureTable") {
      convertExpenditureTableToOnePage(table);
      return;
    }
    applyPrintTableHeaderAndColumns(table);
    const columns = countTableColumns(table);
    table.classList.add("print-table");
    table.dataset.cols = String(columns);
    if (columns >= 5) {
      table.classList.add("print-table-wide");
    }
    if (columns >= 7) {
      table.classList.add("print-table-extra-wide");
    }
  });

  const tableCount = clone.querySelectorAll("table, .portrait-record-table, .expenditure-one-page").length;
  const rowCount = clone.querySelectorAll("tbody tr, .entry-row").length;
  const maxRowsInSingleTable = Math.max(0, ...Array.from(clone.querySelectorAll("table")).map(table => table.querySelectorAll("tbody tr").length));

  // Keep professional report blocks together whenever they are reasonably sized.
  // Long single tables should either start on a fresh page or use a print-only compact layout.
  if (clone.querySelector(".expenditure-one-page") || tableCount === 0 || rowCount <= 14 || maxRowsInSingleTable <= 12) {
    section.classList.add("compact-section", "keep-table-together");
  }

  section.appendChild(clone);
  return section;
}
function buildProfessionalPrintReport() {
  updateCalculations();
  const report = document.getElementById("printReport");
  if (!report) return;

  const now = new Date();
  const generated = now.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });

  report.innerHTML =
    '<div class="print-cover">' +
      '<div class="org-name">Water Supply Management Information System</div>' +
      '<h1>Monthly MIS Report</h1>' +
      '<h2>' + esc(readStoreValue("meta.scheme")) + '</h2>' +
      '<div class="generated">Generated: ' + esc(generated) + '</div>' +
    '</div>' +
    '<div class="print-meta-grid">' +
      '<div class="print-meta-item"><div class="print-meta-label">Scheme</div><div class="print-meta-value">' + esc(readStoreValue("meta.scheme")) + '</div></div>' +
      '<div class="print-meta-item"><div class="print-meta-label">OIC</div><div class="print-meta-value">' + esc(readStoreValue("meta.oic")) + '</div></div>' +
      '<div class="print-meta-item"><div class="print-meta-label">Month</div><div class="print-meta-value">' + esc(readStoreValue("meta.month")) + '</div></div>' +
      '<div class="print-meta-item"><div class="print-meta-label">Report ID</div><div class="print-meta-value">' + esc(readStoreValue("meta.reportId")) + '</div></div>' +
    '</div>';

  const body = document.createElement("div");
  body.className = "print-body";
  document.querySelectorAll("#mainTabContent .section-card").forEach(card => {
    body.appendChild(preparePrintSection(card));
  });
  report.appendChild(body);
}
function printProfessionalReport() {
  saveLocal(false);
  buildProfessionalPrintReport();
  setTimeout(() => window.print(), 80);
}

function init() {
  startLoadingScreen();
  renderProduction();
  renderLeaks();
  renderPipeline();
  renderValves();
  renderBulk();
  renderExpenditure();
  loadAll();
  getReportId();
  updateCalculations();
  showTab(0);

  document.addEventListener("input", e => {
    if (e.target.matches("[data-store]")) {
      updateCalculations();
      saveLocal(false);
      scheduleCloudSave();
    }
  });
  document.addEventListener("change", e => {
    if (e.target.matches("[data-store]")) {
      updateCalculations();
      saveLocal(false);
      scheduleCloudSave();
    }
  });

  tabButtons().forEach((btn, index) => btn.addEventListener("click", () => showTab(index)));
  document.getElementById("prevTabBtn")?.addEventListener("click", () => showTab(currentTabIndex() - 1));
  document.getElementById("nextTabBtn")?.addEventListener("click", () => showTab(currentTabIndex() + 1));
  document.getElementById("saveNowBtn")?.addEventListener("click", () => saveAll(true, { cloud: true }));
  document.getElementById("clearAllTabsBtn")?.addEventListener("click", clearAllTabs);
  document.getElementById("exportBtn")?.addEventListener("click", exportData);
  document.getElementById("printBtn")?.addEventListener("click", printProfessionalReport);
  document.getElementById("clearCurrentBtn")?.addEventListener("click", clearCurrentTab);

  ensureFirebaseReady().then(connected => {
    if (connected) loadFromFirestore(false);
  });
}

window.addEventListener("beforeprint", buildProfessionalPrintReport);
document.addEventListener("DOMContentLoaded", init);
