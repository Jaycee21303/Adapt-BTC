document.addEventListener('DOMContentLoaded', async () => {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;
  const res = await fetch('/components/footer.html');
  placeholder.innerHTML = await res.text();
});
