import { State } from '../state/store.js';
import { esc } from '../utils/format.js';
import { openModal } from './modalCore.js';
import { formModal, modalHeader } from '../ui/formModal.js';
import { textInput } from '../ui/fields.js';

export function modalPayMethods(){
  openModal(`
    ${modalHeader({ title: 'Moyens de paiement' })}
    <div id="pm-list" class="space-y-2 mb-4">
      ${State.payMethods.map((m,i)=>`
        <div class="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
          <span class="text-sm font-medium">${esc(m)}</span>
          <button data-action="remove-pm" data-idx="${i}" class="text-red-500 text-xs font-semibold hover:underline">retirer</button>
        </div>`).join('')}
    </div>
    <form data-action="submit-add-pm" class="flex gap-2">
      ${textInput({ name: 'method', required: true, placeholder: 'Ex : Lydia', className: 'flex-1 border border-gray-200 rounded-xl px-3 py-2.5' })}
      <button class="bg-navy-800 text-white rounded-xl px-4 font-semibold hover:bg-navy-900">Ajouter</button>
    </form>
  `);
}

export function modalManualShopping(){
  formModal({
    title: 'Ajouter à la liste de courses',
    action: 'submit-manual-shopping',
    fields: [
      textInput({ name: 'name', required: true, placeholder: 'Article' }),
      textInput({ name: 'note', placeholder: 'Note (optionnel)' }),
    ].join(''),
    submitLabel: 'Ajouter',
  });
}

export function modalCashAdjustment(){
  formModal({
    title: 'Ajustement de caisse',
    subtitle: "Positif pour un apport (fond de caisse initial...), négatif pour une perte ou une correction de comptage.",
    action: 'submit-cash-adjustment',
    fields: [
      textInput({ name: 'amount', type: 'number', required: true, placeholder: 'Ex : 50 ou -12.50', attrs: 'step="0.10"' }),
      textInput({ name: 'reason', required: true, placeholder: 'Raison (ex : fond de caisse initial)' }),
    ].join(''),
    submitLabel: 'Enregistrer',
  });
}
