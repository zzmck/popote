import { State } from '../state/store.js';
import { toast } from '../utils/toast.js';

const API = '';

function adminHeaders(){
  const username = sessionStorage.getItem('popote_admin_username');
  const password = sessionStorage.getItem('popote_admin_password');
  return (username && password) ? { 'X-Admin-Username': username, 'X-Admin-Password': password } : {};
}

export async function api(method, path, body, admin){
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(State.popoteCode ? { 'X-Popote-Code': State.popoteCode } : {}),
      ...(admin ? adminHeaders() : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok){
    let msg = 'Erreur serveur';
    try { msg = (await res.json()).error || msg; } catch(_){}
    toast(msg, 'err');
    throw new Error(msg);
  }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}
