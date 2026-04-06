let barbersData = {};
populateBarbers();

export const adminFunctions = {
  "dashboard-section": loadAdminDashboard,
  "view-bookings-section": viewBookings,
  "edit-availabilities-section": displayEditAvailabilityForm,
  "manage-services-section": displayManageServices,
  "manage-barbers-section": displayManageBarbers,
  "settings-section": displaySettings,
};

function setupAdminNavigation() {
  document
    .querySelectorAll("#main-nav a, .off-screen-menu a")
    .forEach((link) => {
      link.addEventListener("click", function (event) {
        const href = this.getAttribute("href");
        const sectionId = href ? href.substring(1) : null;

        if (adminFunctions.hasOwnProperty(sectionId)) {
          event.preventDefault();
          console.log("Admin navigation to section:", sectionId);
          sessionStorage.setItem("adminSection", sectionId);
          adminFunctions[sectionId]();
        }
      });
    });
}

// Expose functions for admin.js if needed
export function generateAdminNavBar() {
  // Unlock scrolling (home page locks it)
  document.body.classList.remove("home-active");

  const navBar = document.getElementById("main-nav");
  if (!navBar) {
    console.error("Main navigation (nav#main-nav) not found.");
    return;
  }

  // Update the main navigation with admin links
  navBar.innerHTML = `
        <ul>
            <li><a href="#dashboard-section" id="dashboard-link"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
            <li><a href="#view-bookings-section" id="view-bookings-link"><i class="fas fa-calendar-check"></i> Bookings</a></li>
            <li><a href="#manage-services-section" id="manage-services-link"><i class="fas fa-cut"></i> Services</a></li>
            <li><a href="#manage-barbers-section" id="manage-barbers-link"><i class="fas fa-user-tie"></i> Barbers</a></li>
            <li><a href="#edit-availabilities-section" id="edit-availabilities-link"><i class="fas fa-clock"></i> Schedule</a></li>
            <li><a href="#settings-section" id="settings-link"><i class="fas fa-cog"></i> Settings</a></li>
        </ul>
    `;

  // Update the off-screen menu with admin links
  updateOffScreenMenuToAdmin();

  // Call the function to set up event listeners for admin links
  setupAdminNavBarListeners();

  // Set up admin navigation
  setupAdminNavigation();
}

// Function to update the off-screen menu with admin links
function updateOffScreenMenuToAdmin() {
  const offScreenMenu = document.querySelector(".off-screen-menu ul");
  if (!offScreenMenu) {
    console.error("Off-screen menu's <ul> not found.");
    return;
  }

  offScreenMenu.innerHTML = `
        <li><a href="#dashboard-section">Dashboard</a></li>
        <li><a href="#view-bookings-section">Bookings</a></li>
        <li><a href="#manage-services-section">Services</a></li>
        <li><a href="#manage-barbers-section">Barbers</a></li>
        <li><a href="#edit-availabilities-section">Schedule</a></li>
        <li><a href="#settings-section">Settings</a></li>
    `;
}

document.addEventListener("DOMContentLoaded", function () {
  const adminLoginButton = document.getElementById("admin-login-button");
  const adminLoginModal = document.getElementById("admin-login-modal");
  const closeButton = adminLoginModal.querySelector(".close-button-admin");
  const adminLoginForm = document.getElementById("admin-login-form");

  const adminToken = localStorage.getItem("adminToken");

  if (adminToken) {
    // Admin is logged in — restore last section or go to dashboard
    var savedSection = sessionStorage.getItem("adminSection");
    if (savedSection && adminFunctions[savedSection]) {
      adminFunctions[savedSection]();
    } else {
      loadAdminDashboard();
    }
    adminLoginButton.textContent = "Logout";
    adminLoginButton.onclick = logoutAdmin;
  } else {
    // Admin is not logged in
    adminLoginButton.textContent = "Staff Login";
    adminLoginButton.onclick = showAdminLoginModal;
  }

  // Check if the admin is already logged in
  checkAdminLoginStatus();

  // Hide the modal
  closeButton.addEventListener("click", function () {
    adminLoginModal.style.display = "none";
  });

  // Hide modal on outside click
  window.addEventListener("click", function (event) {
    if (event.target == adminLoginModal) {
      adminLoginModal.style.display = "none";
    }
  });

  // Handle Admin Login Form Submission
  adminLoginForm.addEventListener("submit", handleAdminLogin);
});

