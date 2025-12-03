export function initNav() {
    const toggle = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
    });
}

document.addEventListener('partials:loaded', initNav);
