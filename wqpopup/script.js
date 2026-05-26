// === Firebase (Firestore) setup ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNk1D5VgHfTZOELm3M28Q_I0DkX8D9xEg",
  authDomain: "water-quality-afa4e.firebaseapp.com",
  projectId: "water-quality-afa4e",
  storageBucket: "water-quality-afa4e.firebasestorage.app",
  messagingSenderId: "312509243970",
  appId: "1:312509243970:web:e5c235e72826e52b4583db"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig, "wqpopupApp");
const db = getFirestore(app);

// Collection name in Firestore (you can change this if you want)
const FIRESTORE_COLLECTION = "wtp_submissions";

console.log("✅ Firestore connected");

async function ensureFirestoreCacheLoaded(){
  try{
    if(window.__firestoreSubmissionsCache && Array.isArray(window.__firestoreSubmissionsCache) && window.__firestoreSubmissionsCache.length){
      return window.__firestoreSubmissionsCache;
    }
    const container = document.getElementById("submissions-container");
    // Load from Firestore (same as renderSubmissionsList) but without rendering
    const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
    const list = snap.docs.map(d=> ({ id:d.id, ...(d.data()||{}) }));
    // Normalize dateKey if missing
    list.forEach(it=>{
      if(!it.dateKey){
        it.dateKey = it.id; // doc id is the date key
      }
    });
    window.__firestoreSubmissionsCache = list;
    console.log("✅ Compare cache loaded:", list.length);
    return list;
  }catch(err){
    console.error("❌ ensureFirestoreCacheLoaded failed:", err);
    window.__firestoreSubmissionsCache = window.__firestoreSubmissionsCache || [];
    return window.__firestoreSubmissionsCache;
  }
}


// Prefilled rows based on the provided PDF (first 5 columns) + section separators
// You can edit ONLY the turbidity / RCL columns in the table.

const defaultRows = [
  // ===== Kandy District =====
  {type:"section", label:"Kandy District"},
  {no:1, region:"Central South", plant:"Kandy South", capacity:"32,000", connections:"48,304"},
  {no:2, region:"", plant:"Elpitiya", capacity:"7,000", connections:"4,739"},
  {no:3, region:"", plant:"Nillambe", capacity:"14,500", connections:"21,150"},
  {no:4, region:"", plant:"Hanthana", capacity:"480", connections:"823"},
  {no:5, region:"", plant:"Paradeka", capacity:"6,000", connections:"6,661"},
  {no:6, region:"", plant:"Ulapane", capacity:"8,500", connections:"11,000"},
  {no:7, region:"", plant:"Gampola Watta", capacity:"1,200", connections:"1,259"},
  {no:8, region:"", plant:"Doluwa", capacity:"250", connections:"483"},
  {no:9, region:"", plant:"Datrry", capacity:"500", connections:"149"},
  {no:10, region:"", plant:"Pussellawa", capacity:"750", connections:"1,838"},
  {no:11, region:"", plant:"Nawalapitiya", capacity:"4,500", connections:"6,706"},
  {no:12, region:"Central East", plant:"Araththana", capacity:"1,500", connections:"33,462"},
  {no:13, region:"", plant:"Balagolla", capacity:"1,300", connections:"9,663"},
  {no:14, region:"", plant:"Madadumbara", capacity:"3,000", connections:"7,392"},
  {no:15, region:"", plant:"Marassana", capacity:"3,000", connections:"6,293"},
  {no:16, region:"", plant:"Haragama", capacity:"2,400", connections:"5,829"},
  {no:17, region:"", plant:"Ampitiya", capacity:"4,700", connections:"7,500"},
  {no:18, region:"Central North", plant:"GKWTP", capacity:"55,000", connections:"60,446"},
  {no:19, region:"", plant:"Galagedara", capacity:"1,200", connections:"3,131"},
  {no:20, region:"", plant:"Polgolla", capacity:"9,000", connections:"21,766"},

  // ===== Nuwara Eliya District =====
  {type:"section", label:"Nuwara Eliya District"},
  {no:1, region:"Central South", plant:"Thalawakele", capacity:"2,000", connections:"2,446"},
  {no:2, region:"", plant:"Ginigathhena", capacity:"1,200", connections:"2,994"},
  {no:3, region:"", plant:"Pudaluoya", capacity:"800", connections:"885"},
  {no:4, region:"", plant:"Kotagala", capacity:"900", connections:"1,298"},
  {no:5, region:"", plant:"Maskeliya", capacity:"780", connections:"1,999"},
  {no:6, region:"", plant:"Hatton", capacity:"3,000", connections:"4,832"},
  {no:7, region:"", plant:"Nallathanniya", capacity:"30", connections:"133"},
  {no:8, region:"Central East", plant:"Ragala", capacity:"800", connections:"2,305"},
  {no:9, region:"", plant:"Walapane", capacity:"1,000", connections:"2,916"},
  {no:10, region:"", plant:"Rikillagaskada", capacity:"3,600", connections:"7,836"},

  // ===== Matale District =====
  {type:"section", label:"Matale District"},
  {no:1, region:"", plant:"Dambulla", capacity:"30,000", connections:"14,060"},
  {no:2, region:"", plant:"Matale", capacity:"30,000", connections:"27,154"},
  {no:3, region:"", plant:"Pussella", capacity:"300", connections:"1,072"},
  {no:4, region:"", plant:"Naula", capacity:"1,800", connections:"5,470"},
  {no:5, region:"", plant:"Wilgamuwa", capacity:"500", connections:"1,042"},
  {no:6, region:"", plant:"Ambanganga", capacity:"18,000", connections:"9,222"},
  {no:7, region:"", plant:"Rattota", capacity:"9,000", connections:"3,957"},
  {no:8, region:"", plant:"Ukuwela", capacity:"9,000", connections:"6,170"},
  {no:9, region:"", plant:"Udathanna", capacity:"9,000", connections:"6,887"},
];


