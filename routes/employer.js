const express = require("express");
const router = express.Router();
const db = require("../db");

// Create employer
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const sql = `INSERT INTO employer SET ?`;
    const [result] = await db.query(sql, {
      ...data,
      preferred_years_of_experience: JSON.stringify(data.preferred_years_of_experience),
      candidates_country_experience: JSON.stringify(data.candidates_country_experience),
      preferred_candidates_country: JSON.stringify(data.preferred_candidates_country),
      main_skills: JSON.stringify(data.main_skills),
      cooking_skills: JSON.stringify(data.cooking_skills),
      other_skills: JSON.stringify(data.other_skills),
    });
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to insert employer" });
  }
});

// Get all employers
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM employer");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve employers" });
  }
});

// Get single employer by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM employer WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Employer not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve employer" });
  }
});

// Update employer
router.put("/:id", async (req, res) => {
  try {
    const data = req.body;
    const sql = `UPDATE employer SET ? WHERE id = ?`;
    const [result] = await db.query(sql, [
      {
        ...data,
        preferred_years_of_experience: JSON.stringify(data.preferred_years_of_experience),
        candidates_country_experience: JSON.stringify(data.candidates_country_experience),
        preferred_candidates_country: JSON.stringify(data.preferred_candidates_country),
        main_skills: JSON.stringify(data.main_skills),
        cooking_skills: JSON.stringify(data.cooking_skills),
        other_skills: JSON.stringify(data.other_skills),
      },
      req.params.id,
    ]);
    res.json({ affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update employer" });
  }
});

// Delete employer
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM employer WHERE id = ?", [req.params.id]);
    res.json({ affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete employer" });
  }
});

module.exports = router;