function handleAdminLogin(event) {
  event.preventDefault();
  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;
  const adminLoginButton = document.getElementById("admin-login-button");
  const adminLoginModal = document.getElementById("admin-login-modal"); // Get the login modal

  fetch(
    "https://salonsindbad-api.duckdns.org/api/admin/login",
    {
      // Adjust the URL as per your API endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    })
    .then((data) => {
      localStorage.setItem("adminToken", data.token);
      sessionStorage.setItem("adminSection", "dashboard-section");
      console.log("Logged in successfully");
      adminLoginModal.style.display = "none"; // Hide the modal
      displayLoginSuccessMessage(); // Display a success message
      loadAdminDashboard(); // Load the admin dashboard after successful login
      adminLoginButton.textContent = "Logout"; // Change button text to "Logout"
      adminLoginButton.onclick = logoutAdmin; // Change the button's click event to the logout function
    })
    .catch((error) => {
      console.error("Error:", error);
      // Show inline error instead of alert
      var errorEl = document.getElementById("login-error-msg");
      if (!errorEl) {
        errorEl = document.createElement("div");
        errorEl.id = "login-error-msg";
        errorEl.style.cssText = "color:#c44e4e;font-size:0.85rem;text-align:center;padding:8px 12px;margin-top:4px;background:rgba(196,78,78,0.1);border:1px solid rgba(196,78,78,0.25);border-radius:6px;";
        var form = document.getElementById("admin-login-form");
        if (form) form.appendChild(errorEl);
      }
      errorEl.textContent = "Invalid username or password";
      errorEl.style.display = "block";
      // Clear error when user starts typing
      var inputs = document.querySelectorAll("#admin-login-form input");
      inputs.forEach(function(inp) {
        inp.addEventListener("input", function clearErr() {
          if (errorEl) errorEl.style.display = "none";
          inp.removeEventListener("input", clearErr);
        });
      });
    });
}

function displayLoginSuccessMessage() {
  const message = document.createElement("div");
  message.textContent = "Logged in successfully!";
  message.style.position = "fixed";
  message.style.left = "50%";
  message.style.top = "10px";
  message.style.transform = "translateX(-50%)";
  message.style.backgroundColor = "#28a745";
  message.style.color = "white";
  message.style.padding = "10px";
  message.style.borderRadius = "5px";
  message.style.zIndex = "1001";
  document.body.appendChild(message);

  // Remove the message after a short delay
  setTimeout(() => {
    document.body.removeChild(message);
  }, 2000);
}

// Define the logoutAdmin function as shown in the previous message

function checkAdminLoginStatus() {
  const adminToken = localStorage.getItem("adminToken");
  const adminLoginButton = document.getElementById("admin-login-button");

  if (adminToken) {
    // Admin is logged in, adjust UI accordingly
    generateAdminNavBar();
    adminLoginButton.textContent = "Logout";
    adminLoginButton.onclick = logoutAdmin;
  } else {
    // Admin is not logged in
    adminLoginButton.textContent = "Staff Login";
    adminLoginButton.onclick = showAdminLoginModal;
  }
}

// Define the showAdminLoginModal function to display the login modal
function showAdminLoginModal() {
  const adminLoginModal = document.getElementById("admin-login-modal");
  adminLoginModal.style.display = "block";
}

// Define the logoutAdmin function to handle the logout process
function logoutAdmin() {
  // Remove the admin token to log the user out
  localStorage.removeItem("adminToken");

  // Clear the saved section in sessionStorage
  sessionStorage.removeItem("currentSection");
  sessionStorage.removeItem("adminSection");

  // Reload the page to trigger the `DOMContentLoaded` event in script.js
  window.location.reload();
}

export function setupAdminNavBarListeners() {
  const dashboardLink = document.getElementById("dashboard-link");
  if (dashboardLink) {
    dashboardLink.addEventListener("click", (e) => {
      e.preventDefault();
      loadAdminDashboard();
    });
  } else {
    console.error("Element with ID 'dashboard-link' not found.");
  }

  const viewBookingsLink = document.getElementById("view-bookings-link");
  if (viewBookingsLink) {
    viewBookingsLink.addEventListener("click", (e) => {
      e.preventDefault();
      viewBookings();
    });
  } else {
    console.error("Element with ID 'view-bookings-link' not found.");
  }

  const editAvailabilitiesLink = document.getElementById(
    "edit-availabilities-link"
  );
  if (editAvailabilitiesLink) {
    editAvailabilitiesLink.addEventListener("click", (e) => {
      e.preventDefault();
      displayEditAvailabilityForm();
    });
  } else {
    console.error("Element with ID 'edit-availabilities-link' not found.");
  }

  const settingsLink = document.getElementById("settings-link");
  if (settingsLink) {
    settingsLink.addEventListener("click", (e) => {
      e.preventDefault();
      displaySettings();
    });
  }

  const manageServicesLink = document.getElementById("manage-services-link");
  if (manageServicesLink) {
    manageServicesLink.addEventListener("click", (e) => {
      e.preventDefault();
      displayManageServices();
    });
  }

  const manageBarbersLink = document.getElementById("manage-barbers-link");
  if (manageBarbersLink) {
    manageBarbersLink.addEventListener("click", (e) => {
      e.preventDefault();
      displayManageBarbers();
    });
  }
}

/* Admin dashboard */

export function loadAdminDashboard() {
  console.log("loadAdminDashboard() called");
  generateAdminNavBar();

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const dashboardHtml = `
  <div class="dashboard-container">
    <div class="dash-welcome">
      <h2>Welcome back</h2>
      <p class="dash-date"><i class="fas fa-calendar-day"></i> ${dateStr}</p>
    </div>

    <div class="dash-stats" id="dash-stats">
      <div class="stat-card active" data-view="today">
        <div class="stat-icon"><i class="fas fa-calendar-day"></i></div>
        <div class="stat-info">
          <span class="stat-value" id="stat-today">—</span>
          <span class="stat-label">Today</span>
        </div>
      </div>
      <div class="stat-card" data-view="upcoming">
        <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
        <div class="stat-info">
          <span class="stat-value" id="stat-upcoming">—</span>
          <span class="stat-label">Upcoming</span>
        </div>
      </div>
      <div class="stat-card" data-view="daysoff">
        <div class="stat-icon"><i class="fas fa-calendar-times"></i></div>
        <div class="stat-info">
          <span class="stat-value" id="stat-daysoff">—</span>
          <span class="stat-label">Days Off</span>
        </div>
      </div>
    </div>

    <div class="dash-section">
      <div class="dash-section-header" id="dash-section-title">
        <h3><i class="fas fa-clock"></i> Today's Appointments</h3>
      </div>
      <div id="dash-content" class="dash-content">
        <div class="avail-loading"><i class="fas fa-spinner fa-spin"></i></div>
      </div>
    </div>
  </div>
`;

  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = dashboardHtml;

  // Data storage
  let allBookings = [];
  let allDaysOff = {};
  const token = localStorage.getItem("adminToken");
  const todayStr = today.toISOString().split("T")[0];

  // Make stat cards clickable
  document.querySelectorAll(".stat-card").forEach(function(card) {
    card.addEventListener("click", function() {
      document.querySelectorAll(".stat-card").forEach(function(c) { c.classList.remove("active"); });
      card.classList.add("active");
      var view = card.dataset.view;
      renderDashView(view);
    });
  });

  function renderDashView(view) {
    var titleEl = document.getElementById("dash-section-title");
    var content = document.getElementById("dash-content");
    if (!titleEl || !content) return;

    if (view === "today") {
      titleEl.innerHTML = '<h3><i class="fas fa-clock"></i> Today\'s Appointments</h3>';
      var todayBookings = allBookings.filter(function(b) {
        return b.booking_date && b.booking_date.substring(0, 10) === todayStr;
      }).sort(function(a, b) {
        return (a.booking_time || "").localeCompare(b.booking_time || "");
      });

      if (todayBookings.length === 0) {
        content.innerHTML = '<div class="dash-empty"><i class="fas fa-couch"></i> No appointments today</div>';
        return;
      }
      content.innerHTML = todayBookings.map(function(b) {
        var barberName = barbersData[b.barber_id] || "—";
        var time = (b.booking_time || "—").substring(0, 5);
        var services = b.preferred_haircut ? '<div class="dash-services"><i class="fas fa-cut"></i> ' + b.preferred_haircut + '</div>' : '';
        return '<div class="dash-booking-row">' +
          '<span class="dash-time">' + time + '</span>' +
          '<div class="dash-booking-info">' +
            '<span class="dash-customer">' + b.customer_name + '</span>' +
            services +
          '</div>' +
          '<span class="dash-barber-tag">' + barberName + '</span>' +
          '</div>';
      }).join("");

    } else if (view === "upcoming") {
      titleEl.innerHTML = '<h3><i class="fas fa-calendar-check"></i> Upcoming Appointments</h3>';
      var upcoming = allBookings.filter(function(b) {
        return b.booking_date && b.booking_date.substring(0, 10) >= todayStr;
      }).sort(function(a, b) {
        var dateComp = (a.booking_date || "").localeCompare(b.booking_date || "");
        if (dateComp !== 0) return dateComp;
        return (a.booking_time || "").localeCompare(b.booking_time || "");
      });

      if (upcoming.length === 0) {
        content.innerHTML = '<div class="dash-empty"><i class="fas fa-calendar"></i> No upcoming appointments</div>';
        return;
      }

      var grouped = {};
      upcoming.forEach(function(b) {
        var dateKey = b.booking_date.substring(0, 10);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(b);
      });

      var html = "";
      Object.keys(grouped).sort().forEach(function(dateKey) {
        var d = new Date(dateKey + "T00:00:00");
        var label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        var isToday = dateKey === todayStr;
        html += '<div class="dash-date-group">';
        html += '<div class="dash-date-label">' + label + (isToday ? ' <span class="today-badge">Today</span>' : '') + '</div>';
        grouped[dateKey].forEach(function(b) {
          var barberName = barbersData[b.barber_id] || "—";
          var time = (b.booking_time || "—").substring(0, 5);
          var services = b.preferred_haircut ? '<div class="dash-services"><i class="fas fa-cut"></i> ' + b.preferred_haircut + '</div>' : '';
          html += '<div class="dash-booking-row">' +
            '<span class="dash-time">' + time + '</span>' +
            '<div class="dash-booking-info">' +
              '<span class="dash-customer">' + b.customer_name + '</span>' +
              services +
            '</div>' +
            '<span class="dash-barber-tag">' + barberName + '</span>' +
            '</div>';
        });
        html += '</div>';
      });
      content.innerHTML = html;

    } else if (view === "daysoff") {
      titleEl.innerHTML = '<h3><i class="fas fa-calendar-times"></i> Barber Days Off</h3>';

      var barberIds = Object.keys(allDaysOff);
      if (barberIds.length === 0) {
        content.innerHTML = '<div class="dash-empty"><i class="fas fa-check-circle"></i> No days off set</div>';
        return;
      }

      var html = "";
      barberIds.forEach(function(bid) {
        var name = barbersData[bid] || "Barber " + bid;
        var dates = allDaysOff[bid] || [];
        html += '<div class="dash-daysoff-barber">';
        html += '<div class="dash-daysoff-name"><i class="fas fa-user-tie"></i> ' + name + ' <span class="avail-count">' + dates.length + '</span></div>';
        if (dates.length === 0) {
          html += '<div class="dash-daysoff-none">No days off</div>';
        } else {
          html += '<div class="dash-daysoff-tags">';
          dates.sort().forEach(function(date) {
            var d = new Date(date + "T00:00:00");
            var dayName = d.toLocaleDateString("en-US", { weekday: "short" });
            var monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            html += '<span class="dash-daysoff-tag"><span class="tag-day">' + dayName + '</span> ' + monthDay + '</span>';
          });
          html += '</div>';
        }
        html += '</div>';
      });
      content.innerHTML = html;
    }
  }

  // Fetch barbers first (populates barbersData), then bookings and days off
  fetch("https://salonsindbad-api.duckdns.org/api/barbers", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function(r) { return r.json(); })
    .then(function(barbers) {
      if (!Array.isArray(barbers)) barbers = [];

      // Populate barbersData for name lookups
      barbersData = barbers.reduce(function(acc, barber) {
        acc[barber.barber_id] = barber.name;
        return acc;
      }, {});

      // Now fetch bookings
      fetch("https://salonsindbad-api.duckdns.org/api/bookings", {
        headers: { Authorization: "Bearer " + token },
      })
        .then(function(r) { return r.json(); })
        .then(function(bookings) {
          if (!Array.isArray(bookings)) { bookings = []; }
          allBookings = bookings;

          var todayBookings = bookings.filter(function(b) {
            return b.booking_date && b.booking_date.substring(0, 10) === todayStr;
          });
          var upcomingBookings = bookings.filter(function(b) {
            return b.booking_date && b.booking_date.substring(0, 10) >= todayStr;
          });

          var statToday = document.getElementById("stat-today");
          var statUpcoming = document.getElementById("stat-upcoming");
          if (statToday) statToday.textContent = todayBookings.length;
          if (statUpcoming) statUpcoming.textContent = upcomingBookings.length;

          renderDashView("today");
        })
        .catch(function(err) {
          console.error("Error loading dashboard:", err);
          var content = document.getElementById("dash-content");
          if (content) content.innerHTML = '<div class="dash-empty">Could not load bookings</div>';
        });

      // Fetch days off for all barbers
      var totalDaysOff = 0;
      var pending = barbers.length;

      if (barbers.length === 0) {
        var statDaysOff = document.getElementById("stat-daysoff");
        if (statDaysOff) statDaysOff.textContent = 0;
      }

      barbers.forEach(function(barber) {
        fetch("https://salonsindbad-api.duckdns.org/api/barbers/" + barber.barber_id + "/unavailable-dates", {
          headers: { Authorization: "Bearer " + token },
        })
          .then(function(r) { return r.json(); })
          .then(function(dates) {
            if (Array.isArray(dates)) {
              totalDaysOff += dates.length;
              allDaysOff[barber.barber_id] = dates;
            }
            pending--;
            if (pending === 0) {
              var statDaysOff = document.getElementById("stat-daysoff");
              if (statDaysOff) statDaysOff.textContent = totalDaysOff;
            }
          })
          .catch(function() { pending--; });
      });
    })
    .catch(function() {
      var content = document.getElementById("dash-content");
      if (content) content.innerHTML = '<div class="dash-empty">Could not load data</div>';
    });
}
//window.loadAdminDashboard = loadAdminDashboard;

// Define viewBookings, editAvailabilities, updateOpeningHours, and logoutAdmin functions as per your functionality requirements.

export function viewBookings() {
  // Create the sorting and filtering UI
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2><i class="fas fa-calendar-check"></i> Bookings</h2>
      </div>
      <div class="sort-filter-container">
        <div class="sort-filter-section">
          <label for="sort-bookings"><i class="fas fa-sort"></i> Sort:</label>
          <select id="sort-bookings" class="form-control">
            <option value="dateAsc">Date Ascending</option>
            <option value="dateDesc">Date Descending</option>
          </select>
        </div>
        <div class="sort-filter-section">
          <label for="filter-barber"><i class="fas fa-user-tie"></i> Barber:</label>
          <select id="filter-barber" class="form-control">
            <option value="all">All Barbers</option>
          </select>
        </div>
      </div>
      <ul id="bookings-list" class="booking-list"></ul>
    </div>
  `;

  // Load barbers first, then display bookings
  populateFilterBarbers(function() {
    fetchBookingsAndDisplay();
  });

  // Attach event listeners for sorting and filtering
  document
    .getElementById("sort-bookings")
    .addEventListener("change", fetchBookingsAndDisplay);
  document
    .getElementById("filter-barber")
    .addEventListener("change", fetchBookingsAndDisplay);
}
window.viewBookings = viewBookings;

function fetchBookingsAndDisplay() {
  fetch(
    "https://salonsindbad-api.duckdns.org/api/bookings",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }
  )
    .then((response) => response.json())
    .then((bookings) => {
      const sortedAndFilteredBookings = sortAndFilterBookings(bookings);
      displayBookings(sortedAndFilteredBookings);
    })
    .catch((error) => console.error("Error fetching bookings:", error));
}

function sortAndFilterBookings(bookings) {
  const sortValue = document.getElementById("sort-bookings").value;
  const filterValue = document.getElementById("filter-barber").value;

  // Filter bookings
  let filteredBookings = bookings;
  if (filterValue !== "all") {
    filteredBookings = bookings.filter(
      (booking) => booking.barber_id.toString() === filterValue
    );
  }

  // Sort bookings
  filteredBookings.sort((a, b) => {
    const dateA = new Date(a.booking_date),
      dateB = new Date(b.booking_date);
    return sortValue === "dateAsc" ? dateA - dateB : dateB - dateA;
  });

  return filteredBookings;
}

function displayBookings(bookings) {
  const bookingsList = document.getElementById("bookings-list");
  bookingsList.innerHTML = "";

  bookings.forEach((booking) => {
    const barberName = barbersData[booking.barber_id] || "Unknown";
    const formattedDate = formatDate(booking.booking_date);
    const listItem = document.createElement("li");
    listItem.className = "booking-list-item";
    listItem.innerHTML = `
      <div class="booking-card-header">
        <span class="booking-customer"><i class="fas fa-user"></i> ${booking.customer_name}</span>
        <span class="booking-barber-tag">${barberName}</span>
      </div>
      <div class="booking-card-body">
        <div class="booking-detail"><i class="fas fa-calendar-day"></i> ${formattedDate}</div>
        <div class="booking-detail"><i class="fas fa-clock"></i> ${(booking.booking_time || "").substring(0, 5)}</div>
        <div class="booking-detail"><i class="fas fa-envelope"></i> ${booking.customer_email}</div>
        <div class="booking-detail"><i class="fas fa-phone"></i> ${booking.customer_phone || 'N/A'}</div>
        ${booking.preferred_haircut ? '<div class="booking-detail"><i class="fas fa-cut"></i> ' + booking.preferred_haircut + '</div>' : ''}
      </div>
      <button class="delete-booking-button" data-booking-id="${booking.booking_id}">
        <i class="fas fa-trash-alt"></i> Delete
      </button>
    `;
    bookingsList.appendChild(listItem);
  });

  // Attach event listeners to delete buttons
  const deleteButtons = document.querySelectorAll(".delete-booking-button");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const bookingId = this.getAttribute("data-booking-id");
      if (confirm("Are you sure you want to delete this booking?")) {
        deleteBooking(bookingId);
      }
    });
  });
}

function deleteBooking(bookingId) {
  fetch(
    `https://salonsindbad-api.duckdns.org/api/bookings/delete/${bookingId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }
      return response.text(); // Adjust based on what your API returns
    })
    .then((data) => {
      alert("Booking deleted successfully");
      // Refresh the bookings list
      fetchBookingsAndDisplay();
    })
    .catch((error) => {
      console.error("Error deleting booking:", error);
      alert("Error deleting booking");
    });
}

