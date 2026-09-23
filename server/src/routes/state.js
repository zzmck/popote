const express = require('express');
const { resolveScope, getStateSnapshot } = require('../state');

const router = express.Router();

router.get('/state', (req, res) => {
  res.json(getStateSnapshot(resolveScope(req)));
});

module.exports = router;
