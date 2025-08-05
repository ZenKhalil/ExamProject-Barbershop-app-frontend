import { Calendar } from "@fullcalendar/core";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// Declare calendar as a global variable
let calendar;

const openingHours = {
  0: null, // Sunday - closed
  1: { startTime: "10:00", endTime: "18:00" }, // Monday
  2: { startTime: "10:00", endTime: "18:00" }, // Tuesday
  3: { startTime: "10:00", endTime: "18:00" }, // Wednesday
  4: { startTime: "10:00", endTime: "18:00" }, // Thursday
  5: { startTime: "10:00", endTime: "18:00" }, // Friday
  6: { startTime: "10:00", endTime: "15:00" }, // Saturday
};

// Load the booking page with necessary setup
export function loadBookingPage() {
  if (calendar) {
    calendar.destroy(); // Destroy the previous calendar instance
  }
  // Initialize calendar and other components
  populateServices();
  populateBarbers();
  setupBookingForm();
  initializeCalendar();
}

// Initialize the calendar with weekly view and business hours
function initializeCalendar() {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) {
    console.error("Calendar element not found!");
    return;
  }

  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - currentDayOfWeek);

  calendar = new Calendar(calendarEl, {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: window.innerWidth <= 768 ? "timeGridDay" : "timeGridWeek",
    headerToolbar: {
      left: window.innerWidth <= 768 ? "prev,next today" : "prev,next today", // Show on both mobile and desktop
      center: "title",
      right: "", // Always empty - never show buttons on right side
    },

    // Add custom button handlers to prevent past navigation
    customButtons: {
      prev: {
        click: function () {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Calculate what the previous view would be
          const currentStart = new Date(calendar.view.activeStart);
          let prevStart;

          if (calendar.view.type === "timeGridWeek") {
            prevStart = new Date(currentStart);
            prevStart.setDate(currentStart.getDate() - 7);
          } else if (calendar.view.type === "timeGridDay") {
            prevStart = new Date(currentStart);
            prevStart.setDate(currentStart.getDate() - 1);
          }

          // Only allow navigation if the previous view wouldn't show past dates
          if (prevStart && prevStart.getTime() >= today.getTime()) {
            calendar.prev();
          }
        },
      },
      next: {
        click: function () {
          calendar.next();
        },
      },
    },

    slotDuration: "00:10:00",
    slotLabelInterval: "00:15",
    allDaySlot: false,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5, 6],
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
    slotMaxTime: "18:00",

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
        fetchUnavailableTimeslotsForCurrentView(barberId);
        fetchUnavailableTimesForBarber(barberId);
      }
      disablePrevButtonIfNeeded();
    },

    // Prevent navigation to past dates entirely
    validRange: {
      start: today, // This prevents any navigation to dates before today
    },

    eventSources: [
      {
        events: function (info, successCallback, failureCallback) {
          var events = [];
          var startDate = new Date(info.start.valueOf());
          var endDate = new Date(info.end.valueOf());

          while (startDate < endDate) {
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
                  23,
                  59
                ),
                rendering: "background",
                color: "#cccccc",
              });
            }

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
  const nextButton = document.querySelector(".fc-next-button");
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today

  // Get the start date of the current view
  const viewStart = new Date(calendar.view.activeStart);
  const viewEnd = new Date(calendar.view.activeEnd);

  // Disable the previous button if the view start date is today or in the past
  if (prevButton) {
    prevButton.disabled = viewStart.getTime() <= today.getTime();
  }

  // For the next button, we want to prevent going to a view that would show past dates
  // This is more complex and depends on your business requirements
  // For now, let's ensure we don't navigate to views that start before today
  if (nextButton) {
    // Calculate what the next view would show
    const currentView = calendar.view;
    let nextViewStart;

    if (currentView.type === "timeGridWeek") {
      nextViewStart = new Date(viewStart);
      nextViewStart.setDate(viewStart.getDate() + 7);
    } else if (currentView.type === "timeGridDay") {
      nextViewStart = new Date(viewStart);
      nextViewStart.setDate(viewStart.getDate() + 1);
    }

    // Don't disable next button - users should be able to go forward
    // But you might want to add logic here if needed
    nextButton.disabled = false;
  }
}

