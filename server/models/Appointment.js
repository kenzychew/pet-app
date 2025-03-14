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

// custom method to check if the appointment can be modified (>24h before start)
AppointmentSchema.methods.canModify = function () {
  const currentTime = new Date();
  const appointmentTime = new Date(this.startTime);
  // calculate difference in hours
  const hoursDifference = (appointmentTime - currentTime) / (1000 * 60 * 60);
  return hoursDifference > 24;
};

// Method to check if appointment should be marked as completed
AppointmentSchema.methods.shouldBeCompleted = function () {
  const currentTime = new Date();
  const appointmentEndTime = new Date(this.endTime);
  return currentTime > appointmentEndTime && this.status === "confirmed";
};

// Static method to update status of completed appointments
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
  excludeAppointmentId = null
) {
  const query = {
    groomerId,
    status: "confirmed",
    $or: [
      // new appointment starts during an existing appointment
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  }; //* this condition captures all possible overlap scenarios
  /* 
  S1: New appt starts during existing appt
  Existing:  |------------|
  New:              |------------|
  S2: New appt ends during existing appt
  Existing:  |------------|
  New:              |------------|
  S3: New appt completely inside existing appt
  Existing:  |---------------|
  New:          |-----|
  S4: New appt completely contains existing appt
  Existing:     |-----|
  New:      |--------------|
  */

  // exclude the current appointment if updating
  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const conflictingAppointments = await this.find(query);
  return conflictingAppointments.length > 0;
};

// add validation for startTime before endTime
AppointmentSchema.pre("save", function (next) {
  if (this.startTime >= this.endTime) {
    const err = new Error("Start time must be before end time");
    return next(err);
  }
  this.updatedAt = Date.now();
  next();
});

// added these static methods to simplify availability checks, controller will be a lot cleaner
AppointmentSchema.statics.getGroomerAvailability = async function (groomerId, date) {
  // convert date to start/end of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // find all confirmed appointments for this groomer on this day
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
  const appointments = await this.getGroomerAvailability(groomerId, date);

  // start with full day slots in 60-minute increments
  const dayDate = new Date(date);
  const slots = [];

  // generate all possible time slots during biz hours
  for (let hour = businessStart; hour < businessEnd; hour++) {
    for (let minute = 0; minute < 60; minute += 60) {
      const slotStart = new Date(dayDate);
      slotStart.setHours(hour, minute, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + duration);

      // do not add slots that extend beyond biz hrs
      if (
        slotEnd.getHours() < businessEnd ||
        (slotEnd.getHours() === businessEnd && slotEnd.getMinutes() === 0)
      ) {
        slots.push({
          start: new Date(slotStart),
          end: new Date(slotEnd),
          available: true,
        });
      }
    }
  }

  // mark slots as unavailable if they conflict with existing appointments
  for (const appointment of appointments) {
    const appointmentStart = new Date(appointment.startTime);
    const appointmentEnd = new Date(appointment.endTime);

    for (const slot of slots) {
      // Check if this slot overlaps with the appointment
      if (slot.start < appointmentEnd && slot.end > appointmentStart) {
        slot.available = false;
      }
    }
  }

  // filter to only available slots
  return slots.filter((slot) => slot.available);
};

module.exports = mongoose.model("Appointment", AppointmentSchema);
