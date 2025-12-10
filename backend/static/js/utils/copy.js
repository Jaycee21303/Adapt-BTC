export function copyText(value) {
  if (!value) return;
  navigator.clipboard.writeText(value).catch(() => {});
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-copy]');
  if (target) {
    copyText(target.getAttribute('data-copy'));
  }
});
