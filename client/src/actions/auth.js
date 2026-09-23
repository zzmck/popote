import { State } from '../state/store.js';
import { api } from '../services/api.js';
import { fetchState } from '../services/state.js';
import { toast } from '../utils/toast.js';
import { closeModal } from '../modals/modalCore.js';
import { setCurrentPopote } from '../services/popoteSession.js';
import { render } from '../render.js';

export async function onboardingCreatePopote(popoteName, mission, chefName, chefUsername, chefPassword){
  try {
    const r = await api('POST','/api/onboarding/popote', { popoteName, mission, chefName, chefUsername, chefPassword });
    sessionStorage.setItem('popote_admin_username', chefUsername);
    sessionStorage.setItem('popote_admin_password', chefPassword);
    sessionStorage.setItem('popote_admin', '1');
    sessionStorage.setItem('popote_actor', JSON.stringify(r.actor));
    State.isAdmin = true; State.actor = r.actor; setCurrentPopote(r.popote.id);
    closeModal(); toast('Popote créée — code à partager : ' + (r.popote.code||'—')); fetchState();
  } catch(e){}
}

export async function tryAdminLogin(username, password){
  try {
    const r = await api('POST', '/api/admin/login', { username, password });
    sessionStorage.setItem('popote_admin_username', username);
    sessionStorage.setItem('popote_admin_password', password);
    sessionStorage.setItem('popote_admin', '1');
    sessionStorage.setItem('popote_actor', JSON.stringify(r.actor));
    State.isAdmin = true; State.actor = r.actor;
    if (r.actor.popoteId) setCurrentPopote(r.actor.popoteId);
    closeModal(); fetchState();
  } catch(e){}
}
export function adminLogout(){
  sessionStorage.removeItem('popote_admin'); sessionStorage.removeItem('popote_admin_username');
  sessionStorage.removeItem('popote_admin_password'); sessionStorage.removeItem('popote_actor');
  State.isAdmin=false; State.actor=null; render();
}
