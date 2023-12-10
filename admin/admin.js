document.addEventListener("DOMContentLoaded", function () {
  const adminLoginButton = document.getElementById("admin-login-button");
  const adminLoginModal = document.getElementById("admin-login-modal");
  const closeButton = adminLoginModal.querySelector(".close-button-admin");
  const adminLoginForm = document.getElementById("admin-login-form");

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
      loadAdminDashboard(); // Load the admin dashboard after successful login
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Login failed: Invalid credentials");
    });
}

function loadAdminDashboard() {
  const dashboardHtml = `
    <h2>Admin Dashboard</h2>
    <button id="view-bookings-btn">View Bookings</button>
    <button id="edit-availabilities-btn">Edit Availabilities</button>
    <button id="update-opening-hours-btn">Update Opening Hours</button>
    <button id="logout-btn">Logout</button>
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
  document
    .getElementById("update-opening-hours-btn")
    .addEventListener("click", updateOpeningHours);
  document.getElementById("logout-btn").addEventListener("click", logoutAdmin);
}

// Define viewBookings, editAvailabilities, updateOpeningHours, and logoutAdmin functions as per your functionality requirements.

function viewBookings() {
  console.log("Fetching bookings...");

  fetch("http://localhost:3000/api/bookings", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  })
    .then((response) => response.json())
    .then((bookings) => {
      const bookingsList = document.createElement("ul");
      bookingsList.className = "booking-list";

      bookings.forEach((booking) => {
        const listItem = document.createElement("li");
        listItem.className = "booking-list-item";
        listItem.innerHTML = `
                <div class="booking-detail"><strong>Customer Name:</strong> ${booking.customer_name}</div>
                <div class="booking-detail"><strong>Email:</strong> ${booking.customer_email}</div>
                <div class="booking-detail"><strong>Phone:</strong> ${booking.customer_phone}</div>
                <div class="booking-detail"><strong>Preferred Haircut:</strong> ${booking.preferred_haircut}</div>
                <div class="booking-detail"><strong>Date:</strong> ${booking.booking_date}</div>
                <div class="booking-detail"><strong>Time:</strong> ${booking.booking_time}</div>
                <div class="booking-detail"><strong>Barber ID:</strong> ${booking.barber_id}</div>
            `;
        bookingsList.appendChild(listItem);
      });

      const mainContent = document.getElementById("main-content");
      mainContent.innerHTML = "";
      mainContent.appendChild(bookingsList);
    })
    .catch((error) => console.error("Error fetching bookings:", error));
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
    <h3>Edit Barber Availability</h3>
    <form id="edit-availability-form">
      <label for="barber-select-admin">Select Barber:</label>
      <select id="barber-select-admin"></select>
      <label for="unavailable-start-date">Unavailable Start Date:</label>
      <input type="date" id="unavailable-start-date">
      <label for="unavailable-end-date">Unavailable End Date:</label>
      <input type="date" id="unavailable-end-date">
      <div class="buttons">
        <button type="button" id="create-availability-btn">Create Availability</button>
        <button type="button" id="update-availability-btn">Update Availability</button>
        <button type="button" id="delete-availability-btn">Delete Availability</button>
      </div>
    </form>
  `;
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = formHtml;
  populateBarbers(); // Populate the select dropdown with barber options

  document
    .getElementById("create-availability-btn")
    .addEventListener("click", createBarberAvailability);
  document
    .getElementById("update-availability-btn")
    .addEventListener("click", updateBarberAvailability);
  document
    .getElementById("delete-availability-btn")
    .addEventListener("click", deleteBarberAvailability);
}

function createBarberAvailability() {
      const barberId = document.getElementById("barber-select-admin").value;
      const startDate = document.getElementById("unavailable-start-date").value;
      const endDate = document.getElementById("unavailable-end-date").value || startDate;
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


function updateBarberAvailability() {
  const barberId = document.getElementById("barber-select-admin").value;
  const startDate = document.getElementById("unavailable-start-date").value;
  const endDate = document.getElementById("unavailable-end-date").value || startDate; // Use single date if end date is not provided
  fetch(`http://localhost:3000/api/barbers/${barberId}/unavailable-dates`, {
    method: "PUT", // or "POST" if you're creating new availability
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
    body: JSON.stringify({
      start_date: startDate,
      end_date: endDate,
      new_date: startDate, // If updating, use the date to which availability should change
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

function deleteBarberAvailability() {
  const barberId = document.getElementById("barber-select-admin").value;
  const startDate = document.getElementById("unavailable-start-date").value;
  const endDate = document.getElementById("unavailable-end-date").value || startDate; // Use single date if end date is not provided
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
      const barberSelect = document.getElementById("barber-select-admin");
      barberSelect.innerHTML = ""; // Clear existing options

      barbers.forEach((barber) => {
        const option = document.createElement("option");
        option.value = barber.barber_id;
        option.textContent = `${barber.name}`; // Assuming 'name' is a property
        barberSelect.appendChild(option);
      });

      // Additional logic if needed when a new barber is selected
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

