// Shared services data store (browser localStorage) and public Services page renderer.
// The public Services page works without this: the original six services are plain HTML.
// Only when an editor has saved changes (admin area) does this script replace them.
(function (global) {
  'use strict';

  var SERVICES_KEY = 'autolytics.services';
  var SESSION_KEY = 'autolytics.session';
  var SESSION_MS = 15 * 60 * 1000;

  // Services shown on the home page "What we do" section. Their anchors must keep working.
  var FEATURED = ['testing', 'test-management', 'test-lead', 'automation'];

  var DEFAULT_SERVICES = [
    {
      id: 'testing', icon: '✓', title: 'Software Testing',
      summary: 'Thorough testing from front end to back end.',
      items: [
        'Functional, system, integration and regression testing',
        'End-to-end testing across connected systems',
        'REST and SOAP API testing with Postman, SoapUI and ReadyAPI',
        'Back-end and data validation with SQL, Oracle and Cassandra',
        'AWS log analysis and message queue testing',
        'Cross-browser, iOS and Android testing',
        'IVR and card payment system testing'
      ]
    },
    {
      id: 'test-management', icon: '☰', title: 'Test Management',
      summary: 'Setting the direction and owning quality through to release.',
      items: [
        'Test strategies aligned to architecture and risk',
        'Test plans, entry and exit criteria, test approach',
        'Effort estimation at ticket and project level',
        'Stakeholder reporting, dashboards and weekly QA updates',
        'Test closure reports and release sign-off',
        'Defect management in Azure DevOps, Jira and Zephyr'
      ]
    },
    {
      id: 'test-lead', icon: '★', title: 'Test Leadership',
      summary: 'Hands-on leadership inside agile delivery teams.',
      items: [
        'Leading manual and automation testers',
        'Mentoring and coaching junior testers',
        'Shift-left practice and Three Amigos sessions',
        'Agile ceremonies: refinement, planning, stand-ups, reviews',
        'Managing dependencies across multiple teams',
        'Ways of working, wikis and process documentation'
      ]
    },
    {
      id: 'uat', icon: '✎', title: 'UAT Management',
      summary: 'Helping business users test with confidence.',
      items: [
        'UAT strategy and scenarios traced to acceptance criteria',
        'Test scripts written from process and procedure documents',
        'Test data and environment readiness',
        'Drop-in support sessions and daily UAT stand-ups',
        'Joint UAT with third-party suppliers',
        'UAT closure reporting'
      ]
    },
    {
      id: 'automation', icon: '⚙', title: 'Test Automation',
      summary: 'Automation that cuts regression effort and catches problems early.',
      items: [
        'Automation strategy and framework design',
        'Playwright with JavaScript, cross-browser on Chrome, Firefox and Edge',
        'Selenium WebDriver with C# and SpecFlow',
        'Scheduled Postman API runs for early regression warnings',
        'Code review and framework improvements'
      ]
    },
    {
      id: 'consultancy', icon: '➤', title: 'QA Consultancy',
      summary: 'Improving how your organisation approaches quality.',
      items: [
        'QA process reviews and improvement',
        'Introducing agile testing practices',
        'Support during cloud transformations and system migrations',
        'Handover of support to service functions such as ServiceNow'
      ]
    }
  ];

  var LIMITS = { titleMin: 3, titleMax: 60, summaryMax: 150, itemsMax: 10, itemMax: 100 };

  function read(key) {
    try { return global.localStorage.getItem(key); } catch (e) { return null; }
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  // ---------- Session (written by the admin sign-in, read here to enforce permissions) ----------
  function getSession() {
    var raw = read(SESSION_KEY);
    if (!raw) return null;
    try {
      var s = JSON.parse(raw);
      return s && s.username && s.role && typeof s.expires === 'number' ? s : null;
    } catch (e) { return null; }
  }

  function currentUser() {
    var s = getSession();
    return s && Date.now() < s.expires ? s : null;
  }

  function canEdit() {
    var u = currentUser();
    return !!u && u.role === 'editor';
  }

  // ---------- Services ----------
  function loadCustom() {
    var raw = read(SERVICES_KEY);
    if (!raw) return null;
    try {
      var list = JSON.parse(raw);
      return Array.isArray(list) && list.length ? list : null;
    } catch (e) { return null; }
  }

  function getServices() { return loadCustom() || clone(DEFAULT_SERVICES); }

  function requireEditor() {
    if (!canEdit()) throw new Error('Not permitted: read-only access');
  }

  function saveServices(list) {
    requireEditor();
    if (!Array.isArray(list)) throw new Error('Services must be a list');
    global.localStorage.setItem(SERVICES_KEY, JSON.stringify(list));
  }

  function resetServices() {
    requireEditor();
    global.localStorage.removeItem(SERVICES_KEY);
  }

  function parseItems(text) {
    return String(text || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
  }

  // Returns an object of field -> message. Empty object means valid.
  function validate(input, existing, editingId) {
    var errors = {};
    var title = String(input.title || '').trim();
    var summary = String(input.summary || '').trim();
    var items = parseItems(input.itemsText);

    if (!title) errors.title = 'Enter a service title.';
    else if (title.length < LIMITS.titleMin || title.length > LIMITS.titleMax) errors.title = 'Title must be between 3 and 60 characters.';
    else if (existing.some(function (s) { return s.id !== editingId && s.title.toLowerCase() === title.toLowerCase(); })) {
      errors.title = 'A service with this title already exists.';
    }

    if (!summary) errors.summary = 'Enter a short summary.';
    else if (summary.length > LIMITS.summaryMax) errors.summary = 'Summary must be 150 characters or fewer.';

    if (items.length === 0) errors.items = 'Add at least one item.';
    else if (items.length > LIMITS.itemsMax) errors.items = 'No more than 10 items.';
    else if (items.some(function (i) { return i.length > LIMITS.itemMax; })) errors.items = 'Each item must be 100 characters or fewer.';

    return errors;
  }

  function makeId(title, existing) {
    var base = String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'service';
    var id = base;
    var n = 2;
    while (existing.some(function (s) { return s.id === id; })) { id = base + '-' + n; n += 1; }
    return id;
  }

  // ---------- Public Services page ----------
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text; // textContent: saved text is never run as HTML
    return node;
  }

  function renderPublic() {
    var grid = document.getElementById('services-grid');
    var custom = loadCustom();
    if (!grid || !custom) return;
    grid.textContent = '';
    custom.forEach(function (s) {
      var card = el('article', 'card');
      card.id = s.id;
      var icon = el('div', 'icon', s.icon || '◆');
      icon.setAttribute('aria-hidden', 'true');
      card.appendChild(icon);
      card.appendChild(el('h3', '', s.title));
      card.appendChild(el('p', '', s.summary));
      var ul = el('ul');
      s.items.forEach(function (item) { ul.appendChild(el('li', '', item)); });
      card.appendChild(ul);
      grid.appendChild(card);
    });
    if (global.location.hash) {
      var target = document.getElementById(decodeURIComponent(global.location.hash.slice(1)));
      if (target) target.scrollIntoView();
    }
  }

  global.AutolyticsStore = {
    SESSION_KEY: SESSION_KEY, SESSION_MS: SESSION_MS, FEATURED: FEATURED, LIMITS: LIMITS,
    DEFAULT_SERVICES: DEFAULT_SERVICES,
    getSession: getSession, currentUser: currentUser, canEdit: canEdit,
    getServices: getServices, saveServices: saveServices, resetServices: resetServices,
    parseItems: parseItems, validate: validate, makeId: makeId, isCustomised: function () { return !!loadCustom(); }
  };

  renderPublic();
})(window);
