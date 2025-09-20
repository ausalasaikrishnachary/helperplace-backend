const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendContactFormConfirmation } = require('./emailService');

// Get all support tickets
router.get('/supporttickets/all', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM support_tickets');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get support ticket by ID
router.get('/supporttickets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM support_tickets WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Support ticket not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new support ticket
router.post('/supporttickets', async (req, res) => {
  const {
    name,
    mobile_number,
    email,
    message,
    user_role,
    status
  } = req.body;

  // Basic validation
  if (!name || !email || !message || !user_role) {
    return res.status(400).json({ error: 'Missing required fields: name, email, message, and user_role are required' });
  }

  try {
    const query = `
      INSERT INTO support_tickets (
        name,
        mobile_number,
        email,
        message,
        user_role,
        status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      name,
      mobile_number,
      email,
      message,
      user_role,
      status || 'open' // Default to 'open' if not provided
    ]);

    // Send confirmation email to the user
    try {
      await sendContactFormConfirmation(email, name);
      console.log(`Contact form confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      id: result.insertId,
      message: 'Support ticket created successfully',
      ticket: {
        id: result.insertId,
        name,
        mobile_number,
        email,
        message,
        user_role,
        status: status || 'open'
      }
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update support ticket
router.put('/supporttickets/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    mobile_number,
    email,
    message,
    user_role,
    status,
    admin_notes
  } = req.body;

  try {
    // First check if the ticket exists
    const [checkResults] = await db.query('SELECT * FROM support_tickets WHERE id = ?', [id]);
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    const query = `
      UPDATE support_tickets SET 
        name = ?,
        mobile_number = ?,
        email = ?,
        message = ?,
        user_role = ?,
        status = ?,
        admin_notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await db.query(query, [
      name,
      mobile_number,
      email,
      message,
      user_role,
      status,
      admin_notes,
      id
    ]);

    res.json({ message: 'Support ticket updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete support ticket
router.delete('/supporttickets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // First check if the ticket exists
    const [checkResults] = await db.query('SELECT * FROM support_tickets WHERE id = ?', [id]);
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    await db.query('DELETE FROM support_tickets WHERE id = ?', [id]);
    res.json({ message: 'Support ticket deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get support tickets by status
router.get('/supporttickets/status/:status', async (req, res) => {
  const { status } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM support_tickets WHERE status = ? ORDER BY created_at DESC', 
      [status]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get support tickets by user role
router.get('/supporttickets/role/:role', async (req, res) => {
  const { role } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM support_tickets WHERE user_role = ? ORDER BY created_at DESC', 
      [role]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;