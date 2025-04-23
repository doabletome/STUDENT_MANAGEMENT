import pool from "../db.js";
import Joi from "joi";

const schoolSchema = Joi.object({
  name: Joi.string().min(1).required(),
  address: Joi.string().min(1).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
});

function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function addSchool(req, res, next) {
  try {
    const { error, value } = schoolSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, address, latitude, longitude } = value;
    const [result] = await pool.execute(
      "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
      [name, address, latitude, longitude]
    );

    res
      .status(201)
      .json({ id: result.insertId, name, address, latitude, longitude });
  } catch (err) {
    next(err);
  }
}

export async function listSchools(req, res, next) {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);
    if (isNaN(userLat) || isNaN(userLng)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing lat/lng parameters" });
    }

    const [rows] = await pool.query("SELECT * FROM schools");
    const schoolsWithDistance = rows.map((s) => ({
      ...s,
      distance: getDistance(userLat, userLng, s.latitude, s.longitude),
    }));

    schoolsWithDistance.sort((a, b) => a.distance - b.distance);
    res.json(schoolsWithDistance);
  } catch (err) {
    next(err);
  }
}
