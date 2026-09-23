import { esc } from '../utils/format.js';
import { ui } from './styles.js';

export function field(label, inputHtml){
  return `<div><label class="${ui.label}">${label}</label>${inputHtml}</div>`;
}

export function textInput({ name, value = '', placeholder = '', required = false, type = 'text', autofocus = false, attrs = '', className = ui.input }){
  return `<input name="${name}" type="${type}" ${required ? 'required' : ''} ${autofocus ? 'autofocus' : ''} ${attrs} value="${esc(value)}" placeholder="${placeholder}" class="${className}">`;
}

export function selectInput({ name, options, className = ui.input }){
  return `<select name="${name}" class="${className}">${options.map(o => `<option value="${o.value}" ${o.selected ? 'selected' : ''}>${o.label}</option>`).join('')}</select>`;
}

export function grid2(a, b){
  return `<div class="grid grid-cols-2 gap-3">${a}${b}</div>`;
}

export function checkboxLine(name, label){
  return `<label class="flex items-center gap-2 text-sm text-gray-600">
    <input type="checkbox" name="${name}" class="w-4 h-4 rounded border-gray-300">
    ${label}
  </label>`;
}

export function chipGroup(target, values, suffix = ' €'){
  return `<div class="flex gap-2 mb-2">${values.map(v => `<button type="button" data-action="quick-amount" data-target="${target}" data-val="${v}" class="${ui.chip}">${v}${suffix}</button>`).join('')}</div>`;
}
