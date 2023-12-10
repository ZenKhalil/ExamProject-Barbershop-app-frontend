import services from "./taps/services.js";
import bookings from "./taps/booking.js";

let isBookingPageLoaded = false;

// Global Setup
document.addEventListener("DOMContentLoaded", function () {
  console.log("Document ready. Setting up navigation and sections.");
  setupNavigation();

  // Checking if the price list modal was previously open
  const isPriceListModalOpen =
    sessionStorage.getItem("isPriceListModalOpen") === "true";
  console.log("Is Price List Modal Open:", isPriceListModalOpen);

  // Close price list modal if it was previously open
  if (isPriceListModalOpen) {
    console.log("Closing previously opened price list modal.");
    services.toggleModal("none");
  }

  // Check if a section is saved in local storage
  const savedSection = localStorage.getItem("currentSection");
  console.log("Saved Section:", savedSection);

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
});

function showSection(sectionId) {
  console.log("Attempting to show section:", sectionId);
  document.querySelectorAll("main section").forEach((section) => {
    console.log("Hiding section:", section.id);
    section.style.display = "none";
  });

  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    console.log("Displaying section:", sectionId);
    selectedSection.style.display = "block";

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

function updateMainContent(html, sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    console.log("Updating main content for section:", sectionId);
    section.innerHTML = html;
  } else {
    console.error("Failed to update content. Section not found:", sectionId);
  }
}
