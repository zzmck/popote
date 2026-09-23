export function closeModal(){ document.getElementById('modal-root').innerHTML=''; }
export function openModal(html){
  document.getElementById('modal-root').innerHTML = `
    <div class="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-navy-900/40 backdrop-blur-sm p-0 sm:p-4" data-action="modal-backdrop">
      <div class="pop-in bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 max-h-[88vh] overflow-y-auto" style="padding-bottom: calc(1.5rem + env(safe-area-inset-bottom,0px));">
        ${html}
      </div>
    </div>`;
}
