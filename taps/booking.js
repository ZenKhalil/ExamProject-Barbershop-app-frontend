// booking.js — Modern barbershop booking with duration-aware slots
// Flow: pick services → pick date → pick time → fill contact info → book

const SLOT_INTERVAL = 10; // minutes between each slot option
const DAYS_TO_SHOW = 14;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const openingHours = {
  0: null,
  1: { startTime: "10:00", endTime: "18:00" },
  2: { startTime: "10:00", endTime: "18:00" },
  3: { startTime: "10:00", endTime: "18:00" },
  4: { startTime: "10:00", endTime: "18:00" },
  5: { startTime: "10:00", endTime: "18:00" },
  6: { startTime: "10:00", endTime: "15:00" },
};

// State
let selectedDate = null;
let allServices = [];      // full list from API (with duration)
let unavailableDates = [];
let bookedSlots = [];
let formListenerAttached = false;

// ============================================================
// Entry point
// ============================================================

export function loadBookingPage() {
  populateServices();
  populateBarbers();
  setupBookingForm();
  generateDateStrip();

  // Select today by default
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  selectDate(today);
}

// ============================================================
// Services — loaded first, with duration
// ============================================================

function populateServices() {
  fetch("https://examproject-barbershop-app-backend.onrender.com/api/services")
    .then(function (r) { return r.json(); })
    .then(function (services) {
      if (!Array.isArray(services)) throw new Error("Expected array");
      allServices = services;

      populateServiceBubbles(
        services.filter(function (s) { return s.is_main === 1; }),
        "main-services-container",
        true
      );
      populateServiceBubbles(
        services.filter(function (s) { return s.is_main !== 1; }),
        "extra-services-container",
        false
      );
    })
    .catch(function (err) {
      console.error("Error fetching services:", err);
    });
}

function populateServiceBubbles(services, containerId, isMainService) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  if (!Array.isArray(services)) return;

  services.forEach(function (service) {
    var bubble = document.createElement("div");
    bubble.classList.add("service-bubble");
    bubble.dataset.serviceId = service.service_id;
    bubble.dataset.duration = service.duration || 30;
    bubble.dataset.price = service.price || 0;

    // Show name, price and duration
    bubble.innerHTML =
      '<span class="bubble-name">' + service.service_name + '</span>' +
      '<span class="bubble-meta">' + service.price + ' kr · ' + (service.duration || 30) + ' min</span>';

    bubble.addEventListener("click", function () {
      if (isMainService) {
        var selected = container.querySelector(".selected");
        if (selected && selected !== bubble) {
          selected.classList.remove("selected");
        }
      }
      bubble.classList.toggle("selected");
      onServiceSelectionChanged();
    });

    container.appendChild(bubble);
  });
}

// Called every time service selection changes
function onServiceSelectionChanged() {
  var totalDuration = getSelectedDuration();
  var summary = document.getElementById("duration-summary");
  var text = document.getElementById("duration-text");

  if (totalDuration > 0) {
    summary.style.display = "flex";
    text.textContent = "Total: " + totalDuration + " min";
  } else {
    summary.style.display = "none";
  }

  // Re-render time slots with new duration awareness
  if (selectedDate) {
    renderTimeSlots(selectedDate);
  }
}

function getSelectedDuration() {
  var total = 0;

  // Main service
  var main = document.querySelector("#main-services-container .service-bubble.selected");
  if (main) {
    total += parseInt(main.dataset.duration) || 30;
  }

  // Extra services
  document.querySelectorAll("#extra-services-container .service-bubble.selected").forEach(function (b) {
    total += parseInt(b.dataset.duration) || 0;
  });

  return total;
}

function getSelectedServiceIds() {
  var ids = [];

  var main = document.querySelector("#main-services-container .service-bubble.selected");
  if (main) ids.push(main.dataset.serviceId);

  document.querySelectorAll("#extra-services-container .service-bubble.selected").forEach(function (b) {
    ids.push(b.dataset.serviceId);
  });

  return ids;
}

function getSelectedServiceNames() {
  var names = [];

  var main = document.querySelector("#main-services-container .service-bubble.selected");
  if (main) names.push(main.querySelector(".bubble-name").textContent);

  document.querySelectorAll("#extra-services-container .service-bubble.selected").forEach(function (b) {
    names.push(b.querySelector(".bubble-name").textContent);
  });

  return names;
}


// ============================================================
// Date Strip
// ============================================================

