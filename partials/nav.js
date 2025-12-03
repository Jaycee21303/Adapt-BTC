import { initNav } from '/js/ui.js';
import { initThemeToggle } from '/js/theme.js';

autoInit();

document.addEventListener('partials:loaded', autoInit);

defaultThemeLabel();

function autoInit() {
    initNav();
    initThemeToggle();
}

function defaultThemeLabel() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
        toggle.textContent = 'Dark Mode';
    }
}