// Populate filter dropdown with barber options
function populateFilterBarbers(callback) {
  fetch("https://salonsindbad-api.duckdns.org/api/barbers", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  })
    .then((response) => response.json())
    .then((barbers) => {
      // Populate barbersData for name lookups
      barbersData = barbers.reduce((acc, barber) => {
        acc[barber.barber_id] = barber.name;
        return acc;
      }, {});

      const barberFilterSelect = document.getElementById("filter-barber");
      if (barberFilterSelect) {
        barberFilterSelect.innerHTML = '<option value="all">All Barbers</option>';
        barbers.forEach((barber) => {
          const option = document.createElement("option");
          option.value = barber.barber_id;
          option.textContent = barber.name;
          barberFilterSelect.appendChild(option);
        });
      }

      if (callback) callback();
    })
    .catch((error) => {
      console.error("Error fetching barbers:", error);
      if (callback) callback();
    });
}

// Function to format date
function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fetchAndDisplayBarberAvailabilities() {
  fetch("https://salonsindbad-api.duckdns.org/api/barbers")
    .then((response) => response.json())
    .then((barbers) => {
      const availabilitiesSection = document.createElement("section");
      availabilitiesSection.innerHTML = "<h2>Barber Availabilities</h2>";

      barbers.forEach((barber) => {
        const barberDiv = document.createElement("div");
        barberDiv.innerHTML = `<h3>Barber ${barber.id}</h3>`;
        fetch(
          `https://salonsindbad-api.duckdns.org/api/barbers/${barber.id}/availability`
        )
          .then((response) => response.json())
          .then((availabilities) => {
            const availabilityList = document.createElement("ul");
            availabilities.forEach((availability) => {
              const listItem = document.createElement("li");
              listItem.textContent = availability.unavailable_date;
              availabilityList.appendChild(listItem);
            });
            barberDiv.appendChild(availabilityList);
          })
          .catch((error) =>
            console.error("Error fetching availability for barber:", error)
          );

        availabilitiesSection.appendChild(barberDiv);
      });

      const mainContent = document.getElementById("main-content");
      mainContent.innerHTML = "";
      mainContent.appendChild(availabilitiesSection);
    })
    .catch((error) => console.error("Error fetching barbers:", error));
}


