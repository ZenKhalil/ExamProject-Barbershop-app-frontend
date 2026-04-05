// main.js

// CSS imports — Parcel bundles these in order
import './styling/style.css';
import './admin/admin.css';
import './styling/tapstyle.css';
import './styling/about.css';

// Import all module entry points
import './script.js';
import './admin/admin.js';
import './taps/about.js';
import './taps/booking.js';
import './taps/services.js';

// Add any global initialization if needed
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application initialized from main entry point');
});