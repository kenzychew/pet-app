const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Pet = require("../models/Pet");

exports.createAppointment = async (req, res) => {
  try {
    // only pet owners can book appts
    if (req.user.role !== "owner") {
      return res
        .status(403)
        .json({ error: "Only pet owners can book appointments" });
    }
    const { petId, groomerId, serviceType, startTime } = req.body;
    // set the duration based on service type
    const duration = serviceType === "basic" ? 60 : 120;

    // validate required fields - removed endTime as it leads to serviceType duration not being used
    if (!petId || !groomerId || !serviceType || !startTime) {
      return res
        .status(400)
        .json({ error: "Missing required appointment information" });
    }

    if (serviceType !== "basic" && serviceType !== "full") {
      return res
        .status(400)
        .json({ error: "Service type must be either 'basic' or 'full'" });
    }
    // parse date string to Date object
    const appointmentStart = new Date(startTime);
    // validate date
    if (isNaN(appointmentStart.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // calculate endTime based on startTime + duration
    const appointmentEnd = new Date(appointmentStart);
    appointmentEnd.setMinutes(appointmentStart.getMinutes() + duration);

    /*
        Example with 10:30 AM start time for a basic service (60 min)
    const start = new Date("2023-06-15T10:30:00Z");
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 60);
    console.log(end.toISOString()); // Outputs: 2025-03-10T11:30:00Z
                                  //* notice hour changed from 10 to 11

        Example with 10:30 PM start time for a full service (120 min)
    const start2 = new Date("2023-06-15T22:30:00Z");
    const end2 = new Date(start2);
    end2.setMinutes(start2.getMinutes() + 120);
    console.log(end2.toISOString()); // Outputs: 2023-03-11T00:30:00Z
                                    //* works across day boundaries
    */

    // verify pet exists and belongs to req user
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    if (pet.ownerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only book appointments for your own pets" });
    }

    // verify groomer exists
    const groomer = await User.findOne({ _id: groomerId, role: "groomer" });
    if (!groomer) {
      return res.status(404).json({ error: "Groomer not found" });
    }

    // check if appt is in the past
    const currentTime = new Date();
    if (appointmentStart < currentTime) {
      return res
        .status(400)
        .json({ error: "Cannot book appointments in the past" });
    }

    // verify start time is before end time, probably can remove this since no longer using endTime
    if (appointmentStart >= appointmentEnd) {
      return res
        .status(400)
        .json({ error: "Start time must be before end time" });
    }

    // check for time conflicts
    const hasConflict = await Appointment.checkForConflicts(
      groomerId,
      appointmentStart,
      appointmentEnd
    );

    if (hasConflict) {
      return res.status(409).json({
        error:
          "This time slot is no longer available. Please choose another time.",
      });
    }

    // create appt
    const newAppointment = new Appointment({
      petId,
      ownerId: req.user.id,
      groomerId,
      serviceType,
      duration,
      startTime: appointmentStart,
      endTime: appointmentEnd,
      status: "confirmed",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newAppointment.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ error: "Server error booking appointment" });
  }
};

// get all appts for current user (owner or groomer)
exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = {};

    // filter by role
    if (req.user.role === "owner") {
      query.ownerId = userId;
    } else if (req.user.role === "groomer") {
      query.groomerId = userId;
    }

    // filter by status
    if (status && ["confirmed", "completed"].includes(status)) {
      query.status = status;
    }

    // get appts with populated pet and groomer/owner details
    const appointments = await Appointment.find(query)
      .populate("petId", "name species breed")
      .populate("ownerId", "name email")
      .populate("groomerId", "name email")
      .sort({ startTime: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Server error fetching appointments" });
  }
};

// get specific appt by id
exports.getAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate("petId", "name species breed")
      .populate("ownerId", "name email")
      .populate("groomerId", "name email");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    // checks if user authorized to view appt
    if (
      (req.user.role === "owner" &&
        appointment.ownerId._id.toString() !== req.user.id) ||
      (req.user.role === "groomer" &&
        appointment.groomerId._id.toString() !== req.user.id)
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this appointment" });
    }
    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res
      .status(500)
      .json({ error: "Server error fetching appointment details" });
  }
};

// update appt status (groomer marks as completed)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status } = req.body;

    if (!status || !["confirmed", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // auth check - who can update status?
    if (req.user.role === "owner") {
      // owners cannot mark appointments as completed
      if (appointment.ownerId.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this appointment" });
      }
      if (status === "completed") {
        return res
          .status(403)
          .json({ error: "Only groomers can mark appointments as completed" });
      }
    } else if (req.user.role === "groomer") {
      // groomers can only update appts assigned to them
      if (appointment.groomerId.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this appointment" });
      }
    }
    // update appt status
    appointment.status = status;
    appointment.updatedAt = new Date();

    await appointment.save();

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ error: "Server error updating appointment status" });
  }
};

// reschedule appt (owners only)
exports.updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { petId, groomerId, serviceType, startTime } = req.body;

    // validate required fields
    if (!petId || !groomerId || !serviceType || !startTime) {
      return res
        .status(400)
        .json({ error: "Missing required appointment information" });
    }

    // find the appt
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    // check if user is owner of this appt
    if (appointment.ownerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this appointment" });
    }
    // check if appt can be modified
    if (!appointment.canModify()) {
      return res.status(400).json({
        error:
          "Cannot modify appointments less than 24 hours before start time",
      });
    }
    // set duration based on svc type
    const duration = serviceType === "basic" ? 60 : 120;
    // parse date string to Date object
    const appointmentStart = new Date(startTime);

    // check if appointment is in the past
    const currentTime = new Date();
    if (appointmentStart < currentTime) {
      return res
        .status(400)
        .json({ error: "Cannot reschedule to a time in the past" });
    }

    // calculate endTime based on startTime + duration
    const appointmentEnd = new Date(appointmentStart);
    appointmentEnd.setMinutes(appointmentStart.getMinutes() + duration);
    // check for conflicts with other appts
    const hasConflict = await Appointment.checkForConflicts(
      groomerId,
      appointmentStart,
      appointmentEnd,
      appointmentId // exclude this appt from conflict check
    );

    if (hasConflict) {
      return res.status(409).json({
        error:
          "This time slot is no longer available. Please choose another time.",
      });
    }

    // update the appt
    appointment.petId = petId;
    appointment.groomerId = groomerId;
    appointment.serviceType = serviceType;
    appointment.duration = duration;
    appointment.startTime = appointmentStart;
    appointment.endTime = appointmentEnd;
    appointment.updatedAt = new Date();

    await appointment.save();

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Server error updating appointment" });
  }
};

// delete an appt (owners only)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // check user is owner of appt
    if (appointment.ownerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this appointment" });
    }

    // check if appt can be modified
    if (!appointment.canModify()) {
      return res.status(400).json({
        error:
          "Cannot delete appointments less than 24 hours before start time",
      });
    }
    // delete appt
    await Appointment.deleteOne({ _id: appointmentId });

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Server error deleting appointment" });
  }
};
