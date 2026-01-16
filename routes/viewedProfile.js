// viewedProfilesAPI.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Record profile view
router.post('/api/viewed-profiles/record-view', async (req, res) => {
    let connection;
    try {
        const { 
            employer_user_id, 
            employer_name, 
            candidate_user_id, 
            candidate_name 
        } = req.body;

        // Validate
        if (!employer_user_id || !candidate_user_id || !candidate_name) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }

        connection = await db.getConnection();

        // Check if already viewed
        const [existingView] = await connection.query(
            `SELECT id FROM viewed_profiles 
             WHERE employer_user_id = ? AND candidate_user_id = ?`,
            [String(employer_user_id), String(candidate_user_id)]
        );

        if (existingView.length > 0) {
            // Update timestamp
            await connection.query(
                `UPDATE viewed_profiles 
                 SET viewed_at = CURRENT_TIMESTAMP 
                 WHERE employer_user_id = ? AND candidate_user_id = ?`,
                [String(employer_user_id), String(candidate_user_id)]
            );
            
            return res.status(200).json({ 
                success: true, 
                message: 'Profile view updated',
                already_viewed: true 
            });
        }

        // Insert new view
        const [result] = await connection.query(
            `INSERT INTO viewed_profiles 
             (employer_user_id, employer_name, candidate_user_id, candidate_name) 
             VALUES (?, ?, ?, ?)`,
            [
                String(employer_user_id), 
                employer_name || 'Employer',
                String(candidate_user_id), 
                candidate_name.split('@')[0] || candidate_name
            ]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Profile view recorded successfully',
            view_id: result.insertId 
        });

    } catch (error) {
        console.error('Error recording profile view:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            details: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Check if profile was viewed
router.get('/check-view/:employer_user_id/:candidate_user_id', async (req, res) => {
    try {
        const { employer_user_id, candidate_user_id } = req.params;

        const [views] = await db.query(
            `SELECT * FROM viewed_profiles 
             WHERE employer_user_id = ? AND candidate_user_id = ?`,
            [employer_user_id, candidate_user_id]
        );

        res.status(200).json({ 
            success: true, 
            viewed: views.length > 0,
            view_data: views[0] || null 
        });

    } catch (error) {
        console.error('Error checking profile view:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Get recent views for employer
router.get('/employer-recent/:employer_user_id', async (req, res) => {
    try {
        const { employer_user_id } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        const [views] = await db.query(
            `SELECT vp.*, 
                    js.first_name,
                    js.profile_photo,
                    js.nationality,
                    js.job_position,
                    js.current_country
             FROM viewed_profiles vp
             LEFT JOIN job_seekers js ON vp.candidate_user_id = js.user_id
             WHERE vp.employer_user_id = ?
             ORDER BY vp.viewed_at DESC
             LIMIT ?`,
            [employer_user_id, limit]
        );

        res.status(200).json({ 
            success: true,
            views: views,
            total: views.length
        });

    } catch (error) {
        console.error('Error fetching recent views:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Get view analytics
router.get('/analytics/:employer_user_id', async (req, res) => {
    try {
        const { employer_user_id } = req.params;

        // Get today's views
        const [todayViews] = await db.query(
            `SELECT COUNT(*) as count FROM viewed_profiles 
             WHERE employer_user_id = ? AND DATE(viewed_at) = CURDATE()`,
            [employer_user_id]
        );

        // Get this week's views
        const [weekViews] = await db.query(
            `SELECT COUNT(*) as count FROM viewed_profiles 
             WHERE employer_user_id = ? AND viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
            [employer_user_id]
        );

        // Get total views
        const [totalViews] = await db.query(
            `SELECT COUNT(*) as count FROM viewed_profiles 
             WHERE employer_user_id = ?`,
            [employer_user_id]
        );

        // Get unique candidates viewed
        const [uniqueCandidates] = await db.query(
            `SELECT COUNT(DISTINCT candidate_user_id) as count 
             FROM viewed_profiles WHERE employer_user_id = ?`,
            [employer_user_id]
        );

        res.status(200).json({
            success: true,
            analytics: {
                today: todayViews[0]?.count || 0,
                this_week: weekViews[0]?.count || 0,
                total: totalViews[0]?.count || 0,
                unique_candidates: uniqueCandidates[0]?.count || 0
            }
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

module.exports = router;