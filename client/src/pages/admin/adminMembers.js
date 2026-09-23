import { fmt, esc } from '../../utils/format.js';
import { curPopote, popoteMembers, popoteTx, balance } from '../../domain/selectors.js';
import { noPopoteScreen } from '../../components/screens.js';
import { addButton } from '../../ui/AddButton.js';

export function adminMembers(){
  if (!curPopote()) return noPopoteScreen();
  const mems = popoteMembers();
  const tx = popoteTx();
  return `
  <div class="space-y-3">
    ${addButton({ action: 'open-new-member', label: '+ Nouvelle carte' })}
    ${mems.map(m=>{ const b = balance(m.id);
      const due = tx.filter(t=>t.type==='recharge' && t.memberId===m.id && t.pending).reduce((s,t)=>s+t.amount,0);
      return `<div class="card rounded-2xl p-4 flex items-center justify-between gap-2 flex-wrap">
        <div class="min-w-0">
          <div class="font-semibold text-navy-900 truncate">${esc(m.name)}</div>
          <div class="text-xs ${b<0?'text-red-500':'text-emerald-600'} font-semibold">${fmt(b)}</div>
          ${due>0 ? `<div class="text-xs font-semibold text-gold-700 bg-gold-50 rounded-lg px-1.5 py-0.5 inline-block mt-1">⏳ ${fmt(due)} non payé</div>` : ''}
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button data-action="open-recharge" data-id="${m.id}" class="text-xs font-semibold px-2.5 py-2 rounded-full bg-navy-50 text-navy-700">Recharger</button>
          <button data-action="open-adjust-balance" data-id="${m.id}" class="text-xs font-semibold px-2.5 py-2 rounded-full bg-gray-100 text-gray-600">Ajuster</button>
          <button data-action="delete-member" data-id="${m.id}" class="icon-btn text-red-400 active:text-red-600 text-sm">🗑️</button>
        </div>
      </div>`; }).join('')}
  </div>`;
}
