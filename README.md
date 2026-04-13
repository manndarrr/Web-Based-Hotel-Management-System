<div align="center">
  <h1>Web-Based Hotel Management System</h1>
  <p><strong>Integrated Staff Operations Portal | Real-time Inventory | Business Analytics</strong></p>
</div>

---

## Project Overview
This **Web-Based Hotel Management System** is a centralized administrative hub designed to streamline hospitality operations. It replaces manual logging with a digital ecosystem that tracks everything from guest orders to back-end inventory replenishment, ensuring a seamless flow between staff departments.

### Intelligence-Driven Operations
Unlike standard booking systems, this portal integrates **Recharts** to provide live visual analytics. It empowers management to monitor revenue trends, room occupancy rates, and inventory health at a glance, turning raw operational data into actionable business insights.

---

## Key Modules & Features
* **Multi-Tab Staff Dashboard:** A unified interface for real-time tracking of food orders, room service requests, and guest queries.
* **Inventory Management:** Automated stock level monitoring with replenishment alerts to prevent shortages.
* **Performance Analytics:** Interactive charts for revenue monitoring, occupancy trends, and peak-hour analysis.
* **Secure Authentication:** Robust staff login system to ensure data privacy and role-based access control.
* **Live Room Status:** Instant visual updates on room availability, maintenance, and checkout status.

---

## Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React (Vite) / Tailwind CSS |
| **Backend** | Flask (Python) / RESTful APIs |
| **Database** | SQLite / SQLAlchemy |
| **Visualizations** | Recharts (D3-based React charts) |
| **Auth** | Secure Session-based Authentication |

---

## Impact & Efficiency
* **Inventory Accuracy:** Reduced manual counting errors through real-time digital stock tracking.
* **Decision Making:** Provided management with visual trends to optimize staffing and purchasing during peak seasons.
* **Response Time:** Streamlined communication between front-desk and kitchen/housekeeping staff.

---

## Dashboard Overview

### Home
The Home page serves as the entry point of the Hotel Management System, providing users with a visually rich and intuitive interface. It highlights the brand identity, showcases premium services, and offers quick navigation options such as “Explore Destinations” and “Discover Hotels.” The page is designed to enhance user engagement through attractive visuals and clear call-to-action buttons, guiding users seamlessly into the booking workflow.
<p align="center">
  <img src="Overview/Dashboard.png" width="850" title="Admin Portal Overview"> 
</p>

---

### Destinations
The Destinations page showcases various travel locations such as Srinagar, Goa, Jaipur, Kerala, and Agra. Each destination is represented with high-quality images and brief descriptions to provide users with an overview of the location. This module enables users to explore different regions and acts as the starting point for location-based hotel discovery and booking within the system.
<p align="center">
  <img src="Overview/Destinations.png" width="850" title="Admin Portal Overview"> 
</p>

### Hotels
The Hotels page displays a collection of available hotels across multiple locations in a structured card-based layout. Each card includes hotel images, descriptions, ratings, and navigation options to view rooms. This page acts as an intermediate layer between destination selection and room booking, helping users compare and choose hotels based on preferences and location.
<p align="center">
  <img src="Overview/Hotels.png" width="850" title="Admin Portal Overview"> 
</p>

### Choose Your Room
The “Choose Your Room” page allows users to view and select from different room categories such as Deluxe, Executive Suite, and Royal Suite. Each room is presented with pricing, amenities, and a booking option. This module ensures a smooth decision-making process by clearly displaying available options and enabling direct booking, thereby connecting the user interface with backend room availability logic.
<p align="center">
  <img src="Overview/ChooseYourRoom.png" width="850" title="Admin Portal Overview"> 
</p>

### Room Booking
The Room Booking page enables users to finalize their reservation by selecting check-in and check-out dates along with the number of guests and rooms. It also displays selected room information such as type, price, and location. This page acts as a critical step in the booking workflow, collecting user inputs and validating availability before confirming the reservation.
<p align="center">
  <img src="Overview/BookRooms.png" width="850" title="Admin Portal Overview"> 
</p>

### Book Your Stay
The Book Your Stay page provides a centralized form where users can initiate the booking process by selecting a location, room type, dates, and guest details. It serves as the primary input interface connecting user preferences with backend booking logic. The structured layout ensures ease of use and accurate data collection for processing reservations.
<p align="center">
  <img src="Overview/BookNow.png" width="850" title="Admin Portal Overview"> 
</p>

### Sign Up
The Sign Up page allows new users to create an account or login if account already exist by providing personal details such as name, email, phone number, and password. It also includes an option for quick authentication using Google. This module ensures secure user onboarding and enables personalized services like booking history tracking and profile management.
<p align="center">
  <img src="Overview/SignUp.png" width="850" title="Admin Portal Overview"> 
</p>

---

## Employee Dashboard Overview

### Bookings
The Bookings module allows staff to monitor and manage all customer reservations in real time. It displays booking details such as guest information, room type, stay duration, and status (Pending, Booked, Active, Completed). Employees can accept or reject booking requests, activate stays, and mark them as completed, ensuring efficient reservation handling and operational control.
<p align="center">
  <img src="Overview/Bookings.png" width="850" title="Admin Portal Overview"> 
</p>

### Customer Data
The Customer Data module provides a structured view of guests with active or recent stays. It includes details such as room allocation, total bill, outstanding amount, and payment status. This feature enables staff to track customer financials, manage payments, and maintain accurate billing records within the system.
<p align="center">
  <img src="Overview/CustomerData.png" width="850" title="Admin Portal Overview"> 
</p>

