export async function fetchFragment(path) {
    const res = await fetch(path);
    if (!res.ok) {
        throw new Error(`Failed to load fragment: ${path}`);
    }
    return res.text();
}

export async function injectHtml(targetId, path) {
    const el = document.getElementById(targetId);
    if (!el) return null;
    const html = await fetchFragment(path);
    el.innerHTML = html;
    return el;
}

export function markActiveNav(root) {
    if (!root) return;
    const links = root.querySelectorAll('a');
    const path = window.location.pathname.replace(/index\.html$/, '/');
    links.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        const normalized = href.replace(/index\.html$/, '/');
        if (path === normalized || (path.startsWith(normalized) && normalized !== '/')) {
            link.classList.add('active');
        }
    });
}

export function bindMobileToggle(toggle, menu) {
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });
}

export function bindThemeToggle(toggle) {
    if (!toggle) return;
    const apply = (mode) => {
        const isLight = mode === 'light';
        document.body.classList.toggle('light', isLight);
        toggle.textContent = isLight ? 'Dark Mode' : 'Light Mode';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };

    toggle.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light');
        apply(isLight ? 'dark' : 'light');
    });

    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
        apply('light');
    }
}

export function ensureMainId() {
    const main = document.getElementById('main-content') || document.querySelector('main');
    if (main && !main.id) {
        main.id = 'main-content';
    }
}
