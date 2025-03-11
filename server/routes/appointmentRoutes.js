const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { verifyToken } = require("../utils/jwt");
const {
  isOwner,
  isGroomer,
  isAuthenticated,
} = require("../middleware/roleMiddleware");

router.use(verifyToken);
// book new appt (owner)
router.post("/", isOwner, appointmentController.createAppointment);
// get all appts for current user
router.get("/", isAuthenticated, appointmentController.getUserAppointments);
// get a specific appt by ID
router.get("/:id", isAuthenticated, appointmentController.getAppointmentById);
// update appt status
router.patch(
  "/:id/status",
  isAuthenticated,
  appointmentController.updateAppointmentStatus
); // PATCH /api/appointments/:id/status

module.exports = router;
