const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["owner", "groomer"], required: true },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.UserID = ret._id;
    delete ret.password;
  },
});

module.exports = mongoose.model("User", UserSchema);
