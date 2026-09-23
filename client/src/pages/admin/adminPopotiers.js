import { State } from '../../state/store.js';
import { esc } from '../../utils/format.js';
import { addButton } from '../../ui/AddButton.js';

export function adminPopotiers(){
  const actor = State.actor;
  const isSuper = actor?.type === 'super';
  const isChef = actor?.type === 'chef';
  if (!isSuper && !isChef) return `<div class="px-2 py-12 text-center text-gray-400 text-sm">Réservé au super-admin ou à un chef popotier.</div>`;
  const list = isSuper ? State.popotiers : State.popotiers.filter(p=>p.role==='popotier' && p.popoteId===actor.popoteId);
  return `
  <div class="space-y-3">
    ${addButton({ action: 'open-new-popotier', label: '+ Nouveau popotier' })}
    ${list.length ? list.map(p=>`
      <div class="card rounded-2xl p-4 flex items-center justify-between gap-2 flex-wrap">
        <div class="min-w-0">
          <div class="font-semibold text-navy-900 truncate">${esc(p.name)} ${p.role==='chef'?'<span class="text-[10px] font-bold text-gold-700 bg-gold-100 rounded-full px-2 py-0.5 align-middle">CHEF</span>':''}</div>
          <div class="text-xs text-gray-400 truncate">@${esc(p.username||'—')} · ${p.popoteId ? esc(State.popotes.find(x=>x.id===p.popoteId)?.name||'popote inconnue') : 'non rattaché'}</div>
          <div class="text-xs ${p.active?'text-emerald-600':'text-gray-400'} font-semibold">${p.active?'Actif':'Désactivé'}</div>
        </div>
        <div class="flex flex-wrap gap-2 shrink-0">
          <button data-action="open-reset-popotier-password" data-id="${p.id}" class="text-xs font-semibold px-2.5 py-2 rounded-full bg-navy-50 text-navy-700">Mot de passe</button>
          <button data-action="toggle-popotier" data-id="${p.id}" data-active="${p.active?0:1}" class="text-xs font-semibold px-2.5 py-2 rounded-full ${p.active?'bg-gray-100 text-gray-600':'bg-emerald-50 text-emerald-700'}">${p.active?'Désactiver':'Activer'}</button>
          <button data-action="delete-popotier" data-id="${p.id}" class="icon-btn text-red-400 active:text-red-600 text-sm">🗑️</button>
        </div>
      </div>`).join('') : `<p class="text-sm text-gray-400 text-center pt-6">Aucun popotier créé pour l'instant.</p>`}
  </div>`;
}
