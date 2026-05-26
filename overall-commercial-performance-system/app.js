import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLEA4VJNubkHXqbE7qJmH4thzRZB9UGGA",
  authDomain: "commercial-1921f.firebaseapp.com",
  projectId: "commercial-1921f",
  storageBucket: "commercial-1921f.firebasestorage.app",
  messagingSenderId: "605154183482",
  appId: "1:605154183482:web:2f6a977741ec2624812803"
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const collectionName = "overall_commercial_performance";
const localCacheKey = "overall_commercial_performance_firestore_cache_regions_v2";
const regions = [
  { id: "central_north", label: "CENTRAL NORTH", editable: true },
  { id: "central_east", label: "CENTRAL EAST", editable: true },
  { id: "central_south", label: "CENTRAL SOUTH", editable: true },
  { id: "matale", label: "MATALE", editable: true },
  { id: "overall", label: "OVERALL", editable: false }
];
const editableRegionIds = regions.filter((region) => region.editable).map((region) => region.id);
const defaultRegionId = editableRegionIds[0];

const schema = [
  {
    section: "Number of Connections",
    rows: [
      { id: "number_domestic", metric: "Domestic" },
      { id: "number_non_domestic", metric: "Non Domestic" },
      { id: "number_total", metric: "Total", calculated: true, formula: "Domestic + Non Domestic" }
    ]
  },
  {
    section: "New Connection",
    rows: [
      { id: "new_connection_given", metric: "Number of connection given in the month" },
      { id: "new_connection_payment_pending", metric: "New connection payment done not yet give conn" },
      { id: "new_connection_first_bill", metric: "1st bill not issued (Todate)" }
    ]
  },
  {
    section: "Monthly billing & collection Performance",
    rows: [
      { id: "monthly_quantity_sold_m3", metric: "Quantity Sold M3" },
      { id: "monthly_actual_billing", metric: "Actual billing Rs Million" },
      { id: "monthly_actual_collection", metric: "Actual collection Rs Million" },
      { id: "monthly_collection_efficiency", metric: "Collection Efficiency (Monthly)%" }
    ]
  },
  {
    section: "Cummulative billing & collection Performance",
    rows: [
      { id: "cumulative_quantity_sold", metric: "Quantity Sold" },
      { id: "cumulative_billing", metric: "Billing Rs Million" },
      { id: "cumulative_collection", metric: "Collection Rs Million" },
      { id: "cumulative_collection_efficiency", metric: "Collection Efficiency (Cummulative)%" }
    ]
  },
  {
    section: "Arrears",
    rows: [
      { id: "arrears_without_dc_sp", metric: "Arrears Without DC/SP" },
      { id: "arrears_total", metric: "Total Arrears" },
      { id: "debt_age_without_current_month", metric: "Debt Age (without current month)" }
    ]
  },
  {
    section: "Other Performence",
    rows: [
      { id: "inactive_accounts", metric: "Inactive accounts" },
      { id: "meter_reader_interval", metric: "Meter reader interval (29,30,31)%" },
      { id: "mobile_update", metric: "Mobile update%" },
      { id: "email_update", metric: "Email update%" },
      { id: "gnd_entered", metric: "GND Entered%" },
      { id: "consumer_payment_pattern", metric: "Consumer payment pattern%" },
      { id: "over_6_months_n_zero", metric: "Over 6 months N Zero%" },
      { id: "over_6_months_e_zero", metric: "Over 6 months E Zero%" },
      { id: "continuous_over_01_years", metric: "Continuous Over 01 Years Estimated Bills Due To Defective Meters (Code 05)" },
      { id: "complaints_outstanding", metric: "Status Of Complaints Received to H/O (outstanding.)%" },
      { id: "average_revenue_per_connection", metric: "Average revenue for connection (Rs / 1 unit)%" },
      { id: "consumer_file_update", metric: "Consumer File Update" }
    ]
  }
];

const rowIds = schema.flatMap((group) => group.rows.map((row) => row.id));
const graphSectionNames = schema.map((group) => group.section);
const chartPalette = [
  "#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#7c3aed", "#0891b2",
  "#ea580c", "#4f46e5", "#be123c", "#0f766e", "#9333ea", "#1d4ed8"
];

