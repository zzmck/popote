const express = require('express');
const { v4: uuid } = require('uuid');
const { db, now, genPopoteCode } = require('../db');
const { hashPassword } = require('../crypto');
const { EFFECTIVE_SUPER_USERNAME } = require('../config');
const { popoteOut } = require('../serializers');

const router = express.Router();

router.post('/onboarding/popote', (req, res) => {
  const { popoteName, mission, chefName, chefUsername, chefPassword } = req.body;
  if (!popoteName || !chefName || !chefUsername || !chefPassword) return res.status(400).json({ error: 'nom de popote, nom, identifiant et mot de passe du chef requis' });
  if (String(chefPassword).length < 4) return res.status(400).json({ error: 'mot de passe trop court (4 caractères minimum)' });
  if (String(chefUsername).toLowerCase() === EFFECTIVE_SUPER_USERNAME.toLowerCase()) return res.status(400).json({ error: 'cet identifiant est réservé au super-admin, choisis-en un autre' });
  const taken = db.prepare('SELECT id FROM popotiers WHERE active=1 AND lower(username)=lower(?)').get(chefUsername);
  if (taken) return res.status(400).json({ error: 'cet identifiant est déjà pris, choisis-en un autre' });
  const popoteId = uuid();
  const chefId = uuid();
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO popotes(id,name,mission,active,code,created_at,created_by_id,created_by_name) VALUES (?,?,?,1,?,?,?,?)')
      .run(popoteId, popoteName, mission || '', genPopoteCode(), now(), chefId, chefName);
    const { salt, hash } = hashPassword(chefPassword);
    db.prepare('INSERT INTO popotiers(id,name,username,pin_salt,pin_hash,role,popote_id,active,created_at) VALUES (?,?,?,?,?,\'chef\',?,1,?)')
      .run(chefId, chefName, chefUsername, salt, hash, popoteId, now());
  });
  tx();
  res.json({ popote: popoteOut(db.prepare('SELECT * FROM popotes WHERE id=?').get(popoteId)),
    actor: { type: 'chef', id: chefId, name: chefName, popoteId } });
});

module.exports = router;
