/* core.js — Data layer + admin config + page flows
   - Local cache helpers (LS)
   - Cloud persistence (Firestore + Storage)
   - Admin config (regions/locations) + change event
   - Home dropdown builders
   - Data-entry page flows (Scheme, Labs, Plant) incl. image compression + preview
   - Offline sync (local -> cloud when online), photo uploads
   - Plant geo (lat/lng) support
   - Public map refresh functionality (with throttle)
   Dependencies (from script.js):
   - ensureOnlineAuth, waitForServerCommit, makeDocId, showToast, parseNum, formatRegionName
   - bindUIRefs, ensureExtendedSectionsInjected, resetExtendedDataFields, populateExtendedDataFields
   - populateCategories, renderConnectionsList, togglePage
*/

/* ===========================
   Local cache
   =========================== */
function saveConnectionsLS(region, location, entries) {
  try {
    localStorage.setItem(lsKey.conn(region, location), JSON.stringify(entries || []));
  } catch (error) {
    console.error('Failed to save connections to localStorage:', error);
    showToast('Failed to save data locally', 'warning');
  }
}

function loadConnectionsLS(region, location) {
  try {
    return JSON.parse(localStorage.getItem(lsKey.conn(region, location)) || '[]');
  } catch (error) {
    console.error('Failed to load connections from localStorage:', error);
    return [];
  }
}

