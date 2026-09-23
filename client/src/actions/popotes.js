import { State } from '../state/store.js';
import { api } from '../services/api.js';
import { fetchState } from '../services/state.js';
import { toast } from '../utils/toast.js';
import { setCurrentPopote } from '../services/popoteSession.js';

export async function createPopote(name, mission){
  await api('POST','/api/popotes', { name, mission: mission||'' }, true);
  toast('Popote créée'); fetchState();
}
export async function togglePopote(id, active){
  await api('PATCH','/api/popotes/'+id, { active }, true); fetchState();
}
export async function deletePopoteCascade(id){
  await api('DELETE','/api/popotes/'+id, undefined, true);
  if (State.currentPopoteId===id) setCurrentPopote(null);
  toast('Popote supprimée'); fetchState();
}
