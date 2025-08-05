// frontend/taps/about.js

// Import Leaflet from node_modules
import L from 'leaflet';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths by setting them to CDN URLs
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Export the function to load the About page
export function loadAboutPage() {
  const aboutSection = document.getElementById("about-section");

  if (!aboutSection) {
    console.error("About section not found in the DOM.");
    return;
  }

  // Set the content dynamically with the new text
  aboutSection.innerHTML = `
    <div class="about-container">
      <h1>Info om Salon Sindbad</h1>
      <p>
        Salon Sindbad ligger på Nørrebrogade i København. Salon Sindbad er placeret i et spændende og kulturelt område på Nørrebro, hvor der næsten altid er liv 24 timer i døgnet. Området er trygt og samfundet der bor i området er alt fra børnefamilier, singler samt ældre. Du kan besøge Salon Sindbad på Nørrebro, ved at tage toget til Nørrebro station eller bussen som køre flere gange i timen.
      </p>
      <p>
        Salon Sindbad på Nørrebro i København ligger på Nørrebrogade. Du kan finde den nøjagtige placering, via vores kort på denne side. Her kan du også finde kontaktoplysninger til Salon Sindbad, samt åbningstider. Hvis du vælger at køre i bil, så er der parkeringspladser langs de små sidegader, som gør det nemt for dig at besøge forretningen.
      </p>
      <div id="map"></div>
    </div>
  `;

  // Initialize the map after the content is loaded
  initLeafletMap();
}

// Function to initialize the Leaflet map
function initLeafletMap() {
  const salonLocation = [55.690730, 12.554560]; // Latitude, Longitude

  // Create the map and set its view to the salon location with a higher zoom level
  const map = L.map('map').setView(salonLocation, 17); // Increased zoom level from 14 to 17

  // Add OpenStreetMap tiles to the map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // Add a marker for the salon
  const marker = L.marker(salonLocation).addTo(map)
    .bindPopup('<b>Salon Sindbad</b><br>Nørrebrogade 64, DK-2200 København N')
    .openPopup();

  // Optional: Add Satellite Layer (Requires a different tile provider)
  const EsriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/' +
    'World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
  });

  // Define base layers
  const baseMaps = {
    "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }),
    "Satellite": EsriSat
  };

  // Add Layer Control to switch between Street Map and Satellite
  L.control.layers(baseMaps).addTo(map);
}

// Function to disable scrolling only on the "About" section
function toggleScrollOnAboutSection() {
  const aboutSection = document.getElementById('about-section');

  // Check if the "About" section is currently visible
  if (aboutSection && getComputedStyle(aboutSection).display !== 'none') {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
}

// Call this function after navigating to a new section
window.addEventListener('hashchange', toggleScrollOnAboutSection);
window.addEventListener('load', toggleScrollOnAboutSection);

// Export default object
export default {
  loadAboutPage,
};
