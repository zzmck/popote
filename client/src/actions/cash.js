import { State } from '../state/store.js';
import { api } from '../services/api.js';
import { fetchState } from '../services/state.js';
import { toast } from '../utils/toast.js';
import { fmt } from '../utils/format.js';

export async function addCashAdjustment(amount, reason){
  await api('POST', '/api/cash/adjustments', { popoteId: State.currentPopoteId, amount, reason }, true);
  toast((amount>=0?'+':'') + fmt(amount) + ' ajusté en caisse'); fetchState();
}