function saveExtendedDataLS(payload) {
  if (!payload?.region || !payload?.location) return;
  try {
    localStorage.setItem(lsKey.ext(payload.region, payload.location), JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save extended data to localStorage:', error);
    showToast('Failed to save extended data locally', 'warning');
  }
}

function loadExtendedDataLS(region, location) {
  try {
    const data = localStorage.getItem(lsKey.ext(region, location));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load extended data from localStorage:', error);
    return null;
  }
}

function saveLabsDataLS(region, location, payload) {
  try {
    localStorage.setItem(lsKey.labs(region, location), JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save labs data to localStorage:', error);
    showToast('Failed to save labs data locally', 'warning');
  }
}

function loadLabsDataLS(region, location) {
  try {
    const data = localStorage.getItem(lsKey.labs(region, location));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load labs data from localStorage:', error);
    return null;
  }
}

function savePlantDataLS(region, location, payload) {
  try {
    localStorage.setItem(lsKey.plant(region, location), JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save plant data to localStorage:', error);
    showToast('Failed to save plant data locally', 'warning');
  }
}

function loadPlantDataLS(region, location) {
  try {
    const data = localStorage.getItem(lsKey.plant(region, location));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load plant data from localStorage:', error);
    return null;
  }
}

function lsAll(prefix) {
  const arr = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        try {
          const v = JSON.parse(localStorage.getItem(k));
          if (v) arr.push(v);
        } catch (parseError) {
          console.warn('Failed to parse localStorage item:', k, parseError);
        }
      }
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return arr;
}
window.lsAll = lsAll;

/* ===========================
   Helpers (time + images)
   =========================== */
function tsToMillis(ts) {
  if (!ts) return 0;
  try {
    if (typeof ts.toMillis === 'function') return ts.toMillis();
    if (ts.seconds != null && ts.nanoseconds != null) {
      return ts.seconds * 1000 + Math.round(ts.nanoseconds / 1e6);
    }
  } catch (_) {}
  const d = new Date(ts);
  return Number.isFinite(d.getTime()) ? d.getTime() : 0;
}

function guessImageExt(p) {
  // by file name
  const name = (p?.name || '').toLowerCase();
  const mName = name.match(/\.(jpg|jpeg|png|webp|gif)$/i);
  if (mName) return mName[1].toLowerCase() === 'jpeg' ? 'jpg' : mName[1].toLowerCase();

  // by MIME type
  const type = (p?.type || '').toLowerCase();
  const t = type.includes('/') ? type.split('/')[1] : '';
  if (t && t !== '*') return t === 'jpeg' ? 'jpg' : t;

  // by data URL
  const mDU = /^data:image\/([a-z0-9+.-]+);/i.exec(p?.dataUrl || '');
  if (mDU) return mDU[1].toLowerCase() === 'jpeg' ? 'jpg' : mDU[1].toLowerCase();

  return 'jpg';
}

// Accurate byte estimate for base64 data URLs
function estimateDataUrlBytes(dataUrl) {
  if (typeof dataUrl !== 'string') return 0;
  const i = dataUrl.indexOf(',');
  if (i === -1) return 0;
  const base64 = dataUrl.slice(i + 1);
  const padding = (base64.match(/=+$/) || [''])[0].length;
  // 4 base64 chars -> 3 bytes
  return Math.floor(base64.length * 3 / 4) - padding;
}

/* ===========================
   Cloud persistence
   =========================== */
async function saveSchemeData(payload) {
  if (!payload?.region || !payload?.location) {
    showToast("Select region & location first.", "danger");
    return;
  }

  try {
    await ensureOnlineAuth();
    const { fsMod } = FB.mod;
    const id = makeDocId(payload.region, payload.location);
    const toSave = { ...payload, updatedAt: (fsMod.serverTimestamp?.() || new Date().toISOString()) };
    await fsMod.setDoc(fsMod.doc(FB.db, 'schemeExtended', id), toSave, { merge: true });
    
    // Reduced timeout for faster response
    try {
      await waitForServerCommit(5000);
    } catch (timeoutError) {
      console.warn('Server commit timeout, continuing...');
    }

    saveExtendedDataLS({ ...payload, updatedAt: new Date().toISOString() });
    showToast("Scheme data saved to cloud successfully!", "success");
  } catch (e) {
    console.error('Scheme save failed:', e);
    // Enhanced error messaging
    if (e.message?.includes('timeout')) {
      showToast("Saved locally. Upload timed out - will sync when you're online.", "warning");
    } else if (e.message?.includes('internet') || e.message?.includes('network') || e.message?.includes('offline')) {
      showToast("Saved locally. No internet connection - will sync when online.", "warning");
    } else if (e.message?.includes('auth') || e.message?.includes('permission')) {
      showToast("Authentication issue. Please log in again.", "danger");
    } else {
      showToast("Saved locally. Cloud sync failed: " + (e.message || 'Unknown error'), "warning");
    }
    
    // Offline fallback
    saveExtendedDataLS({ ...payload, updatedAt: new Date().toISOString() });
  } finally {
    if (typeof renderSubmissions === 'function' && window.subPageInited) renderSubmissions();
  }
}

async function saveLabsData(payload) {
  if (!payload?.region || !payload?.location) {
    showToast("Select region & location first.", "danger");
    return;
  }

  try {
    await ensureOnlineAuth();
    const { fsMod } = FB.mod;
    const id = makeDocId(payload.region, payload.location);
    const toSave = { ...payload, updatedAt: (fsMod.serverTimestamp?.() || new Date().toISOString()) };
    await fsMod.setDoc(fsMod.doc(FB.db, 'labsSubmissions', id), toSave, { merge: true });
    
    // Reduced timeout for faster response
    try {
      await waitForServerCommit(5000);
    } catch (timeoutError) {
      console.warn('Server commit timeout, continuing...');
    }

    saveLabsDataLS(payload.region, payload.location, { ...payload, updatedAt: new Date().toISOString() });
    showToast("Labs data saved to cloud successfully!", "success");
  } catch (e) {
    console.error('Labs save failed:', e);
    // Enhanced error messaging
    if (e.message?.includes('timeout')) {
      showToast("Saved locally. Upload timed out - will sync when you're online.", "warning");
    } else if (e.message?.includes('internet') || e.message?.includes('network') || e.message?.includes('offline')) {
      showToast("Saved locally. No internet connection - will sync when online.", "warning");
    } else if (e.message?.includes('auth') || e.message?.includes('permission')) {
      showToast("Authentication issue. Please log in again.", "danger");
    } else {
      showToast("Saved locally. Cloud sync failed: " + (e.message || 'Unknown error'), "warning");
    }
    
    // Offline fallback
    saveLabsDataLS(payload.region, payload.location, { ...payload, updatedAt: new Date().toISOString() });
  } finally {
    if (typeof renderSubmissions === 'function' && window.subPageInited) renderSubmissions();
  }
}

/* Concurrency-limited Storage uploads for plant photos - ENHANCED */
async function uploadPlantPhotosToStorage(region, location, photos) {
  if (!photos || !photos.length) return [];

  try {
    await ensureOnlineAuth();
    const { storageMod } = FB.mod;

    const uploadOne = async (p, i) => {
      try {
        if (p?.dataUrl?.startsWith('http')) return p.dataUrl; // already uploaded (URL)
        
        // Accurate size check (>5MB)
        const BYTES_5MB = 5 * 1024 * 1024;
        const photoSize = estimateDataUrlBytes(p.dataUrl);
        if (p.dataUrl && photoSize > BYTES_5MB) {
          console.warn('Photo too large, skipping upload:', p.name, `(${(photoSize / 1024 / 1024).toFixed(2)}MB)`);
          showToast(`Photo "${p.name}" is too large (max 5MB)`, 'warning');
          return null;
        }
        
        const ext = guessImageExt(p);
        const safeReg = encodeURIComponent(String(region || 'region')).replace(/\./g, '%2E');
        const safeLoc = encodeURIComponent(String(location || 'loc')).replace(/\./g, '%2E');
        const path = `plant_photos/${safeReg}/${safeLoc}/${Date.now()}_${i}.${ext}`;
        const r = storageMod.ref(FB.storage, path);
        
        // Upload with timeout
        const uploadPromise = storageMod.uploadString(r, p.dataUrl, 'data_url');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 15000)
        );
        
        await Promise.race([uploadPromise, timeoutPromise]);
        const downloadUrl = await storageMod.getDownloadURL(r);
        console.log(`Successfully uploaded photo ${i + 1}: ${p.name}`);
        return downloadUrl;
      } catch (photoError) {
        console.warn('Upload failed for photo', i, photoError);
        showToast(`Failed to upload photo "${p?.name || i + 1}"`, 'warning');
        return null; // Return null instead of throwing to continue with other photos
      }
    };

    const concurrency = 2; // Reduced concurrency for better stability
    const ret = new Array(photos.length);
    let i = 0, active = 0;

    return await new Promise((resolve) => {
      const next = () => {
        if (i >= photos.length && active === 0) {
          const successfulUploads = ret.filter(Boolean).length;
          console.log(`Photo upload completed: ${successfulUploads}/${photos.length} successful`);
          if (successfulUploads < photos.length) {
            showToast(`Uploaded ${successfulUploads}/${photos.length} photos successfully`, 'warning');
          }
          resolve(ret.filter(Boolean)); // Only return successful uploads
          return;
        }
        while (active < concurrency && i < photos.length) {
          const idx = i++; active++;
          uploadOne(photos[idx], idx)
            .then((url) => { ret[idx] = url; })
            .catch((err) => { 
              console.warn('Upload failed for photo', idx, err); 
              ret[idx] = null; 
            })
            .finally(() => { active--; next(); });
        }
      };
      next();
    });
  } catch (error) {
    console.error('Photo upload process failed:', error);
    showToast('Photo upload process failed. Check internet connection.', 'warning');
    return []; // Return empty array instead of throwing
  }
}

/* ===========================
   Public Map Refresh Helper (with throttle)
   =========================== */
function refreshPublicPlantMap() {
  if (typeof getPublicPlantRecords === 'function' && typeof addPublicPlantMarkers === 'function') {
    try {
      const plantRecords = getPublicPlantRecords();
      console.log('Refreshing public map with', plantRecords.length, 'plant records');
      addPublicPlantMarkers(plantRecords);
      
      // Force map resize if needed
      if (window.PUBLIC_PLANT_MAP) {
        setTimeout(() => {
          window.PUBLIC_PLANT_MAP.invalidateSize(true);
        }, 100);
      }
    } catch (e) {
      console.warn('Could not refresh public map:', e?.message || e);
    }
  } else {
    console.warn('Public map functions not available for refresh');
  }
}

