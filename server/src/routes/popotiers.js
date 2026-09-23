const express = require('express');
const { v4: uuid } = require('uuid');
const { db, now } = require('../db');
const { hashPassword } = require('../crypto');
const { EFFECTIVE_SUPER_USERNAME } = require('../config');
const { requireChefOrSuper, canManagePopotier } = require('../auth');
const { popotierOut } = require('../serializers');

const router = express.Router();

router.post('/popotiers', requireChefOrSuper, (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) return res.status(400).json({ error: 'nom, identifiant et mot de passe requis' });
  if (String(password).length < 4) return res.status(400).json({ error: 'mot de passe trop court (4 caractères minimum)' });
  if (String(username).toLowerCase() === EFFECTIVE_SUPER_USERNAME.toLowerCase()) return res.status(400).json({ error: 'cet identifiant est réservé au super-admin' });
  const taken = db.prepare('SELECT id FROM popotiers WHERE active=1 AND lower(username)=lower(?)').get(username);
  if (taken) return res.status(400).json({ error: 'cet identifiant est déjà pris' });
  let role = req.body.role === 'chef' ? 'chef' : 'popotier';
  let popoteId = req.body.popoteId || null;
  if (req.actor.type === 'chef') {
    role = 'popotier';
    popoteId = req.actor.popoteId;
  }
  if (role === 'chef' && !popoteId) return res.status(400).json({ error: "un chef popotier doit être associé à une popote" });
  const { salt, hash } = hashPassword(password);
  const id = uuid();
  db.prepare('INSERT INTO popotiers(id,name,username,pin_salt,pin_hash,role,popote_id,active,created_at) VALUES (?,?,?,?,?,?,?,1,?)')
    .run(id, name, username, salt, hash, role, popoteId, now());
  res.json(popotierOut(db.prepare('SELECT * FROM popotiers WHERE id=?').get(id)));
});
router.patch('/popotiers/:id', requireChefOrSuper, (req, res) => {
  const cur = db.prepare('SELECT * FROM popotiers WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!canManagePopotier(req.actor, cur)) return res.status(401).json({ error: 'pas autorisé sur ce compte' });
  const b = req.body;
  let pin_salt = cur.pin_salt, pin_hash = cur.pin_hash;
  if (b.password) {
    if (String(b.password).length < 4) return res.status(400).json({ error: 'mot de passe trop court (4 caractères minimum)' });
    const h = hashPassword(b.password); pin_salt = h.salt; pin_hash = h.hash;
  }
  let username = cur.username;
  if (b.username && b.username !== cur.username) {
    if (String(b.username).toLowerCase() === EFFECTIVE_SUPER_USERNAME.toLowerCase()) return res.status(400).json({ error: 'cet identifiant est réservé au super-admin' });
    const taken = db.prepare('SELECT id FROM popotiers WHERE active=1 AND lower(username)=lower(?) AND id<>?').get(b.username, req.params.id);
    if (taken) return res.status(400).json({ error: 'cet identifiant est déjà pris' });
    username = b.username;
  }
  // un chef ne peut ni changer le rôle ni réassigner la popote (seul le super-admin le peut)
  const role = (req.actor.type === 'super' && b.role) ? (b.role === 'chef' ? 'chef' : 'popotier') : cur.role;
  const popoteId = (req.actor.type === 'super' && 'popoteId' in b) ? (b.popoteId || null) : cur.popote_id;
  db.prepare('UPDATE popotiers SET name=?, username=?, active=?, pin_salt=?, pin_hash=?, role=?, popote_id=? WHERE id=?')
    .run(b.name ?? cur.name, username, ('active' in b) ? (b.active ? 1 : 0) : cur.active, pin_salt, pin_hash, role, popoteId, req.params.id);
  res.json({ ok: true });
});
router.delete('/popotiers/:id', requireChefOrSuper, (req, res) => {
  const cur = db.prepare('SELECT * FROM popotiers WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'introuvable' });
  if (!canManagePopotier(req.actor, cur)) return res.status(401).json({ error: 'pas autorisé sur ce compte' });
  db.prepare('DELETE FROM popotiers WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
