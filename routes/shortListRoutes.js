const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all shortlist entries
router.get('/shortlist/all', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT * FROM shortlist 
      ORDER BY created_at DESC
    `);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get shortlist entry by ID
router.get('/shortlist/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM shortlist WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Shortlist entry not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get shortlist entries by user_id
router.get('/shortlist/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM shortlist WHERE user_id = ?', 
      [user_id]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new shortlist entry
router.post('/shortlist', async (req, res) => {
  const { user_id, employer_id, first_name, email_id, employer_source } = req.body;

  // Validation
  if (!user_id || !first_name || !email_id) {
    return res.status(400).json({ 
      message: 'user_id, first_name, and email_id are required' 
    });
  }

  try {
    // Check if user_id exists in users table
    const [userExists] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (userExists.length === 0) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Check if email already exists in shortlist for this user
    const [existingEntry] = await db.query(
      'SELECT id FROM shortlist WHERE user_id = ? AND email_id = ?', 
      [user_id, email_id]
    );

    if (existingEntry.length > 0) {
      return res.status(400).json({ message: 'This candidate has already been shortlisted by another employer' });
    }

    const query = `
      INSERT INTO shortlist (user_id, employer_id, first_name, email_id, employer_source) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [user_id, employer_id, first_name, email_id, employer_source]);

    // Get the newly created entry
    const [newEntry] = await db.query('SELECT * FROM shortlist WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: 'Shortlist entry created successfully',
      data: newEntry[0]
    });

  } catch (err) {
    console.error('Error creating shortlist entry:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update shortlist entry
router.put('/shortlist/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, employer_id, first_name, email_id, employer_source } = req.body;

  // Validation
  if (!user_id || !first_name || !email_id) {
    return res.status(400).json({ 
      message: 'user_id, first_name, and email_id are required' 
    });
  }

  try {
    // Check if entry exists
    const [existingEntry] = await db.query('SELECT id FROM shortlist WHERE id = ?', [id]);
    if (existingEntry.length === 0) {
      return res.status(404).json({ message: 'Shortlist entry not found' });
    }

    // Check if user_id exists in users table
    const [userExists] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (userExists.length === 0) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Check for duplicate email for this user (excluding current entry)
    const [duplicateEntry] = await db.query(
      'SELECT id FROM shortlist WHERE user_id = ? AND email_id = ? AND id != ?', 
      [user_id, email_id, id]
    );

    if (duplicateEntry.length > 0) {
      return res.status(400).json({ message: 'Email already exists in shortlist for this user' });
    }

    const query = `
      UPDATE shortlist 
      SET user_id = ?, employer_id = ?, first_name = ?, email_id = ?, employer_source = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await db.query(query, [user_id, employer_id, first_name, email_id, id, employer_source]);

    // Get the updated entry
    const [updatedEntry] = await db.query('SELECT * FROM shortlist WHERE id = ?', [id]);

    res.json({
      message: 'Shortlist entry updated successfully',
      data: updatedEntry[0]
    });

  } catch (err) {
    console.error('Error updating shortlist entry:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete shortlist entry
router.delete('/shortlist/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if entry exists
    const [existingEntry] = await db.query('SELECT id FROM shortlist WHERE id = ?', [id]);
    if (existingEntry.length === 0) {
      return res.status(404).json({ message: 'Shortlist entry not found' });
    }

    await db.query('DELETE FROM shortlist WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Shortlist entry deleted successfully',
      deleted_id: parseInt(id)
    });
    
  } catch (err) {
    console.error('Error deleting shortlist entry:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete shortlist entries by user_id
router.delete('/shortlist/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  
  try {
    const [result] = await db.query('DELETE FROM shortlist WHERE user_id = ?', [user_id]);
    
    res.json({ 
      message: `Deleted ${result.affectedRows} shortlist entries for user ${user_id}`,
      deleted_count: result.affectedRows
    });
    
  } catch (err) {
    console.error('Error deleting shortlist entries by user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get shortlist entries by employer_id
router.get('/shortlist/employer/:employer_id', async (req, res) => {
  const { employer_id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM shortlist WHERE employer_id = ?', [employer_id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;