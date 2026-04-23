const express = require('express');
const router = express.Router();
const { Course, Assessment } = require('../models');

// GET all courses
router.get('/', async (req, res) => {
  try {
    const { category, level, page = 1, limit = 20 } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;
    if (level) where.level = level;

    const { count, rows } = await Course.findAndCountAll({
      where, include: [Assessment],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    res.json({ courses: rows, total: count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, { include: [Assessment] });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create course (admin)
router.post('/', async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT update course
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Not found' });
    await course.update(req.body);
    res.json(course);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;