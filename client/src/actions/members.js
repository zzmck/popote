import { State } from '../state/store.js';
import { api } from '../services/api.js';
import { fetchState } from '../services/state.js';
import { toast } from '../utils/toast.js';
import { fmt } from '../utils/format.js';

export async function createMember(name, initial, paymentMethod, pending){
  const m = await api('POST','/api/members', { popoteId: State.currentPopoteId, name }, true);
  if (initial > 0){
    await api('POST','/api/transactions', {
      popoteId: State.currentPopoteId, type:'recharge', memberId: m.id, amount: initial,
      paymentMethod: paymentMethod||'Espèces', note:'Création de carte', pending: !!pending
    }, true);
  }
  toast('Carte créée pour ' + name); fetchState();
}
export async function deleteMember(id){
  await api('DELETE','/api/members/'+id, undefined, true);
  toast('Membre supprimé'); fetchState();
}
export async function rechargeMember(memberId, amount, paymentMethod, pending){
  await api('POST','/api/transactions', {
    popoteId: State.currentPopoteId, type:'recharge', memberId, amount, paymentMethod, note:'Recharge carte', pending: !!pending
  }, true);
  toast('Carte rechargée (+' + fmt(amount) + ')'); fetchState();
}
export async function validatePayment(id){
  await api('POST', '/api/transactions/'+id+'/validate-payment', undefined, true);
  toast('Paiement validé'); fetchState();
}
export async function adjustMemberBalance(memberId, amount, note){
  await api('POST','/api/transactions', {
    popoteId: State.currentPopoteId, type:'adjustment', memberId, amount, note: note || 'Ajustement manuel du solde'
  }, true);
  toast('Solde ajusté (' + (amount>=0?'+':'') + fmt(amount) + ')'); fetchState();
}
