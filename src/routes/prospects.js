const express = require('express');
const router = express.Router();
const DatabaseService = require('../database/database');

// GET /api/prospects - Get all prospects with filters
router.get('/', async (req, res) => {
  try {
    const { status, limit, ...filters } = req.query;
    
    let prospects;
    if (status) {
      prospects = await DatabaseService.getProspectsByStatus(
        status.toUpperCase(), 
        parseInt(limit) || 25
      );
    } else {
      prospects = await DatabaseService.searchProspects(filters);
    }
    
    res.json({ 
      success: true, 
      data: prospects,
      count: prospects.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/prospects - Create new prospect
router.post('/', async (req, res) => {
  try {
    const prospect = await DatabaseService.createProspect(req.body);
    res.status(201).json({ 
      success: true, 
      data: prospect 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PATCH /api/prospects/:id/status - Update prospect status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;
    
    const prospect = await DatabaseService.updateProspectStatus(
      id, 
      status.toUpperCase(), 
      additionalData
    );
    
    res.json({ 
      success: true, 
      data: prospect 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/prospects/:id/conversation - Add conversation message
router.post('/:id/conversation', async (req, res) => {
  try {
    const { id } = req.params;
    const message = {
      platform: req.body.platform || 'linkedin',
      message: req.body.message,
      sender: req.body.sender, // 'ai' or 'prospect'
      messageType: req.body.messageType || 'general'
    };
    
    const prospect = await DatabaseService.addConversationMessage(id, message);
    res.json({ 
      success: true, 
      data: prospect 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/prospects/follow-up - Get prospects needing follow-up
router.get('/follow-up', async (req, res) => {
  try {
    const prospects = await DatabaseService.getProspectsNeedingFollowUp();
    res.json({ 
      success: true, 
      data: prospects,
      count: prospects.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/prospects/stats - Get prospect statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await DatabaseService.getProspectStats();
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
