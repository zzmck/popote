const { db } = require('./db');
const { verifyPassword } = require('./crypto');
const { EFFECTIVE_SUPER_USERNAME, EFFECTIVE_SUPER_PASSWORD } = require('./config');

function findActor(username, password) {
  if (!username || !password) return null;
  if (String(username).toLowerCase() === EFFECTIVE_SUPER_USERNAME.toLowerCase() && String(password) === EFFECTIVE_SUPER_PASSWORD) {
    return { type: 'super', id: 'super', name: 'Super admin', popoteId: null };
  }
  const r = db.prepare('SELECT * FROM popotiers WHERE active=1 AND username IS NOT NULL AND lower(username)=lower(?)').get(username);
  if (r && verifyPassword(password, r.pin_salt, r.pin_hash)) {
    return { type: r.role === 'chef' ? 'chef' : 'popotier', id: r.id, name: r.name, popoteId: r.popote_id || null };
  }
  return null;
}

function actorScopeOk(actor, popoteId) {
  if (!popoteId) return true;
  if (actor.type === 'super') return true;
  if (!actor.popoteId) return true;
  return actor.popoteId === popoteId;
}

function requireAuth(req, res, next) {
  const actor = findActor(req.header('X-Admin-Username'), req.header('X-Admin-Password'));
  if (!actor) return res.status(401).json({ error: 'Identifiants invalides' });
  req.actor = actor;
  next();
}

function requireSuperAdmin(req, res, next) {
  const actor = findActor(req.header('X-Admin-Username'), req.header('X-Admin-Password'));
  if (!actor || actor.type !== 'super') return res.status(401).json({ error: 'Réservé au super-admin' });
  req.actor = actor;
  next();
}

function requireChefOrSuper(req, res, next) {
  const actor = findActor(req.header('X-Admin-Username'), req.header('X-Admin-Password'));
  if (!actor || (actor.type !== 'super' && actor.type !== 'chef')) return res.status(401).json({ error: 'Réservé au super-admin ou à un chef popotier' });
  req.actor = actor;
  next();
}

function canManagePopotier(actor, target) {
  if (actor.type === 'super') return true;
  if (actor.type === 'chef' && target.role === 'popotier' && target.popote_id === actor.popoteId) return true;
  return false;
}

module.exports = { findActor, actorScopeOk, requireAuth, requireSuperAdmin, requireChefOrSuper, canManagePopotier };
