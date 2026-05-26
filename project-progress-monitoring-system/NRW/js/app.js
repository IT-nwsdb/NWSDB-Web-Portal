import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcHYWkrppK8LJyQN4k7JaHp_2hnKutK6s",
  authDomain: "nrw-budget-management.firebaseapp.com",
  projectId: "nrw-budget-management",
  storageBucket: "nrw-budget-management.firebasestorage.app",
  messagingSenderId: "281222022745",
  appId: "1:281222022745:web:a1c92f28eca5408a029348"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION_NAME = "nrwBudgetRecords";

const fields = [
  "serialNo",
  "contractNo",
  "responsible",
  "contractName",
  "awardedAmount",
  "contractor",
  "contractPeriod",
  "commencementDate",
  "completionDate",
  "allocation2026",
  "expenditure2026",
  "billsInFinance",
  "billsInHand",
  "remarks"
];

const moneyFields = ["awardedAmount"];

let records = [];
let isBusy = false;

const budgetForm = document.getElementById("budgetForm");
const tableBody = document.getElementById("tableBody");
const editIndexInput = document.getElementById("editIndex");
const submitBtn = document.getElementById("submitBtn");
const clearFormBtn = document.getElementById("clearFormBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const connectionStatus = document.getElementById("connectionStatus");

function setConnectionStatus(text, type = "light") {
  connectionStatus.textContent = text;
  connectionStatus.className = `badge rounded-pill text-bg-${type}`;
}

function setBusy(status) {
  isBusy = status;
  submitBtn.disabled = status;
  clearAllBtn.disabled = status;
  clearFormBtn.disabled = status;
}

function getInputValue(field) {
  return document.getElementById(field).value.trim();
}

function setInputValue(field, value) {
  document.getElementById(field).value = value ?? "";
}

function cleanAmount(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
}

function cleanFlexibleAmount(value) {
  const cleanedValue = String(value || "")
    .replace(/rs\.?/gi, "")
    .replace(/lkr/gi, "")
    .replace(/,/g, "")
    .trim();

  if (!cleanedValue || !/^[0-9]+(\.[0-9]+)?$/.test(cleanedValue)) return 0;

  const numberValue = Number(cleanedValue);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
}

function formatMoney(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue === 0) return "";
  return numberValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function removeInternalFields(record) {
  const cleanRecord = {};
  fields.forEach((field) => {
    cleanRecord[field] = record[field] ?? "";
  });

  moneyFields.forEach((field) => {
    cleanRecord[field] = cleanAmount(cleanRecord[field]);
  });

  return cleanRecord;
}

function getFormData() {
  const record = {};

  fields.forEach((field) => {
    record[field] = getInputValue(field);
  });

  moneyFields.forEach((field) => {
    record[field] = cleanAmount(record[field]);
  });

  return record;
}

function fillForm(record, index) {
  fields.forEach((field) => {
    setInputValue(field, record[field]);
  });

  editIndexInput.value = index;
  submitBtn.textContent = "Update Row";
  submitBtn.classList.remove("btn-primary");
  submitBtn.classList.add("btn-warning");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  budgetForm.reset();
  editIndexInput.value = "";
  submitBtn.textContent = "Add Row";
  submitBtn.classList.remove("btn-warning");
  submitBtn.classList.add("btn-primary");
}

function getStatusBadge(record) {
  if (record._saving) {
    return '<span class="badge text-bg-warning status-pill">Saving...</span>';
  }

  if (record.id) {
    return '<span class="badge text-bg-success status-pill">Saved</span>';
  }

  return '<span class="badge text-bg-secondary status-pill">Local</span>';
}

function renderTable() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  tableBody.innerHTML = "";

  const filteredRecords = records
    .map((record, originalIndex) => ({ record, originalIndex }))
    .filter(({ record }) => {
      if (!searchTerm) return true;
      return Object.values(removeInternalFields(record)).join(" ").toLowerCase().includes(searchTerm);
    });

  filteredRecords.forEach(({ record, originalIndex }) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHtml(record.serialNo)}</td>
      <td>${escapeHtml(record.contractNo)}</td>
      <td>${escapeHtml(record.responsible)}</td>
      <td>${escapeHtml(record.contractName)}</td>
      <td class="text-end">${formatMoney(record.awardedAmount)}</td>
      <td>${escapeHtml(record.contractor)}</td>
      <td>${escapeHtml(record.contractPeriod)}</td>
      <td>${escapeHtml(record.commencementDate)}</td>
      <td>${escapeHtml(record.completionDate)}</td>
      <td>${escapeHtml(record.allocation2026)}</td>
      <td>${escapeHtml(record.expenditure2026)}</td>
      <td>${escapeHtml(record.billsInFinance)}</td>
      <td>${escapeHtml(record.billsInHand)}</td>
      <td>${escapeHtml(record.remarks)}</td>
      <td class="text-center">${getStatusBadge(record)}</td>
      <td>
        <div class="action-btns">
          <button type="button" class="btn btn-sm btn-warning" data-action="edit" data-index="${originalIndex}">Edit</button>
          <button type="button" class="btn btn-sm btn-danger" data-action="delete" data-index="${originalIndex}">Delete</button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });

  emptyState.classList.toggle("d-none", filteredRecords.length > 0);
  updateSummary();
}

