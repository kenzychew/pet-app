const User = require("../models/User");
const Appointment = require("../models/Appointment");

exports.getAllGroomers = async (req, res) => {
  try {
    // find all users with role groomer
    const groomers = await User.find({ role: "groomer" }).select("-password");

    res.status(200).json(groomers);
  } catch (error) {
    console.error("Error fetching groomers:", error);
    res.status(500).json({ error: "Server error fetching groomers" });
  }
};

exports.getGroomerById = async (req, res) => {
  try {
    const groomerId = req.params.id;
    const groomer = await User.findOne({
      _id: groomerId,
      role: "groomer",
    }).select("-password");

    if (!groomer) {
      return res.status(404).json({ error: "Groomer not found" });
    }
    res.status(200).json(groomer);
  } catch (error) {
    console.error("Error fetching groomer:", error);
    res.status(500).json({ error: "Server error fetching groomer details" });
  }
};

// get groomer available time slots on specific date
exports.getGroomerAvailability = async (req, res) => {
  try {
    const groomerId = req.params.id;
    const { date, duration } = req.query;

    // query params validation
    if (!date) {
      return res
        .status(400)
        .json({ error: "Date parameter is required (YYYY-MM-DD)" });
    }

    const appointmentDuration = parseInt(duration) || 60;

    if (appointmentDuration !== 60 && appointmentDuration !== 120) {
      return res
        .status(400)
        .json({ error: "Duration must be either 60 or 120 minutes" });
    }

    const groomer = await User.findOne({ _id: groomerId, role: "groomer" });
    if (!groomer) {
      return res.status(404).json({ error: "Groomer not found" });
    }

    // parse date and check if valid
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res
        .status(400)
        .json({ error: "Cannot book appointments for past dates" });
    }

    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][appointmentDate.getDay()];

    // checks if groomer is working on the day
    const daySchedule = groomer.workingHours.find(
      (day) => day.day === dayOfWeek
    );
    if (!daySchedule || !daySchedule.isWorking) {
      return res.status(200).json({
        message: `Groomer does not work on ${dayOfWeek}s`,
        availableSlots: [],
      });
    }

    // model static method to get available time slots
    const availableSlots = await Appointment.getAvailableTimeSlots(
      groomerId,
      appointmentDate,
      appointmentDuration
    );

    res.status(200).json(availableSlots);
  } catch (error) {
    console.error("Error fetching groomer availability:", error);
    res
      .status(500)
      .json({ error: "Server error fetching groomer availability" });
  }
};
