const Student = require("../src/models/Student.js");
const Instructor = require("../src/models/Instructor");
const ClassType = require("../src/models/ClassType");

async function masterListData() {
  const instructorCount = await Instructor.countDocuments();
  if (instructorCount === 0) {
    await Instructor.insertMany(
      [
        { instructorId: 111, name: "Instructor 111" },
        { instructorId: 222, name: "Instructor 222" },
        { instructorId: 333, name: "Instructor 333" },
        { instructorId: 444, name: "Instructor 444" },
        { instructorId: 555, name: "Instructor 555" },
      ],
      { ordered: false },
    );
  }

  const classCount = await ClassType.countDocuments();

  if (classCount === 0) {
    await ClassType.insertMany(
      [
        { classId: 1, title: "Beginner Driving Course" },
        { classId: 2, title: "Defensive Driving Course" },
        { classId: 3, title: "Parking & Maneuvering Skills" },
        { classId: 4, title: "Highway Driving Practice" },
        { classId: 5, title: "Road Test Preparation" },
      ],
      { ordered: false },
    );
  }

  const studentCount = await Student.countDocuments();
  if (studentCount === 0) {
    await Student.insertMany(
      [{ studentId: 1 }, { studentId: 2 }, { studentId: 3 }],
      { ordered: false },
    );
  }
}

module.exports = { masterListData };
