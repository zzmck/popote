import { State } from '../state/store.js';
import { esc } from '../utils/format.js';
import { openModal } from './modalCore.js';
import { formModal, modalHeader } from '../ui/formModal.js';
import { field, textInput } from '../ui/fields.js';

export function modalNewPopote(){
  formModal({
    title: 'Nouvelle popote',
    action: 'submit-new-popote',
    fields: [
      field('Nom', textInput({ name: 'name', required: true, placeholder: 'Ex : Popote Barkhane 3' })),
      field('Mission / lieu (optionnel)', textInput({ name: 'mission', placeholder: 'Ex : Djibouti 2026' })),
    ].join(''),
    submitLabel: 'Créer la popote',
  });
}

export function modalChoosePopote(){
  const list = [...State.popotes].sort((a,b)=> (b.active - a.active) || a.name.localeCompare(b.name));
  openModal(`
    ${modalHeader({ title: 'Choisir une popote', subtitle: list.length ? 'Sélectionne la popote à afficher.' : "Aucune popote pour l'instant." })}
    <div class="space-y-2 max-h-[60vh] overflow-y-auto">
      ${list.map(pp=>`
        <button data-action="choose-popote" data-id="${pp.id}" class="w-full text-left card rounded-xl p-3 flex items-center justify-between gap-2 ${pp.id===State.currentPopoteId?'ring-2 ring-navy-600':''} ${!pp.active?'opacity-50':''}">
          <div class="min-w-0">
            <div class="font-semibold text-navy-900 truncate">${esc(pp.name)}</div>
            <div class="text-xs text-gray-400 truncate">${esc(pp.mission||'—')}</div>
          </div>
          ${!pp.active ? `<span class="text-[10px] font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-1 shrink-0">Clôturée</span>` : ''}
        </button>`).join('')}
    </div>
  `);
}

export function modalEnterPopoteCode(){
  formModal({
    title: 'Rejoindre une popote',
    subtitle: 'Entre le code communiqué par ton chef popotier. Il reste mémorisé sur cet appareil pour y revenir directement.',
    action: 'submit-popote-code',
    fields: textInput({ name: 'code', required: true, value: State.popoteCode||'', placeholder: 'Ex : 7K2P9Q', attrs: 'maxlength="8"', className: 'w-full border border-gray-200 rounded-xl px-3 py-3 text-center text-xl tracking-[0.3em] uppercase font-bold focus:outline-none focus:ring-2 focus:ring-navy-600' }),
    submitLabel: 'Valider',
    tail: State.popoteCode ? `<button type="button" data-action="forget-popote-code" class="w-full text-xs text-gray-400 hover:text-red-500 pt-1">Oublier ce code</button>` : '',
  });
}
