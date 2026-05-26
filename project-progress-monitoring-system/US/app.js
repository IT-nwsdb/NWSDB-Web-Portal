import {
  loadState,
  readLocalState,
  writeLocalState,
  syncRemoteState
} from "../shared/firebase-store.js";

const SETTINGS_KEY = "aap_v10_settings";
const DATA_KEY_PREFIX = "aap_v10_year_";
const SETTINGS_REMOTE_PATH = ["ppms_modules", "us_settings"];
const yearRemotePath = (year) => ["ppms_us_years", String(year)];

const tbody = document.getElementById("tbody");
const btnNewProject = document.getElementById("btnNewProject");
const clearBtn = document.getElementById("clearAll");
const saveStateEl = document.getElementById("saveState");

const implementingAgencyEl = document.getElementById("implementingAgency");
const projectNameEl = document.getElementById("projectName");
const areaResponsibilityEl = document.getElementById("areaResponsibility");

const yearSelect = document.getElementById("yearSelect");
const btnSwitchYear = document.getElementById("btnSwitchYear");
const newYearInput = document.getElementById("newYearInput");
const btnAddYear = document.getElementById("btnAddYear");

const navTitle = document.getElementById("navTitle");
const pageTitle = document.getElementById("pageTitle");
const allocHeader = document.getElementById("allocHeader");
const progressHeader = document.getElementById("progressHeader");

const toggleFit = document.getElementById("toggleFit");

const modalEl = document.getElementById("newProjectModal");
const modalYear1 = document.getElementById("modalYear1");
const modalYear2 = document.getElementById("modalYear2");
const formEl = document.getElementById("projectForm");

const f_project = document.getElementById("f_project");
const f_resp = document.getElementById("f_resp");
const f_start = document.getElementById("f_start");
const f_end = document.getElementById("f_end");
const f_tec = document.getElementById("f_tec");
const f_alloc = document.getElementById("f_alloc");
const f_bills = document.getElementById("f_bills");
const f_exp = document.getElementById("f_exp");
const f_progress = document.getElementById("f_progress");
const f_status = document.getElementById("f_status");

function defaultMetaForYear() {
  return {
    implementingAgency: "",
    projectName: "US BUDGET",
    areaResponsibility: "RSC-CENTRAL"
  };
}

function defaultSettings() {
  return { currentYear: 2026, years: [2026], fitView: true };
}

function defaultYearData() {
  return { meta: defaultMetaForYear(), rows: [] };
}

function yearKey(year) {
  return `${DATA_KEY_PREFIX}${year}`;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeSettings(value) {
  const fallback = defaultSettings();
  const source = value && typeof value === "object" ? value : fallback;
  const years = Array.isArray(source.years)
    ? source.years.map((year) => Number(year)).filter((year) => Number.isFinite(year))
    : fallback.years.slice();
  const uniqueYears = Array.from(new Set(years.length ? years : fallback.years)).sort((a, b) => a - b);
  const currentYear = uniqueYears.includes(Number(source.currentYear)) ? Number(source.currentYear) : uniqueYears[0];
  return {
    currentYear,
    years: uniqueYears,
    fitView: source.fitView !== false
  };
}

function normalizeYearRow(row) {
  return {
    project: String(row?.project ?? ""),
    resp: String(row?.resp ?? ""),
    start: String(row?.start ?? ""),
    end: String(row?.end ?? ""),
    tec: String(row?.tec ?? ""),
    alloc: String(row?.alloc ?? ""),
    bills: String(row?.bills ?? ""),
    exp: String(row?.exp ?? ""),
    progress: String(row?.progress ?? ""),
    status: String(row?.status ?? "")
  };
}

function normalizeYearData(value) {
  const fallback = defaultYearData();
  const source = value && typeof value === "object" ? value : fallback;
  return {
    meta: {
      implementingAgency: String(source.meta?.implementingAgency ?? fallback.meta.implementingAgency),
      projectName: String(source.meta?.projectName ?? fallback.meta.projectName),
      areaResponsibility: String(source.meta?.areaResponsibility ?? fallback.meta.areaResponsibility)
    },
    rows: Array.isArray(source.rows) ? source.rows.map(normalizeYearRow) : []
  };
}

function isSettings(value) {
  return !!value && Array.isArray(value.years);
}

function isYearData(value) {
  return !!value && Array.isArray(value.rows);
}

function currentSettings() {
  return normalizeSettings(readLocalState(SETTINGS_KEY) || defaultSettings());
}

function writeSettingsLocal(value) {
  writeLocalState(SETTINGS_KEY, normalizeSettings(value));
}

function writeYearLocal(year, value) {
  writeLocalState(yearKey(year), normalizeYearData(value));
}

function setSaveState(text) {
  if (saveStateEl) saveStateEl.textContent = text;
}

let saveTimer = null;
let modalInstance = null;
let syncWarningShown = false;

const state = {
  year: 2026,
  meta: defaultMetaForYear(),
  rows: [],
  _editIndex: null
};

function ensureYearExists(year) {
  const settings = currentSettings();
  if (!settings.years.includes(year)) {
    settings.years.push(year);
    settings.years.sort((a, b) => a - b);
    settings.currentYear = year;
    writeSettingsLocal(settings);
  }

  if (!readLocalState(yearKey(year))) {
    writeYearLocal(year, defaultYearData());
  }
}

async function loadSettingsFromDatabase() {
  const loaded = await loadState({
    localKey: SETTINGS_KEY,
    remotePath: SETTINGS_REMOTE_PATH,
    defaultValue: defaultSettings(),
    validate: isSettings
  });
  const normalized = normalizeSettings(loaded);
  writeSettingsLocal(normalized);
  return normalized;
}

async function loadYearFromDatabase(year) {
  const loaded = await loadState({
    localKey: yearKey(year),
    remotePath: yearRemotePath(year),
    defaultValue: defaultYearData(),
    validate: isYearData
  });
  const normalized = normalizeYearData(loaded);
  writeYearLocal(year, normalized);
  return normalized;
}

async function syncSettingsOnly() {
  const settings = currentSettings();
  writeSettingsLocal(settings);
  await syncRemoteState({ remotePath: SETTINGS_REMOTE_PATH, data: settings });
}

async function saveCurrentYear() {
  const settings = currentSettings();
  settings.currentYear = state.year;
  if (!settings.years.includes(state.year)) {
    settings.years.push(state.year);
    settings.years.sort((a, b) => a - b);
  }
  settings.fitView = document.body.classList.contains("fit-view");

  const yearData = normalizeYearData({ meta: state.meta, rows: state.rows });

  writeSettingsLocal(settings);
  writeYearLocal(state.year, yearData);

  await Promise.all([
    syncRemoteState({ remotePath: SETTINGS_REMOTE_PATH, data: settings }),
    syncRemoteState({ remotePath: yearRemotePath(state.year), data: yearData })
  ]);
}

function scheduleSave() {
  setSaveState("Saving...");
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await saveCurrentYear();
      syncWarningShown = false;
      setSaveState("Saved");
    } catch (error) {
      console.error("US Firestore sync failed", error);
      setSaveState("Saved locally");
      syncWarningShown = true;
    }
  }, 400);
}

