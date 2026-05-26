
// fix-month.js — hard patch to guarantee billingMonth is written
(function() {
  console.log('[fix-month] build v6 loaded');

  // Resolve month from DOM safely
  function readBillingMonthFromDOM() {
    try {
      var sel = document.getElementById('bulk-month');
      return (sel && sel.value) ? sel.value :
             (sel && sel.selectedOptions && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : null);
    } catch (e) { return null; }
  }

  // Ensure month exists on an entry meta
  function ensureMonthOnEntry(entry) {
    if (!entry) return entry;
    var m = entry.meta || entry;
    if (!m.billingMonth) m.billingMonth = readBillingMonthFromDOM();
    return entry;
  }

  // Lightweight Firestore writer (does not depend on FB.mod)
  async function writeUtilitiesDocs(entries, region, location) {
    try {
      if (!Array.isArray(entries) || !entries.length) return;
      const appMod = await import('https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js');
      const fsMod  = await import('https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js');

      // Use the same config window.FIREBASE_CONFIG if available, else fallback to inline (project id only is sufficient with existing app)
      const cfg = (window.FIREBASE_CONFIG || {
        apiKey: "AIzaSyDONOM5vrhAJsaerwJSUW71WAbdyi3wGqM",
        authDomain: "web-portal-ac49e.firebaseapp.com",
        projectId: "web-portal-ac49e",
        storageBucket: "web-portal-ac49e.firebasestorage.app",
        appId: "1:613964862307:web:a6e83dc5550d90b3ddb956",
        measurementId: "G-C2CREDS85T"
      });

      // Reuse existing app if present
      let app;
      try { app = appMod.getApp(); } catch(_e) { app = appMod.initializeApp(cfg); }
      const db = fsMod.getFirestore(app);

      for (const e of entries) {
        const meta = (e && e.meta) ? e.meta : (e || {});
        const out = {
          supplierName: meta.supplierName || null,
          location:     location || meta.location || null,
          accountNumber:meta.accountNumber || null,
          monthlyBill:  (typeof meta.monthlyBill === 'number' ? meta.monthlyBill : Number(meta.monthlyBill) || null),
          officerTel:   meta.officerTel || null,
          quantity:     (typeof meta.quantity === 'number' ? meta.quantity : Number(meta.quantity) || null),
          billingMonth: meta.billingMonth || readBillingMonthFromDOM() || null,
          createdAt:    fsMod.serverTimestamp(),
          region:       region || null,
          category:     e && e.category || null
        };
        Object.keys(out).forEach(k => (out[k] === null || out[k] === "") && delete out[k]);
        console.log('[fix-month] writing utilities doc:', out);
        await fsMod.addDoc(fsMod.collection(db, 'utilities'), out);
      }
    } catch (err) {
      console.warn('[fix-month] writeUtilitiesDocs failed:', err);
    }
  }

  // Hook saveSchemeData so we never miss the write
  (function hookSave() {
    try {
      const prev = window.saveSchemeData;
      if (typeof prev !== 'function') return console.log('[fix-month] saveSchemeData not yet defined (will retry)');
      if (prev.__patchedByFixMonth) return;
      const wrapped = async function(payload) {
        try {
          if (payload && Array.isArray(payload.connections)) {
            payload.connections = payload.connections.map(ensureMonthOnEntry);
            // Fire-and-forget utilities write
            writeUtilitiesDocs(payload.connections, payload.region, payload.location);
          }
        } catch(e) { console.warn('[fix-month] pre-write ensureMonth failed:', e); }
        return prev.apply(this, arguments);
      };
      wrapped.__patchedByFixMonth = true;
      window.saveSchemeData = wrapped;
      console.log('[fix-month] saveSchemeData hooked');
    } catch (e) {
      console.warn('[fix-month] hook failed:', e);
    }
  })();

  // Retry the hook a few times in case the script loads before core defines it
  let attempts = 0;
  const t = setInterval(function() {
    attempts++;
    if (typeof window.saveSchemeData === 'function') {
      try {
        const fn = window.saveSchemeData;
        if (!fn.__patchedByFixMonth) {
          // re-run hook
          const evt = new Event('repatch');
          document.dispatchEvent(evt);
          // call hook immediately
          (function hook(){
            try {
              const prev = window.saveSchemeData;
              if (prev.__patchedByFixMonth) return;
              const wrapped = async function(payload) {
                try { if (payload && Array.isArray(payload.connections)) writeUtilitiesDocs(payload.connections, payload.region, payload.location); } catch(_e){}
                return prev.apply(this, arguments);
              };
              wrapped.__patchedByFixMonth = true;
              window.saveSchemeData = wrapped;
              console.log('[fix-month] saveSchemeData hooked (retry)');
            } catch(_e){}
          })();
        }
        clearInterval(t);
      } catch(_e) {/* keep trying */}
    }
    if (attempts > 15) clearInterval(t);
  }, 600);
})();
