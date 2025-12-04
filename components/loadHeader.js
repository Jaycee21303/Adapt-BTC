document.addEventListener('DOMContentLoaded', async () => {
  const placeholder = document.getElementById('header-placeholder');
  if (!placeholder) return;
  const res = await fetch('/components/header.html');
  placeholder.innerHTML = await res.text();
});