async function loadYear(year) {
  ensureYearExists(year);
  const data = await loadYearFromDatabase(year);

  state.year = year;
  state.meta = data.meta;
  state.rows = data.rows;
  state._editIndex = null;

  navTitle.textContent = `Action/Activity Plan - ${year}`;
  pageTitle.textContent = `Action/Activity Plan - ${year}`;
  allocHeader.textContent = `Allocation for ${year} (Rs.Mn.)`;
  progressHeader.textContent = `Physical progress as at 31/01/${year} - %`;

  modalYear1.textContent = String(year);
  modalYear2.textContent = String(year);

  implementingAgencyEl.value = state.meta.implementingAgency || "";
  projectNameEl.value = state.meta.projectName || "";
  areaResponsibilityEl.value = state.meta.areaResponsibility || "";

  render();
  setSaveState(syncWarningShown ? "Saved locally" : "Saved");
}

function render() {
  tbody.innerHTML = "";

  if (state.rows.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="12" class="text-center text-muted py-4">No rows. Click <b>New Project</b>.</td>';
    tbody.appendChild(tr);
    return;
  }

  state.rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-center"></td>
      <td>${escapeHtml(row.project || "")}</td>
      <td>${escapeHtml(row.resp || "")}</td>
      <td class="text-center">${escapeHtml(row.start || "")}</td>
      <td class="text-center">${escapeHtml(row.end || "")}</td>
      <td class="text-end">${escapeHtml(row.tec || "")}</td>
      <td class="text-end">${escapeHtml(row.alloc || "")}</td>
      <td class="text-end">${escapeHtml(row.bills || "")}</td>
      <td class="text-end">${escapeHtml(row.exp || "")}</td>
      <td class="text-center">${escapeHtml(row.progress || "")}</td>
      <td>${escapeHtml(row.status || "")}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" data-action="edit">Edit</button>
        <button class="btn btn-sm btn-danger" data-action="delete">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  Array.from(tbody.querySelectorAll("tr")).forEach((tr, index) => {
    const first = tr.querySelector("td");
    if (first) first.textContent = String(index + 1);
  });
}

function clearAll() {
  if (confirm("Delete all rows for this YEAR only?")) {
    state.rows = [];
    scheduleSave();
    render();
  }
}

function refreshYearDropdown() {
  const settings = currentSettings();
  const years = settings.years.slice().sort((a, b) => a - b);
  yearSelect.innerHTML = "";
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    if (Number(year) === Number(state.year)) option.selected = true;
    yearSelect.appendChild(option);
  });
}