function fetchUnavailableTimeslotsForCurrentView(barberId) {
  if (!barberId) {
    console.warn("No barber selected.");
    return;
  }

  // Fetch unavailable dates and add them to the calendar
  fetch(
    `https://examproject-barbershop-app-backend.onrender.com/api/barbers/${barberId}/unavailable-dates`
  )
    .then((response) => response.json())
    .then((unavailableDates) => {
      // Clear previous unavailable dates
      calendar.getEvents().forEach((event) => {
        if (event.title === "Unavailable" && event.allDay) {
          event.remove();
        }
      });

      // Add new unavailable dates
      unavailableDates.forEach((dateStr) => {
        calendar.addEvent({
          title: "Unavailable",
          start: dateStr,
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
    formatDate(view.activeStart),
    formatDate(view.activeEnd),
    barberId
  );
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

function fetchUnavailableTimeslotsForPeriod(start, end, barberId) {
  // Fetch unavailable timeslots for the barber in the given period
  fetch(
    `https://examproject-barbershop-app-backend.onrender.com/api/bookings/unavailable-timeslots?barberId=${barberId}&start=${start}&end=${end}`
  )
    .then((response) => response.json())
    .then((bookedSlots) => {
      console.log("bookedSlots:", bookedSlots); // Add this line
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
          color: "rgb(158 60 60)",
          extendedProps: { isUnavailable: true },
        });
      });
    })
    .catch((error) =>
      console.error("Error fetching unavailable timeslots:", error)
    );
}

var renderedUnavailableDates = new Set();

function fetchUnavailableTimesForBarber(barberId) {
  if (!barberId) {
    console.error("Error! No barber selected or the value is undefined");
    return;
  }

  // We'll store the rendered dates in a set to prevent double rendering
  const renderedDates = new Set();

  fetch(
    `https://examproject-barbershop-app-backend.onrender.com/api/barbers/${barberId}/unavailable-dates`
  )
    .then((response) => response.json())
    .then((unavailableDates) => {
      // Add new unavailable dates
      unavailableDates.forEach((date) => {
        const dateTime = parseDateString(date);
        const day = dateTime.getDay();
        const { startTime, endTime } = openingHours[day] || {};

        if (startTime && endTime) {
          const [startHour, startMinute] = startTime.split(":").map(Number);
          const [endHour, endMinute] = endTime.split(":").map(Number);

          const startDateTime = new Date(
            dateTime.getFullYear(),
            dateTime.getMonth(),
            dateTime.getDate(),
            startHour,
            startMinute
          );

          const endDateTime = new Date(
            dateTime.getFullYear(),
            dateTime.getMonth(),
            dateTime.getDate(),
            endHour,
            endMinute
          );

          // Check if the event is already rendered
          if (!renderedUnavailableDates.has(date)) {
            renderedUnavailableDates.add(date);

            calendar.addEvent({
              title: "Unavailable",
              start: startDateTime,
              end: endDateTime,
              rendering: "background",
              color: "rgb(118 129 141)",
            });
          }
        }
      });
    })
    .catch((error) =>
      console.error("An error has occurred fetching barber dates", error)
    );
}

function parseDateString(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function onBarberChange() {
  const barberSelect = document.getElementById("barber-select");
  const newBarberId = barberSelect.value;

  clearUnavailableEvents();
  renderedUnavailableDates.clear();
  fetchUnavailableTimesForBarber(newBarberId);
}

function clearUnavailableEvents() {
  const events = calendar.getEvents();
  events.forEach((event) => {
    if (["Unavailable", "Booked"].includes(event.title)) {
      event.remove();
    }
  });
  renderedUnavailableDates.clear();
}

// Attach this function to the barber-select change event
document
  .getElementById("barber-select")
  .addEventListener("change", onBarberChange);

// Populate barbers from the API
function populateBarbers() {
  fetch("https://examproject-barbershop-app-backend.onrender.com/api/barbers")
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
        fetchUnavailableTimesForBarber(barbers[0].barber_id);
      }

      // Change event to update timeslots when a new barber is selected
      barberSelect.addEventListener("change", function () {
        fetchUnavailableTimeslotsForCurrentView(this.value);
        fetchUnavailableTimesForBarber(this.value);
      });
    })
    .catch((error) => console.error("Error fetching barbers:", error));
}

