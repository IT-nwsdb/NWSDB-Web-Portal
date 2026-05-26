// === Firebase (Firestore) setup ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  deleteDoc
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection name in Firestore (you can change this if you want)
const FIRESTORE_COLLECTION = "wtp_submissions";

// === Historical seed data (imported from Excel) ===
const HISTORICAL_SEED = {"14.01.2026": {"status": "submitted", "dateKey": "14.01.2026", "dateLabel": "14.01.2026", "timeLabel": "8.00am", "updatedAt": "2026-01-16T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "7.3", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "5.99", "t1_treated": "0.32", "t1_rcl": "0.8", "t1_ph": "6.75"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "7.3", "t1_treated": "0.63", "t1_rcl": "0.8", "t1_ph": "6.63"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "over to 100", "t1_treated": "2.03", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "15.1", "t1_treated": "0.216", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "6", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.43", "t1_treated": "0.72", "t1_rcl": "0.8", "t1_ph": "6.9"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.85", "t1_treated": "1.32", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.45", "t1_treated": "1.42", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.43", "t1_treated": "0.51", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "16.6", "t1_treated": "1.59", "t1_rcl": "1", "t1_ph": "7.83"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "10.7", "t1_treated": "0.637", "t1_rcl": "1", "t1_ph": "7.21"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.43", "t1_treated": "0.27", "t1_rcl": "1", "t1_ph": "7.24"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "12.5", "t1_treated": "0.65", "t1_rcl": "1", "t1_ph": "6.91"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "Intake off", "t1_treated": "0.35", "t1_rcl": "1", "t1_ph": ""}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "1", "t1_ph": "-"}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "15.2", "t1_treated": "0.08", "t1_rcl": "0.8", "t1_ph": "7.26"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "54.2", "t1_treated": "2.14", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "258594", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.56", "t1_treated": "0.74", "t1_rcl": "0.9", "t1_ph": "6.63"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.74", "t1_treated": "0.15", "t1_rcl": "0.9", "t1_ph": "7.19"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.75", "t1_treated": "0.83", "t1_rcl": "0.6", "t1_ph": "6.72"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.1", "t1_treated": "0.73", "t1_rcl": "0.6", "t1_ph": "6.41"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "3.84", "t1_treated": "0.2", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.7", "t1_treated": "1", "t1_rcl": "0.8", "t1_ph": "6.9"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "0.8", "t1_treated": "0.6", "t1_rcl": "0.9", "t1_ph": "7.21"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "20.6", "t1_treated": "0.3", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "3.55", "t1_treated": "0.38", "t1_rcl": "0.9", "t1_ph": "6.81"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "21.1", "t1_treated": "0.44", "t1_rcl": "1", "t1_ph": "7.92"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "77", "t1_treated": "0.12", "t1_rcl": "1", "t1_ph": "7.03"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "8", "t1_treated": "0.5", "t1_rcl": "1", "t1_ph": "7"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "15.26", "t1_treated": "0.48", "t1_rcl": "0.8", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "-", "t1_ph": "-"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "83.9", "t1_treated": "0.13", "t1_rcl": "1.01", "t1_ph": "7.68"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.71", "t1_treated": "0.17", "t1_rcl": "0.84", "t1_ph": "7.03"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "14.91", "t1_treated": "0.16", "t1_rcl": "0.92", "t1_ph": "6.97"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "19.2", "t1_treated": "0.14", "t1_rcl": "1.21", "t1_ph": "7.09"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "15.01.2026": {"status": "submitted", "dateKey": "15.01.2026", "dateLabel": "15.01.2026", "timeLabel": "8.00am", "updatedAt": "2026-01-16T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "7.8", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "7.69", "t1_treated": "0.35", "t1_rcl": "0.8", "t1_ph": "6.7"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "7.08", "t1_treated": "0.74", "t1_rcl": "0.9", "t1_ph": "6.13"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "21.54", "t1_treated": "1.01", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "5.84", "t1_treated": "0.174", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "6", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "8.14", "t1_treated": "0.49", "t1_rcl": "0.8", "t1_ph": "6.88"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "7.61", "t1_treated": "1.22", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.45", "t1_treated": "1.42", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.42", "t1_treated": "0.58", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "7.54", "t1_treated": "0.23", "t1_rcl": "0.9", "t1_ph": "7.63"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "11.9", "t1_treated": "0.77", "t1_rcl": "", "t1_ph": ""}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.42", "t1_treated": "0.28", "t1_rcl": "1", "t1_ph": "7.39"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "9.3", "t1_treated": "0.4", "t1_rcl": "1", "t1_ph": "6.99"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "11.6", "t1_treated": "0.35", "t1_rcl": "1", "t1_ph": "7"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "1", "t1_ph": "-"}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "21", "t1_treated": "0.07", "t1_rcl": "0.8", "t1_ph": "7.29"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "16.5", "t1_treated": "2.21", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "258594", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.46", "t1_treated": "0.71", "t1_rcl": "0.9", "t1_ph": "6.72"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "10.8", "t1_treated": "0.14", "t1_rcl": "0.9", "t1_ph": "7.16"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.59", "t1_treated": "0.75", "t1_rcl": "0.6", "t1_ph": "6.78"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.12", "t1_treated": "0.71", "t1_rcl": "0.6", "t1_ph": "6.2"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "3.86", "t1_treated": "0.15", "t1_rcl": "0.5", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.65", "t1_treated": "0.88", "t1_rcl": "0.8", "t1_ph": "6.7"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "0.74", "t1_treated": "0.54", "t1_rcl": "1", "t1_ph": "7.23"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "17.7", "t1_treated": "0.18", "t1_rcl": "1", "t1_ph": "7.63"}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.38", "t1_treated": "0.12", "t1_rcl": "0.9", "t1_ph": "7.08"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "23.4", "t1_treated": "0.41", "t1_rcl": "1", "t1_ph": "80.7"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "54.6", "t1_treated": "0.12", "t1_rcl": "1.01", "t1_ph": "6.98"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "9", "t1_treated": "0.5", "t1_rcl": "1", "t1_ph": "7"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "57.9", "t1_treated": "0.12", "t1_rcl": "1.2", "t1_ph": "7.54"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.76", "t1_treated": "0.16", "t1_rcl": "0.89", "t1_ph": "7.04"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "13.7", "t1_treated": "0.15", "t1_rcl": "0.96", "t1_ph": "7.02"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "23.4", "t1_treated": "0.14", "t1_rcl": "1.22", "t1_ph": "7.02"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "29.01.2026": {"status": "submitted", "dateKey": "29.01.2026", "dateLabel": "29.01.2026", "timeLabel": "8.00am", "updatedAt": "2026-01-29T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "4.6", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "3.5", "t1_treated": "0.3", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "9.4", "t1_treated": "0.5", "t1_rcl": ".9.9", "t1_ph": "6.4"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "5.93", "t1_treated": "0.86", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "6", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "4.07", "t1_treated": "0.108", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "6.62", "t1_treated": "0.39", "t1_rcl": "6.83", "t1_ph": "0.8"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "7.7", "t1_treated": "1.17", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "5.21", "t1_treated": "1.41", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "1.43", "t1_treated": "0.51", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "17.3", "t1_treated": "0.556", "t1_rcl": "1.2", "t1_ph": "7.43"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "0.4", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "7.18"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "67.3", "t1_treated": "0.71", "t1_rcl": "1", "t1_ph": "6.75"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "12.6", "t1_treated": "0.14", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "10.2", "t1_treated": "0.09", "t1_rcl": "0.8", "t1_ph": "7.23"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "7.3", "t1_treated": "1.91", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "258594", "t1_raw": "4.95", "t1_treated": "0.197", "t1_rcl": "1", "t1_ph": "7.63"}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.67", "t1_treated": "0.62", "t1_rcl": "0.9", "t1_ph": "6.65"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "10.1", "t1_treated": "0.12", "t1_rcl": "0.9", "t1_ph": "7.23"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "1.82", "t1_treated": "0.95", "t1_rcl": "0.6", "t1_ph": "6.72"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.21", "t1_treated": "0.9", "t1_rcl": "0.6", "t1_ph": "6.31"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "5.33", "t1_treated": "0.26", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.89", "t1_treated": "1.1", "t1_rcl": "0.8", "t1_ph": "6.9"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "6.2", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "32.3", "t1_treated": "0.26", "t1_rcl": "1", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "0.08", "t1_treated": "0.7", "t1_rcl": "1", "t1_ph": "6.89"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "9", "t1_treated": "0.9", "t1_rcl": "1.1", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "9.59", "t1_treated": "0.37", "t1_rcl": "1", "t1_ph": "7.56"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "18.6", "t1_treated": "0.1", "t1_rcl": "1.01", "t1_ph": "7"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "9", "t1_treated": "0.5", "t1_rcl": "1", "t1_ph": "7"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "4.11", "t1_treated": "0.471", "t1_rcl": "0.8", "t1_ph": "7.5"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "26.2", "t1_treated": "0.73", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "23.9", "t1_treated": "0.11", "t1_rcl": "0.81", "t1_ph": "7.42"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "30.01.2026": {"status": "submitted", "dateKey": "30.01.2026", "dateLabel": "30.01.2026", "timeLabel": "8.00am", "updatedAt": "2026-01-30T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "4.8", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "3.5", "t1_treated": "0.3", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "10", "t1_treated": "0.45", "t1_rcl": "0.9", "t1_ph": "6.4"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "9.04", "t1_treated": "1.05", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "6", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "5.09", "t1_treated": "0.122", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "7.31", "t1_treated": "0.62", "t1_rcl": "0.8", "t1_ph": "6.8"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "7.7", "t1_treated": "1.18", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "7.7", "t1_treated": "1.35", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "1.49", "t1_treated": "0.54", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "7.64", "t1_treated": "0.54", "t1_rcl": "1", "t1_ph": "7.61"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "16.2", "t1_treated": "0.554", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "0.5", "t1_treated": "0.28", "t1_rcl": "1", "t1_ph": "7.12"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "16.4", "t1_treated": "0.17", "t1_rcl": "1", "t1_ph": "7.4"}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "9.85", "t1_treated": "0.08", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "10.3", "t1_treated": "2.55", "t1_rcl": "1.2", "t1_ph": "7"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "258594", "t1_raw": "3.25", "t1_treated": "0.167", "t1_rcl": "1", "t1_ph": "7.32"}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.56", "t1_treated": "0.52", "t1_rcl": "0.9", "t1_ph": "6.55"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "9.66", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "7.23"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "1.69", "t1_treated": "0.86", "t1_rcl": "0.6", "t1_ph": "6.63"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1", "t1_treated": "0.81", "t1_rcl": "0.6", "t1_ph": "6.52"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "5.85", "t1_treated": "0.27", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.51", "t1_treated": "1.045", "t1_rcl": "0.75", "t1_ph": "6.81"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "", "t1_treated": "21.1", "t1_rcl": "0.37", "t1_ph": "0.9"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "25", "t1_treated": "0.24", "t1_rcl": "1", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "1.45", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "6.99"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "10", "t1_treated": "0.9", "t1_rcl": "1.1", "t1_ph": "7.01"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "7.83", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.49"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "18.6", "t1_treated": "0.1", "t1_rcl": "1.01", "t1_ph": "7"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "2.22", "t1_treated": "129", "t1_rcl": "1.3", "t1_ph": "6.1"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.1", "t1_treated": "0.42", "t1_rcl": "0.8", "t1_ph": "7.4"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "32.5", "t1_treated": "1.61", "t1_rcl": "1.2", "t1_ph": "7.4"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "25.7", "t1_treated": "0.11", "t1_rcl": "0.92", "t1_ph": "7.44"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "31.01.2026": {"status": "submitted", "dateKey": "31.01.2026", "dateLabel": "31.01.2026", "timeLabel": "8.00am", "updatedAt": "2026-01-31T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "4.9", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "10.44", "t1_treated": "0.26", "t1_rcl": "0.8", "t1_ph": "6.6"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "7.56", "t1_treated": "1.1", "t1_rcl": "0.9", "t1_ph": "6.38"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "16.54", "t1_treated": "1.15", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "6", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "55.7", "t1_treated": "0.114", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "7.15", "t1_treated": "0.68", "t1_rcl": "0.9", "t1_ph": "6.89"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "19.5", "t1_treated": "1.12", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "17.6", "t1_treated": "1.32", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "1.68", "t1_treated": "0.67", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "7.11", "t1_treated": "0.714", "t1_rcl": "1", "t1_ph": "7.23"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "0.42", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "7.11"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "86.2", "t1_treated": "0.62", "t1_rcl": "1", "t1_ph": "6.5"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "10.7", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "9.8", "t1_treated": "0.09", "t1_rcl": "0.8", "t1_ph": "7.21"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "11.7", "t1_treated": "2.27", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "258594", "t1_raw": "7.87", "t1_treated": "0.47", "t1_rcl": "1", "t1_ph": "7.52"}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.19", "t1_treated": "0.87", "t1_rcl": "0.9", "t1_ph": "6.68"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "9.24", "t1_treated": "0.09", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "2.08", "t1_treated": "1.09", "t1_rcl": "0.8", "t1_ph": "6.64"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.2", "t1_treated": "0.9", "t1_rcl": "0.6", "t1_ph": "6.1"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "2.92", "t1_treated": "0.22", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "2.14", "t1_treated": "1.04", "t1_rcl": "0.8", "t1_ph": "6.81"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "7.41", "t1_treated": "3.47", "t1_rcl": "0.61", "t1_ph": "0.9"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "66.2", "t1_treated": "0.32", "t1_rcl": "1", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "15", "t1_treated": "0.15", "t1_rcl": "0.9", "t1_ph": "6.98"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "9", "t1_treated": "0.9", "t1_rcl": "1.1", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "8.72", "t1_treated": "0.3", "t1_rcl": "1", "t1_ph": "7.52"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "19.1", "t1_treated": "0.1", "t1_rcl": "1.04", "t1_ph": "7"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "2.44", "t1_treated": "1.34", "t1_rcl": "1.6", "t1_ph": "6"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "4.13", "t1_treated": "0.44", "t1_rcl": "0.9", "t1_ph": "7.3"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "32.8", "t1_treated": "1.32", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "13.5", "t1_treated": "0.13", "t1_rcl": "0.82", "t1_ph": "7.7"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "01.02.2026": {"status": "submitted", "dateKey": "01.02.2026", "dateLabel": "01.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-01T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "6.8", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "4.39", "t1_treated": "0.38", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "14.2", "t1_treated": "0.65", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "7.28", "t1_treated": "1.04", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "7.28", "t1_treated": "1.04", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "5.6", "t1_treated": "0.116", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "7.1", "t1_treated": "0.63", "t1_rcl": "0.8", "t1_ph": "6.85"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "7.53", "t1_treated": "1.42", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.59", "t1_treated": "0.39", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "26", "t1_treated": "0.44", "t1_rcl": "1", "t1_ph": "6.67"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "13.9", "t1_treated": "0.15", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "16.1", "t1_treated": "0.09", "t1_rcl": "0.8", "t1_ph": "7.21"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "7.01", "t1_treated": "2.67", "t1_rcl": "1.2", "t1_ph": "7"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "7.87", "t1_treated": "0.47", "t1_rcl": "1", "t1_ph": "7.52"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.86", "t1_treated": "0.83", "t1_rcl": "0.9", "t1_ph": "6.63"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "10.1", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "7.25"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.95", "t1_treated": "0.97", "t1_rcl": "0.6", "t1_ph": "6.6"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.3", "t1_treated": "1.1", "t1_rcl": "0.62", "t1_ph": "6.5"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "4.58", "t1_treated": "0.2", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.63", "t1_treated": "0.96", "t1_rcl": "0.8", "t1_ph": "6.8"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "3.16", "t1_treated": "0.52", "t1_rcl": "1", "t1_ph": "7.26"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "26.5", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "0.12", "t1_treated": "1.02", "t1_rcl": "6.98", "t1_ph": "19.1"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "1.3", "t1_treated": "1.9", "t1_rcl": "", "t1_ph": "7"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.23", "t1_treated": "3.15", "t1_rcl": "1.3", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "0.09", "t1_treated": "1.2", "t1_rcl": "7.5", "t1_ph": "29.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "0.13", "t1_treated": "6.1", "t1_rcl": "7.72", "t1_ph": "46.2"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "27.3", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.37", "t1_treated": "0.17", "t1_rcl": "0.8", "t1_ph": "7.07"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "12.1", "t1_treated": "0.12", "t1_rcl": "1.08", "t1_ph": "7.05"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "13.9", "t1_treated": "0.13", "t1_rcl": "1.24", "t1_ph": "7.03"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "02.02.2026": {"status": "submitted", "dateKey": "02.02.2026", "dateLabel": "02.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-02T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "4.8", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "4.39", "t1_treated": "0.26", "t1_rcl": "0.8", "t1_ph": "6.6"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "6.8", "t1_treated": "0.6", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "11.38", "t1_treated": "1.22", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "4.26", "t1_treated": "0.087", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.02", "t1_treated": "0.43", "t1_rcl": "0.8", "t1_ph": "6.87"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "5.63", "t1_treated": "1.38", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.37", "t1_treated": "1.65", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "5.84", "t1_treated": "0.56", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "70.1", "t1_treated": "0.55", "t1_rcl": "1", "t1_ph": ""}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "39.1", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "11", "t1_treated": "0.085", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "4.19", "t1_treated": "1.9", "t1_rcl": "1.2", "t1_ph": "7"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "5.78", "t1_treated": "0.82", "t1_rcl": "1", "t1_ph": "7.06"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.47", "t1_treated": "0.85", "t1_rcl": "0.9", "t1_ph": "6.67"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "62.6", "t1_treated": "0.15", "t1_rcl": "0.9", "t1_ph": "7.25"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.95", "t1_treated": "1.03", "t1_rcl": "0.8", "t1_ph": "6.62"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.4", "t1_treated": "1.1", "t1_rcl": "0.6", "t1_ph": "6.41"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "5.17", "t1_treated": "0.2", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.47", "t1_treated": "0.97", "t1_rcl": "0.8", "t1_ph": "6.78"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "3.31", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "7.23"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "159", "t1_treated": "0.16", "t1_rcl": "1", "t1_ph": "32"}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "7.04", "t1_treated": "0.12", "t1_rcl": "0.9", "t1_ph": "6.92"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "10.2", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.58"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "", "t1_treated": "0.1", "t1_rcl": "1.06", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "2.34", "t1_treated": "1.23", "t1_rcl": "1.2", "t1_ph": "6.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "0.41", "t1_rcl": "0.8", "t1_ph": "7.5"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "0.44", "t1_rcl": "1.2", "t1_ph": "7.4"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "", "t1_treated": "0.12", "t1_rcl": "0.82", "t1_ph": "7.7"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.31", "t1_treated": "0.16", "t1_rcl": "0.85", "t1_ph": "7.14"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "11.9", "t1_treated": "0.14", "t1_rcl": "0.89", "t1_ph": "6.93"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "16.3", "t1_treated": "0.15", "t1_rcl": "1.19", "t1_ph": "7.01"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "03.02.2026": {"status": "submitted", "dateKey": "03.02.2026", "dateLabel": "03.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-03T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "4.8", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "4.8", "t1_treated": "0.2", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "8.04", "t1_treated": "0.52", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "2.73", "t1_treated": "0.68", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "3.86", "t1_treated": "0.336", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.42", "t1_treated": "0.62", "t1_rcl": "0.8", "t1_ph": "6.76"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "6.65", "t1_treated": "1.32", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.24", "t1_treated": "1.24", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.81", "t1_treated": "0.53", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "37.1", "t1_treated": "0.27", "t1_rcl": "1", "t1_ph": ""}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "17.6", "t1_treated": "0.18", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "17", "t1_treated": "0.108", "t1_rcl": "0.8", "t1_ph": "7.19"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "8.5", "t1_treated": "1.9", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "5.02", "t1_treated": "0.183", "t1_rcl": "1", "t1_ph": "7.53"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.35", "t1_treated": "0.83", "t1_rcl": "0.9", "t1_ph": "6.75"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.64", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.97", "t1_treated": "0.97", "t1_rcl": "0.8", "t1_ph": "6.63"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.5", "t1_treated": "1.1", "t1_rcl": "0.4", "t1_ph": "6.65"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "4.38", "t1_treated": "0.18", "t1_rcl": "0.6", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "2.08", "t1_treated": "0.912", "t1_rcl": "0.8", "t1_ph": "6.69"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "6.36", "t1_treated": "0.39", "t1_rcl": "1", "t1_ph": "7.22"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "0.21", "t1_treated": "1", "t1_rcl": "", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.42", "t1_treated": "0.19", "t1_rcl": "0.9", "t1_ph": "6.96"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "8.33", "t1_treated": "0.42", "t1_rcl": "1", "t1_ph": "7.53"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19.6", "t1_treated": "0.1", "t1_rcl": "1", "t1_ph": "6.98"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "1", "t1_rcl": "1", "t1_ph": "7"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "5.1", "t1_treated": "0.42", "t1_rcl": "1", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "73.6", "t1_treated": "1.24", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "33.2", "t1_treated": "0.14", "t1_rcl": "1.01", "t1_ph": "7.39"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "8.31", "t1_treated": "0.17", "t1_rcl": "0.8", "t1_ph": "7.17"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "12.6", "t1_treated": "0.13", "t1_rcl": "0.85", "t1_ph": "6.95"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "15.2", "t1_treated": "0.14", "t1_rcl": "1.2", "t1_ph": "7.05"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "04.02.2026": {"status": "submitted", "dateKey": "04.02.2026", "dateLabel": "04.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-04T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "5.06", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.9", "t1_treated": "0.3", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "9.2", "t1_treated": "0.59", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "5.08", "t1_treated": "0.6", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "4.47", "t1_treated": "0.099", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.8", "t1_treated": "0.67", "t1_rcl": "0.8", "t1_ph": "6.85"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "6.12", "t1_treated": "1.42", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.67", "t1_treated": "1.62", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.68", "t1_treated": "0.52", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "30.3", "t1_treated": "0.41", "t1_rcl": "1", "t1_ph": ""}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "", "t1_treated": "0.16", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "9.26", "t1_treated": "0.06", "t1_rcl": "0.8", "t1_ph": "7.33"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "7.8", "t1_treated": "1.7", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "4.69", "t1_treated": "0.45", "t1_rcl": "1", "t1_ph": "7.78"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.46", "t1_treated": "0.86", "t1_rcl": "0.9", "t1_ph": "6.67"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.55", "t1_treated": "0.12", "t1_rcl": "0.8", "t1_ph": "7.22"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.09", "t1_treated": "1.2", "t1_rcl": "0.8", "t1_ph": "6.58"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.6", "t1_treated": "1.1", "t1_rcl": "0.5", "t1_ph": "6.75"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "18.4", "t1_treated": "0.51", "t1_rcl": "0.6", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.51", "t1_treated": "0.9", "t1_rcl": "0.8", "t1_ph": "6.95"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "6.88", "t1_treated": "0.31", "t1_rcl": "1", "t1_ph": "7.23"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "25.8", "t1_treated": "0.16", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.75", "t1_treated": "0.18", "t1_rcl": "0.9", "t1_ph": "6.9"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "9.67", "t1_treated": "0.32", "t1_rcl": "1", "t1_ph": "7.56"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "12.1", "t1_treated": "0.07", "t1_rcl": "1", "t1_ph": "7.01"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "1", "t1_treated": "7", "t1_rcl": "1", "t1_ph": "7"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "4.69", "t1_treated": "0.43", "t1_rcl": "0.8", "t1_ph": "7.3"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "64.2", "t1_treated": "1.35", "t1_rcl": "1.2", "t1_ph": "7.4"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "27", "t1_treated": "0.12", "t1_rcl": "0.8", "t1_ph": "7.69"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "7.4", "t1_treated": "0.19", "t1_rcl": "0.9", "t1_ph": "7.19"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "9.5", "t1_treated": "0.15", "t1_rcl": "0.75", "t1_ph": "6.92"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "13.2", "t1_treated": "0.13", "t1_rcl": "1.26", "t1_ph": "7.04"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "05.02.2026": {"status": "submitted", "dateKey": "05.02.2026", "dateLabel": "05.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-05T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.69", "t1_treated": "0.2", "t1_rcl": "0.8", "t1_ph": "6.55"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "4.3", "t1_treated": "0.34", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "4.31", "t1_treated": "0.37", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "4.7", "t1_treated": "0.102", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.19", "t1_treated": "2.33", "t1_rcl": "0.72", "t1_ph": "0.8"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "5.37", "t1_treated": "1.36", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "7.53", "t1_treated": "1.42", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.52", "t1_treated": "0.63", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "17.5", "t1_treated": "0.29", "t1_rcl": "1", "t1_ph": ""}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "13.5", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "8.43", "t1_treated": "0.065", "t1_rcl": "0.8", "t1_ph": "7.21"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "6.02", "t1_treated": "1.11", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "6.06", "t1_treated": "0.208", "t1_rcl": "1", "t1_ph": "7.71"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.04", "t1_treated": "0.81", "t1_rcl": "0.9", "t1_ph": "6.75"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.61", "t1_treated": "0.13", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.86", "t1_treated": "0.99", "t1_rcl": "0.7", "t1_ph": "6.68"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1", "t1_treated": "0.8", "t1_rcl": "0.6", "t1_ph": "6.71"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "15.3", "t1_treated": "0.62", "t1_rcl": "0.5", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.3", "t1_treated": "0.92", "t1_rcl": "0.8", "t1_ph": "6.93"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "5.26", "t1_treated": "0.17", "t1_rcl": "1", "t1_ph": "7.19"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "26.8", "t1_treated": "0.14", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.42", "t1_treated": "0.19", "t1_rcl": "1", "t1_ph": "7.27"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "8.19", "t1_treated": "0.33", "t1_rcl": "1", "t1_ph": "7.49"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19.8", "t1_treated": "0.11", "t1_rcl": "1.09", "t1_ph": "6.96"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "1", "t1_treated": "7", "t1_rcl": "1", "t1_ph": "7"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "4.62", "t1_treated": "0.42", "t1_rcl": "0.8", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "36.7", "t1_treated": "0.74", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "42.7", "t1_treated": "0.13", "t1_rcl": "1.01", "t1_ph": "7.76"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "7.5", "t1_treated": "0.11", "t1_rcl": "0.78", "t1_ph": "7.02"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "11.9", "t1_treated": "0.16", "t1_rcl": "0.9", "t1_ph": "6.9"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "11.8", "t1_treated": "0.15", "t1_rcl": "1.26", "t1_ph": "7.01"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "06.02.2026": {"status": "submitted", "dateKey": "06.02.2026", "dateLabel": "06.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-06T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.6", "t1_treated": "0.2", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "4.5", "t1_treated": "0.32", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "13.11", "t1_treated": "0.6", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "4.21", "t1_treated": "0.021", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.96", "t1_treated": "0.5", "t1_rcl": "0.8", "t1_ph": "6.76"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "5.78", "t1_treated": "1.26", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.66", "t1_treated": "1.42", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.58", "t1_treated": "0.57", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "26.1", "t1_treated": "0.29", "t1_rcl": "1", "t1_ph": ""}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "14", "t1_treated": "0.18", "t1_rcl": "1", "t1_ph": "6.9"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": "1"}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "16.2", "t1_treated": "0.09", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "8.32", "t1_treated": "1.92", "t1_rcl": "1.2", "t1_ph": "7"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "5.58", "t1_treated": "0.214", "t1_rcl": "1", "t1_ph": "7.01"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.64", "t1_treated": "0.66", "t1_rcl": "0.9", "t1_ph": "6.65"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.54", "t1_treated": "0.14", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.98", "t1_treated": "0.95", "t1_rcl": "0.6", "t1_ph": "6.72"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.01", "t1_treated": "0.8", "t1_rcl": "0.6", "t1_ph": "6.21"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "10.4", "t1_treated": "0.5", "t1_rcl": "0.6", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "3.38", "t1_treated": "1.05", "t1_rcl": "0.8", "t1_ph": "6.91"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "4.67", "t1_treated": "0.17", "t1_rcl": "1", "t1_ph": "7.14"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.98", "t1_treated": "0.38", "t1_rcl": "1", "t1_ph": "6.87"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "8.02", "t1_treated": "0.39", "t1_rcl": "1", "t1_ph": "7.47"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19.6", "t1_treated": "0.1", "t1_rcl": "1.04", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "5", "t1_treated": "0.5", "t1_rcl": "1", "t1_ph": "7"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.17", "t1_treated": "0.47", "t1_rcl": "0.8", "t1_ph": "7.5"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "20.1", "t1_treated": "0.88", "t1_rcl": "1.2", "t1_ph": "7.4"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "16.7", "t1_treated": "0.12", "t1_rcl": "1.1", "t1_ph": "7.28"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.4", "t1_treated": "0.15", "t1_rcl": "0.78", "t1_ph": "7.21"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "12.3", "t1_treated": "0.16", "t1_rcl": "1.08", "t1_ph": "6.93"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "19.2", "t1_treated": "0.13", "t1_rcl": "1.25", "t1_ph": "7.12"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "07.02.2026": {"status": "submitted", "dateKey": "07.02.2026", "dateLabel": "07.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-07T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.2", "t1_treated": "0.6", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "3.3", "t1_treated": "0.09", "t1_rcl": "0.8", "t1_ph": "6.7"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "9.22", "t1_treated": "1.11", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "4.74", "t1_treated": "0.106", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.89", "t1_treated": "0.59", "t1_rcl": "0.9", "t1_ph": "6.39"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "7.69", "t1_treated": "2.46", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "8.51", "t1_treated": "1.37", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "2.26", "t1_treated": "0.49", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "10.6", "t1_treated": "0.22", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "6.36", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "7.22"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "5.11", "t1_treated": "1.9", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "6.15", "t1_treated": "0.279", "t1_rcl": "1", "t1_ph": "7.47"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.74", "t1_treated": "0.81", "t1_rcl": "0.9", "t1_ph": "6.67"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.69", "t1_treated": "0.12", "t1_rcl": "0.9", "t1_ph": "7.19"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.92", "t1_treated": "0.85", "t1_rcl": "0.6", "t1_ph": "6.72"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1", "t1_treated": "0.81", "t1_rcl": "0.6", "t1_ph": "6.3"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "23.1", "t1_treated": "0.57", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "2.5", "t1_treated": "1.1", "t1_rcl": "0.8", "t1_ph": "6.9"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "5.21", "t1_treated": "0.27", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "42.8", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "7.37", "t1_treated": "0.37", "t1_rcl": "0.9", "t1_ph": "6.96"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "15.6", "t1_treated": "0.4", "t1_rcl": "1", "t1_ph": "7.57"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "10.1", "t1_treated": "0.1", "t1_rcl": "1.04", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "15", "t1_treated": "0.5", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.21", "t1_treated": "0.46", "t1_rcl": "0.8", "t1_ph": "7.5"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "30.6", "t1_treated": "1.1", "t1_rcl": "1.2", "t1_ph": "7.3"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "64.4", "t1_treated": "0.12", "t1_rcl": "0.81", "t1_ph": "7.59"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "10.31", "t1_treated": "0.2", "t1_rcl": "0.84", "t1_ph": "7.16"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "12.1", "t1_treated": "0.11", "t1_rcl": "0.85", "t1_ph": "6.97"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "14.4", "t1_treated": "0.14", "t1_rcl": "1.22", "t1_ph": "7.09"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "08.02.2026": {"status": "submitted", "dateKey": "08.02.2026", "dateLabel": "08.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-08T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.8", "t1_treated": "0.5", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "4.1", "t1_treated": "1.1", "t1_rcl": "0.8", "t1_ph": "6.6"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "6.31", "t1_treated": "0.56", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "4.19", "t1_treated": "0.12", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.26", "t1_treated": "0.47", "t1_rcl": "0.8", "t1_ph": "6.82"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "6.34", "t1_treated": "1.41", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.65", "t1_treated": "1.54", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.99", "t1_treated": "0.47", "t1_rcl": "0.8", "t1_ph": "1.83"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "16.3", "t1_treated": "0.41", "t1_rcl": "1", "t1_ph": "6.72"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "21.9", "t1_treated": "0.17", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "13.9", "t1_treated": "0.08", "t1_rcl": "0.9", "t1_ph": "7.24"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "5.63", "t1_treated": "1.98", "t1_rcl": "1", "t1_ph": "7"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "6.55", "t1_treated": "198", "t1_rcl": "1", "t1_ph": "7.21"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.62", "t1_treated": "0.74", "t1_rcl": "0.9", "t1_ph": "6.6"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.52", "t1_treated": "0.1", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "7.74", "t1_treated": "0.8", "t1_rcl": "0.5", "t1_ph": "6.65"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1", "t1_treated": "0.8", "t1_rcl": "0.6", "t1_ph": "6.51"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "14.6", "t1_treated": "0.36", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "2.15", "t1_treated": "1.13", "t1_rcl": "0.8", "t1_ph": "6.94"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.33", "t1_treated": "0.53", "t1_rcl": "1", "t1_ph": "7.21"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "35.8", "t1_treated": "0.19", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "3.75", "t1_treated": "0.22", "t1_rcl": "1", "t1_ph": "6.98"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "8.39", "t1_treated": "0.27", "t1_rcl": "1", "t1_ph": "7.57"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19.1", "t1_treated": "0.1", "t1_rcl": "1.01", "t1_ph": "7"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "20", "t1_treated": "0.5", "t1_rcl": "1.1", "t1_ph": "7.5"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.11", "t1_treated": "0.4", "t1_rcl": "0.8", "t1_ph": "7.3"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "27.7", "t1_treated": "0.54", "t1_rcl": "1.2", "t1_ph": "7.4"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "29.2", "t1_treated": "0.1", "t1_rcl": "1.05", "t1_ph": "7.8"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "9.45", "t1_treated": "0.2", "t1_rcl": "0.8", "t1_ph": "7.33"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "10.9", "t1_treated": "0.13", "t1_rcl": "0.81", "t1_ph": "6.9"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "16.3", "t1_treated": "0.16", "t1_rcl": "1.22", "t1_ph": "7.04"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "09.02.2026": {"status": "submitted", "dateKey": "09.02.2026", "dateLabel": "09.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-09T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.9", "t1_treated": "0.6", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "4.3", "t1_treated": "0.9", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "5.24", "t1_treated": "1.01", "t1_rcl": "0.9", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "3.14", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.31", "t1_treated": "0.47", "t1_rcl": "0.8", "t1_ph": "6.82"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "7.26", "t1_treated": "1.43", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "8.52", "t1_treated": "1.67", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "0.5", "t1_treated": "0.8", "t1_rcl": "-", "t1_ph": ""}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "19.2", "t1_treated": "0.69", "t1_rcl": "1", "t1_ph": "6.67"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "24.4", "t1_treated": "0.26", "t1_rcl": "1", "t1_ph": "7.4"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "22.6", "t1_treated": "0.086", "t1_rcl": "0.8", "t1_ph": "7.22"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "7.15", "t1_treated": "1.8", "t1_rcl": "1.2", "t1_ph": "7"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "24.9", "t1_treated": "0.344", "t1_rcl": "1", "t1_ph": "7.88"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.88", "t1_treated": "0.56", "t1_rcl": "0.9", "t1_ph": "6.69"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "10.7", "t1_treated": "0.09", "t1_rcl": "0.8", "t1_ph": "7.25"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.12", "t1_treated": "0.92", "t1_rcl": "0.6", "t1_ph": "6.75"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1", "t1_treated": "0.8", "t1_rcl": "0.6", "t1_ph": "6.62"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "8.37", "t1_treated": "0.21", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.72", "t1_treated": "1.06", "t1_rcl": "0.8", "t1_ph": "6.72"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.02", "t1_treated": "0.5", "t1_rcl": "1", "t1_ph": "7.22"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "11.4", "t1_treated": "0.14", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "3.49", "t1_treated": "0.33", "t1_rcl": "1", "t1_ph": "6.84"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "7.25", "t1_treated": "0.4", "t1_rcl": "1", "t1_ph": "7.51"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "130", "t1_treated": "0.15", "t1_rcl": "1", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "2.34", "t1_treated": "0.9", "t1_rcl": "1.4", "t1_ph": "6.8"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.68", "t1_treated": "0.41", "t1_rcl": "0.8", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "29.2", "t1_treated": "0.53", "t1_rcl": "1.2", "t1_ph": "7.4"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "18.3", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "7.62"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.23", "t1_treated": "0.2", "t1_rcl": "0.78", "t1_ph": "7.18"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "12.7", "t1_treated": "0.17", "t1_rcl": "1.08", "t1_ph": "6.88"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "12.8", "t1_treated": "0.14", "t1_rcl": "1.2", "t1_ph": "7.03"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "10.02.2026": {"status": "submitted", "dateKey": "10.02.2026", "dateLabel": "10.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-10T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "2.83", "t1_treated": "0.29", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "5.2", "t1_treated": "1.1", "t1_rcl": "0.8", "t1_ph": "6.7"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "8.58", "t1_treated": "0.54", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "3.77", "t1_treated": "0.112", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.42", "t1_treated": "1.41", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.38", "t1_treated": "1.45", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.49", "t1_treated": "0.4", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "4.28", "t1_treated": "0.69", "t1_rcl": "1", "t1_ph": "7.64"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "27.3", "t1_treated": "0.65", "t1_rcl": "1.2", "t1_ph": "7.71"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "7.2", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "7.19"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "14", "t1_treated": "0.51", "t1_rcl": "1", "t1_ph": "7.17"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "17.3", "t1_treated": "0.26", "t1_rcl": "1", "t1_ph": "6.9"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "32..8", "t1_treated": "0.112", "t1_rcl": "0.8", "t1_ph": "7.26"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "5.42", "t1_treated": "1.9", "t1_rcl": "1", "t1_ph": "7"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "10.2", "t1_treated": "0.723", "t1_rcl": "1", "t1_ph": "6.96"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.89", "t1_treated": "0.5", "t1_rcl": "0.9", "t1_ph": "6.67"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.42", "t1_treated": "0.09", "t1_rcl": "0.9", "t1_ph": "7.2"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.97", "t1_treated": "0.93", "t1_rcl": "0.7", "t1_ph": "6.56"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.01", "t1_treated": "0.82", "t1_rcl": "0.6", "t1_ph": "6.52"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "9.26", "t1_treated": "0.24", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.83", "t1_treated": "1.05", "t1_rcl": "0.8", "t1_ph": "6.81"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.15", "t1_treated": "0.51", "t1_rcl": "1", "t1_ph": "7.23"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "12.6", "t1_treated": "0.17", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "4.15", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": ""}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "8.41", "t1_treated": "0.3", "t1_rcl": "1", "t1_ph": "7.58"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "496", "t1_treated": "0.1", "t1_rcl": "1.02", "t1_ph": "6.98"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "10", "t1_treated": "0.5", "t1_rcl": "1.1", "t1_ph": "7"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "4.4", "t1_treated": "0.46", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "28.9", "t1_treated": "0.52", "t1_rcl": "1.2", "t1_ph": "7.3"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "20.3", "t1_treated": "0.15", "t1_rcl": "0.99", "t1_ph": "7.43"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.33", "t1_treated": "0.18", "t1_rcl": "0.84", "t1_ph": "7.11"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "12.2", "t1_treated": "0.14", "t1_rcl": "1.06", "t1_ph": "6.98"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "22.4", "t1_treated": "0.15", "t1_rcl": "1.21", "t1_ph": "7.09"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "11.02.2026": {"status": "submitted", "dateKey": "11.02.2026", "dateLabel": "11.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-11T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "2.51", "t1_treated": "0.27", "t1_rcl": "0.8", "t1_ph": "6.6"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "5.8", "t1_treated": "0.9", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "5.91", "t1_treated": "0.58", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "3.67", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.75", "t1_treated": "0.58", "t1_rcl": "0.9", "t1_ph": "6.85"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "7.16", "t1_treated": "1.47", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.57", "t1_treated": "1.72", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.68", "t1_treated": "0.51", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "6.45", "t1_treated": "0.221", "t1_rcl": "1", "t1_ph": "7.54"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "19.4", "t1_treated": "0.48", "t1_rcl": "1.2", "t1_ph": "7.78"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.58", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.26"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "16.4", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "6.9"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": "1"}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "17.9", "t1_treated": "0.087", "t1_rcl": "0.8", "t1_ph": "7.22"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "7.06", "t1_treated": "1.9", "t1_rcl": "1", "t1_ph": "7"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "6.46", "t1_treated": "0.222", "t1_rcl": "1", "t1_ph": "7.68"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.65", "t1_treated": "0.52", "t1_rcl": "0.9", "t1_ph": "6.71"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "10.5", "t1_treated": "0.5", "t1_rcl": "0.8", "t1_ph": "7.25"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.98", "t1_treated": "0.9", "t1_rcl": "0.6", "t1_ph": "6.75"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.1", "t1_treated": "0.8", "t1_rcl": "0.6", "t1_ph": "6.61"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "8.76", "t1_treated": "0.21", "t1_rcl": "0.5", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.68", "t1_treated": "0.975", "t1_rcl": "0.8", "t1_ph": "6.85"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.12", "t1_treated": "0.27", "t1_rcl": "1", "t1_ph": "7.27"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "10.2", "t1_treated": "0.16", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "3.27", "t1_treated": "0.28", "t1_rcl": "1", "t1_ph": ""}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "7.68", "t1_treated": "0.39", "t1_rcl": "1", "t1_ph": "7.59"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "20.4", "t1_treated": "0.11", "t1_rcl": "0.99", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "11", "t1_treated": "0.8", "t1_rcl": "1.1", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "4.11", "t1_treated": "0.49", "t1_rcl": "0.8", "t1_ph": "7.3"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "25.4", "t1_treated": "0.96", "t1_rcl": "1.2", "t1_ph": "7.4"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "46.3", "t1_treated": "0.13", "t1_rcl": "0.82", "t1_ph": "7.69"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.1", "t1_treated": "0.19", "t1_rcl": "0.76", "t1_ph": "7.2"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "7.33", "t1_treated": "0.11", "t1_rcl": "0.75", "t1_ph": "6.7"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "14.8", "t1_treated": "0.16", "t1_rcl": "1.19", "t1_ph": "7.05"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "12.02.2026": {"status": "submitted", "dateKey": "12.02.2026", "dateLabel": "12.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-12T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "2.46", "t1_treated": "0.26", "t1_rcl": "0.8", "t1_ph": "6.6"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "5.4", "t1_treated": "1.1", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "4.93", "t1_treated": "0.75", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "3.28", "t1_treated": "0.142", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "7.61", "t1_treated": "1.36", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.65", "t1_treated": "1.47", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.4", "t1_treated": "0.48", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "4.24", "t1_treated": "0.361", "t1_rcl": "1", "t1_ph": "7.68"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "26.3", "t1_treated": "0.79", "t1_rcl": "1.2", "t1_ph": "7.66"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.44", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.25"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "13.4", "t1_treated": "0.48", "t1_rcl": "1", "t1_ph": "7.28"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "21.4", "t1_treated": "0.3", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "13.3", "t1_treated": "0.101", "t1_rcl": "0.8", "t1_ph": "7.26"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "3.8", "t1_treated": "1.51", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "4.57", "t1_treated": "0.266", "t1_rcl": "1", "t1_ph": "7.41"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.57", "t1_treated": "0.58", "t1_rcl": "0.9", "t1_ph": "6.81"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "11.7", "t1_treated": "0.09", "t1_rcl": "0.9", "t1_ph": "7.5"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.89", "t1_treated": "0.93", "t1_rcl": "0.8", "t1_ph": "6.69"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1", "t1_treated": "0.82", "t1_rcl": "0.6", "t1_ph": "6.7"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "6.22", "t1_treated": "0.32", "t1_rcl": "0.6", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.93", "t1_treated": "0.92", "t1_rcl": "0.8", "t1_ph": "6.9"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "3.21", "t1_treated": "0.5", "t1_rcl": "1", "t1_ph": "7.43"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "22.3", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.71", "t1_treated": "0.27", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "7.59", "t1_treated": "0.34", "t1_rcl": "1", "t1_ph": "7.44"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19.1", "t1_treated": "0.1", "t1_rcl": "1.01", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "14", "t1_treated": "0.8", "t1_rcl": "1.1", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.96", "t1_treated": "0.47", "t1_rcl": "0.8", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "23.9", "t1_treated": "0.37", "t1_rcl": "1.2", "t1_ph": "7.3"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "22", "t1_treated": "0.14", "t1_rcl": "1.02", "t1_ph": "7.4"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.5", "t1_treated": "0.11", "t1_rcl": "0.78", "t1_ph": "7.1"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "15.5", "t1_treated": "0.11", "t1_rcl": "0.95", "t1_ph": "6.9"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "13.1", "t1_treated": "0.13", "t1_rcl": "1.16", "t1_ph": "7.03"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "13.02.2026": {"status": "submitted", "dateKey": "13.02.2026", "dateLabel": "13.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-13T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "17", "t1_treated": "0.22", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "5.62", "t1_treated": "1.24", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "4.2", "t1_treated": "0.8", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "14.6", "t1_treated": "0.359", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "25.5", "t1_treated": "0.82", "t1_rcl": "0.8", "t1_ph": "6.8"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "18.27", "t1_treated": "1.12", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "15.71", "t1_treated": "1.46", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-`", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "5.49", "t1_treated": "0.51", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "16.7", "t1_treated": "0.995", "t1_rcl": "1", "t1_ph": "7.67"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "36.3", "t1_treated": "0.22", "t1_rcl": "1", "t1_ph": "7.76"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.46", "t1_treated": "0.22", "t1_rcl": "1", "t1_ph": "7.27"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "170", "t1_treated": "0.47", "t1_rcl": "1", "t1_ph": "7.35"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "128", "t1_treated": "0.41", "t1_rcl": "1", "t1_ph": "6.9"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "13.8", "t1_treated": "0.08", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "17.2", "t1_treated": "2.28", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "10.3", "t1_treated": "0.263", "t1_rcl": "1", "t1_ph": "7.66"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.49", "t1_treated": "0.86", "t1_rcl": "0.8", "t1_ph": "6.61"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "12.9", "t1_treated": "0.14", "t1_rcl": "0.8", "t1_ph": "7.15"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.64", "t1_treated": "0.91", "t1_rcl": "", "t1_ph": "6.65"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.01", "t1_treated": "0.8", "t1_rcl": "0.6", "t1_ph": "6.71"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "4.97", "t1_treated": "0.19", "t1_rcl": "0.6", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "2.22", "t1_treated": "0.95", "t1_rcl": "0.8", "t1_ph": "6.91"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "2.02", "t1_treated": "0.5", "t1_rcl": "0.9", "t1_ph": "7.21"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "18.6", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "102.3"}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "18.5", "t1_treated": "1.28", "t1_rcl": "1", "t1_ph": "7.14"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "5.95", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.43"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "37", "t1_treated": "0.1", "t1_rcl": "1", "t1_ph": "7.02"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "30", "t1_treated": "0.9", "t1_rcl": "1.01", "t1_ph": "7.2"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "4.11", "t1_treated": "0.48", "t1_rcl": "0.8", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "53.8", "t1_treated": "0.97", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "81.1", "t1_treated": "0.15", "t1_rcl": "0.92", "t1_ph": "7.48"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "8", "t1_treated": "0.12", "t1_rcl": "0.85", "t1_ph": "7.1"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "26.8", "t1_treated": "0.13", "t1_rcl": "1.06", "t1_ph": "6.86"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "32.2", "t1_treated": "0.14", "t1_rcl": "1.23", "t1_ph": "7.05"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "14.02.2026": {"status": "submitted", "dateKey": "14.02.2026", "dateLabel": "14.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-14T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "4.2", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "5.58", "t1_treated": "0.48", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "6.68", "t1_treated": "0.39", "t1_rcl": "0.9", "t1_ph": "6.15"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "4.8", "t1_treated": "0.69", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "5.42", "t1_treated": "0.103", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "13.6", "t1_treated": "0.62", "t1_rcl": "0.8", "t1_ph": "6.86"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "9.17", "t1_treated": "1.12", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "9.97", "t1_treated": "1.78", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "2.72", "t1_treated": "0.69", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "26.8", "t1_treated": "0.35", "t1_rcl": "1", "t1_ph": "7.73"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.38", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.25"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "60", "t1_treated": "0.45", "t1_rcl": "1", "t1_ph": "7.04"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "31.4", "t1_treated": "0.27", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "72", "t1_treated": "0.09", "t1_rcl": "0.8", "t1_ph": "7.26"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "28.2", "t1_treated": "1.15", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "38.9", "t1_treated": "0.239", "t1_rcl": "1", "t1_ph": "7.01"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.76", "t1_treated": "0.81", "t1_rcl": "0.9", "t1_ph": "6.63"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.44", "t1_treated": "0.14", "t1_rcl": "0.8", "t1_ph": "7.12"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.78", "t1_treated": "0.76", "t1_rcl": "0.5", "t1_ph": "6.71"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.21", "t1_treated": "0.83", "t1_rcl": "0.6", "t1_ph": "6.41"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "5.27", "t1_treated": "0.26", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "2.1", "t1_treated": "1.53", "t1_rcl": "0.8", "t1_ph": "6.9"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.14", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "0.26", "t1_treated": "1", "t1_rcl": "", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "7.14", "t1_treated": "0.28", "t1_rcl": "0.9", "t1_ph": ""}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "6.79", "t1_treated": "0.32", "t1_rcl": "1", "t1_ph": "7.49"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "29.6", "t1_treated": "0.1", "t1_rcl": "1.01", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.93", "t1_treated": "2.22", "t1_rcl": "1.1", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.97", "t1_treated": "0.45", "t1_rcl": "0.8", "t1_ph": "7.3"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "57.4", "t1_treated": "0.47", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "65.7", "t1_treated": "0.17", "t1_rcl": "0.84", "t1_ph": "7.7"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "10.23", "t1_treated": "0.16", "t1_rcl": "0.81", "t1_ph": "7.06"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "48.9", "t1_treated": "0.15", "t1_rcl": "0.86", "t1_ph": "6.97"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "53.6", "t1_treated": "0.15", "t1_rcl": "1.22", "t1_ph": "7"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "15.02.2026": {"status": "submitted", "dateKey": "15.02.2026", "dateLabel": "15.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-15T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "5.4", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "5.14", "t1_treated": "0.41", "t1_rcl": "0.8", "t1_ph": "6.65"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "7.72", "t1_treated": "0.42", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "8.82", "t1_treated": "0.58", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "6.18", "t1_treated": "0.1", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "9.37", "t1_treated": "0.52", "t1_rcl": "0.9", "t1_ph": "6.89"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "9.37", "t1_treated": "1.5", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "7.57", "t1_treated": "1.57", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.96", "t1_treated": "0.5", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "6.31", "t1_treated": "1.04", "t1_rcl": "1", "t1_ph": "7.24"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "23.5", "t1_treated": "0.34", "t1_rcl": "1", "t1_ph": "7.73"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.41", "t1_treated": "0.22", "t1_rcl": "1", "t1_ph": "7.29"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "154", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.19"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "31", "t1_treated": "0.21", "t1_rcl": "0.9", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "18.6", "t1_treated": "0.071", "t1_rcl": "0.8", "t1_ph": "7.24"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "7.97", "t1_treated": "1.27", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "22.7", "t1_treated": "0.683", "t1_rcl": "1", "t1_ph": "7.05"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.89", "t1_treated": "0.98", "t1_rcl": "0.9", "t1_ph": "6.62"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "5.75", "t1_treated": "0.04", "t1_rcl": "0.8", "t1_ph": "7.25"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "3.12", "t1_treated": "1.01", "t1_rcl": "0.6", "t1_ph": "6.69"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.2", "t1_treated": "0.8", "t1_rcl": "0.6", "t1_ph": "6.5"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "7.92", "t1_treated": "0.36", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.54", "t1_treated": "1.02", "t1_rcl": "0.8", "t1_ph": "6.96"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.81", "t1_treated": "0.33", "t1_rcl": "1", "t1_ph": "7.21"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "284", "t1_treated": "0.32", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "8.14", "t1_treated": "0.78", "t1_rcl": "", "t1_ph": "8.14"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "9.1", "t1_treated": "0.29", "t1_rcl": "1", "t1_ph": "7.57"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "45.5", "t1_treated": "0.13", "t1_rcl": "1.04", "t1_ph": "6.97"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "19", "t1_treated": "0.9", "t1_rcl": "1.1", "t1_ph": "7.5"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.96", "t1_treated": "0.46", "t1_rcl": "0.8", "t1_ph": "7.5"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "66.5", "t1_treated": "1.12", "t1_rcl": "1.2", "t1_ph": "7.4"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "117", "t1_treated": "0.1", "t1_rcl": "1.17", "t1_ph": "7.22"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "12.5", "t1_treated": "0.21", "t1_rcl": "0.85", "t1_ph": "7.36"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "54.2", "t1_treated": "0.14", "t1_rcl": "0.93", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "52.4", "t1_treated": "0.14", "t1_rcl": "1.21", "t1_ph": "7.09"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "16.02.2026": {"status": "submitted", "dateKey": "16.02.2026", "dateLabel": "16.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-16T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "9.6", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.56", "t1_treated": "0.31", "t1_rcl": "0.9", "t1_ph": "6.55"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "9.51", "t1_treated": "0.47", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "8.21", "t1_treated": "0.24", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "5.07", "t1_treated": "0.29", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "8.54", "t1_treated": "0.3", "t1_rcl": "0.7", "t1_ph": "6.88"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.5", "t1_treated": "1.1", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "9.95", "t1_treated": "1.47", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.13", "t1_treated": "0.5", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "20.4", "t1_treated": "0.47", "t1_rcl": "1.2", "t1_ph": "7.12"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.42", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "7.3"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "22.4", "t1_treated": "0.4", "t1_rcl": "1", "t1_ph": "7"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "16.2", "t1_treated": "0.08", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "10.47", "t1_treated": "2.29", "t1_rcl": "1.4", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "6.7", "t1_treated": "0.063", "t1_rcl": "1", "t1_ph": "7.39"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.53", "t1_treated": "0.74", "t1_rcl": "0.8", "t1_ph": "6.65"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "6.72", "t1_treated": "0.05", "t1_rcl": "0.9", "t1_ph": "7.25"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.67", "t1_treated": "0.83", "t1_rcl": "0.6", "t1_ph": "6.71"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.2", "t1_treated": "0.82", "t1_rcl": "0.6", "t1_ph": "6.5"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "5.78", "t1_treated": "0.31", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.67", "t1_treated": "1.1", "t1_rcl": "0.8", "t1_ph": "6.82"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.17", "t1_treated": "0.33", "t1_rcl": "1", "t1_ph": "7.22"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "18.1", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "0.78", "t1_treated": "1", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "12.4", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.45"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "30.1", "t1_treated": "0.1", "t1_rcl": "1", "t1_ph": "7"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "10", "t1_treated": "2.11", "t1_rcl": "1.1", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.91", "t1_treated": "0.47", "t1_rcl": "0.8", "t1_ph": "7.3"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "38.2", "t1_treated": "0.28", "t1_rcl": "1.2", "t1_ph": "7.4"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "78.5", "t1_treated": "0.12", "t1_rcl": "0.82", "t1_ph": "7.22"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "7.5", "t1_treated": "0.12", "t1_rcl": "0.8", "t1_ph": "7.06"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "21.7", "t1_treated": "0.14", "t1_rcl": "0.73", "t1_ph": "6.76"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "22.6", "t1_treated": "0.15", "t1_rcl": "1.21", "t1_ph": "7.06"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "17.02.2026": {"status": "submitted", "dateKey": "17.02.2026", "dateLabel": "17.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-17T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "14.7", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "4.32", "t1_treated": "0.19", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "10.08", "t1_treated": "0.9", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "6.39", "t1_treated": "1.11", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "3.82", "t1_treated": "0.116", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.07", "t1_treated": "0.76", "t1_rcl": "0.8", "t1_ph": "7.02"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.12", "t1_treated": "1.21", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.65", "t1_treated": "1.46", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.29", "t1_treated": "0.61", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "40.3", "t1_treated": "1.71", "t1_rcl": "1", "t1_ph": "7.64"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "20.1", "t1_treated": "0.39", "t1_rcl": "1.2", "t1_ph": "7.84"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "22.4", "t1_treated": "0.29", "t1_rcl": "1", "t1_ph": "7.24"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "28.6", "t1_treated": "0.37", "t1_rcl": "1", "t1_ph": "7.3"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "10.5", "t1_treated": "0.099", "t1_rcl": "0.8", "t1_ph": "7.26"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "6.39", "t1_treated": "0.99", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "8.14", "t1_treated": "0.184", "t1_rcl": "1", "t1_ph": "6.84"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.35", "t1_treated": "0.69", "t1_rcl": "0.9", "t1_ph": "6.69"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "7.91", "t1_treated": "0.08", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.59", "t1_treated": "0.98", "t1_rcl": "0.6", "t1_ph": "6.75"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.1", "t1_treated": "0.81", "t1_rcl": "0.6", "t1_ph": "6.71"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "3.02", "t1_treated": "0.19", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.84", "t1_treated": "1.01", "t1_rcl": "0.8", "t1_ph": "6.86"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "0.78", "t1_treated": "0.28", "t1_rcl": "1", "t1_ph": "7.22"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "18.1", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.06", "t1_treated": "0.29", "t1_rcl": "0.9", "t1_ph": "6.58"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "14.9", "t1_treated": "0.33", "t1_rcl": "1", "t1_ph": "7.6"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "18.2", "t1_treated": "0.13", "t1_rcl": "1.05", "t1_ph": "6.95"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.22", "t1_treated": "2.11", "t1_rcl": "1.1", "t1_ph": "7"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.9", "t1_treated": "0.47", "t1_rcl": "0.8", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "34", "t1_treated": "0.88", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "36.3", "t1_treated": "0.13", "t1_rcl": "1.02", "t1_ph": "7.34"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.54", "t1_treated": "0.2", "t1_rcl": "0.78", "t1_ph": "7.1"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "15.8", "t1_treated": "0.12", "t1_rcl": "1.08", "t1_ph": "6.98"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "19.2", "t1_treated": "0.14", "t1_rcl": "1.22", "t1_ph": "7.06"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "18.02.2026": {"status": "submitted", "dateKey": "18.02.2026", "dateLabel": "18.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-18T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "9.6", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "2.76", "t1_treated": "0.26", "t1_rcl": "0.8", "t1_ph": "6.7"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "6.91", "t1_treated": "0.74", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "11.85", "t1_treated": "1.09", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "3.75", "t1_treated": "0.147", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.76", "t1_treated": "0.64", "t1_rcl": "0.8", "t1_ph": "6.85"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "9.18", "t1_treated": "1.41", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "7.56", "t1_treated": "1.46", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.29", "t1_treated": "0.54", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "22.9", "t1_treated": "1.76", "t1_rcl": "1", "t1_ph": "7.69"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "26.2", "t1_treated": "0.44", "t1_rcl": "1.2", "t1_ph": "7.89"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.42", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.32"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "19.4", "t1_treated": "0.38", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "15.7", "t1_treated": "0.24", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "11.9", "t1_treated": "0.05", "t1_rcl": "0.8", "t1_ph": "7.29"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "10.21", "t1_treated": "1.65", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "5.86", "t1_treated": "0.322", "t1_rcl": "1", "t1_ph": "7.09"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.35", "t1_treated": "0.85", "t1_rcl": "0.9", "t1_ph": "6.62"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "8.23", "t1_treated": "0.1", "t1_rcl": "0.8", "t1_ph": "7.22"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.65", "t1_treated": "1.08", "t1_rcl": "0.6", "t1_ph": "6.72"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.2", "t1_treated": "0.9", "t1_rcl": "0.4", "t1_ph": "6.81"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "4.4", "t1_treated": "0.22", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.84", "t1_treated": "1.1", "t1_rcl": "0.8", "t1_ph": "6.85"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "3.52", "t1_treated": "0.42", "t1_rcl": "1", "t1_ph": "7.31"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "66.8", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "36.8", "t1_treated": "0.612", "t1_rcl": "1", "t1_ph": "6.96"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "14.6", "t1_treated": "0.38", "t1_rcl": "1", "t1_ph": "7.57"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "10.2", "t1_treated": "0.12", "t1_rcl": "1", "t1_ph": "6.95"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.43", "t1_treated": "2.33", "t1_rcl": "1.2", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.8", "t1_treated": "0.44", "t1_rcl": "0.7", "t1_ph": "7.3"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "19.57", "t1_treated": "0.34", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "23.8", "t1_treated": "0.14", "t1_rcl": "1", "t1_ph": "7.45"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "7.5", "t1_treated": "0.13", "t1_rcl": "0.78", "t1_ph": "6.96"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "20.5", "t1_treated": "0.17", "t1_rcl": "0.89", "t1_ph": "6.78"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "28.9", "t1_treated": "0.16", "t1_rcl": "1.18", "t1_ph": "7.04"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "19.02.2026": {"status": "submitted", "dateKey": "19.02.2026", "dateLabel": "19.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-19T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "8.4", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "4.05", "t1_treated": "0.24", "t1_rcl": "0.8", "t1_ph": "6.55"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "6.7", "t1_treated": "0.68", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "8.74", "t1_treated": "0.63", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "4.06", "t1_treated": "0.138", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.27", "t1_treated": "0.82", "t1_rcl": "6.42", "t1_ph": "0.8"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "12.33", "t1_treated": "1.49", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.57", "t1_treated": "1.45", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.42", "t1_treated": "0.59", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "72.5", "t1_treated": "1.63", "t1_rcl": "0.8", "t1_ph": "7.69"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "22.9", "t1_treated": "0.33", "t1_rcl": "1.2", "t1_ph": "7.83"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.4", "t1_treated": "0.19", "t1_rcl": "1", "t1_ph": "7.31"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "16.4", "t1_treated": "0.47", "t1_rcl": "1", "t1_ph": "7.6"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "20.3", "t1_treated": "0.26", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "7.22", "t1_treated": "0.075", "t1_rcl": "0.8", "t1_ph": "7.28"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "4.59", "t1_treated": "1.5", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "6.79", "t1_treated": "0.167", "t1_rcl": "1", "t1_ph": "6.77"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.31", "t1_treated": "0.83", "t1_rcl": "0.9", "t1_ph": "6.63"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "7.66", "t1_treated": "0.06", "t1_rcl": "0.8", "t1_ph": "7.3"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.41", "t1_treated": "1.07", "t1_rcl": "0.8", "t1_ph": "6.71"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.25", "t1_treated": "0.81", "t1_rcl": "0.4", "t1_ph": "6.92"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "3.75", "t1_treated": "0.26", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.73", "t1_treated": "1.03", "t1_rcl": "0.8", "t1_ph": "6.7"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.06", "t1_treated": "0.26", "t1_rcl": "1", "t1_ph": "7.22"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "18.1", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "48.2"}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "6.98", "t1_treated": "0.6", "t1_rcl": "1", "t1_ph": "6.84"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "30.5", "t1_treated": "0.44", "t1_rcl": "1", "t1_ph": "7.59"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.66", "t1_treated": "2.11", "t1_rcl": "1.2", "t1_ph": "7"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.79", "t1_treated": "0.45", "t1_rcl": "0.8", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "36.8", "t1_treated": "0.28", "t1_rcl": "1.2", "t1_ph": "7.3"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "73.6", "t1_treated": "0.14", "t1_rcl": "1.08", "t1_ph": "7.49"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "27", "t1_treated": "0.13", "t1_rcl": "0.78", "t1_ph": "7.23"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "13", "t1_treated": "0.16", "t1_rcl": "0.95", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "22.8", "t1_treated": "0.14", "t1_rcl": "1.21", "t1_ph": "7.07"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "20.02.2026": {"status": "submitted", "dateKey": "20.02.2026", "dateLabel": "20.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-20T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "10.1", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "12.85", "t1_treated": "0.14", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "6.01", "t1_treated": "0.36", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "9.31", "t1_treated": "0.23", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "5.45", "t1_treated": "0.153", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.45", "t1_treated": "0.74", "t1_rcl": "6.86", "t1_ph": "0.8"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "10.5", "t1_treated": "1.21", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "15.7", "t1_treated": "1.35", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.29", "t1_treated": "0.53", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "106", "t1_treated": "1.83", "t1_rcl": "0.9", "t1_ph": "7.76"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "22.4", "t1_treated": "0.42", "t1_rcl": "1", "t1_ph": "8"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "127", "t1_treated": "0.68", "t1_rcl": "1", "t1_ph": "7.07"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "18.7", "t1_treated": "0.28", "t1_rcl": "1", "t1_ph": "7.3"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "10.8", "t1_treated": "0.08", "t1_rcl": "0.8", "t1_ph": "7.21"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "5.92", "t1_treated": "1.95", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "5.62", "t1_treated": "0.17", "t1_rcl": "1", "t1_ph": "6.62"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "6.62", "t1_treated": "0.92", "t1_rcl": "0.8", "t1_ph": "6.65"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "7.41", "t1_treated": "0.09", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "6.69", "t1_treated": "0.98", "t1_rcl": "0.5", "t1_ph": "6.61"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.1", "t1_treated": "0.85", "t1_rcl": "0.5", "t1_ph": "6.92"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "3.66", "t1_treated": "0.19", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.69", "t1_treated": "0.94", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "0.48", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "48.2", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "5.23", "t1_treated": "0.22", "t1_rcl": "1", "t1_ph": "7.12"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "39.6", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.42"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "18.5", "t1_treated": "0.11", "t1_rcl": "1.09", "t1_ph": "6.98"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.56", "t1_treated": "2.17", "t1_rcl": "1.1", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.81", "t1_treated": "0.4", "t1_rcl": "0.8", "t1_ph": "7.3"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "19.7", "t1_treated": "0.57", "t1_rcl": "1.2", "t1_ph": "7.4"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "58.9", "t1_treated": "0.14", "t1_rcl": "1.09", "t1_ph": "7.31"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "25", "t1_treated": "0.15", "t1_rcl": "0.95", "t1_ph": "7.02"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "19.26", "t1_treated": "0.13", "t1_rcl": "0.83", "t1_ph": "6.97"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "18.9", "t1_treated": "0.16", "t1_rcl": "1.2", "t1_ph": "7"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "21.02.2026": {"status": "submitted", "dateKey": "21.02.2026", "dateLabel": "21.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-21T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "14.6", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "4.54", "t1_treated": "0.21", "t1_rcl": "0.8", "t1_ph": "6.6"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "9.3", "t1_treated": "1.12", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "7.91", "t1_treated": "0.61", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "2.96", "t1_treated": "0.136", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.42", "t1_treated": "0.93", "t1_rcl": "0.8", "t1_ph": "6.82"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.42", "t1_treated": "1.41", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "7.32", "t1_treated": "1.52", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.47", "t1_treated": "0.51", "t1_rcl": "", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "16.9", "t1_treated": "1.15", "t1_rcl": "1", "t1_ph": "7.68"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "27.8", "t1_treated": "0.51", "t1_rcl": "1.2", "t1_ph": "7.78"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.46", "t1_treated": "0.19", "t1_rcl": "1", "t1_ph": "7.32"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "86.2", "t1_treated": "0.45", "t1_rcl": "1", "t1_ph": "7.06"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "12.9", "t1_treated": "0.48", "t1_rcl": "1", "t1_ph": "7"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1.2", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "10.5", "t1_treated": "0.186", "t1_rcl": "0.9", "t1_ph": "7.25"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "10.57", "t1_treated": "1.66", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "4.47", "t1_treated": "0.204", "t1_rcl": "1", "t1_ph": "6.75"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.96", "t1_treated": "0.97", "t1_rcl": "0.9", "t1_ph": "6.64"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.39", "t1_treated": "0.1", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.01", "t1_treated": "1.13", "t1_rcl": "0.8", "t1_ph": "6.71"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.3", "t1_treated": "0.9", "t1_rcl": "0.4", "t1_ph": "6.99"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "3.26", "t1_treated": "0.28", "t1_rcl": "0.5", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.98", "t1_treated": "0.96", "t1_rcl": "0.8", "t1_ph": "6.9"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "0.53", "t1_treated": "1", "t1_rcl": "7.3", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "29.7", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "3.17", "t1_treated": "0.17", "t1_rcl": "0.9", "t1_ph": "7.5"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "24.7", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "66.1", "t1_treated": "0.1", "t1_rcl": "1.04", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.96", "t1_treated": "1.44", "t1_rcl": "1.3", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "3.92", "t1_treated": "0.41", "t1_rcl": "1", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "78.3", "t1_treated": "0.41", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "41.6", "t1_treated": "0.13", "t1_rcl": "0.91", "t1_ph": "7.7"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "8.5", "t1_treated": "0.13", "t1_rcl": "0.85", "t1_ph": "6.99"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "18.7", "t1_treated": "0.15", "t1_rcl": "0.85", "t1_ph": "6.88"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "11.5", "t1_treated": "0.14", "t1_rcl": "1.2", "t1_ph": ""}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "22.02.2026": {"status": "submitted", "dateKey": "22.02.2026", "dateLabel": "22.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-22T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "90.2", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "131", "t1_treated": "0.48", "t1_rcl": "0.8", "t1_ph": "6.7"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "107", "t1_treated": "1.75", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "-", "t1_treated": "0.23", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "41.7", "t1_treated": "0.296", "t1_rcl": "0.08", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "38.6", "t1_treated": "1.23", "t1_rcl": "0.8", "t1_ph": "6.79"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "98.77", "t1_treated": "1.5", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "23.5", "t1_treated": "1.67", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "16.71", "t1_treated": "0.73", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "29.3", "t1_treated": "1.94", "t1_rcl": "1", "t1_ph": "7.79"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "402", "t1_treated": "0.56", "t1_rcl": "1", "t1_ph": "7.66"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.42", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "6.97"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "216", "t1_treated": "0.51", "t1_rcl": "1", "t1_ph": "6.96"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "201.9", "t1_treated": "0.35", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "374.5", "t1_treated": "1.26", "t1_rcl": "0.9", "t1_ph": "7.42"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "91.7", "t1_treated": "2.99", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "211", "t1_treated": "0.328", "t1_rcl": "1", "t1_ph": "7.68"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "5.51", "t1_treated": "1.07", "t1_rcl": "0.9", "t1_ph": "6.67"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "69.7", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "7.25"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "3.04", "t1_treated": "1.2", "t1_rcl": "0.8", "t1_ph": "6.68"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "0.9", "t1_treated": "0.8", "t1_rcl": "0.5", "t1_ph": "9.84"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "10.2", "t1_treated": "0.35", "t1_rcl": "0.5", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.76", "t1_treated": "1.37", "t1_rcl": "0.8", "t1_ph": "6.7"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.12", "t1_treated": "0.59", "t1_rcl": "1", "t1_ph": "7.23"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "48.6", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "15.23", "t1_treated": "1.02", "t1_rcl": "1", "t1_ph": "7.05"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "25.6", "t1_treated": "0.44", "t1_rcl": "1", "t1_ph": "7.53"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "238", "t1_treated": "0.1", "t1_rcl": "1", "t1_ph": "7.01"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.67", "t1_treated": "1.44", "t1_rcl": "1.2", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "4.11", "t1_treated": "0.43", "t1_rcl": "0.7", "t1_ph": "7.3"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "76.7", "t1_treated": "0.32", "t1_rcl": "1.2", "t1_ph": "7.4"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "560", "t1_treated": "0.13", "t1_rcl": "1.08", "t1_ph": "7.31"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "100", "t1_treated": "0.25", "t1_rcl": "0.9", "t1_ph": "7.11"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "10.6", "t1_treated": "0.13", "t1_rcl": "1.05", "t1_ph": "7.02"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "205", "t1_treated": "0.18", "t1_rcl": "1.17", "t1_ph": "6.98"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "23.02.2026": {"status": "submitted", "dateKey": "23.02.2026", "dateLabel": "23.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-23T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "30.3", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "15.07", "t1_treated": "0.28", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "16.2", "t1_treated": "1.21", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "13.38", "t1_treated": "1.34", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "8.14", "t1_treated": "0.362", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "20.6", "t1_treated": "0.52", "t1_rcl": "0.8", "t1_ph": "6.91"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "12.4", "t1_treated": "1.4", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "9.57", "t1_treated": "1.47", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "3.03", "t1_treated": "0.86", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "7.54", "t1_treated": "1.16", "t1_rcl": "1", "t1_ph": "7.71"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "56.3", "t1_treated": "0.47", "t1_rcl": "1.2", "t1_ph": "7.588"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.42", "t1_treated": "0.26", "t1_rcl": "1", "t1_ph": "7.19"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "43.6", "t1_treated": "0.47", "t1_rcl": "1", "t1_ph": "7.55"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "184.9", "t1_treated": "0.12", "t1_rcl": "1", "t1_ph": "7.3"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "81.2", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "7.2"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "28.8", "t1_treated": "2.98", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "83.3", "t1_treated": "0.223", "t1_rcl": "1", "t1_ph": "7.69"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.56", "t1_treated": "0.81", "t1_rcl": "0.9", "t1_ph": "6.64"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "17.9", "t1_treated": "0.12", "t1_rcl": "0.9", "t1_ph": "7.25"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.67", "t1_treated": "0.85", "t1_rcl": "0.6", "t1_ph": "6.73"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.12", "t1_treated": "0.8", "t1_rcl": "0.4", "t1_ph": "6.85"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "20.3", "t1_treated": "1.47", "t1_rcl": "0.6", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "2.01", "t1_treated": "1.04", "t1_rcl": "0.7", "t1_ph": "6.82"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "0.89", "t1_treated": "0.55", "t1_rcl": "1", "t1_ph": "7.25"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "51.6", "t1_treated": "0.26", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "28.6", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.53"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "202.2", "t1_treated": "0.1", "t1_rcl": "1.06", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "2.43", "t1_treated": "1.11", "t1_rcl": "1.1", "t1_ph": "7"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "4.08", "t1_treated": "0.44", "t1_rcl": "0.8", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "93.5", "t1_treated": "1.29", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "254", "t1_treated": "0.15", "t1_rcl": "1.06", "t1_ph": "7.13"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.55", "t1_treated": "0.13", "t1_rcl": "0.81", "t1_ph": "6.99"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "212", "t1_treated": "0.23", "t1_rcl": "1.09", "t1_ph": "6.77"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "161", "t1_treated": "0.17", "t1_rcl": "1.21", "t1_ph": "7.02"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "24.02.2026": {"status": "submitted", "dateKey": "24.02.2026", "dateLabel": "24.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-24T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "15.4", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "10.94", "t1_treated": "0.21", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "11.1", "t1_treated": "0.45", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "23.14", "t1_treated": "1.17", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "6", "t1_treated": "0.167", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "13.2", "t1_treated": "0.93", "t1_rcl": "0.8", "t1_ph": "6.96"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.61", "t1_treated": "1.39", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "8.75", "t1_treated": "1.43", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.71", "t1_treated": "0.6", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "4.62", "t1_treated": "1.16", "t1_rcl": "1", "t1_ph": "7.63"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "58.7", "t1_treated": "0.78", "t1_rcl": "1.2", "t1_ph": "7.73"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "22.4", "t1_treated": "0.22", "t1_rcl": "1", "t1_ph": "7.9"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "75.5", "t1_treated": "0.27", "t1_rcl": "1", "t1_ph": "7.3"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "20.3", "t1_treated": "0.139", "t1_rcl": "0.8", "t1_ph": "7.29"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "14.7", "t1_treated": "2.8", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "32.8", "t1_treated": "0.357", "t1_rcl": "1", "t1_ph": "7.59"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.89", "t1_treated": "0.83", "t1_rcl": "0.9", "t1_ph": "6.65"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.11", "t1_treated": "0.04", "t1_rcl": "0.9", "t1_ph": "7.2"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.13", "t1_treated": "0.98", "t1_rcl": "0.6", "t1_ph": "6.75"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.3", "t1_treated": "0.9", "t1_rcl": "0.4", "t1_ph": "6.91"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "7.33", "t1_treated": "0.44", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.85", "t1_treated": "1.29", "t1_rcl": "0.8", "t1_ph": "6.67"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "0.91", "t1_treated": "0.53", "t1_rcl": "1", "t1_ph": "7.19"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "17.2", "t1_treated": "0.26", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "6.49", "t1_treated": "0.12", "t1_rcl": "0.9", "t1_ph": "7.11"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "28.2", "t1_treated": "0.29", "t1_rcl": "1", "t1_ph": "7.9"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "74.5", "t1_treated": "0.11", "t1_rcl": "1.02", "t1_ph": "6.93"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.44", "t1_treated": "1.13", "t1_rcl": "1.2", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "4.12", "t1_treated": "0.41", "t1_rcl": "0.8", "t1_ph": "7.3"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "20.9", "t1_treated": "0.38", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "62.1", "t1_treated": "0.14", "t1_rcl": "1.02", "t1_ph": "7.26"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.6", "t1_treated": "0.2", "t1_rcl": "0.93", "t1_ph": "7.01"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "94.8", "t1_treated": "0.18", "t1_rcl": "1.08", "t1_ph": "6.94"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "62.3", "t1_treated": "0.16", "t1_rcl": "1.22", "t1_ph": "7.02"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "25.02.2026": {"status": "submitted", "dateKey": "25.02.2026", "dateLabel": "25.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-25T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "16.4", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "8.8", "t1_treated": "0.26", "t1_rcl": "0.8", "t1_ph": "6.65"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "8.01", "t1_treated": "0.55", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "16.08", "t1_treated": "1.35", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "4.72", "t1_treated": "0.235", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "8.54", "t1_treated": "0.76", "t1_rcl": "0.8", "t1_ph": "6.89"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.51", "t1_treated": "1.38", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.75", "t1_treated": "1.45", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.71", "t1_treated": "0.52", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "3.95", "t1_treated": "0.968", "t1_rcl": "0.9", "t1_ph": "7.71"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "18.5", "t1_treated": "0.62", "t1_rcl": "1.2", "t1_ph": "7.69"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.32", "t1_treated": "0.28", "t1_rcl": "1", "t1_ph": "7.29"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "40.9", "t1_treated": "0.34", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "25.5", "t1_treated": "0.13", "t1_rcl": "0.8", "t1_ph": "7.33"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "9.73", "t1_treated": "1.77", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "17.06", "t1_treated": "0.483", "t1_rcl": "1", "t1_ph": "7.02"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.65", "t1_treated": "0.65", "t1_rcl": "0.9", "t1_ph": "6.67"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "9.08", "t1_treated": "0.05", "t1_rcl": "0.8", "t1_ph": "7.22"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.23", "t1_treated": "0.98", "t1_rcl": "0.6", "t1_ph": "6.7"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.3", "t1_treated": "0.8", "t1_rcl": "0.5", "t1_ph": "6.82"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "4.03", "t1_treated": "0.25", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.73", "t1_treated": "0.98", "t1_rcl": "0.8", "t1_ph": "6.73"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "0.88", "t1_treated": "0.5", "t1_rcl": "1", "t1_ph": "7.22"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.57", "t1_treated": "0.35", "t1_rcl": "1", "t1_ph": "6.85"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "62.1", "t1_treated": "0.41", "t1_rcl": "1", "t1_ph": "7.6"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "28.1", "t1_treated": "0.1", "t1_rcl": "1", "t1_ph": "7.02"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.11", "t1_treated": "1.13", "t1_rcl": "1.1", "t1_ph": "7"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "4.13", "t1_treated": "0.41", "t1_rcl": "0.8", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "61", "t1_treated": "1.26", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "40.7", "t1_treated": "0.11", "t1_rcl": "1.03", "t1_ph": "7.53"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.01", "t1_treated": "0.2", "t1_rcl": "0.94", "t1_ph": "7"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "18.9", "t1_treated": "0.15", "t1_rcl": "0.99", "t1_ph": "6.87"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "48.3", "t1_treated": "0.16", "t1_rcl": "1.21", "t1_ph": "7.03"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "26.02.2026": {"status": "submitted", "dateKey": "26.02.2026", "dateLabel": "26.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-26T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "12.2", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "7.76", "t1_treated": "0.19", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "8.5", "t1_treated": "0.6", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "9.21", "t1_treated": "0.87", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "5.1", "t1_treated": "0.148", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "8.31", "t1_treated": "0.29", "t1_rcl": "0.8", "t1_ph": "6.93"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.31", "t1_treated": "1.22", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.54", "t1_treated": "", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.58", "t1_treated": "0.6", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "5.23", "t1_treated": "0.861", "t1_rcl": "0.8", "t1_ph": "7.68"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "21.8", "t1_treated": "0.49", "t1_rcl": "1", "t1_ph": "7.69"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "13.04", "t1_treated": "0.43", "t1_rcl": "1", "t1_ph": "6.87"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "25", "t1_treated": "0.66", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "21.2", "t1_treated": "0.13", "t1_rcl": "0.8", "t1_ph": "7.26"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "7.29", "t1_treated": "1.9", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "11.1", "t1_treated": "0.37", "t1_rcl": "1", "t1_ph": "7.25"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.31", "t1_treated": "0.71", "t1_rcl": "0.9", "t1_ph": "6.71"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "6.87", "t1_treated": "0.04", "t1_rcl": "0.8", "t1_ph": "7.5"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.57", "t1_treated": "0.96", "t1_rcl": "0.8", "t1_ph": "6.67"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.4", "t1_treated": "0.9", "t1_rcl": "0.5", "t1_ph": "6.92"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "4.67", "t1_treated": "0.23", "t1_rcl": "0.4", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.52", "t1_treated": "0.95", "t1_rcl": "0.8", "t1_ph": "6.73"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.19", "t1_treated": "0.55", "t1_rcl": "1", "t1_ph": "7.31"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "16", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.07", "t1_treated": "0.24", "t1_rcl": "1", "t1_ph": "6.81"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "45.9", "t1_treated": "0.26", "t1_rcl": "1", "t1_ph": "7.74"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "42.5", "t1_treated": "0.12", "t1_rcl": "1.04", "t1_ph": "6.97"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.23", "t1_treated": "1.33", "t1_rcl": "1.2", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "4.11", "t1_treated": "0.43", "t1_rcl": "0.7", "t1_ph": "7.5"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "64", "t1_treated": "0.29", "t1_rcl": "1.2", "t1_ph": "7.3"}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "43.2", "t1_treated": "0.13", "t1_rcl": "0.98", "t1_ph": "7.23"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.5", "t1_treated": "0.12", "t1_rcl": "0.8", "t1_ph": "7.15"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "19.4", "t1_treated": "0.19", "t1_rcl": "0.95", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "27.6", "t1_treated": "0.1", "t1_rcl": "1.23", "t1_ph": "7.1"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "27.02.2026": {"status": "submitted", "dateKey": "27.02.2026", "dateLabel": "27.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-27T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "9", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "7.13", "t1_treated": "0.2", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "8.31", "t1_treated": "0.23", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "13.08", "t1_treated": "0.37", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "4.48", "t1_treated": "0.139", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "8.72", "t1_treated": "0.76", "t1_rcl": "0.8", "t1_ph": "0.86"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.44", "t1_treated": "1.27", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "7.52", "t1_treated": "1.48", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.41", "t1_treated": "0.51", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "2.32", "t1_treated": "0.619", "t1_rcl": "1", "t1_ph": "7.62"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "14.8", "t1_treated": "0.48", "t1_rcl": "1.2", "t1_ph": "7.78"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "12.6", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "17.7", "t1_treated": "0.5", "t1_rcl": "7.1", "t1_ph": "1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "9.3", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "7.21"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "13.1", "t1_treated": "1.47", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "9.07", "t1_treated": "0.232", "t1_rcl": "1", "t1_ph": "7.49"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.47", "t1_treated": "0.72", "t1_rcl": "0.9", "t1_ph": "6.71"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "7.34", "t1_treated": "0.03", "t1_rcl": "0.8", "t1_ph": "7.25"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.68", "t1_treated": "0.96", "t1_rcl": "0.8", "t1_ph": "6.64"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "2.97", "t1_treated": "0.21", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "0.93", "t1_treated": "0.52", "t1_rcl": "1", "t1_ph": "7.31"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "18.1", "t1_treated": "0.19", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.73", "t1_treated": "0.81", "t1_rcl": "1", "t1_ph": "7.03"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "33.6", "t1_treated": "0.3", "t1_rcl": "1", "t1_ph": "7.6"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "20.2", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "7.02"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.11", "t1_treated": "1.13", "t1_rcl": "1.3", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "4.1", "t1_treated": "0.44", "t1_rcl": "0.8", "t1_ph": "7.4"}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "21.2", "t1_treated": "0.11", "t1_rcl": "0.96", "t1_ph": "7.08"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.01", "t1_treated": "0.19", "t1_rcl": "0.83", "t1_ph": "7.01"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "13.2", "t1_treated": "0.13", "t1_rcl": "1.07", "t1_ph": "6.97"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "24.2", "t1_treated": "0.15", "t1_rcl": "1.22", "t1_ph": "7.1"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "28.02.2026": {"status": "submitted", "dateKey": "28.02.2026", "dateLabel": "28.02.2026", "timeLabel": "8.00am", "updatedAt": "2026-02-28T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "7.5", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "6.8", "t1_treated": "0.23", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "8.1", "t1_treated": "0.3", "t1_rcl": "0.9", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "6.16", "t1_treated": "1.05", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "4.13", "t1_treated": "0.175", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.79", "t1_treated": "0.7", "t1_rcl": "0.8", "t1_ph": "6.9"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.36", "t1_treated": "1.41", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "7.72", "t1_treated": "1.79", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.52", "t1_treated": "0.53", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "2.67", "t1_treated": "0.806", "t1_rcl": "0.8", "t1_ph": "7.59"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "11.9", "t1_treated": "0.42", "t1_rcl": "1.2", "t1_ph": "7.98"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "14.1", "t1_treated": "0.44", "t1_rcl": "1", "t1_ph": "7.44"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "7.57", "t1_treated": "0.19", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "10.7", "t1_treated": "0.2", "t1_rcl": "0.8", "t1_ph": "7.3"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "8.26", "t1_treated": "1.27", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "9.24", "t1_treated": "0.243", "t1_rcl": "1", "t1_ph": "7.25"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.47", "t1_treated": "0.64", "t1_rcl": "0.8", "t1_ph": "6.71"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "7.76", "t1_treated": "0.05", "t1_rcl": "0.9", "t1_ph": "7.2"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.56", "t1_treated": "0.93", "t1_rcl": "0.8", "t1_ph": "6.76"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "5.37", "t1_treated": "0.33", "t1_rcl": "0.6", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "0.91", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "7.21"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "16.2", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.31", "t1_treated": "0.38", "t1_rcl": "0.9", "t1_ph": "6.68"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "35.8", "t1_treated": "0.3", "t1_rcl": "1", "t1_ph": "7.77"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "24.1", "t1_treated": "0.1", "t1_rcl": "1.01", "t1_ph": "6.98"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "3.45", "t1_treated": "1.22", "t1_rcl": "1.2", "t1_ph": "7.1"}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "22.5", "t1_treated": "0.11", "t1_rcl": "0.96", "t1_ph": "7.31"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.02", "t1_treated": "0.2", "t1_rcl": "0.75", "t1_ph": "7.12"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "9.8", "t1_treated": "0.12", "t1_rcl": "0.86", "t1_ph": "7.03"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "15.9", "t1_treated": "0.16", "t1_rcl": "1.22", "t1_ph": "6.96"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "01.03.2026": {"status": "submitted", "dateKey": "01.03.2026", "dateLabel": "01.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-01T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "6.6", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "4.2", "t1_treated": "0.3", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "7.76", "t1_treated": "0.19", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "13.36", "t1_treated": "1.6", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "375", "t1_treated": "0.143", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.14", "t1_treated": "0.47", "t1_rcl": "0.9", "t1_ph": "6.9"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.44", "t1_treated": "1.3", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.67", "t1_treated": "1.45", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.36", "t1_treated": "0.54", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "5.53", "t1_treated": "0.78", "t1_rcl": "1", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "12.3", "t1_treated": "0.53", "t1_rcl": "1.2", "t1_ph": "7.98"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.42", "t1_treated": "0.22", "t1_rcl": "1", "t1_ph": "7.31"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "13.2", "t1_treated": "0.33", "t1_rcl": "1", "t1_ph": "7.47"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "19.7", "t1_treated": "0.25", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "13.5", "t1_treated": "0.13", "t1_rcl": "0.8", "t1_ph": "7.34"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "4.81", "t1_treated": "1.4", "t1_rcl": "1.1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "7.49", "t1_treated": "0.386", "t1_rcl": "1", "t1_ph": "7.15"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.34", "t1_treated": "0.85", "t1_rcl": "0.9", "t1_ph": "6.75"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "3.75", "t1_treated": "0.02", "t1_rcl": "0.8", "t1_ph": "7.3"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.56", "t1_treated": "1.04", "t1_rcl": "0.8", "t1_ph": "6.67"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.2", "t1_treated": "0.9", "t1_rcl": "0.6", "t1_ph": "6.87"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "4.73", "t1_treated": "0.42", "t1_rcl": "0.6", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.9", "t1_treated": "1.06", "t1_rcl": "0.8", "t1_ph": "6.94"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "1.05", "t1_treated": "0.42", "t1_rcl": "1", "t1_ph": "7.23"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "12.2", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "1.69", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.01"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "27", "t1_treated": "0.43", "t1_rcl": "1", "t1_ph": "7.64"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "18.5", "t1_treated": "0.12", "t1_rcl": "1.04", "t1_ph": "6.95"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "19.1", "t1_treated": "0.11", "t1_rcl": "1", "t1_ph": "7.26"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.71", "t1_treated": "0.2", "t1_rcl": "0.8", "t1_ph": "7.05"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "16", "t1_treated": "0.26", "t1_rcl": "1.05", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "14.3", "t1_treated": "0.14", "t1_rcl": "1.17", "t1_ph": "7"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "02.03.2026": {"status": "submitted", "dateKey": "02.03.2026", "dateLabel": "02.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-02T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "6.8", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "4.92", "t1_treated": "0.39", "t1_rcl": "0.8", "t1_ph": "6.55"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "7.13", "t1_treated": "0.2", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "8.31", "t1_treated": "1.95", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "5", "t1_treated": "0.17", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.4", "t1_treated": "0.37", "t1_rcl": "0.8", "t1_ph": "6.9"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.43", "t1_treated": "1.31", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.64", "t1_treated": "1.46", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.38", "t1_treated": "0.52", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "5.05", "t1_treated": "0.545", "t1_rcl": "1", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "11.3", "t1_treated": "0.47", "t1_rcl": "1", "t1_ph": "7.98"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.37", "t1_treated": "0.29", "t1_rcl": "1", "t1_ph": "7.32"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "10.5", "t1_treated": "0.49", "t1_rcl": "1", "t1_ph": "7.28"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "9.42", "t1_treated": "0.16", "t1_rcl": "1", "t1_ph": "7.3"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "10.8", "t1_treated": "0.15", "t1_rcl": "0.8", "t1_ph": "7.26"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "8.33", "t1_treated": "0.57", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "8.99", "t1_treated": "0.238", "t1_rcl": "1", "t1_ph": "7.62"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "1.04", "t1_treated": "0.76", "t1_rcl": "0.9", "t1_ph": "6.81"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "4.97", "t1_treated": "0.03", "t1_rcl": "0.8", "t1_ph": "7.25"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.56", "t1_treated": "0.95", "t1_rcl": "0.8", "t1_ph": "6.64"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.4", "t1_treated": "0.95", "t1_rcl": "0.6", "t1_ph": "6.74"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "4.17", "t1_treated": "0.23", "t1_rcl": "0.6", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.72", "t1_treated": "1.07", "t1_rcl": "0.8", "t1_ph": "6.82"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "3.09", "t1_treated": "0.45", "t1_rcl": "1", "t1_ph": "7.25"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "1.88", "t1_treated": "0.32", "t1_rcl": "0.9", "t1_ph": "6.77"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "23.5", "t1_treated": "0.4", "t1_rcl": "1", "t1_ph": "7.41"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19.9", "t1_treated": "0.1", "t1_rcl": "1.01", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "31.2", "t1_treated": "0.12", "t1_rcl": "1", "t1_ph": "7.09"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "4.96", "t1_treated": "0.17", "t1_rcl": "0.83", "t1_ph": "7.1"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "9.3", "t1_treated": "0.19", "t1_rcl": "1.07", "t1_ph": "6.7"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "20.4", "t1_treated": "0.15", "t1_rcl": "1.19", "t1_ph": "6.98"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "03.03.2026": {"status": "submitted", "dateKey": "03.03.2026", "dateLabel": "03.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-03T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "7.2", "t1_treated": "0.3", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "4.28", "t1_treated": "0.26", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "6.8", "t1_treated": "0.23", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "6.22", "t1_treated": "0.89", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "2.98", "t1_treated": "0.081", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.47", "t1_treated": "0.42", "t1_rcl": "0.8", "t1_ph": "6.85"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.38", "t1_treated": "1.3", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.56", "t1_treated": "1.46", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.39", "t1_treated": "0.47", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "5.09", "t1_treated": "0.619", "t1_rcl": "1", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "9.85", "t1_treated": "0.51", "t1_rcl": "1.2", "t1_ph": "7.96"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.39", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "7.32"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "10.03", "t1_treated": "0.22", "t1_rcl": "1", "t1_ph": "7.34"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "13.9", "t1_treated": "0.32", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "15.2", "t1_treated": "0.12", "t1_rcl": "0.8", "t1_ph": "7.3"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "4.57", "t1_treated": "1.58", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "5.87", "t1_treated": "0.044", "t1_rcl": "1", "t1_ph": "7.09"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "6.31", "t1_treated": "0.91", "t1_rcl": "0.9", "t1_ph": "6.67"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "4.31", "t1_treated": "0.02", "t1_rcl": "0.8", "t1_ph": "7.25"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.47", "t1_treated": "0.93", "t1_rcl": "0.7", "t1_ph": "6.59"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.25", "t1_treated": "0.8", "t1_rcl": "0.45", "t1_ph": "6.87"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "3.04", "t1_treated": "0.26", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.86", "t1_treated": "0.89", "t1_rcl": "0.8", "t1_ph": "6.74"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "3.34", "t1_treated": "0.18", "t1_rcl": "1", "t1_ph": "7.24"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "14.6", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.31", "t1_treated": "0.38", "t1_rcl": "0.9", "t1_ph": "6.68"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "18.1", "t1_treated": "0.33", "t1_rcl": "1", "t1_ph": "7.69"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19", "t1_treated": "0.11", "t1_rcl": "1", "t1_ph": "6.96"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "12.3", "t1_treated": "0.11", "t1_rcl": "0.82", "t1_ph": "7.32"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.11", "t1_treated": "0.13", "t1_rcl": "0.93", "t1_ph": "7.09"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "8.16", "t1_treated": "0.11", "t1_rcl": "1.07", "t1_ph": "6.9"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "14.3", "t1_treated": "0.13", "t1_rcl": "1.21", "t1_ph": "7.06"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "04.03.2026": {"status": "submitted", "dateKey": "04.03.2026", "dateLabel": "04.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-04T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "7.5", "t1_treated": "0.3", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.57", "t1_treated": "0.36", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "7", "t1_treated": "0.28", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "9.15", "t1_treated": "1.27", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "2.45", "t1_treated": "0.087", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.92", "t1_treated": "0.67", "t1_rcl": "6.88", "t1_ph": "0.8"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "9.41", "t1_treated": "1.29", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.76", "t1_treated": "1.43", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.29", "t1_treated": "0.49", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "5.05", "t1_treated": "0.546", "t1_rcl": "1", "t1_ph": "-"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "13.1", "t1_treated": "0.53", "t1_rcl": "1.2", "t1_ph": "7.87"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.36", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "1"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "10.2", "t1_treated": "0.24", "t1_rcl": "1", "t1_ph": "7.62"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "7.85", "t1_treated": "0.28", "t1_rcl": "1", "t1_ph": "7"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "15.9", "t1_treated": "0.13", "t1_rcl": "0.8", "t1_ph": "7.33"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "3.9", "t1_treated": "1.51", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "6.98", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "8.8"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "3.56", "t1_treated": "0.59", "t1_rcl": "0.9", "t1_ph": "6.69"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "5.44", "t1_treated": "0.03", "t1_rcl": "0.9", "t1_ph": "7.23"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.52", "t1_treated": "0.98", "t1_rcl": "0.6", "t1_ph": "6.75"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.3", "t1_treated": "0.95", "t1_rcl": "0.56", "t1_ph": "6.91"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "5.81", "t1_treated": "0.21", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.46", "t1_treated": "0.94", "t1_rcl": "0.8", "t1_ph": "6.92"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "2.13", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "7.23"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "9.2", "t1_treated": "0.18", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "1.57", "t1_treated": "0.14", "t1_rcl": "1", "t1_ph": "6.92"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "16.4", "t1_treated": "0.42", "t1_rcl": "1", "t1_ph": "7.78"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "30.1", "t1_treated": "0.11", "t1_rcl": "1", "t1_ph": "7.02"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "13.8", "t1_treated": "0.13", "t1_rcl": "1.08", "t1_ph": "7.18"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.5", "t1_treated": "0.13", "t1_rcl": "0.8", "t1_ph": "6.96"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "7.53", "t1_treated": "1.6", "t1_rcl": "0.98", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "10.3", "t1_treated": "0.14", "t1_rcl": "1.22", "t1_ph": "6.98"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "05.03.2026": {"status": "submitted", "dateKey": "05.03.2026", "dateLabel": "05.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-05T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "6.5", "t1_treated": "0.3", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.3", "t1_treated": "0.24", "t1_rcl": "0.8", "t1_ph": "6.5"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "6.2", "t1_treated": "0.28", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "20", "t1_treated": "1.23", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "3.99", "t1_treated": "0.115", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.7", "t1_treated": "0.43", "t1_rcl": "6.82", "t1_ph": "0.8"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.4", "t1_treated": "1.3", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.56", "t1_treated": "1.43", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.63", "t1_treated": "0.54", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "12.6", "t1_treated": "0.51", "t1_rcl": "1.2", "t1_ph": "7.83"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.38", "t1_treated": "0.19", "t1_rcl": "1", "t1_ph": "7.27"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "10.8", "t1_treated": "0.43", "t1_rcl": "1", "t1_ph": "7.43"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "8.71", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "12.6", "t1_treated": "0.12", "t1_rcl": "0.8", "t1_ph": "7.26"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "5.08", "t1_treated": "0.93", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "5.06", "t1_treated": "0.305", "t1_rcl": "1", "t1_ph": "7.81"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "4.32", "t1_treated": "0.75", "t1_rcl": "0.9", "t1_ph": "6.73"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "4.57", "t1_treated": "0.01", "t1_rcl": "7.5", "t1_ph": "0.9"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.71", "t1_treated": "0.93", "t1_rcl": "0.8", "t1_ph": "6.64"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.4", "t1_treated": "0.89", "t1_rcl": "0.5", "t1_ph": "6.82"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "4.81", "t1_treated": "0.26", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "2.06", "t1_treated": "0.93", "t1_rcl": "0.71", "t1_ph": "6.72"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "7.26", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.21"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "10.8", "t1_treated": "0.18", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "3.46", "t1_treated": "0.28", "t1_rcl": "0.9", "t1_ph": "6.74"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "14.9", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.62"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19.6", "t1_treated": "0.1", "t1_rcl": "1.06", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "13.3", "t1_treated": "0.15", "t1_rcl": "0.95", "t1_ph": "7.65"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5", "t1_treated": "0.12", "t1_rcl": "0.85", "t1_ph": "7.05"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "10.2", "t1_treated": "0.18", "t1_rcl": "0.92", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "18.4", "t1_treated": "0.15", "t1_rcl": "1.22", "t1_ph": "6.97"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "06.03.2026": {"status": "submitted", "dateKey": "06.03.2026", "dateLabel": "06.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-06T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "6.3", "t1_treated": "0.3", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.31", "t1_treated": "0.18", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "4.42", "t1_treated": "0.3", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "9.25", "t1_treated": "1.51", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "3.26", "t1_treated": "0.185", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.94", "t1_treated": "0.57", "t1_rcl": "6.83", "t1_ph": "0.8"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.26", "t1_treated": "1.21", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.83", "t1_treated": "1.58", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "2.07", "t1_treated": "0.47", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "4.22", "t1_treated": "0.657", "t1_rcl": "0.9", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "13.5", "t1_treated": "0.47", "t1_rcl": "1.2", "t1_ph": "7.86"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.39", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "7.27"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "9.47", "t1_treated": "0.18", "t1_rcl": "1", "t1_ph": "7.49"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "24.8", "t1_treated": "0.41", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "16", "t1_treated": "0.17", "t1_rcl": "0.8", "t1_ph": "7.27"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "5.11", "t1_treated": "0.51", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "5.1", "t1_treated": "0.251", "t1_rcl": "1", "t1_ph": "7.85"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.61", "t1_treated": "0.48", "t1_rcl": "0.9", "t1_ph": "6.7"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "4.87", "t1_treated": "0.03", "t1_rcl": "7.25", "t1_ph": "0.9"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.65", "t1_treated": "0.57", "t1_rcl": "0.6", "t1_ph": "6.63"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1", "t1_treated": "0.9", "t1_rcl": "0.8", "t1_ph": "6.86"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "3.85", "t1_treated": "0.23", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.777", "t1_treated": "2.05", "t1_rcl": "0.7", "t1_ph": "6.8"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "2.54", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.25"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "8.6", "t1_treated": "0.13", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "1.83", "t1_treated": "0.8", "t1_rcl": "1", "t1_ph": "7.02"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "12.2", "t1_treated": "0.41", "t1_rcl": "1", "t1_ph": "7.74"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "17.1", "t1_treated": "0.11", "t1_rcl": "1.01", "t1_ph": "7.01"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "9.12", "t1_treated": "0.16", "t1_rcl": "1.2", "t1_ph": "7.27"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.5", "t1_treated": "0.11", "t1_rcl": "0.85", "t1_ph": "6.8"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "7.34", "t1_treated": "0.17", "t1_rcl": "0.76", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "12.4", "t1_treated": "0.14", "t1_rcl": "1.18", "t1_ph": "6.99"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "07.03.2026": {"status": "submitted", "dateKey": "07.03.2026", "dateLabel": "07.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-07T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "6.5", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "8.76", "t1_treated": "0.13", "t1_rcl": "0.8", "t1_ph": "6.55"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "3.56", "t1_treated": "0.58", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "8.93", "t1_treated": "1.19", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "2.65", "t1_treated": "0.071", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.9", "t1_treated": "0.52", "t1_rcl": "6.96", "t1_ph": "0.8"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.25", "t1_treated": "1.3", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.68", "t1_treated": "1.43", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.71", "t1_treated": "0.5", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "13.3", "t1_treated": "0.724", "t1_rcl": "1", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "14.5", "t1_treated": "0.45", "t1_rcl": "1.2", "t1_ph": "7.81"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.4", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.29"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "9.3", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "7.26"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "10.1", "t1_treated": "0.44", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "4.99", "t1_treated": "0.95", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "6.1", "t1_treated": "0.274", "t1_rcl": "1", "t1_ph": "7.42"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.49", "t1_treated": "0.42", "t1_rcl": "0.9", "t1_ph": "6.73"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "4.99", "t1_treated": "0.04", "t1_rcl": "7.2", "t1_ph": "0.8"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.52", "t1_treated": "0.51", "t1_rcl": "0.6", "t1_ph": "6.7"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.01", "t1_treated": "0.82", "t1_rcl": "0.6", "t1_ph": "6.71"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "5", "t1_treated": "0.28", "t1_rcl": "0.6", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "0.96", "t1_treated": "0.9", "t1_rcl": "0..8", "t1_ph": "6.62"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "5.1", "t1_treated": "0.19", "t1_rcl": "1", "t1_ph": "7.33"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "9.2", "t1_treated": "0.16", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "1.8", "t1_treated": "0.37", "t1_rcl": "0.9", "t1_ph": "6.74"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "10.6", "t1_treated": "0.37", "t1_rcl": "1", "t1_ph": "7.79"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19.6", "t1_treated": "0.1", "t1_rcl": "1", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "6.64", "t1_treated": "0.14", "t1_rcl": "0.88", "t1_ph": "7.5"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.22", "t1_treated": "0.12", "t1_rcl": "0.8", "t1_ph": "7.06"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "11.16", "t1_treated": "0.13", "t1_rcl": "1.06", "t1_ph": "6.97"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "15.3", "t1_treated": "0.14", "t1_rcl": "1.21", "t1_ph": "6.98"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "08.03.2026": {"status": "submitted", "dateKey": "08.03.2026", "dateLabel": "08.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-08T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "6.5", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.97", "t1_treated": "0.18", "t1_rcl": "0.8", "t1_ph": "6.65"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "4.3", "t1_treated": "0.52", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "7.91", "t1_treated": "0.99", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "2.57", "t1_treated": "0.075", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.21", "t1_treated": "0.23", "t1_rcl": "6.9", "t1_ph": "0.8"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.23", "t1_treated": "1.25", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.47", "t1_treated": "1.46", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.57", "t1_treated": "0.6", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "13.7", "t1_treated": "0.52", "t1_rcl": "1.2", "t1_ph": ".7.88"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.39", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "7.08"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "9.83", "t1_treated": "0.38", "t1_rcl": "1", "t1_ph": "7.28"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "", "t1_treated": "0.28", "t1_rcl": "1", "t1_ph": "7"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "16", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "7.33"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "6.28", "t1_treated": "1.37", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "6.82", "t1_treated": "0.051", "t1_rcl": "1", "t1_ph": "7.27"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.26", "t1_treated": "0.38", "t1_rcl": "0.8", "t1_ph": "6.67"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "4.77", "t1_treated": "0.02", "t1_rcl": "7.25", "t1_ph": "0.8"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.48", "t1_treated": "0.49", "t1_rcl": "0.6", "t1_ph": "6.61"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.1", "t1_treated": "0.9", "t1_rcl": "0.8", "t1_ph": "6.8"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "4.91", "t1_treated": "0.24", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1", "t1_treated": "0.92", "t1_rcl": "0.8", "t1_ph": "6.8"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "2.9", "t1_treated": "0.09", "t1_rcl": "1", "t1_ph": "7.26"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "9.7", "t1_treated": "0.13", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "1.9", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": "7.16"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "8.7", "t1_treated": "0.43", "t1_rcl": "1", "t1_ph": "7.76"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "26.5", "t1_treated": "0.1", "t1_rcl": "1", "t1_ph": "7"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "10.4", "t1_treated": "0.2", "t1_rcl": "0.91", "t1_ph": "7.42"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5", "t1_treated": "0.18", "t1_rcl": "0.88", "t1_ph": "7"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "7.28", "t1_treated": "0.16", "t1_rcl": "1.01", "t1_ph": "6.97"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "13.8", "t1_treated": "0.15", "t1_rcl": "1.16", "t1_ph": "7"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "09.03.2026": {"status": "submitted", "dateKey": "09.03.2026", "dateLabel": "09.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-09T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "7.6", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.8", "t1_treated": "0.18", "t1_rcl": "0.8", "t1_ph": "6.6"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "4.14", "t1_treated": "0.67", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "6.39", "t1_treated": "0.45", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "1.96", "t1_treated": "0.136", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.95", "t1_treated": "0.18", "t1_rcl": "6.89", "t1_ph": "0.8"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.4", "t1_treated": "1.27", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.64", "t1_treated": "1.35", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "0.57", "t1_treated": "1.73", "t1_rcl": "0.57", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "5.2", "t1_treated": "0.616", "t1_rcl": "0.9", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "14.7", "t1_treated": "0.48", "t1_rcl": "1.2", "t1_ph": "7.85"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.44", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "7.25"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "7.48", "t1_treated": "0.4", "t1_rcl": "1", "t1_ph": "6.58"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "20.7", "t1_treated": "0.64", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "9.5", "t1_treated": "0.1", "t1_rcl": "0.8", "t1_ph": "7.29"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "4.18", "t1_treated": "1.03", "t1_rcl": "1.2", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "8.43", "t1_treated": "0.281", "t1_rcl": "1", "t1_ph": "7.56"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.08", "t1_treated": "0.42", "t1_rcl": "0.9", "t1_ph": "6.65"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "4.99", "t1_treated": "0.01", "t1_rcl": "7.3", "t1_ph": "0.8"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.53", "t1_treated": "0.46", "t1_rcl": "0.5", "t1_ph": "6.67"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.12", "t1_treated": "0.91", "t1_rcl": "0.6", "t1_ph": "6.82"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "4.21", "t1_treated": "0.2", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "2.33", "t1_treated": "0.73", "t1_rcl": "0.8", "t1_ph": "6.82"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "3.12", "t1_treated": "0.13", "t1_rcl": "1", "t1_ph": "7.36"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "8.1", "t1_treated": "0.13", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.02", "t1_treated": "0.17", "t1_rcl": "1", "t1_ph": "6.81"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "6.44", "t1_treated": "0.33", "t1_rcl": "1", "t1_ph": "7.71"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "17.8", "t1_treated": "0.11", "t1_rcl": "0.99", "t1_ph": "6.97"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "16.2", "t1_treated": "0.22", "t1_rcl": "0.94", "t1_ph": "7.54"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.5", "t1_treated": "0.12", "t1_rcl": "0.8", "t1_ph": "6.9"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "14", "t1_treated": "0.19", "t1_rcl": "0.88", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "19.4", "t1_treated": "0.14", "t1_rcl": "1.21", "t1_ph": "7.09"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "10.03.2026": {"status": "submitted", "dateKey": "10.03.2026", "dateLabel": "10.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-10T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "8.4", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.61", "t1_treated": "0.17", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "4.3", "t1_treated": "0.58", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "2.06", "t1_treated": "0.093", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.16", "t1_treated": "0.61", "t1_rcl": "0.8", "t1_ph": "6.87"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.37", "t1_treated": "1.25", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.64", "t1_treated": "1.43", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.3", "t1_treated": "0.4", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "4.37", "t1_treated": "0.351", "t1_rcl": "0.9", "t1_ph": ""}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "11.4", "t1_treated": "0.53", "t1_rcl": "1.2", "t1_ph": "8.37"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.38", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.2"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "10.16", "t1_treated": "0.16", "t1_rcl": "1", "t1_ph": "6.78"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "13", "t1_treated": "0.44", "t1_rcl": "1", "t1_ph": "7"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "10.4", "t1_treated": "0.09", "t1_rcl": "0.8", "t1_ph": "7.29"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "2.99", "t1_treated": "0.69", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "5.33", "t1_treated": "0.294", "t1_rcl": "1", "t1_ph": "7.51"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "5.37", "t1_treated": "0.71", "t1_rcl": "6.63", "t1_ph": "0.9"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "4.37", "t1_treated": "0.03", "t1_rcl": "7.25", "t1_ph": "0.9"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.31", "t1_treated": "0.87", "t1_rcl": "6.61", "t1_ph": "0.7"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.3", "t1_treated": "0.9", "t1_rcl": "0.6", "t1_ph": "6.84"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "2.54", "t1_treated": "0.9", "t1_rcl": "0.6", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "2.35", "t1_treated": "0.62", "t1_rcl": "0.6", "t1_ph": "6.91"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "9.82", "t1_treated": "0.16", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "0.86", "t1_treated": "0.24", "t1_rcl": "0.9", "t1_ph": ""}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "6.37", "t1_treated": "0.38", "t1_rcl": "1", "t1_ph": "7.72"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19.1", "t1_treated": "0.1", "t1_rcl": "1.06", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "12.1", "t1_treated": "0.14", "t1_rcl": "1.03", "t1_ph": "7.55"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5", "t1_treated": "0.12", "t1_rcl": "0.85", "t1_ph": "7.1"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "6.9", "t1_treated": "0.16", "t1_rcl": "0.89", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "16.6", "t1_treated": "0.15", "t1_rcl": "1.23", "t1_ph": "7.07"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "11.03.2026": {"status": "submitted", "dateKey": "11.03.2026", "dateLabel": "11.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-11T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "6", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.19", "t1_treated": "0.21", "t1_rcl": "0.8", "t1_ph": "6.3"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "4.4", "t1_treated": "0.6", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "1.91", "t1_treated": "0.119", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "6.62", "t1_treated": "0.67", "t1_rcl": "0.8", "t1_ph": "6.85"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.31", "t1_treated": "1.21", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "5.76", "t1_treated": "1.46", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "1.81", "t1_treated": "0.51", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "4.6", "t1_treated": "0.572", "t1_rcl": "1", "t1_ph": "7.32"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "18.9", "t1_treated": "0.42", "t1_rcl": "1.2", "t1_ph": "7.84"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.46", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.19"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "9.88", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.11"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "8.6", "t1_treated": "0.1", "t1_rcl": "0.8", "t1_ph": "7.27"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "2.88", "t1_treated": "0.91", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "6.5", "t1_treated": "0.305", "t1_rcl": "1", "t1_ph": "7.58"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.79", "t1_treated": "0.62", "t1_rcl": "0.9", "t1_ph": "6.71"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "4.77", "t1_treated": "0.02", "t1_rcl": "7.2", "t1_ph": "0.8"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.76", "t1_treated": "0.89", "t1_rcl": "0.8", "t1_ph": "6.57"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.25", "t1_treated": "0.8", "t1_rcl": "0.6", "t1_ph": "6.82"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "3.21", "t1_treated": "0.16", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "2.12", "t1_treated": "0.53", "t1_rcl": "0.6", "t1_ph": "6.7"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "3.78", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.19"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "14.3", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.75", "t1_treated": "0.27", "t1_rcl": "1", "t1_ph": "6.79"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "4.12", "t1_treated": "0.3", "t1_rcl": "1", "t1_ph": "7.62"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "33.5", "t1_treated": "0.1", "t1_rcl": "1", "t1_ph": "7.02"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "13.2", "t1_treated": "0.12", "t1_rcl": "0.8", "t1_ph": "7.55"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.3", "t1_treated": "0.2", "t1_rcl": "0.93", "t1_ph": "7.19"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "9.85", "t1_treated": "0.18", "t1_rcl": "0.98", "t1_ph": "6.7"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "15.8", "t1_treated": "0.12", "t1_rcl": "1.22", "t1_ph": "6.9"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "12.03.2026": {"status": "submitted", "dateKey": "12.03.2026", "dateLabel": "12.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-12T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "6.7", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.62", "t1_treated": "0.17", "t1_rcl": "0.9", "t1_ph": "6.55"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "4", "t1_treated": "0.5", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "2.7", "t1_treated": "0.119", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "8.35", "t1_treated": "0.52", "t1_rcl": "0..8", "t1_ph": "6.92"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.27", "t1_treated": "1.27", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.78", "t1_treated": "1.45", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "2.88", "t1_treated": "0.6", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "4.6", "t1_treated": "0.491", "t1_rcl": "1", "t1_ph": "7.37"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "22.5", "t1_treated": "0.54", "t1_rcl": "1.2", "t1_ph": "7.95"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.47", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": "7.22"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "8.66", "t1_treated": "0.49", "t1_rcl": "1", "t1_ph": "6.76"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "14.3", "t1_treated": "0.49", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "9.7", "t1_treated": "0.1", "t1_rcl": "0.8", "t1_ph": "7.25"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "6.68", "t1_treated": "0.7", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "7.3", "t1_treated": "0.347", "t1_rcl": "1", "t1_ph": "7.83"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "3.15", "t1_treated": "0.65", "t1_rcl": "0.9", "t1_ph": "6.75"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "5.98", "t1_treated": "0.04", "t1_rcl": "7.25", "t1_ph": "0.9"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.76", "t1_treated": "0.86", "t1_rcl": "0.7", "t1_ph": "6.68"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1", "t1_treated": "0.81", "t1_rcl": "0.6", "t1_ph": "6.5"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "2.19", "t1_treated": "0.21", "t1_rcl": "0.6", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "2", "t1_treated": "0.82", "t1_rcl": "0.8", "t1_ph": "6.81"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "3.54", "t1_treated": "0.14", "t1_rcl": "1", "t1_ph": "7.21"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "26.1", "t1_treated": "0.19", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.74", "t1_treated": "0.21", "t1_rcl": "0.9", "t1_ph": "6.82"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "4.12", "t1_treated": "0.3", "t1_rcl": "1", "t1_ph": "7.62"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19.9", "t1_treated": "0.11", "t1_rcl": "0.98", "t1_ph": "6.98"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "16.7", "t1_treated": "0.14", "t1_rcl": "1.03", "t1_ph": "7.63"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5.13", "t1_treated": "0.13", "t1_rcl": "0.85", "t1_ph": "7"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "6.12", "t1_treated": "0.15", "t1_rcl": "1.07", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "16.8", "t1_treated": "0.13", "t1_rcl": "1.19", "t1_ph": "6.99"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "13.03.2026": {"status": "submitted", "dateKey": "13.03.2026", "dateLabel": "13.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-13T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "6.7", "t1_treated": "0.3", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.11", "t1_treated": "0.19", "t1_rcl": "0.8", "t1_ph": "6.4"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "3.8", "t1_treated": "0.4", "t1_rcl": "0.9", "t1_ph": "-"}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "1.93", "t1_treated": "0.138", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.64", "t1_treated": "0.71", "t1_rcl": "0.8", "t1_ph": "6.88"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.25", "t1_treated": "1.32", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.78", "t1_treated": "1.65", "t1_rcl": "0.7", "t1_ph": ""}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "-", "t1_treated": "-", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "15.24", "t1_treated": "0.74", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "2.23", "t1_treated": "0.329", "t1_rcl": "1", "t1_ph": "7.26"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "24.3", "t1_treated": "0.51", "t1_rcl": "1.2", "t1_ph": "7.93"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.49", "t1_treated": "0.21", "t1_rcl": "1", "t1_ph": "7.26"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "221", "t1_treated": "0.42", "t1_rcl": "1", "t1_ph": "6.93"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "38.7", "t1_treated": "0.47", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "1", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "9.4", "t1_treated": "0.1", "t1_rcl": "0.8", "t1_ph": "7.36"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "7.55", "t1_treated": "0.77", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "7.1", "t1_treated": "0.138", "t1_rcl": "1", "t1_ph": "8.21"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "2.62", "t1_treated": "0.61", "t1_rcl": "0.8", "t1_ph": "6.62"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "5.88", "t1_treated": "0.05", "t1_rcl": "7.2", "t1_ph": "0.8"}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "1.72", "t1_treated": "0.89", "t1_rcl": "0.6", "t1_ph": "6.68"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1.1", "t1_treated": "0.9", "t1_rcl": "0.6", "t1_ph": "6.55"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "22.3", "t1_treated": "0.18", "t1_rcl": "0.5", "t1_ph": "-"}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.8", "t1_treated": "1", "t1_rcl": "0.8", "t1_ph": "6.9"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.4", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "3.09", "t1_treated": "0.15", "t1_rcl": "1", "t1_ph": "7.38"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "708.1", "t1_treated": "0.23", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.64", "t1_treated": "0.57", "t1_rcl": "0.9", "t1_ph": "6.92"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "4.27", "t1_treated": "0.33", "t1_rcl": "1", "t1_ph": "7.66"}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "16.6", "t1_treated": "0.1", "t1_rcl": "1.08", "t1_ph": "6.99"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "26.7", "t1_treated": "0.17", "t1_rcl": "0.96", "t1_ph": "7.64"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "4.8", "t1_treated": "0.14", "t1_rcl": "0.93", "t1_ph": "7.16"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "8.56", "t1_treated": "0.15", "t1_rcl": "0.75", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "17.4", "t1_treated": "0.16", "t1_rcl": "1.18", "t1_ph": "7.01"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "14.03.2026": {"status": "submitted", "dateKey": "14.03.2026", "dateLabel": "14.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-14T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "7.5", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "3.02", "t1_treated": "0.19", "t1_rcl": "0.8", "t1_ph": "6.6"}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "2.1", "t1_treated": "0.063", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "7.27", "t1_treated": "0.44", "t1_rcl": "0.8", "t1_ph": "6.86"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.36", "t1_treated": "1.26", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.75", "t1_treated": "1.46", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "16", "t1_treated": "0.63", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "3.42", "t1_treated": "1.36", "t1_rcl": "0.9", "t1_ph": "7.68"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "20.3", "t1_treated": "0.49", "t1_rcl": "1.2", "t1_ph": "7.95"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.38", "t1_treated": "0.26", "t1_rcl": "1", "t1_ph": "7.31"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "150.3", "t1_treated": "0.47", "t1_rcl": "1", "t1_ph": "6.56"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "13.3", "t1_treated": "0.17", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "31.1", "t1_treated": "0.19", "t1_rcl": "0.8", "t1_ph": "7.28"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "154", "t1_treated": "2.99", "t1_rcl": "1", "t1_ph": "7"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "7.85", "t1_treated": "0.285", "t1_rcl": "1", "t1_ph": "7.59"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "27.5", "t1_treated": "0.91", "t1_rcl": "0.9", "t1_ph": "6.84"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.91", "t1_treated": "0.98", "t1_rcl": "0.5", "t1_ph": "6.75"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "1", "t1_treated": "0.79", "t1_rcl": "0.6", "t1_ph": "6.81"}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "1.66", "t1_treated": "0.92", "t1_rcl": "0.8", "t1_ph": "6.72"}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "3.77", "t1_treated": "0.14", "t1_rcl": "1", "t1_ph": "7.26"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "30.4", "t1_treated": "0.28", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "2.64", "t1_treated": "0.57", "t1_rcl": "0.9", "t1_ph": "6.92"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "13.8", "t1_treated": "0.12", "t1_rcl": "1", "t1_ph": "7.01"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "50.5", "t1_treated": "0.13", "t1_rcl": "1.04", "t1_ph": "7.76"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "6.8", "t1_treated": "0.11", "t1_rcl": "0.8", "t1_ph": "6.99"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "7.14", "t1_treated": "0.12", "t1_rcl": "0.85", "t1_ph": "6.95"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "18.9", "t1_treated": "0.16", "t1_rcl": "1.22", "t1_ph": "7.06"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}, "15.03.2026": {"status": "submitted", "dateKey": "15.03.2026", "dateLabel": "15.03.2026", "timeLabel": "8.00am", "updatedAt": "2026-03-15T00:00:00.000Z", "rows": [{"type": "section", "label": "Kandy District"}, {"no": "1", "region": "Central South", "plant": "Kandy South", "capacity": "32000", "connections": "48304", "t1_raw": "7.3", "t1_treated": "0.2", "t1_rcl": "0.7", "t1_ph": "6.5"}, {"no": "2", "region": "", "plant": "Elpitiya", "capacity": "7000", "connections": "4739", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Nillambe", "capacity": "14500", "connections": "21150", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Hanthana", "capacity": "48052", "connections": "823", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Paradeka", "capacity": "6000", "connections": "6661", "t1_raw": "2.4", "t1_treated": "0.127", "t1_rcl": "0.8", "t1_ph": "7"}, {"no": "-", "region": "", "plant": "Ulapane", "capacity": "8500", "connections": "11000", "t1_raw": "9.53", "t1_treated": "0.95", "t1_rcl": "0.8", "t1_ph": "6.85"}, {"no": "7", "region": "", "plant": "Gampola Watta", "capacity": "1200", "connections": "1259", "t1_raw": "8.33", "t1_treated": "1.3", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "8", "region": "", "plant": "Doluwa", "capacity": "250", "connections": "483", "t1_raw": "6.75", "t1_treated": "1.46", "t1_rcl": "0.7", "t1_ph": "-"}, {"no": "9", "region": "", "plant": "Datrry", "capacity": "500", "connections": "149", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Pussellawa", "capacity": "750", "connections": "1838", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "11", "region": "", "plant": "Nawalapitiya", "capacity": "4500", "connections": "6706", "t1_raw": "2.74", "t1_treated": "0.62", "t1_rcl": "0.8", "t1_ph": "-"}, {"no": "12", "region": "Central East", "plant": "Araththana", "capacity": "1500", "connections": "33462", "t1_raw": "3.77", "t1_treated": "0.941", "t1_rcl": "1", "t1_ph": "7.71"}, {"no": "13", "region": "", "plant": "Balagolla", "capacity": "1300", "connections": "9663", "t1_raw": "20.6", "t1_treated": "0.56", "t1_rcl": "1.2", "t1_ph": "7.9"}, {"no": "14", "region": "", "plant": "Madadumbara", "capacity": "3000", "connections": "7392", "t1_raw": "0.4", "t1_treated": "0.19", "t1_rcl": "1", "t1_ph": "7.32"}, {"no": "15", "region": "", "plant": "Marassana", "capacity": "3000", "connections": "6293", "t1_raw": "23.9", "t1_treated": "0.36", "t1_rcl": "1", "t1_ph": "7.04"}, {"no": "16", "region": "", "plant": "Haragama", "capacity": "2400", "connections": "5829", "t1_raw": "14.2", "t1_treated": "0.46", "t1_rcl": "1", "t1_ph": "7.1"}, {"no": "17", "region": "", "plant": "Ampitiya", "capacity": "4700", "connections": "7500", "t1_raw": "", "t1_treated": "", "t1_rcl": "0.8", "t1_ph": ""}, {"no": "18", "region": "Central North", "plant": "GKWTP", "capacity": "65000", "connections": "60446", "t1_raw": "152", "t1_treated": "0.13", "t1_rcl": "0.8", "t1_ph": "7.33"}, {"no": "19", "region": "", "plant": "Galagedara", "capacity": "1200", "connections": "3131", "t1_raw": "33.2", "t1_treated": "2.99", "t1_rcl": "1", "t1_ph": "7.5"}, {"no": "20", "region": "", "plant": "Polgolla", "capacity": "10000", "connections": "21766", "t1_raw": "21.6", "t1_treated": "0.764", "t1_rcl": "1", "t1_ph": "7.18"}, {"no": "", "region": "Total", "plant": "20", "capacity": "", "connections": "159773", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Nuwara Eliya District"}, {"no": "1", "region": "Central South", "plant": "Thalawakele", "capacity": "2000", "connections": "2446", "t1_raw": "3.91", "t1_treated": "1.41", "t1_rcl": "0.9", "t1_ph": "6.61"}, {"no": "2", "region": "Ginigaththene", "plant": "Ginigathhena", "capacity": "1200", "connections": "2994", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "3", "region": "", "plant": "Pudaluoya", "capacity": "800", "connections": "885", "t1_raw": "2.08", "t1_treated": "0.98", "t1_rcl": "0.6", "t1_ph": "6.72"}, {"no": "0", "region": "", "plant": "Kotagala", "capacity": "900", "connections": "1298", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Maskeliya", "capacity": "780", "connections": "1999", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "Hatton", "capacity": "3000", "connections": "4832", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "7", "region": "", "plant": "Nallathanniya", "capacity": "30", "connections": "133", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "8", "region": "Central East", "plant": "Ragala", "capacity": "800", "connections": "2305", "t1_raw": "2.9", "t1_treated": "0.09", "t1_rcl": "1", "t1_ph": "7.3"}, {"no": "9", "region": "", "plant": "Walapane", "capacity": "1000", "connections": "2916", "t1_raw": "22.7", "t1_treated": "0.2", "t1_rcl": "1", "t1_ph": ""}, {"no": "10", "region": "", "plant": "Rikillagaskada", "capacity": "3600", "connections": "7836", "t1_raw": "4.12", "t1_treated": "0.914", "t1_rcl": "1", "t1_ph": "6.83"}, {"no": "", "region": "Total", "plant": "10", "capacity": "", "connections": "27644", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"type": "section", "label": "Matale District"}, {"no": "1", "region": "", "plant": "Dambulla", "capacity": "30000", "connections": "14060", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "2", "region": "", "plant": "Matale", "capacity": "30000", "connections": "27154", "t1_raw": "19.9", "t1_treated": "0.11", "t1_rcl": "0.99", "t1_ph": "6.96"}, {"no": "3", "region": "", "plant": "Pussella", "capacity": "300", "connections": "1072", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "4", "region": "", "plant": "Naula", "capacity": "1800", "connections": "5470", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "5", "region": "", "plant": "Wilgamuwa", "capacity": "500", "connections": "1042", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "6", "region": "", "plant": "Ambanganga", "capacity": "18000", "connections": "9222", "t1_raw": "14.6", "t1_treated": "0.14", "t1_rcl": "0.97", "t1_ph": "7.78"}, {"no": "7", "region": "", "plant": "Rattota", "capacity": "9000", "connections": "3957", "t1_raw": "5", "t1_treated": "0.17", "t1_rcl": "0.78", "t1_ph": "7.05"}, {"no": "8", "region": "", "plant": "Ukuwela", "capacity": "9000", "connections": "6170", "t1_raw": "49", "t1_treated": "0.14", "t1_rcl": "1.02", "t1_ph": "6.8"}, {"no": "9", "region": "", "plant": "Udathanna", "capacity": "9000", "connections": "6887", "t1_raw": "41.3", "t1_treated": "0.17", "t1_rcl": "1.22", "t1_ph": "6.99"}, {"no": "", "region": "Total", "plant": "9", "capacity": "", "connections": "75034", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}, {"no": "", "region": "", "plant": "", "capacity": "", "connections": "361272", "t1_raw": "", "t1_treated": "", "t1_rcl": "", "t1_ph": ""}]}};

async function seedHistoricalDataOnce(){
  try{
    const flagKey = "wq_seed_v4_full_jan29_to_mar15_done";
    if(localStorage.getItem(flagKey)==="1") return;

    let seededCount = 0;

    // Seed only if the doc doesn't already exist (no overwrites)
    for(const [key,payload] of Object.entries(HISTORICAL_SEED)){
      const ref = doc(db, FIRESTORE_COLLECTION, key);
      const snap = await getDoc(ref);
      if(!snap.exists()){
        await setDoc(ref, payload);
        seededCount += 1;
        console.info("✅ Seeded", key);
      }
    }

    localStorage.setItem(flagKey,"1");
    console.info(`✅ Historical seed check complete (${seededCount} inserted / ${Object.keys(HISTORICAL_SEED).length} total docs checked)`);
  }catch(err){
    console.warn("Historical seed failed:", err);
    // Don't block app if seeding fails
  }
}


console.log("✅ Firestore connected");


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


// === Master overrides (Plant Capacity / No of Connections) ===
const MASTER_OVERRIDES_KEY = "wq_master_overrides_v1";
let masterEditMode = false;

function loadMasterOverrides(){
  try{
    const raw = localStorage.getItem(MASTER_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch(e){
    console.warn("⚠️ Failed to parse master overrides:", e);
    return {};
  }
}

function saveMasterOverrides(map){
  try{
    localStorage.setItem(MASTER_OVERRIDES_KEY, JSON.stringify(map || {}));
  }catch(e){
    console.warn("⚠️ Failed to save master overrides:", e);
  }
}

function rowKey(row){
  // region+plant is stable in your template and across days
  return `${(row.region||"").trim()}|${(row.plant||"").trim()}`;
}

function cloneRows(rows){
  return JSON.parse(JSON.stringify(rows));
}

function applyMasterOverrides(rows){
  const overrides = loadMasterOverrides();
  return rows.map(r=>{
    if(r && r.type === "section") return r;
    const k = rowKey(r);
    if(overrides[k]){
      r.capacity = overrides[k].capacity ?? r.capacity;
      r.connections = overrides[k].connections ?? r.connections;
    }
    return r;
  });
}

function getBaseRows(){
  // Base template rows for the entry table (static list), with optional
  // capacity/connection overrides applied from localStorage.
  // NOTE: Do NOT call getBaseRows() recursively (would cause stack overflow).
  return applyMasterOverrides(cloneRows(defaultRows));
}



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


// === Excel-like keyboard navigation for table inputs ===
// Lets you move between cells using Arrow keys (similar to Excel).
const __navGrids = new Map(); // tbodyId => 2D array [row][col] => input
const __navListenerAttached = new Set();

function rebuildNavGrid(tbodyId = 'tbody'){
  const tbody = document.getElementById(tbodyId);
  if(!tbody) return;

  const grid = [];
  const rows = Array.from(tbody.querySelectorAll('tr'))
    .filter(tr => !tr.classList.contains('section-row'));

  rows.forEach((tr, rIdx) => {
    const inputs = Array.from(tr.querySelectorAll('input.cell'));
    grid[rIdx] = inputs;
    inputs.forEach((inp, cIdx) => {
      inp.dataset.r = String(rIdx);
      inp.dataset.c = String(cIdx);
      inp.dataset.navTbody = tbodyId;
    });
  });

  __navGrids.set(tbodyId, grid);
}

function setupExcelLikeNavigation(tbodyId = 'tbody'){
  if(__navListenerAttached.has(tbodyId)) return;
  const tbody = document.getElementById(tbodyId);
  if(!tbody) return;

  __navListenerAttached.add(tbodyId);

  tbody.addEventListener('keydown', (e) => {
    const t = e.target;
    if(!(t instanceof HTMLInputElement)) return;
    if(!t.classList.contains('cell')) return;
    if(e.altKey || e.ctrlKey || e.metaKey) return;

    const key = e.key;
    const navTbody = t.dataset.navTbody || tbodyId;
    const navGrid = __navGrids.get(navTbody) || [];
    const r = Number(t.dataset.r);
    const c = Number(t.dataset.c);
    if(!Number.isFinite(r) || !Number.isFinite(c)) return;

    // For Left/Right: allow normal cursor movement inside the input
    // (only jump cells when caret is at edge)
    if(key === 'ArrowLeft'){
      if(typeof t.selectionStart === 'number' && t.selectionStart > 0) return;
    }
    if(key === 'ArrowRight'){
      const len = (t.value ?? '').length;
      if(typeof t.selectionEnd === 'number' && t.selectionEnd < len) return;
    }

    let nr = r, nc = c;

    if(key === 'ArrowUp') nr = r - 1;
    else if(key === 'ArrowDown') nr = r + 1;
    else if(key === 'ArrowLeft') nc = c - 1;
    else if(key === 'ArrowRight') nc = c + 1;
    else if(key === 'Enter') nr = r + 1;
    else return;

    // Clamp / skip missing rows/cols
    if(nr < 0) nr = 0;
    if(nc < 0) nc = 0;

    // Find nearest existing input
    let target = null;
    if(navGrid[nr] && navGrid[nr][nc]){
      target = navGrid[nr][nc];
    }else if(key === 'ArrowUp' || key === 'ArrowDown' || key === 'Enter'){
      // Try same column on next available row
      let step = (key === 'ArrowUp') ? -1 : 1;
      let rr = nr;
      while(rr >= 0 && rr < navGrid.length){
        if(navGrid[rr] && navGrid[rr][nc]){ target = navGrid[rr][nc]; break; }
        rr += step;
      }
    }else if(key === 'ArrowLeft' || key === 'ArrowRight'){
      // Try nearest col on the same row
      if(navGrid[r]){
        let cc = nc;
        while(cc >= 0 && cc < navGrid[r].length){
          if(navGrid[r][cc]){ target = navGrid[r][cc]; break; }
          cc += (key === 'ArrowLeft') ? -1 : 1;
        }
      }
    }

    if(target){
      e.preventDefault();
      target.focus();
      // optional: select existing value for quick overwrite
      try{ target.select(); }catch(_e){}
    }
  }, true);
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
      td.colSpan = 9;
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
    const tdCap = document.createElement('td');
    const tdConn = document.createElement('td');

    if(masterEditMode){
      const capInput = makeInputCell(r.capacity || "");
      capInput.classList.add("cap");
      capInput.classList.add("cap-input");
      tdCap.appendChild(capInput);

      const connInput = makeInputCell(r.connections || "");
      connInput.classList.add("conn");
      connInput.classList.add("conn-input");
      tdConn.appendChild(connInput);
    }else{
      tdCap.textContent = r.capacity || "";
      tdConn.textContent = r.connections || "";
    }

    tr.append(tdNo, tdRegion, tdPlant, tdCap, tdConn);

    // Editable columns (6 columns)
    for(let i=0;i<4;i++){
      const td = document.createElement('td');
      const inp = makeInputCell("");
      inp.classList.add("turb");
      td.appendChild(inp);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });

  // Build navigation map for Arrow-key movement
  rebuildNavGrid();
  setupExcelLikeNavigation();
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
      capacity: ((tr.querySelector("input.cap")?.value) || tds[3].textContent || "").trim(),
      connections: ((tr.querySelector("input.conn")?.value) || tds[4].textContent || "").trim(),
      t1_raw: editable[0] || "",
      t1_treated: editable[1] || "",
      t1_rcl: editable[2] || "",
      t1_ph: editable[3] || "",
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

    inputs[0].value = (row.t1_raw ?? row.raw ?? "");
    inputs[1].value = (row.t1_treated ?? row.treated ?? "");
    inputs[2].value = (row.t1_rcl ?? row.rcl ?? "");
    if(inputs[3]) inputs[3].value = (row.t1_ph ?? row.ph ?? "");
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
    t1_ph:"",
    t2_raw:"",
    t2_treated:"",
    t2_rcl:"",
    t2_ph:"",
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
    "Turbidity Raw","Turbidity Treated","RCL","pH"
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
      row.t1_raw, row.t1_treated, row.t1_rcl, row.t1_ph,
      row.t2_raw, row.t2_treated, row.t2_rcl, row.t2_ph
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
  renderRows(getBaseRows());
}

document.addEventListener('DOMContentLoaded', async ()=>{
  setDefaultDates();
  setNavDate();
  await seedHistoricalDataOnce();
  renderRows(getBaseRows());
  // Default view: Today (editable)
  loadCurrentIfExists();

  // Compare (last 3 days)
  setupCompareModal();
  // Compare all (all saved/submitted)
  setupCompareAllModal();
  setupGraphsModal();
  setupRegionSubmissionsModal();
  setupPastEntryModal();

  // Nav
  document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(btn.dataset.page) switchPage(btn.dataset.page);
    });
  });

  // Entry actions
  document.getElementById('saveBtn')?.addEventListener('click', ()=> saveCurrent("saved"));
  document.getElementById('submitBtn')?.addEventListener('click', ()=> saveCurrent("submitted"));
  document.getElementById('exportBtn')?.addEventListener('click', exportCSV);
  document.getElementById('resetBtn')?.addEventListener('click', resetAll);

  // Submissions actions
  document.getElementById("refreshSubmissions")?.addEventListener("click", renderSubmissionsList);
  document.getElementById("editSubmissionBtn")?.addEventListener("click", toggleEdit);
  document.getElementById("saveEditsBtn")?.addEventListener("click", saveEdits);

  // Quick edit for Plant Capacity / Connections (applies to today's table + future defaults)
  const masterBtn = document.getElementById("masterEditBtn");
  if(masterBtn){
    masterBtn.addEventListener("click", ()=>{
      // ensure entry page is visible
      try{ switchPage("entry"); }catch(e){}

      let rows;
      try{
        rows = getTableData();
      }catch(e){
        rows = getBaseRows();
      }

      // toggle mode
      masterEditMode = !masterEditMode;

      if(masterEditMode){
        masterBtn.textContent = "SAVE";
        masterBtn.classList.add("is-editing");
      }else{
        // persist overrides from current table
        const overrides = loadMasterOverrides();
        rows.forEach(r=>{
          if(!r || r.type === "section") return;
          overrides[rowKey(r)] = { capacity: r.capacity || "", connections: r.connections || "" };
        });
        saveMasterOverrides(overrides);

        masterBtn.textContent = "EDIT";
        masterBtn.classList.remove("is-editing");
      }

      // re-render without losing current turbidity values
      renderRows(rows);
    });
  }

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
        renderRows(getBaseRows());
        restoreEditableValues(snap.data().rows);
        console.log("✅ Loaded today's data from Firestore");
      } else {
        // No document for today → render empty default rows
        renderRows(getBaseRows());
      }
    })
    .catch((err) => {
      console.error("❌ Firestore load failed:", err);
      // Fallback to default rows so the app still works
      renderRows(getBaseRows());
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

// -------- Compare (Modal: Today / Yesterday / Day before yesterday) --------
function dateKeyFromDate(d){
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function dotKeyFromDate(d){
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function dateKeyCandidates(d){
  // Prefer ISO key, but also support legacy/seeded dd.mm.yyyy keys
  return [dateKeyFromDate(d), dotKeyFromDate(d)];
}


function getDateFor(daysAgo){
  const d = new Date();
  d.setHours(12,0,0,0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function buildRowMap(rows){
  // Builds lookup map for compare tables.
  // Some stored days include district "section" rows; some (e.g., seeded/imported) may not.
  // To avoid blanks, we index rows with multiple keys and allow fallbacks.
  const map = new Map();
  let district = "";

  (rows || []).forEach(r => {
    if(r?.type === 'section'){
      district = (r.label || "").trim();
      return;
    }
    const plant = (r.plant || '').trim();
    const region = (r.region || '').trim();

    // Primary key (when district is known)
    const key1 = `${district}|${plant}`;
    if(plant) map.set(key1, r);

    // Fallback keys (work even when district is missing in stored rows)
    const key2 = `*|${region}|${plant}`;
    const key3 = `*|*|${plant}`;
    if(plant) {
      map.set(key2, r);
      // Only set plant-only fallback if empty to reduce accidental overwrites
      if(!map.has(key3)) map.set(key3, r);
    }
  });

  return map;
}

function getCompareRow(map, district, region, plant){
  const p = (plant || '').trim();
  const d = (district || '').trim();
  const r = (region || '').trim();
  if(!p) return null;

  return (
    map.get(`${d}|${p}`) ||
    map.get(`*|${r}|${p}`) ||
    map.get(`*|*|${p}`) ||
    null
  );
}


function setCompareNote(msg){
  const el = document.getElementById('compareNote');
  if(el) el.textContent = msg || "";
}

function renderCompareTable(dates, docsArr){
  const head = document.getElementById('compareHead');
  const body = document.getElementById('compareBody');
  if(!head || !body) return;

  // Header
  const [d0, d1, d2] = dates;
  const timeLabel = '8.00am';

  head.innerHTML = `
    <tr class="datetime-head">
      <th colspan="5" class="blank-head"></th>
      <th colspan="4" class="datetime-cell">${formatDate(d2)} ${timeLabel}</th>
      <th colspan="4" class="datetime-cell">${formatDate(d1)} ${timeLabel}</th>
      <th colspan="4" class="datetime-cell">${formatDate(d0)} ${timeLabel}</th>
    </tr>
    <tr>
      <th rowspan="2" class="no">No</th>
      <th rowspan="2" class="region">Region</th>
      <th rowspan="2" class="plant">Plant</th>
      <th rowspan="2" class="capacity">Plant Capacity<br>(Cum/Day)</th>
      <th rowspan="2" class="connections">No of<br>Connections</th>
      <th colspan="4" class="group">Day before yesterday</th>
      <th colspan="4" class="group">Yesterday</th>
      <th colspan="4" class="group">Today</th>
    </tr>
    <tr>
      <th class="tcol">Raw</th><th class="tcol">Treated</th><th class="tcol">RCL</th><th class="tcol">pH</th>
      <th class="tcol">Raw</th><th class="tcol">Treated</th><th class="tcol">RCL</th><th class="tcol">pH</th>
      <th class="tcol">Raw</th><th class="tcol">Treated</th><th class="tcol">RCL</th><th class="tcol">pH</th>
    </tr>
  `;

  // Body
  body.innerHTML = '';
  const map0 = buildRowMap(docsArr?.[0]?.rows);
  const map1 = buildRowMap(docsArr?.[1]?.rows);
  const map2 = buildRowMap(docsArr?.[2]?.rows);

  let district = '';
  defaultRows.forEach(r => {
    if(r.type === 'section'){
      district = r.label;
      const tr = document.createElement('tr');
      tr.className = 'section-row';
      const td = document.createElement('td');
      td.colSpan = 17;
      td.className = 'section-cell';
      td.textContent = r.label;
      tr.appendChild(td);
      body.appendChild(tr);
      return;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.no}</td>
      <td class="left">${r.region || ''}</td>
      <td class="left">${r.plant || ''}</td>
      <td>${r.capacity || ''}</td>
      <td>${r.connections || ''}</td>
    `;

    const key = `${district}|${(r.plant || '').trim()}`;
    const rowsFor = [map2.get(key), map1.get(key), map0.get(key)];
    rowsFor.forEach(row => {
      const raw = row?.t1_raw ?? row?.raw ?? '';
      const treated = row?.t1_treated ?? row?.treated ?? '';
      const rcl = row?.t1_rcl ?? row?.rcl ?? '';
      const ph = row?.t1_ph ?? row?.ph ?? '';
      tr.innerHTML += `<td>${raw}</td><td>${treated}</td><td>${rcl}</td><td>${ph}</td>`;
    });
    body.appendChild(tr);
  });
}

function setupCompareModal(){
  const btn = document.getElementById('compareBtn');
  const modal = document.getElementById('compareModal');
  const closeBtn = document.getElementById('compareClose');
  if(!btn || !modal) return;

  // ---- Scroll lock helpers (prevents the page behind the modal from scrolling) ----
  let __scrollY = 0;
  const lockScroll = () => {
    __scrollY = window.scrollY || 0;
    document.body.classList.add('modal-open');
    // iOS/Safari-friendly scroll locking
    document.body.style.position = 'fixed';
    document.body.style.top = `-${__scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };
  const unlockScroll = () => {
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, __scrollY);
  };

  const open = async () => {
    lockScroll();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    // Start the modal scroller at the top every time
    modal.scrollTop = 0;
    modal.querySelector('.table-wrap')?.scrollTo(0,0);
    setCompareNote('Loading last 3 days...');

    const d0 = getDateFor(0);
    const d1 = getDateFor(1);
    const d2 = getDateFor(2);
    const [k0Iso, k0Dot] = dateKeyCandidates(d0);
    const [k1Iso, k1Dot] = dateKeyCandidates(d1);
    const [k2Iso, k2Dot] = dateKeyCandidates(d2);

    try{
      const [[s0Iso, s0Dot], [s1Iso, s1Dot], [s2Iso, s2Dot]] = await Promise.all([
        Promise.all([getDoc(doc(db, FIRESTORE_COLLECTION, k0Iso)), getDoc(doc(db, FIRESTORE_COLLECTION, k0Dot))]),
        Promise.all([getDoc(doc(db, FIRESTORE_COLLECTION, k1Iso)), getDoc(doc(db, FIRESTORE_COLLECTION, k1Dot))]),
        Promise.all([getDoc(doc(db, FIRESTORE_COLLECTION, k2Iso)), getDoc(doc(db, FIRESTORE_COLLECTION, k2Dot))]),
      ]);

      const pick = (isoSnap, dotSnap) => {
        if(isoSnap.exists()) return { key: 'iso', data: isoSnap.data() };
        if(dotSnap.exists()) return { key: 'dot', data: dotSnap.data() };
        return { key: 'none', data: null };
      };

      const p0 = pick(s0Iso, s0Dot); // Today
      const p1 = pick(s1Iso, s1Dot); // Yesterday
      const p2 = pick(s2Iso, s2Dot); // Day before yesterday

      // docsArr order MUST match [d0,d1,d2] in renderCompareTable usage below
      const docsArr = [p0.data, p1.data, p2.data];

      renderCompareTable([d0,d1,d2], docsArr);

      const missing = [
        !p0.data ? `Today (${formatDate(d0)})` : null,
        !p1.data ? `Yesterday (${formatDate(d1)})` : null,
        !p2.data ? `Day before yesterday (${formatDate(d2)})` : null,
      ].filter(Boolean);
      setCompareNote(missing.length ? `No saved data found for: ${missing.join(', ')}` : '');
    }catch(err){
      console.error('❌ Compare load failed:', err);
      setCompareNote('Error loading compare data. Check console.');
    }
  };

  const close = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    unlockScroll();
  };

  btn.addEventListener('click', (e)=>{ e.preventDefault(); open(); });
  closeBtn?.addEventListener('click', close);
  // click outside the panel to close
  modal.addEventListener('click', (e)=>{ if(e.target === modal) close(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && !modal.classList.contains('hidden')) close(); });
}

// -------- Compare All (Modal: show ALL saved/submitted entries) --------
function setCompareAllNote(msg){
  const el = document.getElementById('compareAllNote');
  if(el) el.textContent = msg || "";
}


function parseDateKeyToDate(dateKey){
  // Supports common keys used in this app:
  //  - "YYYY-MM-DD"
  //  - "DD.MM.YYYY" (optionally with " 8.00am" or other suffix)
  // Returns a Date (local) or null.
  if(!dateKey) return null;
  const s = String(dateKey).trim();

  // ISO: YYYY-MM-DD...
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(iso){
    const y = parseInt(iso[1],10);
    const m = parseInt(iso[2],10);
    const d = parseInt(iso[3],10);
    if(y && m && d){
      const dt = new Date(y, m-1, d);
      dt.setHours(12,0,0,0); // stable across TZ/DST
      return dt;
    }
  }

  // Dotted: DD.MM.YYYY...
  const dot = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if(dot){
    const d = parseInt(dot[1],10);
    const m = parseInt(dot[2],10);
    const y = parseInt(dot[3],10);
    if(y && m && d){
      const dt = new Date(y, m-1, d);
      dt.setHours(12,0,0,0);
      return dt;
    }
  }

  return null;
}

function dateKeyToLabel(dateKey){
  const dt = parseDateKeyToDate(dateKey);
  return dt ? formatDate(dt) : String(dateKey || '');
}

function dateKeyHasTime(dateKey){
  const s = String(dateKey || '').toLowerCase();
  return /\b(am|pm)\b/.test(s) || /\d{1,2}[:.]\d{2}/.test(s);
}

function renderCompareAllTable(dateKeys, docsByKey){
  const head = document.getElementById('compareAllHead');
  const body = document.getElementById('compareAllBody');
  if(!head || !body) return;

  const timeLabel = '8.00am';

  // IMPORTANT: headers MUST be generated from the SAME list used for the body.
  // Some older records may use keys like "07.01.2026" (not ISO). If we only
  // render headers for ISO dates, the body will have more columns than the header.
  const entries = (dateKeys || []).map(k => ({
    key: k,
    label: dateKeyToLabel(k),
    date: parseDateKeyToDate(k)
  }));

  // Header (dynamic dates)
  const dateHeadCells = entries.map(e => {
    const showTime = dateKeyHasTime(e.key) ? '' : ` ${timeLabel}`;
    return `<th colspan="4" class="datetime-cell">${e.label}${showTime}</th>`;
  }).join('');
  const groupCells = entries.map(e => `<th colspan="4" class="group">${e.label}</th>`).join('');
  const subHeadCells = entries.map(()=> `<th class="tcol">Raw</th><th class="tcol">Treated</th><th class="tcol">RCL</th><th class="tcol">pH</th>`).join('');

  head.innerHTML = `
    <tr class="datetime-head">
      <th colspan="5" class="blank-head"></th>
      ${dateHeadCells || `<th colspan="4" class="datetime-cell">No dates</th>`}
    </tr>
    <tr>
      <th rowspan="2" class="no">No</th>
      <th rowspan="2" class="region">Region</th>
      <th rowspan="2" class="plant">Plant</th>
      <th rowspan="2" class="capacity">Plant Capacity<br>(Cum/Day)</th>
      <th rowspan="2" class="connections">No of<br>Connections</th>
      ${groupCells || `<th colspan="4" class="group">No records</th>`}
    </tr>
    <tr>
      ${subHeadCells || `<th class="tcol">Raw</th><th class="tcol">Treated</th><th class="tcol">RCL</th><th class="tcol">pH</th>`}
    </tr>
  `;

  // Body (use defaultRows order + district sections)
  body.innerHTML = '';

  if(!entries.length){
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 9;
    td.className = 'section-cell';
    td.textContent = 'No submitted records found.';
    tr.appendChild(td);
    body.appendChild(tr);
    return;
  }

  // Build row maps for each dateKey
  const maps = entries.map(e => buildRowMap(docsByKey?.[e.key]?.rows));

  let district = '';
  const totalCols = 5 + (4 * entries.length);

  defaultRows.forEach(r => {
    if(r.type === 'section'){
      district = r.label;
      const tr = document.createElement('tr');
      tr.className = 'section-row';
      const td = document.createElement('td');
      td.colSpan = totalCols;
      td.className = 'section-cell';
      td.textContent = r.label;
      tr.appendChild(td);
      body.appendChild(tr);
      return;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.no ?? ''}</td>
      <td class="left">${r.region || ''}</td>
      <td class="left">${r.plant || ''}</td>
      <td>${r.capacity || ''}</td>
      <td>${r.connections || ''}</td>
    `;

        maps.forEach(map => {
      const row = getCompareRow(map, district, r.region, r.plant);
      const raw = row?.t1_raw ?? row?.raw ?? '';
      const treated = row?.t1_treated ?? row?.treated ?? '';
      const rcl = row?.t1_rcl ?? row?.rcl ?? '';
      const ph = row?.t1_ph ?? row?.ph ?? '';
      tr.innerHTML += `<td>${raw}</td><td>${treated}</td><td>${rcl}</td><td>${ph}</td>`;
    });

    body.appendChild(tr);
  });
}

function setupCompareAllModal(
){
  const btn = document.getElementById('compareAllBtn');
  const modal = document.getElementById('compareAllModal');
  const closeBtn = document.getElementById('compareAllClose');
  if(!btn || !modal) return;

  // ---- Scroll lock helpers (prevents the page behind the modal from scrolling) ----
  let __scrollY = 0;
  const lockScroll = () => {
    __scrollY = window.scrollY || 0;
    document.body.classList.add('modal-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${__scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };
  const unlockScroll = () => {
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, __scrollY);
  };

  const open = async () => {
    lockScroll();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    modal.scrollTop = 0;
    modal.querySelector('.table-wrap')?.scrollTo(0,0);
    setCompareAllNote('Loading all entries...');

    try{
      const snapshot = await getDocs(collection(db, FIRESTORE_COLLECTION));

      // Only compare SUBMITTED days (as requested)
      const docsByKey = {};
      const dateKeys = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const key = data.dateKey || docSnap.id; // doc id is the dateKey
        if(!key) return;

        docsByKey[key] = data;
        dateKeys.push(key);
      });

      // Sort ascending so older dates are on the left, newest on the right.
      // Handles both ISO (YYYY-MM-DD) and dotted (DD.MM.YYYY) keys.
      dateKeys.sort((a,b)=>{
        const da = parseDateKeyToDate(a);
        const db = parseDateKeyToDate(b);
        if(da && db) return da.getTime() - db.getTime();
        if(da && !db) return -1;
        if(!da && db) return 1;
        return (a || '').localeCompare(b || '');
      });

      renderCompareAllTable(dateKeys, docsByKey);
      setCompareAllNote(dateKeys.length ? '' : 'No submitted records yet.');
    }catch(err){
      console.error('❌ Compare All load failed:', err);
      setCompareAllNote('Error loading entries. Check console.');
    }
  };

  const close = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    unlockScroll();
  };

  btn.addEventListener('click', (e)=>{ e.preventDefault(); open(); });
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', (e)=>{ if(e.target === modal) close(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && !modal.classList.contains('hidden')) close(); });
}

