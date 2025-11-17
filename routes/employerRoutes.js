const express = require("express");
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const emailService = require('./emailService');
const razorpay = require("./razorpay");
const { transporter, ADMIN_EMAIL } = require('./nodemailer');

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
  'preferred_language_for_worker',
  'main_skills',
  'cooking_skills',
  'other_skills',
  'offer_for_selected_candidates'
];

// Date conversion function for MySQL
function convertToMySQLDateTime(dateValue) {
  if (!dateValue) return null;

  try {
    // If it's already in MySQL format, return as is
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    // If it's an ISO string or Date object, convert to MySQL format
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return null; // Invalid date
    }

    return date.toISOString().slice(0, 19).replace('T', ' ');
  } catch (error) {
    console.error('Error converting date:', error);
    return null;
  }
}

// Function to prepare data for MySQL, handling dates, JSON, and boolean values
// In your backend route file, update the prepareDataForMySQL function:

function prepareDataForMySQL(data) {
    const preparedData = { ...data };

    // Handle date fields
    const dateFields = [
        'plan_startdate',
        'plan_enddate',
        'posted_on'
    ];

    dateFields.forEach(field => {
        if (preparedData[field] !== undefined && preparedData[field] !== null) {
            preparedData[field] = convertToMySQLDateTime(preparedData[field]);
        }
    });

    // Special handling for job_starting_date
    if (preparedData.job_starting_date !== undefined && preparedData.job_starting_date !== null) {
        if (preparedData.job_starting_date === 'Immediately') {
            // Store "Immediately" as a string
            preparedData.job_starting_date = 'Immediately';
        } else {
            // Convert date string to MySQL format
            preparedData.job_starting_date = convertToMySQLDateTime(preparedData.job_starting_date);
        }
    }

    // Handle JSON fields - ensure they are properly stringified
    jsonFields.forEach(field => {
        if (preparedData[field] !== undefined && preparedData[field] !== null) {
            if (typeof preparedData[field] === 'string') {
                try {
                    // If it's already a JSON string, ensure it's valid
                    JSON.parse(preparedData[field]);
                    // If it parses successfully, keep it as is
                } catch (e) {
                    // If it's not valid JSON, wrap it in array and stringify
                    preparedData[field] = JSON.stringify([preparedData[field]]);
                }
            } else if (Array.isArray(preparedData[field])) {
                // If it's an array, stringify it
                preparedData[field] = JSON.stringify(preparedData[field]);
            } else {
                // For other types, stringify as array
                preparedData[field] = JSON.stringify([preparedData[field]]);
            }
        }
    });

    // Handle boolean fields
    const booleanFields = ['negotiable', 'have_pets', 'have_domestic_worker'];
    booleanFields.forEach(field => {
        if (preparedData[field] !== undefined && preparedData[field] !== null) {
            if (typeof preparedData[field] === 'boolean') {
                preparedData[field] = preparedData[field] ? 1 : 0;
            } else if (typeof preparedData[field] === 'string') {
                preparedData[field] = preparedData[field] === 'true' || preparedData[field] === '1' ? 1 : 0;
            } else if (typeof preparedData[field] === 'number') {
                preparedData[field] = preparedData[field] ? 1 : 0;
            }
        }
    });

    // Handle numeric fields
    const numericFields = [
        'gulf_experience_years',
        'total_experience_years',
        'minimum_monthly_salary',
        'maximum_monthly_salary',
        'adults',
        'children',
        'rooms',
        'bathrooms',
        'view_count',
        'plan_days',
        'payment_amount',
        'columns_percentage'
    ];

    numericFields.forEach(field => {
        if (preparedData[field] !== undefined && preparedData[field] !== null) {
            if (typeof preparedData[field] === 'string') {
                const num = parseFloat(preparedData[field]);
                preparedData[field] = isNaN(num) ? 0 : num;
            }
        }
    });

    return preparedData;
}

