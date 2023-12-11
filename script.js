import services from "./taps/services.js";
import bookings from "./taps/booking.js";

let isBookingPageLoaded = false;

// Global Setup
document.addEventListener("DOMContentLoaded", function () {
   var footerHeight = document.querySelector("footer").offsetHeight;
   var mainContent = document.getElementById("main-content");
   mainContent.style.paddingBottom = footerHeight + "px";
  console.log("Document ready. Setting up navigation and sections.");
  setupNavigation();

  // Retrieve the last visited section from sessionStorage
  const savedSection = sessionStorage.getItem("currentSection");
  console.log("Retrieved saved section:", savedSection);

  // Show the saved section or default to the home page
  if (savedSection) {
    console.log("Showing saved section:", savedSection);
    showSection(savedSection);
  } else {
    console.log("No saved section found. Loading home page.");
    loadHomePage();
  }

  // Setup price list modal toggle in services
  services.setupPriceListModal();

 // If admin.js is loaded and the function exists, call it
  if (window.checkAdminLoginStatus) {
    window.checkAdminLoginStatus();
  }

});

function showSection(sectionId) {
  console.log("Attempting to show section:", sectionId);
  document.querySelectorAll("main section").forEach((section) => {
    section.style.display = "none";
  });

  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    console.log("Displaying section:", sectionId);
    selectedSection.style.display = "block";

    // Save the current section in sessionStorage
    sessionStorage.setItem("currentSection", sectionId);

    // Ensure booking page is loaded only when its section is active
    if (sectionId === "booking-section" && !isBookingPageLoaded) {
      console.log("Loading booking page for the first time.");
      bookings.loadBookingPage();
      isBookingPageLoaded = true;
    } else {
      console.log("Booking page already loaded or not applicable.");
      isBookingPageLoaded = false;
    }
  } else {
    console.error("Failed to find section with ID:", sectionId);
  }

   if (sectionId === "about-section") {
     loadAboutPage();
   }

    if (sectionId === "home-section") {
      loadHomePage();
    }

    if (sectionId === "pricelist-section") {
      setupPriceListModal();
      selectedSection.style.display = "flex";
    }
}


function setupNavigation() {
  document.querySelectorAll("#main-nav a").forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const sectionId = this.getAttribute("href").substring(1);
      console.log("Link clicked. Navigating to section:", sectionId);
      showSection(sectionId);
    });
  });
  console.log("Navigation setup complete.");
}

// In script.js
window.generateAdminNavBar = function() {
  const navBar = document.getElementById("main-nav");
  navBar.innerHTML = `
    <ul>
      <li><a href="#" id="dashboard-link">Dashboard</a></li>
      <li><a href="#" id="view-bookings-link">View Bookings</a></li>
      <li><a href="#" id="edit-availabilities-link">Edit Availabilities</a></li>
      <li><a href="#" id="update-opening-hours-link">Update Opening Hours</a></li>
      <li><a href="#" id="admin-logout-link"></a></li>
    </ul>`;

  // Call the function from admin.js to set up event listeners
  if (window.setupAdminNavBarListeners) {
    window.setupAdminNavBarListeners();
  }
};


function loadHomePage() {
  console.log("Loading home page content.");

  const homeSection = document.getElementById("home-section");
  if (!homeSection) {
    console.error("Home section not found in the document.");
    return;
  }

  const homeHtml = `
    <div class="welcome">
      <h2>Welcome to The Barber Shop</h2>
      <p>Discover our world-class services and meet our talented team.</p>
    </div>`;

  homeSection.innerHTML = homeHtml;
  console.log("Home page content loaded and set.");
}

function loadAboutPage() {
  console.log("Loading about page content.");

  const aboutSection = document.getElementById("about-section");
  if (!aboutSection) {
    console.error("About section not found in the document.");
    return;
  }

  const aboutHtml = `
    <div class="about-container">
      <h2>About Our Barbershop</h2>
      <p>Welcome to Modern Barbershop, where tradition meets modernity. Established in 1995, we've been providing top-notch grooming services for over two decades. Our skilled barbers are artisans of their craft, dedicated to giving you the best experience and a look you'll love.</p>
      <p>We believe in the timeless power of a great haircut, the importance of a place for men to feel comfortable and valued, and the simple pleasure of a sharp look for any occasion. We're not just a business; we're a cornerstone of the community, and we're proud to uphold the classic values of quality and service.</p>
      <p>Whether you're looking for a quick trim, a classic cut, or a complete makeover, we're here for you. Walk-ins are welcome, so come in and experience the difference at Modern Barbershop today!</p>
    </div>`;

  aboutSection.innerHTML = aboutHtml;
  console.log("About page content loaded and set.");
}