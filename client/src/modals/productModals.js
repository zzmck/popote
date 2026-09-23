import { CATS } from '../state/store.js';
import { fmt, esc } from '../utils/format.js';
import { product } from '../domain/selectors.js';
import { openModal } from './modalCore.js';
import { formModal, modalHeader } from '../ui/formModal.js';
import { field, textInput, selectInput, grid2 } from '../ui/fields.js';
import { ui } from '../ui/styles.js';

const catOptions = (selected) => Object.entries(CATS).map(([k,v]) => ({ value: k, label: `${v.emoji} ${v.label}`, selected: selected === k }));
const compactInput = 'w-full border border-gray-200 rounded-xl px-3 py-2';

export function modalNewProduct(){
  formModal({
    title: 'Nouveau produit',
    action: 'submit-new-product',
    fields: [
      field('Nom', textInput({ name: 'name', required: true, placeholder: 'Ex : Heineken 33cl' })),
      field('Catégorie', selectInput({ name: 'category', options: catOptions() })),
      grid2(
        field('Prix (€)', textInput({ name: 'price', type: 'number', required: true, placeholder: '1,50', attrs: 'step="0.10" min="0"' })),
        field('Seuil réappro', textInput({ name: 'minStock', type: 'number', value: 6, attrs: 'min="0"' })),
      ),
      grid2(
        field('Stock réserve', textInput({ name: 'stockReserve', type: 'number', value: 0, attrs: 'min="0"' })),
        field('Déjà au frigo', textInput({ name: 'fridgeQty', type: 'number', value: 0, attrs: 'min="0"' })),
      ),
      `<p class="text-xs font-semibold text-gray-500 pt-1">Pour le suivi financier (achat par pack revendu à l'unité)</p>`,
      grid2(
        field('Unités par pack', textInput({ name: 'packSize', type: 'number', value: 1, attrs: 'min="1"' })),
        field("Prix d'achat du pack (€)", textInput({ name: 'packCost', type: 'number', value: 0, attrs: 'step="0.10" min="0"' })),
      ),
    ].join(''),
    submitLabel: 'Ajouter le produit',
  });
}

export function modalEditProduct(id){
  const p = product(id);
  formModal({
    title: `Modifier — ${esc(p.name)}`,
    action: 'submit-edit-product',
    dataAttrs: { id },
    fields: [
      field('Nom', textInput({ name: 'name', required: true, value: p.name })),
      field('Catégorie', selectInput({ name: 'category', options: catOptions(p.category) })),
      grid2(
        field('Prix de vente (€)', textInput({ name: 'price', type: 'number', required: true, value: p.price, attrs: 'step="0.10" min="0"' })),
        field('Seuil réappro', textInput({ name: 'minStock', type: 'number', value: p.minStock||0, attrs: 'min="0"' })),
      ),
      grid2(
        field('Unités par pack', textInput({ name: 'packSize', type: 'number', value: p.packSize||1, attrs: 'min="1"' })),
        field('Coût unitaire (€)', textInput({ name: 'unitCost', type: 'number', value: (p.unitCost||0).toFixed(2), attrs: 'step="0.01" min="0"' })),
      ),
      grid2(
        field('Stock réserve', textInput({ name: 'stockReserve', type: 'number', value: p.stockReserve||0, attrs: 'min="0"' })),
        field('Frigo', textInput({ name: 'fridgeQty', type: 'number', value: p.fridgeQty||0, attrs: 'min="0"' })),
      ),
      `<p class="text-xs text-gray-400">Le coût unitaire se met normalement à jour tout seul à chaque achat enregistré — ne le corrige ici qu'en cas d'erreur. Idem pour le stock/frigo : passe plutôt par "Stock" pour un achat ou un transfert, ces champs ne sont là que pour corriger une erreur de comptage.</p>`,
    ].join(''),
    submitLabel: 'Enregistrer',
    secondary: `<button type="button" data-action="delete-product" data-id="${id}" class="${ui.btnDanger}">Suppr.</button>`,
  });
}

export function modalStockOps(id){
  const p = product(id);
  const margeUnitaire = (p.price||0) - (p.unitCost||0);
  openModal(`
    ${modalHeader({
      title: `Stock — ${esc(p.name)}`,
      subtitle: `Réserve : <b>${p.stockReserve||0}</b> · Frigo : <b>${p.fridgeQty||0}</b> · coût unitaire actuel : <b>${fmt(p.unitCost||0)}</b> · marge/unité : <b class="${margeUnitaire<0?'text-red-500':'text-emerald-600'}">${fmt(margeUnitaire)}</b>`,
    })}
    <div class="border border-gray-200 rounded-2xl p-3.5 mb-3">
      <div class="text-sm font-bold text-navy-900 mb-2">💶 Enregistrer un achat (sort de la caisse)</div>
      <form data-action="submit-purchase" data-id="${id}" class="space-y-2">
        ${grid2(
          field('Nb de packs achetés', textInput({ name: 'packs', type: 'number', value: 1, attrs: 'min="1"', className: compactInput })),
          field('Unités/pack', textInput({ name: 'packSize', type: 'number', value: p.packSize||1, attrs: 'min="1"', className: compactInput })),
        )}
        ${field('Prix payé par pack (€)', textInput({ name: 'packCost', type: 'number', value: p.packCost||0, attrs: 'step="0.10" min="0"', className: compactInput }))}
        <button class="w-full bg-navy-800 text-white rounded-xl py-2.5 font-semibold hover:bg-navy-900 transition">Enregistrer l'achat</button>
      </form>
    </div>

    <div class="border border-gray-200 rounded-2xl p-3.5 mb-3">
      <div class="text-sm font-bold text-navy-900 mb-2">🧊 Transférer réserve → frigo</div>
      <form data-action="submit-transfer" data-id="${id}" class="flex gap-2">
        ${textInput({ name: 'qty', type: 'number', value: 1, attrs: 'min="1"', className: 'flex-1 border border-gray-200 rounded-xl px-3 py-2' })}
        <button class="bg-navy-800 text-white rounded-xl px-4 font-semibold hover:bg-navy-900">Transférer</button>
      </form>
    </div>

    <details class="text-sm">
      <summary class="cursor-pointer text-gray-400 font-medium">Ajustement manuel (correction de stock, sans impact caisse)</summary>
      <form data-action="submit-adjust-stock" data-id="${id}" class="flex gap-2 mt-2">
        ${textInput({ name: 'delta', type: 'number', value: 0, placeholder: '+2 ou -1', className: 'flex-1 border border-gray-200 rounded-xl px-3 py-2' })}
        <button class="bg-gray-100 text-navy-800 rounded-xl px-4 font-semibold hover:bg-gray-200">Ajuster réserve</button>
      </form>
    </details>
  `);
}
