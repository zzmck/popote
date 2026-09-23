import { ui } from './styles.js';

export function statCard({ label, value, valueClass = 'text-navy-900', size = 'lg' }){
  return `<div class="${ui.card}"><div class="text-xs text-gray-500 mb-1">${label}</div><div class="text-${size} font-bold ${valueClass}">${value}</div></div>`;
}
