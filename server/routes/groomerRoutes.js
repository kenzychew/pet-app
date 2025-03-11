const express = require("express");
const router = express.Router();
const groomerController = require("../controllers/groomerController");
const { verifyToken } = require("../utils/jwt");
const { isAuthenticated } = require("../middleware/roleMiddleware");

router.use(verifyToken);

router.get("/", isAuthenticated, groomerController.getAllGroomers);

router.get("/:id", isAuthenticated, groomerController.getGroomerById);
// get all available slots for groomer
// eg: /api/groomers/:id/availability?date=2023-04-15&duration=60
router.get(
  "/:id/availability",
  isAuthenticated,
  groomerController.getGroomerAvailability
);

module.exports = router;
