import { State, FRIDGE_CATS, BOTTLE_CATS } from '../state/store.js';
import { api } from '../services/api.js';
import { fetchState } from '../services/state.js';
import { toast } from '../utils/toast.js';
import { fmt } from '../utils/format.js';
import { product } from '../domain/selectors.js';

export async function createProduct(data){
  await api('POST','/api/products', { popoteId: State.currentPopoteId, ...data }, true);
  toast('Produit ajouté'); fetchState();
}
export async function updateProduct(id, patch){ await api('PATCH','/api/products/'+id, patch, true); fetchState(); }
export async function deleteProduct(id){ await api('DELETE','/api/products/'+id, undefined, true); toast('Produit supprimé'); fetchState(); }

export async function validateConsumption(memberId){
  const items = Object.entries(State.cart).filter(([,q])=>q>0).map(([pid,q])=>{
    const p = product(pid); return { productId:pid, name:p.name, price:p.price, qty:q };
  });
  if (!items.length) { toast('Panier vide','err'); return; }
  const amount = items.reduce((s,i)=>s+i.price*i.qty,0);
  for (const it of items){
    const p = product(it.productId);
    const fromFridge = FRIDGE_CATS.includes(p?.category);
    if (BOTTLE_CATS.includes(p?.category)){
      continue;
    }
    if (fromFridge){
      await api('POST', '/api/products/'+it.productId+'/adjust', { fridgeDelta: -it.qty }, true);
    } else {
      const fromReserve = Math.min(it.qty, p?.stockReserve||0);
      const fromFridgeQty = it.qty - fromReserve;
      const patch = {};
      if (fromReserve) patch.stockDelta = -fromReserve;
      if (fromFridgeQty) patch.fridgeDelta = -fromFridgeQty;
      await api('POST', '/api/products/'+it.productId+'/adjust', patch, true);
    }
  }
  await api('POST','/api/transactions', { popoteId: State.currentPopoteId, type:'consumption', memberId, items, amount }, true);
  State.cart = {};
  toast('Consommation enregistrée (' + fmt(amount) + ')'); fetchState();
}

export async function purchaseProduct(productId, packs, packSize, packCost, note){
  try {
    await api('POST', '/api/products/'+productId+'/purchase', { packs, packSize, packCost, note }, true);
    toast('Achat enregistré (' + fmt(packs*packCost) + ' sortis de caisse)'); fetchState();
  } catch(e){}
}
export async function adjustStockManual(productId, stockDelta){
  await api('POST', '/api/products/'+productId+'/adjust', { stockDelta }, true);
  toast('Stock ajusté'); fetchState();
}
export async function transferToFridge(productId, qty){
  try { await api('POST', '/api/products/'+productId+'/transfer', { qty }, true); toast(qty + ' transféré(s) au frigo'); fetchState(); }
  catch(e){}
}
export async function openBottle(productId){
  try { await api('POST', '/api/products/'+productId+'/open-bottle', undefined, true); toast('Nouvelle bouteille ouverte'); fetchState(); }
  catch(e){}
}
export async function closeBottle(productId){
  await api('POST', '/api/products/'+productId+'/close-bottle', undefined, true);
  toast('Bouteille déclarée terminée'); fetchState();
}
