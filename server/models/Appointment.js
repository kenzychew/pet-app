const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
  petId: { type: Schema.Types.ObjectId, ref: "Pet", required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  groomerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected", "completed", "cancelled"],
    default: "pending",
    required: true,
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
