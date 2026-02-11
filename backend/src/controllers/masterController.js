const Student = require("../models/student.js");
const Instructor = require("../models/Instructor.js");
const ClassType = require("../models/ClassType.js");

async function seedMaster(req, res, next) {
  try {
    const instructors = req.body.instructors || [
      { instructorId: "I001", name: "Instructor 1" },
      { instructorId: "I002", name: "Instructor 2" },
    ];

    const classTypes = req.body.classTypes || [
      { classTypeId: "C001", name: "Type 1" },
      { classTypeId: "C002", name: "Type 2" },
    ];

    // Upsert instructors
    for (const i of instructors) {
      await Instructor.updateOne(
        { instructorId: i.instructorId },
        { $set: { name: i.name || "" } },
        { upsert: true },
      );
    }

    // Upsert classTypes
    for (const c of classTypes) {
      await ClassType.updateOne(
        { classTypeId: c.classTypeId },
        { $set: { name: c.name || "" } },
        { upsert: true },
      );
    }

    res.json({
      ok: true,
      message: "Master data seeded",
      instructors,
      classTypes,
    });
  } catch (e) {
    next(e);
  }
}

async function listMaster(req, res, next) {
  try {
    const [students, instructors, classTypes] = await Promise.all([
      Student.find().lean(),
      Instructor.find().lean(),
      ClassType.find().lean(),
    ]);

    res.json({ ok: true, students, instructors, classTypes });
  } catch (e) {
    next(e);
  }
}

module.exports = { seedMaster, listMaster };
