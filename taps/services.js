document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");
  setupPriceListModal();
});

// Function to toggle modal display
function toggleModal(displayState) {
  const modal = document.getElementById("priceListModal");
  modal.style.display = displayState ? "flex" : "none";
  if (displayState) {
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
  }
}

// Set up the modal once the document has loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");
  setupPriceListModal();
});

function setupPriceListModal() {
  // Attach event listener for price list button
  document.getElementById("priceListButton").addEventListener("click", function () {
    toggleModal(true); // Show the modal
    loadPriceList(); // Load the price list when opening the modal
  });

  // Attach event listener for close button inside the modal
  document.querySelector(".close-button-pricelist").addEventListener("click", function () {
    toggleModal(false); // Hide the modal
  });

  // Close the modal if clicking outside of it
  window.addEventListener("click", function (event) {
    const modal = document.getElementById("priceListModal");
    if (event.target === modal) {
      toggleModal(false); // Hide the modal
    }
  });
}

function loadPriceList() {
  fetch("http://localhost:3000/api/services")
    .then((response) => response.json())
    .then((services) => {
      const priceListHtml = services
        .map(
          (service) => `
        <div class="service">
          <h3>${service.service_name}</h3>
          <p>Price: ${service.price} kr</p>
        </div>
      `
        )
        .join("");
      document.getElementById("modal-price-list").innerHTML = priceListHtml;
    })
    .catch((error) => console.error("Error fetching services:", error));
}

// Function to populate service options in a select dropdown
function populateServices(selectElementId) {
  fetch("http://localhost:3000/api/services")
    .then((response) => response.json())
    .then((services) => {
      const selectElement = document.getElementById(selectElementId);
      selectElement.innerHTML = services
        .map(
          (service) =>
            `<option value="${service.service_id}">${service.service_name} - $${service.price}</option>`
        )
        .join("");
    })
    .catch((error) => console.error("Error fetching services:", error));
}

function adminButtons(serviceId) {
  if (isAdminLoggedIn()) {
    return `
      <button onclick="editService(${serviceId})">Edit</button>
      <button onclick="deleteService(${serviceId})">Delete</button>
    `;
  }
  return "";
}

function isAdminLoggedIn() {
  const token = localStorage.getItem("adminToken");
  return token != null;
}

function deleteService(serviceId) {
  if (!confirm("Are you sure you want to delete this service?")) return;

  fetch(`http://localhost:3000/api/services/${serviceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        alert("Service deleted successfully");
        loadPriceList(); // Reload the price list to reflect the changes
      } else {
        alert("Failed to delete service");
      }
    })
    .catch((error) => console.error("Error deleting service:", error));
}

function editService(serviceId) {
  const newName = prompt("Enter the new service name:");
  const newPrice = prompt("Enter the new service price:");

  fetch(`http://localhost:3000/api/services/${serviceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
    body: JSON.stringify({ service_name: newName, price: newPrice }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert(data.message);
        loadPriceList(); // Reload the price list to reflect the changes
      }
    })
    .catch((error) => console.error("Error updating service:", error));
}

export default {
  loadPriceList,
  toggleModal,
  setupPriceListModal,
  populateServices,
  adminButtons,
  isAdminLoggedIn,
  deleteService,
  editService,
};
