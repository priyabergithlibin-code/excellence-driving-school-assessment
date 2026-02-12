const AppConfig = require("../models/AppConfig");
const { env } = require("../config/env");

function num(v, name) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error(`${name} must be a number >= 1`);
    err.statusCode = 400;
    throw err;
  }
  return n;
}

async function getConfig(req, res, next) {
  try {
    const doc = await AppConfig.findOne().lean();

    const effective = {
      MAX_CLASSES_PER_STUDENT_PER_DAY:
        doc?.MAX_CLASSES_PER_STUDENT_PER_DAY ??
        env.MAX_CLASSES_PER_STUDENT_PER_DAY,
      MAX_CLASSES_PER_INSTRUCTOR_PER_DAY:
        doc?.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY ??
        env.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY,
      CLASS_DURATION_MINUTES:
        doc?.CLASS_DURATION_MINUTES ?? env.CLASS_DURATION_MINUTES,
      MAX_CLASSES_PER_CLASSTYPE_PER_DAY:
        doc?.MAX_CLASSES_PER_CLASSTYPE_PER_DAY ??
        env.MAX_CLASSES_PER_CLASSTYPE_PER_DAY,
    };

    res.json({ ok: true, config: effective });
  } catch (e) {
    next(e);
  }
}

async function updateConfig(req, res, next) {
  try {
    const payload = {
      MAX_CLASSES_PER_STUDENT_PER_DAY: num(
        req.body.MAX_CLASSES_PER_STUDENT_PER_DAY,
        "MAX_CLASSES_PER_STUDENT_PER_DAY",
      ),
      MAX_CLASSES_PER_INSTRUCTOR_PER_DAY: num(
        req.body.MAX_CLASSES_PER_INSTRUCTOR_PER_DAY,
        "MAX_CLASSES_PER_INSTRUCTOR_PER_DAY",
      ),
      CLASS_DURATION_MINUTES: num(
        req.body.CLASS_DURATION_MINUTES,
        "CLASS_DURATION_MINUTES",
      ),
      MAX_CLASSES_PER_CLASSTYPE_PER_DAY: num(
        req.body.MAX_CLASSES_PER_CLASSTYPE_PER_DAY,
        "MAX_CLASSES_PER_CLASSTYPE_PER_DAY",
      ),
    };

    const updated = await AppConfig.findOneAndUpdate(
      {},
      { $set: payload },
      { new: true, upsert: true },
    ).lean();

    res.json({ ok: true, message: "Saved", config: updated });
  } catch (e) {
    next(e);
  }
}

async function resetConfig(req, res, next) {
  try {
    await AppConfig.deleteMany({});
    res.json({ ok: true, message: "Reset to defaults" });
  } catch (e) {
    next(e);
  }
}

module.exports = { getConfig, updateConfig, resetConfig };
