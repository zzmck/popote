import { State } from './state/store.js';
import { toast } from './utils/toast.js';
import { render } from './render.js';
import { closeModal } from './modals/modalCore.js';
import { setCurrentPopote, setCurrentMember, selectPopoteByCode, forgetPopoteCode } from './services/popoteSession.js';

import { modalAdminLogin, modalOnboardingPopote } from './modals/authModals.js';
import { modalNewPopote, modalChoosePopote, modalEnterPopoteCode } from './modals/popoteModals.js';
import { modalNewProduct, modalEditProduct, modalStockOps } from './modals/productModals.js';
import { modalNewMember, modalRecharge, modalAdjustBalance } from './modals/memberModals.js';
import { modalPayMethods, modalManualShopping, modalCashAdjustment } from './modals/settingsModals.js';
import { modalNewPopotier, modalResetPopotierPassword } from './modals/popotierModals.js';

import { tryAdminLogin, onboardingCreatePopote, adminLogout } from './actions/auth.js';
import { createPopote, togglePopote, deletePopoteCascade } from './actions/popotes.js';
import {
  createProduct, updateProduct, deleteProduct, validateConsumption,
  purchaseProduct, adjustStockManual, transferToFridge, openBottle, closeBottle,
} from './actions/products.js';
import { createMember, deleteMember, rechargeMember, validatePayment, adjustMemberBalance } from './actions/members.js';
import { addCashAdjustment } from './actions/cash.js';
import { addManualShopping, toggleManualShopping, deleteManualShopping, runShoppingCheckout } from './actions/shopping.js';
import { setPayMethods } from './actions/settings.js';
import { createPopotier, togglePopotier, resetPopotierPassword, deletePopotier } from './actions/popotiers.js';

document.addEventListener('click', (e)=>{
  const back = e.target.closest('[data-action="modal-backdrop"]');
  if (back && e.target === back) { closeModal(); return; }

  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const a = btn.dataset.action;

  if (a==='set-view'){ State.view = btn.dataset.view; render(); }
  else if (a==='select-popote'){ setCurrentPopote(btn.dataset.id); render(); }
  else if (a==='open-choose-popote'){ modalChoosePopote(); }
  else if (a==='choose-popote'){ setCurrentPopote(btn.dataset.id); closeModal(); render(); }
  else if (a==='open-enter-popote-code'){ modalEnterPopoteCode(); }
  else if (a==='forget-popote-code'){ forgetPopoteCode(); }
  else if (a==='open-admin-login'){ modalAdminLogin(); }
  else if (a==='open-onboarding-popote'){ modalOnboardingPopote(); }
  else if (a==='admin-logout'){ adminLogout(); }
  else if (a==='open-new-popote'){ modalNewPopote(); }
  else if (a==='toggle-popote'){ togglePopote(btn.dataset.id, btn.dataset.active==='1'); }
  else if (a==='delete-popote'){ if (confirm('Supprimer cette popote et toutes ses données ?')) deletePopoteCascade(btn.dataset.id); }
  else if (a==='open-new-product'){ modalNewProduct(); }
  else if (a==='open-edit-product'){ modalEditProduct(btn.dataset.id); }
  else if (a==='delete-product'){ if (confirm('Supprimer ce produit ?')){ deleteProduct(btn.dataset.id); closeModal(); } }
  else if (a==='open-restock' || a==='open-stock-ops'){ modalStockOps(btn.dataset.id); }
  else if (a==='open-bottle'){ openBottle(btn.dataset.id); }
  else if (a==='close-bottle'){ if (confirm('Déclarer cette bouteille terminée ?')) closeBottle(btn.dataset.id); }
  else if (a==='open-new-member'){ modalNewMember(); }
  else if (a==='delete-member'){ if (confirm('Supprimer cette carte et son historique ?')) deleteMember(btn.dataset.id); }
  else if (a==='open-recharge'){ modalRecharge(btn.dataset.id); }
  else if (a==='open-adjust-balance'){ modalAdjustBalance(btn.dataset.id); }
  else if (a==='open-pay-methods'){ modalPayMethods(); }
  else if (a==='remove-pm'){ const list=[...State.payMethods]; list.splice(+btn.dataset.idx,1); setPayMethods(list); }
  else if (a==='open-manual-shopping'){ modalManualShopping(); }
  else if (a==='toggle-shopping'){ /* handled in change */ }
  else if (a==='delete-shopping'){ deleteManualShopping(btn.dataset.id); }
  else if (a==='open-cash-adjustment'){ modalCashAdjustment(); }
  else if (a==='validate-payment'){ validatePayment(btn.dataset.id); }
  else if (a==='open-new-popotier'){ modalNewPopotier(); }
  else if (a==='open-reset-popotier-password'){ modalResetPopotierPassword(btn.dataset.id); }
  else if (a==='toggle-popotier'){ togglePopotier(btn.dataset.id, btn.dataset.active==='1'); }
  else if (a==='delete-popotier'){ if (confirm('Supprimer ce popotier ?')) deletePopotier(btn.dataset.id); }
  else if (a==='admin-sub'){ State.adminSub = btn.dataset.sub; render(); }
  else if (a==='cart-inc'){
    if (!State.isAdmin){ toast('Connecte-toi pour ajouter une consommation','err'); return; }
    const max = +btn.dataset.max; const id = btn.dataset.id;
    const cur = State.cart[id]||0;
    if (cur>=max){ toast('Stock insuffisant','warn'); return; }
    State.cart[id] = cur+1; render();
  }
  else if (a==='cart-dec'){
    if (!State.isAdmin) return;
    const id = btn.dataset.id; const cur = State.cart[id]||0;
    State.cart[id] = Math.max(0, cur-1); if (!State.cart[id]) delete State.cart[id];
    render();
  }
  else if (a==='confirm-consumption'){
    if (!State.isAdmin){ toast('Connecte-toi pour valider une consommation','err'); return; }
    const sel = document.getElementById('consumer-select');
    const mid = sel ? sel.value : '';
    if (!mid){ toast('Choisis qui boit','err'); return; }
    setCurrentMember(mid);
    validateConsumption(mid);
  }
  else if (a==='quick-amount'){
    const target = document.getElementById(btn.dataset.target);
    if (target) target.value = btn.dataset.val;
  }
});

