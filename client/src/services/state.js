import { State } from '../state/store.js';
import { api } from './api.js';
import { ensureCurrentPopote } from './popoteSession.js';
import { render } from '../render.js';

export function applyState(s){
  State.popotes = s.popotes; State.products = s.products; State.members = s.members;
  State.transactions = s.transactions; State.shopping = s.shopping;
  State.popotiers = s.popotiers || []; State.purchases = s.purchases || []; State.cashAdjustments = s.cashAdjustments || [];
  if (Array.isArray(s.paymentMethods) && s.paymentMethods.length) State.payMethods = s.paymentMethods;
  State.dbAvailable = true; State.ready = true;
  ensureCurrentPopote();
  render();
}

export async function fetchState(){
  try {
    const s = await api('GET', '/api/state', undefined, true);
    applyState(s);
  } catch(e){
    State.dbAvailable = false;
    render();
  }
}

let ws;
export function connectWS(){
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}/ws`);
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'refresh') fetchState();
    } catch(e){}
  };
  ws.onclose = () => { setTimeout(connectWS, 2000); };
  ws.onerror = () => { ws.close(); };
}

export async function boot(){
  await fetchState();
  connectWS();
}
