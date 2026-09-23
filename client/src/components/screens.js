import { State } from '../state/store.js';

export function noDbScreen(){
  return `<div class="min-h-screen flex items-center justify-center p-8 text-center">
    <div>
      <div class="text-4xl mb-3">🍻</div>
      <h1 class="font-serif text-xl font-bold text-navy-900 mb-2">Popote</h1>
      <p class="text-gray-500 text-sm max-w-xs">Impossible de joindre le serveur de la popote. Vérifie que l'API est bien démarrée et accessible.</p>
    </div>
  </div>`;
}

export function noPopoteScreen(){
  const isSuper = State.actor?.type==='super';
  if (isSuper){
    const hasAny = State.popotes.length>0;
    return `<div class="px-6 pt-16 text-center">
      <div class="text-5xl mb-4">🎖️</div>
      <h2 class="font-serif text-xl font-bold text-navy-900 mb-2">Aucune popote sélectionnée</h2>
      <p class="text-gray-500 text-sm mb-6">Choisis une popote existante ou crée-en une nouvelle.</p>
      <div class="flex flex-col items-center gap-2">
        ${hasAny ? `<button data-action="open-choose-popote" class="bg-gray-100 text-navy-800 rounded-xl px-5 py-3 font-semibold">Voir toutes les popotes</button>` : ''}
        <button data-action="open-new-popote" class="bg-navy-800 text-white rounded-xl px-5 py-3 font-semibold">+ Créer une popote</button>
      </div>
    </div>`;
  }
  if (State.isAdmin && State.actor?.popoteId){
    return `<div class="px-6 pt-16 text-center">
      <div class="text-5xl mb-4">🎖️</div>
      <h2 class="font-serif text-xl font-bold text-navy-900 mb-2">Popote introuvable</h2>
      <p class="text-gray-500 text-sm">Ta popote n'existe plus. Contacte le super-admin.</p>
    </div>`;
  }
  return `<div class="px-6 pt-16 text-center">
    <div class="text-5xl mb-4">🍻</div>
    <h2 class="font-serif text-xl font-bold text-navy-900 mb-2">Bienvenue !</h2>
    <p class="text-gray-500 text-sm mb-6">Entre le code de ta popote pour y accéder — il reste mémorisé sur cet appareil.</p>
    <button data-action="open-enter-popote-code" class="bg-navy-800 text-white rounded-xl px-5 py-3 font-semibold">Entrer le code de la popote</button>
  </div>`;
}
