const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  try {
    const data = req.body;

    // Check if the row already exists
    const [existing] = await db.execute(`SELECT 1 FROM employer WHERE user_id = ?`, [data.user_id]);

    if (existing.length > 0) {
      // ✅ UPDATE existing row
      await db.execute(
        `UPDATE employer SET
          domestic_worker_category=?, job_type=?, job_title=?, job_description=?, job_starting_date=?,
          prefer_contract_status=?, looking_worker_for=?, candidate_experience=?, prefer_experience=?,
          preferred_years_of_experience=?, gulf_experience_years=?, total_experience_years=?,
          candidates_country_experience=?, preferred_candidates_country=?, preferred_language_for_worker=?,
          candidate_preference=?, most_important_skill=?, main_skills=?, cooking_skills=?, other_skills=?,
          gender=?, religion=?, education_level=?, age=?, working_city=?, state_or_province=?,
          name=?, email_id=?, whatsapp_number_country_code=?, whatsapp_number=?,
          phone_number_country_code=?, phone_number=?, nationality=?, organization_name=?,
          offer_for_selected_candidates=?, country_currency=?, minimum_monthly_salary=?,
          maximum_monthly_salary=?, negotiable=?, adults=?, children=?, type_of_house=?, rooms=?,
          bathrooms=?, have_pets=?, domestic_worker_name=?, have_domestic_worker=?, nationality_of_domestic_worker=?
        WHERE user_id = ?`,
        [
          data.domestic_worker_category,
          data.job_type,
          data.job_title,
          data.job_description,
          data.job_starting_date,
          data.prefer_contract_status,
          data.looking_worker_for,
          data.candidate_experience,
          data.prefer_experience,
          JSON.stringify(data.preferred_years_of_experience),
          data.gulf_experience_years,
          data.total_experience_years,
          JSON.stringify(data.candidates_country_experience),
          JSON.stringify(data.preferred_candidates_country),
          data.preferred_language_for_worker,
          data.candidate_preference,
          data.most_important_skill,
          JSON.stringify(data.main_skills),
          JSON.stringify(data.cooking_skills),
          JSON.stringify(data.other_skills),
          data.gender,
          data.religion,
          data.education_level,
          data.age,
          data.working_city,
          data.state_or_province,
          data.name,
          data.email_id,
          data.whatsapp_number_country_code,
          data.whatsapp_number,
          data.phone_number_country_code,
          data.phone_number,
          data.nationality,
          data.organization_name,
          data.offer_for_selected_candidates,
          data.country_currency,
          data.minimum_monthly_salary,
          data.maximum_monthly_salary,
          data.negotiable,
          data.adults,
          data.children,
          data.type_of_house,
          data.rooms,
          data.bathrooms,
          data.have_pets,
          data.domestic_worker_name,
          data.have_domestic_worker,
          data.nationality_of_domestic_worker,
          data.user_id // for WHERE clause
        ]
      );

      res.status(200).json({ message: 'Job listing updated successfully for existing user_id' });
    } else {
      // ✅ INSERT new row
      const [result] = await db.execute(
        `INSERT INTO employer (
          user_id, domestic_worker_category, job_type, job_title, job_description, job_starting_date,
          prefer_contract_status, looking_worker_for, candidate_experience, prefer_experience,
          preferred_years_of_experience, gulf_experience_years, total_experience_years,
          candidates_country_experience, preferred_candidates_country, preferred_language_for_worker,
          candidate_preference, most_important_skill, main_skills, cooking_skills, other_skills,
          gender, religion, education_level, age, working_city, state_or_province, name, email_id,
          whatsapp_number_country_code, whatsapp_number, phone_number_country_code, phone_number,
          nationality, organization_name, offer_for_selected_candidates, country_currency,
          minimum_monthly_salary, maximum_monthly_salary, negotiable, adults, children, type_of_house,
          rooms, bathrooms, have_pets, domestic_worker_name, have_domestic_worker, nationality_of_domestic_worker
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.user_id,
          data.domestic_worker_category,
          data.job_type,
          data.job_title,
          data.job_description,
          data.job_starting_date,
          data.prefer_contract_status,
          data.looking_worker_for,
          data.candidate_experience,
          data.prefer_experience,
          JSON.stringify(data.preferred_years_of_experience),
          data.gulf_experience_years,
          data.total_experience_years,
          JSON.stringify(data.candidates_country_experience),
          JSON.stringify(data.preferred_candidates_country),
          data.preferred_language_for_worker,
          data.candidate_preference,
          data.most_important_skill,
          JSON.stringify(data.main_skills),
          JSON.stringify(data.cooking_skills),
          JSON.stringify(data.other_skills),
          data.gender,
          data.religion,
          data.education_level,
          data.age,
          data.working_city,
          data.state_or_province,
          data.name,
          data.email_id,
          data.whatsapp_number_country_code,
          data.whatsapp_number,
          data.phone_number_country_code,
          data.phone_number,
          data.nationality,
          data.organization_name,
          data.offer_for_selected_candidates,
          data.country_currency,
          data.minimum_monthly_salary,
          data.maximum_monthly_salary,
          data.negotiable,
          data.adults,
          data.children,
          data.type_of_house,
          data.rooms,
          data.bathrooms,
          data.have_pets,
          data.domestic_worker_name,
          data.have_domestic_worker,
          data.nationality_of_domestic_worker
        ]
      );

      res.status(201).json({ message: 'Job listing created successfully', id: result.insertId });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating/updating job listing' });
  }
});

// ✅ GET - All Listings or Filter by user_id
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    const [rows] = await db.execute(
      user_id ? `SELECT * FROM employer WHERE user_id = ?` : `SELECT * FROM employer`,
      user_id ? [user_id] : []
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching job listings' });
  }
});

// ✅ GET - Single Job Listing by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(`SELECT * FROM employer WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Job listing not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching job listing by ID' });
  }
});

