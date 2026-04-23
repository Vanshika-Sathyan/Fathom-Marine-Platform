const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Credential, Worker } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// POST /api/v1/credentials/issue — Issue a new credential
router.post('/issue', authenticateToken, async (req, res) => {
  try {
    const { workerEmail, credentialType, issuedBy, expiresAt, metadata } = req.body;

    // Validate worker exists
    const worker = await Worker.findOne({ where: { email: workerEmail } });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    // Prevent duplicate active credentials of same type
    const existing = await Credential.findOne({
      where: { workerId: worker.podId, credentialType, status: 'active' }
    });
    if (existing) {
      return res.status(409).json({
        error: 'Duplicate credential',
        message: `Worker already has an active ${credentialType} credential`,
        existingCredentialId: existing.credentialId
      });
    }

    // Generate credential
    const credentialId = `CRED-${uuidv4().split('-')[0].toUpperCase()}`;
    const credential = await Credential.create({
      credentialId,
      workerId: worker.podId,
      workerName: worker.name,
      workerEmail,
      credentialType,
      issuedBy: issuedBy || req.user.name,
      expiresAt,
      metadata
    });

    res.status(201).json({
      success: true,
      credentialId: credential.credentialId,
      workerId: worker.podId,   // Return worker (pod) ID
      workerName: worker.name,
      credentialType,
      issuedAt: credential.issuedAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/credentials/verify/:credentialId — Verify a credential
router.get('/verify/:credentialId', async (req, res) => {
  try {
    const credential = await Credential.findOne({
      where: { credentialId: req.params.credentialId }
    });

    if (!credential) return res.status(404).json({ valid: false, error: 'Credential not found' });

    const isExpired = credential.expiresAt && new Date() > credential.expiresAt;
    if (isExpired) {
      await credential.update({ status: 'expired' });
    }

    res.json({
      valid: credential.status === 'active' && !isExpired,
      credential: {
        credentialId: credential.credentialId,
        workerName: credential.workerName,
        workerId: credential.workerId,
        credentialType: credential.credentialType,
        issuedBy: credential.issuedBy,
        issuedAt: credential.issuedAt,
        expiresAt: credential.expiresAt,
        status: credential.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/credentials/worker/:workerId — Get all credentials for a worker
router.get('/worker/:workerId', authenticateToken, async (req, res) => {
  try {
    const credentials = await Credential.findAll({
      where: { workerId: req.params.workerId },
      order: [['issuedAt', 'DESC']]
    });
    res.json({ credentials, total: credentials.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/credentials — List all credentials (admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, credentialType, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (credentialType) where.credentialType = credentialType;

    const { count, rows } = await Credential.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['issuedAt', 'DESC']]
    });

    res.json({ credentials: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/v1/credentials/:credentialId — Revoke
router.delete('/:credentialId', authenticateToken, async (req, res) => {
  try {
    const credential = await Credential.findOne({ where: { credentialId: req.params.credentialId } });
    if (!credential) return res.status(404).json({ error: 'Not found' });
    await credential.update({ status: 'revoked' });
    res.json({ success: true, message: 'Credential revoked' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;