function updateSummary() {
  const totalAwarded = records.reduce((sum, item) => sum + cleanAmount(item.awardedAmount), 0);
  const totalAllocation = records.reduce((sum, item) => sum + cleanFlexibleAmount(item.allocation2026), 0);
  const totalExpenditure = records.reduce((sum, item) => sum + cleanFlexibleAmount(item.expenditure2026), 0);

  document.getElementById("totalRecords").textContent = records.length;
  document.getElementById("totalAwarded").textContent = formatMoney(totalAwarded) || "0.00";
  document.getElementById("totalAllocation").textContent = formatMoney(totalAllocation) || "0.00";
  document.getElementById("totalExpenditure").textContent = formatMoney(totalExpenditure) || "0.00";
}

async function loadFromFirestore() {
  setBusy(true);
  setConnectionStatus("Connecting...", "light");

  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));

    records = snapshot.docs.map((documentSnapshot) => ({
      id: documentSnapshot.id,
      ...removeInternalFields(documentSnapshot.data()),
      _saving: false
    }));

    records.sort((a, b) => Number(a.serialNo || 0) - Number(b.serialNo || 0));
    setConnectionStatus("Firebase Connected", "success");
    renderTable();
  } catch (error) {
    console.error("Firestore load error:", error);
    setConnectionStatus("Firebase Error", "danger");
    alert("Firebase connection failed. Please check Firestore rules and project configuration.");
  } finally {
    setBusy(false);
  }
}

async function addRecordToFirestore(record) {
  if (isBusy) return;

  setBusy(true);
  setConnectionStatus("Saving New Row...", "warning");

  const tempRecord = { ...record, id: null, _saving: true };
  records.push(tempRecord);
  renderTable();

  try {
    const newDoc = await addDoc(collection(db, COLLECTION_NAME), {
      ...removeInternalFields(record),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    tempRecord.id = newDoc.id;
    tempRecord._saving = false;
    setConnectionStatus("Auto Saved", "success");
    renderTable();
    resetForm();
  } catch (error) {
    console.error("Firestore add error:", error);
    records = records.filter((item) => item !== tempRecord);
    setConnectionStatus("Save Failed", "danger");
    renderTable();
    alert("Row was not saved. Please check Firestore rules and internet connection.");
  } finally {
    setBusy(false);
  }
}

async function updateRecordInFirestore(index, record) {
  if (isBusy) return;

  const existingRecord = records[index];
  if (!existingRecord) return;

  setBusy(true);
  setConnectionStatus("Updating Row...", "warning");

  try {
    let recordId = existingRecord.id;

    if (recordId) {
      await updateDoc(doc(db, COLLECTION_NAME, recordId), {
        ...removeInternalFields(record),
        updatedAt: serverTimestamp()
      });
    } else {
      const newDoc = await addDoc(collection(db, COLLECTION_NAME), {
        ...removeInternalFields(record),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      recordId = newDoc.id;
    }

    records[index] = {
      ...record,
      id: recordId,
      _saving: false
    };

    setConnectionStatus("Auto Saved", "success");
    renderTable();
    resetForm();
  } catch (error) {
    console.error("Firestore update error:", error);
    setConnectionStatus("Update Failed", "danger");
    alert("Update failed. Please check Firestore rules and internet connection.");
  } finally {
    setBusy(false);
  }
}

function editRecord(index) {
  const record = records[index];
  if (!record) return;
  fillForm(record, index);
}

async function deleteRecord(index) {
  if (isBusy) return;

  const record = records[index];
  if (!record) return;

  const confirmed = confirm(`Are you sure you want to delete Contract No: ${record.contractNo || "this row"}? This will delete it from Firebase immediately.`);
  if (!confirmed) return;

  setBusy(true);
  setConnectionStatus("Deleting Row...", "warning");

  try {
    if (record.id) {
      await deleteDoc(doc(db, COLLECTION_NAME, record.id));
    }

    records.splice(index, 1);
    renderTable();
    resetForm();
    setConnectionStatus("Deleted from Firebase", "success");
  } catch (error) {
    console.error("Firestore delete error:", error);
    setConnectionStatus("Delete Failed", "danger");
    alert("Delete failed. Please check Firestore rules and internet connection.");
  } finally {
    setBusy(false);
  }
}

async function clearAllRecords() {
  if (isBusy) return;

  const confirmed = confirm("Are you sure you want to clear all records from the table and Firebase? This action cannot be undone.");
  if (!confirmed) return;

  setBusy(true);
  setConnectionStatus("Clearing...", "warning");

  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));

    for (const documentSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, COLLECTION_NAME, documentSnapshot.id));
    }

    records = [];
    renderTable();
    resetForm();
    setConnectionStatus("All Records Cleared", "success");
    alert("All records cleared successfully from Firebase.");
  } catch (error) {
    console.error("Firestore clear error:", error);
    setConnectionStatus("Clear Failed", "danger");
    alert("Clear failed. Please check Firestore rules and internet connection.");
  } finally {
    setBusy(false);
  }
}

budgetForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const record = getFormData();
  const editIndex = editIndexInput.value;

  if (!record.serialNo || !record.contractNo || !record.contractName) {
    alert("Please fill Serial No, Contract No, and Name of Contract.");
    return;
  }

  if (editIndex === "") {
    await addRecordToFirestore(record);
  } else {
    await updateRecordInFirestore(Number(editIndex), record);
  }
});

clearFormBtn.addEventListener("click", resetForm);
clearAllBtn.addEventListener("click", clearAllRecords);
searchInput.addEventListener("input", renderTable);

tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;

  if (action === "edit") editRecord(index);
  if (action === "delete") deleteRecord(index);
});

loadFromFirestore();
