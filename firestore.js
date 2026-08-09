
import { auth, db } from "./firebase.js";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  orderBy,
  query,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// Save Profile
export async function saveUserProfile(profile) {

    const user = auth.currentUser;

    if (!user) return;

    await setDoc(
        doc(db, "users", user.uid),
        {
            profile: profile
        },
        { merge: true }
    );

}

// Load Profile
export async function loadUserProfile() {

    const user = auth.currentUser;

    if (!user) return null;

    const snap = await getDoc(
        doc(db, "users", user.uid)
    );

    if (snap.exists()) {
        return snap.data().profile || null;
    }

    return null;

}
// Save Contact
export async function saveUserContact(contact) {

    const user = auth.currentUser;
    if (!user) return;

    await addDoc(
        collection(db, "users", user.uid, "contacts"),
        contact
    );

}

// Load Contacts
export async function loadUserContacts() {

    const user = auth.currentUser;
    if (!user) return [];

    const snapshot = await getDocs(
        collection(db, "users", user.uid, "contacts")
    );

    const contacts = [];

    snapshot.forEach((docSnap) => {
        contacts.push({
            id: docSnap.id,
            ...docSnap.data()
        });
    });

    return contacts;

}

// Delete Contact
export async function deleteUserContact(contactId) {

    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(
        doc(db, "users", user.uid, "contacts", contactId)
    );

}
// Save SOS History
export async function saveSOSHistory(history) {

    const user = auth.currentUser;
    if (!user) return;

    await addDoc(
        collection(db, "users", user.uid, "history"),
        history
    );

}

// Load SOS History
export async function loadSOSHistory() {

    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
        collection(db, "users", user.uid, "history"),
        orderBy("time", "desc")
    );

    const snapshot = await getDocs(q);

    const history = [];

    snapshot.forEach((docSnap) => {
        history.push({
            id: docSnap.id,
            ...docSnap.data()
        });
    });

    return history;

}
// Save Live Location
export async function updateLiveLocation(location) {

    const user = auth.currentUser;
    if (!user) return;

    await setDoc(
        doc(db, "users", user.uid),
        {
            liveLocation: location
        },
        { merge: true }
    );

}

// Load Live Location
export async function loadLiveLocation(uid) {

    const snap = await getDoc(
        doc(db, "users", uid)
    );

    if (snap.exists()) {
        return snap.data().liveLocation || null;
    }

    return null;

}
// Listen to Live Location (Real-Time)
export function listenLiveLocation(uid, callback) {

    const ref = doc(db, "users", uid);

    return onSnapshot(ref, (snap) => {

        if (!snap.exists()) return;

        const data = snap.data();

        callback({

            profile: data.profile || {},

            liveLocation: data.liveLocation || null,
            
            sharing: data.sharing

        });

    });

}

export async function stopSharing() {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(
        doc(db, "users", user.uid),
        {
            sharing: false
        },
        { merge: true }
    );
}
export async function setSharing(value) {

    const user = auth.currentUser;

    if (!user) return;

    await setDoc(
        doc(db, "users", user.uid),
        {
            sharing: value
        },
        { merge: true }
    );
}
