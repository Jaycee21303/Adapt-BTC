import { initNav } from '/js/ui.js';

autoInit();

document.addEventListener('partials:loaded', autoInit);

function autoInit() {
    initNav();
}
