import { State } from '../../state/store.js';
import { adminPopotes } from './adminPopotes.js';
import { adminProducts } from './adminProducts.js';
import { adminMembers } from './adminMembers.js';
import { adminCaisse } from './adminCaisse.js';
import { adminShopping } from './adminShopping.js';
import { adminPopotiers } from './adminPopotiers.js';
import { adminSettings } from './adminSettings.js';

export function viewAdmin(){
  if (!State.isAdmin) return `<div class="px-6 pt-14 text-center text-gray-400"><p class="text-sm">Accès réservé à l'administrateur.</p></div>`;
  const sub = State.adminSub || 'popotes';
  const subtabs = [
    {id:'popotes', label:'Popotes'},
    {id:'produits', label:'Stock'},
    {id:'membres', label:'Cartes'},
    {id:'caisse', label:'Caisse'},
    {id:'courses', label:'Courses'},
    {id:'popotiers', label:'Popotiers'},
    {id:'reglages', label:'Réglages'},
  ].filter(t => t.id!=='popotiers' || State.actor?.type==='super' || State.actor?.type==='chef');
  return `
  <div class="px-4 pt-4">
    <div class="flex gap-2 overflow-x-auto tab-scroll mb-4">
      ${subtabs.map(t=>`<button data-action="admin-sub" data-sub="${t.id}" class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${sub===t.id?'bg-navy-800 text-white border-navy-800':'border-gray-200 text-gray-600'}">${t.label}</button>`).join('')}
    </div>
    ${sub==='popotes' ? adminPopotes() : ''}
    ${sub==='produits' ? adminProducts() : ''}
    ${sub==='membres' ? adminMembers() : ''}
    ${sub==='caisse' ? adminCaisse() : ''}
    ${sub==='courses' ? adminShopping() : ''}
    ${sub==='popotiers' ? adminPopotiers() : ''}
    ${sub==='reglages' ? adminSettings() : ''}
  </div>`;
}
