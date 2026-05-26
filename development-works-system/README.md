Project Data Entry Website

Overview
- Single-page browser app for 3 project sheets.
- Saves data to Firebase Firestore when run over http/https.
- Keeps a local browser backup as fallback.
- Works without a backend server of its own.

Important
- Do not open index.html by double-clicking it if you want Firebase database sync.
- Direct file:// mode is supported only for local browser backup.
- For Firebase sync, run with:
  - VS Code Live Server, or
  - python -m http.server 5500, or
  - GitHub Pages

Firebase requirements
- Firestore Database enabled
- Firestore rules published from FIRESTORE_RULES.txt
- No Firebase Authentication step is required in this version

Files
- index.html
- assets/css/styles.css
- assets/js/app.js
- FIREBASE_SETUP.txt
- FIRESTORE_RULES.txt

Data model
- Collection: project_data_entry_sheets
- Documents: proposed, feasibility, rechargable
- Each document stores rows plus metadata
