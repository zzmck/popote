export const State = {
  ready:false, dbAvailable:true,
  popotes: [], products: [], members: [], transactions: [], shopping: [],
  popotiers: [], purchases: [], cashAdjustments: [],
  actor: JSON.parse(sessionStorage.getItem('popote_actor') || 'null'),
  payMethods: ['Espèces','Virement','Carte bancaire'],
  currentPopoteId: localStorage.getItem('popote_current') || null,
  currentMemberId: localStorage.getItem('popote_member') || null,
  popoteCode: localStorage.getItem('popote_code') || '',
  isAdmin: sessionStorage.getItem('popote_admin') === '1',
  view: 'menu',
  cart: {},
};

export const CATS = {
  biere: { label:'Bières', emoji:'🍺' },
  alcool: { label:'Alcools', emoji:'🥃' },
  soft: { label:'Softs', emoji:'🥤' },
  chips: { label:'Chips & apéro', emoji:'🥨' },
  friandise: { label:'Friandises', emoji:'🍬' },
  autre: { label:'Autre', emoji:'📦' },
};
export const FRIDGE_CATS = ['biere', 'soft'];
export const BOTTLE_CATS = ['alcool'];
