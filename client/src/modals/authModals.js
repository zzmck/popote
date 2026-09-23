import { formModal } from '../ui/formModal.js';
import { field, textInput } from '../ui/fields.js';

export function modalAdminLogin(){
  formModal({
    title: 'Connexion',
    subtitle: 'Entre ton identifiant et ton mot de passe popotier',
    action: 'submit-admin-login',
    fields: [
      textInput({ name: 'username', required: true, autofocus: true, placeholder: 'Identifiant' }),
      textInput({ name: 'password', type: 'password', required: true, placeholder: 'Mot de passe' }),
    ].join(''),
    submitLabel: 'Entrer',
    footer: `<button data-action="open-onboarding-popote" class="w-full text-center text-xs text-gray-400 hover:text-navy-700 mt-4">Nouvelle mission ? Crée ta popote sans compte existant →</button>`,
  });
}

export function modalOnboardingPopote(){
  formModal({
    title: 'Créer une nouvelle popote',
    subtitle: "Pas besoin d'un compte existant : tu deviens automatiquement chef popotier de cette nouvelle popote.",
    action: 'submit-onboarding-popote',
    fields: [
      field('Nom de la popote', textInput({ name: 'popoteName', required: true, autofocus: true, placeholder: 'Ex : Popote Barkhane 4' })),
      field('Mission / lieu (optionnel)', textInput({ name: 'mission', placeholder: 'Ex : Djibouti 2026' })),
      field('Ton nom', textInput({ name: 'chefName', required: true, placeholder: 'Ex : Adj Dupont' })),
      field('Identifiant de connexion', textInput({ name: 'chefUsername', required: true, placeholder: 'Ex : adj.dupont' })),
      field('Mot de passe', textInput({ name: 'chefPassword', type: 'password', required: true, attrs: 'minlength="4"', placeholder: '4 caractères minimum' })),
    ].join(''),
    submitLabel: 'Créer ma popote',
  });
}