// Populate service bubbles from the API
function populateServices() {
  fetch("https://examproject-barbershop-app-backend.onrender.com/api/services")
    .then((response) => response.json())
    .then((services) => {
      if (!Array.isArray(services)) {
        throw new Error("Expected services to be an array");
      }
      // Now that we have the services, populate the bubbles.
      populateServiceBubbles(
        services.filter((s) => s.is_main === 1),
        "main-services-container", // Updated ID
        true
      );
      populateServiceBubbles(
        services.filter((s) => s.is_main !== 1),
        "extra-services-container", // Updated ID
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

  fetchUnavailableTimesForBarber(barberId);
  fetchUnavailableTimeslotsForCurrentView(barberId);

  // Use the calendar instance directly without getApi()
  fetchUnavailableTimeslotsForPeriod(
    calendar.view.activeStart,
    calendar.view.activeEnd
  );
}

// Handle date click on the calendar
function handleDateClick(info) {
  // Check if the clicked day is a closed day
  if (isClosedDay(info.date)) {
    onsole.error("handleDateClick called without valid info object");
    alert("The barber shop is closed on this day.");
    return; // Do nothing more
  }

  // Check if a barber is selected in the main barber select dropdown
  const barberSelect = document.getElementById("barber-select");
  if (!barberSelect.value) {
    alert("Please select a barber first.");
    return;
  }

  const selectedDate = info.date;
  const formattedDate = selectedDate.toISOString().split("T")[0];
  const selectedTime = selectedDate
    .toTimeString()
    .split(" ")[0]
    .substring(0, 5);
  const selectedBarberName =
    barberSelect.options[barberSelect.selectedIndex].text;

  openBookingModal(selectedDate, selectedTime, selectedBarberName);

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
  if (displayDateField) displayDateField.textContent = `Date: ${formattedDate}`;

  const displayTimeField = modal.querySelector("#selected-time");
  if (displayTimeField) displayTimeField.textContent = `Time: ${selectedTime}`;

  // Display the selected barber's name in the modal
  const displayBarberField = modal.querySelector("#selected-barber");
  if (displayBarberField)
    displayBarberField.textContent = `Barber: ${selectedBarberName}`;
}

function isClosedDay(date) {
  const dayOfWeek = date.getDay();
  const hour = date.getHours();

  // Check if it's Sunday (day 0)
  if (dayOfWeek === 0) {
    return true; // Closed all day on Sundays
  }

  // Check if it's Saturday (day 6) and the time is 15:00 or later
  if (dayOfWeek === 6 && hour >= 15) {
    return true; // Closed on Saturdays from 15:00
  }

  return false; // Open at all other times
}

// Close the modal if clicked outside of the modal content
window.onclick = function (event) {
  const modal = document.getElementById("booking-modal");
  // Check if modal is not null
  if (!modal) return;

  const modalContent = modal.querySelector(".modal-content");
  // Check if modalContent is not null
  if (!modalContent) return;

  if (event.target === modal && !modalContent.contains(event.target)) {
    closeModal();
  }
};

window.closeModal = function () {
  const modal = document.getElementById("booking-modal");
  if (modal) {
    modal.classList.remove("show");
  }
};

// Handle booking form submission
async function handleBookingSubmit(event) {
  event.preventDefault();

  // Disable the submit button to prevent multiple submissions
  const submitButton = event.target.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Booking...";
  }

  // Get selected main service ID
  const selectedMainServiceBubble = document.querySelector(
    "#main-service-options .service-bubble.selected"
  );
  const mainServiceId = selectedMainServiceBubble
    ? selectedMainServiceBubble.dataset.serviceId
    : null;

  if (!mainServiceId) {
    alert("Please select a main service.");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Book Now";
    }
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
    customer_name: event.target.elements["customer_name"].value.trim(),
    customer_email: event.target.elements["customer_email"].value.trim(),
    customer_phone: event.target.elements["customer_phone"].value.trim(),
    barber_id: document.getElementById("barber-select").value,
    booking_date: document.getElementById("hidden-date-field").value,
    booking_time: document.getElementById("hidden-time-field").value,
    services: [mainServiceId, ...extraServiceIds], // Combine main and extra service IDs
  };

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(bookingData.customer_email)) {
    alert("Please enter a valid email address.");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Book Now";
    }
    return;
  }

  // Optionally, validate phone number format
  const phoneRegex = /^\d{10,15}$/; // Adjust as needed
  if (!phoneRegex.test(bookingData.customer_phone)) {
    alert("Please enter a valid phone number.");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Book Now";
    }
    return;
  }

  // Submit the booking data
  try {
    const response = await fetch(
      "https://examproject-barbershop-app-backend.onrender.com/api/bookings/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      // Close the modal
      closeModal();
      // Clear the modal content here
      clearModalContent();
      // Update the calendar view dynamically without reloading the page
      //updateCalendarView(data.bookingId); // Implement this function as needed
      // Reload the entire page
      location.reload();
    } else {
      // Display specific error message from backend
      alert(`Booking failed: ${data.message}`);
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    alert("An unexpected error occurred. Please try again later.");
  } finally {
    // Re-enable the submit button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Book Now";
    }
  }
}

