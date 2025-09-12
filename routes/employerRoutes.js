const express = require("express");
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const emailService = require('./emailService');

// Ensure images folder exists with proper path resolution
const imagesDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profile_photo') {
      cb(null, imagesDir);
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

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Helper function for JSON fields in the schema
const jsonFields = [
  'preferred_years_of_experience',
  'candidates_country_experience',
  'preferred_candidates_country',
  'main_skills',
  'cooking_skills',
  'other_skills'
];

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

// Endpoint for subscription reminders
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

// List of all possible fields for insert/update excluding id (auto increment)
const employerFields = [
  'user_id', 'temporary_id', 'emp_name', 'domestic_worker_category', 'job_type', 'job_title',
  'job_description', 'job_starting_date', 'prefer_contract_status', 'looking_worker_for',
  'candidate_experience', 'prefer_experience', 'preferred_years_of_experience', 'gulf_experience_years',
  'total_experience_years', 'candidates_country_experience', 'preferred_candidates_country',
  'preferred_language_for_worker', 'locaion_preference', 'most_important_skill', 'main_skills',
  'cooking_skills', 'other_skills', 'gender', 'religion', 'education_level', 'age', 'working_city',
  'state_or_province', 'name', 'email_id', 'whatsapp_number_country_code', 'whatsapp_number',
  'phone_number_country_code', 'phone_number', 'nationality', 'organization_name',
  'offer_for_selected_candidates', 'country_currency', 'minimum_monthly_salary', 'maximum_monthly_salary',
  'negotiable', 'adults', 'children', 'type_of_house', 'rooms', 'bathrooms', 'have_pets',
  'worker_nationality', 'phone_country_code', 'location_preference', 'domestic_worker_name',
  'have_domestic_worker', 'nationality_of_domestic_worker', 'status', 'subscription', 'plan_name',
  'plan_days', 'plan_startdate', 'plan_enddate', 'posted_by', 'view_count', 'posted_on',
  'profile_photo', 'offer', 'profile_photo_url', 'subscription_plan_id', 'columns_percentage'
];

