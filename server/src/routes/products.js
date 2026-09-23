const express = require('express');
const { v4: uuid } = require('uuid');
const { db } = require('../db');
const { requireAuth, actorScopeOk } = require('../auth');
const { productOut } = require('../serializers');

const router = express.Router();

router.post('/products', requireAuth, (req, res) => {
  const b = req.body;
  if (!actorScopeOk(req.actor, b.popoteId)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const id = uuid();
  const packSize = Math.max(1, parseInt(b.packSize, 10) || 1);
  const packCost = parseFloat(b.packCost) || 0;
  const unitCost = packCost > 0 ? packCost / packSize : (parseFloat(b.unitCost) || 0);
  db.prepare(`INSERT INTO products(id,popote_id,name,category,price,stock_reserve,fridge_qty,min_stock,pack_size,pack_cost,unit_cost,created_by_id,created_by_name)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, b.popoteId, b.name, b.category || 'autre', b.price || 0, b.stockReserve || 0, b.fridgeQty || 0, b.minStock || 0,
      packSize, packCost, unitCost, req.actor.id, req.actor.name);
  res.json(productOut(db.prepare('SELECT * FROM products WHERE id=?').get(id)));
});
router.patch('/products/:id', requireAuth, (req, res) => {
  const b = req.body;
  const cur = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, cur.popote_id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  db.prepare(`UPDATE products SET name=?, category=?, price=?, min_stock=?, pack_size=?, unit_cost=?, stock_reserve=?, fridge_qty=? WHERE id=?`)
    .run(b.name ?? cur.name, b.category ?? cur.category, b.price ?? cur.price, b.minStock ?? cur.min_stock,
      Math.max(1, parseInt(b.packSize, 10) || cur.pack_size || 1),
      (b.unitCost !== undefined ? parseFloat(b.unitCost) || 0 : cur.unit_cost),
      (b.stockReserve !== undefined ? Math.max(0, parseInt(b.stockReserve, 10) || 0) : cur.stock_reserve),
      (b.fridgeQty !== undefined ? Math.max(0, parseInt(b.fridgeQty, 10) || 0) : cur.fridge_qty),
      req.params.id);
  res.json({ ok: true });
});
router.delete('/products/:id', requireAuth, (req, res) => {
  const cur = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, cur.popote_id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

router.post('/products/:id/adjust', requireAuth, (req, res) => {
  const cur = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, cur.popote_id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const { fridgeDelta = 0, stockDelta = 0 } = req.body;
  const result = db.prepare(
    `UPDATE products
     SET fridge_qty = MAX(0, fridge_qty + ?),
         stock_reserve = MAX(0, stock_reserve + ?)
     WHERE id = ?`
  ).run(fridgeDelta, stockDelta, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'introuvable' });
  res.json(productOut(db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id)));
});

router.post('/products/:id/open-bottle', requireAuth, (req, res) => {
  const cur = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, cur.popote_id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const result = db.prepare(
    `UPDATE products SET stock_reserve = stock_reserve - 1, bottle_open = 1 WHERE id = ? AND stock_reserve >= 1`
  ).run(req.params.id);
  if (result.changes === 0) return res.status(409).json({ error: 'plus de bouteille en réserve' });
  res.json(productOut(db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id)));
});

router.post('/products/:id/close-bottle', requireAuth, (req, res) => {
  const cur = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, cur.popote_id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  db.prepare('UPDATE products SET bottle_open = 0 WHERE id=?').run(req.params.id);
  res.json(productOut(db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id)));
});

router.post('/products/:id/transfer', requireAuth, (req, res) => {
  const cur = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, cur.popote_id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const qty = parseInt(req.body.qty, 10) || 0;
  const result = db.prepare(
    `UPDATE products SET stock_reserve = stock_reserve - ?, fridge_qty = fridge_qty + ?
     WHERE id = ? AND stock_reserve >= ?`
  ).run(qty, qty, req.params.id, qty);
  if (result.changes === 0) return res.status(409).json({ error: 'stock réserve insuffisant' });
  res.json(productOut(db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id)));
});

router.post('/products/:id/purchase', requireAuth, (req, res) => {
  const cur = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!actorScopeOk(req.actor, cur.popote_id)) return res.status(401).json({ error: 'pas autorisé sur cette popote' });
  const packs = parseInt(req.body.packs, 10) || 0;
  const packSize = Math.max(1, parseInt(req.body.packSize, 10) || cur.pack_size || 1);
  const packCost = parseFloat(req.body.packCost) || 0;
  if (packs <= 0) return res.status(400).json({ error: 'nombre de packs invalide' });
  const addedUnits = packs * packSize;
  const totalCost = packs * packCost;
  const unitCost = packCost > 0 ? packCost / packSize : cur.unit_cost;
  const tx = db.transaction(() => {
    db.prepare('UPDATE products SET stock_reserve = stock_reserve + ?, pack_size=?, pack_cost=?, unit_cost=? WHERE id=?')
      .run(addedUnits, packSize, packCost, unitCost, req.params.id);
    db.prepare(`INSERT INTO purchases(id,popote_id,product_id,packs,pack_size,pack_cost,total_cost,note,actor_id,actor_name,timestamp)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .run(uuid(), cur.popote_id, req.params.id, packs, packSize, packCost, totalCost, req.body.note || '', req.actor.id, req.actor.name, Date.now());
  });
  tx();
  res.json(productOut(db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id)));
});

module.exports = router;
