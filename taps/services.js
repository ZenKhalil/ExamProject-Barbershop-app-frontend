// DOMContentLoaded listeners
document.addEventListener("DOMContentLoaded", function () {
    setupPriceListModal();
});

// Function to toggle modal display
function toggleModal(displayState) {
    const modal = document.getElementById("priceListModal");
    if (modal) {
        modal.style.display = displayState ? "flex" : "none";
        if (displayState) {
            modal.style.justifyContent = "center";
            modal.style.alignItems = "center";
        }
    } else {
        console.error("Price List Modal element not found");
    }
}

// Function to open the Price List Modal
export function openPriceListModal() {
    loadPriceList(); // Ensure the price list is loaded
    toggleModal(true); // Show the modal
}

// Set up the modal once the document has loaded
function setupPriceListModal() {
    // Add event listener for opening the modal (linked to the price list button)
    const priceListButton = document.getElementById("priceListButton");
    if (priceListButton) {
        priceListButton.addEventListener("click", function (event) {
            // Prevent the click event from bubbling up
            event.stopPropagation(); 
            openPriceListModal();
        });
    } else {
        console.error("Price List Button not found");
    }

    const closeButton = document.querySelector(".close-button-pricelist");
    if (closeButton) {
        closeButton.addEventListener("click", function () {
            toggleModal(false); // Hide the modal
        });
    } else {
        console.error("Close button for Price List modal not found");
    }

    // Close the modal if clicking outside of it
    window.addEventListener("click", function (event) {
        const modal = document.getElementById("priceListModal");
        if (event.target === modal) {
            toggleModal(false); // Hide the modal
        }
    });
}

// Function to load the price list from the server
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
            const modalPriceList = document.getElementById("modal-price-list");
            if (modalPriceList) {
                modalPriceList.innerHTML = priceListHtml;
            } else {
                console.error("Modal Price List element not found");
            }
        })
        .catch((error) => console.error("Error fetching services:", error));
}


// Function to populate service options in a select dropdown
function populateServices(selectElementId) {
  fetch("http://localhost:3000/api/services")
    .then((response) => response.json())
    .then((services) => {
      const selectElement = document.getElementById(selectElementId);
      if (selectElement) {
        selectElement.innerHTML = services
          .map(
            (service) =>
              `<option value="${service.service_id}">${service.service_name} - $${service.price}</option>`
          )
          .join("");
      } else {
        console.error(`Select element with id ${selectElementId} not found`);
      }
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
  openPriceListModal,
  loadPriceList,
  toggleModal,
  setupPriceListModal,
  populateServices,
  adminButtons,
  isAdminLoggedIn,
  deleteService,
  editService,
};
