# Restaurant Management System

A web-based application designed to streamline restaurant operations through role-based access control and efficient order management.

## 🔐 Features

- **Role-Based Authentication**: Secure login system distinguishing between Chef and Waiter roles.
- **Order Management**: Efficient handling and tracking of customer orders.
- **Menu Management**: Dynamic menu items stored in a JSON file for easy updates.
- **Secure Password Handling**: Implementation of password hashing to ensure user data protection.

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

## 📁 Project Structure

restaurant-management-system/ 

├── public/ # Frontend files 

├── server/ # Backend logic and API routes 

├── restaurant_management_system.menuitems.json # Menu data 

├── package.json # Project metadata and dependencies 

└── README.md # Project overview

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/8ven0m8/restaurant-management-system.git
   cd restaurant-management-system
**Install dependencies:**

npm install

Configure environment variables:

Create a .env file in the root directory.

Add necessary environment variables (e.g., MongoDB connection string).

**Start the server:**

npm start
Access the application:

Open your browser and navigate to http://localhost:3000.

Feel free to contribute or raise issues to enhance the system's functionality.
