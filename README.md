# Pet App

## Overview

A minimalist web application for pet grooming appointment bookings. This MVP enables pet owners to schedule grooming appointments and helps groomers manage their schedule and client base.

## Features

- **Dual User System**: Separate interfaces for pet owners and groomers
- **Pet Profiles**: Create and manage basic pet information
- **Service Catalog**: Browse and select from available grooming services
- **Appointment Scheduling**: Book appointments based on groomer availability
- **Appointment Cancellation**: Pet owners can cancel appointments they can no longer attend
- **Admin Controls**: Groomers can accept/reject appointments and manage their schedule
- **Basic Notifications**: Email notifications for booking confirmations and cancellations

## User Stories

### Authentication & User Management

#### As a new user (pet owner)

- I want to register for an account so that I can book grooming appointments
- I want to log in to my account so that I can access the booking system
- I want to log out of my account to keep my information secure

#### As a new user (groomer)

- I want to register as a groomer so that I can provide grooming services
- I want to log in to my groomer account to manage my appointments
- I want to log out of my account when I'm done for the day

### Pet Management

#### As a pet owner

- I want to add a new pet to my profile so I can book appointments for them
- I want to view all my pets in one place for easy management
- I want to see my pet's grooming history to track previous services

### Services

#### As a pet owner

- I want to view available grooming services so I can choose what my pet needs
- I want to see service prices before booking so I can plan accordingly

#### As a groomer

- I want to add new services to the catalog so customers know what I offer

### Appointment Management

#### As a pet owner

- I want to book a grooming appointment for my pet on a specific date and time
- I want to see my upcoming appointments to remember when to bring my pet
- I want to cancel an appointment I can no longer attend
- I want to receive a confirmation email when my booking is complete

#### As a groomer

- I want to see all upcoming appointments so I can prepare for my day
- I want to accept or reject appointment requests based on my availability
- I want to view which pet is scheduled for each appointment
- I want to be notified when new appointments are booked

### Admin Functionality

#### As a groomer

- I want to manage my schedule to control when I'm available for bookings
- I want to view my appointment history to track my work

## Technology Stack

- **Frontend**: React with Material UI components
- **Backend**: Express.js with REST API
- **Database**: MongoDB (hosted on MongoDB Atlas)
- **Authentication**: JWT-based authentication
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (for database)

### Installation

1. Clone the repository

   ```
   git clone https://github.com/kenzychew/pet-app.git
   cd pet-app
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a .env file in the root directory with the following variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_SERVICE=your_email_service
   EMAIL_USER=your_email_username
   EMAIL_PASS=your_email_password
   ```

4. Start the development server

   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
pet-grooming-service/
├── client/               # Frontend React application
│   ├── public/
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Page components
│       ├── context/      # React context for state management
│       └── services/     # API service calls
├── server/               # Backend Express application
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user (owner or groomer)
- `POST /api/auth/login` - User login

### Pet Owners

- `GET /api/owners/profile` - Get owner profile
- `POST /api/owners/pets` - Add a new pet
- `GET /api/owners/pets` - Get all pets for an owner
- `GET /api/owners/appointments` - Get all appointments for an owner

### Groomers

- `GET /api/groomers/profile` - Get groomer profile
- `GET /api/groomers/appointments` - Get all appointments for a groomer
- `PUT /api/groomers/appointments/:id` - Update appointment status

### Services

- `GET /api/services` - Get all grooming services
- `POST /api/services` - Add a new service (admin only)

### Appointments

- `POST /api/appointments` - Create a new appointment
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Cancel/delete an appointment

## Database Schema

### Users

- `_id`: ObjectId
- `email`: String (unique)
- `password`: String (hashed)
- `name`: String
- `role`: String (owner/groomer)
- `createdAt`: Date

### Pets

- `_id`: ObjectId
- `name`: String
- `species`: String
- `breed`: String
- `age`: Number
- `ownerId`: ObjectId (reference to User)
- `createdAt`: Date

### Services

- `_id`: ObjectId
- `name`: String
- `description`: String
- `price`: Number
- `duration`: Number (in minutes)
- `createdAt`: Date

### Appointments

- `_id`: ObjectId
- `petId`: ObjectId (reference to Pet)
- `ownerId`: ObjectId (reference to User)
- `groomerId`: ObjectId (reference to User)
- `serviceId`: ObjectId (reference to Service)
- `date`: Date
- `time`: String
- `status`: String (pending/confirmed/rejected/completed)
- `createdAt`: Date

## Future Enhancements (Post-MVP)

- Payment processing integration
- Advanced reporting and analytics
- Customer reviews and ratings
- Recurring appointment scheduling
- Mobile app version
