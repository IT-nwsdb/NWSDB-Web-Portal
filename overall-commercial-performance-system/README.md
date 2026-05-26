# Overall Commercial Performance System

A lightweight single-page commercial performance dashboard with:
- Region selection after the loading screen
- Separate editable tables for CENTRAL NORTH, CENTRAL EAST, CENTRAL SOUTH, and MATALE
- An OVERALL table that auto-calculates as the sum of those four regions
- Browser backup via localStorage
- Cloud save/load via Firebase Firestore
- Section graphs via Chart.js

## Region behavior
- CENTRAL NORTH, CENTRAL EAST, CENTRAL SOUTH, and MATALE are editable.
- Each editable region saves to its own Firestore document.
- OVERALL is read-only and always shows the live total of the four editable regions.
- Save/Reset are disabled in OVERALL because it is computed automatically.

## Firestore document IDs
The app stores each editable region in the `overall_commercial_performance` collection:
- `central_north`
- `central_east`
- `central_south`
- `matale`

OVERALL is not saved as its own document. It is calculated in the browser.

## Notes
- The Number of Connections > Total row is auto-calculated for each region and for OVERALL.
- Local cache key: `overall_commercial_performance_firestore_cache_regions_v2`
- `script.js` remains as a legacy file and is not used by `index.html`.
