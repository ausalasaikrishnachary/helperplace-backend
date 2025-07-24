// routes/employer.js
const express = require("express");
const router = express.Router();
const db = require('../db'); // adjust path if needed
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure images folder exists
if (!fs.existsSync('images')) {
  fs.mkdirSync('images');
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profile_photo') {
      cb(null, 'images');
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'profile_photo' && imageTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to handle JSON fields if needed
const jsonFields = []; // Add any JSON fields you need to handle here

function stringifyJsonFields(data) {
  jsonFields.forEach(field => {
    if (data[field] && typeof data[field] !== 'string') {
      data[field] = JSON.stringify(data[field]);
    }
  });
  return data;
}

// POST or UPDATE employer record with photo upload support
router.post("/", upload.single('profile_photo'), async (req, res) => {
  const data = req.body;
  const { temporary_id, user_id } = data;

  if (!temporary_id || !user_id) {
    return res.status(400).json({ message: "temporary_id and user_id are required" });
  }

  try {
    // Handle file upload if present
    if (req.file) {
      data.profile_photo = `/images/${req.file.filename}`;
    }

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

// GET - Latest temporary_id
router.get("/latest-temporary-id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT temporary_id FROM employer ORDER BY id DESC LIMIT 1`
    );

    if (rows.length > 0) {
      res.json({ latest_temporary_id: rows[0].temporary_id });
    } else {
      res.status(404).json({ message: "No records found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// PUT - Update employer data by temporary_id and user_id with photo upload support
router.put("/", upload.single('profile_photo'), async (req, res) => {
  const data = req.body;
  const { temporary_id, user_id } = data;

  if (!temporary_id || !user_id) {
    return res.status(400).json({ message: "temporary_id and user_id are required" });
  }

  let setClause;
  let values;

  try {
    // Handle file upload if present
    if (req.file) {
      data.profile_photo = `/images/${req.file.filename}`;
    }

    // Filter out temporary_id and user_id from update fields
    const updateFields = Object.keys(data)
      .filter(key => key !== "temporary_id" && key !== "user_id");
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Build the SET clause and prepare values
    setClause = updateFields.map(key => `${key} = ?`).join(", ");
    
    // Convert array values to JSON strings
    values = updateFields.map(key => {
      const value = data[key];
      return Array.isArray(value) ? JSON.stringify(value) : value;
    });
    
    values.push(temporary_id, user_id);

    console.log("Executing query:", `UPDATE employer SET ${setClause} WHERE temporary_id = ? AND user_id = ?`);
    console.log("With values:", values);

    const [result] = await db.execute(
      `UPDATE employer SET ${setClause} WHERE temporary_id = ? AND user_id = ?`,
      values
    );

    if (result.affectedRows > 0) {
      res.json({ message: "Updated successfully" });
    } else {
      res.status(404).json({ message: "No record found to update" });
    }
  } catch (err) {
    console.error('Database error:', {
      error: err,
      constructedQuery: `UPDATE employer SET ${setClause} WHERE temporary_id = ? AND user_id = ?`,
      values: values,
      dataReceived: data
    });
    
    res.status(500).json({ 
      message: "Database error", 
      error: err.message
    });
  }
});

// DELETE - Delete employer data by temporary_id and user_id
router.delete("/", async (req, res) => {
  const { temporary_id, user_id } = req.body;

  if (!temporary_id || !user_id) {
    return res.status(400).json({ message: "temporary_id and user_id are required" });
  }

  try {
    // First get the record to check for profile photo
    const [record] = await db.execute(
      `SELECT profile_photo FROM employer WHERE temporary_id = ? AND user_id = ?`,
      [temporary_id, user_id]
    );

    // Delete the record
    const [result] = await db.execute(
      `DELETE FROM employer WHERE temporary_id = ? AND user_id = ?`,
      [temporary_id, user_id]
    );

    if (result.affectedRows > 0) {
      // If there was a profile photo, delete the file
      if (record.length > 0 && record[0].profile_photo) {
        const photoPath = path.join(__dirname, '..', record[0].profile_photo);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }
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