const express = require('express');
const { requireAuth } = require('../auth');
const { setConfig } = require('../db');

const router = express.Router();

router.put('/config/paymentMethods', requireAuth, (req, res) => {
  setConfig('paymentMethods', req.body.list || []);
  res.json({ ok: true });
});

module.exports = router;
