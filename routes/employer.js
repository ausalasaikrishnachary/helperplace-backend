const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  try {
    const data = req.body;

    if (!data.user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }

    const [existing] = await db.execute(`SELECT 1 FROM employer WHERE user_id = ?`, [data.user_id]);

    // Fields that should be stored as JSON strings
    const jsonFields = new Set([
      "preferred_years_of_experience", 
      "candidates_country_experience",
      "preferred_candidates_country", 
      "main_skills", 
      "cooking_skills", 
      "other_skills",
      "offer_for_selected_candidates"
    ]);

    if (existing.length > 0) {
      // Build dynamic UPDATE query
      const fieldsToUpdate = [];
      const values = [];

      // Iterate through all properties in the request body
      for (const [field, value] of Object.entries(data)) {
        if (field === 'user_id') continue; // Skip user_id for update
        
        fieldsToUpdate.push(`${field} = ?`);
        
        // Stringify JSON fields
        if (jsonFields.has(field) && value !== undefined) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value !== undefined ? value : null);
        }
      }

      if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ message: 'No valid fields provided to update' });
      }

      values.push(data.user_id); // for WHERE clause

      const updateQuery = `UPDATE employer SET ${fieldsToUpdate.join(', ')} WHERE user_id = ?`;
      await db.execute(updateQuery, values);

      res.status(200).json({ message: 'Employer data updated successfully' });

    } else {
      // INSERT new record
      const insertFields = ["user_id"];
      const placeholders = ["?"];
      const insertValues = [data.user_id];

      // Iterate through all properties in the request body
      for (const [field, value] of Object.entries(data)) {
        if (field === 'user_id') continue; // Skip user_id as it's already added
        
        insertFields.push(field);
        placeholders.push("?");
        
        // Stringify JSON fields
        if (jsonFields.has(field) && value !== undefined) {
          insertValues.push(JSON.stringify(value));
        } else {
          insertValues.push(value !== undefined ? value : null);
        }
      }

      const insertQuery = `INSERT INTO employer (${insertFields.join(', ')}) VALUES (${placeholders.join(', ')})`;
      const [result] = await db.execute(insertQuery, insertValues);

      res.status(201).json({ 
        message: 'Employer data created successfully', 
        id: result.insertId 
      });
    }

  } catch (err) {
    console.error('Error in POST /employer:', err);
    res.status(500).json({ 
      message: 'Server error while processing employer data',
      error: err.message
    });
  }
});

// GET - All Listings or Filter by user_id
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = 'SELECT * FROM employer';
    let params = [];

    if (user_id) {
      query += ' WHERE user_id = ?';
      params.push(user_id);
    }

    const [rows] = await db.execute(query, params);
    
    // Parse JSON fields
    const parsedRows = rows.map(row => {
      const parsedRow = {...row};
      jsonFields.forEach(field => {
        if (parsedRow[field]) {
          try {
            parsedRow[field] = JSON.parse(parsedRow[field]);
          } catch (e) {
            console.error(`Error parsing ${field}:`, e);
            parsedRow[field] = [];
          }
        } else {
          parsedRow[field] = [];
        }
      });
      return parsedRow;
    });

    res.status(200).json(parsedRows);
  } catch (err) {
    console.error('Error in GET /employer:', err);
    res.status(500).json({ 
      message: 'Error fetching employer data',
      error: err.message
    });
  }
});

// GET - Single Employer by user_id
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [rows] = await db.execute(
      `SELECT * FROM employer WHERE user_id = ?`, 
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Parse JSON fields
    const employer = rows[0];
    jsonFields.forEach(field => {
      if (employer[field]) {
        try {
          employer[field] = JSON.parse(employer[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
          employer[field] = [];
        }
      } else {
        employer[field] = [];
      }
    });

    res.status(200).json(employer);
  } catch (err) {
    console.error('Error in GET /employer/:user_id:', err);
    res.status(500).json({ 
      message: 'Error fetching employer data',
      error: err.message
    });
  }
});

// PUT - Update Employer (full update)
router.put('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const data = req.body;

    // First check if employer exists
    const [existing] = await db.execute(
      `SELECT 1 FROM employer WHERE user_id = ?`, 
      [user_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Prepare update fields and values
    const updateFields = [];
    const values = [];

    // Iterate through all possible fields
    const allFields = [
      "domestic_worker_category", "job_type", "job_title", "job_description", "job_starting_date",
      "prefer_contract_status", "looking_worker_for", "candidate_experience", "prefer_experience",
      "preferred_years_of_experience", "gulf_experience_years", "total_experience_years",
      "candidates_country_experience", "preferred_candidates_country", "preferred_language_for_worker",
      "location_preference", "most_important_skill", "main_skills", "cooking_skills", "other_skills",
      "gender", "religion", "education_level", "age", "working_city", "state_or_province",
      "name", "email_id", "whatsapp_number_country_code", "whatsapp_number",
      "phone_number_country_code", "phone_number", "nationality", "organization_name",
      "offer_for_selected_candidates", "country_currency", "minimum_monthly_salary",
      "maximum_monthly_salary", "negotiable", "adults", "children", "type_of_house", "rooms",
      "bathrooms", "have_pets","have_domestic_worker", "domestic_worker_name", "nationality_of_domestic_worker"
    ];

    allFields.forEach(field => {
      if (data[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        if (jsonFields.has(field)) {
          values.push(JSON.stringify(data[field]));
        } else {
          values.push(data[field]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    values.push(user_id); // for WHERE clause

    const updateQuery = `UPDATE employer SET ${updateFields.join(', ')} WHERE user_id = ?`;
    await db.execute(updateQuery, values);

    res.status(200).json({ message: 'Employer data updated successfully' });

  } catch (err) {
    console.error('Error in PUT /employer/:user_id:', err);
    res.status(500).json({ 
      message: 'Error updating employer data',
      error: err.message
    });
  }
});

// DELETE - Remove Employer by user_id
router.delete('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [result] = await db.execute(
      `DELETE FROM employer WHERE user_id = ?`, 
      [user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    res.status(200).json({ message: 'Employer deleted successfully' });
  } catch (err) {
    console.error('Error in DELETE /employer/:user_id:', err);
    res.status(500).json({ 
      message: 'Error deleting employer',
      error: err.message
    });
  }
});

// Define jsonFields at module level
const jsonFields = new Set([
  "preferred_years_of_experience", 
  "candidates_country_experience",
  "preferred_candidates_country", 
  "main_skills", 
  "cooking_skills", 
  "other_skills",
  "offer_for_selected_candidates"
]);

module.exports = router;