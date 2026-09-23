import { State } from '../state/store.js';
import { esc } from '../utils/format.js';
import { formModal } from '../ui/formModal.js';
import { field, textInput, selectInput } from '../ui/fields.js';

export function modalNewPopotier(){
  const isSuper = State.actor?.type === 'super';
  formModal({
    title: 'Nouveau popotier',
    action: 'submit-new-popotier',
    fields: [
      field('Nom', textInput({ name: 'name', required: true, placeholder: 'Ex : Cpl Martin' })),
      field('Identifiant de connexion', textInput({ name: 'username', required: true, placeholder: 'Ex : cpl.martin' })),
      field('Mot de passe', textInput({ name: 'password', required: true, attrs: 'minlength="4"', placeholder: '4 caractères minimum' })),
      isSuper ? field('Rôle', selectInput({ name: 'role', options: [
        { value: 'popotier', label: 'Popotier' },
        { value: 'chef', label: 'Chef popotier' },
      ] })) : '',
      isSuper ? field('Popote rattachée', selectInput({ name: 'popoteId', options: [
        { value: '', label: '— non rattachée (accès complet) —' },
        ...State.popotes.map(p => ({ value: p.id, label: esc(p.name) })),
      ] })) : '',
    ].join(''),
    submitLabel: 'Créer',
  });
}

export function modalResetPopotierPassword(id){
  const p = State.popotiers.find(x=>x.id===id);
  formModal({
    title: `Nouveau mot de passe — ${esc(p?.name||'')}`,
    action: 'submit-reset-popotier-password',
    dataAttrs: { id },
    fields: textInput({ name: 'password', required: true, attrs: 'minlength="4"', placeholder: 'Nouveau mot de passe' }),
    submitLabel: 'Changer le mot de passe',
  });
}
