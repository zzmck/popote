import { State } from '../state/store.js';
import { fmt, esc } from '../utils/format.js';
import { popoteMembers, popoteTx, member, balance } from '../domain/selectors.js';
import { histRow } from '../components/histRow.js';

export function viewCompte(){
  const mems = popoteMembers();
  if (!mems.length) return `<div class="px-6 pt-14 text-center text-gray-400"><p class="text-sm">Aucune carte créée dans cette popote.</p></div>`;
  const sel = State.currentMemberId && mems.some(m=>m.id===State.currentMemberId) ? State.currentMemberId : mems[0].id;
  const m = member(sel);
  const bal = balance(sel);
  const hist = popoteTx().filter(t=>t.memberId===sel || t.payerId===sel || (t.drinkers||[]).some(d=>d.memberId===sel)).slice(0,25);

  return `
  <div class="px-4 pt-4 space-y-4">
    <select data-action="select-me" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-semibold">
      ${mems.map(x=>`<option value="${x.id}" ${x.id===sel?'selected':''}>${esc(x.name)}</option>`).join('')}
    </select>

    <div class="card rounded-3xl p-5 shadow-sm bg-gradient-to-br from-navy-800 to-navy-900 text-white">
      <div class="text-xs text-navy-200 mb-1">Solde de la carte</div>
      <div class="text-3xl font-bold ${bal<0?'text-red-300':'text-white'}">${fmt(bal)}</div>
      <div class="mt-2 inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${bal<0?'bg-red-500/20 text-red-200':'bg-emerald-500/20 text-emerald-200'}">
        ${bal<0 ? 'En déficit' : 'En crédit'}
      </div>
    </div>

    <div>
      <div class="text-xs font-semibold text-gray-500 mb-2 px-1">Historique</div>
      <div class="space-y-2">
        ${hist.length ? hist.map(t=>histRow(t, sel)).join('') : `<p class="text-sm text-gray-400 px-1">Aucun mouvement.</p>`}
      </div>
    </div>
  </div>`;
}
