const express = require('express');
const router = express.Router();
const { Enrollment, Course } = require('../models');
const axios = require('axios');

// POST enroll a worker in a course
router.post('/', async (req, res) => {
  try {
    const { workerId, courseId } = req.body;

    const existing = await Enrollment.findOne({ where: { workerId, courseId } });
    if (existing) return res.status(409).json({ error: 'Already enrolled' });

    const enrollment = await Enrollment.create({ workerId, courseId, startedAt: new Date(), status: 'in_progress' });
    res.status(201).json(enrollment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT update progress
router.put('/:id/progress', async (req, res) => {
  try {
    const { progress, score } = req.body;
    const enrollment = await Enrollment.findByPk(req.params.id, { include: [Course] });
    if (!enrollment) return res.status(404).json({ error: 'Not found' });

    const updates = { progress };
    if (progress >= 100) {
      updates.status = score >= (enrollment.Course?.passingScore || 70) ? 'completed' : 'failed';
      updates.completedAt = new Date();
      updates.score = score;

      // Auto-issue credential if completed and course has credential type
      if (updates.status === 'completed' && enrollment.Course?.credentialType && !enrollment.credentialIssued) {
        try {
          await axios.post(`${process.env.CREDENTIAL_SERVICE_URL}/api/v1/credentials/issue`, {
            workerId: enrollment.workerId,
            credentialType: enrollment.Course.credentialType,
            issuedBy: 'LMS Auto-Issue'
          });
          updates.credentialIssued = true;
        } catch (credErr) {
          console.error('Credential auto-issue failed:', credErr.message);
        }
      }
    }

    await enrollment.update(updates);
    res.json(enrollment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET enrollments for a worker
router.get('/worker/:workerId', async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { workerId: req.params.workerId },
      include: [Course]
    });
    res.json(enrollments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;