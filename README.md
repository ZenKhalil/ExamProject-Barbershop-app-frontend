# Barbershop App Frontend

Welcome to the frontend repository of the Barbershop application, a modern platform for booking barber appointments and managing barber services.

## Installation and Local Setup

1.  Clone the Repository: Use `git clone` to clone this repository to your local machine.

2.  Install Dependencies: In the project directory, run `npm install` to install all dependencies.

3.  Start the Application: Execute `npm start` to launch the app, which should open in your default web browser.

4.  Accessing the App: The app will be accessible at `http://localhost:1234` or the specified port in your terminal.

## Technologies Used

- HTML/CSS/JavaScript: Fundamental technologies for frontend development.
- Parcel: A web application bundler for efficient asset management.
- Node.js: Essential for dependency management.
- FullCalendar: For managing booking calendars.
- Flatpickr: A library for date picking functionalities.

## Features

- Service Viewing: Customers can explore various services offered.
- Booking Appointments: Users can book appointments with their preferred barber.
- Price List: A comprehensive list of services and their prices.
- Admin Panel: A dedicated section for admins to manage bookings and services.

## Detailed Overview

The admin panel of the Barbershop app frontend, as defined in `admin/admin.js`, offers a range of functionalities for administrative users. Here's an overview of what the admin can see and do:

### Admin Login

- Login Functionality: Admins can log in using their credentials. Upon successful login, a token is stored in `localStorage`, indicating an active admin session.
- Login Modal: A modal for admin login is displayed, where admins can enter their username and password.

### Admin Dashboard

- Dashboard Access: Once logged in, the admin gains access to the dashboard.
- Dashboard Features:
  - View Bookings: Admins can view all bookings. They can sort bookings by date and filter them by barber.
  - Edit Availabilities: This option allows admins to manage barber availability, including adding and removing unavailable dates.
  - Update Opening Hours: While the specific implementation isn't detailed in the provided code, this option allows admins to update the barbershop's operating hours.

### Booking Management

- Viewing Bookings: Admins can view a list of all bookings, with details like customer name, email, phone, preferred haircut, date, time, and the assigned barber.
- Sorting and Filtering: Bookings can be sorted by date and filtered based on the barber.

### Barber Availability Management

- Managing Barber Schedules: Admins can add or remove unavailability dates for barbers, allowing them to manage the barbers' schedules effectively.
- Editing Availability: Admins can select a barber and set or remove their unavailable dates. They can also update existing unavailability periods.

### Logout Functionality

- Logging Out: Admins can log out, which clears the stored admin token and refreshes the page, effectively ending the admin session.

### Additional Functionalities

- Dynamic Content Loading: The admin panel dynamically loads content based on the selected options, ensuring a seamless user experience.
- Responsive Design: The admin panel is styled to be responsive, providing a consistent experience across different devices.

This admin panel provides comprehensive control over the booking and scheduling aspects of the barbershop, making it a crucial part of the application for administrative tasks.

### Booking Page Initialization

- Load Booking Page: When the booking page is loaded, it initializes the calendar, populates services and barbers, and sets up the booking form.

### Calendar Functionality

- Initialize Calendar: The app uses FullCalendar with time grid and interaction plugins. The calendar displays business hours and allows customers to click on a date and time for booking.
- Business Hours: The calendar is configured to show business hours for each day of the week.
- Date Selection: Customers can click on a specific date and time slot in the calendar to initiate a booking.

### Barber Selection

- Populate Barbers: The dropdown for selecting a barber is populated with options fetched from the backend.
- Change Event: When a barber is selected, the calendar updates to reflect the selected barber's availability.

### Service Selection

- Populate Services: Services are categorized into main and extra services. Customers can select one main service and multiple extra services for their booking.
- Service Bubbles: Services are displayed as clickable bubbles. Selecting a service bubble updates the booking form with the chosen services.

### Booking Form

- Setup Booking Form: The booking form captures customer details like name, email, phone, and selected services.
- Submit Booking: When the form is submitted, the booking data, including customer details and selected services, are sent to the backend to create a booking.

### Handling Date Click

- Selecting a Time Slot: When a customer clicks on a date and time slot, a modal is displayed with the selected date, time, and barber. The customer can then proceed to fill out the booking form.

### Handling Store Closed Hours

-   Business Hours Configuration: The calendar is configured with business hours for each day of the week. This setup prevents customers from selecting time slots outside of these hours.
-   Dynamic Calendar Updates: The calendar updates dynamically to reflect the specific opening and closing times for each day, including any special hours for weekends.

### Preventing Booking During Already Booked Times

-   Fetching Booked Slots: The script fetches booked time slots for the selected barber from the backend.
-   Calendar Event Marking: Booked time slots are marked on the calendar as events, typically colored differently (e.g., red) to indicate that they are unavailable.
-   Disabling Selection: Customers cannot select these marked time slots as they are already booked.

### Handling Unavailable Barber (Illness, Vacation)

-   Fetching Barber Unavailability: The system fetches dates when barbers are unavailable (due to illness, vacation, or other reasons) from the backend.
-   Marking Unavailable Dates: These dates are then marked on the calendar, similar to how booked slots are marked.
-   Preventing Selection: These marked dates are made non-selectable, ensuring customers cannot book appointments with barbers who are not available.

### Additional Considerations

-   Real-Time Updates: The system should ideally update in real-time or have a mechanism to refresh availability data regularly to ensure accuracy.
-   Clear Indications: The calendar should clearly indicate different states (available, booked, unavailable) for ease of understanding by the customer.
-   Fallbacks and Notifications: In case of any issues with fetching data or unexpected closures, the system should notify the customer appropriately or provide fallback options.

### Additional Functionalities

- Dynamic Content Loading: The content (barbers, services, calendar) is dynamically loaded based on user interactions.
- Responsive Design: The booking interface is designed to be user-friendly and responsive across different devices.

### Main Application

- Index HTML (`index.html`): The main entry point of the application. It structures the web page and links to various stylesheets and scripts.
- Main Script (`script.js`): Orchestrates the overall functionality of the application, including navigation between different sections and loading specific page content.
- Stylesheet (`style.css`): Provides the primary styling for the application, ensuring a consistent and appealing user interface.

### Functional Modules

- Booking (`taps/booking.js`): Manages the booking functionality, including calendar integration and appointment handling.
- Services (`taps/services.js`): Deals with displaying services, price lists, and handling admin functionalities related to services.

## Contributing

Contributions are welcome! Please fork this repository and submit pull requests for any enhancements.
