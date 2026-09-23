import { fmt, esc } from '../utils/format.js';
import { member } from '../domain/selectors.js';

function row(title, subtitle, amountLabel, amountClass){
  return `<div class="card rounded-xl p-3 flex justify-between items-center">
    <div><div class="text-sm font-medium">${title}</div><div class="text-xs text-gray-400">${subtitle}</div></div>
    <div class="font-bold ${amountClass}">${amountLabel}</div>
  </div>`;
}

export function histRow(t, forMemberId){
  const date = new Date(t.timestamp).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  if (t.type==='recharge'){
    return row(`Recharge · ${esc(t.paymentMethod||'')}`, date, `+${fmt(t.amount)}`, 'text-emerald-600');
  }
  if (t.type==='consumption'){
    return row((t.items||[]).map(i=>i.qty+'× '+esc(i.name)).join(', '), date, `−${fmt(t.amount)}`, 'text-red-500');
  }
  if (t.type==='adjustment'){
    return row(`⚖️ Ajustement${t.note?' · '+esc(t.note):''}`, date, `${t.amount>=0?'+':''}${fmt(t.amount)}`, t.amount<0?'text-red-500':'text-emerald-600');
  }
  const isPayer = t.payerId === forMemberId;
  const mine = (t.drinkers||[]).filter(d=>d.memberId===forMemberId);
  const label = isPayer ? 'Tournée offerte à ' + (t.drinkers||[]).length + ' pers.' : 'Tournée offerte par ' + esc(member(t.payerId)?.name || '—');
  return row(`🥂 ${label}`, `${date}${mine.length?' · '+mine.map(m=>esc(m.name)).join(', '):''}`, isPayer?'−'+fmt(t.amount):'offert', isPayer?'text-red-500':'text-emerald-600');
}