let __refreshPublicMapPending = false;
function throttleRefreshPublicPlantMap(delay = 200) {
  if (__refreshPublicMapPending) return;
  __refreshPublicMapPending = true;
  setTimeout(() => {
    __refreshPublicMapPending = false;
    try { refreshPublicPlantMap(); } catch (e) { console.warn(e); }
  }, delay);
}

/* ===========================
   Global Plant Data Save Function - FIXED PHOTO UPLOAD VERSION
   =========================== */
window.savePlantData = async function(payload) {
  if (!payload?.region || !payload?.location) {
    showToast("Select region & location first.", "danger");
    return;
  }

  // Enhanced data validation
  const validationErrors = validatePlantData?.(payload) || [];
  if (validationErrors.length > 0) {
    showToast(`Validation errors: ${validationErrors.join(', ')}`, "danger");
    return;
  }

  // Get submit button reference for state management
  const submitBtn = document.getElementById('plantSubmitBtn');
  const originalText = submitBtn?.innerHTML || 'Submit';

  try {
    // Show loading state immediately
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Submitting...';
      submitBtn.disabled = true;
    }

    showToast("Starting submission...", "info");

    // Save to local storage immediately first
    const localSaveData = {
      ...payload,
      photoUrls: [], // Initialize empty, will be updated if upload succeeds
      updatedAt: new Date().toISOString()
    };
    savePlantDataLS(payload.region, payload.location, localSaveData);
    
    // First ensure we're authenticated with timeout
    try {
      const authPromise = ensureOnlineAuth();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout')), 10000)
      );
      await Promise.race([authPromise, timeoutPromise]);
    } catch (authError) {
      console.warn('Auth failed, continuing offline:', authError);
    }
    
    let photoUrls = [];
    
    // Only upload photos if there are any
    if (payload.photosInline && payload.photosInline.length > 0) {
      showToast(`Uploading ${payload.photosInline.length} photos...`, "info");
      console.log('Starting photo upload for', payload.photosInline.length, 'photos');
      
      try {
        const uploadPromise = uploadPlantPhotosToStorage(payload.region, payload.location, payload.photosInline);
        const uploadTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Photo upload timeout')), 30000)
        );
        
        photoUrls = await Promise.race([uploadPromise, uploadTimeout]);
        console.log('Successfully uploaded', photoUrls.length, 'photos');
        
        if (photoUrls.length < payload.photosInline.length) {
          showToast(`Uploaded ${photoUrls.length}/${payload.photosInline.length} photos successfully`, 'warning');
        }
      } catch (uploadError) {
        console.error('Photo upload failed:', uploadError);
        showToast('Photo upload failed. Data saved locally.', 'warning');
        // Continue without photos
      }
    }

    const { photosInline, ...rest } = payload;
    const toFirestore = { 
      ...rest, 
      photoUrls, 
      updatedAt: new Date().toISOString() 
    };

    // Try to save to Firestore if online
    try {
      if (FB?.mod && FB.db) {
        const { fsMod } = FB.mod;
        const id = makeDocId(payload.region, payload.location);
        
        showToast("Saving to database...", "info");
        
        const savePromise = fsMod.setDoc(fsMod.doc(FB.db, 'plantSubmissions', id), toFirestore, { merge: true });
        const saveTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database save timeout')), 15000)
        );
        
        await Promise.race([savePromise, saveTimeout]);
        
        try {
          await waitForServerCommit(3000);
        } catch (timeoutError) {
          console.warn('Server commit timeout, continuing...');
        }
      }
    } catch (firestoreError) {
      console.warn('Firestore save failed, continuing locally:', firestoreError);
    }

    // Update local storage with final data
    const finalLocalData = { 
      ...payload, 
      photoUrls,
      photosInline: undefined, // Remove inline photos to save space
      updatedAt: new Date().toISOString() 
    };
    savePlantDataLS(payload.region, payload.location, finalLocalData);
    
    showToast("Plant data saved successfully!", "success");
    
    // Refresh public map after successful save
    setTimeout(() => {
      try {
        if (typeof throttleRefreshPublicPlantMap === 'function') {
          throttleRefreshPublicPlantMap();
        }
        // Also trigger event for other components
        window.dispatchEvent(new CustomEvent('nwsdb:plantDataUpdated'));
      } catch (e) {
        console.warn('Failed to refresh public map after save:', e);
      }
    }, 500);
    
  } catch (e) {
    console.error('Plant save failed:', e);
    
    // Enhanced error messaging
    if (e.message?.includes('timeout')) {
      showToast("Saved locally. Upload timed out - will sync when you're online.", "warning");
    } else if (e.message?.includes('internet') || e.message?.includes('network') || e.message?.includes('offline')) {
      showToast("Saved locally. No internet connection - will sync when online.", "warning");
    } else if (e.message?.includes('photo') || e.message?.includes('upload')) {
      showToast("Data saved but photos failed to upload. Check internet connection.", "warning");
    } else if (e.message?.includes('auth') || e.message?.includes('permission')) {
      showToast("Authentication issue. Please log in again.", "danger");
    } else {
      showToast("Saved locally. Cloud sync failed: " + (e.message || 'Unknown error'), "warning");
    }
  } finally {
    // Always restore button state
    if (submitBtn) {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
    
    if (typeof renderSubmissions === 'function' && window.subPageInited) {
      setTimeout(() => renderSubmissions(), 500);
    }
    
    // Return to home page after a short delay
    setTimeout(() => {
      if (typeof showHomePage === 'function') {
        showHomePage();
      }
    }, 2000);
  }
};