export function displayEditAvailabilityForm() {
  const formHtml = `
    <div class="admin-page avail-page">
      <div class="admin-page-header">
        <h2><i class="fas fa-clock"></i> Barber Schedule</h2>
      </div>

      <div class="avail-barber-select">
        <label><i class="fas fa-user-tie"></i> Barber</label>
        <select id="barber-select" class="barber-select form-control"></select>
      </div>

      <div class="avail-grid">
        <div class="avail-card">
          <div class="avail-card-header">
            <h3><i class="fas fa-calendar-times"></i> Current Days Off</h3>
            <span class="avail-count" id="avail-count">0 days</span>
          </div>
          <div class="avail-dates-list" id="current-dates-list">
            <div class="avail-empty"><i class="fas fa-check-circle"></i> No days off scheduled</div>
          </div>
        </div>

        <div class="avail-card">
          <div class="avail-card-header">
            <h3><i class="fas fa-plus-circle"></i> Add Days Off</h3>
          </div>
          <div class="avail-add-form">
            <div class="form-group">
              <label for="unavailable-start-date">From</label>
              <input type="date" id="unavailable-start-date" class="form-control">
            </div>
            <div class="form-group">
              <label for="unavailable-end-date">To</label>
              <input type="date" id="unavailable-end-date" class="form-control">
            </div>
            <button type="button" id="add-unavailability-btn" class="btn btn-full"><i class="fas fa-plus"></i> Add Unavailability</button>
          </div>
        </div>
      </div>
    </div>

    <input type="hidden" id="old-start-date" value="">
    <input type="hidden" id="old-end-date" value="">
    
    <div id="change-dates-modal" class="modal hidden">
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h4>Change Date</h4>
        <div id="current-unavailabilities-container"></div>
        <div class="form-group">
          <label for="new-start-date">New Start Date</label>
          <input type="date" id="new-start-date" class="form-control">
        </div>
        <div class="form-group">
          <label for="new-end-date">New End Date</label>
          <input type="date" id="new-end-date" class="form-control">
        </div>
        <button type="button" id="submit-change-dates" class="btn btn-full">Update Date</button>
      </div>
    </div>
    
    <div id="remove-unavailability-modal" class="modal hidden">
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h4>Remove Unavailability</h4>
        <form id="remove-unavailability-form">
          <div id="remove-unavailabilities-container"></div>
          <button type="submit" class="btn btn-full">Confirm Removal</button>
        </form>
      </div>
    </div>
  `;

  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = formHtml;
  populateBarbers();

  const barberSelect = document.getElementById("barber-select");
  barberSelect.addEventListener("change", () => {
    loadCurrentDaysOff(barberSelect.value);
  });

  setTimeout(() => {
    if (barberSelect.value) loadCurrentDaysOff(barberSelect.value);
  }, 500);

  document
    .getElementById("add-unavailability-btn")
    .addEventListener("click", () => {
      createBarberAvailability();
      setTimeout(() => {
        const barberId = document.getElementById("barber-select").value;
        if (barberId) loadCurrentDaysOff(barberId);
      }, 800);
    });

  document
    .getElementById("submit-change-dates")
    .addEventListener("click", () => {
      updateBarberAvailability();
    });

  const closeButtons = document.querySelectorAll(".close-modal");
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".modal").classList.add("hidden");
    });
  });
}

function loadCurrentDaysOff(barberId) {
  const container = document.getElementById("current-dates-list");
  const countEl = document.getElementById("avail-count");
  if (!container) return;

  container.innerHTML = '<div class="avail-loading"><i class="fas fa-spinner fa-spin"></i></div>';

  fetch("https://salonsindbad-api.duckdns.org/api/barbers/" + barberId + "/unavailable-dates", {
    headers: { Authorization: "Bearer " + localStorage.getItem("adminToken") },
  })
    .then(function(r) { return r.json(); })
    .then(function(dates) {
      if (!Array.isArray(dates) || dates.length === 0) {
        container.innerHTML = '<div class="avail-empty"><i class="fas fa-check-circle"></i> No days off scheduled</div>';
        if (countEl) countEl.textContent = "0 days";
        return;
      }

      if (countEl) countEl.textContent = dates.length + (dates.length === 1 ? " day" : " days");
      dates.sort();

      var tagsHtml = dates.map(function(date) {
        var d = new Date(date + "T00:00:00");
        var dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        var monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return '<div class="avail-date-tag" data-date="' + date + '">' +
          '<span class="tag-day">' + dayName + '</span>' +
          '<span class="tag-date">' + monthDay + '</span>' +
          '</div>';
      }).join("");

      container.innerHTML = tagsHtml +
        '<div class="avail-bulk-actions" id="bulk-actions" style="display:none;">' +
          '<button class="btn-bulk-remove" id="bulk-remove-btn"><i class="fas fa-trash-alt"></i> Remove <span id="bulk-count">0</span> selected</button>' +
          '<button class="btn-deselect" id="deselect-btn">Deselect all</button>' +
        '</div>';

      // Click tags to toggle selection
      container.querySelectorAll(".avail-date-tag").forEach(function(tag) {
        tag.addEventListener("click", function() {
          tag.classList.toggle("selected");
          updateBulkActions();
        });
      });

      // Bulk remove button
      var bulkBtn = document.getElementById("bulk-remove-btn");
      if (bulkBtn) {
        bulkBtn.addEventListener("click", function() {
          var selected = container.querySelectorAll(".avail-date-tag.selected");
          var datesToRemove = Array.from(selected).map(function(t) { return t.dataset.date; });
          if (datesToRemove.length === 0) return;
          if (confirm("Remove " + datesToRemove.length + " date(s)?")) {
            removeMultipleDates(barberId, datesToRemove);
          }
        });
      }

      // Deselect all button
      var deselectBtn = document.getElementById("deselect-btn");
      if (deselectBtn) {
        deselectBtn.addEventListener("click", function() {
          container.querySelectorAll(".avail-date-tag.selected").forEach(function(t) {
            t.classList.remove("selected");
          });
          updateBulkActions();
        });
      }

      function updateBulkActions() {
        var selected = container.querySelectorAll(".avail-date-tag.selected");
        var bulkActions = document.getElementById("bulk-actions");
        var bulkCount = document.getElementById("bulk-count");
        if (bulkActions) {
          bulkActions.style.display = selected.length > 0 ? "flex" : "none";
        }
        if (bulkCount) {
          bulkCount.textContent = selected.length;
        }
      }
    })
    .catch(function(err) {
      console.error("Error loading days off:", err);
      container.innerHTML = '<div class="avail-empty">Error loading dates</div>';
    });
}

function removeMultipleDates(barberId, datesArray) {
  fetch("https://salonsindbad-api.duckdns.org/api/barbers/" + barberId + "/unavailable-dates", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("adminToken"),
    },
    body: JSON.stringify({ dates: datesArray }),
  })
    .then(function(r) { return r.json(); })
    .then(function() { loadCurrentDaysOff(barberId); })
    .catch(function(err) {
      console.error("Error removing dates:", err);
      alert("Failed to remove dates");
    });
}
window.displayEditAvailabilityForm = displayEditAvailabilityForm;

function createBarberAvailability() {
  const barberId = document.getElementById("barber-select").value;
  const startDate = document.getElementById("unavailable-start-date").value;
  const endDate =
    document.getElementById("unavailable-end-date").value || startDate;
  fetch(
    `https://salonsindbad-api.duckdns.org/api/barbers/${barberId}/unavailable-dates`,
    {
      method: "POST", // or "POST" if you're creating new availability
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
      }),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update availability");
      }
      return response.json();
    })
    .then(() => {
      alert("Availability updated successfully");
      // Optionally refresh the list of availabilities or take other actions
    })
    .catch((error) => {
      console.error("Error updating availability:", error);
      alert("Error updating availability");
    });
}

