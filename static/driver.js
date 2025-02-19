document.addEventListener("DOMContentLoaded", function () {
    const socket = io();
    let driverInterval = null;

    function startDriverMode() {
        document.getElementById("driverMessage").style.display = "block";
        document.getElementById("stopDriverMode").style.display = "block";
        document.getElementById("driverStatus").style.display = "block";

        if ("geolocation" in navigator) {
            if (driverInterval) clearInterval(driverInterval);
            
            driverInterval = setInterval(() => {
                navigator.geolocation.getCurrentPosition((position) => {
                    let data = { lat: position.coords.latitude, lng: position.coords.longitude };
                    socket.emit('update_location', data);

                    document.getElementById("lastLocation").textContent = `${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}`;
                    document.getElementById("lastUpdated").textContent = new Date().toLocaleTimeString();

                    // Reverse Geocoding to get address
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.lat}&lon=${data.lng}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.display_name) {
                                document.getElementById("lastAddress").textContent = data.display_name;
                            } else {
                                document.getElementById("lastAddress").textContent = "Address not found";
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching address:", error);
                            document.getElementById("lastAddress").textContent = "Error fetching address";
                        });
                });
            }, 5000);
        } else {
            alert("Geolocation not supported!");
        }
    }

    function stopDriverMode() {
        if (driverInterval) {
            clearInterval(driverInterval);
            driverInterval = null;
        }

        document.getElementById("driverMessage").style.display = "none";
        document.getElementById("stopDriverMode").style.display = "none";
        document.getElementById("driverStatus").style.display = "none";

        socket.emit('stop_location');
        alert("Location sharing stopped.");
    }

    window.startDriverMode = startDriverMode;
    window.stopDriverMode = stopDriverMode;
});
