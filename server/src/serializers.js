function productOut(r) {
  return { id: r.id, popoteId: r.popote_id, name: r.name, category: r.category, price: r.price,
    stockReserve: r.stock_reserve, fridgeQty: r.fridge_qty, minStock: r.min_stock,
    packSize: r.pack_size || 1, packCost: r.pack_cost || 0, unitCost: r.unit_cost || 0,
    bottleOpen: !!r.bottle_open,
    createdBy: r.created_by_name || undefined };
}
function popoteOut(r) {
  return { id: r.id, name: r.name, mission: r.mission, active: !!r.active, createdAt: r.created_at,
    code: r.code || undefined, createdBy: r.created_by_name || undefined };
}
function memberOut(r) {
  return { id: r.id, popoteId: r.popote_id, name: r.name, createdAt: r.created_at,
    createdBy: r.created_by_name || undefined };
}
function txOut(r) {
  return {
    id: r.id, popoteId: r.popote_id, type: r.type,
    memberId: r.member_id || undefined, payerId: r.payer_id || undefined,
    items: r.items ? JSON.parse(r.items) : undefined,
    drinkers: r.drinkers ? JSON.parse(r.drinkers) : undefined,
    beneficiaries: r.beneficiaries ? JSON.parse(r.beneficiaries) : undefined,
    amount: r.amount, paymentMethod: r.payment_method || undefined,
    note: r.note || undefined, timestamp: r.timestamp,
    pending: !!r.pending,
    createdBy: r.created_by_name || undefined,
  };
}
function shopOut(r) {
  return { id: r.id, popoteId: r.popote_id, name: r.name, note: r.note, done: !!r.done, createdAt: r.created_at };
}
function popotierOut(r) {
  return { id: r.id, name: r.name, username: r.username || undefined, active: !!r.active, createdAt: r.created_at,
    role: r.role || 'popotier', popoteId: r.popote_id || undefined };
}
function purchaseOut(r) {
  return { id: r.id, popoteId: r.popote_id, productId: r.product_id || undefined, packs: r.packs,
    packSize: r.pack_size, packCost: r.pack_cost, totalCost: r.total_cost, note: r.note,
    items: r.items ? JSON.parse(r.items) : undefined,
    actorId: r.actor_id, actorName: r.actor_name, timestamp: r.timestamp };
}
function cashAdjOut(r) {
  return { id: r.id, popoteId: r.popote_id, amount: r.amount, reason: r.reason,
    actorId: r.actor_id, actorName: r.actor_name, timestamp: r.timestamp };
}

module.exports = { productOut, popoteOut, memberOut, txOut, shopOut, popotierOut, purchaseOut, cashAdjOut };
