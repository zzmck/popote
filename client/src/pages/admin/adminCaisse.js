import { fmt, esc } from '../../utils/format.js';
import { curPopote, financeSummary, member, product } from '../../domain/selectors.js';
import { noPopoteScreen } from '../../components/screens.js';
import { statCard } from '../../ui/StatCard.js';

export function adminCaisse(){
  if (!curPopote()) return noPopoteScreen();
  const f = financeSummary();
  return `
  <div class="space-y-4">
    <div class="card rounded-3xl p-5 bg-gradient-to-br from-navy-800 to-navy-900 text-white">
      <div class="text-xs text-navy-200 mb-1">Fond de caisse actuel</div>
      <div class="text-3xl font-bold ${f.fondDeCaisse<0?'text-red-300':'text-white'}">${fmt(f.fondDeCaisse)}</div>
      <div class="grid grid-cols-2 gap-2 mt-3 text-xs text-navy-100">
        <div><div class="text-navy-300">Total perçu (cartes)</div><div class="font-bold text-emerald-300">+${fmt(f.totalPercu)}</div></div>
        <div><div class="text-navy-300">Total dû (non payé)</div><div class="font-bold ${f.totalDu>0?'text-gold-300':'text-navy-100'}">${fmt(f.totalDu)}</div></div>
        <div><div class="text-navy-300">Total achats</div><div class="font-bold text-red-300">-${fmt(f.sortiesAchats)}</div></div>
        <div><div class="text-navy-300">Ajustements</div><div class="font-bold">${f.totalAjustements>=0?'+':''}${fmt(f.totalAjustements)}</div></div>
      </div>
    </div>

    <button data-action="open-cash-adjustment" class="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-sm font-semibold text-navy-700 hover:bg-gray-50">+ Ajustement de caisse</button>

    <div class="card rounded-2xl p-4">
      <div class="text-sm font-bold text-navy-900 mb-2">🕐 Cartes en attente de paiement</div>
      ${f.pendingRecharges.length ? f.pendingRecharges.map(t=>{
        const date = new Date(t.timestamp).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'});
        return `<div class="flex justify-between items-center py-1.5 text-sm border-b border-gray-100 last:border-0 gap-2">
          <div class="min-w-0 truncate"><span class="font-medium">${esc(member(t.memberId)?.name||'—')}</span> <span class="text-gray-400">· ${fmt(t.amount)} · ${date}</span></div>
          <button data-action="validate-payment" data-id="${t.id}" class="shrink-0 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700">Valider</button>
        </div>`; }).join('') : `<p class="text-sm text-gray-400">Aucune carte en attente.</p>`}
    </div>

    <div class="grid grid-cols-2 gap-3">
      ${statCard({ label: 'Valeur réserve (coût)', value: fmt(f.valeurReserveCout) })}
      ${statCard({ label: 'Valeur frigo (coût)', value: fmt(f.valeurFrigoCout) })}
      ${statCard({ label: 'Valeur de vente (frigo)', value: fmt(f.valeurFrigoVente) })}
      ${statCard({ label: 'Marge latente (frigo)', value: fmt(f.margeLatenteFrigo), valueClass: 'text-emerald-600' })}
    </div>

    <div class="card rounded-2xl p-4">
      <div class="text-sm font-bold text-navy-900 mb-2">Historique des achats</div>
      ${f.purchases.length ? f.purchases.slice(0,20).map(p=>{
        const date = new Date(p.timestamp).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'});
        if (p.items && p.items.length){
          const label = p.items.map(it=>esc(it.name)+' ×'+it.qty).join(', ');
          return `<div class="flex justify-between items-center py-1.5 text-sm border-b border-gray-100 last:border-0">
            <div><span class="font-medium">🛒 Courses</span> <span class="text-gray-400">· ${label} · ${date}${p.actorName?' · '+esc(p.actorName):''}</span></div>
            <div class="font-bold text-red-500 shrink-0 ml-2">-${fmt(p.totalCost)}</div>
          </div>`;
        }
        const prod = product(p.productId);
        return `<div class="flex justify-between items-center py-1.5 text-sm border-b border-gray-100 last:border-0">
          <div><span class="font-medium">${esc(prod?.name||'—')}</span> <span class="text-gray-400">· ${p.packs}×${p.packSize} · ${date}${p.actorName?' · '+esc(p.actorName):''}</span></div>
          <div class="font-bold text-red-500">-${fmt(p.totalCost)}</div>
        </div>`; }).join('') : `<p class="text-sm text-gray-400">Aucun achat enregistré.</p>`}
    </div>

    <div class="card rounded-2xl p-4">
      <div class="text-sm font-bold text-navy-900 mb-2">Ajustements de caisse</div>
      ${f.adjustments.length ? f.adjustments.slice(0,20).map(a=>{
        const date = new Date(a.timestamp).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'});
        return `<div class="flex justify-between items-center py-1.5 text-sm border-b border-gray-100 last:border-0">
          <div><span class="font-medium">${esc(a.reason||'—')}</span> <span class="text-gray-400">· ${date}${a.actorName?' · '+esc(a.actorName):''}</span></div>
          <div class="font-bold ${a.amount<0?'text-red-500':'text-emerald-600'}">${a.amount>=0?'+':''}${fmt(a.amount)}</div>
        </div>`; }).join('') : `<p class="text-sm text-gray-400">Aucun ajustement.</p>`}
    </div>
  </div>`;
}
