export function initThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('light');
        const isLight = document.body.classList.contains('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        toggle.textContent = isLight ? 'Dark Mode' : 'Light Mode';
    });

    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
        document.body.classList.add('light');
        toggle.textContent = 'Dark Mode';
    }
}

document.addEventListener('partials:loaded', initThemeToggle);