function fetchCurrentUnavailabilities(barberId) {
  fetch(
    `https://salonsindbad-api.duckdns.org/api/barbers/${barberId}/unavailable-dates`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch current unavailabilities");
      }
      return response.json();
    })
    .then((unavailabilities) => {
      console.log("Unavailabilities:", unavailabilities); // Debug: Check the actual response
      const container = document.getElementById(
        "current-unavailabilities-container"
      );
      container.innerHTML = ""; // Clear previous entries

      if (unavailabilities.length === 0) {
        container.textContent = "No unavailabilities set for this barber.";
        return;
      }

      const selectList = document.createElement("select");
      selectList.id = "current-unavailability-select";
      unavailabilities.forEach((unavailabilityDate) => {
        const option = document.createElement("option");
        option.value = unavailabilityDate; // Store the date string as the value
        option.textContent = `On ${unavailabilityDate}`;
        selectList.appendChild(option);
      });

      selectList.addEventListener("change", function () {
        const selectedDate = this.value;
        document.getElementById("old-start-date").value = selectedDate;
        document.getElementById("old-end-date").value = selectedDate; // If the end date is different, adjust this logic
      });

      container.appendChild(selectList);
      // Trigger change event to set initial values
      selectList.dispatchEvent(new Event("change"));
    })
    .catch((error) => {
      console.error("Error fetching current unavailabilities:", error);
      alert("Error fetching current unavailabilities");
    });
}

function updateBarberAvailability() {
  const barberId = document.getElementById("barber-select").value;
  const oldStartDate = document.getElementById("old-start-date").value;
  const oldEndDate = document.getElementById("old-end-date").value;
  const newStartDate = document.getElementById("new-start-date").value;
  const newEndDate =
    document.getElementById("new-end-date").value || newStartDate;

  console.log("Updating availability with the following data:");
  console.log(`Barber ID: ${barberId}`);
  console.log(`Old Start Date: ${oldStartDate}, Old End Date: ${oldEndDate}`);
  console.log(`New Start Date: ${newStartDate}, New End Date: ${newEndDate}`);

  fetch(
    `https://salonsindbad-api.duckdns.org/api/barbers/${barberId}/unavailable-dates`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Make sure this is the correct way to include the token
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({
        old_start_date: oldStartDate,
        old_end_date: oldEndDate,
        new_start_date: newStartDate,
        new_end_date: newEndDate,
      }),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to update availability: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
      alert("Availability updated successfully");
      fetchCurrentUnavailabilities(barberId); // Refresh the list of unavailabilities
    })
    .catch((error) => {
      console.error("Error updating availability:", error);
      alert(`Error updating availability: ${error.message}`);
    });
}

function deleteBarberAvailability() {
  const barberId = document.getElementById("barber-select").value;
  const startDate = document.getElementById("unavailable-start-date").value;
  const endDate =
    document.getElementById("unavailable-end-date").value || startDate; // Use single date if end date is not provided
  fetch(
    `https://salonsindbad-api.duckdns.org/api/barbers/${barberId}/unavailable-dates`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({ start_date: startDate, end_date: endDate }),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete availability");
      }
      return response.json();
    })
    .then(() => {
      alert("Availability deleted successfully");
      // Optionally refresh the list of availabilities or take other actions
    })
    .catch((error) => {
      console.error("Error deleting availability:", error);
      alert("Error deleting availability");
    });
}

function fetchCurrentUnavailabilitiesForRemoval(barberId) {
  fetch(
    `https://salonsindbad-api.duckdns.org/api/barbers/${barberId}/unavailable-dates`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch current unavailabilities");
      }
      return response.json();
    })
    .then((unavailabilities) => {
      console.log("Unavailabilities for Removal:", unavailabilities); // Debug
      const container = document.getElementById(
        "remove-unavailabilities-container"
      );
      container.innerHTML = ""; // Clear previous entries

      const removeForm = document.getElementById("remove-unavailability-form");
      if (!removeForm) {
        console.error("Form 'remove-unavailability-form' not found");
        return;
      }

      // Select the "Confirm Removal" button within the form
      const confirmButton = removeForm.querySelector("button[type='submit']");

      if (unavailabilities.length === 0) {
        // If no unavailabilities, display the message
        container.textContent = "No unavailabilities set for this barber.";

        // Hide the "Confirm Removal" button
        if (confirmButton) {
          confirmButton.style.display = "none";
        }
      } else {
        // If unavailabilities exist, display them as checkboxes
        unavailabilities.forEach((date) => {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.id = `remove-${date}`;
          checkbox.name = "removeDates";
          checkbox.value = date;

          const label = document.createElement("label");
          label.htmlFor = `remove-${date}`;
          label.textContent = ` ${date}`;

          const div = document.createElement("div");
          div.appendChild(checkbox);
          div.appendChild(label);

          container.appendChild(div);
        });

        // Show the "Confirm Removal" button
        if (confirmButton) {
          confirmButton.style.display = "block";
        }
      }

      // Attach event listener to the form submission
      if (removeForm) {
        // Remove existing event listeners to prevent multiple attachments
        removeForm.replaceWith(removeForm.cloneNode(true));
        const newRemoveForm = document.getElementById(
          "remove-unavailability-form"
        );
        newRemoveForm.addEventListener("submit", handleRemoveUnavailability);
      } else {
        console.error("Form 'remove-unavailability-form' not found");
      }
    })
    .catch((error) => {
      console.error("Error fetching current unavailabilities:", error);
      alert("Error fetching current unavailabilities");
    });
}

function handleRemoveUnavailability(event) {
  event.preventDefault(); // Prevent form from submitting normally

  const barberId = document.getElementById("barber-select").value;
  const checkboxes = document.querySelectorAll(
    'input[name="removeDates"]:checked'
  );
  const selectedDates = Array.from(checkboxes).map(
    (checkbox) => checkbox.value
  );

  if (selectedDates.length === 0) {
    alert("Please select at least one date to remove.");
    return;
  }

  // Confirmation before deletion
  if (
    !confirm(
      `Are you sure you want to remove unavailability for the selected ${selectedDates.length} date(s)?`
    )
  ) {
    return;
  }

  fetch(
    `https://salonsindbad-api.duckdns.org/api/barbers/${barberId}/unavailable-dates`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({ dates: selectedDates }),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete unavailability");
      }
      return response.json();
    })
    .then((data) => {
      alert(data.message || "Availability deleted successfully");
      // Refresh the list of unavailabilities
      fetchCurrentUnavailabilitiesForRemoval(barberId);
      // fetchUnavailableTimeslotsForCurrentView(barberId);
    })
    .catch((error) => {
      console.error("Error deleting availability:", error);
      alert("Error deleting availability");
    });
}

// Populate barbers from the API
function populateBarbers() {
  fetch("https://salonsindbad-api.duckdns.org/api/barbers", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  })
    .then((response) => response.json())
    .then((barbers) => {
      barbersData = barbers.reduce((acc, barber) => {
        acc[barber.barber_id] = barber.name;
        return acc;
      }, {});

      // Populate the select dropdowns
      const barberSelects = document.querySelectorAll(".barber-select");
      barberSelects.forEach((select) => {
        select.innerHTML = barbers
          .map(
            (barber) =>
              `<option value="${barber.barber_id}">${barber.name}</option>`
          )
          .join("");
      });
    })
    .catch((error) => console.error("Error fetching barbers:", error));
}

// ============================================================
// SETTINGS — Email configuration
// ============================================================

