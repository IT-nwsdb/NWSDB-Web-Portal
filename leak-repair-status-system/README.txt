LEAK REPAIR STATUS SYSTEM - FIREBASE CONNECTED VERSION

How to use:
1. Run the project using a local web server.
2. Open index.html in the browser.
3. Select the region.
4. Select the location/sheet.
5. Click Edit.
6. Fill or correct the Excel-style table.
7. Click Save Changes.

Important:
- Saved data is now stored in Firebase Firestore.
- Browser localStorage is no longer used for sheet saving.
- The Download CSV feature has been removed.
- The Save Changes button appears only after clicking Edit.
- Original Excel files are included in the excel-files folder for reference.
- To reset a sheet, open it and click Clear Saved. This deletes the saved Firestore document for that sheet.

Firebase project:
- Project ID: nrw-water-leaks
- Collection name: leakRepairStatus
- Authentication required: Anonymous Authentication must be enabled.

Required Firebase setup:
1. Enable Firestore Database.
2. Enable Authentication > Sign-in method > Anonymous.
3. Publish the Firestore rules from the firestore.rules file.

Recommended way to run:
- Use VS Code Live Server, or
- Run python -m http.server in the project folder and open http://localhost:8000

Latest updates:
- Connected Save Changes to Firebase Firestore.
- Connected sheet loading to Firebase Firestore.
- Connected Clear Saved to Firebase Firestore delete.
- Added saved-status checking on the location selection page using Firestore.
- Removed CSV download feature completely.
- Removed localStorage saving.
- Added firestore.rules and FIREBASE_SETUP.txt.
- Added arrow-key navigation inside the Excel-style table. Use Up, Down, Left, and Right arrow keys to move between editable cells.
- Added automatic daily date-row extension for location/data-entry sheets. If a sheet's last date is behind the browser's current date, missing rows are created when the sheet opens. Tomorrow's row will appear automatically when the browser date becomes tomorrow.
- Removed the date search tools.
- Added a simple Edit button. After clicking Edit, Save Changes appears so users can save the updated values.
