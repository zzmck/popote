export function fmt(n){ return (Math.round((n+Number.EPSILON)*100)/100).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' €'; }
export function fmtN(n){ return (Math.round((n+Number.EPSILON)*100)/100).toString().replace('.',','); }
export function esc(s){ const d=document.createElement('div'); d.textContent = (s??''); return d.innerHTML; }
export function uidShort(){ return Math.random().toString(36).slice(2,9); }