// ✅ PUT - Update Job Listing
router.put('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const data = req.body;
    const [result] = await db.execute(
      `UPDATE employer SET
        domestic_worker_category=?, job_type=?, job_title=?, job_description=?, job_starting_date=?,
        prefer_contract_status=?, looking_worker_for=?, candidate_experience=?, prefer_experience=?,
        preferred_years_of_experience=?, gulf_experience_years=?, total_experience_years=?,
        candidates_country_experience=?, preferred_candidates_country=?, preferred_language_for_worker=?,
        candidate_preference=?, most_important_skill=?, main_skills=?, cooking_skills=?, other_skills=?,
        gender=?, religion=?, education_level=?, age=?, working_city=?, state_or_province=?,
        name=?, email_id=?, whatsapp_number_country_code=?, whatsapp_number=?,
        phone_number_country_code=?, phone_number=?, nationality=?, organization_name=?,
        offer_for_selected_candidates=?, country_currency=?, minimum_monthly_salary=?,
        maximum_monthly_salary=?, negotiable=?, adults=?, children=?, type_of_house=?, rooms=?,
        bathrooms=?, have_pets=?, domestic_worker_name=?, have_domestic_worker=?, nationality_of_domestic_worker=?
      WHERE user_id = ?`,
      [
        data.domestic_worker_category,
        data.job_type,
        data.job_title,
        data.job_description,
        data.job_starting_date,
        data.prefer_contract_status,
        data.looking_worker_for,
        data.candidate_experience,
        data.prefer_experience,
        JSON.stringify(data.preferred_years_of_experience),
        data.gulf_experience_years,
        data.total_experience_years,
        JSON.stringify(data.candidates_country_experience),
        JSON.stringify(data.preferred_candidates_country),
        data.preferred_language_for_worker,
        data.candidate_preference,
        data.most_important_skill,
        JSON.stringify(data.main_skills),
        JSON.stringify(data.cooking_skills),
        JSON.stringify(data.other_skills),
        data.gender,
        data.religion,
        data.education_level,
        data.age,
        data.working_city,
        data.state_or_province,
        data.name,
        data.email_id,
        data.whatsapp_number_country_code,
        data.whatsapp_number,
        data.phone_number_country_code,
        data.phone_number,
        data.nationality,
        data.organization_name,
        data.offer_for_selected_candidates,
        data.country_currency,
        data.minimum_monthly_salary,
        data.maximum_monthly_salary,
        data.negotiable,
        data.adults,
        data.children,
        data.type_of_house,
        data.rooms,
        data.bathrooms,
        data.have_pets,
        data.domestic_worker_name,
        data.have_domestic_worker,
        data.nationality_of_domestic_worker,
        user_id
      ]
    );
    res.status(200).json({ message: 'Job listing updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating job listing' });
  }
});

// ✅ DELETE - Remove Listing by user_id
router.delete('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [result] = await db.execute(`DELETE FROM employer WHERE user_id = ?`, [user_id]);
    res.status(200).json({ message: 'Job listing deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting job listing' });
  }
});

module.exports = router;
