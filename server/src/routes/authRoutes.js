const express = require('express');
const { findActor } = require('../auth');

const router = express.Router();

router.post('/admin/login', (req, res) => {
  const actor = findActor(req.body.username, req.body.password);
  if (!actor) return res.status(401).json({ error: 'Identifiants invalides' });
  res.json({ ok: true, actor });
});

module.exports = router;
