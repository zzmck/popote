import { State, CATS, FRIDGE_CATS, BOTTLE_CATS } from '../state/store.js';
import { fmt, esc } from '../utils/format.js';
import { popoteProducts, popoteMembers, product } from '../domain/selectors.js';

export function viewMenu(){
  const prods = popoteProducts();
  const cats = Object.keys(CATS).filter(c=>prods.some(p=>p.category===c));
  const cartCount = Object.values(State.cart).reduce((a,b)=>a+b,0);
  const cartTotal = Object.entries(State.cart).reduce((s,[pid,q])=>{ const p=product(pid); return s+(p?p.price*q:0); },0);
  const mems = popoteMembers();

  if (!prods.length) return `<div class="px-6 pt-14 text-center text-gray-400">
      <div class="text-4xl mb-3">🧊</div>
      <p class="text-sm">Aucun produit dans cette popote pour l'instant.</p>
      ${State.isAdmin ? `<button data-action="open-new-product" class="mt-4 bg-navy-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold">+ Ajouter un produit</button>` : ''}
    </div>`;

  return `
  <div class="px-4 pt-4 space-y-6">
    ${!State.isAdmin ? `<div class="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2 text-center">👀 Visualisation seule — connecte-toi pour enregistrer une consommation.</div>` : ''}
    ${cats.map(c=>`
      <div>
        <div class="flex items-center gap-2 mb-2 px-1">
          <span class="text-lg">${CATS[c].emoji}</span>
          <h3 class="font-semibold text-navy-900 text-sm tracking-wide uppercase">${CATS[c].label}</h3>
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${prods.filter(p=>p.category===c).map(p=>{
            const qty = State.cart[p.id]||0;
            const fromFridge = FRIDGE_CATS.includes(p.category);
            const isBottle = BOTTLE_CATS.includes(p.category);
            const avail = fromFridge ? (p.fridgeQty||0) : ((p.stockReserve||0) + (p.fridgeQty||0));
            const out = isBottle ? !p.bottleOpen : avail <= 0;
            return `
            <div class="card rounded-2xl p-3.5 shadow-sm ${out?'opacity-50':''}">
              <div class="flex justify-between items-start mb-2">
                <div class="min-w-0 pr-2">
                  <div class="font-semibold text-sm text-navy-900 truncate">${esc(p.name)}</div>
                  <div class="text-xs text-gray-400">${fmt(p.price)}${isBottle?'/verre':''} · ${isBottle ? (p.bottleOpen?'bouteille ouverte':(p.stockReserve>0?'bouteille à ouvrir':'rupture stock')) : (fromFridge ? avail+' au frigo' : avail+' en stock')}</div>
                </div>
              </div>
              ${!State.isAdmin ? '' : isBottle ? (
                p.bottleOpen ? `
                <div class="flex items-center justify-between">
                  <button data-action="cart-dec" data-id="${p.id}" class="icon-btn w-10 h-10 rounded-full bg-gray-100 text-navy-800 font-bold text-lg active:bg-gray-200">−</button>
                  <span class="font-bold qty-badge">${qty}</span>
                  <button data-action="cart-inc" data-id="${p.id}" data-max="999" class="icon-btn w-10 h-10 rounded-full bg-navy-800 text-white font-bold text-lg active:bg-navy-900">+</button>
                </div>
                <button data-action="close-bottle" data-id="${p.id}" class="mt-1.5 w-full text-[11px] text-gray-400 underline">Bouteille terminée ?</button>` :
                p.stockReserve>0 ? `<button data-action="open-bottle" data-id="${p.id}" class="w-full text-xs font-semibold text-white bg-navy-800 rounded-lg text-center py-1.5 active:bg-navy-900">🍾 Nouvelle bouteille</button>` :
                `<div class="text-xs font-semibold text-red-500 bg-red-50 rounded-lg text-center py-1.5">Rupture stock</div>`
              ) : out ? `<div class="text-xs font-semibold text-red-500 bg-red-50 rounded-lg text-center py-1.5">${fromFridge?'Rupture frigo':'Rupture stock'}</div>` :
              `<div class="flex items-center justify-between">
                <button data-action="cart-dec" data-id="${p.id}" class="icon-btn w-10 h-10 rounded-full bg-gray-100 text-navy-800 font-bold text-lg active:bg-gray-200">−</button>
                <span class="font-bold qty-badge">${qty}</span>
                <button data-action="cart-inc" data-id="${p.id}" data-max="${avail}" class="icon-btn w-10 h-10 rounded-full bg-navy-800 text-white font-bold text-lg active:bg-navy-900">+</button>
              </div>`}
            </div>`;
          }).join('')}
        </div>
      </div>`).join('')}
  </div>

  ${State.isAdmin && cartCount>0 ? `
  <div class="fixed left-0 right-0 z-20 px-4" style="bottom: calc(4.75rem + env(safe-area-inset-bottom,0px));">
    <div class="max-w-3xl mx-auto card bg-navy-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center flex-wrap justify-between gap-2.5">
      <div class="shrink-0">
        <div class="text-xs text-navy-200">${cartCount} article${cartCount>1?'s':''}</div>
        <div class="font-bold">${fmt(cartTotal)}</div>
      </div>
      <div class="flex items-center gap-2 flex-1 min-w-[13rem]">
        <select id="consumer-select" class="rounded-xl px-2 py-2.5 text-navy-900 flex-1 min-w-0">
          <option value="">Qui boit ?</option>
          ${mems.map(m=>`<option value="${m.id}" ${State.currentMemberId===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}
        </select>
        <button data-action="confirm-consumption" class="shrink-0 bg-gold-400 text-navy-900 font-bold px-4 py-2.5 rounded-xl active:bg-gold-300">Valider</button>
      </div>
    </div>
  </div>` : ''}
  `;
}
