const express = require('express');
const { v4: uuid } = require('uuid');
const { db, now } = require('../db');
const { requireAuth, actorScopeOk } = require('../auth');
const { txOut } = require('../serializers');

const router = express.Router();

router.post('/transactions', requireAuth, (req, res) => {
  const b = req.body;
  if (!actorScopeOk(req.actor, b.popoteId)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const id = uuid();
  const actor = req.actor;
  db.prepare(`INSERT INTO transactions(id,popote_id,type,member_id,payer_id,items,drinkers,beneficiaries,amount,payment_method,note,timestamp,pending,created_by_id,created_by_name)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, b.popoteId, b.type, b.memberId || null, b.payerId || null,
      b.items ? JSON.stringify(b.items) : null,
      b.drinkers ? JSON.stringify(b.drinkers) : null,
      b.beneficiaries ? JSON.stringify(b.beneficiaries) : null,
      b.amount || 0, b.paymentMethod || null, b.note || null, b.timestamp || now(),
      b.pending ? 1 : 0,
      actor.id, actor.name);
  res.json(txOut(db.prepare('SELECT * FROM transactions WHERE id=?').get(id)));
});

router.post('/transactions/:id/validate-payment', requireAuth, (req, res) => {
  const cur = db.prepare('SELECT * FROM transactions WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, cur.popote_id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  db.prepare('UPDATE transactions SET pending=0 WHERE id=?').run(req.params.id);
  res.json(txOut(db.prepare('SELECT * FROM transactions WHERE id=?').get(req.params.id)));
});

module.exports = router;