export function displaySettings() {
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = `
    <div class="settings-container">
      <h2><i class="fas fa-cog"></i> Settings</h2>

      <div class="settings-tabs">
        <button class="settings-tab active" data-tab="tab-password"><i class="fas fa-key"></i> Password</button>
        <button class="settings-tab" data-tab="tab-email"><i class="fas fa-envelope"></i> Email</button>
        <button class="settings-tab" data-tab="tab-legal"><i class="fas fa-file-contract"></i> Legal</button>
      </div>

      <div class="settings-card">
        <div id="tab-password" class="settings-tab-content active">
          <div class="settings-form">
            <div class="form-group">
              <label for="settings-current-pw">Current Password</label>
              <div class="pw-input-wrap">
                <input type="password" id="settings-current-pw" class="form-control" placeholder="Enter current password">
                <button type="button" class="pw-toggle" data-target="settings-current-pw"><i class="fas fa-eye"></i></button>
              </div>
            </div>
            <div class="form-group">
              <label for="settings-new-pw">New Password</label>
              <div class="pw-input-wrap">
                <input type="password" id="settings-new-pw" class="form-control" placeholder="Enter new password">
                <button type="button" class="pw-toggle" data-target="settings-new-pw"><i class="fas fa-eye"></i></button>
              </div>
            </div>
            <div class="form-group">
              <label for="settings-confirm-pw">Confirm New Password</label>
              <div class="pw-input-wrap">
                <input type="password" id="settings-confirm-pw" class="form-control" placeholder="Repeat new password">
                <button type="button" class="pw-toggle" data-target="settings-confirm-pw"><i class="fas fa-eye"></i></button>
              </div>
            </div>
            <div class="settings-actions">
              <button type="button" id="change-password-btn" class="btn"><i class="fas fa-lock"></i> Update Password</button>
            </div>
            <div id="password-message" class="settings-message" style="display:none;"></div>
          </div>
        </div>

        <div id="tab-email" class="settings-tab-content">
          <div class="settings-tab-status">
            <span class="settings-status" id="email-status">Loading...</span>
          </div>
          <div class="settings-form" id="email-settings-form">
            <div class="form-group">
              <label for="settings-email-service">Email Service</label>
              <select id="settings-email-service" class="form-control">
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
                <option value="yahoo">Yahoo</option>
              </select>
            </div>

            <div class="form-group">
              <label for="settings-email-username">Email Address</label>
              <input type="email" id="settings-email-username" class="form-control" placeholder="your@email.com">
            </div>

            <div class="form-group">
              <label for="settings-email-password">App Password</label>
              <div class="input-with-hint">
                <input type="password" id="settings-email-password" class="form-control" placeholder="Leave empty to keep current">
                <small class="form-hint">For Gmail: generate at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener">myaccount.google.com/apppasswords</a></small>
              </div>
            </div>

            <div class="form-group">
              <label for="settings-owner-email">Owner Notification Email</label>
              <input type="email" id="settings-owner-email" class="form-control" placeholder="Where booking notifications are sent">
            </div>

            <div class="settings-actions">
              <button type="button" id="save-email-settings" class="btn"><i class="fas fa-save"></i> Save Settings</button>
              <button type="button" id="test-email-settings" class="btn btn-secondary"><i class="fas fa-paper-plane"></i> Send Test Email</button>
            </div>

            <div id="settings-message" class="settings-message" style="display:none;"></div>
          </div>
        </div>

        <div id="tab-legal" class="settings-tab-content">
          <div class="settings-form">
            <div class="form-group">
              <label>Editing</label>
              <div class="legal-edit-tabs">
                <button class="legal-edit-tab active" data-edit="privacy"><i class="fas fa-shield-alt"></i> Privacy Policy</button>
                <button class="legal-edit-tab" data-edit="terms"><i class="fas fa-file-contract"></i> Terms &amp; Conditions</button>
              </div>
            </div>
            <div class="form-group">
              <label for="legal-editor">Content <small style="color:var(--clr-text-dim);font-weight:400;">(HTML supported)</small></label>
              <textarea id="legal-editor" class="form-control legal-textarea" rows="14" placeholder="Enter your legal text here... HTML tags like <h3>, <p>, <ul>, <li> are supported."></textarea>
            </div>
            <div class="settings-actions">
              <button type="button" id="save-legal-btn" class="btn"><i class="fas fa-save"></i> Save</button>
              <button type="button" id="preview-legal-btn" class="btn btn-secondary"><i class="fas fa-eye"></i> Preview</button>
            </div>
            <div id="legal-message" class="settings-message" style="display:none;"></div>
            <div id="legal-preview" class="legal-preview" style="display:none;"></div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Tab switching
  document.querySelectorAll(".settings-tab").forEach(function(tab) {
    tab.addEventListener("click", function() {
      document.querySelectorAll(".settings-tab").forEach(function(t) { t.classList.remove("active"); });
      document.querySelectorAll(".settings-tab-content").forEach(function(c) { c.classList.remove("active"); });
      tab.classList.add("active");
      var target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add("active");
    });
  });

  // Load current settings
  loadEmailSettings();

  // Attach event listeners
  document.getElementById("save-email-settings").addEventListener("click", saveEmailSettings);
  document.getElementById("test-email-settings").addEventListener("click", testEmailSettings);
  document.getElementById("change-password-btn").addEventListener("click", changePassword);

  // Password visibility toggles
  document.querySelectorAll(".pw-toggle").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var input = document.getElementById(btn.dataset.target);
      if (!input) return;
      var icon = btn.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        icon.className = "fas fa-eye-slash";
      } else {
        input.type = "password";
        icon.className = "fas fa-eye";
      }
    });
  });

  // Legal editor
  var currentLegalType = "privacy";

  function loadLegalContent(type) {
    currentLegalType = type;
    var editor = document.getElementById("legal-editor");
    if (!editor) return;
    editor.value = "Loading...";
    fetch(API_BASE + "/api/legal/" + type)
      .then(function(r) { return r.json(); })
      .then(function(data) { editor.value = data.content || ""; })
      .catch(function() { editor.value = "Error loading content"; });
  }

  document.querySelectorAll(".legal-edit-tab").forEach(function(tab) {
    tab.addEventListener("click", function() {
      document.querySelectorAll(".legal-edit-tab").forEach(function(t) { t.classList.remove("active"); });
      tab.classList.add("active");
      loadLegalContent(tab.dataset.edit);
      var preview = document.getElementById("legal-preview");
      if (preview) preview.style.display = "none";
    });
  });

  var legalTabBtn = document.querySelector('.settings-tab[data-tab="tab-legal"]');
  if (legalTabBtn) legalTabBtn.addEventListener("click", function() { loadLegalContent(currentLegalType); });

  document.getElementById("save-legal-btn").addEventListener("click", function() {
    var btn = this;
    var editor = document.getElementById("legal-editor");
    var msgEl = document.getElementById("legal-message");
    var token = localStorage.getItem("adminToken");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    fetch(API_BASE + "/api/legal/" + currentLegalType, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ content: editor.value }),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Save';
        msgEl.style.display = "block";
        if (data.error) {
          msgEl.className = "settings-message settings-msg-error";
          msgEl.textContent = data.error;
        } else {
          msgEl.className = "settings-message settings-msg-success";
          msgEl.textContent = "Saved successfully!";
          setTimeout(function() { msgEl.style.display = "none"; }, 3000);
        }
      })
      .catch(function() {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Save';
        msgEl.style.display = "block";
        msgEl.className = "settings-message settings-msg-error";
        msgEl.textContent = "Failed to save";
      });
  });

  document.getElementById("preview-legal-btn").addEventListener("click", function() {
    var preview = document.getElementById("legal-preview");
    var editor = document.getElementById("legal-editor");
    if (preview.style.display === "none") {
      preview.innerHTML = editor.value;
      preview.style.display = "block";
      this.innerHTML = '<i class="fas fa-edit"></i> Hide preview';
    } else {
      preview.style.display = "none";
      this.innerHTML = '<i class="fas fa-eye"></i> Preview';
    }
  });
}

function changePassword() {
  var currentPw = document.getElementById("settings-current-pw").value;
  var newPw = document.getElementById("settings-new-pw").value;
  var confirmPw = document.getElementById("settings-confirm-pw").value;
  var msgEl = document.getElementById("password-message");
  var btn = document.getElementById("change-password-btn");

  // Validate
  if (!currentPw) {
    showPasswordMsg("Please enter your current password", false);
    return;
  }
  if (!newPw || newPw.length < 4) {
    showPasswordMsg("New password must be at least 4 characters", false);
    return;
  }
  if (newPw !== confirmPw) {
    showPasswordMsg("New passwords do not match", false);
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

  var token = localStorage.getItem("adminToken");
  fetch(API_BASE + "/api/admin/change-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
  })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-lock"></i> Update Password';

      if (data.error) {
        showPasswordMsg(data.error, false);
      } else {
        showPasswordMsg("Password updated successfully!", true);
        document.getElementById("settings-current-pw").value = "";
        document.getElementById("settings-new-pw").value = "";
        document.getElementById("settings-confirm-pw").value = "";
      }
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-lock"></i> Update Password';
      showPasswordMsg("Failed to update password", false);
      console.error(err);
    });
}

function showPasswordMsg(text, isSuccess) {
  var msgEl = document.getElementById("password-message");
  if (!msgEl) return;
  msgEl.style.display = "block";
  msgEl.textContent = text;
  msgEl.className = "settings-message " + (isSuccess ? "settings-msg-success" : "settings-msg-error");
}

function loadEmailSettings() {
  const token = localStorage.getItem("adminToken");
  const statusEl = document.getElementById("email-status");

  fetch("https://salonsindbad-api.duckdns.org/api/admin/settings/email", {
    headers: { Authorization: "Bearer " + token },
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.error) {
        statusEl.textContent = "Error";
        statusEl.className = "settings-status status-error";
        return;
      }

      document.getElementById("settings-email-service").value = data.email_service || "gmail";
      document.getElementById("settings-email-username").value = data.email_username || "";
      document.getElementById("settings-owner-email").value = data.owner_email || "";
      document.getElementById("settings-email-password").placeholder =
        data.has_password ? "Current: " + data.email_password_masked + " (leave empty to keep)" : "Enter app password";

      statusEl.textContent = data.has_password ? "Configured" : "Not configured";
      statusEl.className = "settings-status " + (data.has_password ? "status-ok" : "status-warn");
    })
    .catch((err) => {
      console.error("Error loading email settings:", err);
      statusEl.textContent = "Error";
      statusEl.className = "settings-status status-error";
    });
}

function saveEmailSettings() {
  const token = localStorage.getItem("adminToken");
  const saveBtn = document.getElementById("save-email-settings");
  const msgEl = document.getElementById("settings-message");

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  const body = {
    email_service: document.getElementById("settings-email-service").value,
    email_username: document.getElementById("settings-email-username").value,
    email_password: document.getElementById("settings-email-password").value,
    owner_email: document.getElementById("settings-owner-email").value,
  };

  fetch("https://salonsindbad-api.duckdns.org/api/admin/settings/email", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(body),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.error) {
        showSettingsMessage(msgEl, data.error, "error");
      } else {
        showSettingsMessage(msgEl, "Email settings saved successfully!", "success");
        // Clear the password field and reload to show updated masked password
        document.getElementById("settings-email-password").value = "";
        loadEmailSettings();
      }
    })
    .catch((err) => {
      showSettingsMessage(msgEl, "Failed to save settings: " + err.message, "error");
    })
    .finally(() => {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Settings';
    });
}

function testEmailSettings() {
  const token = localStorage.getItem("adminToken");
  const testBtn = document.getElementById("test-email-settings");
  const msgEl = document.getElementById("settings-message");

  testBtn.disabled = true;
  testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  fetch("https://salonsindbad-api.duckdns.org/api/admin/settings/email/test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({}),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.error) {
        showSettingsMessage(msgEl, "Test failed: " + (data.details || data.error), "error");
      } else {
        showSettingsMessage(msgEl, "Test email sent to " + data.recipient + "!", "success");
        // Update status
        const statusEl = document.getElementById("email-status");
        if (statusEl) {
          statusEl.textContent = "Working";
          statusEl.className = "settings-status status-ok";
        }
      }
    })
    .catch((err) => {
      showSettingsMessage(msgEl, "Test failed: " + err.message, "error");
    })
    .finally(() => {
      testBtn.disabled = false;
      testBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Test Email';
    });
}

function showSettingsMessage(el, message, type) {
  el.style.display = "block";
  el.textContent = message;
  el.className = "settings-message settings-msg-" + type;
  setTimeout(() => {
    el.style.display = "none";
  }, 5000);
}


// ============================================================
// MANAGE SERVICES
// ============================================================

const API_BASE = "https://salonsindbad-api.duckdns.org";

export function displayManageServices() {
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2><i class="fas fa-cut"></i> Manage Services</h2>
      </div>

      <div class="manage-add-card">
        <h3><i class="fas fa-plus-circle"></i> Add New Service</h3>
        <div class="manage-add-form">
          <div class="manage-form-row">
            <div class="form-group">
              <label>Name</label>
              <input type="text" id="new-service-name" class="form-control" placeholder="e.g. Beard Trim">
            </div>
            <div class="form-group">
              <label>Price (kr)</label>
              <input type="number" id="new-service-price" class="form-control" placeholder="100" min="0">
            </div>
            <div class="form-group">
              <label>Duration (min)</label>
              <input type="number" id="new-service-duration" class="form-control" placeholder="30" min="5" step="5">
            </div>
          </div>
          <div class="manage-form-bottom">
            <label class="manage-checkbox">
              <input type="checkbox" id="new-service-main"> Main service
            </label>
            <button class="btn" id="add-service-btn"><i class="fas fa-plus"></i> Add Service</button>
          </div>
        </div>
      </div>

      <div class="manage-list" id="services-list">
        <div class="avail-loading"><i class="fas fa-spinner fa-spin"></i></div>
      </div>
    </div>
  `;

  loadServicesList();

  document.getElementById("add-service-btn").addEventListener("click", function() {
    var name = document.getElementById("new-service-name").value.trim();
    var price = parseFloat(document.getElementById("new-service-price").value);
    var duration = parseInt(document.getElementById("new-service-duration").value) || 30;
    var isMain = document.getElementById("new-service-main").checked;

    if (!name) { alert("Please enter a service name"); return; }
    if (isNaN(price) || price < 0) { alert("Please enter a valid price"); return; }

    var token = localStorage.getItem("adminToken");
    fetch(API_BASE + "/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ service_name: name, price: price, duration: duration, is_main: isMain }),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) { alert(data.error); return; }
        document.getElementById("new-service-name").value = "";
        document.getElementById("new-service-price").value = "";
        document.getElementById("new-service-duration").value = "";
        document.getElementById("new-service-main").checked = false;
        loadServicesList();
      })
      .catch(function(err) { alert("Failed to add service"); console.error(err); });
  });
}

