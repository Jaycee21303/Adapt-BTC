export async function injectPartials() {
    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');

    try {
        if (headerEl) {
            const res = await fetch('/partials/header.html');
            headerEl.innerHTML = await res.text();
        }
        if (footerEl) {
            const res = await fetch('/partials/footer.html');
            footerEl.innerHTML = await res.text();
        }
    } catch (err) {
        console.error('Error loading partials', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    injectPartials().then(() => {
        const event = new Event('partials:loaded');
        document.dispatchEvent(event);
    });
});