### Rooms
The Rooms module displays all available rooms categorized by type and location. Each room is represented with its number, price, and availability status (Available/Active). This module helps staff efficiently allocate rooms, monitor occupancy, and manage hotel capacity in real time.
<p align="center">
  <img src="Overview/Rooms.png" width="850" title="Admin Portal Overview"> 
</p>

### Food Orders
The Food Orders module tracks all in-room dining requests made by guests. It displays order details, items purchased, total bill, and payment status. This feature allows staff to monitor food service operations, manage billing, and calculate total revenue generated from dining services.
<p align="center">
  <img src="Overview/FoodOrders.png" width="850" title="Admin Portal Overview"> 
</p>

### Cost Queries
The Cost Queries module manages additional service requests such as extra beds, room cleaning, or extended stays. Staff can review, accept, or reject these requests, and approved costs are automatically added to the customer’s bill. This ensures transparency and efficient handling of additional service charges.
<p align="center">
  <img src="Overview/CostQueries.png" width="850" title="Admin Portal Overview"> 
</p>

### Inventory
The Inventory module tracks stock levels of kitchen and operational items such as grains, vegetables, dairy, and meat. It highlights low-stock items through alerts, helping staff maintain optimal inventory levels. This module ensures smooth hotel operations by preventing shortages and enabling timely restocking.
<p align="center">
  <img src="Overview/Inventory.png" width="850" title="Admin Portal Overview"> 
</p>

### Analytics
The Analytics module provides data-driven insights into hotel operations using visualizations such as charts and graphs. It includes metrics like total orders, revenue, cuisine distribution, and demand trends. Additionally, the predictive engine forecasts future demand and identifies stock-out risks, enabling smarter decision-making and efficient resource planning.
<p align="center">
  <img src="Overview/Analytics.png" width="850" title="Admin Portal Overview"> 
</p>

---

## Customer Profile Overview

### Personal Information
The Personal Information module allows users to view their basic profile details such as full name, email address, and phone number. It provides a centralized section for managing personal data, ensuring easy access and a personalized user experience within the system.
<p align="center">
  <img src="Overview/Personalinfo_CustProfile.png" width="850" title="Admin Portal Overview"> 
</p>

### Booking Status
The Booking Status module enables users to track their current and past reservations. It displays booking ID, location, room details, stay duration, assigned rooms, and current status (Active/Completed). Users can also initiate actions such as ordering food directly from this section.
<p align="center">
  <img src="Overview/BookingStatus_CustProfile.png" width="850" title="Admin Portal Overview"> 
</p>

### Update Stay
The Update Stay module allows users to request additional services during their stay. Options such as extra bed, room cleaning, early check-in, late check-out, and stay extension are available. These requests are sent to staff for approval, and applicable charges are automatically added to the user’s bill.
<p align="center">
  <img src="Overview/UpdateStay_CustProfile.png" width="850" title="Admin Portal Overview"> 
</p>

### Food Orders
The Food Orders module provides a detailed history of all in-room dining orders placed by the user. It includes item names, quantities, prices, room number, booking reference, and timestamps. This helps users keep track of their dining expenses and order history.
<p align="center">
  <img src="Overview/FoodOrders_CustProfiles.png" width="850" title="Admin Portal Overview"> 
</p>

### Payment Status
The Payment Status module gives a complete overview of the user’s billing information. It shows total bill amount, breakdown of room charges and food expenses, and any outstanding payments. Users can complete pending payments directly through this module.
<p align="center">
  <img src="Overview/PaymentStatus_CustProfile.png" width="850" title="Admin Portal Overview"> 
</p>

### Update Password
The Update Password module allows users to securely change their account password. It includes fields for entering and confirming a new password, ensuring account security and user control over authentication credentials.
<p align="center">
  <img src="Overview/UpdatePassword_CustProfile.png" width="850" title="Admin Portal Overview"> 
</p>

---

## Food Menu Overview

### North Indian
The North Indian Menu showcases popular dishes like paneer butter masala, dal makhani, naan, and tandoori items. It includes categorized listings with visually appealing cards, pricing details, and quick add-to-cart functionality, enabling users to conveniently order their favorite meals.
<p align="center">
  <img src="Overview/FoodMenu_NorthIndian.png" width="850" title="Admin Portal Overview"> 
</p>

### South Indian
The South Indian Menu section displays a variety of traditional dishes such as dosa, idli, uttapam, and biryani. Each item is presented with an image, price, and an “Add to Cart” option. The interface allows users to easily browse and select dishes based on their preferences, enhancing the in-room dining experience.
<p align="center">
  <img src="Overview/FoodMenu_SouthIndian.png" width="850" title="Admin Portal Overview"> 
</p>

### Continental
The Continental Menu provides a selection of international dishes such as pasta, burgers, sandwiches, and desserts. It offers a clean and organized layout with item descriptions, pricing, and quick ordering options, catering to diverse customer preferences.
<p align="center">
  <img src="Overview/FoodMenu_Continental.png" width="850" title="Admin Portal Overview"> 
</p>

### Food Cart
The Food Cart module allows users to review and manage their selected items before placing an order. It includes item quantity controls, price breakdown, and room selection for delivery. Users can modify their cart in real-time and confirm their order using the “Place Order” option, ensuring a seamless and efficient ordering process.
<p align="center">
  <img src="Overview/FoodCart.png" width="850" title="Admin Portal Overview"> 
</p>

---

## Author
**Mandar Deshmukh** *Computer Science & Engineering* [LinkedIn](https://linkedin.com/in/your-profile)

---
<div align="center">
  <sub>Optimizing hospitality through data-driven management.</sub>
</div>
