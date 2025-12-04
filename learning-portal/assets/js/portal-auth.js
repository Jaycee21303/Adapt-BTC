const API_BASE = '/api';

async function sessionGuard(namespace = 'learning') {
  const res = await fetch(`${API_BASE}/${namespace}/session`);
  const data = await res.json();
  if (!data.loggedIn) {
    window.location.href = `/learning-portal/login.html`;
  } else {
    const nameEls = document.querySelectorAll('[data-username]');
    nameEls.forEach(el => el.textContent = data.username);
  }
}

async function handleAuthForm(formId, endpoint, redirect) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const alert = document.getElementById('form-alert');
    if (data.error) {
      alert.textContent = data.error;
      alert.style.display = 'block';
      alert.style.background = '#ffecec';
      alert.style.color = '#c62828';
    } else {
      alert.textContent = 'Success! Redirecting...';
      alert.style.display = 'block';
      setTimeout(() => window.location.href = redirect, 800);
    }
  });
}

async function loadProgress() {
  const res = await fetch(`${API_BASE}/learning/progress`);
  if (res.status !== 200) return { lessons:{}, quizzes:{}, certificates:[] };
  return res.json();
}

async function saveProgress(progress) {
  await fetch(`${API_BASE}/learning/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(progress)
  });
}

export { sessionGuard, handleAuthForm, loadProgress, saveProgress };