// -------- Submissions Page --------
let selectedKey = null;
let selectedSubmission = null;
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

      docsArr.sort((a,b)=>{
        const ka = (a && (a.dateKey || a.date || a.id)) || "";
        const kb = (b && (b.dateKey || b.date || b.id)) || "";
        const da = parseDateKeyToDate(ka);
        const db2 = parseDateKeyToDate(kb);
        // Newest on top (descending)
        if(da && db2) return db2.getTime() - da.getTime();
        if(da && !db2) return -1;
        if(!da && db2) return 1;
        return String(kb).localeCompare(String(ka));
      });

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

        const actions = document.createElement("div");
        actions.className = "actions";

        const del = document.createElement("button");
        del.className = "delete";
        del.textContent = "Delete";
        del.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteSubmission(item.dateKey);
        });

        actions.append(open, del);
        card.append(meta, actions);
        container.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("❌ Firestore list failed:", err);
      container.innerHTML = "<div class='note'>Error loading submissions.</div>";
    });
}

function renderSubmissionViewer(){
  const title = document.getElementById("viewTitle");
  if(title) title.textContent = "Select a saved/submitted day to view and edit.";
  const editBtn = document.getElementById("editSubmissionBtn");
  const saveBtn = document.getElementById("saveEditsBtn");
  if(editBtn) editBtn.disabled = true;
  if(saveBtn) saveBtn.disabled = true;
  const body = document.getElementById("historyBody");
  if(body){
    body.innerHTML = "<tr><td colspan='9' class='left'>No submission selected.</td></tr>";
  }
}


