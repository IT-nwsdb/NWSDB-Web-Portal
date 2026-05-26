import {
  loadState,
  writeLocalState,
  syncRemoteState,
  removeLocalState
} from "../shared/firebase-store.js";

const STORAGE_KEY = "ppms_entry_E&S_v1";
const REMOTE_PATH = ["ppms_modules", "es"];
const body = document.getElementById("body");

const $ = (id) => document.getElementById(id);

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
}

function toast(text, type = "secondary") {
  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${type} border-0 show`;
  el.role = "alert";
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escapeHtml(text)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
    </div>
  `;
  $("msg").appendChild(el);
  el.querySelector("button").onclick = () => el.remove();
  setTimeout(() => el.remove(), 1800);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function autosizeTextarea(el) {
  if (!el || el.tagName !== "TEXTAREA") return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function numOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function defaultState() {
  return {
    selectedProjectId: null,
    projects: [
      {
        id: uid(),
        name: "Addl.GM/C/NWS/Sab/WSP/E&S/LAB/2025",
        activities: [
          {
            id: uid(),
            name: "Purchasing of Lab Equipment for Regional Labs and Water Reclamation Division - Addl.GM/C/NW/SAB/LAB/2025",
            contract: null,
            alloc2026: null,
            start: "",
            end: "",
            cumLastMonth: null,
            cumCurrentMonth: null
          }
        ]
      }
    ]
  };
}

function isValidState(value) {
  return !!value && Array.isArray(value.projects);
}

function normalizeState(value) {
  const fallback = defaultState();
  const source = isValidState(value) ? value : fallback;
  const projects = source.projects.map((project) => ({
    id: project.id || uid(),
    name: String(project.name ?? ""),
    activities: Array.isArray(project.activities)
      ? project.activities.map((activity) => ({
          id: activity.id || uid(),
          name: String(activity.name ?? ""),
          contract: numOrNull(activity.contract),
          alloc2026: numOrNull(activity.alloc2026),
          start: String(activity.start ?? ""),
          end: String(activity.end ?? ""),
          cumLastMonth: numOrNull(activity.cumLastMonth),
          cumCurrentMonth: numOrNull(activity.cumCurrentMonth)
        }))
      : []
  }));

  const selectedProjectId = projects.some((project) => project.id === source.selectedProjectId)
    ? source.selectedProjectId
    : projects[0]?.id || null;

  return { selectedProjectId, projects };
}

let state = normalizeState(defaultState());
let remoteSaveTimer = null;
let syncWarningShown = false;

function persistLocal() {
  writeLocalState(STORAGE_KEY, state);
}

async function syncRemoteNow() {
  persistLocal();
  await syncRemoteState({ remotePath: REMOTE_PATH, data: state });
}

function scheduleRemoteSync() {
  persistLocal();
  clearTimeout(remoteSaveTimer);
  remoteSaveTimer = setTimeout(async () => {
    try {
      await syncRemoteState({ remotePath: REMOTE_PATH, data: state });
      syncWarningShown = false;
    } catch (error) {
      console.error("E&S Firestore sync failed", error);
      if (!syncWarningShown) {
        toast("Saved locally. Paste the Firestore rules, then refresh.", "warning");
        syncWarningShown = true;
      }
    }
  }, 700);
}

function render() {
  body.innerHTML = "";

  if (state.projects.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="9" class="text-center text-muted py-4">No projects yet. Click <b>+ Project</b> to start.</td>';
    body.appendChild(tr);
    return;
  }

  for (const project of state.projects) {
    const projectRow = document.createElement("tr");
    projectRow.className = `project-row${state.selectedProjectId === project.id ? " selected" : ""}`;
    projectRow.dataset.projectId = project.id;

    projectRow.innerHTML = `
      <td colspan="8">
        <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <span class="badge text-bg-light">PROJECT</span>
            <input class="form-control form-control-sm" style="max-width: 820px;" value="${escapeHtml(project.name)}" data-project-name="${project.id}" />
          </div>
          <div class="d-flex align-items-center gap-2"><div class="small opacity-75">${project.activities.length} row(s)</div><button class="btn btn-sm btn-light" data-action="deleteProject">Delete Project</button></div>
        </div>
      </td>
    `;
    body.appendChild(projectRow);

    for (const activity of project.activities) {
      const activityRow = document.createElement("tr");
      activityRow.dataset.projectId = project.id;
      activityRow.dataset.activityId = activity.id;

      activityRow.innerHTML = `
        <td class="wrap activity-name"><textarea data-field="name" rows="2" placeholder="Sub project / activity" title="${escapeHtml(activity.name)}">${escapeHtml(activity.name)}</textarea></td>
        <td class="text-end"><input data-field="contract" type="number" step="0.01" value="${activity.contract ?? ""}" class="text-end"></td>
        <td class="text-end"><input data-field="alloc2026" type="number" step="0.01" value="${activity.alloc2026 ?? ""}" class="text-end"></td>
        <td><input data-field="start" type="date" value="${activity.start ?? ""}"></td>
        <td><input data-field="end" type="date" value="${activity.end ?? ""}"></td>
        <td class="text-end"><input data-field="cumLastMonth" type="number" step="0.01" value="${activity.cumLastMonth ?? ""}" class="text-end"></td>
        <td class="text-end"><input data-field="cumCurrentMonth" type="number" step="0.01" value="${activity.cumCurrentMonth ?? ""}" class="text-end"></td>
        <td class="text-center">
          <div class="d-flex gap-1 justify-content-center flex-wrap row-actions">
            <button class="btn btn-sm btn-outline-primary" data-action="editRow">Edit</button>
            <button class="btn btn-sm btn-outline-danger" data-action="deleteRow">Delete</button>
          </div>
        </td>
      `;
      body.appendChild(activityRow);
    }
  }

  body.querySelectorAll("textarea").forEach(autosizeTextarea);
}

function addProject() {
  const project = { id: uid(), name: "New Project", activities: [] };
  state.projects.push(project);
  state.selectedProjectId = project.id;
  scheduleRemoteSync();
  render();
  toast("Project added", "primary");
}

function addRowUnderSelected() {
  const projectId = state.selectedProjectId || state.projects[state.projects.length - 1]?.id;
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) {
    toast("Add a project first", "danger");
    return;
  }

  project.activities.push({
    id: uid(),
    name: "",
    contract: null,
    alloc2026: null,
    start: "",
    end: "",
    cumLastMonth: null,
    cumCurrentMonth: null
  });

  state.selectedProjectId = project.id;
  scheduleRemoteSync();
  render();
}

function deleteRow(projectId, activityId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;
  project.activities = project.activities.filter((activity) => activity.id !== activityId);
  scheduleRemoteSync();
  render();
}
function editRow(projectId, activityId) {
  state.selectedProjectId = projectId;
  render();

  const row = body.querySelector(`tr[data-project-id="${projectId}"][data-activity-id="${activityId}"]`);
  if (!row) return;

  row.classList.add("editing-highlight");
  setTimeout(() => row.classList.remove("editing-highlight"), 1500);

  const firstField = row.querySelector('[data-field="name"], input, textarea');
  if (firstField) {
    firstField.focus();
    if (typeof firstField.select === "function") firstField.select();
  }

  toast("Edit mode enabled for this row", "primary");
}


function deleteProject(projectId) {
  const index = state.projects.findIndex((project) => project.id === projectId);
  if (index === -1) return;

  state.projects.splice(index, 1);

  if (state.selectedProjectId === projectId) {
    const next = state.projects[index] || state.projects[index - 1] || null;
    state.selectedProjectId = next ? next.id : null;
  }

  scheduleRemoteSync();
  render();
  toast("Project deleted", "warning");
}

async function resetAll() {
  if (!confirm("Reset everything?")) return;
  clearTimeout(remoteSaveTimer);
  state = normalizeState(defaultState());
  persistLocal();
  try {
    await syncRemoteNow();
    syncWarningShown = false;
    toast("Reset done", "warning");
  } catch (error) {
    console.error("E&S Firestore reset sync failed", error);
    toast("Reset locally. Paste the Firestore rules, then refresh.", "warning");
  }
  render();
}

document.getElementById("btnAddProject").addEventListener("click", addProject);
document.getElementById("btnAddRow").addEventListener("click", addRowUnderSelected);
document.getElementById("btnSave").addEventListener("click", async () => {
  clearTimeout(remoteSaveTimer);
  try {
    await syncRemoteNow();
    syncWarningShown = false;
    toast("Saved to database", "success");
  } catch (error) {
    console.error("E&S Firestore manual save failed", error);
    toast("Saved locally. Paste the Firestore rules, then refresh.", "warning");
  }
});
document.getElementById("btnReset").addEventListener("click", resetAll);

body.addEventListener("click", (e) => {
  const projectRow = e.target.closest("tr.project-row");
  if (!projectRow) return;
  if (e.target.matches("input")) return;
  state.selectedProjectId = projectRow.dataset.projectId;
  scheduleRemoteSync();
  render();
});

body.addEventListener("click", (e) => {
  const editButton = e.target.closest("button[data-action='editRow']");
  if (editButton) {
    const row = editButton.closest("tr");
    if (row?.dataset?.projectId && row?.dataset?.activityId) {
      editRow(row.dataset.projectId, row.dataset.activityId);
    }
    return;
  }

  const deleteButton = e.target.closest("button[data-action='deleteRow']");
  if (!deleteButton) return;
  const row = deleteButton.closest("tr");
  if (confirm("Delete this row?")) deleteRow(row.dataset.projectId, row.dataset.activityId);
});

body.addEventListener("click", (e) => {
  const button = e.target.closest("button[data-action='deleteProject']");
  if (!button) return;
  const row = button.closest("tr.project-row");
  const projectId = row?.dataset?.projectId;
  if (!projectId) return;
  if (confirm("Delete this project and all its rows?")) deleteProject(projectId);
});

body.addEventListener("input", (e) => {
  autosizeTextarea(e.target);

  const projectNameId = e.target.getAttribute("data-project-name");
  if (projectNameId) {
    const project = state.projects.find((item) => item.id === projectNameId);
    if (project) {
      project.name = e.target.value;
      state.selectedProjectId = project.id;
      scheduleRemoteSync();
    }
    return;
  }

  const row = e.target.closest("tr");
  if (!row || !row.dataset.activityId) return;

  const project = state.projects.find((item) => item.id === row.dataset.projectId);
  if (!project) return;

  const activity = project.activities.find((item) => item.id === row.dataset.activityId);
  if (!activity) return;

  const field = e.target.getAttribute("data-field");
  if (!field) return;

  if (["contract", "alloc2026", "cumLastMonth", "cumCurrentMonth"].includes(field)) {
    activity[field] = numOrNull(e.target.value);
  } else {
    activity[field] = e.target.value;
  }

  if (field === "name") e.target.title = e.target.value;
  scheduleRemoteSync();
});

async function init() {
  const loaded = await loadState({
    localKey: STORAGE_KEY,
    remotePath: REMOTE_PATH,
    defaultValue: defaultState(),
    validate: isValidState
  });

  state = normalizeState(loaded);
  persistLocal();
  render();
}

await init();