function clearModalContent() {
  // Reset all input fields in the modal
  const modal = document.getElementById("booking-modal");
  if (!modal) return;

  const inputs = modal.querySelectorAll(
    'input[type="text"], input[type="email"], input[type="tel"]'
  );
  inputs.forEach((input) => (input.value = ""));

  // Unselect all service bubbles
  const serviceBubbles = modal.querySelectorAll(".service-bubble.selected");
  serviceBubbles.forEach((bubble) => bubble.classList.remove("selected"));

  // Reset any other dynamic elements in the modal as needed
  // For example, if you have any specific messages or dynamic content, reset them here
}
// Make sure to call this function to initialize the form handling
document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBookingSubmit);
  }
});

function openBookingModal(selectedDate, selectedTime, selectedBarberName) {
  const modal = document.getElementById("booking-modal");
  if (modal) {
    console.log("Opening booking modal..."); // Add this line
    modal.classList.add("show");

    // Populate hidden input fields or display fields in the modal
    const formattedDate = selectedDate.toISOString().split("T")[0];

    const hiddenDateField = modal.querySelector("#hidden-date-field");
    if (hiddenDateField) hiddenDateField.value = formattedDate;

    const hiddenTimeField = modal.querySelector("#hidden-time-field");
    if (hiddenTimeField) hiddenTimeField.value = selectedTime;

    // Update the selected date and time display in the modal
    const displayDateField = modal.querySelector("#selected-date");
    if (displayDateField)
      displayDateField.textContent = `Date: ${formattedDate}`;

    const displayTimeField = modal.querySelector("#selected-time");
    if (displayTimeField)
      displayTimeField.textContent = `Time: ${selectedTime}`;

    // Display the selected barber's name in the modal
    const displayBarberField = modal.querySelector("#selected-barber");
    if (displayBarberField)
      displayBarberField.textContent = `Barber: ${selectedBarberName}`;
  } else {
    console.error("Booking modal not found!");
  }
}

function populateServiceBubbles(services, containerId, isMainService) {
  const container = document.getElementById(containerId);
  // Clear existing content
  container.innerHTML = "";

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
  openBookingModal,
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
