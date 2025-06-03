const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const groomerController = require("../controllers/groomerController");
const { verifyToken } = require("../utils/jwt");
const { isOwner, isGroomer, isAuthenticated } = require("../middleware/roleMiddleware");

router.use(verifyToken);
// book new appt (owner)
router.post("/", isOwner, appointmentController.createAppointment);
// get all appts for current user
router.get("/", isAuthenticated, appointmentController.getUserAppointments);
// get available slots for groomer (alternative route)
router.get(
  "/available-slots/:groomerId",
  isAuthenticated,
  groomerController.getGroomerAvailability
);
// get a specific appt by ID
router.get("/:id", isAuthenticated, appointmentController.getAppointmentById);
// update appt
router.put("/:id", isOwner, appointmentController.updateAppointment);
// delete appt
router.delete("/:id", isOwner, appointmentController.deleteAppointment);

module.exports = router;