function generateDateStrip() {
  var strip = document.getElementById("date-strip");
  if (!strip) return;
  strip.innerHTML = "";

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  for (var i = 0; i < DAYS_TO_SHOW; i++) {
    var date = new Date(today);
    date.setDate(today.getDate() + i);

    var card = document.createElement("button");
    card.className = "date-card";
    card.type = "button";

    var dayOfWeek = date.getDay();
    var isClosed = openingHours[dayOfWeek] === null;

    if (isClosed) {
      card.classList.add("closed");
      card.disabled = true;
    }

    if (i === 0) card.classList.add("today");

    card.innerHTML =
      '<span class="date-card-day">' + DAY_NAMES[dayOfWeek] + '</span>' +
      '<span class="date-card-num">' + date.getDate() + '</span>' +
      '<span class="date-card-month">' + MONTH_NAMES[date.getMonth()] + '</span>';

    card.dataset.date = formatDate(date);

    // Use an IIFE to capture the date correctly
    (function (d) {
      card.addEventListener("click", function () { selectDate(d); });
    })(new Date(date));

    strip.appendChild(card);
  }

  // Scroll nav buttons
  var prevBtn = document.getElementById("date-prev");
  var nextBtn = document.getElementById("date-next");
  if (prevBtn) prevBtn.onclick = function () { strip.scrollBy({ left: -200, behavior: "smooth" }); };
  if (nextBtn) nextBtn.onclick = function () { strip.scrollBy({ left: 200, behavior: "smooth" }); };
}

function selectDate(date) {
  selectedDate = date;
  updateDateStripSelection();
  loadTimeSlotsForDate(date);
}

function updateDateStripSelection() {
  var targetStr = formatDate(selectedDate);
  document.querySelectorAll(".date-card").forEach(function (card) {
    card.classList.toggle("selected", card.dataset.date === targetStr);
  });
}

function updateDateStripAvailability() {
  document.querySelectorAll(".date-card").forEach(function (card) {
    var dateStr = card.dataset.date;
    if (unavailableDates.includes(dateStr) && !card.classList.contains("closed")) {
      card.classList.add("unavailable");
    } else {
      card.classList.remove("unavailable");
    }
  });
}


// ============================================================
// Time Slots — duration-aware
// ============================================================

function loadTimeSlotsForDate(date) {
  var container = document.getElementById("time-slots-container");
  if (!container) return;

  container.innerHTML = '<div class="slots-loading"><i class="fas fa-spinner fa-spin"></i><p>Loading available times...</p></div>';

  var barberId = document.getElementById("barber-select").value;
  if (!barberId) {
    container.innerHTML = '<div class="slots-empty"><p>Please select a barber first</p></div>';
    return;
  }

  var dateStr = formatDate(date);
  var nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  var nextDayStr = formatDate(nextDay);

  Promise.all([
    fetch("https://examproject-barbershop-app-backend.onrender.com/api/barbers/" + barberId + "/unavailable-dates")
      .then(function (r) { return r.json(); }).catch(function () { return []; }),
    fetch("https://examproject-barbershop-app-backend.onrender.com/api/bookings/unavailable-timeslots?barberId=" + barberId + "&start=" + dateStr + "&end=" + nextDayStr)
      .then(function (r) { return r.json(); }).catch(function () { return []; }),
  ]).then(function (results) {
    unavailableDates = results[0] || [];
    bookedSlots = Array.isArray(results[1]) ? results[1] : [];
    updateDateStripAvailability();
    renderTimeSlots(date);
  });
}

