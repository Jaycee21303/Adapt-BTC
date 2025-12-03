const componentSources = {
  header: '/components/header.html',
  nav: '/components/nav.html',
  footer: '/components/footer.html'
};

async function injectHTML(target, source) {
  const el = document.getElementById(target);
  if (!el) return null;
  try {
    const res = await fetch(source);
    const html = await res.text();
    el.innerHTML = html;
    return el;
  } catch (err) {
    console.error('AdaptBTC include failed', source, err);
    return null;
  }
}

function setActiveNav(navRoot) {
  if (!navRoot) return;
  const links = navRoot.querySelectorAll('a');
  const path = window.location.pathname.replace(/index\.html$/, '/');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const normalized = href.replace(/index\.html$/, '/');
    if (path === normalized || (path.endsWith('/') && normalized === '/')) {
      link.classList.add('active');
    } else if (path.includes(normalized) && normalized !== '/') {
      link.classList.add('active');
    }
  });
}

function wireBurger(header) {
  if (!header) return;
  const burger = header.querySelector('.atb-burger');
  const nav = header.querySelector('.atb-nav');
  if (!burger || !nav) return;
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });
}

async function loadLayout() {
  const header = await injectHTML('site-header', componentSources.header);
  if (header) {
    const navSlot = header.querySelector('[data-include="nav"]');
    if (navSlot) {
      try {
        const navRes = await fetch(componentSources.nav);
        navSlot.innerHTML = await navRes.text();
      } catch (err) {
        console.error('AdaptBTC nav load error', err);
      }
    }
    setActiveNav(header);
    wireBurger(header);
  }

  await injectHTML('site-footer', componentSources.footer);
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('atb-branded');
  const main = document.getElementById('main-content') || document.querySelector('main');
  if (main && !main.id) {
    main.id = 'main-content';
  }
  loadLayout();
});
