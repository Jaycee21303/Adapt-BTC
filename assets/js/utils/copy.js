export async function copyTextFromElement(elementId) {
  const target = document.getElementById(elementId);
  if (!target) return false;
  const value = target.textContent?.trim();
  if (!value) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (error) {
    console.error('Copy failed', error);
    return false;
  }
}

export async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (error) {
    console.error('Copy failed', error);
    return false;
  }
}
