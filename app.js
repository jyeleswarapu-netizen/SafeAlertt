
import {
    saveUserProfile,
    loadUserProfile,
    saveUserContact,
    loadUserContacts,
    deleteUserContact,
    saveSOSHistory,
    loadSOSHistory,
    updateLiveLocation,
    listenLiveLocation,
    setSharing
} from "./firestore.js";
import { auth } from "./firebase.js";
// Android native bridge
function isAndroidApp() {
    return typeof window.Android !== "undefined";
}

function nativeCall(phone) {
    if (isAndroidApp() && window.Android.callNumber) {
        window.Android.callNumber(phone);
        return true;
    }
    return false;
}

function nativeSendSMS(phoneNumbers, message) {
    if (isAndroidApp() && window.Android.sendSMS) {
        window.Android.sendSMS(
            phoneNumbers.join(","),
            message
        );
        return true;
    }
    return false;
}
let lat=null;
let lng=null;

let lastShake=0;

/* STORAGE */

function read(key,fallback=[]){

try{

return JSON.parse(
localStorage.getItem(key)
)||fallback;

}

catch{

return fallback;

}

}

function write(key,value){

localStorage.setItem(
key,
JSON.stringify(value)
);

}

/* STATS */
async function updateStats() {

    const contacts = (await loadUserContacts()).length;
    const history = (await loadSOSHistory()).length;

    const contactCount = document.getElementById("contactCount");
    const alertCount = document.getElementById("alertCount");

    if (contactCount) {
        contactCount.innerText = contacts;
    }

    if (alertCount) {
        alertCount.innerText = history;
    }

}


/* LOCATION */

async function getLocation(){

const box=
document.getElementById(
"location"
);



return new Promise(

(resolve)=>{

if(
!navigator.geolocation
){

box.innerHTML=
"❌ GPS unsupported";

resolve(false);

return;

}

box.innerHTML=

"📍 Fetching location...";

navigator.geolocation
.getCurrentPosition(

(pos)=>{

lat = pos.coords.latitude;
lng = pos.coords.longitude;

const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;

box.innerHTML = `
<b>📍 Location Ready</b>

<br><br>

Latitude : ${lat.toFixed(6)}

<br>

Longitude : ${lng.toFixed(6)}

<br><br>

<a href="${mapLink}"
target="_blank"
style="color:#38bdf8;font-weight:bold;text-decoration:none;">
📍 Open in Google Maps
</a>
`;

resolve(true);
},


(err)=>{

if(
err.code===1
){

box.innerHTML=

`
❌ Permission denied

<br><br>

Tap Refresh Location
`;

}

else{

box.innerHTML=

`
❌ Unable to fetch
`;

}



resolve(false);

},

{

enableHighAccuracy:true,

timeout:15000,

maximumAge:0

}

);

}

);

}
let watchId = null;

async function startLiveLocation() {

    if (!navigator.geolocation) return;

    watchId = navigator.geolocation.watchPosition(

        async (pos) => {

            lat = pos.coords.latitude;
            lng = pos.coords.longitude;

            await updateLiveLocation({

                latitude: lat,
                longitude: lng,
                accuracy: pos.coords.accuracy,
                time: Date.now()
            });
        },

        (err) => {
            console.log(err);
        },

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }

    );

}

async function stopLiveLocation() {

    if (watchId !== null) {

        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        
    }

}
window.updateLocationFromNative =
async function (
    latitude,
    longitude,
    accuracy,
    time
) {

    lat = latitude;
    lng = longitude;

    await updateLiveLocation({

        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy,
        time: time

    });

    console.log(
        "Native location uploaded:",
        latitude,
        longitude
    );
};
/* CONTACTS */

async function saveContact() {

    const name = document.getElementById("name");
    const phone = document.getElementById("phone");

    if (!name.value || !phone.value) {
        alert("Enter details");
        return;
    }

    await saveUserContact({
        name: name.value,
        phone: phone.value
    });

    name.value = "";
    phone.value = "";

    await showContacts();
    await showSafety();
    await updateStats();

}

async function deleteContact(id) {

    await deleteUserContact(id);

    await showContacts();
    await showSafety();
    await updateStats();

}

async function showContacts() {

const box = document.getElementById("contactList");
    box.innerHTML = "";

    const data = await loadUserContacts();

    if (data.length === 0) {
        box.innerHTML = `
            <div class="card">
                No contacts
            </div>
        `;
        return;
    }

    data.forEach((c) => {

        box.innerHTML += `
<div class="contact">

    <div style="display:flex;justify-content:space-between;align-items:center;">

        <div>

            <h3>👤 ${c.name}</h3>

            <p style="margin-top:8px;color:#9ca3af;">
                📞 ${c.phone}
            </p>

        </div>

        <i class="fa-solid fa-user-group"
           style="font-size:34px;color:#3b82f6;"></i>

    </div>

    <div style="display:flex;gap:10px;margin-top:18px;">

        <button
            class="primary-btn"
            onclick="callNumber('${c.phone}')">

            📞 Call

        </button>

        <button
            class="primary-btn"
            style="background:#dc2626;"
            onclick="deleteContact('${c.id}')">

            🗑 Delete

        </button>

    </div>

</div>
`;

    });

}

