import { State } from '../../state/store.js';

export function adminSettings(){
  return `
  <div class="space-y-3">
    <button data-action="open-pay-methods" class="w-full card rounded-2xl p-4 flex justify-between items-center text-left">
      <div><div class="font-semibold text-navy-900">Moyens de paiement</div><div class="text-xs text-gray-400">${State.payMethods.length} configurés</div></div>
      <span class="text-gray-300">›</span>
    </button>
    <div class="card rounded-2xl p-4">
      <div class="font-semibold text-navy-900 mb-1">Identifiants d'accès</div>
      <p class="text-xs text-gray-400">Les identifiants et mots de passe des popotiers se gèrent dans l'onglet <b>Popotiers</b> (super-admin uniquement). Les identifiants du super-admin, eux, sont définis par les variables d'environnement <code class="bg-gray-100 px-1 rounded">SUPER_ADMIN_USERNAME</code> et <code class="bg-gray-100 px-1 rounded">SUPER_ADMIN_PASSWORD</code> sur le serveur — ils ne se changent pas depuis l'app.</p>
    </div>
  </div>`;
}