// Update the convertToMySQLDateTime function to be more robust:
function convertToMySQLDateTime(dateValue) {
    if (!dateValue || dateValue === '' || dateValue === 'Immediately') {
        return null;
    }

    try {
        // If it's already in MySQL format, return as is
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateValue)) {
            return dateValue;
        }

        // If it's an ISO string or Date object, convert to MySQL format
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            console.warn('Invalid date passed to convertToMySQLDateTime:', dateValue);
            return null;
        }

        return date.toISOString().slice(0, 19).replace('T', ' ');
    } catch (error) {
        console.error('Error converting date:', error);
        return null;
    }
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
  'user_id', 'temporary_id', 'emp_name', 'domestic_worker_category', 'job_type',
  'job_title', 'job_description', 'job_starting_date', 'prefer_contract_status',
  'looking_worker_for', 'candidate_experience', 'prefer_experience',
  'preferred_years_of_experience', 'gulf_experience_years', 'total_experience_years',
  'candidates_country_experience', 'preferred_candidates_country',
  'preferred_language_for_worker', 'locaion_preference', 'most_important_skill',
  'main_skills', 'cooking_skills', 'other_skills', 'gender', 'religion',
  'education_level', 'age', 'working_city', 'state_or_province', 'country',
  'name', 'contact_source', 'email_id', 'whatsapp_number_country_code',
  'whatsapp_number', 'phone_number_country_code', 'phone_number', 'nationality',
  'organization_name', 'offer_for_selected_candidates', 'country_currency',
  'minimum_monthly_salary', 'maximum_monthly_salary', 'negotiable', 'adults',
  'children', 'type_of_house', 'rooms', 'bathrooms', 'have_pets', 'worker_nationality',
  'phone_country_code', 'location_preference', 'domestic_worker_name',
  'have_domestic_worker', 'nationality_of_domestic_worker', 'status', 'subscription',
  'plan_name', 'plan_days', 'plan_startdate', 'plan_enddate', 'payment_amount',
  'payment_status', 'posted_by', 'view_count', 'posted_on', 'profile_photo',
  'offer', 'profile_photo_url', 'subscription_plan_id', 'columns_percentage',
  'currency_name'
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

    // Prepare data for MySQL (handle dates, JSON, and types)
    const preparedData = prepareDataForMySQL(data);

    // Calculate columns percentage
    const percentage = await calculateColumnsPercentage(preparedData);
    preparedData.columns_percentage = percentage;

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
        if (preparedData[key] !== undefined) {
          updateData[key] = preparedData[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(", ");
      const values = Object.values(updateData);

      await db.execute(
        `UPDATE employer SET ${fields} WHERE temporary_id = ? AND user_id = ?`,
        [...values, temporary_id, user_id]
      );

      // Subscription renewal check and email notification
      if (preparedData.plan_name && preparedData.plan_enddate && (preparedData.plan_name !== previousPlanName || preparedData.plan_enddate !== previousPlanEndDate)) {
        await emailService.sendSubscriptionRenewalConfirmation(
          preparedData.email_id || existing[0].email_id,
          preparedData.name || existing[0].name,
          preparedData.plan_name,
          preparedData.plan_enddate
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
        if (field !== 'user_id' && field !== 'temporary_id' && preparedData[field] !== undefined) {
          columns.push(field);
          placeholders.push('?');
          values.push(preparedData[field]);
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
    console.error('Database error:', err);
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

  try {
    // Handle file upload if present
    if (req.file) {
      data.profile_photo = `/images/${req.file.filename}`;
    }

    // Prepare data for MySQL (handle dates, JSON, and types)
    const preparedData = prepareDataForMySQL(data);

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
    const mergedData = { ...existing[0], ...preparedData };
    const percentage = await calculateColumnsPercentage(mergedData);
    preparedData.columns_percentage = percentage;

    // Build update set and values for only provided fields
    const updateFields = employerFields.filter(
      key => key !== "temporary_id" && key !== "user_id" && preparedData[key] !== undefined
    );

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Prepare values properly for MySQL
    const values = updateFields.map(key => preparedData[key]);
    const setClause = updateFields.map(key => `${key} = ?`).join(", ");

    // Add the WHERE clause values
    values.push(temporary_id, user_id);

    const [result] = await db.execute(
      `UPDATE employer SET ${setClause} WHERE temporary_id = ? AND user_id = ?`,
      values
    );

    if (result.affectedRows > 0) {
      if (preparedData.plan_name && preparedData.plan_enddate &&
        (preparedData.plan_name !== previousPlanName || preparedData.plan_enddate !== previousPlanEndDate)) {
        await emailService.sendSubscriptionRenewalConfirmation(
          preparedData.email_id || existing[0].email_id,
          preparedData.name || existing[0].name,
          preparedData.plan_name,
          preparedData.plan_enddate
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
      dataReceived: data
    });
    res.status(500).json({
      message: "Database error",
      error: err.message
    });
  }
});

// PUT - Update employer data by ID with photo upload support
router.put("/employer/:id", upload.single('profile_photo'), handleMulterError, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }

  try {
    // Handle file upload if present
    if (req.file) {
      data.profile_photo = `/images/${req.file.filename}`;
    }

    // Prepare data for MySQL (handle dates, JSON, and types)
    const preparedData = prepareDataForMySQL(data);

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

    const mergedData = { ...existing[0], ...preparedData };
    const percentage = await calculateColumnsPercentage(mergedData);
    preparedData.columns_percentage = percentage;

    // Build update set and values for only provided fields
    const updateFields = employerFields.filter(
      key => key !== "id" && preparedData[key] !== undefined
    );

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const setClause = updateFields.map(key => `${key} = ?`).join(", ");
    const values = updateFields.map(key => preparedData[key]);
    values.push(id);

    const [result] = await db.execute(
      `UPDATE employer SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows > 0) {
      if (preparedData.plan_name && preparedData.plan_enddate &&
        (preparedData.plan_name !== previousPlanName || preparedData.plan_enddate !== previousPlanEndDate)) {
        await emailService.sendSubscriptionRenewalConfirmation(
          preparedData.email_id || existing[0].email_id,
          preparedData.name || existing[0].name,
          preparedData.plan_name,
          preparedData.plan_enddate
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

// GET employer data by user_id (for shortlist details)
router.get("/employer/user/:user_id", async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM employer WHERE user_id = ?`,
      [user_id]
    );
    if (rows.length > 0) {
      res.json(rows[0]); // Return first record instead of array
    } else {
      res.status(404).json({ message: "No employer data found for this user_id" });
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

// ✅ Helper: Convert ISO Date String to MySQL DateTime format
// ✅ Helper: Convert ISO Date String to MySQL DateTime format
function convertToMySQLDateTime(dateString) {
    if (!dateString || dateString === '') {
        return null;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.warn("⚠️ Invalid date passed to convertToMySQLDateTime:", dateString);
        return null;
    }
    return date.toISOString().slice(0, 19).replace("T", " ");
}

// ✅ Helper: Convert UNIX timestamp (seconds) to dd/mm/yyyy
function formatUnixDate(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
}

// 🔹 Create subscription
router.post("/subscription/create", async (req, res) => {
  try {
    const { plan_id, customer_id, plan_name, plan_days, user_id } = req.body;

    if (!plan_id || !customer_id) {
      return res.status(400).json({
        success: false,
        message: "plan_id and customer_id are required",
      });
    }

    // ✅ Extract numeric value from plan_days like "7 Days" → 7
    const planDays = parseInt(plan_days);
    if (isNaN(planDays) || planDays <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan_days value. Expected format like '7 Days'.",
      });
    }

    // 🕒 Fix: Convert Date.now() to seconds
    const startAt = Math.floor(Date.now() / 1000) + 60;

    // ✅ Calculate next due & expiry in seconds
    const nextDueSeconds = planDays * 24 * 60 * 60;
    const totalCount = Math.ceil(365 / planDays);
    const expireBy = startAt + nextDueSeconds * totalCount;

    // console.log("📅 Start Date:", formatUnixDate(startAt));
    // console.log("📅 Expire By:", formatUnixDate(expireBy));

    // ✅ Create Razorpay Subscription
    const razorpaysubscription = await razorpay.subscriptions.create({
      plan_id,
      customer_id,
      total_count: totalCount,
      customer_notify: 1,
      notes: {
        plan_name,
        plan_days,
        user_id,
      },
    });

    // console.log("✅ Razorpay Subscription Created:", razorpaysubscription);

    // 🗓️ Format key dates for response
    const formattedDates = {
      charge_at: formatUnixDate(razorpaysubscription.charge_at),
      start_at: formatUnixDate(razorpaysubscription.start_at),
      current_start: formatUnixDate(razorpaysubscription.current_start),
      current_end: formatUnixDate(razorpaysubscription.current_end),
      expire_by: formatUnixDate(razorpaysubscription.expire_by),
      created_at: formatUnixDate(razorpaysubscription.created_at),
    };

    // ✅ Return success
    res.json({
      success: true,
      message: "Razorpay subscription created successfully",
      subscription_id: razorpaysubscription.id,
      subscription_status: razorpaysubscription.status,
      formatted_dates: formattedDates,
      total_count: razorpaysubscription.total_count,
      paid_count: razorpaysubscription.paid_count,
      entity: razorpaysubscription.entity,
      customer_id: razorpaysubscription.customer_id,
      plan_id: razorpaysubscription.plan_id,
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay subscription:", error);
    res.status(500).json({
      success: false,
      message:
        error.error?.description || error.message || "Internal server error",
    });
  }
});

router.put("/subscription/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      subscription_plan_id,
      subscription,
      plan_id,
      plan_name,
      plan_days,
      plan_startdate,
      plan_enddate,
      payment_status,
      payment_amount,
      razorpay_subscription_id,
      customer_id,
      subscription_status
    } = req.body;

    // console.log("🟡 Updating User Subscription:", req.body);

    // if (!plan_id || !customer_id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "plan_id and customer_id are required",
    //   });
    // }

    // ✅ Convert to MySQL DateTime
    const mysqlPlanStartDate = convertToMySQLDateTime(plan_startdate);
    const mysqlPlanEndDate = convertToMySQLDateTime(plan_enddate);

    const [result] = await db.query(
      `UPDATE users 
       SET subscription_plan_id = ?, 
           subscription = ?, 
           plan_name = ?, 
           plan_days = ?, 
           plan_startdate = ?, 
           plan_enddate = ?, 
           next_duedate = ?,
           payment_status = ?, 
           payment_amount = ?, 
           razorpay_subscription_id = ?, 
           razorpay_plan_id = ? ,
           subscription_status = ?
       WHERE id = ?`,
      [
        subscription_plan_id,
        subscription,
        plan_name,
        plan_days,
        mysqlPlanStartDate,
        mysqlPlanEndDate,
        mysqlPlanEndDate,
        payment_status,
        payment_amount,
        razorpay_subscription_id,
        plan_id,
        subscription_status,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Subscription details updated in MySQL successfully",
    });
  } catch (error) {
    console.error("❌ Error updating subscription:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

router.post('/subscription/cancel', async (req, res) => {
  try {
    const { subscription_id, user_id, customer_id, plan_name } = req.body;

    if (!subscription_id || !user_id || !customer_id) {
      console.log("Missing required fields");
      return res.status(400).json({
        success: false,
        message: 'Subscription ID, User ID and Customer ID are required'
      });
    }

    // 1. Fetch customer details to get email
    console.log("Fetching Razorpay customer:", customer_id);
    const customer = await razorpay.customers.fetch(customer_id);
    // console.log("Customer Details:", customer);

    const customerEmail = customer.email;
    const customerName = customer.name || "Customer";

    // 2. Cancel subscription on Razorpay
    const subscription = await razorpay.subscriptions.cancel(subscription_id);
    // console.log("Razorpay Cancel Response:", subscription);

    // 3. Update DB
    const updateUserQuery = `
      UPDATE users 
      SET 
        subscription_plan_id = NULL,
        subscription = NULL,
        razorpay_plan_id = NULL,
        plan_name = NULL,
        plan_days = NULL,
        plan_startdate = NULL,
        plan_enddate = NULL,
        next_duedate = NULL,
        payment_status = NULL,
        payment_amount = NULL,
        razorpay_subscription_id = NULL,
        subscription_status = NULL
      WHERE razorpay_subscription_id = ? AND id = ?
    `;

    const [userResult] = await db.execute(updateUserQuery, [subscription_id, user_id]);

    if (userResult.affectedRows === 0) {
      console.log("No matching user found for subscription cancel");
      return res.status(404).json({
        success: false,
        message: 'User subscription not found'
      });
    }

    // 4. Send Email Notification
    if (customerEmail) {
      const mailOptions = {
        from: ADMIN_EMAIL,
        to: customerEmail,
        subject: `Your ${plan_name} Subscription Has Been Cancelled`,
        html: `
          <p>Hello ${customerName},</p>
           <p>Your <strong>${plan_name}</strong> subscription has been cancelled successfully.</p>
          <p>If this wasn't you or you want to resume again, feel free to contact support.</p>
          <p>Thank you.</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        // console.log("Cancellation email sent to:", customerEmail);
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
      }
    } else {
      console.log("Customer does not have an email in Razorpay.");
    }

    // 5. Final API Response
    res.json({
      success: true,
      message: 'Subscription cancelled successfully and email sent',
      subscription
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

router.get("/customer/:customer_id", async (req, res) => {
  try {
    const { customer_id } = req.params;

    console.log("Fetching Razorpay customer:", customer_id);

    const customer = await razorpay.customers.fetch(customer_id);

    console.log("Customer Details:", customer);

    res.json({
      success: true,
      customer
    });

  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer details",
      error: error.error || error
    });
  }
});

router.put('/subscription/agency_user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      subscription_plan_id,
      subscription,
      plan_name,
      plan_days,
      plan_startdate,
      plan_enddate,
      payment_status,
      payment_amount
    } = req.body;

    // Prepare dates for MySQL
    const mysqlPlanStartDate = convertToMySQLDateTime(plan_startdate);
    const mysqlPlanEndDate = convertToMySQLDateTime(plan_enddate);

    // ✅ Update query
    const [result] = await db.query(
      `UPDATE agency_user 
       SET subscription_plan_id = ?, 
       subscription = ?,
           plan_name = ?, 
           plan_days = ?, 
           plan_startdate = ?, 
           plan_enddate = ?, 
           payment_status = ?, 
           payment_amount = ? 
       WHERE id = ?`,
      [
        subscription_plan_id,
        subscription,
        plan_name,
        plan_days,
        mysqlPlanStartDate,
        mysqlPlanEndDate,
        payment_status,
        payment_amount,
        userId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Subscription details updated successfully" });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;