/* PROFILE */

async function saveProfile() {

    const profile = {
        name: profileName.value,
        phone: profilePhone.value,
        email: profileEmail.value
    };

    await saveUserProfile(profile);

    await showProfile();

    alert("Profile saved successfully!");

}

async function showProfile() {

    const p = await loadUserProfile();

    if (!p) {
        const profileInfo = document.getElementById("profileInfo");
        profileInfo.innerHTML = "No profile saved";
        return;
    }

    profileName.value = p.name || "";
    profilePhone.value = p.phone || "";
    profileEmail.value = p.email || "";

    profileInfo.innerHTML = `
        👤 ${p.name || "-"}
        <br><br>
        📞 ${p.phone || "-"}
        <br><br>
        📧 ${p.email || "-"}
        <br><br>
        🆔 UID

    <br>

    ${auth.currentUser.uid}
    `;
    const myUID = document.getElementById("myUID");

if (myUID) {
    myUID.innerText = auth.currentUser.uid;
}
     const welcome = document.getElementById("welcomeName");

if (welcome) {
    welcome.innerText = p.name || "User";
    const profileTitle = document.getElementById("profileTitle");

if (profileTitle) {
    profileTitle.innerText = p.name || "User";
}
}

}

/* HISTORY */

async function showHistory(){

const historyList = document.getElementById("historyList");
historyList.innerHTML = "";
    
const history = await loadSOSHistory();

history.forEach((x) => {

    historyList.innerHTML += `
<div class="history">

    <div style="display:flex;justify-content:space-between;align-items:center;">

        <div>

            <h3 style="color:#ff4d4d;">
                🚨 Emergency Alert
            </h3>

            <p style="margin-top:8px;color:#cbd5e1;">
                ${new Date(x.time).toLocaleString()}
            </p>

        </div>

        <i class="fa-solid fa-clock-rotate-left"
           style="font-size:32px;color:#1976ff;"></i>

    </div>

</div>
`;

});

await updateStats();    
}

/* SOS */

async function sendSOS(){
const btn = document.getElementById("sosButton");

const confirmSOS = confirm(
    "🚨 Are you sure you want to send an Emergency SOS?"
);

if (!confirmSOS) {
    return;
}

btn.disabled = true;
btn.innerHTML = "Sending...";
    
const ok=
await getLocation();

if(!ok){

alert("Location required");

btn.disabled = false;
btn.innerHTML = "SOS";

return;

}

const contacts = await loadUserContacts();

if(contacts.length===0){

alert("Add contacts");

btn.disabled = false;
btn.innerHTML = "SOS";

return;

}

const p = await loadUserProfile() || {};
    
await setSharing(true);

if (isAndroidApp()) {

    window.Android.startLocationService(
    auth.currentUser.uid
);

} else {

    await startLiveLocation();

}
    
const map=

`https://maps.google.com/maps?q=${lat},${lng}`;

const trackerLink =
`https://jyeleswarapu-netizen.github.io/SafeAlertt/tracker.html?uid=${auth.currentUser.uid}`;

const msg =

`🚨 EMERGENCY ALERT

👤 ${p.name || "User"}

📞 ${p.phone || "-"}

📍 Current Location

${map}

📡 Live Tracker

${trackerLink}

Sent via SafeAlert`;
    
    
await saveSOSHistory({
    time: Date.now(),
    map: map
});
    
    if (navigator.vibrate) {

    navigator.vibrate([300,150,300,150,500]);

}
    
const status = document.getElementById("statusText");

if (status) {
    status.innerHTML = "🔴 Emergency Active";
    document.getElementById("endSOSBtn").style.display = "block";
    status.style.color = "#ff3b3b";
}    
    

await showHistory();    

const phoneNumbers = contacts.map(x => x.phone);

// Android APK → native direct SMS
if (nativeSendSMS(phoneNumbers, msg)) {

    btn.disabled = false;
    btn.innerHTML = "SOS";

    return;
}
    
    
window.location.href=

`sms:${contacts.map(
x=>x.phone
).join(",")}?body=${encodeURIComponent(msg)}`;
    

    
btn.disabled = false;
btn.innerHTML = "SOS";    
    
}

/* CALL */

function callNumber(n) {

    // Android APK
    if (nativeCall(n)) {
        return;
    }

    // Normal website
    window.location.href = `tel:${n}`;
}

async function showSafety() {

    const safetyContacts = document.getElementById("safetyContacts");
safetyContacts.innerHTML = "";

    const contacts = await loadUserContacts();

    contacts.forEach((c) => {

        safetyContacts.innerHTML += `
            <div class="contact">

                👤 ${c.name}

                <br><br>

                <button
                    class="primary-btn"
                    onclick="callNumber('${c.phone}')">

                    Call

                </button>

            </div>
        `;

    });

}

