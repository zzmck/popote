import { State } from '../state/store.js';

export function curPopote(){ return State.popotes.find(p=>p.id===State.currentPopoteId) || null; }
export function popoteProducts(){ return State.products.filter(p=>p.popoteId===State.currentPopoteId); }
export function popoteMembers(){ return State.members.filter(m=>m.popoteId===State.currentPopoteId); }
export function popoteTx(){ return State.transactions.filter(t=>t.popoteId===State.currentPopoteId); }
export function member(id){ return State.members.find(m=>m.id===id); }
export function product(id){ return State.products.find(p=>p.id===id); }

export function balance(memberId){
  let bal = 0;
  for (const t of State.transactions){
    if (t.type==='recharge' && t.memberId===memberId) bal += t.amount;
    if (t.type==='consumption' && t.memberId===memberId) bal -= t.amount;
    if (t.type==='tournee' && t.payerId===memberId) bal -= t.amount;
    if (t.type==='adjustment' && t.memberId===memberId) bal += t.amount;
  }
  return bal;
}

export function financeSummary(){
  const tx = popoteTx();
  const purchases = State.purchases.filter(p=>p.popoteId===State.currentPopoteId);
  const adjustments = State.cashAdjustments.filter(a=>a.popoteId===State.currentPopoteId);
  const recharges = tx.filter(t=>t.type==='recharge');
  const totalPercu = recharges.filter(t=>!t.pending).reduce((s,t)=>s+t.amount,0);
  const totalDu = recharges.filter(t=>t.pending).reduce((s,t)=>s+t.amount,0);
  const pendingRecharges = recharges.filter(t=>t.pending).sort((a,b)=>b.timestamp-a.timestamp);
  const sortiesAchats = purchases.reduce((s,p)=>s+p.totalCost,0);
  const totalAjustements = adjustments.reduce((s,a)=>s+a.amount,0);
  const fondDeCaisse = totalPercu - sortiesAchats + totalAjustements;

  const prods = popoteProducts();
  const valeurReserveCout = prods.reduce((s,p)=>s+(p.stockReserve||0)*(p.unitCost||0),0);
  const valeurFrigoCout = prods.reduce((s,p)=>s+(p.fridgeQty||0)*(p.unitCost||0),0);
  const valeurFrigoVente = prods.reduce((s,p)=>s+(p.fridgeQty||0)*(p.price||0),0);
  const margeLatenteFrigo = valeurFrigoVente - valeurFrigoCout;

  return { totalPercu, totalDu, pendingRecharges, sortiesAchats, totalAjustements, fondDeCaisse,
    valeurReserveCout, valeurFrigoCout, valeurFrigoVente, margeLatenteFrigo,
    purchases, adjustments };
}