function parseNumber(value) {
  const cleaned = String(value ?? "").replace(/,/g, "").trim();
  if (cleaned === "") return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function formatCalculatedNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function createEmptyValues() {
  const values = {};
  rowIds.forEach((rowId) => {
    values[rowId] = {};
    months.forEach((month) => {
      values[rowId][month] = "";
    });
  });
  return values;
}

function mergeWithEmptyValues(values) {
  const base = createEmptyValues();
  Object.keys(values || {}).forEach((rowId) => {
    if (!base[rowId]) base[rowId] = {};
    months.forEach((month) => {
      const cell = values[rowId]?.[month];
      if (cell !== undefined && cell !== null) {
        base[rowId][month] = String(cell);
      }
    });
  });
  return base;
}

function recalculateNumberOfConnections(values) {
  months.forEach((month) => {
    const domestic = parseNumber(values["number_domestic"]?.[month]) ?? 0;
    const nonDomestic = parseNumber(values["number_non_domestic"]?.[month]) ?? 0;
    const total = domestic + nonDomestic;

    if (!values["number_total"]) values["number_total"] = {};
    values["number_total"][month] = formatCalculatedNumber(total);
  });

  return values;
}

function aggregateOverallValues(regionState) {
  const overall = createEmptyValues();

  rowIds.forEach((rowId) => {
    months.forEach((month) => {
      const sum = editableRegionIds.reduce((running, regionId) => {
        const regionValues = regionState[regionId] || createEmptyValues();
        return running + (parseNumber(regionValues[rowId]?.[month]) ?? 0);
      }, 0);
      overall[rowId][month] = formatCalculatedNumber(sum);
    });
  });

  return recalculateNumberOfConnections(overall);
}

function normalizeState(input) {
  const normalized = {};
  editableRegionIds.forEach((regionId) => {
    normalized[regionId] = recalculateNumberOfConnections(mergeWithEmptyValues(input?.[regionId] || {}));
  });
  normalized.overall = aggregateOverallValues(normalized);
  return normalized;
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loadingScreen = document.getElementById("loadingScreen");
const appShell = document.getElementById("app");
const tableView = document.getElementById("tableView");
const saveBtn = document.getElementById("saveBtn");
const printBtn = document.getElementById("printBtn");
const resetBtn = document.getElementById("resetBtn");
const graphToggleBtn = document.getElementById("graphToggleBtn");
const graphModal = document.getElementById("graphModal");
const graphCloseBtn = document.getElementById("graphCloseBtn");
const graphSectionSelect = document.getElementById("graphSectionSelect");
const graphTitle = document.getElementById("graphTitle");
const graphSubtitle = document.getElementById("graphSubtitle");
const graphCanvas = document.getElementById("sectionGraphCanvas");
const tableLabel = document.getElementById("tableLabel");
const statusBar = document.getElementById("statusBar");
const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("tableBody");
const tableScaleTarget = document.getElementById("tableScaleTarget");
const regionScreen = document.getElementById("regionScreen");
const regionGrid = document.getElementById("regionGrid");
const backToRegionsBtn = document.getElementById("backToRegionsBtn");
const regionPill = document.getElementById("regionPill");

let state = normalizeState(readLocalCache());
let chartInstance = null;
let activeGraphSection = graphSectionNames[0];
let graphModalOpen = false;
let activeRegionId = defaultRegionId;

window.addEventListener("DOMContentLoaded", async () => {
  setTimeout(async () => {
    loadingScreen.classList.add("hidden");
    regionScreen.classList.remove("hidden");
    appShell.classList.add("hidden");
    renderRegionPicker();
    showStatus("Loading saved region data...", "info");
    await loadAllRegionDocuments();
    fitTableLayout();
  }, 900);
});

window.addEventListener("resize", () => {
  fitTableLayout();
  updateGraph();
});

saveBtn.addEventListener("click", async () => {
  await saveCurrentDocument();
});

printBtn.addEventListener("click", () => {
  printCurrentTable();
});

resetBtn.addEventListener("click", async () => {
  await resetCurrentDocument();
});

backToRegionsBtn.addEventListener("click", () => {
  closeGraphModal();
  appShell.classList.add("hidden");
  regionScreen.classList.remove("hidden");
  renderRegionPicker();
});

graphToggleBtn.addEventListener("click", () => {
  openGraphModal();
});

graphCloseBtn.addEventListener("click", () => {
  closeGraphModal();
});

graphSectionSelect.addEventListener("change", (event) => {
  activeGraphSection = event.target.value;
  updateGraph();
});

graphModal.addEventListener("click", (event) => {
  if (event.target === graphModal) {
    closeGraphModal();
  }
});

document.addEventListener("keydown", async (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    await saveCurrentDocument();
  }

  if (event.key === "Escape" && graphModalOpen) {
    closeGraphModal();
  }
});

function renderRegionPicker() {
  regionGrid.innerHTML = regions.map((region) => `
    <button
      type="button"
      class="region-card${region.id === activeRegionId ? " active" : ""}"
      data-region-id="${region.id}"
    >
      <span class="region-card-title">${escapeHtml(region.label)}</span>
      <span class="region-card-subtitle">${region.editable ? "Open editable region table" : "View live total of all regions"}</span>
    </button>
  `).join("");

  regionGrid.querySelectorAll(".region-card").forEach((button) => {
    button.addEventListener("click", () => selectRegion(button.dataset.regionId));
  });
}

function selectRegion(regionId) {
  activeRegionId = regionId;
  regionScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
  tableLabel.textContent = getCurrentRegion().editable
    ? `${getCurrentRegion().label} Region`
    : "Live total of CENTRAL NORTH, CENTRAL EAST, CENTRAL SOUTH and MATALE";
  regionPill.textContent = getCurrentRegion().label;
  graphSectionSelect.value = activeGraphSection;
  updateActionButtons();
  renderTable();
  updateGraph();
}

function updateActionButtons() {
  const editable = getCurrentRegion().editable;
  saveBtn.disabled = !editable;
  resetBtn.disabled = !editable;
  printBtn.disabled = false;
  saveBtn.title = editable ? "Save this region to cloud" : "OVERALL is auto-calculated from the 4 regions";
  resetBtn.title = editable ? "Reset this region" : "OVERALL is auto-calculated from the 4 regions";
  printBtn.title = `Print ${getCurrentRegion().label} commercial performance table`;
}

function getCurrentRegion() {
  return regions.find((region) => region.id === activeRegionId) || regions[0];
}

function getCurrentValues() {
  if (!state[activeRegionId]) {
    state[activeRegionId] = activeRegionId === "overall" ? aggregateOverallValues(state) : createEmptyValues();
  }

  if (activeRegionId === "overall") {
    state.overall = aggregateOverallValues(state);
    return state.overall;
  }

  recalculateNumberOfConnections(state[activeRegionId]);
  state.overall = aggregateOverallValues(state);
  return state[activeRegionId];
}

function getSectionDefinition(sectionName) {
  return schema.find((group) => group.section === sectionName) || schema[0];
}

function getSectionChartData(sectionName) {
  const values = getCurrentValues();
  const section = getSectionDefinition(sectionName);
  return section.rows.map((row) => ({
    label: row.metric,
    data: months.map((month) => parseNumber(values[row.id]?.[month]))
  }));
}

async function loadAllRegionDocuments() {
  const localHadData = editableRegionIds.some((regionId) => hasAnyData(state[regionId]));

  try {
    const snapshots = await Promise.all(editableRegionIds.map((regionId) => getDoc(doc(db, collectionName, regionId))));

    let cloudCount = 0;
    snapshots.forEach((snapshot, index) => {
      const regionId = editableRegionIds[index];
      if (snapshot.exists()) {
        const data = snapshot.data();
        state[regionId] = recalculateNumberOfConnections(mergeWithEmptyValues(data.values || {}));
        cloudCount += 1;
      }
    });

    state.overall = aggregateOverallValues(state);
    writeLocalCache();
    renderRegionPicker();

    if (cloudCount > 0) {
      showStatus(`Loaded ${cloudCount} region table${cloudCount === 1 ? "" : "s"} from cloud.`, "success");
    } else if (localHadData) {
      showStatus("No cloud records found. Showing browser backup for the regions.", "info");
    } else {
      showStatus("No saved region data found yet. Choose a region to start entering data.", "info");
    }
  } catch (error) {
    console.error("Cloud load failed", error, { collectionName });
    state = normalizeState(state);
    writeLocalCache();
    renderRegionPicker();
    if (localHadData) {
      showStatus(`Cloud load failed. Showing browser backup. ${formatError(error)}`, "error");
    } else {
      showStatus(`Cloud load failed. ${formatError(error)}`, "error");
    }
  }
}

function renderTable() {
  const values = getCurrentValues();
  const region = getCurrentRegion();
  const readOnlyRegion = !region.editable;

  tableHead.innerHTML = `
    <tr class="title-row">
      <th colspan="14">${escapeHtml(region.label)} Commercial Performance</th>
    </tr>
    <tr>
      <th colspan="2">${escapeHtml(region.label)}</th>
      ${months.map((month) => `<th>${month}</th>`).join("")}
    </tr>
  `;

  let html = "";

  schema.forEach((group) => {
    group.rows.forEach((row, rowIndex) => {
      html += "<tr>";

      if (rowIndex === 0) {
        html += `<td class="section-cell" rowspan="${group.rows.length}">${escapeHtml(group.section)}</td>`;
      }

      html += `<td class="metric-cell">${escapeHtml(row.metric)}</td>`;

      months.forEach((month) => {
        const value = values[row.id]?.[month] ?? "";
        const isReadonly = readOnlyRegion || row.calculated;
        html += `
          <td>
            <input
              type="text"
              class="table-input${isReadonly ? " calculated-cell" : ""}"
              data-row="${row.id}"
              data-month="${month}"
              value="${escapeHtml(value)}"
              autocomplete="off"
              spellcheck="false"
              ${isReadonly ? 'readonly tabindex="-1" title="' + escapeHtml(readOnlyRegion ? "OVERALL is auto-calculated from all regions" : (row.formula || "Auto-calculated")) + '"' : ""}
            >
          </td>
        `;
      });

      html += "</tr>";
    });
  });

  tableBody.innerHTML = html;
  attachInputHandlers();
  fitTableLayout();
}

function attachInputHandlers() {
  document.querySelectorAll(".table-input").forEach((input) => {
    if (input.readOnly) return;
    input.addEventListener("input", handleInputUpdate);
    input.addEventListener("focus", (event) => event.target.select());
    input.addEventListener("keydown", handleGridNavigation);
  });
}

function handleInputUpdate(event) {
  const rowId = event.target.dataset.row;
  const month = event.target.dataset.month;
  const values = getCurrentValues();

  if (rowId === "number_total" || !getCurrentRegion().editable) return;

  values[rowId][month] = event.target.value;
  recalculateNumberOfConnections(values);
  state.overall = aggregateOverallValues(state);

  const totalInput = document.querySelector('.table-input[data-row="number_total"][data-month="' + month + '"]');
  if (totalInput) {
    totalInput.value = values["number_total"]?.[month] ?? "";
  }

  writeLocalCache();
  updateGraph();
  showStatus(`Changes saved in browser backup for ${getCurrentRegion().label}. Click Save to Cloud.`, "info");
}

function handleGridNavigation(event) {
  const navKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"];
  if (!navKeys.includes(event.key)) return;

  const rowId = event.target.dataset.row;
  const month = event.target.dataset.month;
  const rowIndex = rowIds.indexOf(rowId);
  const monthIndex = months.indexOf(month);

  let nextRowIndex = rowIndex;
  let nextMonthIndex = monthIndex;

  if (event.key === "ArrowUp") nextRowIndex -= 1;
  if (event.key === "ArrowDown" || event.key === "Enter") nextRowIndex += 1;
  if (event.key === "ArrowLeft") nextMonthIndex -= 1;
  if (event.key === "ArrowRight") nextMonthIndex += 1;

  if (nextRowIndex < 0 || nextRowIndex >= rowIds.length) return;
  if (nextMonthIndex < 0 || nextMonthIndex >= months.length) return;

  const nextInput = document.querySelector(`.table-input[data-row="${rowIds[nextRowIndex]}"][data-month="${months[nextMonthIndex]}"]`);
  if (!nextInput) return;

  event.preventDefault();
  nextInput.focus();
  nextInput.select();
}

async function saveCurrentDocument() {
  const region = getCurrentRegion();
  if (!region.editable) {
    showStatus("OVERALL is auto-calculated from the four regions, so there is nothing to save here.", "info");
    return;
  }

  const currentValues = getCurrentValues();
  recalculateNumberOfConnections(currentValues);
  state.overall = aggregateOverallValues(state);

  const payload = {
    table: region.label,
    values: mergeWithEmptyValues(currentValues),
    updatedAtClient: new Date().toISOString()
  };

  writeLocalCache();

  try {
    showStatus(`Saving ${region.label} to Firestore...`, "info");
    await setDoc(doc(db, collectionName, region.id), payload);
    showStatus(`${region.label} saved to Firestore successfully.`, "success");
  } catch (error) {
    console.error("Cloud save failed", error, { collectionName, regionId: region.id, payload });
    showStatus(`Save failed. Local copy is still safe. ${formatError(error)}`, "error");
  }
}

async function resetCurrentDocument() {
  const region = getCurrentRegion();
  if (!region.editable) {
    showStatus("OVERALL is auto-calculated from the four regions and cannot be reset directly.", "info");
    return;
  }

  const confirmed = window.confirm(`Delete all data for ${region.label}?`);
  if (!confirmed) return;

  state[region.id] = createEmptyValues();
  recalculateNumberOfConnections(state[region.id]);
  state.overall = aggregateOverallValues(state);
  writeLocalCache();
  renderTable();
  updateGraph();

  try {
    await deleteDoc(doc(db, collectionName, region.id));
    showStatus(`${region.label} data deleted from cloud and browser backup.`, "success");
  } catch (error) {
    console.error("Cloud delete failed", error);
    showStatus(`Local data cleared. Cloud delete failed: ${formatError(error)}`, "error");
  }
}

function updateGraph() {
  if (!graphModalOpen || !graphCanvas || typeof Chart === "undefined") return;

  const section = getSectionDefinition(activeGraphSection);
  const datasets = getSectionChartData(activeGraphSection).map((series, index) => ({
    label: series.label,
    data: series.data,
    borderWidth: 2,
    tension: 0.25,
    spanGaps: true,
    fill: false,
    pointRadius: 3,
    pointHoverRadius: 5,
    borderColor: chartPalette[index % chartPalette.length],
    backgroundColor: chartPalette[index % chartPalette.length]
  }));

  graphTitle.textContent = `${getCurrentRegion().label} - ${section.section} Graph`;
  graphSubtitle.textContent = `${section.rows.length} metric${section.rows.length === 1 ? "" : "s"} shown across Jan to Dec.`;

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(graphCanvas, {
    type: "line",
    data: {
      labels: months,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "nearest",
        intersect: false
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 14,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.raw;
              const display = value === null || value === undefined ? "No data" : value;
              return `${context.dataset.label}: ${display}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback(value) {
              return Number.isInteger(value) ? value : Number(value).toFixed(2);
            }
          }
        }
      }
    }
  });
}

function printCurrentTable() {
  closeGraphModal();
  getCurrentValues();
  renderTable();
  showStatus(`Preparing ${getCurrentRegion().label} table for printing...`, "info");
  window.requestAnimationFrame(() => window.print());
}

function openGraphModal() {
  graphModalOpen = true;
  graphModal.classList.remove("hidden");
  graphModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  graphSectionSelect.value = activeGraphSection;
  updateGraph();
}

function closeGraphModal() {
  graphModalOpen = false;
  graphModal.classList.add("hidden");
  graphModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "auto";
}

function fitTableLayout() {
  if (tableView.classList.contains("hidden")) return;
  tableScaleTarget.style.width = "100%";
  tableScaleTarget.style.height = "100%";
}

function hasAnyData(values) {
  return rowIds.some((rowId) => months.some((month) => String(values?.[rowId]?.[month] ?? "").trim() !== ""));
}

function readLocalCache() {
  try {
    return JSON.parse(localStorage.getItem(localCacheKey)) || {};
  } catch {
    return {};
  }
}

function writeLocalCache() {
  localStorage.setItem(localCacheKey, JSON.stringify(state));
}

function showStatus(message, type = "success") {
  statusBar.textContent = message;
  statusBar.className = `status-bar ${type}`;
  statusBar.classList.remove("hidden");
  fitTableLayout();
}

function formatError(error) {
  const code = error?.code ? `${error.code}: ` : "";
  const message = error?.message || String(error || "Unknown error");
  return `${code}${message}`.replace(/^FirebaseError:\s*/i, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
