import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSqsH09dhB9fkWq_THK0D3u9YCQuZ4HZM",
  authDomain: "watertreatmentplant-3b489.firebaseapp.com",
  projectId: "watertreatmentplant-3b489",
  storageBucket: "watertreatmentplant-3b489.firebasestorage.app",
  messagingSenderId: "711430875508",
  appId: "1:711430875508:web:f4045164d344d5a726e421"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const collectionName = "waterTreatmentPlants";

const tableBody = document.getElementById("plantTableBody");
const statusMessage = document.getElementById("statusMessage");
const refreshBtn = document.getElementById("refreshBtn");
const printBtn = document.getElementById("printBtn");

let plantRows = [];

const defaultPlants = [
  { rowNo: "1", district: "Kandy", region: "CN", scheme: "Akurana", plantName: "Vilana reservoir", treatmentProcess: "Chlorination only", designCapacity: "500", presentCapacity: "500" },
  { rowNo: "1", district: "Kandy", region: "CN", scheme: "Akurana", plantName: "Delgasgoda reservoir", treatmentProcess: "Chlorination only", designCapacity: "", presentCapacity: "" },
  { rowNo: "2", district: "Kandy", region: "CN", scheme: "Ankumbura", plantName: "Inalamulla T/P", treatmentProcess: "Partial Treatment", designCapacity: "350", presentCapacity: "350" },
  { rowNo: "3", district: "Kandy", region: "CN", scheme: "Galagedara", plantName: "Galagedara T/P", treatmentProcess: "Full Treatment", designCapacity: "1,200", presentCapacity: "1,200" },
  { rowNo: "4", district: "Kandy", region: "CN", scheme: "Minigamuwa", plantName: "Minigamuwa T/P", treatmentProcess: "Chlorination only", designCapacity: "50", presentCapacity: "50" },
  { rowNo: "5", district: "Kandy", region: "CN", scheme: "Harispaththuwa", plantName: "Rajapihilla B/H (Raj. Res)", treatmentProcess: "Chlorination only", designCapacity: "", presentCapacity: "" },
  { rowNo: "6", district: "Kandy", region: "CN", scheme: "Katugastota T/P (Akurana, Ampitiya, Galagedara, Hantana, Harispaththuwa, Haragama, Palapola, Hedeniya, Bokkawala)", plantName: "Katugastota T/P", treatmentProcess: "Full Treatment", designCapacity: "100,000", presentCapacity: "70,000" },
  { rowNo: "7", district: "Kandy", region: "CN", scheme: "Polgolla", plantName: "Polgolla T/P", treatmentProcess: "Full Treatment", designCapacity: "10,000", presentCapacity: "12,000" },
  { rowNo: "8", district: "Kandy", region: "CN", scheme: "Hedeniya", plantName: "Bolagala T/P", treatmentProcess: "Partial Treatment", designCapacity: "100", presentCapacity: "100" },
  { rowNo: "9", district: "Kandy", region: "CN", scheme: "Bokkawala", plantName: "Nawinapitiya res.", treatmentProcess: "Partial Treatment", designCapacity: "", presentCapacity: "" },
  { rowNo: "10", district: "Matale", region: "M", scheme: "Dambulla/Galewela", plantName: "Dambulla T/P", treatmentProcess: "Full Treatment", designCapacity: "32,000", presentCapacity: "25,500" },
  { rowNo: "11", district: "Matale", region: "M", scheme: "Matale", plantName: "Matale T/P(New)", treatmentProcess: "Full Treatment", designCapacity: "30,000", presentCapacity: "23,000" },
  { rowNo: "12", district: "Matale", region: "M", scheme: "Pussella", plantName: "Pussella T/P", treatmentProcess: "Chlorination only", designCapacity: "500", presentCapacity: "400" },
  { rowNo: "13", district: "Matale", region: "M", scheme: "Ukuwela", plantName: "Udatenna T/P (New)", treatmentProcess: "Full Treatment", designCapacity: "9,000", presentCapacity: "5,500" },
  { rowNo: "13", district: "Matale", region: "M", scheme: "Ukuwela", plantName: "Ukuwela T/P", treatmentProcess: "Full Treatment", designCapacity: "9,000", presentCapacity: "4,250" },
  { rowNo: "14", district: "Matale", region: "M", scheme: "Naula", plantName: "Naula T/P", treatmentProcess: "Full Treatment", designCapacity: "2,200", presentCapacity: "150" },
  { rowNo: "15", district: "Matale", region: "M", scheme: "Wilgamuwa", plantName: "Wilgamuwa package T/P", treatmentProcess: "Full Treatment", designCapacity: "500", presentCapacity: "500" },
  { rowNo: "16", district: "Matale", region: "M", scheme: "Ambanganga", plantName: "Rajammana T/P", treatmentProcess: "Full Treatment", designCapacity: "18,000", presentCapacity: "8,000" },
  { rowNo: "17", district: "Matale", region: "M", scheme: "Ratota", plantName: "Ratota T/P", treatmentProcess: "Full Treatment", designCapacity: "9,000", presentCapacity: "3,400" },
  { rowNo: "18", district: "Kandy", region: "CS", scheme: "Gampola", plantName: "Para Deka T/P", treatmentProcess: "Full Treatment", designCapacity: "6,000", presentCapacity: "6,000" },
  { rowNo: "19", district: "Kandy", region: "CS", scheme: "Darty", plantName: "Darty reservoir", treatmentProcess: "Partial Treatment", designCapacity: "200", presentCapacity: "130" },
  { rowNo: "20", district: "Kandy", region: "CS", scheme: "Doluwa", plantName: "Doluwa T/P", treatmentProcess: "Partial Treatment", designCapacity: "600", presentCapacity: "600" },
  { rowNo: "21", district: "Kandy", region: "CS", scheme: "Pussellawa", plantName: "Pussellawa T/P", treatmentProcess: "Partial Treatment", designCapacity: "1,200", presentCapacity: "1,200" },
  { rowNo: "22", district: "Kandy", region: "CS", scheme: "Ulapane", plantName: "Ulapane T/P", treatmentProcess: "Full Treatment", designCapacity: "8,000", presentCapacity: "8,500" },
  { rowNo: "23", district: "Kandy", region: "CS", scheme: "Angammana / Naramwita (Gampolawatta)", plantName: "Angammana T/P", treatmentProcess: "Tube well", designCapacity: "", presentCapacity: "" },
  { rowNo: "24", district: "Kandy", region: "CS", scheme: "Hantana", plantName: "Hantana T/P", treatmentProcess: "Partial Treatment", designCapacity: "720", presentCapacity: "900" },
  { rowNo: "25", district: "Kandy", region: "CS", scheme: "Udu Yatinuwara", plantName: "Nilambe T/P", treatmentProcess: "Full Treatment", designCapacity: "13,400", presentCapacity: "16,000" },
  { rowNo: "25", district: "Kandy", region: "CS", scheme: "Udu Yatinuwara", plantName: "Meewathura T/P", treatmentProcess: "Full Treatment", designCapacity: "32,000", presentCapacity: "30,000" },
  { rowNo: "26", district: "Kandy", region: "CS", scheme: "Welamboda", plantName: "Elpitiya T/P", treatmentProcess: "Full Treatment", designCapacity: "7,500", presentCapacity: "4,000" },
  { rowNo: "27", district: "Kandy", region: "CS", scheme: "University", plantName: "University T/P", treatmentProcess: "Full Treatment", designCapacity: "6,500", presentCapacity: "5,500" },
  { rowNo: "28", district: "N'Eliya", region: "CS", scheme: "Ginigathena", plantName: "Ginigathena T/P", treatmentProcess: "Full Treatment", designCapacity: "3,600", presentCapacity: "1,300" },
  { rowNo: "29", district: "N'Eliya", region: "CS", scheme: "Poondalu Oya", plantName: "Poondalu Oya T/P", treatmentProcess: "Partial Treatment", designCapacity: "1,000", presentCapacity: "700" },
  { rowNo: "30", district: "N'Eliya", region: "CS", scheme: "Hatton", plantName: "High Level T/P", treatmentProcess: "Full Treatment", designCapacity: "2,000", presentCapacity: "2,250" },
  { rowNo: "30", district: "N'Eliya", region: "CS", scheme: "Hatton", plantName: "Low Level T/P", treatmentProcess: "Full Treatment", designCapacity: "2,000", presentCapacity: "1,400" },
  { rowNo: "31", district: "N'Eliya", region: "CS", scheme: "Kotagala", plantName: "Kotagala T/P", treatmentProcess: "Partial Treatment", designCapacity: "800", presentCapacity: "800" },
  { rowNo: "32", district: "N'Eliya", region: "CS", scheme: "Maskeliya", plantName: "Maskeliya T/P", treatmentProcess: "Full Treatment", designCapacity: "3,000", presentCapacity: "1,000" },
  { rowNo: "33", district: "N'Eliya", region: "CS", scheme: "Nalathanniya", plantName: "Nalathanniya Res.", treatmentProcess: "Chlorination only", designCapacity: "200", presentCapacity: "200" },
  { rowNo: "34", district: "N'Eliya", region: "CS", scheme: "Sri Pada", plantName: "Sri Pada", treatmentProcess: "Chlorination only", designCapacity: "100", presentCapacity: "100" },
  { rowNo: "35", district: "N'Eliya", region: "CS", scheme: "Thalawakelle", plantName: "Thalawakelle Res.", treatmentProcess: "Full Treatment", designCapacity: "2,500", presentCapacity: "1,650" },
  { rowNo: "36", district: "Kandy", region: "CS", scheme: "Nawalapitiya", plantName: "Nawalapitiya T/P", treatmentProcess: "Partial Treatment", designCapacity: "4,500", presentCapacity: "4,500" },
  { rowNo: "37", district: "N'Eliya", region: "CS", scheme: "Meepilimana", plantName: "Meepilimana", treatmentProcess: "Full Treatment", designCapacity: "750", presentCapacity: "500" },
  { rowNo: "38", district: "Kandy", region: "CE", scheme: "Kundasale", plantName: "Arattana T/P", treatmentProcess: "Full Treatment", designCapacity: "14,250", presentCapacity: "14,250" },
  { rowNo: "38", district: "Kandy", region: "CE", scheme: "Kundasale", plantName: "Balagolla T/P", treatmentProcess: "Full Treatment", designCapacity: "10,500", presentCapacity: "10,500" },
  { rowNo: "39", district: "Kandy", region: "CE", scheme: "Haragama", plantName: "Haragama T/P", treatmentProcess: "Full Treatment", designCapacity: "3,750", presentCapacity: "3,750" },
  { rowNo: "40", district: "Kandy", region: "CE", scheme: "Marassana", plantName: "Marassana T/P", treatmentProcess: "Full Treatment", designCapacity: "3,500", presentCapacity: "3,500" },
  { rowNo: "41", district: "Kandy", region: "CE", scheme: "Medadumbara", plantName: "Medadumbara T/P", treatmentProcess: "Full Treatment", designCapacity: "3,000", presentCapacity: "3,000" },
  { rowNo: "42", district: "N'Eliya", region: "CE", scheme: "Ragala", plantName: "Ragala T/P", treatmentProcess: "Full Treatment", designCapacity: "1,500", presentCapacity: "750" },
  { rowNo: "43", district: "N'Eliya", region: "CE", scheme: "Rikillagaskada", plantName: "Rikillagaskada T/P", treatmentProcess: "Full Treatment", designCapacity: "4,500", presentCapacity: "3,000" },
  { rowNo: "44", district: "N'Eliya", region: "CE", scheme: "Walapane", plantName: "Walapane T/P", treatmentProcess: "Full Treatment", designCapacity: "3,500", presentCapacity: "1,000" }
].map((item, index) => ({
  ...item,
  sortOrder: index + 1,
  createdAt: null,
  updatedAt: null
}));