async function switchYear(targetYear) {
  clearTimeout(saveTimer);
  try {
    await saveCurrentYear();
    syncWarningShown = false;
  } catch (error) {
    console.error("US Firestore sync before switch failed", error);
    setSaveState("Saved locally");
    syncWarningShown = true;
  }
  await loadYear(targetYear);
  refreshYearDropdown();
}

async function addYear() {
  const year = Number(String(newYearInput.value || "").trim());
  if (!Number.isFinite(year) || year < 1900 || year > 3000) {
    alert("Enter a valid year (e.g. 2027).");
    return;
  }
  ensureYearExists(year);
  refreshYearDropdown();
  newYearInput.value = "";
  await switchYear(year);
}

function resetModal() {
  formEl.classList.remove("was-validated");
  f_project.value = "";
  f_resp.value = "";
  f_start.value = "";
  f_end.value = "";
  f_tec.value = "";
  f_alloc.value = "";
  f_bills.value = "";
  f_exp.value = "";
  f_progress.value = "";
  f_status.value = "";
}

function openNewProjectModal(prefillRow = null) {
  resetModal();
  if (prefillRow) {
    f_project.value = prefillRow.project || "";
    f_resp.value = prefillRow.resp || "";
    f_start.value = prefillRow.start || "";
    f_end.value = prefillRow.end || "";
    f_tec.value = prefillRow.tec || "";
    f_alloc.value = prefillRow.alloc || "";
    f_bills.value = prefillRow.bills || "";
    f_exp.value = prefillRow.exp || "";
    f_progress.value = prefillRow.progress || "";
    f_status.value = prefillRow.status || "";
  }
  modalInstance.show();
}

function modalToRow() {
  return normalizeYearRow({
    project: f_project.value.trim(),
    resp: f_resp.value.trim(),
    start: f_start.value,
    end: f_end.value,
    tec: f_tec.value,
    alloc: f_alloc.value,
    bills: f_bills.value,
    exp: f_exp.value,
    progress: f_progress.value.trim(),
    status: f_status.value.trim()
  });
}

function wireMetaAutosave() {
  implementingAgencyEl.addEventListener("input", () => {
    state.meta.implementingAgency = implementingAgencyEl.value;
    scheduleSave();
  });
  projectNameEl.addEventListener("input", () => {
    state.meta.projectName = projectNameEl.value;
    scheduleSave();
  });
  areaResponsibilityEl.addEventListener("input", () => {
    state.meta.areaResponsibility = areaResponsibilityEl.value;
    scheduleSave();
  });
}

function wireFitToggle() {
  const settings = currentSettings();
  const fit = settings.fitView !== false;
  document.body.classList.toggle("fit-view", fit);
  toggleFit.checked = fit;

  toggleFit.addEventListener("change", async () => {
    document.body.classList.toggle("fit-view", toggleFit.checked);
    const settingsNext = currentSettings();
    settingsNext.fitView = toggleFit.checked;
    writeSettingsLocal(settingsNext);
    try {
      await syncSettingsOnly();
      syncWarningShown = false;
      setSaveState("Saved");
    } catch (error) {
      console.error("US Firestore fit-view sync failed", error);
      syncWarningShown = true;
      setSaveState("Saved locally");
    }
  });
}

async function init() {
  modalInstance = new bootstrap.Modal(modalEl);

  const settings = await loadSettingsFromDatabase();
  const initialYear = Number(settings.currentYear || 2026);

  ensureYearExists(initialYear);
  document.body.classList.toggle("fit-view", settings.fitView !== false);
  toggleFit.checked = settings.fitView !== false;

  await loadYear(initialYear);
  refreshYearDropdown();
  wireMetaAutosave();
  wireFitToggle();

  btnNewProject.addEventListener("click", () => openNewProjectModal());
  document.getElementById("btnModalReset").addEventListener("click", resetModal);

  document.getElementById("btnModalSave").addEventListener("click", () => {
    formEl.classList.add("was-validated");
    if (!f_project.value.trim()) return;

    const row = modalToRow();

    if (state._editIndex !== undefined && state._editIndex !== null) {
      state.rows[state._editIndex] = row;
      state._editIndex = null;
    } else {
      state.rows.push(row);
    }
    scheduleSave();
    render();
    modalInstance.hide();
  });

  clearBtn.addEventListener("click", clearAll);

  tbody.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;

    const tr = e.target.closest("tr");
    const index = Array.from(tbody.children).indexOf(tr);
    if (index < 0) return;

    const action = button.dataset.action;
    if (action === "delete") {
      if (confirm("Delete this row?")) {
        state.rows.splice(index, 1);
        scheduleSave();
        render();
      }
    } else if (action === "edit") {
      state._editIndex = index;
      openNewProjectModal(state.rows[index]);
    }
  });

  btnSwitchYear.addEventListener("click", async () => {
    const year = Number(yearSelect.value);
    if (Number.isFinite(year)) await switchYear(year);
  });
  btnAddYear.addEventListener("click", addYear);
  newYearInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await addYear();
    }
  });
}

await init();
