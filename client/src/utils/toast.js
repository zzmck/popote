export function toast(msg, kind){
  const el = document.createElement('div');
  el.className = 'toast px-4 py-2.5 rounded-full shadow-lg text-sm font-medium text-white ' + (kind==='err' ? 'bg-red-600' : kind==='warn' ? 'bg-gold-600' : 'bg-navy-800');
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(()=>el.remove(), 2700);
}
