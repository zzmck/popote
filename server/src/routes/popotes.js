const express = require('express');
const { v4: uuid } = require('uuid');
const { db, now, genPopoteCode } = require('../db');
const { requireAuth, requireSuperAdmin, actorScopeOk } = require('../auth');
const { popoteOut } = require('../serializers');

const router = express.Router();

router.post('/popotes', requireAuth, (req, res) => {
  const id = uuid();
  db.prepare('INSERT INTO popotes(id,name,mission,active,code,created_at,created_by_id,created_by_name) VALUES (?,?,?,1,?,?,?,?)')
    .run(id, req.body.name, req.body.mission || '', genPopoteCode(), now(), req.actor.id, req.actor.name);
  res.json(popoteOut(db.prepare('SELECT * FROM popotes WHERE id=?').get(id)));
});
router.patch('/popotes/:id', requireAuth, (req, res) => {
  const cur = db.prepare('SELECT * FROM popotes WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, req.params.id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const b = req.body;
  db.prepare('UPDATE popotes SET name=?, mission=?, active=? WHERE id=?')
    .run(b.name ?? cur.name, ('mission' in b) ? b.mission : cur.mission,
      ('active' in b) ? (b.active ? 1 : 0) : cur.active, req.params.id);
  res.json({ ok: true });
});
router.delete('/popotes/:id', requireSuperAdmin, (req, res) => {
  const id = req.params.id;
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM products WHERE popote_id=?').run(id);
    db.prepare('DELETE FROM members WHERE popote_id=?').run(id);
    db.prepare('DELETE FROM transactions WHERE popote_id=?').run(id);
    db.prepare('DELETE FROM shopping_manual WHERE popote_id=?').run(id);
    db.prepare('DELETE FROM purchases WHERE popote_id=?').run(id);
    db.prepare('DELETE FROM cash_adjustments WHERE popote_id=?').run(id);
    db.prepare('DELETE FROM popotes WHERE id=?').run(id);
  });
  tx();
  res.json({ ok: true });
});

module.exports = router;