// POST or UPDATE employer record with photo upload support
router.post("/employer", upload.single('profile_photo'), handleMulterError, async (req, res) => {
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
    // Process JSON fields
    stringifyJsonFields(data);

    // Calculate columns percentage
    const percentage = await calculateColumnsPercentage(data);
    data.columns_percentage = percentage;

    // Check if the row exists
    const [existing] = await db.execute(
      `SELECT id, plan_name, plan_enddate, email_id, name FROM employer WHERE temporary_id = ? AND user_id = ?`,
      [temporary_id, user_id]
    );

    if (existing.length > 0) {
      // Row exists, update
      const id = existing[0].id;
      const previousPlanName = existing[0].plan_name;
      const previousPlanEndDate = existing[0].plan_enddate;

      // Only update fields provided
      const updateData = {};
      employerFields.forEach(key => {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(", ");
      const values = Object.keys(updateData).map(key => updateData[key]);

      await db.execute(
        `UPDATE employer SET ${fields} WHERE temporary_id = ? AND user_id = ?`,
        [...values, temporary_id, user_id]
      );

      // Subscription renewal check and email notification
      if (data.plan_name && data.plan_enddate && (data.plan_name !== previousPlanName || data.plan_enddate !== previousPlanEndDate)) {
        await emailService.sendSubscriptionRenewalConfirmation(
          data.email_id || existing[0].email_id,
          data.name || existing[0].name,
          data.plan_name,
          data.plan_enddate
        );
      }

      res.json({ message: "Updated successfully", id, columns_percentage: percentage });
    } else {
      // Insert new row, only provided fields
      const columns = [];
      const placeholders = [];
      const values = [];

      // Required fields always included
      columns.push('user_id', 'temporary_id');
      placeholders.push('?', '?');
      values.push(user_id, temporary_id);

      employerFields.forEach(field => {
        if (field !== 'user_id' && field !== 'temporary_id' && data[field] !== undefined) {
          columns.push(field);
          placeholders.push('?');
          values.push(data[field]);
        }
      });

      const query = `INSERT INTO employer (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
      const [result] = await db.execute(query, values);

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

// PUT - Update employer data by temporary_id and user_id with photo upload support
router.put("/employer/", upload.single('profile_photo'), handleMulterError, async (req, res) => {
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
    
    // Stringify JSON fields properly
    stringifyJsonFields(data);

    // Get the existing record to check for subscription changes and merge data
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
    const percentage = await calculateColumnsPercentage(mergedData);
    data.columns_percentage = percentage;

    // Build update set and values for only provided fields
    const updateFields = employerFields.filter(
      key => key !== "temporary_id" && key !== "user_id" && data[key] !== undefined
    );

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Prepare values properly for MySQL
    values = updateFields.map(key => {
      const value = data[key];
      
      // Handle arrays and objects by stringifying them
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return JSON.stringify(value);
      }
      
      // Handle dates - convert to MySQL format
      if (value instanceof Date) {
        return value.toISOString().slice(0, 19).replace('T', ' ');
      }
      
      // Handle boolean values
      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }
      
      return value;
    });

    setClause = updateFields.map(key => `${key} = ?`).join(", ");
    
    // Add the WHERE clause values
    values.push(temporary_id, user_id);

    const [result] = await db.execute(
      `UPDATE employer SET ${setClause} WHERE temporary_id = ? AND user_id = ?`,
      values
    );

    if (result.affectedRows > 0) {
      if (data.plan_name && data.plan_enddate &&
        (data.plan_name !== previousPlanName || data.plan_enddate !== previousPlanEndDate)) {
        await emailService.sendSubscriptionRenewalConfirmation(
          data.email_id || existing[0].email_id,
          data.name || existing[0].name,
          data.plan_name,
          data.plan_enddate
        );
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

// Add this helper function if you don't have it already
function stringifyJsonFields(data) {
  const jsonFields = [
    'preferred_years_of_experience',
    'candidates_country_experience',
    'preferred_candidates_country',
    'preferred_language_for_worker',
    'main_skills',
    'cooking_skills',
    'other_skills',
    'offer_for_selected_candidates'
  ];

  jsonFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      if (typeof data[field] === 'string') {
        try {
          // If it's already a JSON string, parse and re-stringify to ensure validity
          JSON.parse(data[field]);
          data[field] = data[field]; // Already valid JSON string
        } catch (e) {
          // If it's not valid JSON, treat as regular string
          data[field] = JSON.stringify(data[field]);
        }
      } else {
        data[field] = JSON.stringify(data[field]);
      }
    }
  });
}

// PUT - Update employer data by ID with photo upload support
router.put("/employer/:id", upload.single('profile_photo'), handleMulterError, async (req, res) => {
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
    stringifyJsonFields(data);

    // Get existing record and merge for accurate % calculation
    const [existing] = await db.execute(
      `SELECT * FROM employer WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }

    const previousPlanName = existing[0].plan_name;
    const previousPlanEndDate = existing[0].plan_enddate;

    const mergedData = { ...existing[0], ...data };
    const percentage = await calculateColumnsPercentage(mergedData);
    data.columns_percentage = percentage;

    // Build update set and values for only provided fields
    const updateFields = employerFields.filter(
      key => key !== "id" && data[key] !== undefined
    );

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    setClause = updateFields.map(key => `${key} = ?`).join(", ");
    values = updateFields.map(key => data[key]);
    values.push(id);

    const [result] = await db.execute(
      `UPDATE employer SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows > 0) {
      if (data.plan_name && data.plan_enddate &&
        (data.plan_name !== previousPlanName || data.plan_enddate !== previousPlanEndDate)) {
        await emailService.sendSubscriptionRenewalConfirmation(
          data.email_id || existing[0].email_id,
          data.name || existing[0].name,
          data.plan_name,
          data.plan_enddate
        );
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

// DELETE - Delete employer data by temporary_id and user_id
router.delete("/employer", async (req, res) => {
  const { temporary_id, user_id } = req.body;

  if (!temporary_id || !user_id) {
    return res.status(400).json({ message: "temporary_id and user_id are required" });
  }

  try {
    // Get the record to check for profile photo
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
        const photoPath = path.join(imagesDir, path.basename(record[0].profile_photo));
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

// DELETE - Delete employer data by id
router.delete("/employer/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }

  try {
    // Get the record to check for profile photo
    const [record] = await db.execute(
      `SELECT profile_photo FROM employer WHERE id = ?`,
      [id]
    );

    // Delete the record
    const [result] = await db.execute(
      `DELETE FROM employer WHERE id = ?`,
      [id]
    );

    if (result.affectedRows > 0) {
      // If there was a profile photo, delete the file
      if (record.length > 0 && record[0].profile_photo) {
        const photoPath = path.join(imagesDir, path.basename(record[0].profile_photo));
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

// Get columns percentage and send reminder if incomplete
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
      // If incomplete profile, send reminder
      if (employer.columns_percentage < 100) {
        try {
          await emailService.sendIncompleteProfileReminder(
            employer.email_id,
            employer.name,
            employer.columns_percentage
          );
        } catch (emailErr) {
          console.error('Error sending incomplete profile reminder:', emailErr);
          // Continue with response even if email fails
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

module.exports = router;
