async function hydrateSharedLayout() {
  try {
    const res = await fetch('/index.html', { cache: 'no-store' });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const nav = doc.querySelector('nav');
    const footer = doc.querySelector('footer');

    if (nav) {
      document.getElementById('site-header').innerHTML = nav.outerHTML;

      const brand = document.querySelector('#site-header nav .flex.items-center.gap-3');
      if (brand && !brand.closest('a')) {
        const homeLink = document.createElement('a');
        homeLink.href = '/';
        homeLink.className = 'inline-flex items-center';
        brand.parentNode.insertBefore(homeLink, brand);
        homeLink.appendChild(brand);
      }
    }

    if (footer) {
      document.getElementById('site-footer').innerHTML = footer.outerHTML;
    }

    document.querySelectorAll('#site-header a[href^="#"]').forEach((a) => {
      a.setAttribute('href', '/' + a.getAttribute('href'));
    });

    const currentPath = window.location.pathname.replace(/\/$/, '');
    document.querySelectorAll('#site-footer a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;
      const normalizedHref = href.replace(/\/$/, '');
      if (normalizedHref === currentPath) {
        a.style.color = '#0f172a';
        a.style.fontWeight = '700';
      }
    });
  } catch (error) {
    console.error('Failed to load shared layout:', error);
  }
}

hydrateSharedLayout();
