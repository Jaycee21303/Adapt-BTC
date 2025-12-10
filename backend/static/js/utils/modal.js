function closeModal(modal) {
  modal.classList.remove('show');
}

document.addEventListener('click', (event) => {
  const modal = event.target.closest('[data-modal]');
  if (event.target.matches('[data-modal-close]')) {
    closeModal(modal);
  }
  if (event.target.dataset.modal === '' || event.target.classList.contains('modal')) {
    closeModal(event.target);
  }
});

export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('show');
}