async function fetchCloudDoc(collectionName, region, location) {
  try {
    await initFirebase();
    if (!FB.db) return null;

    const { fsMod } = FB.mod;
    const id = makeDocId(region, location);
    const snap = await fsMod.getDoc(fsMod.doc(FB.db, collectionName, id));
    return snap.exists() ? (snap.data() || null) : null;
  } catch (e) {
    console.warn('Fetch cloud doc failed:', e?.message || e);
    return null;
  }
}

async function syncAllFromCloudToLS() {
  if (!isOnline()) {
    console.log('Offline - skipping cloud sync');
    return;
  }

  try {
    await ensureOnlineAuth();
    const { fsMod } = FB.mod;

    const collections = ['schemeExtended', 'labsSubmissions', 'plantSubmissions'];
    let totalSynced = 0;

    for (const c of collections) {
      try {
        const q = fsMod.collection(FB.db, c);
        const snap = await fsMod.getDocs(q);

        snap.forEach(docSnap => {
          const data = docSnap.data();
          if (data?.region && data?.location) {
            if (c === 'schemeExtended') saveExtendedDataLS(data);
            else if (c === 'labsSubmissions') saveLabsDataLS(data.region, data.location, data);
            else if (c === 'plantSubmissions') savePlantDataLS(data.region, data.location, data);
            totalSynced++;
          }
        });
      } catch (e) {
        console.warn(`Sync ${c} failed:`, e?.message || e);
      }
    }
    
    if (totalSynced > 0) {
      console.log(`Cloud sync completed: ${totalSynced} items synced`);
      showToast(`Synced ${totalSynced} items from cloud`, 'success');
    }
    
    // Refresh public map after sync (throttled)
    setTimeout(() => {
      try {
        throttleRefreshPublicPlantMap();
        console.log('Cloud sync completed, public map refreshed');
      } catch (e) {
        console.warn('Failed to refresh public map after sync:', e);
      }
    }, 300);
    
  } catch (e) {
    console.warn('Cloud->LS sync failed:', e?.message || e);
    showToast('Cloud sync failed. Working with local data.', 'warning');
  }
}
window.syncAllFromCloudToLS = syncAllFromCloudToLS;
window.fetchCloudDoc = fetchCloudDoc;

/* ===========================
   Offline push: Local -> Cloud when online
   =========================== */
async function pushSchemeLocal(local) {
  try {
    const { fsMod } = FB.mod;
    const id = makeDocId(local.region, local.location);
    const toSave = { ...local, updatedAt: (fsMod.serverTimestamp?.() || new Date().toISOString()) };
    await fsMod.setDoc(fsMod.doc(FB.db, 'schemeExtended', id), toSave, { merge: true });
    
    try {
      await waitForServerCommit(5000);
    } catch (timeoutError) {
      console.warn('Server commit timeout during push');
    }
    
    saveExtendedDataLS({ ...local, updatedAt: new Date().toISOString() });
    return true;
  } catch (error) {
    console.error('Push scheme local failed:', error);
    throw error;
  }
}

async function pushLabsLocal(local) {
  try {
    const { fsMod } = FB.mod;
    const id = makeDocId(local.region, local.location);
    const toSave = { ...local, updatedAt: (fsMod.serverTimestamp?.() || new Date().toISOString()) };
    await fsMod.setDoc(fsMod.doc(FB.db, 'labsSubmissions', id), toSave, { merge: true });
    
    try {
      await waitForServerCommit(5000);
    } catch (timeoutError) {
      console.warn('Server commit timeout during push');
    }
    
    saveLabsDataLS(local.region, local.location, { ...local, updatedAt: new Date().toISOString() });
    return true;
  } catch (error) {
    console.error('Push labs local failed:', error);
    throw error;
  }
}

async function pushPlantLocal(local) {
  try {
    const { fsMod } = FB.mod;
    
    // Only upload photos if there are any and they haven't been uploaded yet
    let photoUrls = local.photoUrls || [];
    const inlinePhotos = local.photosInline || [];
    
    if (inlinePhotos.length > 0 && photoUrls.length === 0) {
      try {
        showToast('Uploading photos from offline data...', 'info');
        photoUrls = await uploadPlantPhotosToStorage(local.region, local.location, inlinePhotos);
        console.log('Uploaded', photoUrls.length, 'photos during sync');
        
        if (photoUrls.length < inlinePhotos.length) {
          console.warn(`Only uploaded ${photoUrls.length}/${inlinePhotos.length} photos during sync`);
        }
      } catch (uploadError) {
        console.warn('Photo upload during sync failed:', uploadError);
        // Continue without photos - they'll be retried next sync
      }
    }

    const id = makeDocId(local.region, local.location);
    const toFirestore = {
      ...local,
      photoUrls,
      updatedAt: (fsMod.serverTimestamp?.() || new Date().toISOString())
    };
    delete toFirestore.photosInline;

    await fsMod.setDoc(fsMod.doc(FB.db, 'plantSubmissions', id), toFirestore, { merge: true });
    
    try {
      await waitForServerCommit(5000);
    } catch (timeoutError) {
      console.warn('Server commit timeout during push');
    }
    
    savePlantDataLS(local.region, local.location, {
      ...local,
      photoUrls,
      updatedAt: new Date().toISOString()
    });
    
    // Refresh public map after sync (throttled)
    setTimeout(() => {
      try {
        throttleRefreshPublicPlantMap();
      } catch (e) {
        console.warn('Failed to refresh public map after plant sync:', e);
      }
    }, 200);
    
    return true;
  } catch (error) {
    console.error('Push plant local failed:', error);
    throw error;
  }
}

/**
 * Push newer local entries to cloud.
 * Compares updatedAt/submittedAt and only pushes when local is newer or cloud is missing.
 */
