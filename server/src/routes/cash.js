const express = require('express');
const { v4: uuid } = require('uuid');
const { db, now } = require('../db');
const { requireAuth, actorScopeOk } = require('../auth');

const router = express.Router();

router.post('/cash/adjustments', requireAuth, (req, res) => {
  if (!actorScopeOk(req.actor, req.body.popoteId)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const amount = parseFloat(req.body.amount);
  if (!amount) return res.status(400).json({ error: 'montant invalide' });
  db.prepare(`INSERT INTO cash_adjustments(id,popote_id,amount,reason,actor_id,actor_name,timestamp)
              VALUES (?,?,?,?,?,?,?)`)
    .run(uuid(), req.body.popoteId, amount, req.body.reason || '', req.actor.id, req.actor.name, now());
  res.json({ ok: true });
});

module.exports = router;
