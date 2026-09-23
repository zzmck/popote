import { api } from '../services/api.js';
import { fetchState } from '../services/state.js';
import { toast } from '../utils/toast.js';

export async function createPopotier(name, username, password, role, popoteId){
  try { await api('POST','/api/popotiers', { name, username, password, role, popoteId: popoteId || null }, true); toast('Popotier créé'); fetchState(); }
  catch(e){}
}
export async function togglePopotier(id, active){ await api('PATCH','/api/popotiers/'+id, { active }, true); fetchState(); }
export async function resetPopotierPassword(id, password){
  try { await api('PATCH','/api/popotiers/'+id, { password }, true); toast('Mot de passe mis à jour'); fetchState(); }
  catch(e){}
}
export async function deletePopotier(id){ await api('DELETE','/api/popotiers/'+id, undefined, true); toast('Popotier supprimé'); fetchState(); }
