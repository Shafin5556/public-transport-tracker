document.addEventListener("DOMContentLoaded", function () {
    const socket = io();
    let map = L.map('map').setView([0, 0], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    let busMarker = null;
    let userMarker = null;
    let userInterval = null;

    // Custom icons for bus and user (using local static files)
    const busIcon = L.icon({
        iconUrl: "/static/bus-stop.png",  // Local bus icon
        iconSize: [40, 40],  
        iconAnchor: [20, 40]
    });

    const userIcon = L.icon({
        iconUrl: "/static/location.png",  // Local user icon
        iconSize: [35, 35],
        iconAnchor: [17, 35]
    });

    function updateUserLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition((position) => {
                let userLat = position.coords.latitude;
                let userLng = position.coords.longitude;

                if (!userMarker) {
                    userMarker = L.marker([userLat, userLng], {icon: userIcon}).addTo(map);
                } else {
                    userMarker.setLatLng([userLat, userLng]);
                }
            });
        } else {
            alert("Geolocation is not supported!");
        }
    }

    function startUserMode() {
        if (userInterval) clearInterval(userInterval);

        userInterval = setInterval(() => {
            socket.emit('get_location');
        }, 5000);

        socket.on('bus_location', (data) => {
            if (data.lat && data.lng) {
                if (!busMarker) {
                    busMarker = L.marker([data.lat, data.lng], {icon: busIcon}).addTo(map);
                } else {
                    busMarker.setLatLng([data.lat, data.lng]);
                }
                map.setView([data.lat, data.lng], 13);
            }
        });

        socket.on('stop_location', () => {
            if (userInterval) {
                clearInterval(userInterval);
                userInterval = null;
            }
            if (busMarker) {
                map.removeLayer(busMarker);
                busMarker = null;
            }
            alert("Driver has stopped sharing their location.");
        });

        updateUserLocation();
    }

    startUserMode();
});
