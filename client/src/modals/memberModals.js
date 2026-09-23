import { State } from '../state/store.js';
import { fmt, esc } from '../utils/format.js';
import { member, balance } from '../domain/selectors.js';
import { formModal } from '../ui/formModal.js';
import { field, textInput, selectInput, checkboxLine, chipGroup } from '../ui/fields.js';

const payMethodOptions = (selected) => State.payMethods.map(m => ({ value: m, label: esc(m), selected: selected === m }));

export function modalNewMember(){
  formModal({
    title: 'Nouvelle carte',
    action: 'submit-new-member',
    fields: [
      field('Nom du camarade', textInput({ name: 'name', required: true, placeholder: 'Ex : Cpl Martin' })),
      field('Crédit initial', chipGroup('initial', [10,20,30]) + textInput({ name: 'initial', type: 'number', value: 10, attrs: 'id="initial" step="1" min="0"' })),
      field('Moyen de paiement', selectInput({ name: 'paymentMethod', options: payMethodOptions() })),
      checkboxLine('pending', 'Carte prise en attente de paiement (à régulariser plus tard)'),
    ].join(''),
    submitLabel: 'Créer la carte',
  });
}

export function modalRecharge(memberId){
  const m = member(memberId);
  const bal = balance(memberId);
  formModal({
    title: `Recharger — ${esc(m.name)}`,
    subtitle: `Solde actuel : <b class="${bal<0?'text-red-600':'text-emerald-600'}">${fmt(bal)}</b>`,
    action: 'submit-recharge',
    dataAttrs: { id: memberId },
    fields: [
      chipGroup('amount', [10,20,30,50]),
      textInput({ name: 'amount', type: 'number', value: 10, attrs: 'id="amount" step="1" min="1"' }),
      field('Moyen de paiement', selectInput({ name: 'paymentMethod', options: payMethodOptions() })),
      checkboxLine('pending', 'Carte prise en attente de paiement (à régulariser plus tard)'),
    ].join(''),
    submitLabel: 'Créditer la carte',
  });
}

export function modalAdjustBalance(memberId){
  const m = member(memberId);
  const bal = balance(memberId);
  formModal({
    title: `Ajuster le solde — ${esc(m.name)}`,
    subtitle: `Solde actuel : <b class="${bal<0?'text-red-600':'text-emerald-600'}">${fmt(bal)}</b>`,
    action: 'submit-adjust-balance',
    dataAttrs: { id: memberId },
    fields: [
      `<p class="text-xs text-gray-400">Pour reprendre une popote en cours : entre un montant négatif pour les consommations déjà faites avant l'appli (ex : -4 pour 3 bières à 1 € et 2 softs à 0,50 €). Positif pour corriger une erreur en sa faveur.</p>`,
      textInput({ name: 'amount', type: 'number', required: true, placeholder: 'Ex : -4 ou 2.50', attrs: 'step="0.10"' }),
      textInput({ name: 'note', placeholder: "Raison (ex : consos avant passage sur l'appli)" }),
    ].join(''),
    submitLabel: 'Ajuster',
  });
}
