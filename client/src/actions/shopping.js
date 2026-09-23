import { State } from '../state/store.js';
import { api } from '../services/api.js';
import { fetchState } from '../services/state.js';
import { toast } from '../utils/toast.js';
import { fmt } from '../utils/format.js';

export async function addManualShopping(name, note){
  await api('POST','/api/shopping', { popoteId: State.currentPopoteId, name, note: note||'' }, true); fetchState();
}
export async function toggleManualShopping(id, done){ await api('PATCH','/api/shopping/'+id, { done }, true); fetchState(); }
export async function deleteManualShopping(id){ await api('DELETE','/api/shopping/'+id, undefined, true); fetchState(); }
export async function runShoppingCheckout(items, amount){
  await api('POST','/api/shopping/checkout', { popoteId: State.currentPopoteId, items, amount }, true);
  toast('Courses enregistrées' + (amount ? ' (' + fmt(amount) + ' sortis de caisse)' : '')); fetchState();
}
