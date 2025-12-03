import { injectHtml, markActiveNav, bindMobileToggle, bindThemeToggle, ensureMainId } from './utils.js';

async function loadChrome() {
    const header = await injectHtml('site-header', '/partials/header.html');
    const footer = await injectHtml('site-footer', '/partials/footer.html');

    if (header) {
        const navMenu = header.querySelector('.nav-menu');
        const navToggle = header.querySelector('.mobile-menu-btn');
        markActiveNav(header);
        bindMobileToggle(navToggle, navMenu);
        bindThemeToggle(header.querySelector('[data-theme-toggle]'));
    }

    if (footer) {
        markActiveNav(footer);
    }

    ensureMainId();
    document.dispatchEvent(new Event('partials:loaded'));
}

document.addEventListener('DOMContentLoaded', () => {
    loadChrome().catch((err) => {
        console.error('Layout failed to load', err);
    });
});
