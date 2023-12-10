import { Calendar } from "@fullcalendar/core";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// Declare calendar as a global variable
let calendar;

// Load the booking page with necessary setup
function loadBookingPage() {
  initializeCalendar();
  populateServices();
  populateBarbers();
  setupBookingForm();
}

// Initialize the calendar with weekly view and business hours
function initializeCalendar() {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return;

    // Define the opening hours for each day of the week
    const openingHours = {
      // Sunday - closed all day
      1: { startTime: "10:00", endTime: "18:00" }, // Monday
      2: { startTime: "10:00", endTime: "18:00" }, // Tuesday
      3: { startTime: "10:00", endTime: "18:00" }, // Wednesday
      4: { startTime: "10:00", endTime: "18:00" }, // Thursday
      5: { startTime: "10:00", endTime: "18:00" }, // Friday
      6: { startTime: "10:00", endTime: "15:00" }, // Saturday
    };

    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - currentDayOfWeek);

    calendar = new Calendar(calendarEl, {
      plugins: [timeGridPlugin, interactionPlugin],
      initialView: "timeGridWeek",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "timeGridWeek,timeGridDay",
      },
      slotDuration: "00:10:00",
      slotLabelInterval: "00:15",
      allDaySlot: false,
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday to Saturday
        startTime: "10:00",
        endTime: "18:00",
      },
      slotLabelFormat: {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
      dateClick: handleDateClick,
      slotMinTime: "10:00",
      slotMaxTime: "18:00", // Adjust this for Saturday if needed
      slotLabelContent: (arg) => {
        const dayOfWeek = arg.date.getDay();
        const { startTime, endTime } = openingHours[dayOfWeek] || {};
        if (startTime && endTime) {
          const slotTime = arg.text;
          if (slotTime >= startTime && slotTime < endTime) {
            return arg.text;
          }
        }
        return "";
      },
      firstDay: currentDayOfWeek,
      datesSet: function (dateInfo) {
        const barberSelect = document.getElementById("barber-select");
        const barberId = barberSelect.value;
        if (barberId) {
          fetchUnavailableTimeslotsForPeriod(
            dateInfo.startStr,
            dateInfo.endStr,
            barberId
          );
        }
        disablePrevButtonIfNeeded();
      },
      eventSources: [
        {
          events: function (info, successCallback, failureCallback) {
            var events = [];
            var startDate = new Date(info.start.valueOf());
            var endDate = new Date(info.end.valueOf());

            while (startDate < endDate) {
              // Saturday partial closure
              if (startDate.getDay() === 6) {
                events.push({
                  title: "Closed",
                  start: new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate(),
                    15,
                    0
                  ),
                  end: new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate(),
                    18,
                    0
                  ),
                  rendering: "background",
                  color: "#cccccc",
                });
              }
              // Sunday full day closure
              if (startDate.getDay() === 0) {
                events.push({
                  title: "Closed",
                  start: new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate()
                  ),
                  end: new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate() + 1
                  ),
                  rendering: "background",
                  color: "#cccccc",
                });
              }
              startDate.setDate(startDate.getDate() + 1);
            }

            successCallback(events);
          },
        },
      ],
    });

    calendar.render();
    
}

function disablePrevButtonIfNeeded() {
  const prevButton = document.querySelector(".fc-prev-button");
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today

  // Get the start date of the current view
  const viewStart = new Date(calendar.view.activeStart);

  // Disable the previous button if the view start date is today or in the past
  prevButton.disabled = viewStart.getTime() <= today.getTime();
}



function fetchUnavailableTimeslotsForCurrentView(barberId) {
  if (!barberId) {
    console.warn("No barber selected.");
    return;
  }

  // Fetch unavailable dates and add them to the calendar
  fetch(`http://localhost:3000/api/barbers/${barberId}/unavailable-dates`)
    .then((response) => response.json())
    .then((unavailableDates) => {
      // Clear previous unavailable dates
      calendar.getEvents().forEach((event) => {
        if (event.title === "Unavailable" && event.allDay) {
          event.remove();
        }
      });

      // Add new unavailable dates
      unavailableDates.forEach((date) => {
        calendar.addEvent({
          title: "Unavailable",
          start: date,
          allDay: true,
          color: "grey",
        });
      });
    })
    .catch((error) =>
      console.error("Error fetching unavailable dates:", error)
    );

  // Fetch unavailable time slots based on the current view
  const view = calendar.view;
  fetchUnavailableTimeslotsForPeriod(
    view.activeStart.toISOString().split("T")[0],
    view.activeEnd.toISOString().split("T")[0],
    barberId
  );
}