function renderTimeSlots(date) {
  var container = document.getElementById("time-slots-container");
  if (!container) return;

  var dayOfWeek = date.getDay();
  var hours = openingHours[dayOfWeek];
  var dateStr = formatDate(date);
  var totalDuration = getSelectedDuration();

  // No services selected yet
  if (totalDuration === 0) {
    container.innerHTML = '<div class="slots-empty"><i class="fas fa-hand-pointer"></i><p>Select your services first to see available times</p></div>';
    return;
  }

  // Closed day
  if (!hours) {
    container.innerHTML = '<div class="slots-empty"><i class="fas fa-door-closed"></i><p>Closed on ' + DAY_NAMES[dayOfWeek] + 's</p></div>';
    return;
  }

  // Barber unavailable
  if (unavailableDates.includes(dateStr)) {
    container.innerHTML = '<div class="slots-empty"><i class="fas fa-calendar-times"></i><p>Barber is unavailable on this day</p></div>';
    return;
  }

  // Generate all possible start times with SLOT_INTERVAL spacing
  var slots = generateSlots(hours.startTime, hours.endTime);
  var now = new Date();
  var closingMinutes = timeToMinutes(hours.endTime);

  var slotData = slots.map(function (time) {
    var slotStart = new Date(date);
    var parts = time.split(":");
    slotStart.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);

    var slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + totalDuration);

    // Slot is in the past (for today)
    var isPast = slotStart < now;

    // Slot + duration would exceed closing time
    var slotEndMinutes = timeToMinutes(time) + totalDuration;
    var exceedsClosing = slotEndMinutes > closingMinutes;

    // Check overlap with any booked slot
    var isBooked = bookedSlots.some(function (booked) {
      var bStart = new Date(booked.start);
      var bEnd = new Date(booked.end);
      return slotStart < bEnd && slotEnd > bStart;
    });

    return {
      time: time,
      isPast: isPast,
      isBooked: isBooked || exceedsClosing,
      exceedsClosing: exceedsClosing
    };
  });

  // Group into morning / afternoon
  var morning = slotData.filter(function (s) { return parseInt(s.time.split(":")[0]) < 12; });
  var afternoon = slotData.filter(function (s) { return parseInt(s.time.split(":")[0]) >= 12; });
  var available = slotData.filter(function (s) { return !s.isPast && !s.isBooked; });

  if (available.length === 0) {
    container.innerHTML = '<div class="slots-empty"><i class="fas fa-calendar-check"></i><p>No available slots for ' + totalDuration + ' min on this day</p></div>';
    return;
  }

  var html = "";
  if (morning.length > 0) html += buildSlotGroup("Morning", morning);
  if (afternoon.length > 0) html += buildSlotGroup("Afternoon", afternoon);

  container.innerHTML = html;

  // Attach click handlers
  container.querySelectorAll(".time-slot:not(.booked):not(.past)").forEach(function (btn) {
    btn.addEventListener("click", function () {
      handleSlotClick(btn.dataset.time);
    });
  });
}

function buildSlotGroup(label, slots) {
  var html = '<div class="slot-group">';
  html += '<h4 class="slot-group-label">' + label + '</h4>';
  html += '<div class="slot-grid">';

  slots.forEach(function (slot) {
    var cls = "time-slot";
    var disabled = "";

    if (slot.isBooked) {
      cls += " booked";
      disabled = "disabled";
    } else if (slot.isPast) {
      cls += " past";
      disabled = "disabled";
    }

    var label = "";
    if (slot.isBooked && !slot.exceedsClosing) label = '<span class="slot-label">Booked</span>';

    html += '<button class="' + cls + '" data-time="' + slot.time + '" type="button" ' + disabled + '>' +
      '<span class="slot-time">' + slot.time + '</span>' +
      label +
      '</button>';
  });

  html += '</div></div>';
  return html;
}