function loadServicesList() {
  var container = document.getElementById("services-list");
  if (!container) return;

  var token = localStorage.getItem("adminToken");
  fetch(API_BASE + "/api/services")
    .then(function(r) { return r.json(); })
    .then(function(services) {
      if (!Array.isArray(services) || services.length === 0) {
        container.innerHTML = '<div class="dash-empty"><i class="fas fa-cut"></i> No services yet</div>';
        return;
      }

      var mainServices = services.filter(function(s) { return s.is_main === 1; });
      var extraServices = services.filter(function(s) { return s.is_main !== 1; });

      var html = "";
      if (mainServices.length > 0) {
        html += '<div class="manage-group-label">Main Services</div>';
        html += mainServices.map(function(s) { return renderServiceItem(s); }).join("");
      }
      if (extraServices.length > 0) {
        html += '<div class="manage-group-label">Extra Services</div>';
        html += extraServices.map(function(s) { return renderServiceItem(s); }).join("");
      }
      container.innerHTML = html;

      // Attach edit/delete handlers
      container.querySelectorAll(".manage-edit-btn").forEach(function(btn) {
        btn.addEventListener("click", function() { editService(btn.dataset.id); });
      });
      container.querySelectorAll(".manage-delete-btn").forEach(function(btn) {
        btn.addEventListener("click", function() { deleteService(btn.dataset.id); });
      });
    })
    .catch(function(err) { console.error("Error loading services:", err); });
}

function renderServiceItem(s) {
  return '<div class="manage-item">' +
    '<div class="manage-item-info">' +
      '<span class="manage-item-name">' + s.service_name + '</span>' +
      '<span class="manage-item-meta">' + s.price + ' kr · ' + (s.duration || 30) + ' min' + (s.is_main ? ' · Main' : '') + '</span>' +
    '</div>' +
    '<div class="manage-item-actions">' +
      '<button class="manage-edit-btn" data-id="' + s.service_id + '" title="Edit"><i class="fas fa-pen"></i></button>' +
      '<button class="manage-delete-btn" data-id="' + s.service_id + '" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
    '</div>' +
  '</div>';
}

