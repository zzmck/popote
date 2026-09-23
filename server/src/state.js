const { db, getConfig } = require('./db');
const { findActor } = require('./auth');
const { popoteOut, productOut, memberOut, txOut, shopOut, popotierOut, purchaseOut, cashAdjOut } = require('./serializers');

function resolveScope(req) {
  const actor = findActor(req.header('X-Admin-Username'), req.header('X-Admin-Password'));
  if (actor) {
    if (actor.type === 'super' || !actor.popoteId) return { full: true, actor };
    return { popoteId: actor.popoteId, actor };
  }
  const code = req.header('X-Popote-Code') || req.query.code;
  if (code) {
    const p = db.prepare('SELECT id FROM popotes WHERE code=?').get(String(code).toUpperCase());
    if (p) return { popoteId: p.id };
  }
  return { popoteId: null };
}
function getStateSnapshot(scope) {
  const full = !scope || scope.full;
  const popoteId = scope && scope.popoteId;
  let popotes = db.prepare('SELECT * FROM popotes ORDER BY created_at DESC').all().map(popoteOut);
  let products = db.prepare('SELECT * FROM products').all().map(productOut);
  let members = db.prepare('SELECT * FROM members').all().map(memberOut);
  let transactions = db.prepare('SELECT * FROM transactions ORDER BY timestamp DESC').all().map(txOut);
  let shopping = db.prepare('SELECT * FROM shopping_manual').all().map(shopOut);
  let popotiers = db.prepare('SELECT * FROM popotiers ORDER BY created_at ASC').all().map(popotierOut);
  let purchases = db.prepare('SELECT * FROM purchases ORDER BY timestamp DESC').all().map(purchaseOut);
  let cashAdjustments = db.prepare('SELECT * FROM cash_adjustments ORDER BY timestamp DESC').all().map(cashAdjOut);
  const paymentMethods = getConfig('paymentMethods', ['Espèces', 'Virement', 'Carte bancaire']);
  if (!full) {
    popotes = popoteId ? popotes.filter(p => p.id === popoteId) : [];
    products = products.filter(p => p.popoteId === popoteId);
    members = members.filter(m => m.popoteId === popoteId);
    transactions = transactions.filter(t => t.popoteId === popoteId);
    shopping = shopping.filter(s => s.popoteId === popoteId);
    popotiers = popotiers.filter(p => p.popoteId === popoteId);
    purchases = purchases.filter(p => p.popoteId === popoteId);
    cashAdjustments = cashAdjustments.filter(a => a.popoteId === popoteId);
  }
  return { popotes, products, members, transactions, shopping, popotiers, purchases, cashAdjustments, paymentMethods };
}

module.exports = { resolveScope, getStateSnapshot };