document.addEventListener('change', (e)=>{
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const a = el.dataset.action;
  if (a==='select-me'){ setCurrentMember(el.value); render(); }
  else if (a==='toggle-shopping'){ toggleManualShopping(el.dataset.id, el.checked); }
});

document.addEventListener('submit', (e)=>{
  const form = e.target.closest('[data-action]');
  if (!form) return;
  e.preventDefault();
  const a = form.dataset.action;
  const fd = new FormData(form);

  if (a==='submit-admin-login'){ tryAdminLogin(fd.get('username'), fd.get('password')); }
  else if (a==='submit-onboarding-popote'){ onboardingCreatePopote(fd.get('popoteName'), fd.get('mission'), fd.get('chefName'), fd.get('chefUsername'), fd.get('chefPassword')); }
  else if (a==='submit-popote-code'){ selectPopoteByCode(fd.get('code')); }
  else if (a==='submit-new-popote'){ createPopote(fd.get('name'), fd.get('mission')); closeModal(); }
  else if (a==='submit-new-product'){
    createProduct({
      name: fd.get('name'), category: fd.get('category'),
      price: parseFloat(fd.get('price'))||0, minStock: parseInt(fd.get('minStock'))||0,
      stockReserve: parseInt(fd.get('stockReserve'))||0, fridgeQty: parseInt(fd.get('fridgeQty'))||0,
      packSize: parseInt(fd.get('packSize'))||1, packCost: parseFloat(fd.get('packCost'))||0,
    });
    closeModal();
  }
  else if (a==='submit-edit-product'){
    updateProduct(form.dataset.id, {
      name: fd.get('name'), category: fd.get('category'),
      price: parseFloat(fd.get('price'))||0, minStock: parseInt(fd.get('minStock'))||0,
      packSize: parseInt(fd.get('packSize'))||1, unitCost: parseFloat(fd.get('unitCost'))||0,
      stockReserve: parseInt(fd.get('stockReserve'))||0, fridgeQty: parseInt(fd.get('fridgeQty'))||0,
    });
    closeModal();
  }
  else if (a==='submit-purchase'){
    const packs = parseInt(fd.get('packs'))||0, packSize = parseInt(fd.get('packSize'))||1, packCost = parseFloat(fd.get('packCost'))||0;
    purchaseProduct(form.dataset.id, packs, packSize, packCost, '');
    closeModal();
  }
  else if (a==='submit-transfer'){
    const qty = parseInt(fd.get('qty'))||0;
    if (qty>0) transferToFridge(form.dataset.id, qty);
    closeModal();
  }
  else if (a==='submit-adjust-stock'){
    const delta = parseInt(fd.get('delta'))||0;
    if (delta!==0) adjustStockManual(form.dataset.id, delta);
    closeModal();
  }
  else if (a==='submit-new-member'){ createMember(fd.get('name'), parseFloat(fd.get('initial'))||0, fd.get('paymentMethod'), fd.get('pending')==='on'); closeModal(); }
  else if (a==='submit-recharge'){ rechargeMember(form.dataset.id, parseFloat(fd.get('amount'))||0, fd.get('paymentMethod'), fd.get('pending')==='on'); closeModal(); }
  else if (a==='submit-adjust-balance'){
    const amount = parseFloat(fd.get('amount'))||0;
    if (amount!==0) adjustMemberBalance(form.dataset.id, amount, fd.get('note'));
    closeModal();
  }
  else if (a==='submit-add-pm'){ const m = fd.get('method').trim(); if (m) setPayMethods([...State.payMethods, m]); form.reset(); modalPayMethods(); }
  else if (a==='submit-manual-shopping'){ addManualShopping(fd.get('name'), fd.get('note')); closeModal(); }
  else if (a==='submit-cash-adjustment'){
    const amount = parseFloat(fd.get('amount'))||0;
    if (amount!==0) addCashAdjustment(amount, fd.get('reason'));
    closeModal();
  }
  else if (a==='submit-shopping-run'){
    const items = [];
    for (const [key, val] of fd.entries()){
      if (!key.startsWith('qty_')) continue;
      const qty = parseInt(val)||0;
      if (qty>0) items.push({ productId: key.slice(4), qty });
    }
    const amount = parseFloat(fd.get('amount'))||0;
    if (!items.length && !amount){ toast('Renseigne au moins une quantité ou un montant','err'); return; }
    runShoppingCheckout(items, amount);
  }
  else if (a==='submit-new-popotier'){ createPopotier(fd.get('name'), fd.get('username'), fd.get('password'), fd.get('role'), fd.get('popoteId')); closeModal(); }
  else if (a==='submit-reset-popotier-password'){ resetPopotierPassword(form.dataset.id, fd.get('password')); closeModal(); }
});
