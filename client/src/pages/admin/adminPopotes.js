import { State } from '../../state/store.js';
import { esc } from '../../utils/format.js';
import { addButton } from '../../ui/AddButton.js';

export function adminPopotes(){
  const scopedChef = State.actor?.type==='chef' && State.actor.popoteId;
  const list = scopedChef ? State.popotes.filter(p=>p.id===State.actor.popoteId) : State.popotes;
  return `
  <div class="space-y-3">
    ${scopedChef
      ? `<p class="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">Tu gères la popote ci-dessous. Pour une nouvelle mission, déconnecte-toi puis crée une nouvelle popote depuis l'écran de connexion.</p>`
      : addButton({ action: 'open-new-popote', label: '+ Nouvelle popote' })}
    ${list.map(p=>`
      <div class="card rounded-2xl p-4 flex items-center justify-between gap-2 flex-wrap">
        <div class="min-w-0">
          <div class="font-semibold text-navy-900 truncate">${esc(p.name)}</div>
          <div class="text-xs text-gray-400 truncate">${esc(p.mission||'—')}</div>
          ${p.code ? `<div class="text-xs text-navy-700 font-semibold mt-1">Code : <span class="tracking-widest">${esc(p.code)}</span></div>` : ''}
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button data-action="toggle-popote" data-id="${p.id}" data-active="${p.active?0:1}" class="text-xs font-semibold px-3 py-2 rounded-full ${p.active?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-500'}">${p.active?'Clôturer':'Rouvrir'}</button>
          ${State.actor?.type==='super' ? `<button data-action="delete-popote" data-id="${p.id}" class="icon-btn text-red-400 active:text-red-600 text-sm">🗑️</button>` : ''}
        </div>
      </div>`).join('')}
  </div>`;
}