function editService(serviceId) {
  fetch(API_BASE + "/api/services")
    .then(function(r) { return r.json(); })
    .then(function(services) {
      var service = services.find(function(s) { return s.service_id == serviceId; });
      if (!service) { alert("Service not found"); return; }

      showEditModal("Edit Service", [
        { label: "Name", id: "edit-svc-name", type: "text", value: service.service_name },
        { label: "Price (kr)", id: "edit-svc-price", type: "number", value: service.price },
        { label: "Duration (min)", id: "edit-svc-duration", type: "number", value: service.duration || 30 },
        { label: "Main service", id: "edit-svc-main", type: "checkbox", value: service.is_main === 1 },
      ], function() {
        var token = localStorage.getItem("adminToken");
        fetch(API_BASE + "/api/services/" + serviceId, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({
            service_name: document.getElementById("edit-svc-name").value.trim(),
            price: parseFloat(document.getElementById("edit-svc-price").value),
            duration: parseInt(document.getElementById("edit-svc-duration").value),
            is_main: document.getElementById("edit-svc-main").checked,
          }),
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { alert(data.error); return; }
            closeEditModal();
            loadServicesList();
          })
          .catch(function(err) { alert("Failed to update service"); });
      });
    });
}

function deleteService(serviceId) {
  if (!confirm("Are you sure you want to delete this service?")) return;
  var token = localStorage.getItem("adminToken");
  fetch(API_BASE + "/api/services/" + serviceId, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) { alert(data.error); return; }
      loadServicesList();
    })
    .catch(function(err) { alert("Failed to delete service"); });
}


// ============================================================
// MANAGE BARBERS
// ============================================================

export function displayManageBarbers() {
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2><i class="fas fa-user-tie"></i> Manage Barbers</h2>
      </div>

      <div class="manage-add-card">
        <h3><i class="fas fa-plus-circle"></i> Add New Barber</h3>
        <div class="manage-add-form">
          <div class="manage-form-row">
            <div class="form-group" style="flex:1;">
              <label>Name</label>
              <input type="text" id="new-barber-name" class="form-control" placeholder="e.g. Ahmed">
            </div>
            <div class="form-group" style="flex:1;">
              <label>Email (optional)</label>
              <input type="email" id="new-barber-email" class="form-control" placeholder="e.g. ahmed@mail.com">
            </div>
          </div>
          <button class="btn" id="add-barber-btn"><i class="fas fa-plus"></i> Add Barber</button>
        </div>
      </div>

      <div class="manage-list" id="barbers-list">
        <div class="avail-loading"><i class="fas fa-spinner fa-spin"></i></div>
      </div>
    </div>
  `;

  loadBarbersList();

  document.getElementById("add-barber-btn").addEventListener("click", function() {
    var name = document.getElementById("new-barber-name").value.trim();
    var email = document.getElementById("new-barber-email").value.trim();
    if (!name) { alert("Please enter a barber name"); return; }

    var token = localStorage.getItem("adminToken");
    fetch(API_BASE + "/api/barbers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ name: name, email: email || null }),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) { alert(data.error); return; }
        document.getElementById("new-barber-name").value = "";
        document.getElementById("new-barber-email").value = "";
        loadBarbersList();
      })
      .catch(function(err) { alert("Failed to add barber"); console.error(err); });
  });
}

function loadBarbersList() {
  var container = document.getElementById("barbers-list");
  if (!container) return;

  fetch(API_BASE + "/api/barbers")
    .then(function(r) { return r.json(); })
    .then(function(barbers) {
      if (!Array.isArray(barbers) || barbers.length === 0) {
        container.innerHTML = '<div class="dash-empty"><i class="fas fa-user-tie"></i> No barbers yet</div>';
        return;
      }

      container.innerHTML = barbers.map(function(b) {
        var emailInfo = b.email ? '<i class="fas fa-envelope" style="color:var(--clr-gold);font-size:0.7rem;margin-right:4px;"></i>' + b.email : '<span style="opacity:0.4;">No email set</span>';
        return '<div class="manage-item">' +
          '<div class="manage-item-info">' +
            '<span class="manage-item-name"><i class="fas fa-user-tie" style="color:var(--clr-gold);margin-right:8px;font-size:0.85rem;"></i>' + b.name + '</span>' +
            '<span class="manage-item-meta">' + emailInfo + '</span>' +
          '</div>' +
          '<div class="manage-item-actions">' +
            '<button class="manage-edit-btn" data-id="' + b.barber_id + '" data-name="' + b.name + '" data-email="' + (b.email || '') + '" title="Edit"><i class="fas fa-pen"></i></button>' +
            '<button class="manage-delete-btn" data-id="' + b.barber_id + '" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
          '</div>' +
        '</div>';
      }).join("");

      container.querySelectorAll(".manage-edit-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
          showEditModal("Edit Barber", [
            { label: "Name", id: "edit-barber-name", type: "text", value: btn.dataset.name },
            { label: "Email", id: "edit-barber-email", type: "email", value: btn.dataset.email },
          ], function() {
            var token = localStorage.getItem("adminToken");
            var newName = document.getElementById("edit-barber-name").value.trim();
            var newEmail = document.getElementById("edit-barber-email").value.trim();
            if (!newName) { alert("Name is required"); return; }
            fetch(API_BASE + "/api/barbers/" + btn.dataset.id, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
              body: JSON.stringify({ name: newName, email: newEmail || null }),
            })
              .then(function(r) { return r.json(); })
              .then(function(data) {
                if (data.error) { alert(data.error); return; }
                closeEditModal();
                loadBarbersList();
              })
              .catch(function(err) { alert("Failed to update barber"); });
          });
        });
      });

      container.querySelectorAll(".manage-delete-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
          if (!confirm("Delete this barber? This will also remove their availability data.")) return;
          var token = localStorage.getItem("adminToken");
          fetch(API_BASE + "/api/barbers/" + btn.dataset.id, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token },
          })
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (data.error) { alert(data.error); return; }
              loadBarbersList();
            })
            .catch(function(err) { alert("Failed to delete barber"); });
        });
      });
    })
    .catch(function(err) { console.error("Error loading barbers:", err); });
}


// ============================================================
// REUSABLE EDIT MODAL
// ============================================================

function showEditModal(title, fields, onSave) {
  // Remove existing modal if any
  closeEditModal();

  var fieldsHtml = fields.map(function(f) {
    if (f.type === "checkbox") {
      return '<label class="manage-checkbox" style="margin:8px 0;">' +
        '<input type="checkbox" id="' + f.id + '"' + (f.value ? ' checked' : '') + '> ' + f.label +
        '</label>';
    }
    return '<div class="form-group">' +
      '<label>' + f.label + '</label>' +
      '<input type="' + f.type + '" id="' + f.id + '" class="form-control" value="' + (f.value || '') + '">' +
      '</div>';
  }).join("");

  var modalHtml = '<div id="edit-modal-overlay" class="edit-modal-overlay">' +
    '<div class="edit-modal-box">' +
      '<div class="edit-modal-header">' +
        '<h3>' + title + '</h3>' +
        '<button class="edit-modal-close" id="edit-modal-close"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="edit-modal-body">' + fieldsHtml + '</div>' +
      '<div class="edit-modal-footer">' +
        '<button class="btn btn-secondary" id="edit-modal-cancel">Cancel</button>' +
        '<button class="btn" id="edit-modal-save"><i class="fas fa-check"></i> Save</button>' +
      '</div>' +
    '</div>' +
  '</div>';

  document.body.insertAdjacentHTML("beforeend", modalHtml);

  document.getElementById("edit-modal-save").addEventListener("click", onSave);
  document.getElementById("edit-modal-cancel").addEventListener("click", closeEditModal);
  document.getElementById("edit-modal-close").addEventListener("click", closeEditModal);
  document.getElementById("edit-modal-overlay").addEventListener("click", function(e) {
    if (e.target === this) closeEditModal();
  });
}

function closeEditModal() {
  var modal = document.getElementById("edit-modal-overlay");
  if (modal) modal.remove();
}


// Utility Functions
function loadContent(contentHtml) {
  document.getElementById("main-content").innerHTML = contentHtml;
}

function fetchData(url, callback) {
  const backendBaseUrl =
    "https://salonsindbad-api.duckdns.org";
  const fullUrl = backendBaseUrl + url;

  fetch(fullUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => callback(data))
    .catch((error) => console.error("Error fetching data:", error));
}