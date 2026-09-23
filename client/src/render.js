import { State } from './state/store.js';
import { curPopote } from './domain/selectors.js';
import { noDbScreen, noPopoteScreen } from './components/screens.js';
import { topBar, bottomNav } from './components/navBars.js';
import { viewMenu } from './pages/viewMenu.js';
import { viewCompte } from './pages/viewCompte.js';
import { viewStats } from './pages/viewStats.js';
import { viewAdmin } from './pages/admin/viewAdmin.js';

export function render(){
  if (!State.dbAvailable){ document.getElementById('root').innerHTML = noDbScreen(); return; }
  if (!State.ready){ document.getElementById('root').innerHTML = `<div class="min-h-screen flex items-center justify-center text-gray-300 text-sm">Chargement…</div>`; return; }

  let body;
  if (!curPopote() && State.view!=='admin') body = noPopoteScreen();
  else if (State.view==='menu') body = viewMenu();
  else if (State.view==='compte') body = viewCompte();
  else if (State.view==='stats') body = viewStats();
  else if (State.view==='admin') body = viewAdmin();
  else body = viewMenu();

  document.getElementById('root').innerHTML = topBar() + `<div class="pop-in">${body}</div>` + bottomNav();
}