/* SHAKE */

window.addEventListener(

"devicemotion",

(e)=>{

const a=
e.accelerationIncludingGravity;

if(
!a
)return;

const force=

Math.abs(a.x)+
Math.abs(a.y)+
Math.abs(a.z);

if(
force>40
){

const now=
Date.now();

if(
now-lastShake<5000
)
return;

lastShake=now;

if(
confirm(
"Send SOS?"
)
){

sendSOS();

}

}

}

);

/* NAV */

function tab(id,el){

document
.querySelectorAll(
".page"
)
.forEach(
x=>
x.classList.remove(
"active"
)
);

document
.getElementById(
id
)
.classList.add(
"active"
);

document
.querySelectorAll(
".item"
)
.forEach(
x=>
x.classList.remove(
"selected"
)
);

el.classList.add(
"selected"
);

}

/* START */

window.onload = async () => {
    try {
        
    await showContacts();
    await showProfile();
    await showHistory();
    await showSafety();
    await updateStats();
} catch (e) {
        console.error(e);
    }
    setTimeout(() => {
        getLocation();
    }, 800);

};

function togglePassword() {

    const password = document.getElementById("loginPassword");
    const eye = document.getElementById("eyeIcon");

    if (password.type === "password") {
        password.type = "text";
        eye.textContent = "visibility_off";
    } else {
        password.type = "password";
        eye.textContent = "visibility";
    }

}
let trackingId = null;

async function startLiveTracking() {

    if (trackingId !== null) return;

    await setSharing(true);
    
    const status = document.getElementById("trackingStatus");

    if (!navigator.geolocation) {
        status.innerHTML = "GPS not supported";
        return;
    }

    status.innerHTML = "Sharing Live Location...";

    trackingId = navigator.geolocation.watchPosition(

      async (pos) => {

            lat = pos.coords.latitude;
            lng = pos.coords.longitude;

            status.innerHTML =
                `Live<br>${lat.toFixed(6)}, ${lng.toFixed(6)}`;

          await updateLiveLocation({

                latitude: lat,
                longitude: lng,
                accuracy: pos.coords.accuracy,
                time: Date.now()
            });

        },

        () => {

            status.innerHTML = "Location Error";

        },

        {

            enableHighAccuracy: true,
            maximumAge: 0

        }

    );

}
async function stopLiveTracking() {

    if (trackingId !== null) {

        navigator.geolocation.clearWatch(trackingId);
        trackingId = null;

    }

    await setSharing(false);

    document.getElementById("trackingStatus").innerHTML =
        "Not Sharing";

}

function watchFriend(uid) {

    if (!uid) {
        alert("Please enter Friend UID");
        return;
    }

    listenLiveLocation(uid, (data) => {

        const status = document.getElementById("friendStatus");

        if (!data || !data.sharing || !data.liveLocation) {

            status.innerHTML = "🔴 Friend Offline";

            document.getElementById("friendMap").src = "";
            document.getElementById("friendTime").innerHTML = "";

            return;
        }

        status.innerHTML = "🟢 Friend Online";

        const location = data.liveLocation;

        document.getElementById("friendMap").src =
            `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=16&output=embed`;

        document.getElementById("friendMapLink").href =
            `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

        document.getElementById("friendTime").innerHTML =
            "Last Updated: " +
            new Date(location.time).toLocaleTimeString();
        
});

}

function copyUID() {

    navigator.clipboard.writeText(auth.currentUser.uid);

    alert("UID copied successfully!");

}
async function shareUID() {

    const uid = document.getElementById("myUID").innerText;

    const text =
`My SafeAlert UID:

${uid}

Add me in SafeAlert for live location tracking.`;

    if (navigator.share) {

        await navigator.share({

            title: "SafeAlert UID",

            text: text

        });

    } else {

        navigator.clipboard.writeText(text);

        alert("UID copied! Share it anywhere.");

    }

}
async function endEmergency() {

    if (isAndroidApp()) {

        window.Android.stopLocationService();

    } else {

        await stopLiveLocation();

    }

    await setSharing(false);
    
    document.getElementById("statusText").innerHTML = "🟢 Protected";
    document.getElementById("statusText").style.color = "#00e676";

    document.getElementById("endSOSBtn").style.display = "none";

    alert("Emergency ended.");

}

window.getLocation = getLocation;
window.sendSOS = sendSOS;
window.saveContact = saveContact;
window.deleteContact = deleteContact;
window.callNumber = callNumber;
window.saveProfile = saveProfile;
window.tab = tab;
window.togglePassword = togglePassword;
window.startLiveTracking = startLiveTracking;
window.stopLiveTracking = stopLiveTracking;
window.watchFriend = watchFriend;
window.showContacts = showContacts;
window.showProfile = showProfile;
window.showHistory = showHistory;
window.showSafety = showSafety;
window.updateStats = updateStats;
window.copyUID = copyUID;
window.shareUID = shareUID;
window.endEmergency = endEmergency;
