import { openModal } from '../modals/modalCore.js';
import { ui } from './styles.js';

export function modalHeader({ title, subtitle = '' }){
  return `<h3 class="text-lg font-bold text-navy-900 ${subtitle ? 'mb-1' : 'mb-4'}">${title}</h3>${subtitle ? `<p class="text-sm text-gray-500 mb-4">${subtitle}</p>` : ''}`;
}

export function formModal({ title, subtitle = '', action, dataAttrs = {}, fields = '', submitLabel, secondary = '', tail = '', footer = '' }){
  const attrs = Object.entries(dataAttrs).map(([k, v]) => `data-${k}="${v}"`).join(' ');
  const submitRow = secondary
    ? `<div class="flex gap-2 mt-2"><button class="${ui.btnPrimaryFlex}">${submitLabel}</button>${secondary}</div>`
    : `<button class="${ui.btnPrimary} mt-2">${submitLabel}</button>`;
  openModal(`
    ${modalHeader({ title, subtitle })}
    <form data-action="${action}" ${attrs} class="space-y-3">
      ${fields}
      ${submitRow}
      ${tail}
    </form>
    ${footer}
  `);
}
