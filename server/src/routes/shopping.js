const express = require('express');
const { v4: uuid } = require('uuid');
const { db, now } = require('../db');
const { requireAuth, actorScopeOk } = require('../auth');
const { shopOut } = require('../serializers');

const router = express.Router();

router.post('/shopping/checkout', requireAuth, (req, res) => {
  if (!actorScopeOk(req.actor, req.body.popoteId)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const amount = parseFloat(req.body.amount) || 0;
  if (!items.length && !amount) return res.status(400).json({ error: 'rien à enregistrer' });
  const tx = db.transaction(() => {
    const itemsOut = [];
    for (const it of items) {
      const qty = parseInt(it.qty, 10) || 0;
      if (qty <= 0) continue;
      const prod = db.prepare('SELECT * FROM products WHERE id=? AND popote_id=?').get(it.productId, req.body.popoteId);
      if (!prod) continue;
      db.prepare('UPDATE products SET stock_reserve = stock_reserve + ? WHERE id=?').run(qty, prod.id);
      itemsOut.push({ productId: prod.id, name: prod.name, qty });
    }
    if (amount) {
      db.prepare(`INSERT INTO purchases(id,popote_id,product_id,packs,pack_size,pack_cost,total_cost,note,items,actor_id,actor_name,timestamp)
                  VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(uuid(), req.body.popoteId, '', 0, 1, 0, amount, req.body.note || 'Courses', JSON.stringify(itemsOut), req.actor.id, req.actor.name, now());
    }
  });
  tx();
  res.json({ ok: true });
});

/* -------- LISTE DE COURSES MANUELLE -------- */
router.post('/shopping', requireAuth, (req, res) => {
  if (!actorScopeOk(req.actor, req.body.popoteId)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const id = uuid();
  db.prepare('INSERT INTO shopping_manual(id,popote_id,name,note,done,created_at) VALUES (?,?,?,?,0,?)')
    .run(id, req.body.popoteId, req.body.name, req.body.note || '', now());
  res.json(shopOut(db.prepare('SELECT * FROM shopping_manual WHERE id=?').get(id)));
});
router.patch('/shopping/:id', requireAuth, (req, res) => {
  const cur = db.prepare('SELECT * FROM shopping_manual WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, cur.popote_id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  db.prepare('UPDATE shopping_manual SET done=? WHERE id=?').run(req.body.done ? 1 : 0, req.params.id);
  res.json({ ok: true });
});
router.delete('/shopping/:id', requireAuth, (req, res) => {
  const cur = db.prepare('SELECT * FROM shopping_manual WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, cur.popote_id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  db.prepare('DELETE FROM shopping_manual WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
