export function bindModalTriggers() {
  const triggers = document.querySelectorAll('[data-modal-target]');
  const backdrops = new Map();

  const closeModal = (id) => {
    const backdrop = backdrops.get(id) || document.getElementById(id);
    backdrop?.classList.remove('active');
  };

  const openModal = (id) => {
    const backdrop = backdrops.get(id) || document.getElementById(id);
    backdrop?.classList.add('active');
  };

  triggers.forEach((trigger) => {
    const target = trigger.getAttribute('data-modal-target');
    if (!target) return;
    trigger.addEventListener('click', () => openModal(target));
  });

  document.querySelectorAll('[data-modal-close]').forEach((btn) => {
    const target = btn.getAttribute('data-modal-close');
    btn.addEventListener('click', () => closeModal(target));
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    const id = backdrop.id;
    backdrops.set(id, backdrop);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        backdrop.classList.remove('active');
      }
    });
  });

  return { openModal, closeModal };
}
