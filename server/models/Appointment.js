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
  this.updatedAt = Date.now(); // updates updatedAt field
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
  // biz hours (should be variable but lets hardcode this for now)
  const businessStart = 9;
  const businessEnd = 17;

  // get all appointments for this day
  const appointments = await this.getGroomerConfirmedAppointments(groomerId, date);

  // start with full day slots in 60-minute increments
  const dayDate = new Date(date); // 2024-03-16 => 2024-03-16T00:00:00
  const slots = [];

  // generate all possible time slots during biz hours
  for (let hour = businessStart; hour < businessEnd; hour++) {
    for (let minute = 0; minute < 60; minute += 60) {
      const slotStart = new Date(dayDate); // Date obj for start time
      slotStart.setHours(hour, minute, 0, 0); // set seconds and ms to 0
      // create new Date obj that is a copy of slotStart
      // impt bc Date objs are reference types, so this ensures we dont modify the og slotStart obj
      const slotEnd = new Date(slotStart);
      // gets current mins from slotStart and adds duration
      // 2:30PM + 45 = 3.15PM, sets slotEnd to 3:15PM
      // handles minute overflow correctly
      slotEnd.setMinutes(slotStart.getMinutes() + duration);

      // do not add slots that extend beyond biz hrs
      if (
        slotEnd.getHours() < businessEnd || // if end time before 5pm
        (slotEnd.getHours() === businessEnd && slotEnd.getMinutes() === 0) // if end time is exactly 5:00pm
      ) {
        slots.push({
          start: new Date(slotStart),
          end: new Date(slotEnd),
          available: true,
        }); // get array of slot objs
      }
    }
  }

  // mark slots as unavailable if they conflict with existing appointments
  // loop through all existing (confirmed) appointments
  for (const appointment of appointments) {
    const appointmentStart = new Date(appointment.startTime);
    const appointmentEnd = new Date(appointment.endTime);
    // loop through all possible slots
    for (const slot of slots) {
      // check if proposed slot overlaps with existing appointment
      // similar to checkForConflicts method which is used for creation/update
      if (slot.start < appointmentEnd && slot.end > appointmentStart) {
        slot.available = false;
      }
    }
  }

  // filter and return only available slots
  return slots.filter((slot) => slot.available);
  // assuming all slots are available ie. no conflicts, output:
  // [
  //   { "start": "2025-03-15T09:00:00Z", "end": "2025-03-15T10:00:00Z", "available": true },
  //   { "start": "2025-03-15T11:00:00Z", "end": "2025-03-15T12:00:00Z", "available": true },
  //   { "start": "2025-03-15T12:00:00Z", "end": "2025-03-15T13:00:00Z", "available": true },
  //   { "start": "2025-03-15T13:00:00Z", "end": "2025-03-15T14:00:00Z", "available": true },
  //   { "start": "2025-03-15T14:00:00Z", "end": "2025-03-15T15:00:00Z", "available": true },
  //   { "start": "2025-03-15T15:00:00Z", "end": "2025-03-15T16:00:00Z", "available": true },
  //   { "start": "2025-03-15T16:00:00Z", "end": "2025-03-15T17:00:00Z", "available": true }
  // ]
};

module.exports = mongoose.model("Appointment", AppointmentSchema);
