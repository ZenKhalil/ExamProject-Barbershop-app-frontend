let barbersData = {};
populateBarbers();

document.addEventListener("DOMContentLoaded", function () {
  const adminLoginButton = document.getElementById("admin-login-button");
  const adminLoginModal = document.getElementById("admin-login-modal");
  const closeButton = adminLoginModal.querySelector(".close-button-admin");
  const adminLoginForm = document.getElementById("admin-login-form");
  const adminToken = localStorage.getItem("adminToken");

   if (adminToken) {
    // Admin is logged in, adjust UI accordingly
    window.generateAdminNavBar();
    adminLoginButton.textContent = "Logout";
    adminLoginButton.onclick = logoutAdmin; 
  } else {
    // Admin is not logged in
    adminLoginButton.textContent = "Admin Login";
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

  fetch("http://localhost:3000/api/admin/login", {
    // Adjust the URL as per your API endpoint
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
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
    window.generateAdminNavBar();
    adminLoginButton.textContent = "Logout";
    adminLoginButton.onclick = logoutAdmin; 
  } else {
    // Admin is not logged in
    adminLoginButton.textContent = "Admin Login";
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

window.setupAdminNavBarListeners = function() {
  document.getElementById("dashboard-link").addEventListener("click", (e) => {
    e.preventDefault();
    loadAdminDashboard();
  });

  document.getElementById("view-bookings-link").addEventListener("click", (e) => {
      e.preventDefault();
      viewBookings();
    });

  document.getElementById("edit-availabilities-link").addEventListener("click", (e) => {  e.preventDefault();  displayEditAvailabilityForm();
    });

  document.getElementById("admin-logout-link").addEventListener("click", (e) => {
      e.preventDefault();
      logoutAdmin();
    });
};

/* Admin dashboard */

function loadAdminDashboard() {
  // Call the function to generate the admin navigation bar
  generateAdminNavBar();

  const dashboardHtml = `
    <div class="dashboard-container">
      <h2>Admin Dashboard</h2>
      <div class="dashboard-card" id="view-bookings-btn">View Bookings</div>
      <div class="dashboard-card" id="edit-availabilities-btn">Edit Availabilities</div>
      <div class="dashboard-card" id="update-opening-hours-btn">Update Opening Hours</div>
      <!-- Add more dashboard cards as needed -->
    </div>
  `;

  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = dashboardHtml;
  // Attach event listeners after adding the buttons to the DOM
  document
    .getElementById("view-bookings-btn")
    .addEventListener("click", viewBookings);
  document
    .getElementById("edit-availabilities-btn")
    .addEventListener("click", displayEditAvailabilityForm);
  // Uncomment and implement these functions if needed
  // document.getElementById("update-opening-hours-btn").addEventListener("click", updateOpeningHours);
  // document.getElementById("logout-btn").addEventListener("click", logoutAdmin);
}


// Define viewBookings, editAvailabilities, updateOpeningHours, and logoutAdmin functions as per your functionality requirements.

function viewBookings() {
  // Create the sorting and filtering UI
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = `
    <div class="sort-filter-container">
      <div class="sort-filter-section">
        <label for="sort-bookings">Sort by:</label>
        <select id="sort-bookings">
          <option value="dateAsc">Date Ascending</option>
          <option value="dateDesc">Date Descending</option>
        </select>
      </div>
      <div class="sort-filter-section">
        <label for="filter-barber">Filter by Barber:</label>
        <select id="filter-barber">
          <option value="all">All Barbers</option>
          <!-- Barber options will be populated -->
        </select>
      </div>
    </div>
    <ul id="bookings-list" class="booking-list"></ul>
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

function fetchBookingsAndDisplay() {
  fetch("http://localhost:3000/api/bookings", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  })
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
      <div class="booking-detail"><strong>Customer Name:</strong> ${booking.customer_name}</div>
      <div class="booking-detail"><strong>Email:</strong> ${booking.customer_email}</div>
      <div class="booking-detail"><strong>Phone:</strong> ${booking.customer_phone}</div>
      <div class="booking-detail"><strong>Preferred Haircut:</strong> ${booking.preferred_haircut}</div>
      <div class="booking-detail"><strong>Date:</strong> ${formattedDate}</div>
      <div class="booking-detail"><strong>Time:</strong> ${booking.booking_time}</div>
      <div class="booking-detail"><strong>Barber:</strong> ${barberName}</div>
    `;
    bookingsList.appendChild(listItem);
  });
}

// Populate filter dropdown with barber options
function populateFilterBarbers() {
  fetch("http://localhost:3000/api/barbers", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  })
    .then((response) => response.json())
    .then((barbers) => {
      const barberFilterSelect = document.getElementById("filter-barber");
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
  fetch("http://localhost:3000/api/barbers")
    .then((response) => response.json())
    .then((barbers) => {
      const availabilitiesSection = document.createElement("section");
      availabilitiesSection.innerHTML = "<h2>Barber Availabilities</h2>";

      barbers.forEach((barber) => {
        const barberDiv = document.createElement("div");
        barberDiv.innerHTML = `<h3>Barber ${barber.id}</h3>`;
        fetch(`http://localhost:3000/api/barbers/${barber.id}/availability`)
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

function displayEditAvailabilityForm() {
  const formHtml = `
    <h3>Barber Schedule Management</h3>
    <form id="edit-availability-form" class="availability-form">
      <!-- Select Barber Dropdown -->
      <div class="form-group">
        <label for="barber-select">Barber:</label>
        <select id="barber-select" class="barber-select form-control"></select>
      </div>
      
      <!-- Add Unavailability Section -->
      <div class="form-group">
        <label for="unavailable-start-date">Start of Unavailability:</label>
        <input type="date" id="unavailable-start-date" class="form-control">
      </div>
      <div class="form-group">
        <label for="unavailable-end-date">End of Unavailability:</label>
        <input type="date" id="unavailable-end-date" class="form-control">
      </div>
      <div class="form-actions">
        <button type="button" id="add-unavailability-btn" class="btn">Mark as Unavailable</button>
        <button type="button" id="show-change-dates-modal" class="btn">Change Dates</button>
        <button type="button" id="remove-unavailability-btn" class="btn">Remove Unavailability</button>
      </div>
      
      <!-- Hidden Inputs for Existing Unavailability -->
      <input type="hidden" id="old-start-date" value="">
      <input type="hidden" id="old-end-date" value="">

      <!-- Modal for Changing Dates -->
      <div id="change-dates-modal" class="modal hidden">
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h4>Select Unavailability to Change</h4>
          <div id="current-unavailabilities-container"></div>
          <div class="form-group">
            <label for="new-start-date">New Start Date:</label>
            <input type="date" id="new-start-date" class="form-control">
          </div>
          <div class="form-group">
            <label for="new-end-date">New End Date:</label>
            <input type="date" id="new-end-date" class="form-control">
          </div>
          <button type="button" id="submit-change-dates" class="btn">Submit Changes</button>
        </div>
      </div>
    </form>
  `;

  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = formHtml;
  populateBarbers();

  document
    .getElementById("add-unavailability-btn")
    .addEventListener("click", createBarberAvailability);
  document
    .getElementById("remove-unavailability-btn")
    .addEventListener("click", deleteBarberAvailability);
  document
    .getElementById("show-change-dates-modal")
    .addEventListener("click", () => {
      const barberId = document.getElementById("barber-select").value;
      if (barberId) {
        fetchCurrentUnavailabilities(barberId);
        document
          .getElementById("change-dates-modal")
          .classList.remove("hidden");
      }
    });

  document
    .getElementById("submit-change-dates")
    .addEventListener("click", () => {
      updateBarberAvailability();
    });

  // Add event listener to close the modal
  document.querySelector(".close-modal").addEventListener("click", () => {
    document.getElementById("change-dates-modal").classList.add("hidden");
  });
}


function createBarberAvailability() {
  const barberId = document.getElementById("barber-select").value;
  const startDate = document.getElementById("unavailable-start-date").value;
  const endDate =
    document.getElementById("unavailable-end-date").value || startDate;
  fetch(`http://localhost:3000/api/barbers/${barberId}/unavailable-dates`, {
    method: "POST", // or "POST" if you're creating new availability
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
    body: JSON.stringify({
      start_date: startDate,
      end_date: endDate,
    }),
  })
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
  fetch(`http://localhost:3000/api/barbers/${barberId}/unavailable-dates`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  })
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

  fetch(`http://localhost:3000/api/barbers/${barberId}/unavailable-dates`, {
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
  })
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
  fetch(`http://localhost:3000/api/barbers/${barberId}/unavailable-dates`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
    body: JSON.stringify({ start_date: startDate, end_date: endDate }),
  })
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

// Populate barbers from the API
function populateBarbers() {
  fetch("http://localhost:3000/api/barbers", {
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

// Utility Functions
function loadContent(contentHtml) {
  document.getElementById("main-content").innerHTML = contentHtml;
}

function fetchData(url, callback) {
  const backendBaseUrl = "http://localhost:3000";
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