function fetchUnavailableTimeslotsForPeriod(start, end, barberId) {

  // Fetch unavailable timeslots for the barber in the given period
  fetch(
    `http://localhost:3000/api/bookings/unavailable-timeslots?barberId=${barberId}&start=${start}&end=${end}`
  )
    .then((response) => response.json())
    .then((bookedSlots) => {
      if (!Array.isArray(bookedSlots)) {
        return;
      }
      // Clear out any existing 'unavailable' events
      let existingEvents = calendar.getEvents();
      existingEvents.forEach((event) => {
        if (event.extendedProps.isUnavailable) {
          event.remove();
        }
      });

      // Add new events for each booked slot
      bookedSlots.forEach((slot) => {
        calendar.addEvent({
          title: "Booked",
          start: slot.start,
          end: slot.end,
          allDay: false,
          color: "red",
          extendedProps: { isUnavailable: true },
        });
      });
    })
    .catch((error) =>
      console.error("Error fetching unavailable timeslots:", error)
    );
}

function fetchUnavailableTimesForBarber() {
  
}

// Populate service bubbles from the API
function populateServices() {
  fetch("http://localhost:3000/api/services")
    .then((response) => response.json())
    .then((services) => {
      if (!Array.isArray(services)) {
        throw new Error("Expected services to be an array");
      }
      // Now that we have the services, populate the bubbles.
      populateServiceBubbles(
        services.filter((s) => s.is_main === 1),
        "main-service-options",
        true
      );
      populateServiceBubbles(
        services.filter((s) => s.is_main !== 1),
        "extra-service-options",
        false
      );
    })
    .catch((error) => console.error("Error fetching services:", error));
}

document.querySelectorAll(".service-button").forEach((button) => {
  button.addEventListener("click", () => {
    // For radio buttons, unselect all first
    if (button.querySelector('input[type="radio"]')) {
      document
        .querySelectorAll(".service-button.selected")
        .forEach((selectedButton) => {
          selectedButton.classList.remove("selected");
        });
    }

    // Toggle 'selected' class
    button.classList.toggle("selected");

    // Check the input inside this button
    button.querySelector("input").checked =
      button.classList.contains("selected");
  });
});

// Populate barbers from the API
function populateBarbers() {
  fetch("http://localhost:3000/api/barbers")
    .then((response) => response.json())
    .then((barbers) => {
      const barberSelect = document.getElementById("barber-select");
      barberSelect.innerHTML = barbers
        .map(
          (barber) =>
            `<option value="${barber.barber_id}">${barber.name}</option>`
        )
        .join("");

      // Set an initial barber value and fetch their timeslots
      if (barbers.length > 0) {
        barberSelect.value = barbers[0].barber_id;
        fetchUnavailableTimeslotsForCurrentView(barbers[0].barber_id);
      }

      // Change event to update timeslots when a new barber is selected
      barberSelect.addEventListener("change", function () {
        fetchUnavailableTimeslotsForCurrentView(this.value);
      });
    })
    .catch((error) => console.error("Error fetching barbers:", error));
}


// Setup the booking form with event listeners
function setupBookingForm() {
  // This function might be called when the modal is opened
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBookingSubmit);
  }

  const barberSelect = document.getElementById("barber-select");
  if (barberSelect) {
    barberSelect.addEventListener("change", handleBarberChange);
  }
}

function handleBarberChange() {
  const barberId = this.value || document.getElementById("barber-select").value;
  if (!barberId) {
    console.warn("No barber selected.");
    return;
  }

  fetchUnavailableTimeslotsForCurrentView(barberId);

  // Use the calendar instance directly without getApi()
  fetchUnavailableTimeslotsForPeriod(
    calendar.view.activeStart,
    calendar.view.activeEnd
  );
}

