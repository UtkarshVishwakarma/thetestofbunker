  // Initialize the map
  var map = null;
  // Array to store bunker markers
  var bunkers = [];
  // Array to store danger zone markers
  var dangerZones = [];
  // Keep track of the previous route control and clicked bunker marker
  var previousRouteControl = null;
  var previousBunkerMarker = null;

  // Messages for popups
  var messages = [
      "India won the area of kashmir!",
      "Terrorists occupied this some area in Punjab!",
      "100 people saved by the indian special forces",
      "Emergency evacuation ongoing in Delhi!",
      "Special forces deployed in Punjab!"
  ];

  // Function to show popup with random message
  function showPopup() {
      var popup = document.getElementById("popup");
      var message = messages[Math.floor(Math.random() * messages.length)];
      popup.innerHTML = message;
      popup.style.display = "block";
      setTimeout(function() {
          popup.style.display = "none";
      }, 5000); // Popup disappears after 3 seconds
  }

  // Event listener for showing popup every 30 to 60 seconds
  setInterval(showPopup, Math.floor(Math.random() * (50000 - 10000 + 1)) + 30000);

  // Event listener for the ID verification form submission
  document.getElementById("id-verification-form").addEventListener("submit", function(event) {
      event.preventDefault(); // Prevent form submission

      // Dummy ID verification logic (replace with your actual logic)
      var username = document.getElementById("username").value;
      var password = document.getElementById("password").value;

      // Dummy check: if username and password match, consider verification successful
      if (username === "dummy" && password === "password") {
          closeIdVerificationModal();
          // Enable functionality for locating nearest bunker and displaying routes
          enableBunkerLocating();
          enableBunkerSearch();
          // Show the search bar
          document.getElementById("search-bar").style.display = "block";
      } else {
          alert("Invalid credentials. Please try again.");
      }
  });

  // Function to close the ID verification modal
  function closeIdVerificationModal() {
      var modal = document.getElementById("id-verification-modal");
      modal.style.display = "none";
  }

  // Function to enable bunker locating functionality
  function enableBunkerLocating() {
      // Show the Locate Nearest Bunker button
      document.getElementById("locate-button").style.display = "block";
      // Show the Call Emergency Service button
      document.getElementById("emergency-button").style.display = "block";

      // Initialize the map
      map = L.map("map").setView([23.1815, 79.9864], 13); // Jabalpur coordinates

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Generate random bunkers with even more distance between them
      var numBunkers = 30; // Number of bunkers to generate
      for (var i = 0; i < numBunkers; i++) {
          // Generate random coordinates for each bunker
          var randomLat = 23.1815 + (Math.random() - 0.5) * 10; // Larger random offset
          var randomLng = 79.9864 + (Math.random() - 0.5) * 10; // Larger random offset

          // Create marker for the bunker and add it to the map
          var bunkerMarker = L.marker([randomLat, randomLng]).addTo(map);
          bunkerMarker.bindPopup("Bunker " + (i + 1));
          bunkerMarker.options.bunkerId = i + 1; // Set bunkerId property

          // Store the bunker marker in the bunkers array
          bunkers.push(bunkerMarker);

          // Add bunker click event listener to each bunker marker
          bunkerMarker.on('click', onBunkerClick);
      }

      // Generate random danger zones
      var numDangerZones = 4; // Number of danger zones to generate
      for (var j = 0; j < numDangerZones; j++) {
          // Generate random coordinates for each danger zone
          var randomDangerLat = 23.1815 + (Math.random() - 0.5) * 15; // Larger random offset
          var randomDangerLng = 79.9864 + (Math.random() - 0.5) * 15; // Larger random offset

          // Create marker for the danger zone and add it to the map
          var dangerZoneMarker = L.marker([randomDangerLat, randomDangerLng], {
              icon: dangerIcon
          }).addTo(map);
          dangerZoneMarker.bindPopup("Danger Zone " + (j + 1));

          // Store the danger zone marker in the dangerZones array
          dangerZones.push(dangerZoneMarker);
      }

      // Event listener for the "Locate Nearest Bunker" button click
      document.getElementById("locate-button").addEventListener("click", function() {
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(function(position) {
                  var userLatLng = [position.coords.latitude, position.coords.longitude];
                  var nearestBunker = findNearestBunker(userLatLng);

                  // Remove previous route control and associated markers, if any
                  if (previousRouteControl) {
                      map.removeControl(previousRouteControl);
                  }
                  if (previousBunkerMarker) {
                      map.removeLayer(previousBunkerMarker);
                  }

                  // Add route
                  var routeControl = L.Routing.control({
                      waypoints: [
                          L.latLng(userLatLng[0], userLatLng[1]),
                          L.latLng(nearestBunker.getLatLng())
                      ],
                      routeWhileDragging: true,
                      lineOptions: {
                          styles: [{
                              color: 'red',
                              opacity: 0.8,
                              weight: 4
                          }]
                      },
                  }).addTo(map);

                  // Store the new route control and clicked bunker marker
                  previousRouteControl = routeControl;
                  previousBunkerMarker = nearestBunker;
              });
          }
      });

      // Event listener for the "Call Emergency Service" button click
      document.getElementById("emergency-button").addEventListener("click", function() {
          // Ask for confirmation before calling emergency
          var confirmation = confirm("Are you sure you want to call emergency?");
          if (confirmation) {
              if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(function(position) {
                      var userLatLng = [position.coords.latitude, position.coords.longitude];
                      console.log("Emergency! User location: " + userLatLng);
                  });
              }
          }
      });
  }

  // Function to enable bunker search functionality
  function enableBunkerSearch() {
      // Show the search bar
      document.getElementById("search-bar").style.display = "block";

      // Event listener for the search button click
      document.getElementById("search-button").addEventListener("click", function() {
          var searchTerm = document.getElementById("bunker-search").value.trim();
          if (searchTerm !== "") {
              searchForBunkerOrDangerZone(searchTerm);
          } else {
              alert("Please enter a bunker or danger zone name to search.");
          }
      });
  }

  // Function to search for a bunker or danger zone by name
  function searchForBunkerOrDangerZone(name) {
      var foundItem = null;
      // Search in bunkers
      for (var i = 0; i < bunkers.length; i++) {
          var bunker = bunkers[i];
          if (bunker.getPopup().getContent().includes(name)) {
              foundItem = bunker;
              break;
          }
      }
      // Search in danger zones
      if (!foundItem) {
          for (var j = 0; j < dangerZones.length; j++) {
              var dangerZone = dangerZones[j];
              if (dangerZone.getPopup().getContent().includes(name)) {
                  foundItem = dangerZone;
                  break;
              }
          }
      }
      if (foundItem) {
          map.setView(foundItem.getLatLng(), 13); // Center the map on the found item
          foundItem.openPopup(); // Open the popup of the found item
      } else {
          alert("Bunker or danger zone not found.");
      }
  }

  // Function to find nearest bunker
  function findNearestBunker(userLatLng) {
      var nearestBunker = null;
      var minDistance = Number.MAX_VALUE;

      for (var i = 0; i < bunkers.length; i++) {
          var bunker = bunkers[i];
          var distance = bunker.getLatLng().distanceTo(userLatLng);

          if (distance < minDistance) {
              minDistance = distance;
              nearestBunker = bunker;
          }
      }

      return nearestBunker;
  }

  // Function to handle click on a bunker marker
  function onBunkerClick(event) {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
              var userLatLng = [position.coords.latitude, position.coords.longitude];
              var bunkerLatLng = event.latlng; // Get the coordinates of the clicked bunker marker

              // Remove previous route control and associated markers, if any
              if (previousRouteControl) {
                  map.removeControl(previousRouteControl);
              }
              if (previousBunkerMarker) {
                  map.removeLayer(previousBunkerMarker);
              }

              // Add route
              var routeControl = L.Routing.control({
                  waypoints: [
                      L.latLng(userLatLng),
                      L.latLng(bunkerLatLng)
                  ],
                  routeWhileDragging: true
              }).addTo(map);

              // Store the new route control and clicked bunker marker
              previousRouteControl = routeControl;
              previousBunkerMarker = event.target;

              // Add popup to the clicked bunker marker
              event.target.bindPopup("Bunker " + event.target.options.bunkerId).openPopup();

              // Show the Locate Nearest Bunker button again
              document.getElementById("locate-button").style.display = "block";
          });
      }
  }

  // Show the ID verification modal when the page loads
  window.onload = function() {
      showIdVerificationModal();
  };

  // Define custom icon for danger zones
  var dangerIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2737/2737912.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
  });