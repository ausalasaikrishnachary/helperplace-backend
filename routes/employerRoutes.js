// routes/employer.js
const express = require("express");
const router = express.Router();
const db = require('../db');// adjust path if needed

// POST or UPDATE employer record
router.post("/", async (req, res) => {
  const data = req.body;
  const { temporary_id, user_id } = data;

  if (!temporary_id || !user_id) {
    return res.status(400).json({ message: "temporary_id and user_id are required" });
  }

  try {
    // Check if the row exists
    const [existing] = await db.execute(
      `SELECT id FROM employer WHERE temporary_id = ? AND user_id = ?`,
      [temporary_id, user_id]
    );

    if (existing.length > 0) {
      // Row exists -> update
      const id = existing[0].id;

      const fields = Object.keys(data)
        .filter(key => key !== "temporary_id" && key !== "user_id")
        .map(key => `${key} = ?`)
        .join(", ");

      const values = Object.keys(data)
        .filter(key => key !== "temporary_id" && key !== "user_id")
        .map(key => data[key]);

      await db.execute(
        `UPDATE employer SET ${fields} WHERE temporary_id = ? AND user_id = ?`,
        [...values, temporary_id, user_id]
      );

      res.json({ message: "Updated successfully", id });
    } else {
      // Insert new row
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => "?").join(", ");

      await db.execute(
        `INSERT INTO employer (${keys.join(", ")}) VALUES (${placeholders})`,
        values
      );

      res.json({ message: "Inserted successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// GET all employer data
router.get("/all", async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM employer`);

    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.status(404).json({ message: "No data found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});


// GET employer data by user_id only
router.get("/by-user", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM employer WHERE user_id = ?`,
      [user_id]
    );

    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.status(404).json({ message: "No data found for this user_id" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});



// GET employer data by temporary_id and user_id
router.get("/", async (req, res) => {
  const { temporary_id, user_id } = req.query;

  if (!temporary_id || !user_id) {
    return res.status(400).json({ message: "temporary_id and user_id are required" });
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM employer WHERE temporary_id = ? AND user_id = ?`,
      [temporary_id, user_id]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "No data found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// PUT - Update employer data by temporary_id and user_id
router.put("/", async (req, res) => {
  const data = req.body;
  const { temporary_id, user_id } = data;

  if (!temporary_id || !user_id) {
    return res.status(400).json({ message: "temporary_id and user_id are required" });
  }

  try {
    // Build update fields dynamically
    const fields = Object.keys(data)
      .filter(key => key !== "temporary_id" && key !== "user_id")
      .map(key => `${key} = ?`)
      .join(", ");

    const values = Object.keys(data)
      .filter(key => key !== "temporary_id" && key !== "user_id")
      .map(key => data[key]);

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const [result] = await db.execute(
      `UPDATE employer SET ${fields} WHERE temporary_id = ? AND user_id = ?`,
      [...values, temporary_id, user_id]
    );

    if (result.affectedRows > 0) {
      res.json({ message: "Updated successfully" });
    } else {
      res.status(404).json({ message: "No record found to update" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// DELETE - Delete employer data by temporary_id and user_id
router.delete("/", async (req, res) => {
  const { temporary_id, user_id } = req.body;

  if (!temporary_id || !user_id) {
    return res.status(400).json({ message: "temporary_id and user_id are required" });
  }

  try {
    const [result] = await db.execute(
      `DELETE FROM employer WHERE temporary_id = ? AND user_id = ?`,
      [temporary_id, user_id]
    );

    if (result.affectedRows > 0) {
      res.json({ message: "Deleted successfully" });
    } else {
      res.status(404).json({ message: "No record found to delete" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});


module.exports = router;