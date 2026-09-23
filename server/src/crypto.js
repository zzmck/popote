const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}
function verifyPassword(password, salt, hash) {
  try {
    const test = crypto.scryptSync(String(password), salt, 64);
    const orig = Buffer.from(hash, 'hex');
    return orig.length === test.length && crypto.timingSafeEqual(orig, test);
  } catch (e) { return false; }
}

module.exports = { hashPassword, verifyPassword };
