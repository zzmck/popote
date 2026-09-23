import { CATS, BOTTLE_CATS } from '../../state/store.js';
import { fmt, esc } from '../../utils/format.js';
import { curPopote, popoteProducts } from '../../domain/selectors.js';
import { noPopoteScreen } from '../../components/screens.js';
import { addButton } from '../../ui/AddButton.js';

export function adminProducts(){
  if (!curPopote()) return noPopoteScreen();
  const prods = popoteProducts();
  return `
  <div class="space-y-3">
    ${addButton({ action: 'open-new-product', label: '+ Nouveau produit' })}
    ${prods.map(p=>`
      <div class="card rounded-2xl p-4">
        <div class="flex justify-between items-start gap-2 flex-wrap">
          <div class="min-w-0">
            <div class="font-semibold text-navy-900 truncate">${CATS[p.category]?.emoji||'📦'} ${esc(p.name)}</div>
            <div class="text-xs text-gray-400">vente ${fmt(p.price)} · coût ${fmt(p.unitCost||0)}/u · réserve ${p.stockReserve||0} · frigo ${p.fridgeQty||0} · seuil ${p.minStock||0}</div>
          </div>
          <div class="flex gap-2 shrink-0">
            <button data-action="open-stock-ops" data-id="${p.id}" class="text-xs font-semibold px-2.5 py-2 rounded-full bg-navy-50 text-navy-700">Stock</button>
            <button data-action="open-edit-product" data-id="${p.id}" class="text-xs font-semibold px-2.5 py-2 rounded-full bg-gray-100 text-gray-600">Modifier</button>
          </div>
        </div>
        ${(p.stockReserve||0) <= (p.minStock||0) ? `<div class="mt-2 text-xs font-semibold text-gold-700 bg-gold-50 rounded-lg px-2 py-1 inline-block">⚠️ Stock réserve bas</div>` : ''}
        ${BOTTLE_CATS.includes(p.category) ? `<div class="mt-2 text-xs font-semibold ${p.bottleOpen?'text-emerald-700 bg-emerald-50':'text-red-500 bg-red-50'} rounded-lg px-2 py-1 inline-block">${p.bottleOpen?'🍾 Bouteille ouverte':'Aucune bouteille ouverte'}</div>` : ''}
      </div>`).join('')}
  </div>`;
}
