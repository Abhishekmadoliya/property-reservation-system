const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    number: { type: Number, required: true, uniquie: true },
    email: { type: String, required: true, uniquie: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'host', 'admin'], default: 'user' },
    hostApplicationStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    hostApplicationDate: { type: Date },
    hostInfo: {
      about: { type: String },
      location: { type: String },
      experience: { type: String }
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