function formatDate(d){
  const day = String(d.getDate()).padStart(2,'0');
  const month = String(d.getMonth()+1).padStart(2,'0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function setDefaultDates(){
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate()+1);

  // Default time format like PDF sample
  const timeLabel = "8.00am";

  // Yellow header cells inside the table
  const h1 = document.getElementById("dtHead1");
  if(h1) h1.textContent = `${formatDate(today)} ${timeLabel}`;
}

function makeInputCell(value=""){
  const input = document.createElement('input');
  input.className = 'cell';
  input.type = 'text';
  input.value = value;
  return input;
}

function renderRows(rows){
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = "";

  rows.forEach((r) => {
    // Section header row (District)
    if(r.type === "section"){
      const tr = document.createElement('tr');
      tr.className = "section-row";

      const td = document.createElement('td');
      td.colSpan = 11;
      td.className = "section-cell";
      td.textContent = r.label;

      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    const tr = document.createElement('tr');

    // Fixed/prefilled columns
    const tdNo = document.createElement('td'); tdNo.textContent = r.no;
    const tdRegion = document.createElement('td'); tdRegion.textContent = r.region; tdRegion.classList.add('left');
    const tdPlant = document.createElement('td'); tdPlant.textContent = r.plant; tdPlant.classList.add('left');
    const tdCap = document.createElement('td'); tdCap.textContent = r.capacity;
    const tdConn = document.createElement('td');
    const connInput = makeInputCell(r.connections || "");
    connInput.classList.add("conn");
    tdConn.appendChild(connInput);

    tr.append(tdNo, tdRegion, tdPlant, tdCap, tdConn);

    // Editable columns (6 columns)
    for(let i=0;i<3;i++){
      const td = document.createElement('td');
      const inp = makeInputCell("");
      inp.classList.add("turb");
      td.appendChild(inp);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });
}

function getTableData(){
  const tbody = document.getElementById('tbody');
  const trs = Array.from(tbody.querySelectorAll('tr'));
  const data = [];

  trs.forEach(tr => {
    if(tr.classList.contains('section-row')){
      data.push({type:"section", label: tr.textContent.trim()});
      return;
    }
    const tds = tr.querySelectorAll('td');
    const editable = Array.from(tr.querySelectorAll('input.turb')).map(i => i.value);

    data.push({
      no: tds[0].textContent.trim(),
      region: tds[1].textContent.trim(),
      plant: tds[2].textContent.trim(),
      capacity: tds[3].textContent.trim(),
      connections: (tr.querySelector("input.conn")?.value || "").trim(),
      t1_raw: editable[0] || "",
      t1_treated: editable[1] || "",
      t1_rcl: editable[2] || "",
          });
  });

  return data;
}

function restoreEditableValues(data){
  const tbody = document.getElementById('tbody');
  const trs = Array.from(tbody.querySelectorAll('tr'));

  let di = 0;
  trs.forEach(tr => {
    if(tr.classList.contains('section-row')){
      di++;
      return;
    }
    const row = data[di];
    const conn = tr.querySelector("input.conn");
    if(conn) conn.value = row.connections || "";

    const inputs = tr.querySelectorAll('input.turb');
    if(!row || !inputs.length) { di++; return; }

    inputs[0].value = row.raw || "";
    inputs[1].value = row.treated || "";
    inputs[2].value = row.rcl || "";
        di++;
  });
}

function addEmptyRow(){
  const data = getTableData();
  // Find last real row number
  let lastNo = 0;
  data.forEach(d => { if(d.no) lastNo = Math.max(lastNo, parseInt(d.no,10) || 0); });

  data.push({
    no: lastNo + 1,
    region:"",
    plant:"",
    capacity:"",
    connections:"",
    t1_raw:"",
    t1_treated:"",
    t1_rcl:"",
    t2_raw:"",
    t2_treated:"",
    t2_rcl:"",
  });

  // Re-render with structure
  const renderData = data.map(d => {
    if(d.type === "section") return d;
    return { no:d.no, region:d.region, plant:d.plant, capacity:d.capacity, connections:d.connections };
  });

  renderRows(renderData);
  restoreEditableValues(data);
}

function exportCSV(){
  const data = getTableData();

  const headers = [
    "No","Region","Plant","Capacity (Cum/Day)","No of Connections",
    "Turbidity Raw","Turbidity Treated","RCL"
  ];

  const lines = [headers.join(",")];

  data.forEach(row=>{
    if(row.type === "section"){
      // keep district as a separator row in CSV
      lines.push(`"${row.label.replaceAll('"','""')}"`);
      return;
    }

    const vals = [
      row.no, row.region, row.plant, row.capacity, row.connections,
      row.t1_raw, row.t1_treated, row.t1_rcl,
      row.t2_raw, row.t2_treated, row.t2_rcl
    ].map(v => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
    });

    lines.push(vals.join(","));
  });

  const blob = new Blob([lines.join("\n")], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "flood_effect_wtp.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function resetAll(){
  if(!confirm("Reset all turbidity/RCL entries?")) return;
  renderRows(defaultRows);
}

document.addEventListener('DOMContentLoaded', ()=>{
  setDefaultDates();
  setNavDate();
  renderRows(defaultRows);
  loadCurrentIfExists();

  // Nav
  document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.addEventListener("click", ()=> switchPage(btn.dataset.page));
  });

  // Entry actions
  document.getElementById('saveBtn').addEventListener('click', ()=> saveCurrent("saved"));
  document.getElementById('submitBtn').addEventListener('click', ()=> saveCurrent("submitted"));
  document.getElementById('exportBtn')?.addEventListener('click', exportCSV);
  document.getElementById('resetBtn').addEventListener('click', resetAll);

  // Submissions actions
  document.getElementById("refreshSubmissions").addEventListener("click", renderSubmissionsList);
  document.getElementById("editSubmissionBtn").addEventListener("click", toggleEdit);
  document.getElementById("saveEditsBtn").addEventListener("click", saveEdits);
});