async function syncLocalToCloud() {
  if (!isOnline()) {
    console.log('Offline - skipping local to cloud sync');
    return;
  }
  
  try {
    await ensureOnlineAuth();
    const bumpCount = { n: 0 };

    const checkAndPush = async (collection, local, pusher) => {
      try {
        const remote = await fetchCloudDoc(collection, local.region, local.location);
        const lms = tsToMillis(local.updatedAt || local.submittedAt);
        const rms = tsToMillis(remote?.updatedAt || remote?.submittedAt);
        if (!remote || lms > rms) {
          console.log(`Pushing ${collection} for ${local.region}/${local.location}`);
          await pusher(local);
          bumpCount.n++;
        }
      } catch (e) {
        console.warn(`syncLocalToCloud ${collection} failed for ${local.region}/${local.location}:`, e?.message || e);
      }
    };

    for (const s of lsAll('nwsdb:extended:')) await checkAndPush('schemeExtended',   s, pushSchemeLocal);
    for (const l of lsAll('nwsdb:labs:'))     await checkAndPush('labsSubmissions', l, pushLabsLocal);
    for (const p of lsAll('nwsdb:plant:'))    await checkAndPush('plantSubmissions', p, pushPlantLocal);

    if (bumpCount.n > 0) {
      showToast(`Synced ${bumpCount.n} item(s) to cloud.`, 'success');
      // Refresh public map after sync (throttled)
      setTimeout(throttleRefreshPublicPlantMap, 500);
    } else {
      console.log('No local changes to sync to cloud');
    }
  } catch (e) {
    console.warn('syncLocalToCloud failed:', e?.message || e);
    showToast('Sync to cloud failed. Will retry later.', 'warning');
  }
}
window.syncLocalToCloud = syncLocalToCloud;

// Auto-sync when online with enhanced error handling
window.addEventListener('online', () => {
  setTimeout(() => {
    console.log('Online - starting sync operations');
    syncLocalToCloud()
      .then(() => { 
        try { 
          syncAllFromCloudToLS(); 
        } catch(e) {
          console.warn('Cloud sync after online failed:', e);
        }
      })
      .catch(e => {
        console.warn('Auto-sync failed:', e);
      });
  }, 2000); // Increased delay to ensure stable connection
});

/* ===========================
   Admin config (regions/locations)
   =========================== */
const ADMIN_LS_KEY = 'nwsdb:adminConfig';
let ADMIN_CFG = null;

function loadAdminConfig() {
  if (ADMIN_CFG) return ADMIN_CFG;
  try {
    const raw = localStorage.getItem(ADMIN_LS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    ADMIN_CFG = parsed && parsed.datasets ? parsed : { datasets: { scheme: { regions: {} }, plant: { regions: {} }, labs: { regions: {} } } };
  } catch (error) {
    console.error('Failed to load admin config:', error);
    ADMIN_CFG = { datasets: { scheme: { regions: {} }, plant: { regions: {} }, labs: { regions: {} } } };
  }
  return ADMIN_CFG;
}

function saveAdminConfig(cfg = ADMIN_CFG) {
  try {
    ADMIN_CFG = cfg;
    localStorage.setItem(ADMIN_LS_KEY, JSON.stringify(cfg));
    try {
      window.dispatchEvent(new CustomEvent('nwsdb:adminConfigUpdated'));
    } catch (_) {}
  } catch (error) {
    console.error('Failed to save admin config:', error);
    showToast('Failed to save admin configuration', 'danger');
  }
}

function getDefaultRegions(dataset) {
  if (dataset === 'scheme') return Object.keys(REGION_ITEMS);
  return Object.keys(LABS_REGION_ITEMS); // plant and labs share default list by default
}
function getDefaultLocations(dataset, region) {
  if (dataset === 'scheme') return REGION_ITEMS[region] || [];
  return LABS_REGION_ITEMS[region] || [];
}

function getMergedRegions(dataset) {
  const cfg = loadAdminConfig();
  const def = new Set(getDefaultRegions(dataset));
  const adm = Object.keys(cfg.datasets[dataset]?.regions || {});
  adm.forEach(k => def.add(k));
  return Array.from(def);
}

function getMergedLocations(dataset, region) {
  const cfg = loadAdminConfig();
  const def = getDefaultLocations(dataset, region);
  const adm = cfg.datasets[dataset]?.regions?.[region]?.locations || [];
  const set = new Set([...(def || []), ...(adm || [])]);
  return Array.from(set);
}

function getRegionLabelForDataset(dataset, regionKey) {
  const cfg = loadAdminConfig();
  const lbl = cfg.datasets[dataset]?.regions?.[regionKey]?.label;
  if (lbl && String(lbl).trim()) return lbl.trim();
  return REGION_LABELS[regionKey] || String(regionKey).replace(/_/g, ' ');
}

// Used by script.js formatRegionName()
function getRegionLabelForAny(regionKey) {
  const ds = ['scheme', 'plant', 'labs'];
  for (const d of ds) {
    const lbl = loadAdminConfig().datasets[d]?.regions?.[regionKey]?.label;
    if (lbl && String(lbl).trim()) return lbl.trim();
  }
  return REGION_LABELS[regionKey] || null;
}

function adminAddRegion(dataset, regionKey, label) {
  try {
    const cfg = loadAdminConfig();
    const key = String(regionKey || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim().replace(/\s+/g, '') ||
                String(label || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim().replace(/\s+/g, '');
    if (!key) throw new Error('Region key required');
    if (!cfg.datasets[dataset]) cfg.datasets[dataset] = { regions: {} };
    if (!cfg.datasets[dataset].regions[key]) cfg.datasets[dataset].regions[key] = { label: '', locations: [] };
    if (label != null) cfg.datasets[dataset].regions[key].label = String(label).trim();
    saveAdminConfig(cfg);
    return key;
  } catch (error) {
    console.error('Failed to add region:', error);
    throw error;
  }
}

function adminAddLocation(dataset, regionKey, locationName) {
  try {
    const cfg = loadAdminConfig();
    const key = String(regionKey || '').toUpperCase().trim();
    const loc = String(locationName || '').trim();
    if (!key || !loc) throw new Error('Region and location required');
    if (!cfg.datasets[dataset]) cfg.datasets[dataset] = { regions: {} };
    if (!cfg.datasets[dataset].regions[key]) cfg.datasets[dataset].regions[key] = { label: '', locations: [] };
    const arr = cfg.datasets[dataset].regions[key].locations;
    if (!arr.includes(loc)) arr.push(loc);
    saveAdminConfig(cfg);
  } catch (error) {
    console.error('Failed to add location:', error);
    throw error;
  }
}

function adminDeleteLocation(dataset, regionKey, locationName) {
  try {
    const cfg = loadAdminConfig();
    const r = cfg.datasets[dataset]?.regions?.[regionKey];
    if (!r) return;
    r.locations = (r.locations || []).filter(x => x !== locationName);
    if (!r.locations.length && !r.label) delete cfg.datasets[dataset].regions[regionKey];
    saveAdminConfig(cfg);
  } catch (error) {
    console.error('Failed to delete location:', error);
    throw error;
  }
}

function adminDeleteRegion(dataset, regionKey) {
  try {
    const cfg = loadAdminConfig();
    if (cfg.datasets[dataset]?.regions?.[regionKey]) {
      delete cfg.datasets[dataset].regions[regionKey];
      saveAdminConfig(cfg);
    }
  } catch (error) {
    console.error('Failed to delete region:', error);
    throw error;
  }
}

// Expose for other modules
window.getMergedLocations = getMergedLocations;
window.getMergedRegions = getMergedRegions;
window.getRegionLabelForAny = getRegionLabelForAny;
window.getRegionLabelForDataset = getRegionLabelForDataset;
window.getDefaultLocations = getDefaultLocations;
window.getDefaultRegions = getDefaultRegions;
window.adminAddRegion = adminAddRegion;
window.adminAddLocation = adminAddLocation;
window.adminDeleteRegion = adminDeleteRegion;
window.adminDeleteLocation = adminDeleteLocation;

/* ===========================
   Home dropdown menus (dynamic)
   =========================== */
function attachRegionLinkEvents() {
  document.querySelectorAll('.region-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.category;
      const region = String(link.dataset.region || '').trim().toUpperCase();
      if (typeof showHomePage === 'function') showHomePage();
      if (typeof renderRegionPanel === 'function') renderRegionPanel(category, region);
    });
  });
}

