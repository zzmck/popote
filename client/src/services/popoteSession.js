import { State } from '../state/store.js';
import { api } from './api.js';
import { toast } from '../utils/toast.js';
import { closeModal } from '../modals/modalCore.js';
import { applyState, fetchState } from './state.js';

function ensureCurrentPopote(){
  if (State.currentPopoteId && State.popotes.some(p=>p.id===State.currentPopoteId)) return;
  if (State.actor?.popoteId && State.popotes.some(p=>p.id===State.actor.popoteId)){ setCurrentPopote(State.actor.popoteId); return; }
  if (State.actor?.type==='super'){
    const actives = State.popotes.filter(p=>p.active);
    if (actives.length) setCurrentPopote(actives[0].id);
    return;
  }
  if (State.popoteCode){
    const match = State.popotes.find(p=>p.code && p.code.toUpperCase()===State.popoteCode.toUpperCase());
    if (match){ setCurrentPopote(match.id); return; }
  }
}
function setCurrentPopote(id){ State.currentPopoteId = id; localStorage.setItem('popote_current', id||''); }
function setCurrentMember(id){ State.currentMemberId = id; localStorage.setItem('popote_member', id||''); }
async function selectPopoteByCode(code){
  const c = (code||'').trim().toUpperCase();
  if (!c) return;
  const prevCode = State.popoteCode;
  State.popoteCode = c;
  try {
    const s = await api('GET', '/api/state', undefined, true);
    const match = (s.popotes||[])[0];
    if (!match){ State.popoteCode = prevCode; toast('Code popote inconnu','err'); return; }
    localStorage.setItem('popote_code', c);
    setCurrentPopote(match.id);
    applyState(s);
    closeModal();
  } catch(e){ State.popoteCode = prevCode; }
}
function forgetPopoteCode(){
  State.popoteCode=''; localStorage.removeItem('popote_code');
  setCurrentPopote(null);
  closeModal(); fetchState();
}

export { ensureCurrentPopote, setCurrentPopote, setCurrentMember, selectPopoteByCode, forgetPopoteCode };
