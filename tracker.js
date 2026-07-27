import {
    listenLiveLocation
} from "./firestore.js";

const params = new URLSearchParams(window.location.search);
const uid = params.get("uid");

let map;
let marker;
let currentLocation = null;

// Create map
function initMap(lat, lng) {

    map = L.map("map").setView([lat, lng], 18);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap"
        }
    ).addTo(map);

    marker = L.marker([lat, lng]).addTo(map);

}

// Start listening
if (!uid) {

    document.getElementById("trackingStatus").innerHTML =
        "Invalid User ID";

} else {

    listenLiveLocation(uid, (data) => {

     if (data.sharing === false) {
    document.getElementById("trackingStatus").innerHTML =
        "❌ Emergency Ended";

    document.getElementById("onlineStatus").innerHTML =
        "Offline";

    return;
}   
        
    if (!data || !data.liveLocation) {

    document.getElementById("trackingStatus").innerHTML =
        "Waiting for Location...";

    return;

}

    currentLocation = data.liveLocation;

    const lat = currentLocation.latitude;
    const lng = currentLocation.longitude;

    document.getElementById("trackingStatus").innerHTML =
        "🟢 Tracking Live";

    document.getElementById("lastUpdate").innerHTML =
        new Date(currentLocation.time).toLocaleString();
        
    document.getElementById("accuracy").innerHTML =
    (currentLocation.accuracy || 0).toFixed(1) + " m"; 
        
    document.getElementById("onlineStatus").innerHTML =
    "Online";

    const age = Date.now() - currentLocation.time;

    if (age > 30000) {
        
        document.getElementById("onlineStatus").innerHTML =
        "Offline";
        document.getElementById("trackingStatus").innerHTML =
        "🔴 Location sharing stopped";


    }    

    document.getElementById("victimName").innerHTML =
        data.profile?.name || "Unknown User";

    document.getElementById("victimPhone").innerHTML =
        data.profile?.phone || "-";

    if (!map) {

        initMap(lat, lng);

    } else {

        marker.setLatLng([lat, lng]);

map.flyTo([lat, lng], map.getZoom(), {
    animate: true,
    duration: 1.5
});

    }

});
}

// Call button
document
.getElementById("callBtn")
.onclick = () => {

    const phone =
        document.getElementById("victimPhone").innerText;

    if (phone !== "-") {

        window.location.href =
            `tel:${phone}`;

    }

};

// Navigate button
document
.getElementById("navigateBtn")
.onclick = () => {

    if (!currentLocation) return;

    window.open(

`https://www.google.com/maps/dir/?api=1&destination=${currentLocation.latitude},${currentLocation.longitude}`

    );

};