function buildHomeDropdownMenus() {
  try {
    const map = [
      { ds: 'scheme', el: document.getElementById('scheme-region-menu') },
      { ds: 'plant',  el: document.getElementById('plant-region-menu') },
      { ds: 'labs',   el: document.getElementById('labs-region-menu') }
    ];
    map.forEach(({ ds, el }) => {
      if (!el) return;
      el.textContent = '';
      const regs = getMergedRegions(ds);
      regs.forEach(r => {
        const lbl = getRegionLabelForDataset(ds, r);
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item region-link';
        a.href = '#';
        a.dataset.category = ds;
        a.dataset.region = r;
        a.textContent = lbl;
        li.appendChild(a);
        el.appendChild(li);
      });
    });
    attachRegionLinkEvents();
    console.log('Home dropdown menus built successfully');
  } catch (error) {
    console.error('Failed to build home dropdown menus:', error);
  }
}
window.buildHomeDropdownMenus = buildHomeDropdownMenus;

/* ===========================
   Utilities (images)
   =========================== */
async function compressImage(file, { maxW = 1600, maxH = 1200, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (!blob) return reject(new Error('Compression failed'));
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          type: blob.type || 'image/jpeg',
          size: blob.size,
          dataUrl: reader.result
        });
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, 'image/jpeg', quality);
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}
window.compressImage = compressImage;

/* ===========================
   Page show functions - ENHANCED WITH ERROR HANDLING
   =========================== */
async function showDataEntryPage(regionKey, locationName) {
  console.log('showDataEntryPage called with:', regionKey, locationName);
  
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    console.log('User not logged in, showing login prompt');
    if (typeof showLoginPrompt === 'function') showLoginPrompt();
    return;
  }

  try {
    DATA_CTX = { region: regionKey, location: locationName, entries: [] };

    const regionEl = document.getElementById('def-region');
    const locationEl = document.getElementById('def-location');
    if (regionEl) regionEl.textContent = formatRegionName(regionKey);
    if (locationEl) locationEl.textContent = locationName;

    if (typeof togglePage === 'function') {
      togglePage('data-entry-page');
      console.log('Data entry page toggled');
    } else {
      console.error('togglePage function not available');
      return;
    }

    if (typeof bindUIRefs === 'function') bindUIRefs();

    if (typeof ensureExtendedSectionsInjected === 'function') ensureExtendedSectionsInjected();
    if (typeof resetExtendedDataFields === 'function') resetExtendedDataFields();

    if (typeof populateCategories === 'function') populateCategories();

    const addBtn = document.getElementById('addCategoryBtn');
    if (addBtn) addBtn.onclick = handleAddCategoryClick;

    DATA_CTX.entries = loadConnectionsLS(regionKey, locationName);
    if (typeof renderConnectionsList === 'function') renderConnectionsList();

    let extendedData = await fetchCloudDoc('schemeExtended', regionKey, locationName);
    if (!extendedData) extendedData = loadExtendedDataLS(regionKey, locationName);
    if (extendedData) {
      saveExtendedDataLS(extendedData);
      if (typeof populateExtendedDataFields === 'function') populateExtendedDataFields(extendedData);
    }

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    // Focus first control
    setTimeout(() => {
      const el = document.getElementById('categorySelect') || document.getElementById('existingConnections');
      el?.focus();
    }, 0);

    console.log('Data entry page loaded successfully');
  } catch (error) {
    console.error('Error in showDataEntryPage:', error);
    showToast('Failed to load data entry page', 'danger');
  }
}