function setStatus(message, type = "normal") {
  statusMessage.textContent = message;
  statusMessage.className = "status-message";

  if (type === "success") statusMessage.classList.add("text-success");
  if (type === "error") statusMessage.classList.add("text-danger");
  if (type === "warning") statusMessage.classList.add("text-warning");
}

function showLoading() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="9" class="text-center py-4">Loading data...</td>
    </tr>
  `;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function seedDefaultData() {
  const batch = writeBatch(db);

  defaultPlants.forEach((plant, index) => {
    const docId = `plant-${String(index + 1).padStart(3, "0")}`;
    const docRef = doc(db, collectionName, docId);
    batch.set(docRef, {
      ...plant,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  await batch.commit();
}

async function loadPlants() {
  try {
    showLoading();
    setStatus("Loading data from Firestore...");

    const q = query(collection(db, collectionName), orderBy("sortOrder", "asc"));
    let snapshot = await getDocs(q);

    if (snapshot.empty) {
      setStatus("No data found. Adding default table data...", "warning");
      await seedDefaultData();
      snapshot = await getDocs(q);
    }

    plantRows = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    renderTable();
    setStatus("Connected to Firestore. Data loaded successfully.", "success");
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-danger py-4">
          Firestore connection failed. Check your Firestore rules and internet connection.
        </td>
      </tr>
    `;
    setStatus(`Error: ${error.message}`, "error");
  }
}

