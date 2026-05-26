const firebaseConfig = {
  apiKey: "AIzaSyDjt4bMkIP4hG1FQuXH_AJz_PW8E_ZoErM",
  authDomain: "ppms-project-abc5c.firebaseapp.com",
  projectId: "ppms-project-abc5c",
  storageBucket: "ppms-project-abc5c.firebasestorage.app",
  messagingSenderId: "335038631717",
  appId: "1:335038631717:web:012fcaa00ea24d5fbf54cc"
};

let firestoreContextPromise = null;

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function clean(value) {
  return clone(value);
}

async function getFirestoreContext() {
  if (!firestoreContextPromise) {
    firestoreContextPromise = (async () => {
      try {
        const [{ initializeApp }, firestoreMod] = await Promise.all([
          import("https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js"),
          import("https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js")
        ]);

        const app = initializeApp(firebaseConfig);
        const db = firestoreMod.getFirestore(app);
        return {
          available: true,
          db,
          doc: firestoreMod.doc,
          getDoc: firestoreMod.getDoc,
          setDoc: firestoreMod.setDoc,
          deleteDoc: firestoreMod.deleteDoc,
          serverTimestamp: firestoreMod.serverTimestamp
        };
      } catch (error) {
        console.warn("Firestore unavailable. Falling back to browser storage only.", error);
        return { available: false };
      }
    })();
  }

  return firestoreContextPromise;
}

export function readLocalState(localKey) {
  try {
    const raw = localStorage.getItem(localKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeLocalState(localKey, value) {
  try {
    localStorage.setItem(localKey, JSON.stringify(clean(value)));
  } catch {
    // Ignore local storage failures; remote sync may still succeed.
  }
}

export function removeLocalState(localKey) {
  try {
    localStorage.removeItem(localKey);
  } catch {
    // Ignore local storage failures.
  }
}

export async function readRemoteState(remotePath) {
  const ctx = await getFirestoreContext();
  if (!ctx.available) return null;

  const snapshot = await ctx.getDoc(ctx.doc(ctx.db, ...remotePath));
  if (!snapshot.exists()) return null;
  const data = snapshot.data() || {};
  delete data.updatedAt;
  return data;
}

export async function syncRemoteState({ remotePath, data }) {
  const ctx = await getFirestoreContext();
  if (!ctx.available) return false;

  const payload = clean(data) || {};
  await ctx.setDoc(ctx.doc(ctx.db, ...remotePath), { ...payload, updatedAt: ctx.serverTimestamp() }, { merge: false });
  return true;
}

export async function clearRemoteState(remotePath) {
  const ctx = await getFirestoreContext();
  if (!ctx.available) return false;

  await ctx.deleteDoc(ctx.doc(ctx.db, ...remotePath));
  return true;
}

export async function loadState({ localKey, remotePath, defaultValue, validate }) {
  const localValue = readLocalState(localKey);

  try {
    const remoteValue = await readRemoteState(remotePath);
    if (validate(remoteValue)) {
      writeLocalState(localKey, remoteValue);
      return clone(remoteValue);
    }

    if (validate(localValue)) {
      await syncRemoteState({ remotePath, data: localValue });
      return clone(localValue);
    }
  } catch {
    if (validate(localValue)) {
      return clone(localValue);
    }
  }

  return clone(defaultValue);
}
