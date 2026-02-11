const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema(
  {
    registrationId: { type: Number, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    instructorId: { type: String, required: true, index: true },
    classTypeId: { type: String, required: true, index: true },

    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    status: { type: String, enum: ["active", "canceled"], default: "active" },
  },
  { timestamps: true },
);

RegistrationSchema.index({ studentId: 1, startTime: 1, endTime: 1 });
RegistrationSchema.index({ instructorId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model("Registration", RegistrationSchema);