function renderTable() {
  if (!plantRows.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-4">No records found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = plantRows.map((plant, index) => `
    <tr data-index="${index}">
      <td>${escapeHTML(plant.rowNo)}</td>
      <td>${escapeHTML(plant.district)}</td>
      <td>${escapeHTML(plant.region)}</td>
      <td>${escapeHTML(plant.scheme)}</td>
      <td>${escapeHTML(plant.plantName)}</td>
      <td>${escapeHTML(plant.treatmentProcess)}</td>
      <td>${escapeHTML(plant.designCapacity)}</td>
      <td>${escapeHTML(plant.presentCapacity)}</td>
      <td class="no-print">
        <button class="btn btn-sm btn-outline-dark btn-action edit-btn" data-index="${index}">Edit</button>
      </td>
    </tr>
  `).join("");
}

function renderEditRow(index) {
  const plant = plantRows[index];
  const row = tableBody.querySelector(`tr[data-index="${index}"]`);

  row.innerHTML = `
    <td><input class="table-input capacity-input" data-field="rowNo" value="${escapeHTML(plant.rowNo)}"></td>
    <td><input class="table-input" data-field="district" value="${escapeHTML(plant.district)}"></td>
    <td><input class="table-input capacity-input" data-field="region" value="${escapeHTML(plant.region)}"></td>
    <td><textarea class="table-input" data-field="scheme" rows="2">${escapeHTML(plant.scheme)}</textarea></td>
    <td><textarea class="table-input" data-field="plantName" rows="2">${escapeHTML(plant.plantName)}</textarea></td>
    <td>
      <select class="table-select" data-field="treatmentProcess">
        ${["Full Treatment", "Partial Treatment", "Chlorination only", "Tube well"].map(option => `
          <option value="${option}" ${plant.treatmentProcess === option ? "selected" : ""}>${option}</option>
        `).join("")}
      </select>
    </td>
    <td><input class="table-input capacity-input" data-field="designCapacity" value="${escapeHTML(plant.designCapacity)}"></td>
    <td><input class="table-input capacity-input" data-field="presentCapacity" value="${escapeHTML(plant.presentCapacity)}"></td>
    <td class="no-print">
      <button class="btn btn-sm btn-dark btn-action save-btn" data-index="${index}">Save</button>
    </td>
  `;
}

async function saveRow(index) {
  const plant = plantRows[index];
  const row = tableBody.querySelector(`tr[data-index="${index}"]`);
  const fields = row.querySelectorAll("[data-field]");

  const updatedPlant = {};
  fields.forEach((field) => {
    updatedPlant[field.dataset.field] = field.value.trim();
  });

  try {
    setStatus("Saving changes to Firestore...");

    const docRef = doc(db, collectionName, plant.id);
    await updateDoc(docRef, {
      ...updatedPlant,
      updatedAt: serverTimestamp()
    });

    plantRows[index] = {
      ...plant,
      ...updatedPlant
    };

    renderTable();
    setStatus("Saved successfully to Firestore.", "success");
  } catch (error) {
    console.error(error);
    setStatus(`Save failed: ${error.message}`, "error");
  }
}

tableBody.addEventListener("click", (event) => {
  const editBtn = event.target.closest(".edit-btn");
  const saveBtn = event.target.closest(".save-btn");

  if (editBtn) {
    const index = Number(editBtn.dataset.index);
    renderEditRow(index);
  }

  if (saveBtn) {
    const index = Number(saveBtn.dataset.index);
    saveRow(index);
  }
});

refreshBtn.addEventListener("click", loadPlants);
printBtn.addEventListener("click", () => window.print());

loadPlants();
