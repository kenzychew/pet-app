const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["owner", "groomer"], required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  workingHours: {
    type: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        },
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" }, // 24h format
        endTime: { type: String, default: "17:00" },
      },
    ],
    default: [
      { day: "Monday", isWorking: true, startTime: "09:00", endTime: "17:00" },
      { day: "Tuesday", isWorking: true, startTime: "09:00", endTime: "17:00" },
      {
        day: "Wednesday",
        isWorking: true,
        startTime: "09:00",
        endTime: "17:00",
      },
      {
        day: "Thursday",
        isWorking: true,
        startTime: "09:00",
        endTime: "17:00",
      },
      { day: "Friday", isWorking: true, startTime: "09:00", endTime: "17:00" },
      {
        day: "Saturday",
        isWorking: true,
        startTime: "09:00",
        endTime: "17:00",
      },
      { day: "Sunday", isWorking: true, startTime: "09:00", endTime: "17:00" },
    ],
  },
});

UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("User", UserSchema);
