const express = require('express');
const { v4: uuid } = require('uuid');
const { db, now } = require('../db');
const { requireAuth, actorScopeOk } = require('../auth');
const { memberOut } = require('../serializers');

const router = express.Router();

router.post('/members', requireAuth, (req, res) => {
  if (!actorScopeOk(req.actor, req.body.popoteId)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const id = uuid();
  db.prepare('INSERT INTO members(id,popote_id,name,created_at,created_by_id,created_by_name) VALUES (?,?,?,?,?,?)')
    .run(id, req.body.popoteId, req.body.name, now(), req.actor.id, req.actor.name);
  res.json(memberOut(db.prepare('SELECT * FROM members WHERE id=?').get(id)));
});
router.delete('/members/:id', requireAuth, (req, res) => {
  const id = req.params.id;
  const cur = db.prepare('SELECT * FROM members WHERE id=?').get(id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, cur.popote_id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM transactions WHERE member_id=? OR payer_id=?').run(id, id);
    db.prepare('DELETE FROM members WHERE id=?').run(id);
  });
  tx();
  res.json({ ok: true });
});

module.exports = router;