// Handle date click on the calendar
function handleDateClick(info) {
    // Check if a barber is selected in the main barber select dropdown
    const barberSelect = document.getElementById("barber-select");
    if (!barberSelect.value) {
        alert("Please select a barber first.");
        return;
    }

    const selectedDate = info.date;
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const selectedTime = selectedDate.toTimeString().split(" ")[0].substring(0, 5);
    const selectedBarberName = barberSelect.options[barberSelect.selectedIndex].text;

    // Show the modal
    const modal = document.getElementById("booking-modal");
    modal.classList.remove("hidden");

    // Populate hidden input fields or display fields in the modal
    const hiddenDateField = modal.querySelector("#hidden-date-field");
    if (hiddenDateField) hiddenDateField.value = formattedDate;

    const hiddenTimeField = modal.querySelector("#hidden-time-field");
    if (hiddenTimeField) hiddenTimeField.value = selectedTime;

    // Update the selected date and time display in the modal
    const displayDateField = modal.querySelector("#selected-date");
    if (displayDateField) displayDateField.textContent = `Selected Date: ${formattedDate}`;

    const displayTimeField = modal.querySelector("#selected-time");
    if (displayTimeField) displayTimeField.textContent = `Selected Time: ${selectedTime}`;

    // Display the selected barber's name in the modal
    const displayBarberField = modal.querySelector("#selected-barber");
    if (displayBarberField) displayBarberField.textContent = `Selected Barber: ${selectedBarberName}`;

}

// Close the modal if clicked outside of the modal content
window.onclick = function (event) {
  const modal = document.getElementById("booking-modal");
  const modalContent = modal.querySelector(".modal-content");

  if (event.target === modal && !modalContent.contains(event.target)) {
    closeModal();
  }
};

window.closeModal = function () {
  const modal = document.getElementById("booking-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
};

// Handle booking form submission
function handleBookingSubmit(event) {
  event.preventDefault();

  // Get selected main service ID
  const selectedMainServiceBubble = document.querySelector(
    "#main-service-options .service-bubble.selected"
  );
  const mainServiceId = selectedMainServiceBubble
    ? selectedMainServiceBubble.dataset.serviceId
    : null;

  if (!mainServiceId) {
    alert("Please select a main service.");
    return; // Stop the form submission if no main service is selected
  }

  // Get selected extra services IDs
  const selectedExtraServiceBubbles = document.querySelectorAll(
    "#extra-service-options .service-bubble.selected"
  );
  const extraServiceIds = Array.from(selectedExtraServiceBubbles).map(
    (bubble) => bubble.dataset.serviceId
  );

  // Compile the booking data
  const bookingData = {
    customer_name: event.target.elements["customer_name"].value,
    customer_email: event.target.elements["customer_email"].value,
    customer_phone: event.target.elements["customer_phone"].value,
    barber_id: document.getElementById("barber-select").value,
    booking_date: document.getElementById("hidden-date-field").value,
    booking_time: document.getElementById("hidden-time-field").value,
    services: [mainServiceId, ...extraServiceIds], // Combine main and extra service IDs
  };

  // Submit the booking data
  fetch("http://localhost:3000/api/bookings/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.message) {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error("Error creating booking:", error);
      alert("Failed to create booking");
    });
}

// Make sure to call this function to initialize the form handling
document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBookingSubmit);
  }
});

function populateServiceBubbles(services, containerId, isMainService) {
  const container = document.getElementById(containerId);
  // Clear existing content
  container.innerHTML = '';

  // Ensure services is an array before trying to iterate over it
  if (Array.isArray(services)) {
    services.forEach((service) => {
      // Create a div for each service
      const bubble = document.createElement("div");
      bubble.classList.add("service-bubble");
      bubble.textContent = service.service_name;
      bubble.dataset.serviceId = service.service_id;

      // Handle click event
      bubble.addEventListener("click", function () {
        if (isMainService) {
          // Deselect all other main service bubbles
          const selected = container.querySelector(".selected");
          if (selected) {
            selected.classList.remove("selected");
          }
        }
        // Toggle the selected class
        bubble.classList.toggle("selected");
      });

      container.appendChild(bubble);
    });
  } else {
    console.error(
      "populateServiceBubbles was called with a non-array services argument:",
      services
    );
  }
}

export default {
  loadBookingPage,
  populateServices,
  populateBarbers,
  setupBookingForm,
  handleBarberChange,
  initializeCalendar,
  handleDateClick,
  handleBookingSubmit,
  populateServiceBubbles,
};
