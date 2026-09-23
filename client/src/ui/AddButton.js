import { ui } from './styles.js';

export function addButton({ action, label }){
  return `<button data-action="${action}" class="${ui.btnDashedAdd}">${label}</button>`;
}
