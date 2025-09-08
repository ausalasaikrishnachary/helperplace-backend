// routes/employer.js
const express = require("express");
const router = express.Router();
const db = require('../db'); // adjust path if needed
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const emailService = require('./emailService'); // Add this line

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

// Function to calculate filled columns percentage
async function calculateColumnsPercentage(data) {
  try {
    // Get all columns from the employer table except columns_percentage and auto-increment fields
    const [columnsInfo] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'employer' 
      AND COLUMN_NAME NOT IN ('columns_percentage', 'id')
    `);

    const totalColumns = columnsInfo.length;
    let filledColumns = 0;

    // Count how many columns are filled in the data
    for (const column of columnsInfo) {
      const columnName = column.COLUMN_NAME;
      if (data[columnName] !== undefined && data[columnName] !== null && data[columnName] !== '') {
        filledColumns++;
      }
    }

    // Calculate percentage
    const percentage = Math.round((filledColumns / totalColumns) * 100);
    return percentage;
  } catch (err) {
    console.error('Error calculating columns percentage:', err);
    return 0;
  }
}

// New endpoint for subscription reminders
router.get("/employer/check-subscriptions", async (req, res) => {
  try {
    const result = await emailService.checkAndSendSubscriptionReminders(db);
    res.json({
      message: "Subscription reminders processed",
      details: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error processing subscription reminders",
      error: err.message
    });
  }
});

// POST or UPDATE employer record with photo upload support
router.post("/employer", upload.single('profile_photo'), async (req, res) => {
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

    // Calculate columns percentage with the new data
    const percentage = await calculateColumnsPercentage(data);
    data.columns_percentage = percentage;

    // Check if the row exists
    const [existing] = await db.execute(
      `SELECT id, plan_name, plan_enddate FROM employer WHERE temporary_id = ? AND user_id = ?`,
      [temporary_id, user_id]
    );

    if (existing.length > 0) {
      // Row exists -> update
      const id = existing[0].id;
      const previousPlanName = existing[0].plan_name;
      const previousPlanEndDate = existing[0].plan_enddate;

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

      // Check if subscription was renewed
      // Check if subscription was renewed
      if (data.plan_name && data.plan_enddate &&
        (data.plan_name !== previousPlanName || data.plan_enddate !== previousPlanEndDate)) {

        // Get email from current data or existing record
        const email = data.email_id || existing[0].email_id;

        // Only send email if we have a valid email address
        if (email) {
          await emailService.sendSubscriptionRenewalConfirmation(
            email,
            data.name || existing[0].name,
            data.plan_name,
            data.plan_enddate
          );
          console.log(`Sent renewal confirmation to ${email}`);
        } else {
          console.log('Skipping email sending: No email address available');
        }
      }

      res.json({ message: "Updated successfully", id, columns_percentage: percentage });
    } else {
      // Insert new row
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => "?").join(", ");

      const [result] = await db.execute(
        `INSERT INTO employer (${keys.join(", ")}) VALUES (${placeholders})`,
        values
      );

      res.json({
        message: "Inserted successfully",
        id: result.insertId,
        columns_percentage: percentage
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// GET all employer data
router.get("/employer/all", async (req, res) => {
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
router.get("/employer/by-user", async (req, res) => {
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
router.get("/employer", async (req, res) => {
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

// GET employer data by id
router.get("/employer/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM employer WHERE id = ?`,
      [id]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "No data found for this id" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// GET - Latest temporary_id
router.get("/employer/get/latest-temporary-id", async (req, res) => {
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

// New endpoint for low views reminders
router.get("/employer/check-low-views", async (req, res) => {
  try {
    const result = await emailService.checkAndSendLowViewsReminders(db);
    res.json({
      message: "Low views reminders processed",
      details: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error processing low views reminders",
      error: err.message
    });
  }
});

// PUT - Update employer data by temporary_id and user_id with photo upload support
router.put("/employer/", upload.single('profile_photo'), async (req, res) => {
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

    // First get the existing record to check for subscription changes and merge data
    const [existing] = await db.execute(
      `SELECT * FROM employer WHERE temporary_id = ? AND user_id = ?`,
      [temporary_id, user_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }

    const previousPlanName = existing[0].plan_name;
    const previousPlanEndDate = existing[0].plan_enddate;

    // Merge existing data with new data to calculate percentage accurately
    const mergedData = { ...existing[0], ...data };

    // Calculate columns percentage with merged data
    const percentage = await calculateColumnsPercentage(mergedData);
    data.columns_percentage = percentage;

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

    const [result] = await db.execute(
      `UPDATE employer SET ${setClause} WHERE temporary_id = ? AND user_id = ?`,
      values
    );

    if (result.affectedRows > 0) {
      // Check if subscription was renewed
      if (data.plan_name && data.plan_enddate &&
        (data.plan_name !== previousPlanName || data.plan_enddate !== previousPlanEndDate)) {
        await emailService.sendSubscriptionRenewalConfirmation(
          data.email_id || existing[0].email_id,
          data.name || existing[0].name,
          data.plan_name,
          data.plan_enddate
        );
        console.log(`Sent renewal confirmation to ${data.email_id || existing[0].email_id}`);
      }

      res.json({
        message: "Updated successfully",
        columns_percentage: percentage
      });
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
router.delete("/employer", async (req, res) => {
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

// New endpoint to get columns percentage for a specific employer
router.get("/employer/columns-percentage/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }

  try {
    const [rows] = await db.execute(
      `SELECT columns_percentage, email_id, name FROM employer WHERE id = ?`,
      [id]
    );

    if (rows.length > 0) {
      const employer = rows[0];

      // Check if profile is incomplete (less than 100%)
      if (employer.columns_percentage < 100) {
        try {
          await sendIncompleteProfileReminder(
            employer.email_id,
            employer.name,
            employer.columns_percentage
          );
        } catch (emailErr) {
          console.error('Error sending incomplete profile reminder:', emailErr);
          // Continue with the response even if email fails
        }
      }

      res.json({ columns_percentage: employer.columns_percentage });
    } else {
      res.status(404).json({ message: "No data found for the given id" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// PUT - Update employer data by ID with photo upload support
router.put("/employer/:id", upload.single('profile_photo'), async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }

  let setClause;
  let values;

  try {
    // Handle file upload if present
    if (req.file) {
      data.profile_photo = `/images/${req.file.filename}`;
    }

    // First get the existing record to check for subscription changes and merge data
    const [existing] = await db.execute(
      `SELECT * FROM employer WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }

    const previousPlanName = existing[0].plan_name;
    const previousPlanEndDate = existing[0].plan_enddate;

    // Merge existing data with new data to calculate percentage accurately
    const mergedData = { ...existing[0], ...data };

    // Calculate columns percentage with merged data
    const percentage = await calculateColumnsPercentage(mergedData);
    data.columns_percentage = percentage;

    // Filter out id from update fields
    const updateFields = Object.keys(data)
      .filter(key => key !== "id");

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

    values.push(id);

    const [result] = await db.execute(
      `UPDATE employer SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows > 0) {
      // Check if subscription was renewed
      if (data.plan_name && data.plan_enddate &&
        (data.plan_name !== previousPlanName || data.plan_enddate !== previousPlanEndDate)) {
        await emailService.sendSubscriptionRenewalConfirmation(
          data.email_id || existing[0].email_id,
          data.name || existing[0].name,
          data.plan_name,
          data.plan_enddate
        );
        console.log(`Sent renewal confirmation to ${data.email_id || existing[0].email_id}`);
      }

      res.json({
        message: "Updated successfully",
        columns_percentage: percentage
      });
    } else {
      res.status(404).json({ message: "No record found to update" });
    }
  } catch (err) {
    console.error('Database error:', {
      error: err,
      constructedQuery: `UPDATE employer SET ${setClause} WHERE id = ?`,
      values: values,
      dataReceived: data
    });

    res.status(500).json({
      message: "Database error",
      error: err.message
    });
  }
});

module.exports = router;