async function showLabsEntryPage(regionKey, locationName) {
  console.log('showLabsEntryPage called with:', regionKey, locationName);
  
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    if (typeof showLoginPrompt === 'function') showLoginPrompt();
    return;
  }

  try {
    LABS_CTX = { region: regionKey, location: locationName };

    if (typeof togglePage === 'function') {
      togglePage('labs-entry-page');
      console.log('Labs entry page toggled');
    }

    if (typeof bindUIRefs === 'function') bindUIRefs();

    const regionEl = document.getElementById('labs-region');
    const locationEl = document.getElementById('labs-location');
    if (regionEl) regionEl.textContent = formatRegionName(regionKey);
    if (locationEl) locationEl.textContent = locationName;

    let existing = await fetchCloudDoc('labsSubmissions', regionKey, locationName);
    if (!existing) existing = loadLabsDataLS(regionKey, locationName);

    if (existing) {
      if (labRawEl && existing.rawWater != null) labRawEl.value = existing.rawWater;
      if (labTreatedTpEl && existing.treatedTp != null) labTreatedTpEl.value = existing.treatedTp;
      if (labTreatedDistEl && existing.treatedDistribution != null) labTreatedDistEl.value = existing.treatedDistribution;
      if (labIssuesEl && existing.issues != null) labIssuesEl.value = existing.issues;
    } else {
      if (labRawEl) labRawEl.value = '';
      if (labTreatedTpEl) labTreatedTpEl.value = '';
      if (labTreatedDistEl) labTreatedDistEl.value = '';
      if (labIssuesEl) labIssuesEl.value = '';
    }

    const labsForm = document.getElementById('labsForm');
    if (labsForm) {
      labsForm.onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
          region: LABS_CTX.region,
          location: LABS_CTX.location,
          rawWater: (labRawEl?.value || '').trim(),
          treatedTp: (labTreatedTpEl?.value || '').trim(),
          treatedDistribution: (labTreatedDistEl?.value || '').trim(),
          issues: (labIssuesEl?.value || '').trim(),
          submittedAt: new Date().toISOString()
        };
        await saveLabsData(payload);
      };
    }

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    // Focus first field
    setTimeout(() => labRawEl?.focus(), 0);
    console.log('Labs entry page loaded successfully');
  } catch (error) {
    console.error('Error in showLabsEntryPage:', error);
    showToast('Failed to load labs entry page', 'danger');
  }
}

async function showPlantEntryPage(regionKey, locationName) {
  console.log('showPlantEntryPage called with:', regionKey, locationName);
  
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    if (typeof showLoginPrompt === 'function') showLoginPrompt();
    return;
  }

  try {
    PLANT_CTX = { region: regionKey, location: locationName };

    if (typeof togglePage === 'function') {
      togglePage('plant-entry-page');
      console.log('Plant entry page toggled');
    }

    if (typeof bindUIRefs === 'function') bindUIRefs();

    if (plantRegionEl) plantRegionEl.textContent = formatRegionName(regionKey);
    if (plantLocationEl) plantLocationEl.textContent = locationName;

    let existing = await fetchCloudDoc('plantSubmissions', regionKey, locationName);
    if (!existing) existing = loadPlantDataLS(regionKey, locationName);

    if (existing) {
      if (plantSchemeBriefEl) plantSchemeBriefEl.value = existing.schemeBrief ?? '';
      if (plantDesignedCapEl) plantDesignedCapEl.value = existing.designedCapacity ?? '';
      if (plantOperationalCapEl) plantOperationalCapEl.value = existing.operationalCapacity ?? '';
      if (plantWaterSourceEl) plantWaterSourceEl.value = existing.waterSource ?? '';
      if (plantApprovedExtractionEl) plantApprovedExtractionEl.value = existing.approvedExtraction ?? '';
      if (plantTreatmentTypeEl) plantTreatmentTypeEl.value = existing.treatmentType ?? '';
      if (plantCoverageEl) plantCoverageEl.value = existing.coverage ?? '';
      if (plantLatEl) plantLatEl.value = (existing.lat ?? '').toString();
      if (plantLngEl) plantLngEl.value = (existing.lng ?? '').toString();

      if (Array.isArray(existing.photoUrls) && existing.photoUrls.length) {
        PLANT_PHOTOS = existing.photoUrls.map((u, idx) => ({
          name: `photo_${idx+1}.jpg`,
          type: 'image/*',
          size: 0,
          dataUrl: u
        }));
      } else if (Array.isArray(existing.photosInline)) {
        PLANT_PHOTOS = existing.photosInline.slice();
      } else {
        PLANT_PHOTOS = [];
      }
    } else {
      if (plantSchemeBriefEl) plantSchemeBriefEl.value = '';
      if (plantDesignedCapEl) plantDesignedCapEl.value = '';
      if (plantOperationalCapEl) plantOperationalCapEl.value = '';
      if (plantWaterSourceEl) plantWaterSourceEl.value = '';
      if (plantApprovedExtractionEl) plantApprovedExtractionEl.value = '';
      if (plantTreatmentTypeEl) plantTreatmentTypeEl.value = '';
      if (plantCoverageEl) plantCoverageEl.value = '';
      if (plantLatEl) plantLatEl.value = '';
      if (plantLngEl) plantLngEl.value = '';
      PLANT_PHOTOS = [];
    }

    renderPlantPhotoPreview();

    if (plantPhotosInputEl) {
      plantPhotosInputEl.onchange = async () => {
        const files = Array.from(plantPhotosInputEl.files || []);
        if (!files.length) return;
        try {
          // compress each selected file
          const newItems = await Promise.all(files.map(f => compressImage(f)));
          PLANT_PHOTOS = PLANT_PHOTOS.concat(newItems);
          plantPhotosInputEl.value = '';
          renderPlantPhotoPreview();
        } catch (err) {
          console.error(err);
          showToast('Failed to process photos.', 'danger');
        }
      };
    }

    const plantForm = document.getElementById('plantForm');
    if (plantForm) {
      plantForm.onsubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!PLANT_CTX.region || !PLANT_CTX.location) {
          showToast("Region and location context missing.", "danger");
          return;
        }

        const payload = {
          region: PLANT_CTX.region,
          location: PLANT_CTX.location,
          schemeBrief: (plantSchemeBriefEl?.value || '').trim(),
          designedCapacity: parseNum(plantDesignedCapEl?.value ?? null),
          operationalCapacity: parseNum(plantOperationalCapEl?.value ?? null),
          waterSource: (plantWaterSourceEl?.value || '').trim(),
          approvedExtraction: parseNum(plantApprovedExtractionEl?.value ?? null),
          treatmentType: (plantTreatmentTypeEl?.value || '').trim(),
          coverage: (plantCoverageEl?.value || '').trim(),
          lat: parseNum(plantLatEl?.value ?? null),
          lng: parseNum(plantLngEl?.value ?? null),
          photosInline: PLANT_PHOTOS.slice(),
          submittedAt: new Date().toISOString()
        };

        // Enhanced validation
        const validationErrors = validatePlantData?.(payload) || [];
        if (validationErrors.length > 0) {
          showToast(`Validation errors: ${validationErrors.join(', ')}`, "danger");
          return;
        }

        // Show loading state
        const submitBtn = document.getElementById('plantSubmitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Submitting...';
        submitBtn.disabled = true;

        try {
          // Use the globally available savePlantData function
          if (typeof savePlantData === 'function') {
            await savePlantData(payload);
          } else {
            throw new Error('Plant save function not available');
          }
          
          // Return to home page after successful save
          setTimeout(() => {
            if (typeof showHomePage === 'function') {
              showHomePage();
            }
          }, 1500);
          
        } catch (error) {
          console.error('Plant submission error:', error);
          showToast('Failed to submit plant data. Data saved locally.', 'warning');
        } finally {
          // Restore button state
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      };
    }

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    // Focus first field
    setTimeout(() => plantSchemeBriefEl?.focus(), 0);
    console.log('Plant entry page loaded successfully');
  } catch (error) {
    console.error('Error in showPlantEntryPage:', error);
    showToast('Failed to load plant entry page', 'danger');
  }
}

