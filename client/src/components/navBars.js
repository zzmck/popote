import { State } from '../state/store.js';
import { esc } from '../utils/format.js';
import { curPopote } from '../domain/selectors.js';

export function topBar(){
  const p = curPopote();
  const isSuper = State.actor?.type==='super';
  const canSwitch = isSuper || !State.isAdmin;
  const switchAction = isSuper ? 'open-choose-popote' : 'open-enter-popote-code';
  const headerInner = `
    <span class="text-2xl">🍻</span>
    <div class="min-w-0">
      <div class="font-serif font-bold text-navy-900 leading-tight text-lg truncate">${p ? esc(p.name) : 'Popote'}</div>
      <div class="text-[11px] text-gray-400 -mt-0.5 truncate">${p ? esc(p.mission||(canSwitch?'Toucher pour changer':'')) : 'Aucune popote sélectionnée'}${canSwitch?' ▾':''}</div>
    </div>`;
  return `
  <div class="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100" style="padding-top:env(safe-area-inset-top,0px)">
    <div class="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
      ${canSwitch
        ? `<button data-action="${switchAction}" class="flex items-center gap-2 min-w-0 text-left">${headerInner}</button>`
        : `<div class="flex items-center gap-2 min-w-0">${headerInner}</div>`}
      <div class="flex items-center gap-2 shrink-0">
        ${State.isAdmin
          ? `<span class="text-[11px] ${State.actor?.type==='super'?'bg-gold-100 text-gold-700':'bg-navy-50 text-navy-700'} font-semibold px-2.5 py-1 rounded-full">${esc(State.actor?.name||'Connecté')}</span>
             <button data-action="admin-logout" class="text-xs text-gray-400 hover:text-gray-600">quitter</button>`
          : `<button data-action="open-admin-login" class="text-xs text-gray-400 hover:text-navy-700 border border-gray-200 rounded-full px-3 py-1.5">Connexion</button>`}
      </div>
    </div>
    ${isSuper && State.popotes.length>1 ? `
    <div class="px-4 pb-3 flex gap-2 overflow-x-auto tab-scroll">
      ${State.popotes.map(x=>`
        <button data-action="select-popote" data-id="${x.id}" class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${x.id===State.currentPopoteId ? 'bg-navy-800 text-white border-navy-800' : 'border-gray-200 text-gray-600'} ${!x.active?'opacity-40':''}">
          ${esc(x.name)}${!x.active?' · inactive':''}
        </button>`).join('')}
    </div>` : ''}
  </div>`;
}

export function bottomNav(){
  const tabs = [
    {id:'menu', label:'Consos', icon:'🍹'},
    {id:'compte', label:'Mon compte', icon:'💳'},
    {id:'stats', label:'Stats', icon:'📊'},
  ];
  if (State.isAdmin) tabs.push({id:'admin', label:'Gestion', icon:'⚙️'});
  return `
  <div class="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100" style="padding-bottom:env(safe-area-inset-bottom,0px)">
    <div class="max-w-3xl mx-auto grid grid-cols-${tabs.length} text-center">
      ${tabs.map(t=>`
        <button data-action="set-view" data-view="${t.id}" class="py-2.5 flex flex-col items-center gap-0.5 ${State.view===t.id ? 'text-navy-800' : 'text-gray-400'}">
          <span class="text-lg">${t.icon}</span>
          <span class="text-[10px] font-semibold">${t.label}</span>
        </button>`).join('')}
    </div>
  </div>`;
}
