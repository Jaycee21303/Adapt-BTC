function markLessonComplete(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.submit();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('[data-pill-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
});
