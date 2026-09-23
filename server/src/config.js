require('dotenv').config();

const DATA_DIR = process.env.DATA_DIR || '/data';
const PORT = process.env.PORT || 3000;

const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
if (!SUPER_ADMIN_USERNAME || !SUPER_ADMIN_PASSWORD) {
  console.warn('\n⚠️  SUPER_ADMIN_USERNAME / SUPER_ADMIN_PASSWORD non définis dans l\'environnement (.env ou variable Docker/K8s).');
  console.warn('    Identifiants de secours temporaires : admin / admin0000 — À NE PAS UTILISER EN PRODUCTION.');
  console.warn('    Définis SUPER_ADMIN_USERNAME et SUPER_ADMIN_PASSWORD avant un déploiement réel.\n');
}
const EFFECTIVE_SUPER_USERNAME = SUPER_ADMIN_USERNAME || 'admin';
const EFFECTIVE_SUPER_PASSWORD = SUPER_ADMIN_PASSWORD || 'admin0000';

module.exports = { DATA_DIR, PORT, EFFECTIVE_SUPER_USERNAME, EFFECTIVE_SUPER_PASSWORD };
