const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
  petId: { type: Schema.Types.ObjectId, ref: "Pet", required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  groomerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  serviceType: { type: String, enum: ["basic", "full"], required: true },
  duration: { type: Number, enum: [60, 120], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }, // ISO 8601 format (e.g., 2025-03-15T14:30:00Z)
  status: {
    type: String,
    enum: ["confirmed", "completed"],
    default: "confirmed",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Business hours configuration
const BUSINESS_HOURS = {
  0: { start: 10, end: 19 }, // Sunday: 10am-7pm SGT
  1: { start: 11, end: 20 }, // Monday: 11am-8pm SGT
  2: { start: 11, end: 20 }, // Tuesday: 11am-8pm SGT
  3: null, // Wednesday: Closed
  4: { start: 11, end: 20 }, // Thursday: 11am-8pm SGT
  5: { start: 11, end: 20 }, // Friday: 11am-8pm SGT
  6: { start: 10, end: 19 }, // Saturday: 10am-7pm SGT
};

// Helper function to check if a day is a business day
AppointmentSchema.statics.isBusinessDay = function (date) {
  const dayOfWeek = new Date(date).getDay();
  return BUSINESS_HOURS[dayOfWeek] !== null;
};

// Helper function to get business hours for a specific day
AppointmentSchema.statics.getBusinessHours = function (date) {
  const dayOfWeek = new Date(date).getDay();
  return BUSINESS_HOURS[dayOfWeek];
};

// instance methods are useful when working with individual appointment instances
// ie. one specific appt at a time
// check if the appointment can be modified (>24h before start)
AppointmentSchema.methods.canModify = function () {
  const currentTime = new Date();
  const appointmentTime = new Date(this.startTime);
  // calculate difference in hours
  const hoursDifference = (appointmentTime - currentTime) / (1000 * 60 * 60);
  return hoursDifference > 24; // returns true if more than 24 hrs before start
};

// instance method to check if appointment should be marked as completed
AppointmentSchema.methods.shouldBeCompleted = function () {
  const currentTime = new Date();
  const appointmentEndTime = new Date(this.endTime);
  // checks if current time is after appointment end time and if status is confirmed
  return currentTime > appointmentEndTime && this.status === "confirmed";
};

// custom helper method to update status of confirmed appointments that have ended
AppointmentSchema.statics.updateCompletedAppointments = async function (appointments) {
  const currentTime = new Date();
  const updatedAppointments = [];

  for (const appointment of appointments) {
    if (appointment.status === "confirmed" && new Date(appointment.endTime) < currentTime) {
      appointment.status = "completed";
      appointment.updatedAt = currentTime;
      await appointment.save();
      updatedAppointments.push(appointment._id);
    }
  }

  return updatedAppointments;
};

// custom method to check for time conflicts, super impt job of checking whether potential appt overlaps with existing one
AppointmentSchema.statics.checkForConflicts = async function (
  groomerId,
  startTime,
  endTime,
  excludeAppointmentId = null // optional param to exclude current appt from check, used when updating existing appt
) {
  const query = {
    groomerId,
    status: "confirmed",
    $or: [
      // newStartTime < existingEndTime && newEndTime > existingStartTime
      // true and true overlaps
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  };
  // finds existing appointments that overlap with proposed time slot
  // find appointments where
  // the existing appointment's start time is before (lt) the new appointment's end time
  // AND
  // the existing appointment's end time is after (gt) the new appointment's start time

  // this condition captures all possible overlap scenarios
  /* 
  S1: New appt starts during existing appt
  Existing:  |------------| 10:00 - 11:00
  New:              |------------| 10:30 - 11:30
  S2: New appt ends during existing appt
  Existing:          |------------|  10:00 - 11:00
  New:      |------------| 09:30 - 10:30
  S3: New appt completely inside existing appt
  Existing:  |---------------| 09:00 - 11:00
  New:          |-----| 09:30 - 10:30
  S4: New appt completely contains existing appt
  Existing:     |-----| 09:30 - 10:30
  New:      |--------------| 09:00 - 11:00
  */

  // exclude the current appointment if updating
  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }
  // executes query to get all appts that satisfy the conditions
  const conflictingAppointments = await this.find(query);
  // returns true if there are any conflicting appointments
  return conflictingAppointments.length > 0;
};

// middleware (pre-save validation)
// ensure startTime always before endTime
AppointmentSchema.pre("save", function (next) {
  if (this.startTime >= this.endTime) {
    const err = new Error("Start time must be before end time");
    return next(err);
  }

  // Check if appointment is during business hours
  const appointmentDate = new Date(this.startTime);
  if (!this.constructor.isBusinessDay(appointmentDate)) {
    const err = new Error("Appointments cannot be scheduled on days when we are closed");
    return next(err);
  }

  const businessHours = this.constructor.getBusinessHours(appointmentDate);
  const startHour = appointmentDate.getHours();
  const endHour = new Date(this.endTime).getHours();
  const endMinute = new Date(this.endTime).getMinutes();

  if (
    startHour < businessHours.start ||
    endHour > businessHours.end ||
    (endHour === businessHours.end && endMinute > 0)
  ) {
    const err = new Error("Appointment must be within business hours");
    return next(err);
  }

  this.updatedAt = Date.now();
  next();
});

// added these static methods to simplify availability checks, controller will be a lot cleaner
// get all confirmed appointments for a groomer on a given day
AppointmentSchema.statics.getGroomerConfirmedAppointments = async function (groomerId, date) {
  // convert date to start/end of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // find all appointments with confirmed status for this groomer on this day
  // sort by startTime
  const appointments = await this.find({
    groomerId,
    status: "confirmed",
    startTime: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ startTime: 1 });

  return appointments;
};

AppointmentSchema.statics.getAvailableTimeSlots = async function (groomerId, date, duration) {
  // Check if it's a business day
  if (!this.isBusinessDay(date)) {
    return []; // No slots available on closed days
  }

  // Get business hours for this specific day
  const businessHours = this.getBusinessHours(date);
  if (!businessHours) {
    return [];
  }

  // Get all confirmed appointments for this day
  const appointments = await this.getGroomerConfirmedAppointments(groomerId, date);

  const dayDate = new Date(date);
  const slots = [];

  // Generate time slots based on business hours for this day
  for (let hour = businessHours.start; hour < businessHours.end; hour++) {
    for (let minute = 0; minute < 60; minute += 60) {
      const slotStart = new Date(dayDate);
      slotStart.setHours(hour, minute, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + duration);

      // Check if slot end time is within business hours
      const slotEndHour = slotEnd.getHours();
      const slotEndMinute = slotEnd.getMinutes();
      const endTimeInMinutes = slotEndHour * 60 + slotEndMinute;
      const businessEndInMinutes = businessHours.end * 60;

      if (endTimeInMinutes <= businessEndInMinutes) {
        slots.push({
          start: slotStart,
          end: slotEnd,
          available: true,
        });
      }
    }
  }

  // Mark slots as unavailable if they conflict with existing appointments
  for (const appointment of appointments) {
    const appointmentStart = new Date(appointment.startTime);
    const appointmentEnd = new Date(appointment.endTime);

    for (const slot of slots) {
      if (slot.start < appointmentEnd && slot.end > appointmentStart) {
        slot.available = false;
      }
    }
  }

  return slots.filter((slot) => slot.available);
};

module.exports = mongoose.model("Appointment", AppointmentSchema);
