import { fmt, esc } from '../utils/format.js';
import { popoteTx, popoteMembers, member, balance } from '../domain/selectors.js';
import { statCard } from '../ui/StatCard.js';

export function viewStats(){
  const tx = popoteTx();
  const mems = popoteMembers();
  if (!mems.length) return `<div class="px-6 pt-14 text-center text-gray-400"><p class="text-sm">Pas encore de données pour cette popote.</p></div>`;

  const paidAmount = {};
  for (const t of tx){
    if (t.type==='consumption'){
      paidAmount[t.memberId] = (paidAmount[t.memberId]||0) + t.amount;
    }
    if (t.type==='adjustment'){
      paidAmount[t.memberId] = (paidAmount[t.memberId]||0) - t.amount;
    }
    if (t.type==='tournee'){
      paidAmount[t.payerId] = (paidAmount[t.payerId]||0) + t.amount;
    }
  }
  const topList = (obj, unit) => Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .map(([id,v],i)=>`<div class="flex items-center justify-between py-2 ${i<4?'border-b border-gray-100':''}">
      <div class="flex items-center gap-2"><span class="text-xs font-bold text-gray-300 w-4">${i+1}</span><span class="text-sm font-medium">${esc(member(id)?.name||'—')}</span></div>
      <span class="text-sm font-bold text-navy-800">${unit==='€' ? fmt(v) : Math.round(v)+' conso'}</span>
    </div>`).join('') || `<p class="text-sm text-gray-400 py-2">Pas encore de données.</p>`;

  const totalOut = mems.reduce((s,m)=>{ const b = balance(m.id); return s + (b<0?b:0); },0);
  const totalCredit = mems.reduce((s,m)=>{ const b = balance(m.id); return s + (b>0?b:0); },0);
  const deficits = mems.map(m=>({m,b:balance(m.id)})).filter(x=>x.b<0).sort((a,b)=>a.b-b.b);

  return `
  <div class="px-4 pt-4 space-y-4">
    <div class="grid grid-cols-2 gap-3">
      ${statCard({ label: 'Crédit total en caisse', value: fmt(totalCredit), valueClass: 'text-emerald-600', size: 'xl' })}
      ${statCard({ label: 'Déficit total', value: fmt(totalOut), valueClass: 'text-red-500', size: 'xl' })}
    </div>

    <div class="card rounded-2xl p-4">
      <div class="text-sm font-bold text-navy-900 mb-1">💶 Ceux qui dépensent / payent le plus</div>
      ${topList(paidAmount,'€')}
    </div>

    <div class="card rounded-2xl p-4">
      <div class="text-sm font-bold text-navy-900 mb-2">⚠️ En déficit</div>
      ${deficits.length ? deficits.map(x=>`<div class="flex justify-between py-1.5 text-sm"><span>${esc(x.m.name)}</span><span class="font-bold text-red-500">${fmt(x.b)}</span></div>`).join('') : `<p class="text-sm text-gray-400">Personne n'est en déficit 🎉</p>`}
    </div>
  </div>`;
}
