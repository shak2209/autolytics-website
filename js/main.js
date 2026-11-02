// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  const mobile = window.matchMedia('(max-width: 820px)');
  // Collapse the menu whenever the layout switches to mobile; always show it on desktop.
  const syncNav = () => {
    siteNav.hidden = mobile.matches;
    navToggle.setAttribute('aria-expanded', 'false');
  };
  syncNav();
  mobile.addEventListener('change', syncNav);
  navToggle.addEventListener('click', () => {
    siteNav.hidden = !siteNav.hidden;
    navToggle.setAttribute('aria-expanded', String(!siteNav.hidden));
  });
}

// Experience tabs (one tab per role)
const tabs = document.querySelectorAll('[role="tab"]');

function selectTab(tab, updateHash = true) {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
  });
  if (updateHash) history.replaceState(null, '', '#' + tab.dataset.slug);
}

if (tabs.length) {
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      const next = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!next) return;
      e.preventDefault();
      const target = tabs[(i + next + tabs.length) % tabs.length];
      target.focus();
      selectTab(target);
    });
  });

  const fromHash = [...tabs].find((t) => '#' + t.dataset.slug === location.hash);
  selectTab(fromHash || tabs[0], false);
}

// Footer year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
