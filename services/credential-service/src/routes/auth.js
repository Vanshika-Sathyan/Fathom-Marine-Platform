const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Worker } = require('../models');

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existing = await Worker.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const podId = `POD-${uuidv4().split('-')[0].toUpperCase()}`;

    const worker = await Worker.create({ name, email, passwordHash, role, department, podId });

    const token = jwt.sign(
      { id: worker.id, podId: worker.podId, email: worker.email, role: worker.role, name: worker.name },
      process.env.JWT_SECRET || 'fathom-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({ success: true, token, worker: { id: worker.id, podId: worker.podId, name, email, role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const worker = await Worker.findOne({ where: { email } });
    if (!worker) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, worker.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: worker.id, podId: worker.podId, email: worker.email, role: worker.role, name: worker.name },
      process.env.JWT_SECRET || 'fathom-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ success: true, token, worker: { id: worker.id, podId: worker.podId, name: worker.name, email, role: worker.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;