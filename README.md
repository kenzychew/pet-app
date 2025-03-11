# Pet App

## Overview

A minimalist web application for pet grooming appointment bookings. This MVP enables pet owners to schedule grooming appointments and helps groomers manage their schedule and client base.

## Features

- **Dual User System**: Separate interfaces for pet owners and groomers
- **Pet Profiles**: Create and manage basic pet information
- **Fixed Service Options**: Two service types with preset durations
- **Appointment Scheduling**: Book appointments based on groomer availability
- **Appointment Management**: Cancel or update appointments with time restrictions
- **Admin Controls**: Groomers can view and manage their schedule
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

- I want to select either Basic Grooming (60 minutes) or Full Grooming (120 minutes) when booking

### Appointment Management

#### As a pet owner

- I want to be able to see all groomers and select them to see their availability
- I want to book a grooming appointment for my pet on a specific date and time
- I want to select either Basic Grooming(60 minutes) or Full Grooming(120 minutes) when booking
- I want to see my upcoming appointments to remember when to bring my pet
- I want to cancel an appointment (more than 24 hours before the start time)
- I want to update an appointment (more than 24 hours before the start time) \*\*Add later
- I want to receive a confirmation email when my booking is complete (stretch)

#### As a groomer

- I want to see all upcoming appointments chronologically so I can prepare for my day
- I want my dashboard to show when new appointments are booked
- I want to see my availability calendar with booked time slots
- I want to view details of the pet for each upcoming appointment to better prepare for the session

### Availability

#### As a groomer

- I want to be able to manage my availability by setting my work hours.

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

### Pet Management

- `GET /api/pets` - Get all pets for the current user (owner)
- `GET /api/pets/:id` - Get a specific pet by ID
- `POST /api/pets` - Create a new pet (owners only)
- `PUT /api/pets/:id` - Update a pet
- `DELETE /api/pets/:id` - Delete a pet

### Groomer Availability

- `GET /api/groomers` - List all available groomers
- `GET /api/groomers/:id` - Get details for a specific groomer
- `GET /api/groomers/:id/availability?date=YYYY-MM-DD&duration=60` - Get available appointment slots

### Appointments

- `POST /api/appointments` - Book a new appointment (owners only)
- `GET /api/appointments` - Get all appointments for the current user
- `GET /api/appointments/:id` - Get a specific appointment by ID
- `PATCH /api/appointments/:id/status` - Update appointment status

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
- `notes`: String
- `createdAt`: Date
- `updatedAt`: Date

### Appointments

- `_id`: ObjectId
- `petId`: ObjectId (reference to Pet)
- `ownerId`: ObjectId (reference to User)
- `groomerId`: ObjectId (reference to User)
- `serviceType`: String (basic/full)
- `duration`: Number (60 or 120 minutes)
- `startTime`: Date
- `endTime`: Date
- `status`: String (confirmed/cancelled/completed)
- `createdAt`: Date
- `updatedAt` : Date

## Service Structure

- **Service Types as Appointment Properties**:

  - Basic Grooming: 60 minutes duration
  - Full Grooming: 120 minutes duration
  - Selected at the time of booking as a property of the appointment

- **Groomer Availability**:
  - All groomers are available from 09:00 to 18:00 daily by default
  - All groomers provide both basic and full grooming services

## Appointment Rules

- **Creation**:

  - Only pet owners can create bookings
  - Appointments must fall within groomer's available timeslots (09:00-18:00)
  - System must check for existing appointments to avoid conflicts

- **Updates**:

  - Only allowed more than 24 hours before the appointment
  - Subject to groomer's available timeslots
  - Updates by owners are reflected on the groomer's dashboard

- **Cancellation**:

  - Only allowed more than 24 hours before the appointment
  - Cancellations by owners are reflected on the groomer's dashboard

- **Status Types**:
  - Confirmed
  - Cancelled
  - Completed

## Future Enhancements (Post-MVP)

- Payment processing integration
- Advanced reporting and analytics
- Customer reviews and ratings
- Recurring appointment scheduling
- Mobile app version

## Attributions

### Material UI

https://mui.com/material-ui/api/app-bar/
https://mui.com/material-ui/api/toolbar/
https://mui.com/material-ui/api/typography/
https://mui.com/material-ui/api/button/
https://mui.com/material-ui/api/box/
https://mui.com/system/the-sx-prop/

### Node.JS / MongoDB

https://stackoverflow.com/questions/71142537/how-to-join-model-in-mongodbmongoose-and-express
https://chankapure.medium.com/building-a-doctor-appointment-scheduler-with-node-js-and-mongodb-10b52fba79af
https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/mongoose
https://dev.to/itz_giddy/how-to-query-documents-in-mongodb-that-fall-within-a-specified-date-range-using-mongoose-and-node-524a
https://www.corbado.com/blog/nodejs-express-mongodb-jwt-authentication-roles
https://stackoverflow.com/questions/61464600/how-create-a-schema-for-booking-system-with-availability-time-slots
https://stackoverflow.com/questions/48782039/mongodb-find-and-insert-if-time-slots-doesnt-conflict-with-other-time-slots

### Express MVC

https://stackoverflow.com/questions/11076179/node-js-express-routes-vs-controller
https://dev.to/ericchapman/nodejs-express-part-5-routes-and-controllers-55d3
https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes
https://mongoosejs.com/docs/schematypes.html
https://mongoosejs.com/docs/models.html