// Expose for global access
window.showDataEntryPage = showDataEntryPage;
window.showLabsEntryPage = showLabsEntryPage;
window.showPlantEntryPage = showPlantEntryPage;

/* ===========================
   Plant preview UI
   =========================== */
function renderPlantPhotoPreview() {
  if (!plantPhotosPreviewEl) return;

  plantPhotosPreviewEl.textContent = '';

  if (!PLANT_PHOTOS.length) {
    const note = document.createElement('div');
    note.className = 'text-muted small';
    note.textContent = 'No photos selected.';
    plantPhotosPreviewEl.appendChild(note);
    return;
  }

  // local safety helper if not provided by script.js
  const isSafe = (typeof window.isSafeImageSrc === 'function')
    ? window.isSafeImageSrc
    : (src => typeof src === 'string' && (src.startsWith('data:image/') || src.startsWith('https://') || src.startsWith('http://') || src.startsWith('blob:')));

  PLANT_PHOTOS.forEach((p, idx) => {
    const src = p?.dataUrl || p;
    if (!isSafe(src)) return;

    const tile = document.createElement('div');
    tile.className = 'plant-thumb';

    const img = document.createElement('img');
    img.src = src;               // supports data: and http(s)
    img.loading = 'lazy';
    img.alt = p?.name ? `Photo: ${p.name}` : 'Plant photo';
    img.style.cursor = 'pointer';
    
    // Add error handling for preview images
    img.onerror = function() {
      console.warn('Failed to load preview image:', this.src);
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QaG90bzwvdGV4dD48L3N2Zz4=';
    };

    // Add click to view functionality
    img.addEventListener('click', () => {
      // Create a simple modal for photo viewing
      const modal = document.createElement('div');
      modal.className = 'plant-photo-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        cursor: pointer;
      `;
      
      const modalImg = document.createElement('img');
      modalImg.src = src;
      modalImg.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
      `;
      
      // Add error handling for modal image
      modalImg.onerror = function() {
        console.warn('Failed to load modal image:', this.src);
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
      };
      
      modal.appendChild(modalImg);
      modal.addEventListener('click', () => modal.remove());
      document.body.appendChild(modal);
    });

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'remove-thumb';
    btn.setAttribute('aria-label', `Remove ${p?.name || 'photo'}`);
    btn.textContent = '×';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      PLANT_PHOTOS.splice(idx, 1);
      renderPlantPhotoPreview();
    });

    tile.append(img, btn);
    plantPhotosPreviewEl.appendChild(tile);
  });
}
window.renderPlantPhotoPreview = renderPlantPhotoPreview;

/* ===========================
   Public Map Integration
   =========================== */
function refreshPublicMapIfAvailable() {
  try {
    throttleRefreshPublicPlantMap();
  } catch (e) {
    console.warn('Failed to refresh public map:', e?.message || e);
  }
}
window.refreshPublicMapIfAvailable = refreshPublicMapIfAvailable;

// Initialize when core.js loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Core.js loaded successfully');
  
  // Ensure public map is refreshed when plant data changes
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('nwsdb:plantDataUpdated', function() {
      setTimeout(() => {
        try {
          throttleRefreshPublicPlantMap();
          console.log('Public map refreshed after plant data update');
        } catch (e) {
          console.warn('Could not refresh public map after plant update:', e);
        }
      }, 300);
    });
  }

  // Debug: Check if core functions are properly exposed
  console.log('Core functions exposed:');
  console.log('- savePlantData:', typeof savePlantData === 'function');
  console.log('- showDataEntryPage:', typeof showDataEntryPage === 'function');
  console.log('- showLabsEntryPage:', typeof showLabsEntryPage === 'function');
  console.log('- showPlantEntryPage:', typeof showPlantEntryPage === 'function');
  console.log('- buildHomeDropdownMenus:', typeof buildHomeDropdownMenus === 'function');
  console.log('- refreshPublicPlantMap:', typeof refreshPublicPlantMap === 'function');
});