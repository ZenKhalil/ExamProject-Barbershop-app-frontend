let barbersData = {};
populateBarbers();

export const adminFunctions = {
  "dashboard-section": loadAdminDashboard,
  "view-bookings-section": viewBookings,
  "edit-availabilities-section": displayEditAvailabilityForm,
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
          adminFunctions[sectionId]();
        }
      });
    });
}

// Expose functions for admin.js if needed
export function generateAdminNavBar() {
  const navBar = document.getElementById("main-nav");
  if (!navBar) {
    console.error("Main navigation (nav#main-nav) not found.");
    return;
  }

  // Update the main navigation with admin links
  navBar.innerHTML = `
        <ul>
            <li><a href="#dashboard-section" id="dashboard-link"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
            <li><a href="#view-bookings-section" id="view-bookings-link"><i class="fas fa-calendar-check"></i> View Bookings</a></li>
            <li><a href="#edit-availabilities-section" id="edit-availabilities-link"><i class="fas fa-edit"></i> Edit Availabilities</a></li>
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
        <li><a href="#view-bookings-section">View Bookings</a></li>
        <li><a href="#edit-availabilities-section">Edit Availabilities</a></li>
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
    // Admin is logged in, adjust UI accordingly
    generateAdminNavBar();
    adminLoginButton.textContent = "Logout";
    adminLoginButton.onclick = logoutAdmin;
  } else {
    // Admin is not logged in
    adminLoginButton.textContent = "Staff Login";
    adminLoginButton.onclick = showAdminLoginModal;
  }

  // Check if the admin is already logged in
  checkAdminLoginStatus();

  // Show the modal
  adminLoginButton.addEventListener("click", function () {
    adminLoginModal.style.display = "block";
  });

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
      console.log("Logged in successfully");
      adminLoginModal.style.display = "none"; // Hide the modal
      displayLoginSuccessMessage(); // Display a success message
      loadAdminDashboard(); // Load the admin dashboard after successful login
      adminLoginButton.textContent = "Logout"; // Change button text to "Logout"
      adminLoginButton.onclick = logoutAdmin; // Change the button's click event to the logout function
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Login failed: Invalid credentials");
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
        return '<div class="dash-booking-row">' +
          '<span class="dash-time">' + (b.booking_time || "—") + '</span>' +
          '<span class="dash-customer">' + b.customer_name + '</span>' +
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
          html += '<div class="dash-booking-row">' +
            '<span class="dash-time">' + (b.booking_time || "—") + '</span>' +
            '<span class="dash-customer">' + b.customer_name + '</span>' +
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

  // Fetch bookings
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

      // Render default view (today)
      renderDashView("today");
    })
    .catch(function(err) {
      console.error("Error loading dashboard:", err);
      var content = document.getElementById("dash-content");
      if (content) content.innerHTML = '<div class="dash-empty">Could not load bookings</div>';
    });

  // Fetch days off for all barbers
  fetch("https://salonsindbad-api.duckdns.org/api/barbers", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function(r) { return r.json(); })
    .then(function(barbers) {
      if (!Array.isArray(barbers)) return;
      var totalDaysOff = 0;
      var pending = barbers.length;

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
    .catch(function() {});
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

  // Populate the filter dropdown with barbers
  populateFilterBarbers();

  // Fetch and display bookings
  fetchBookingsAndDisplay();

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
        <div class="booking-detail"><i class="fas fa-clock"></i> ${booking.booking_time}</div>
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
function populateFilterBarbers() {
  fetch("https://salonsindbad-api.duckdns.org/api/barbers", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  })
    .then((response) => response.json())
    .then((barbers) => {
      const barberFilterSelect = document.getElementById("filter-barber");
      // Clear existing options first, keeping only the "All Barbers" option
      barberFilterSelect.innerHTML = '<option value="all">All Barbers</option>';

      // Add new barber options
      barbers.forEach((barber) => {
        const option = document.createElement("option");
        option.value = barber.barber_id;
        option.textContent = barber.name;
        barberFilterSelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching barbers:", error));
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

      <div class="settings-card">
        <div class="settings-card-header">
          <h3><i class="fas fa-envelope"></i> Email Configuration</h3>
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
    </div>
  `;

  // Load current settings
  loadEmailSettings();

  // Attach event listeners
  document.getElementById("save-email-settings").addEventListener("click", saveEmailSettings);
  document.getElementById("test-email-settings").addEventListener("click", testEmailSettings);
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