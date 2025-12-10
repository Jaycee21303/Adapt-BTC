export function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert ${type}`;
  alert.textContent = message;
  document.body.append(alert);
  setTimeout(() => alert.remove(), 3000);
}
