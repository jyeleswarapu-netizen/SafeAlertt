
import { auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";



window.signup = async function () {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
    alert("Please enter email and password.");
    return;
}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
    alert("Enter a valid email address.");
    return;
}

if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
}
    
    try {

        await createUserWithEmailAndPassword(auth, email, password);

        alert("Account created successfully!");

    } catch (e) {

        switch (e.code) {
    case "auth/user-not-found":
        alert("Account not found.");
        break;

    case "auth/wrong-password":
        alert("Incorrect password.");
        break;

    case "auth/email-already-in-use":
        alert("Email is already registered.");
        break;

    default:
        alert(e.message);
}

    }

};

window.login = async function () {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    if (!email || !password) {
    alert("Please enter email and password.");
    return;
}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
    alert("Enter a valid email address.");
    return;
}
    try {

        await signInWithEmailAndPassword(auth, email, password);

    } catch (e) {
    switch (e.code) {

        case "auth/invalid-credential":
            alert("Invalid email or password.");
            break;

        case "auth/wrong-password":
            alert("Incorrect password.");
            break;

        default:
            alert(e.message);
    }
}

    

};

window.logout = async function () {

    try {

        await signOut(auth);

        alert("Logged out successfully!");

    } catch (e) {

        alert(e.message);

    }

};

onAuthStateChanged(auth, async (user) => {

    if (user) {

        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").style.display = "block";

        

        const uidBox = document.getElementById("myUID");

        if (uidBox) {
            uidBox.innerText = user.uid;
        }

        if (window.showContacts) await window.showContacts();
        if (window.showProfile) await window.showProfile();
        if (window.showHistory) await window.showHistory();
        if (window.showSafety) await window.showSafety();
        if (window.updateStats) await window.updateStats();

    } else {

        document.getElementById("loginPage").style.display = "flex";
        document.getElementById("app").style.display = "none";

    }

});
