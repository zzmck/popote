import { State } from '../../state/store.js';
import { esc } from '../../utils/format.js';
import { curPopote, popoteProducts } from '../../domain/selectors.js';
import { noPopoteScreen } from '../../components/screens.js';

export function adminShopping(){
  if (!curPopote()) return noPopoteScreen();
  const manual = State.shopping.filter(s=>s.popoteId===State.currentPopoteId);
  const prods = [...popoteProducts()].sort((a,b)=>{
    const lowA = (a.stockReserve||0) <= (a.minStock||0), lowB = (b.stockReserve||0) <= (b.minStock||0);
    if (lowA !== lowB) return lowA ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return `
  <div class="space-y-4">
    <form data-action="submit-shopping-run" class="card rounded-2xl p-4">
      <div class="text-sm font-bold text-navy-900 mb-1">🛒 Enregistrer les courses</div>
      <p class="text-xs text-gray-400 mb-2">Quantité prise à l'achat pour chaque produit : elle complète le stock réserve.</p>
      <div class="max-h-72 overflow-y-auto -mx-1 px-1 divide-y divide-gray-100">
        ${prods.length ? prods.map(p=>{
          const low = (p.stockReserve||0) <= (p.minStock||0);
          return `<div class="flex items-center justify-between gap-2 py-2">
            <div class="min-w-0">
              <div class="text-sm font-medium truncate">${esc(p.name)} ${low?'<span class="text-[10px] font-bold text-red-500 bg-red-50 rounded-full px-1.5 py-0.5 align-middle">à acheter</span>':''}</div>
              <div class="text-xs text-gray-400">réserve ${p.stockReserve||0} / seuil ${p.minStock||0}</div>
            </div>
            <input name="qty_${p.id}" type="number" min="0" value="0" class="w-20 border border-gray-200 rounded-xl px-2 py-1.5 text-right shrink-0">
          </div>`;
        }).join('') : `<p class="text-sm text-gray-400 py-2">Aucun produit.</p>`}
      </div>
      <div class="pt-3 mt-1 border-t border-gray-100">
        <label class="text-xs font-semibold text-gray-500">Montant total dépensé (€)</label>
        <input name="amount" type="number" step="0.10" min="0" placeholder="Total du ticket de caisse" class="w-full border border-gray-200 rounded-xl px-3 py-2.5">
        <p class="text-[11px] text-gray-400 mt-1">Ce montant sort du fond de caisse et est inscrit dans la trésorerie (onglet Caisse).</p>
      </div>
      <button class="w-full bg-navy-800 text-white rounded-xl py-2.5 font-semibold hover:bg-navy-900 transition mt-3">Valider les courses</button>
    </form>

    <div class="card rounded-2xl p-4">
      <div class="flex justify-between items-center mb-2">
        <div class="text-sm font-bold text-navy-900">Liste manuelle</div>
        <button data-action="open-manual-shopping" class="text-xs font-semibold text-navy-700">+ ajouter</button>
      </div>
      ${manual.length ? manual.map(s=>`
        <label class="flex items-center gap-2 py-1.5 text-sm ${s.done?'opacity-40 line-through':''}">
          <input type="checkbox" data-action="toggle-shopping" data-id="${s.id}" ${s.done?'checked':''} class="rounded w-5 h-5 shrink-0">
          <span class="flex-1 min-w-0 break-words">${esc(s.name)}${s.note?' — '+esc(s.note):''}</span>
          <button data-action="delete-shopping" data-id="${s.id}" class="icon-btn text-red-400 shrink-0">✕</button>
        </label>`).join('') : `<p class="text-sm text-gray-400">Rien de plus à ajouter.</p>`}
    </div>
  </div>`;
}
