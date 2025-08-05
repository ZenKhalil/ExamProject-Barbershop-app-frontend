import services from "./taps/services.js";
import bookings from "./taps/booking.js";
import {loadAboutPage} from "./taps/about.js"

let navigationInitialized = false;


// Global Setup
document.addEventListener("DOMContentLoaded", function () {
    // Adjust main content padding based on footer height
    var footerHeight = document.querySelector("footer").offsetHeight;
    var mainContent = document.getElementById("main-content");
    mainContent.style.paddingBottom = footerHeight + "px";

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


    // Setup hamburger menu toggle
    setupHamburgerMenu();

 // **Setup admin login button from admin.js**
    if (window.setupAdminLogin) {
        window.setupAdminLogin();
    }

    // If admin.js is loaded and the function exists, call it
    if (window.checkAdminLoginStatus) {
        window.checkAdminLoginStatus();
    }

    // Setup price list modal
    services.setupPriceListModal();

    
});


// Function to show a specific section
export function showSection(sectionId) {
  console.log("Attempting to show section:", sectionId);

  // Hide all sections first
  document.querySelectorAll('main > section').forEach((section) => {
    section.style.display = 'none';  // Hide all sections
  });

  // Handle the price list section separately as it's a modal
  if (sectionId === 'pricelist-section') {
    console.log("Opening price list modal");
    services.openPriceListModal();
    return; // Exit early to prevent further section navigation
  }

  // Show the selected section
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    console.log("Displaying section:", sectionId);
    selectedSection.style.display = "block";

    // Save the current section in sessionStorage
    sessionStorage.setItem("currentSection", sectionId);

    // Load specific content based on section
    if (sectionId === "about-section") {
      loadAboutPage();
    } else if (sectionId === "home-section") {
      loadHomePage();
    } else if (sectionId === "booking-section") {
  console.log("Loading booking page.");
  // Use requestAnimationFrame to ensure the DOM updates before calling loadBookingPage
  bookings.loadBookingPage(); 
}
  } 
}

// Close modal when clicking outside
window.addEventListener("click", (event) => {
    const priceListModal = document.getElementById('priceListModal');
    if (event.target === priceListModal) {
        priceListModal.classList.add("hidden");
        priceListModal.style.display = 'none'; // Ensure the modal is hidden
    }
});


// Function to setup navigation links
function setupNavigation() {
    // Check if navigation is already set up
    if (navigationInitialized) {
        return;
    }
    navigationInitialized = true;

    const navBar = document.getElementById('main-nav');
    if (!navBar) {
        console.error("Navigation bar not found.");
        return;
    }

    // Attach a single event listener to the navigation bar
    navBar.addEventListener('click', navBarClickHandler);
}

function navBarClickHandler(event) {
    const link = event.target.closest('a, button');
    if (link) {
        event.preventDefault();
        const href = link.getAttribute('href');
        let sectionId = href ? href.substring(1) : link.id.replace('Button', '-section');

        console.log("Link clicked. Navigating to section:", sectionId);

        // Handle Price List modal
        if (sectionId === 'priceList-section') {
            console.log("Opening price list modal from navigation.");
            services.openPriceListModal();
            return;
        }

        // Show booking section
        if (sectionId === "booking-section") {
            console.log("Loading booking page.");
            bookings.loadBookingPage();
            showSection(sectionId);
            return;
        }

        // Show the selected section
        showSection(sectionId);
    }
}

// Function to setup hamburger menu toggle
let hamburgerMenuInitialized = false;

function setupHamburgerMenu() {
    if (hamburgerMenuInitialized) {
        return;
    }
    hamburgerMenuInitialized = true;

    const hamMenu = document.querySelector(".ham-menu");
    const offScreenMenu = document.querySelector(".off-screen-menu");

    if (!hamMenu || !offScreenMenu) {
        console.error("Hamburger menu or off-screen menu not found.");
        return;
    }

    // Toggle the menu when the hamburger icon is clicked
    hamMenu.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent event from bubbling up to the document
        hamMenu.classList.toggle("active");
        offScreenMenu.classList.toggle("active");
    });

    // Handle clicks on the off-screen menu
    offScreenMenu.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent clicks inside the menu from closing it

        const link = event.target.closest("a, button");
        if (link) {
            event.preventDefault();

            // Close the hamburger menu
            hamMenu.classList.remove("active");
            offScreenMenu.classList.remove("active");

            const href = link.getAttribute("href");
            let sectionId = href ? href.substring(1) : link.id.replace('Button', '-section');

            // Adjust the condition to match the sectionId derived from the button's id
            if (sectionId === 'priceList-section') {
                services.openPriceListModal();
                return;
            }

            if (sectionId === "booking-section") {
                bookings.loadBookingPage();
            }

            showSection(sectionId);
        }
    });

    // Close the menu when clicking outside of it
    document.addEventListener("click", (event) => {
        if (offScreenMenu.classList.contains("active")) {
            const isClickInsideMenu = offScreenMenu.contains(event.target) || hamMenu.contains(event.target);
            if (!isClickInsideMenu) {
                // Clicked outside the menu, close it
                hamMenu.classList.remove("active");
                offScreenMenu.classList.remove("active");
            }
        }
    });
}



// Function to load the Home page content
function loadHomePage() {
    console.log("Loading home page content.");

    const homeSection = document.getElementById("home-section");
    if (!homeSection) {
        console.error("Home section not found in the document.");
        return;
    }
    // Otherwise, you can dynamically insert content as needed
    console.log("Home page content is already set in HTML.");
}


// Close all modals with Escape key
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal").forEach((modal) => {
            modal.classList.add("hidden");
        });
    }
});

console.log("Script.js loaded successfully.");

export default {
setupHamburgerMenu,
setupNavigation,
};