// -------- Local Storage (Save / Submit) --------
const STORAGE_KEY = "wtp_submissions_v1";

function todayKey(){
  // YYYY-MM-DD
  const d = new Date();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function getStore(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  }catch(e){
    return {};
  }
}

function setStore(obj){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

function saveCurrent(status="saved") {
  const data = getTableData();
  const key = todayKey();

  const payload = {
    status,
    dateKey: key,
    dateLabel: formatDate(new Date()),
    timeLabel: "8.00am",
    updatedAt: new Date().toISOString(),
    rows: data
  };

  // ✅ Save to Firestore using the dateKey as the document ID
  setDoc(doc(db, FIRESTORE_COLLECTION, key), payload)
    .then(() => {
      alert(status === "submitted"
        ? "✅ Submitted! (Saved to Firestore)"
        : "✅ Saved! (Saved to Firestore)"
      );
    })
    .catch((err) => {
      console.error("❌ Firestore save failed:", err);
      alert("❌ Failed to save to Firestore. Check console for details.");
    });
}

function loadCurrentIfExists() {
  const key = todayKey();

  // ✅ Load today's data from Firestore
  getDoc(doc(db, FIRESTORE_COLLECTION, key))
    .then((snap) => {
      if (snap.exists()) {
        renderRows(defaultRows);
        restoreEditableValues(snap.data().rows);
        console.log("✅ Loaded today's data from Firestore");
      } else {
        // No document for today → render empty default rows
        renderRows(defaultRows);
      }
    })
    .catch((err) => {
      console.error("❌ Firestore load failed:", err);
      // Fallback to default rows so the app still works
      renderRows(defaultRows);
    });
}

// -------- Nav / Page Switch --------
function switchPage(page){
  const entry = document.getElementById("page-entry");
  const subs = document.getElementById("page-submissions");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(`.nav-btn[data-page="${page}"]`)?.classList.add("active");
  if(page === "submissions"){
    entry.classList.add("hidden");
    subs.classList.remove("hidden");
    renderSubmissionsList();
  }else{
    subs.classList.add("hidden");
    entry.classList.remove("hidden");
  }
}

function setNavDate(){
  const el = document.getElementById("navDate");
  if(el) el.textContent = `Today: ${formatDate(new Date())} 8.00am`;
}

// -------- Submissions Page --------
let selectedKey = null;
let editMode = false;

function renderSubmissionsList() {
  const container = document.getElementById("submissionsContainer");
  if (!container) return;

  container.innerHTML = "Loading...";

  // ✅ Fetch all submissions from Firestore
  getDocs(collection(db, FIRESTORE_COLLECTION))
    .then((snapshot) => {
      const docsArr = [];
      snapshot.forEach((docSnap) => docsArr.push(docSnap.data()));

      docsArr.sort((a, b) => (b.dateKey || "").localeCompare(a.dateKey || ""));

      if (!docsArr.length) {
        container.innerHTML = "<div class='note'>No submissions yet.</div>";
        return;
      }

      container.innerHTML = "";
      docsArr.forEach((item) => {
        const card = document.createElement("div");
        card.className = "card";

        const meta = document.createElement("div");
        meta.className = "meta";

        const date = document.createElement("div");
        date.className = "date";
        date.textContent = item.dateLabel || item.dateKey;

        const badge = document.createElement("div");
        badge.className = "badge " + (item.status === "submitted" ? "submitted" : "saved");
        badge.textContent = item.status === "submitted" ? "SUBMITTED" : "SAVED";

        meta.append(date, badge);

        const open = document.createElement("button");
        open.className = "open";
        open.textContent = "Open";
        open.addEventListener("click", () => openSubmission(item.dateKey));

        card.append(meta, open);
        container.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("❌ Firestore list failed:", err);
      container.innerHTML = "<div class='note'>Error loading submissions.</div>";
    });
}

function openSubmission(key) {
  getDoc(doc(db, FIRESTORE_COLLECTION, key))
    .then((snap) => {
      if (!snap.exists()) {
        alert("No submission found for that date.");
        return;
      }

      const item = snap.data();
      selectedKey = key;

      document.getElementById("viewTitle").textContent =
        `${item.dateLabel || item.dateKey} ${item.timeLabel || ""} — ${(item.status || "saved").toUpperCase()}`;

      document.getElementById("editSubmissionBtn").disabled = false;
      document.getElementById("saveEditsBtn").disabled = true;

      renderHistoryTable(item.rows, false);
    })
    .catch((err) => {
      console.error("❌ Firestore open failed:", err);
      alert("❌ Failed to open submission. Check console.");
    });
}

function renderHistoryTable(rows, editable){
  const body = document.getElementById("historyBody");
  if(!body) return;
  body.innerHTML = "";

  (rows || []).forEach(r=>{
    if(r.type === "section"){
      const tr = document.createElement("tr");
      tr.className = "section-row";
      const td = document.createElement("td");
      td.colSpan = 8;
      td.className = "section-cell";
      td.textContent = r.label;
      tr.appendChild(td);
      body.appendChild(tr);
      return;
    }

    // Map fields from entry schema (t1_raw, t1_treated, t1_rcl) to history columns
    const rawVal = r.raw ?? r.t1_raw ?? "";
    const treatedVal = r.treated ?? r.t1_treated ?? "";
    const rclVal = r.rcl ?? r.t1_rcl ?? "";

    const tr = document.createElement("tr");

    const cols = [
      {key:"no", value:r.no ?? ""},
      {key:"region", value:r.region ?? "", left:true},
      {key:"plant", value:r.plant ?? "", left:true},
      {key:"capacity", value:r.capacity ?? ""},
      {key:"connections", value:r.connections ?? ""},
      {key:"raw", value:rawVal},
      {key:"treated", value:treatedVal},
      {key:"rcl", value:rclVal},
    ];

    cols.forEach((c, idx)=>{
      const td = document.createElement("td");
      if(editable && idx >= 4){ // allow edit from connections onwards
        const inp = document.createElement("input");
        inp.className = "cell";
        inp.value = c.value ?? "";
        inp.dataset.field = c.key;
        td.appendChild(inp);
      }else{
        td.textContent = c.value ?? "";
        if(c.left) td.classList.add("left");
      }
      tr.appendChild(td);
    });

    body.appendChild(tr);
  });
}

function toggleEdit(){
  if(!selectedKey) return;

  editMode = true;
  document.getElementById("editSubmissionBtn").disabled = true;
  document.getElementById("saveEditsBtn").disabled = false;

  // Load the latest doc from Firestore and render editable
  getDoc(doc(db, FIRESTORE_COLLECTION, selectedKey))
    .then((snap)=>{
      if(!snap.exists()) return;
      const item = snap.data();
      window.__currentOpenSubmission = item;
      renderHistoryTable(item.rows || [], true);
    })
    .catch((err)=>{
      console.error("❌ Firestore toggleEdit load failed:", err);
      alert("❌ Failed to load submission for editing.");
    });
}

function saveEdits(){
  if(!selectedKey) return;

  const current = window.__currentOpenSubmission;
  if(!current || !Array.isArray(current.rows)){
    alert("No submission loaded.");
    return;
  }

  // Read edited inputs from history table
  const trs = Array.from(document.querySelectorAll("#historyBody tr"));
  const newRows = [];
  let rowIndex = 0;

  trs.forEach(tr=>{
    if(tr.classList.contains("section-row")){
      // preserve section rows (they exist in current.rows in same order)
      newRows.push(current.rows[rowIndex]);
      rowIndex++;
      return;
    }

    const inputs = tr.querySelectorAll("input.cell");
    const original = current.rows[rowIndex] || {};
    const updated = {...original};

    inputs.forEach(inp=>{
      const field = inp.dataset.field;

      // Map history editable fields back to stored schema
      if(field === "raw"){
        updated.t1_raw = inp.value;
        updated.raw = inp.value; // keep compat
      }else if(field === "treated"){
        updated.t1_treated = inp.value;
        updated.treated = inp.value;
      }else if(field === "rcl"){
        updated.t1_rcl = inp.value;
        updated.rcl = inp.value;
      }else{
        updated[field] = inp.value;
      }
    });

    newRows.push(updated);
    rowIndex++;
  });

  const updatedPayload = {
    ...current,
    rows: newRows,
    updatedAt: new Date().toISOString()
  };

  setDoc(doc(db, FIRESTORE_COLLECTION, selectedKey), updatedPayload)
    .then(()=>{
      editMode = false;
      document.getElementById("editSubmissionBtn").disabled = false;
      document.getElementById("saveEditsBtn").disabled = true;
      renderHistoryTable(newRows, false);
      alert("✅ Edits saved to Firestore!");
    })
    .catch((err)=>{
      console.error("❌ Firestore saveEdits failed:", err);
      alert("❌ Failed to save edits to Firestore.");
    });
}



/* =======================
   Compare Tables Modal + Logic
   ======================= */

const openCompareBtn = document.getElementById('openCompareBtn');
const closeCompareBtn = document.getElementById('closeCompareBtn');
const closeCompareBtn2 = document.getElementById('closeCompareBtn2');
const compareModal = document.getElementById('compareModal');
const runCompareBtn = document.getElementById('runCompareBtn');
const compareDateA = document.getElementById('compareDateA');
const compareDateB = document.getElementById('compareDateB');
const compareDateC = document.getElementById('compareDateC');
const compareDateD = document.getElementById('compareDateD');
const compareResults = document.getElementById('compareResults');
const compareTitle = document.getElementById('compareTitle');
const todayStamp = document.getElementById('todayStamp');

function fmtDisplay(d){
  // display like 29.12.2025
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

async function openCompareModal(){
  compareModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  await ensureFirestoreCacheLoaded();
  // Keep date inputs empty by default. User must select dates manually.
  try{
    compareDateA.value = "";
    compareDateB.value = "";
    compareDateC.value = "";
    compareDateD.value = "";
  }catch(e){}
}

function closeCompareModal(){
  compareModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

openCompareBtn?.addEventListener('click', openCompareModal);
closeCompareBtn?.addEventListener('click', closeCompareModal);
closeCompareBtn2?.addEventListener('click', closeCompareModal);

compareModal?.addEventListener('click', (e)=>{
  if(e.target === compareModal) closeCompareModal();
});


function normalizeToDayStart(d){
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getSubmissionByISODate(iso){
  // Firestore docs use ISO dateKey (YYYY-MM-DD) as document id
  const cache = window.__firestoreSubmissionsCache || [];
  return cache.find(it => it.dateKey === iso) || null;
}

function coerceNum(v){
  if(v===null || v===undefined) return null;
  if(typeof v === "number") return isFinite(v) ? v : null;
  const s = String(v).trim();
  if(!s) return null;
  const n = Number(s.replace(/,/g,''));
  return isFinite(n) ? n : null;
}

function diffCell(a,b){
  const na = coerceNum(a);
  const nb = coerceNum(b);
  if(na===null && nb===null) return "";
  if(na===null) return `→ ${b}`;
  if(nb===null) return `${a} →`;
  const d = nb - na;
  const sign = d>0 ? "+" : "";
  return `${sign}${d.toFixed(2)}`;
}




function buildCompareTableMulti(subs){
  // subs: array of submissions (2-4) with displayDate and data.rows
  const container = document.getElementById("compareResults");
  if(!container) return;

  const normList = subs.map(s => ({
    date: s.displayDate,
    rows: (s.data?.rows || s.rows || []),
    norm: normalizeSubmissionRows((s.data?.rows || s.rows || []))
  }));

  const allDistricts = Array.from(new Set(normList.flatMap(x=>Object.keys(x.norm))));

  // Build header
  const dateHead = normList.map(x=>`<th colspan="3" class="compare-date-head">${escapeHtml(x.date)}</th>`).join("");
  const subHead = normList.map(()=>`
      <th>Turbidity<br>Level of<br>Raw Water</th>
      <th>Turbidity<br>Level of<br>Treated Water</th>
      <th>RCL value of<br>Treat(er) Water<br>at WTP</th>
  `).join("");

  let body = "";
  allDistricts.forEach((d)=>{
    body += `<tr class="compare-district"><td colspan="${5 + normList.length*3}">${escapeHtml(d)}</td></tr>`;

    // union of plant keys in this district
    const keys = Array.from(new Set(normList.flatMap(x=>Object.keys(x.norm[d]||{}))));

    keys.sort((k1,k2)=>{
      const r1 = (normList.map(x=>x.norm[d]?.[k1]).find(Boolean)) || {};
      const r2 = (normList.map(x=>x.norm[d]?.[k2]).find(Boolean)) || {};
      const n1 = parseInt(r1.no,10); const n2 = parseInt(r2.no,10);
      if(!isNaN(n1) && !isNaN(n2) && n1!==n2) return n1-n2;
      return (r1.plant||k1).localeCompare(r2.plant||k2);
    });

    keys.forEach((key)=>{
      // Base info from first available date
      const base = (normList.map(x=>x.norm[d]?.[key]).find(Boolean)) || {};
      const no = (base.no ?? "").toString();
      const region = (base.region ?? "").toString();
      const plant = (base.plant ?? "").toString();
      const cap = (base.capacity ?? "").toString();
      const conn = (base.connections ?? "").toString();

      let tds = "";
      normList.forEach(x=>{
        const r = (x.norm[d]||{})[key] || {};
        const raw = (r.turbidityRaw ?? r.raw ?? r.rawValue ?? r.turbidity_raw ?? r.turbidityLevelRaw ?? r.turbidityA ?? r.turbidity ?? "").toString();
                const treated = (r.turbidityTreated ?? r.treated ?? r.treatedValue ?? r.turbidity_treated ?? r.turbidityLevelTreated ?? r.turbidityB ?? "").toString();
                const rcl = (r.rcl ?? r.rclValue ?? r.rcl_value ?? r.rclB ?? "").toString();
        tds += `<td>${escapeHtml(raw)}</td><td>${escapeHtml(treated)}</td><td>${escapeHtml(rcl)}</td>`;
      });

      body += `
        <tr>
          <td>${escapeHtml(no)}</td>
          <td>${escapeHtml(region)}</td>
          <td>${escapeHtml(plant)}</td>
          <td>${escapeHtml(cap)}</td>
          <td>${escapeHtml(conn)}</td>
          ${tds}
        </tr>
      `;
    });
  });

  container.innerHTML = `
    <div class="compare-side-wrap">
      <table class="compare-side-table">
        <thead>
          <tr class="compare-top-header">
            <th rowspan="2" style="width:60px">No</th>
            <th rowspan="2" style="width:140px">Region</th>
            <th rowspan="2">Plant</th>
            <th rowspan="2" style="width:140px">Plant Capacity<br>(Cum/Day)</th>
            <th rowspan="2" style="width:150px">No of<br>Connections</th>
            ${dateHead}
          </tr>
          <tr class="compare-sub-header">
            ${subHead}
          </tr>
        </thead>
        <tbody>
          ${body}
        </tbody>
      </table>
    </div>
  `;
}

// Backwards compat: keep old name but call multi builder
function buildCompareTable(subA, subB){
  buildCompareTableMulti([subA, subB]);
}

function normalizeSubmissionRows(rows){
  const out = {};
  let currentDistrict = "District";
  (rows || []).forEach((r) => {
    if(!r) return;

    const isSection = (r.type === "section") || (typeof r.section === "string") || (typeof r.label === "string" && !r.no && !r.plant);
    if(isSection){
      currentDistrict = (r.section || r.label || "").trim() || currentDistrict;
      if(!out[currentDistrict]) out[currentDistrict] = {};
      return;
    }

    const district = (r.district || currentDistrict || "District").trim();
    if(!out[district]) out[district] = {};

    const plant = (r.plant ?? "").toString().trim();
    const key = (district + "|" + plant).toLowerCase();
    out[district][key] = r;
  });
  return out;
}

function escapeHtml(str){
  return (str ?? "").toString()
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}




runCompareBtn?.addEventListener('click', ()=>{
  const isoA = compareDateA.value;
  const isoB = compareDateB.value;
  const isoC = compareDateC?.value || "";
  const isoD = compareDateD?.value || "";

  if(!isoA || !isoB){
    alert("Please select at least Date A and Date B.");
    return;
  }

  const subs = [];
  const subA = getSubmissionByISODate(isoA);
  const subB = getSubmissionByISODate(isoB);

  if(!subA || !subB){
    alert("One or both selected dates do not have saved submissions. Please choose dates that have submissions.");
    return;
  }

  subA.displayDate = fmtDisplay(subA.dateObj || parseStoredKeyToDate(subA.dateKey) || new Date());
  subB.displayDate = fmtDisplay(subB.dateObj || parseStoredKeyToDate(subB.dateKey) || new Date());
  subs.push(subA, subB);

  if(isoC){
    const subC = getSubmissionByISODate(isoC);
    if(!subC){
      alert("Date C does not have a saved submission. Please choose a date that has submissions.");
      return;
    }
    subC.displayDate = fmtDisplay(subC.dateObj || parseStoredKeyToDate(subC.dateKey) || new Date());
    subs.push(subC);
  }

  if(isoD){
    const subD = getSubmissionByISODate(isoD);
    if(!subD){
      alert("Date D does not have a saved submission. Please choose a date that has submissions.");
      return;
    }
    subD.displayDate = fmtDisplay(subD.dateObj || parseStoredKeyToDate(subD.dateKey) || new Date());
    subs.push(subD);
  }

  // Remove duplicates by displayDate
  const seen = new Set();
  const uniq = [];
  subs.forEach(s=>{
    const k = s.displayDate;
    if(!seen.has(k)){ seen.add(k); uniq.push(s); }
  });

  // Sort by dateObj ascending (older->newer). Change to descending if needed.
  uniq.sort((x,y)=> (x.dateObj - y.dateObj));

  compareTitle.textContent = `Results: ${uniq.map(u=>u.displayDate).join(" vs ")}`;
  buildCompareTableMulti(uniq);
});




function parseStoredKeyToDate(val){
  if(!val) return null;
  if(val instanceof Date) return val;
  let s = String(val).trim();

  // remove storage key prefixes if present
  s = s.replace(/^WQ_SUBMISSION_/,'').replace(/^wq_submission_/i,'');
  // remove any time portion
  s = s.split('T')[0].split(' ')[0];

  // Try YYYY-MM-DD
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if(m){
    const y=+m[1], mo=+m[2]-1, d=+m[3];
    const dt=new Date(y,mo,d);
    return isNaN(dt)?null:dt;
  }

  // Try MM/DD/YYYY
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if(m){
    const mo=+m[1]-1, d=+m[2], y=+m[3];
    const dt=new Date(y,mo,d);
    return isNaN(dt)?null:dt;
  }

  // Try DD.MM.YYYY or DD-MM-YYYY or DD_MM_YYYY
  m = s.match(/^(\d{1,2})[\.\-_](\d{1,2})[\.\-_](\d{4})$/);
  if(m){
    const d=+m[1], mo=+m[2]-1, y=+m[3];
    const dt=new Date(y,mo,d);
    return isNaN(dt)?null:dt;
  }

  // As last resort, Date.parse
  const dt2 = new Date(s);
  return isNaN(dt2)?null:dt2;
}


function loadAllSubmissions(){
  // Our existing app stores submissions in localStorage.
  // We search for keys that start with "WQ_SUBMISSION_" OR any JSON list key used previously.
  const items = [];
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(!k) continue;

    // common pattern in earlier versions
    if(k.startsWith('WQ_SUBMISSION_')){
      const raw = localStorage.getItem(k);
      try{
        const data = JSON.parse(raw);
        const dateKey = k.replace('WQ_SUBMISSION_','');
        const dateObj = parseStoredKeyToDate(dateKey) || parseStoredKeyToDate(data.date) || null;
        items.push({key:k, dateKey, dateObj, data});
      }catch(err){}
    }

    // fallback: keys used by this project (saved submissions list)
    if(k === 'wq_submissions'){
      try{
        const list = JSON.parse(localStorage.getItem(k));
        if(Array.isArray(list)){
          list.forEach(entry=>{
            const dateObj = parseStoredKeyToDate(entry.date || entry.dateKey || entry.key);
            items.push({key: entry.key || entry.dateKey || entry.date, dateKey: entry.dateKey || entry.date, dateObj, data: entry});
          });
        }
      }catch(err){}
    }
  }
  
  // Also check the main STORAGE_KEY object (current app format)
  try{
    const storeObj = getStore(); // { "YYYY-MM-DD": { ...data... }, ... }
    Object.keys(storeObj||{}).forEach(dateKey=>{
      const data = storeObj[dateKey];
      const dateObj = parseStoredKeyToDate(dateKey) || parseStoredKeyToDate(data?.date) || null;
      if(dateObj){
        items.push({key:STORAGE_KEY, dateKey, dateObj, data});
      }
    });
  }catch(e){}
// Deduplicate by (dateKey + key)
  const seen = new Set();
  return items.filter(it=>{
    const id = (it.key||'')+'|'+(it.dateKey||'');
    if(seen.has(id)) return false;
    seen.add(id);
    return true;
  }).filter(it=>it.dateObj);
}

function filterSubmissions(fromDate, toDate){
  const all = loadAllSubmissions();
  const from = normalizeToDayStart(fromDate);
  const to = normalizeToDayStart(toDate);
  // inclusive range
  return all.filter(it=>{
    const day = normalizeToDayStart(it.dateObj);
    return day >= from && day <= to;
  }).sort((a,b)=>a.dateObj - b.dateObj);
}



/* (Filtering option removed) */



