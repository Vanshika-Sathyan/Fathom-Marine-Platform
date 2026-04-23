const express = require('express');
const router = express.Router();
const { Survey, SurveyResponse } = require('../models');

// GET all active surveys
router.get('/', async (req, res) => {
  try {
    const surveys = await Survey.findAll({ where: { isActive: true } });
    res.json(surveys);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create survey (admin)
router.post('/', async (req, res) => {
  try {
    const survey = await Survey.create(req.body);
    res.status(201).json(survey);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST submit survey response
router.post('/:surveyId/respond', async (req, res) => {
  try {
    const { workerId, responses, isAnonymous } = req.body;
    const survey = await Survey.findByPk(req.params.surveyId);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });

    // Calculate wellbeing score (average of numeric responses 1-5)
    const scores = Object.values(responses).filter(v => typeof v === 'number');
    const wellbeingScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    const response = await SurveyResponse.create({
      surveyId: req.params.surveyId,
      workerId: (isAnonymous || survey.isAnonymous) ? null : workerId,
      responses,
      wellbeingScore
    });

    res.status(201).json({ success: true, responseId: response.id, wellbeingScore });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET wellbeing dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const responses = await SurveyResponse.findAll({
      order: [['submittedAt', 'DESC']],
      limit: 100
    });

    const avgScore = responses.reduce((sum, r) => sum + (r.wellbeingScore || 0), 0) / (responses.length || 1);
    const riskWorkers = responses.filter(r => r.workerId && r.wellbeingScore < 2.5);

    res.json({
      totalResponses: responses.length,
      averageWellbeingScore: Math.round(avgScore * 100) / 100,
      atRiskCount: riskWorkers.length,
      recentResponses: responses.slice(0, 10)
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;