function deleteSubmission(key) {
  if (!key) return;
  const ok = confirm("Delete this entry? This cannot be undone.");
  if (!ok) return;

  deleteDoc(doc(db, FIRESTORE_COLLECTION, key))
    .then(() => {
      // If the deleted item was open in the viewer, reset the viewer state
      if (selectedKey === key) {
        selectedKey = null;
        selectedSubmission = null;
        editMode = false;
        renderSubmissionViewer();
      }
      renderSubmissionsList();
    })
    .catch((err) => {
      console.error("❌ Firestore delete failed:", err);
      alert("Failed to delete. Please try again.");
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
      selectedSubmission = item;

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
  body.innerHTML = "";

  rows.forEach(r=>{
    if(r.type === "section"){
      const tr = document.createElement("tr");
      tr.className = "section-row";
      const td = document.createElement("td");
      td.colSpan = 9;
      td.className = "section-cell";
      td.textContent = r.label;
      tr.appendChild(td);
      body.appendChild(tr);
      return;
    }

    const tr = document.createElement("tr");
    const fields = ["no","region","plant","capacity","connections","raw","treated","rcl","ph"];
    fields.forEach((f, idx)=>{
      const td = document.createElement("td");
      if(editable && idx >= 4){ // allow edit from connections onwards
        const inp = document.createElement("input");
        inp.className = "cell";
        const fieldKey = (["raw","treated","rcl","ph"].includes(f) && (("t1_"+f) in r)) ? ("t1_"+f) : f;
        inp.value = r[fieldKey] || ""; 
        inp.dataset.field = fieldKey;
        td.appendChild(inp);
      }else{
        const showKey = (["raw","treated","rcl","ph"].includes(f) && (("t1_"+f) in r)) ? ("t1_"+f) : f;
        td.textContent = r[showKey] || "";
        if(idx===1 || idx===2) td.classList.add("left");
      }
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });

  if(editable){
    rebuildNavGrid('historyBody');
    setupExcelLikeNavigation('historyBody');
  }
}

function toggleEdit(){
  if(!selectedKey || !selectedSubmission) return;

  editMode = true;
  document.getElementById("editSubmissionBtn").disabled = true;
  document.getElementById("saveEditsBtn").disabled = false;

  renderHistoryTable((selectedSubmission.rows || []), true);
}

async function saveEdits(){
  if(!selectedKey || !selectedSubmission) return;

  // Read edited inputs from history table
  const originalRows = Array.isArray(selectedSubmission.rows) ? selectedSubmission.rows : [];
  const trs = Array.from(document.querySelectorAll("#historyBody tr"));
  const newRows = [];
  let rowIndex = 0;

  trs.forEach(tr=>{
    const original = originalRows[rowIndex];
    if(!original){
      rowIndex++;
      return;
    }

    if(tr.classList.contains("section-row")){
      // keep section rows untouched
      newRows.push(original);
      rowIndex++;
      return;
    }

    const updated = {...original};
    const inputs = tr.querySelectorAll("input.cell");
    inputs.forEach(inp=>{
      const field = inp.dataset.field;
      updated[field] = inp.value;
    });

    newRows.push(updated);
    rowIndex++;
  });

  // In case some rows weren't rendered (safety), keep them
  for(; rowIndex < originalRows.length; rowIndex++){
    newRows.push(originalRows[rowIndex]);
  }

  const updatedAt = new Date().toISOString();

  // Save back to Firestore
  try{
    await updateDoc(doc(db, FIRESTORE_COLLECTION, selectedKey), {
      rows: newRows,
      updatedAt
    });
  }catch(err){
    console.error("❌ Firestore update failed:", err);
    alert("❌ Failed to save edits to Firestore. Check console.");
    return;
  }

  selectedSubmission = {...selectedSubmission, rows: newRows, updatedAt};
  editMode = false;
  document.getElementById("editSubmissionBtn").disabled = false;
  document.getElementById("saveEditsBtn").disabled = true;

  renderHistoryTable(newRows, false);
  alert("Edits saved!");
}




function setupPastEntryModal(){
  const btn = document.getElementById('addPastEntryBtn');
  const modal = document.getElementById('pastEntryModal');
  const closeBtn = document.getElementById('pastEntryClose');
  const cancelBtn = document.getElementById('pastEntryCancel');
  const continueBtn = document.getElementById('pastEntryContinue');
  const dateInput = document.getElementById('pastEntryDate');
  if(!btn || !modal || !continueBtn || !dateInput) return;

  // ---- Scroll lock helpers (same behavior as other modals) ----
  let __scrollY = 0;
  const lockScroll = () => {
    __scrollY = window.scrollY || 0;
    document.body.classList.add('modal-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${__scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };
  const unlockScroll = () => {
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, __scrollY);
  };

  const open = () => {
    // default = yesterday (common case when someone missed a day)
    try{
      const d = new Date();
      d.setDate(d.getDate()-1);
      dateInput.value = d.toISOString().slice(0,10);
    }catch(e){}
    modal.classList.remove('hidden');
    lockScroll();
  };
  const close = () => {
    modal.classList.add('hidden');
    unlockScroll();
  };

  btn.addEventListener('click', open);
  if(closeBtn) closeBtn.addEventListener('click', close);
  if(cancelBtn) cancelBtn.addEventListener('click', close);
  modal.addEventListener('click', (e)=>{
    if(e.target === modal) close();
  });

  continueBtn.addEventListener('click', async ()=>{
    const iso = (dateInput.value || "").trim();
    if(!iso){
      alert("Please select a date.");
      return;
    }
    // prevent future dates
    const sel = new Date(iso + "T00:00:00");
    const today = new Date();
    today.setHours(0,0,0,0);
    if(sel.getTime() > today.getTime()){
      alert("Future dates are not allowed.");
      return;
    }

    // Build both id formats; prefer dotted as canonical
    const dotted = formatDateKeyFromISO(iso); // DD.MM.YYYY
    const isoKey = iso; // YYYY-MM-DD

    try{
      // if exists (either format), open it
      const docRefDotted = doc(db, FIRESTORE_COLLECTION, dotted);
      const snapDotted = await getDoc(docRefDotted);
      if(snapDotted.exists()){
        close();
        // ensure user is on submissions page
        switchPage('submissions');
        openSubmission(dotted);
        return;
      }

      const docRefIso = doc(db, FIRESTORE_COLLECTION, isoKey);
      const snapIso = await getDoc(docRefIso);
      if(snapIso.exists()){
        close();
        switchPage('submissions');
        openSubmission(isoKey);
        return;
      }

      // create new empty entry for that day (saved)
      const payload = {
        dateKey: dotted,
        dateLabel: dotted,
        timeLabel: "8.00am",
        status: "saved",
        rows: getBaseRows(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        backdated: true
      };

      await setDoc(docRefDotted, payload);
      // refresh list + open the new entry
      renderSubmissionsList();
      close();
      switchPage('submissions');
      openSubmission(dotted);
      alert("Past entry created. You can edit and Save/Submit it now.");
    }catch(err){
      console.error("❌ Add Past Entry failed:", err);
      alert("❌ Failed to create/open past entry. Check console.");
    }
  });
}

// Convert YYYY-MM-DD -> DD.MM.YYYY (canonical key)
function formatDateKeyFromISO(iso){
  try{
    const [y,m,d] = iso.split("-");
    return `${d}.${m}.${y}`;
  }catch(e){
    return iso;
  }
}



// -------- Graphs (Daily / Weekly / Monthly) --------
const GRAPH_METRICS = [
  { key: 'raw', field: 't1_raw', fallback: 'raw', canvasId: 'rawChart', metaId: 'rawChartMeta', label: 'Raw Water Turbidity' },
  { key: 'treated', field: 't1_treated', fallback: 'treated', canvasId: 'treatedChart', metaId: 'treatedChartMeta', label: 'Treated Water Turbidity' },
  { key: 'rcl', field: 't1_rcl', fallback: 'rcl', canvasId: 'rclChart', metaId: 'rclChartMeta', label: 'RCL Value' },
  { key: 'ph', field: 't1_ph', fallback: 'ph', canvasId: 'phChart', metaId: 'phChartMeta', label: 'pH Value' }
];

let graphCharts = {};
let graphDocsCache = [];
let graphState = { period: 'daily', plant: '__all__', range: 24 };

function setGraphsNote(msg){
  const el = document.getElementById('graphsNote');
  if(el) el.textContent = msg || '';
}

function getPlantOptions(){
  const seen = new Map();
  let district = '';
  (defaultRows || []).forEach(r => {
    if(r?.type === 'section'){
      district = r.label || '';
      return;
    }
    if(!r?.plant) return;
    const key = String(r.plant).trim();
    if(!seen.has(key)){
      seen.set(key, { plant: key, region: r.region || district || '' });
    }
  });
  return Array.from(seen.values()).sort((a,b)=> a.plant.localeCompare(b.plant));
}

function populateGraphPlantOptions(){
  const select = document.getElementById('graphPlantSelect');
  if(!select) return;
  const current = select.value || '__all__';
  const options = ['<option value="__all__">All WTPs (Average)</option>']
    .concat(getPlantOptions().map(item => `<option value="${item.plant.replace(/"/g,'&quot;')}">${item.plant} - ${item.region}</option>`));
  select.innerHTML = options.join('');
  if(Array.from(select.options).some(opt => opt.value === current)) select.value = current;
  else select.value = '__all__';
}

function getMetricRowValue(row, metric){
  const rawVal = row?.[metric.field] ?? row?.[metric.fallback] ?? '';
  const num = Number.parseFloat(String(rawVal).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(num) ? num : null;
}

function startOfWeek(date){
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(12,0,0,0);
  return d;
}

function toMonthKey(date){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
}

function toWeekKey(date){
  const d = startOfWeek(date);
  return dateKeyFromDate(d);
}

function toPeriodKey(date, period){
  if(period === 'monthly') return toMonthKey(date);
  if(period === 'weekly') return toWeekKey(date);
  return dateKeyFromDate(date);
}

function toPeriodLabel(key, period){
  if(period === 'monthly'){
    const m = key.match(/^(\d{4})-(\d{2})$/);
    if(m){
      const dt = new Date(Number(m[1]), Number(m[2]) - 1, 1);
      return dt.toLocaleDateString('en-GB', { month:'short', year:'numeric' });
    }
    return key;
  }
  const dt = parseDateKeyToDate(key);
  if(!dt) return key;
  if(period === 'weekly'){
    const end = new Date(dt);
    end.setDate(end.getDate() + 6);
    return `${formatDate(dt)} - ${formatDate(end)}`;
  }
  return formatDate(dt);
}

function aggregateGraphData(docs, period, plantValue){
  const bucketMap = new Map();

  (docs || []).forEach(docItem => {
    const dt = parseDateKeyToDate(docItem?.dateKey || docItem?.id || '');
    if(!dt) return;
    const bucketKey = toPeriodKey(dt, period);
    if(!bucketMap.has(bucketKey)){
      bucketMap.set(bucketKey, { key: bucketKey, label: toPeriodLabel(bucketKey, period), timestamp: dt.getTime(), totals: {}, counts: {} });
    }
    const bucket = bucketMap.get(bucketKey);
    GRAPH_METRICS.forEach(metric => {
      bucket.totals[metric.key] ??= 0;
      bucket.counts[metric.key] ??= 0;
    });

    const rows = Array.isArray(docItem?.rows) ? docItem.rows : [];
    rows.forEach(row => {
      if(!row || row.type === 'section' || !row.plant) return;
      if(plantValue !== '__all__' && String(row.plant).trim() !== plantValue) return;
      GRAPH_METRICS.forEach(metric => {
        const value = getMetricRowValue(row, metric);
        if(value === null) return;
        bucket.totals[metric.key] += value;
        bucket.counts[metric.key] += 1;
      });
    });
  });

  return Array.from(bucketMap.values())
    .sort((a,b)=> a.timestamp - b.timestamp)
    .map(bucket => ({
      key: bucket.key,
      label: bucket.label,
      values: Object.fromEntries(GRAPH_METRICS.map(metric => [
        metric.key,
        bucket.counts[metric.key] ? Number((bucket.totals[metric.key] / bucket.counts[metric.key]).toFixed(3)) : null
      ]))
    }));
}

function trimGraphSeries(series, range){
  if(!range || range <= 0 || series.length <= range) return series;
  return series.slice(series.length - range);
}

function summarizeMetric(points){
  const vals = points.filter(v => Number.isFinite(v));
  if(!vals.length) return 'No numeric data available';
  const latest = vals[vals.length - 1];
  const previous = vals.length > 1 ? vals[vals.length - 2] : null;
  const avg = vals.reduce((a,b)=> a+b, 0) / vals.length;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const trend = previous === null ? 'Starting point' : (latest > previous ? 'Upward vs previous period' : latest < previous ? 'Downward vs previous period' : 'Stable vs previous period');
  return `Latest: ${latest.toFixed(3)} | Avg: ${avg.toFixed(3)} | Min: ${min.toFixed(3)} | Max: ${max.toFixed(3)} | ${trend}`;
}

function destroyGraphCharts(){
  Object.values(graphCharts).forEach(chart => { try{ chart.destroy(); }catch(e){} });
  graphCharts = {};
}

function buildChartConfig(labels, data, metricLabel, periodLabel){
  return {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: metricLabel,
        data,
        borderWidth: 3,
        tension: 0.28,
        pointRadius: 3,
        pointHoverRadius: 5,
        spanGaps: true,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, position: 'top' },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${metricLabel}: ${ctx.parsed.y ?? 'N/A'}`
          }
        }
      },
      scales: {
        x: { title: { display: true, text: periodLabel } },
        y: { title: { display: true, text: metricLabel }, beginAtZero: false }
      }
    }
  };
}

function renderGraphs(){
  const summary = document.getElementById('graphsSummary');
  if(!graphDocsCache.length){
    destroyGraphCharts();
    if(summary) summary.textContent = 'No saved or submitted records are available yet for graphing.';
    GRAPH_METRICS.forEach(metric => {
      const meta = document.getElementById(metric.metaId);
      if(meta) meta.textContent = 'No data available';
    });
    setGraphsNote('No data available for charts.');
    return;
  }

  const periodLabelMap = { daily: 'Date', weekly: 'Week', monthly: 'Month' };
  const series = trimGraphSeries(aggregateGraphData(graphDocsCache, graphState.period, graphState.plant), graphState.range);
  const labels = series.map(item => item.label);
  const plantText = graphState.plant === '__all__' ? 'All WTPs average' : graphState.plant;
  if(summary){
    summary.innerHTML = `<strong>View:</strong> ${plantText} &nbsp; | &nbsp; <strong>Frequency:</strong> ${graphState.period.charAt(0).toUpperCase() + graphState.period.slice(1)} &nbsp; | &nbsp; <strong>Periods shown:</strong> ${series.length}`;
  }

  destroyGraphCharts();

  GRAPH_METRICS.forEach(metric => {
    const meta = document.getElementById(metric.metaId);
    const data = series.map(item => item.values[metric.key]);
    if(meta) meta.textContent = summarizeMetric(data);
    const canvas = document.getElementById(metric.canvasId);
    if(!canvas || typeof Chart === 'undefined') return;
    const ctx = canvas.getContext('2d');
    graphCharts[metric.key] = new Chart(ctx, buildChartConfig(labels, data, metric.label, periodLabelMap[graphState.period]));
  });

  setGraphsNote(series.length ? '' : 'No matching records found for the selected graph filters.');
}

async function loadGraphDocs(){
  const snapshot = await getDocs(collection(db, FIRESTORE_COLLECTION));
  const docs = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data() || {};
    const dateKey = data.dateKey || docSnap.id;
    if(!dateKey) return;
    docs.push({ ...data, id: docSnap.id, dateKey });
  });
  docs.sort((a,b) => {
    const da = parseDateKeyToDate(a.dateKey);
    const db = parseDateKeyToDate(b.dateKey);
    if(da && db) return da - db;
    if(da && !db) return -1;
    if(!da && db) return 1;
    return String(a.dateKey || '').localeCompare(String(b.dateKey || ''));
  });
  return docs;
}

function setupGraphsModal(){
  const btn = document.getElementById('graphsBtn');
  const modal = document.getElementById('graphsModal');
  const closeBtn = document.getElementById('graphsClose');
  const plantSelect = document.getElementById('graphPlantSelect');
  const rangeSelect = document.getElementById('graphRangeSelect');
  const periodBtns = Array.from(document.querySelectorAll('.period-btn'));
  if(!btn || !modal) return;

  let __scrollY = 0;
  const lockScroll = () => {
    __scrollY = window.scrollY || 0;
    document.body.classList.add('modal-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${__scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };
  const unlockScroll = () => {
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, __scrollY);
  };

  const setActivePeriod = (period) => {
    graphState.period = period;
    periodBtns.forEach(btnEl => btnEl.classList.toggle('active', btnEl.dataset.period === period));
    renderGraphs();
  };

  const open = async () => {
    lockScroll();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    setGraphsNote('Loading graph data...');
    populateGraphPlantOptions();
    if(typeof Chart === 'undefined'){
      setGraphsNote('Chart library failed to load. Please check your internet connection and reload the page.');
      return;
    }
    try{
      graphDocsCache = await loadGraphDocs();
      populateGraphPlantOptions();
      renderGraphs();
    }catch(err){
      console.error('❌ Graph load failed:', err);
      setGraphsNote('Error loading chart data. Check console for details.');
    }
  };

  const close = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    destroyGraphCharts();
    unlockScroll();
  };

  btn.addEventListener('click', (e)=> { e.preventDefault(); open(); });
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', (e)=> { if(e.target === modal) close(); });
  document.addEventListener('keydown', (e)=> { if(e.key === 'Escape' && !modal.classList.contains('hidden')) close(); });
  periodBtns.forEach(btnEl => btnEl.addEventListener('click', ()=> setActivePeriod(btnEl.dataset.period)));
  plantSelect?.addEventListener('change', ()=> { graphState.plant = plantSelect.value; renderGraphs(); });
  rangeSelect?.addEventListener('change', ()=> { graphState.range = Number(rangeSelect.value || 0); renderGraphs(); });
}


// -------- Region Submissions (Pie Chart) --------
const REGION_KEYS = ['Central North', 'Central East', 'Central South', 'Matale'];
const REGION_COLORS = {
  'Central North': '#4f46e5',
  'Central East': '#06b6d4',
  'Central South': '#22c55e',
  'Matale': '#f59e0b'
};

let regionPieChart = null;
let regionState = { period: 'weekly', range: 4 };

function setRegionSubmissionsNote(msg){
  const el = document.getElementById('regionSubmissionsNote');
  if(el) el.textContent = msg || '';
}

function normalizeRegionName(value){
  const v = String(value || '').trim();
  return REGION_KEYS.includes(v) ? v : '';
}

function getRegionForRow(row, sectionLabel, inheritedRegion){
  const explicit = normalizeRegionName(row?.region);
  if(explicit) return explicit;
  if(String(sectionLabel || '').trim() === 'Matale District') return 'Matale';
  return inheritedRegion || '';
}

function countEnteredMetrics(row){
  return GRAPH_METRICS.reduce((count, metric) => {
    const rawVal = row?.[metric.field] ?? row?.[metric.fallback] ?? '';
    const cleaned = String(rawVal).trim();
    if(!cleaned || cleaned === '-') return count;
    return count + 1;
  }, 0);
}

function getRecentPeriodKeys(docs, period, range){
  const keys = Array.from(new Set((docs || []).map(docItem => {
    const dt = parseDateKeyToDate(docItem?.dateKey || docItem?.id || '');
    return dt ? toPeriodKey(dt, period) : null;
  }).filter(Boolean)));
  keys.sort((a,b) => {
    const da = period === 'monthly' ? new Date(`${a}-01T12:00:00`) : parseDateKeyToDate(a);
    const db = period === 'monthly' ? new Date(`${b}-01T12:00:00`) : parseDateKeyToDate(b);
    return (da?.getTime?.() || 0) - (db?.getTime?.() || 0);
  });
  if(!range || range <= 0 || keys.length <= range) return keys;
  return keys.slice(keys.length - range);
}

function computeRegionSubmissionCounts(docs, period, range){
  const selectedKeys = new Set(getRecentPeriodKeys(docs, period, range));
  const counts = Object.fromEntries(REGION_KEYS.map(key => [key, 0]));
  let docsUsed = 0;
  let plantsWithData = 0;

  (docs || []).forEach(docItem => {
    const dt = parseDateKeyToDate(docItem?.dateKey || docItem?.id || '');
    if(!dt) return;
    const periodKey = toPeriodKey(dt, period);
    if(!selectedKeys.has(periodKey)) return;
    docsUsed += 1;

    const rows = Array.isArray(docItem?.rows) ? docItem.rows : [];
    let currentSection = '';
    let currentRegion = '';
    rows.forEach(row => {
      if(!row) return;
      if(row.type === 'section'){
        currentSection = row.label || '';
        currentRegion = String(currentSection).trim() === 'Matale District' ? 'Matale' : '';
        return;
      }
      if(!row.plant || String(row.region || '').trim() === 'Total' || String(row.plant || '').trim() === 'Total') return;
      const resolvedRegion = getRegionForRow(row, currentSection, currentRegion);
      if(resolvedRegion) currentRegion = resolvedRegion;
      if(!resolvedRegion) return;
      const entryCount = countEnteredMetrics(row);
      if(entryCount > 0) plantsWithData += 1;
      counts[resolvedRegion] += entryCount;
    });
  });

  const items = REGION_KEYS.map(region => ({
    region,
    value: counts[region],
    color: REGION_COLORS[region],
    percentage: 0
  }));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  items.forEach(item => { item.percentage = total ? (item.value / total) * 100 : 0; });
  items.sort((a,b) => b.value - a.value);

  const selectedLabels = Array.from(selectedKeys).map(key => toPeriodLabel(key, period));
  return { items, total, docsUsed, plantsWithData, selectedLabels };
}

function destroyRegionPieChart(){
  if(regionPieChart){
    try{ regionPieChart.destroy(); }catch(e){}
    regionPieChart = null;
  }
}

function renderRegionBreakdown(items, total){
  const box = document.getElementById('regionBreakdown');
  if(!box) return;
  if(!items.length || !total){
    box.innerHTML = '<div class="note">No entered data found for the selected period.</div>';
    return;
  }
  box.innerHTML = items.map(item => `
    <div class="region-item">
      <span class="region-swatch" style="background:${item.color}"></span>
      <div>
        <div class="region-name">${item.region}</div>
        <div class="region-stats">${item.percentage.toFixed(1)}% of entered data</div>
      </div>
      <div class="region-value">${item.value}</div>
    </div>
  `).join('');
}

function buildRegionPieChart(items){
  return {
    type: 'pie',
    data: {
      labels: items.map(item => item.region),
      datasets: [{
        data: items.map(item => item.value),
        backgroundColor: items.map(item => item.color),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 8
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const value = Number(ctx.parsed || 0);
              const total = ctx.dataset.data.reduce((sum, num) => sum + Number(num || 0), 0);
              const pct = total ? ((value / total) * 100).toFixed(1) : '0.0';
              return `${ctx.label}: ${value} data points (${pct}%)`;
            }
          }
        }
      }
    }
  };
}

function renderRegionSubmissions(){
  const summary = document.getElementById('regionSummary');
  const meta = document.getElementById('regionChartMeta');
  if(!graphDocsCache.length){
    destroyRegionPieChart();
    if(summary) summary.textContent = 'No saved or submitted records are available yet.';
    if(meta) meta.textContent = 'No data available';
    renderRegionBreakdown([], 0);
    setRegionSubmissionsNote('No data available for region submissions.');
    return;
  }

  const result = computeRegionSubmissionCounts(graphDocsCache, regionState.period, regionState.range);
  const rankedItems = result.items;
  const positiveItems = rankedItems.filter(item => item.value > 0);
  const leader = positiveItems[0];

  if(summary){
    const periodText = regionState.period.charAt(0).toUpperCase() + regionState.period.slice(1);
    const coverage = result.selectedLabels.length
      ? `${result.selectedLabels[0]} to ${result.selectedLabels[result.selectedLabels.length - 1]}`
      : 'No matching periods';
    summary.innerHTML = `<strong>Frequency:</strong> ${periodText} &nbsp; | &nbsp; <strong>Coverage:</strong> ${coverage} &nbsp; | &nbsp; <strong>Total entered data points:</strong> ${result.total}`;
  }

  if(meta){
    meta.textContent = leader
      ? `${leader.region} has the most entered data (${leader.value} data points, ${leader.percentage.toFixed(1)}%).`
      : 'No entered data found for the selected period.';
  }

  destroyRegionPieChart();
  const canvas = document.getElementById('regionPieChart');
  if(canvas && typeof Chart !== 'undefined' && positiveItems.length){
    regionPieChart = new Chart(canvas.getContext('2d'), buildRegionPieChart(positiveItems));
  }
  renderRegionBreakdown(rankedItems, result.total);
  setRegionSubmissionsNote(result.total
    ? `Based on non-empty Raw, Treated, RCL and pH entries across ${result.docsUsed} record(s) and ${result.plantsWithData} plant row(s).`
    : 'No entered data found for the selected period.');
}

function setupRegionSubmissionsModal(){
  const btn = document.getElementById('regionSubmissionsBtn');
  const modal = document.getElementById('regionSubmissionsModal');
  const closeBtn = document.getElementById('regionSubmissionsClose');
  const rangeSelect = document.getElementById('regionRangeSelect');
  const periodBtns = Array.from(document.querySelectorAll('.region-period-btn'));
  if(!btn || !modal) return;

  let __scrollY = 0;
  const lockScroll = () => {
    __scrollY = window.scrollY || 0;
    document.body.classList.add('modal-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${__scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };
  const unlockScroll = () => {
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, __scrollY);
  };

  const setActivePeriod = (period) => {
    regionState.period = period;
    periodBtns.forEach(btnEl => btnEl.classList.toggle('active', btnEl.dataset.period === period));
    const defaultRange = period === 'monthly' ? 12 : 4;
    if(rangeSelect && Number(rangeSelect.value || 0) !== 0){
      rangeSelect.value = String(defaultRange);
      regionState.range = defaultRange;
    }
    renderRegionSubmissions();
  };

  const open = async () => {
    lockScroll();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    setRegionSubmissionsNote('Loading region submission data...');
    if(typeof Chart === 'undefined'){
      setRegionSubmissionsNote('Chart library failed to load. Please reload the page.');
      return;
    }
    try{
      graphDocsCache = await loadGraphDocs();
      renderRegionSubmissions();
    }catch(err){
      console.error('❌ Region submission load failed:', err);
      setRegionSubmissionsNote('Error loading region submission data. Check console for details.');
    }
  };

  const close = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    destroyRegionPieChart();
    unlockScroll();
  };

  btn.addEventListener('click', (e) => { e.preventDefault(); open(); });
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if(e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && !modal.classList.contains('hidden')) close(); });
  periodBtns.forEach(btnEl => btnEl.addEventListener('click', () => setActivePeriod(btnEl.dataset.period)));
  rangeSelect?.addEventListener('change', () => {
    regionState.range = Number(rangeSelect.value || 0);
    renderRegionSubmissions();
  });
}