function generateSlots(startTime, endTime) {
  var slots = [];
  var start = timeToMinutes(startTime);
  var end = timeToMinutes(endTime);
  for (var m = start; m < end; m += SLOT_INTERVAL) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

function handleSlotClick(time) {
  var barberSelect = document.getElementById("barber-select");
  if (!barberSelect || !barberSelect.value) {
    alert("Please select a barber first.");
    return;
  }

  if (getSelectedDuration() === 0) {
    alert("Please select at least a main service.");
    return;
  }

  var barberName = barberSelect.options[barberSelect.selectedIndex].text;
  openBookingModal(selectedDate, time, barberName);
}


// ============================================================
// Booking Modal
// ============================================================

function openBookingModal(date, time, barberName) {
  var modal = document.getElementById("booking-modal");
  if (!modal) return;
  modal.classList.add("show");

  var formattedDate = formatDate(date);
  var duration = getSelectedDuration();
  var serviceNames = getSelectedServiceNames();

  // Hidden fields
  var hiddenDate = document.getElementById("hidden-date-field");
  if (hiddenDate) hiddenDate.value = formattedDate;
  var hiddenTime = document.getElementById("hidden-time-field");
  if (hiddenTime) hiddenTime.value = time;

  // Display fields
  var displayDate = document.getElementById("selected-date");
  if (displayDate) displayDate.textContent = DAY_NAMES[date.getDay()] + " " + date.getDate() + " " + MONTH_NAMES[date.getMonth()];
  var displayTime = document.getElementById("selected-time");
  if (displayTime) displayTime.textContent = time + " (" + duration + " min)";
  var displayBarber = document.getElementById("selected-barber");
  if (displayBarber) displayBarber.textContent = barberName;

  // Services summary in modal
  var summaryEl = document.getElementById("selected-services-summary");
  if (summaryEl) {
    summaryEl.innerHTML = '<div class="modal-services-list">' +
      serviceNames.map(function (n) { return '<span class="modal-service-tag">' + n + '</span>'; }).join("") +
      '</div>';
  }
}

window.closeModal = function () {
  var modal = document.getElementById("booking-modal");
  if (modal) modal.classList.remove("show");
};

window.addEventListener("click", function (event) {
  var modal = document.getElementById("booking-modal");
  if (!modal) return;
  if (event.target === modal) closeModal();
});


// ============================================================
// Barbers
// ============================================================

function populateBarbers() {
  fetch("https://examproject-barbershop-app-backend.onrender.com/api/barbers")
    .then(function (r) { return r.json(); })
    .then(function (barbers) {
      var select = document.getElementById("barber-select");
      if (!select) return;

      select.innerHTML = barbers.map(function (b) {
        return '<option value="' + b.barber_id + '">' + b.name + '</option>';
      }).join("");

      select.addEventListener("change", function () {
        if (selectedDate) loadTimeSlotsForDate(selectedDate);
      });

      if (barbers.length > 0 && selectedDate) {
        loadTimeSlotsForDate(selectedDate);
      }
    })
    .catch(function (err) { console.error("Error fetching barbers:", err); });
}

function handleBarberChange() {
  if (selectedDate) loadTimeSlotsForDate(selectedDate);
}


// ============================================================
// Booking Form Submission
// ============================================================

function setupBookingForm() {
  var form = document.getElementById("booking-form");
  if (form && !formListenerAttached) {
    form.addEventListener("submit", handleBookingSubmit);
    formListenerAttached = true;
  }
}

async function handleBookingSubmit(event) {
  event.preventDefault();

  var submitBtn = event.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
  }

  var serviceIds = getSelectedServiceIds();
  if (serviceIds.length === 0) {
    alert("Please select at least a main service.");
    resetSubmitButton(submitBtn);
    return;
  }

  var bookingData = {
    customer_name: event.target.elements["customer_name"].value.trim(),
    customer_email: event.target.elements["customer_email"].value.trim(),
    customer_phone: event.target.elements["customer_phone"].value.trim(),
    barber_id: document.getElementById("barber-select").value,
    booking_date: document.getElementById("hidden-date-field").value,
    booking_time: document.getElementById("hidden-time-field").value,
    services: serviceIds,
  };

  // Validate
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.customer_email)) {
    alert("Please enter a valid email address.");
    resetSubmitButton(submitBtn);
    return;
  }
  if (!/^\d{8,15}$/.test(bookingData.customer_phone)) {
    alert("Please enter a valid phone number.");
    resetSubmitButton(submitBtn);
    return;
  }

  try {
    var response = await fetch("https://examproject-barbershop-app-backend.onrender.com/api/bookings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    var data = await response.json();

    if (response.ok) {
      alert(data.message);
      closeModal();
      clearModalContent();
      // Wait a moment for backend to commit, then refresh slots
      setTimeout(function () {
        if (selectedDate) loadTimeSlotsForDate(selectedDate);
      }, 500);
    } else {
      alert("Booking failed: " + data.message);
    }
  } catch (err) {
    console.error("Error creating booking:", err);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    resetSubmitButton(submitBtn);
  }
}

function resetSubmitButton(btn) {
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm Booking';
  }
}

function clearModalContent() {
  var modal = document.getElementById("booking-modal");
  if (!modal) return;
  modal.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]')
    .forEach(function (input) { input.value = ""; });
}


// ============================================================
// Utilities
// ============================================================

function formatDate(date) {
  var y = date.getFullYear();
  var m = ("0" + (date.getMonth() + 1)).slice(-2);
  var d = ("0" + date.getDate()).slice(-2);
  return y + "-" + m + "-" + d;
}

function timeToMinutes(timeStr) {
  var parts = timeStr.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function minutesToTime(minutes) {
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  return ("0" + h).slice(-2) + ":" + ("0" + m).slice(-2);
}

// Stubs for backward compatibility
function initializeCalendar() {}
function handleDateClick() {}

// ============================================================
// Exports
// ============================================================

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