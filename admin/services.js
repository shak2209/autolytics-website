(function () {
  'use strict';

  var Auth = window.AutolyticsAuth;
  var Store = window.AutolyticsStore;

  var user = Auth.requireSession();
  if (!user) return;

  var isEditor = user.role === 'editor';
  var editingId = null; // null = adding a new service
  var pendingAction = null;

  var $ = function (id) { return document.getElementById(id); };
  var form = $('service-form');
  var fields = { title: $('svc-title'), summary: $('svc-summary'), items: $('svc-items') };
  var errorEls = { title: $('svc-title-error'), summary: $('svc-summary-error'), items: $('svc-items-error') };
  var tbody = document.querySelector('#services-table tbody');
  var statusEl = $('status');
  var confirmPanel = $('confirm-panel');

  function roleLabel(role) { return role.charAt(0).toUpperCase() + role.slice(1); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text; // never innerHTML: saved text must not run as markup
    return node;
  }

  function showStatus(message) { statusEl.textContent = message; statusEl.hidden = !message; }

  function actionButton(label, action, service, extraClass) {
    var b = el('button', 'btn btn-small ' + extraClass, label);
    b.type = 'button';
    b.setAttribute('aria-label', label + ' ' + service.title);
    b.dataset.action = action;
    b.dataset.id = service.id;
    return b;
  }

  function renderTable() {
    tbody.textContent = '';
    Store.getServices().forEach(function (s) {
      var tr = el('tr');
      tr.appendChild(el('th', '', s.title)).scope = 'row';
      tr.appendChild(el('td', '', s.summary));
      tr.appendChild(el('td', '', String(s.items.length)));
      if (isEditor) {
        var td = el('td', 'actions');
        td.appendChild(actionButton('Edit', 'edit', s, 'btn-secondary'));
        var del = actionButton('Delete', 'delete', s, 'btn-danger');
        if (Store.FEATURED.indexOf(s.id) !== -1) {
          del.disabled = true;
          del.title = 'Featured on the home page, so it cannot be deleted';
        }
        td.appendChild(del);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
  }

  function clearErrors() {
    Object.keys(fields).forEach(function (k) {
      errorEls[k].hidden = true;
      errorEls[k].textContent = '';
      fields[k].removeAttribute('aria-invalid');
    });
  }

  function openForm(service) {
    clearErrors();
    hideConfirm();
    editingId = service ? service.id : null;
    $('form-heading').textContent = service ? 'Edit service' : 'Add service';
    fields.title.value = service ? service.title : '';
    fields.summary.value = service ? service.summary : '';
    fields.items.value = service ? service.items.join('\n') : '';
    form.hidden = false;
    fields.title.focus();
  }

  function closeForm() { form.hidden = true; editingId = null; }

  function showConfirm(message, action) {
    closeForm();
    pendingAction = action;
    $('confirm-text').textContent = message;
    confirmPanel.hidden = false;
    $('confirm-yes').focus();
  }

  function hideConfirm() { confirmPanel.hidden = true; pendingAction = null; }

  function findService(id) { return Store.getServices().filter(function (s) { return s.id === id; })[0]; }

  function guard() { return Auth.touch(); }

  // ---------- Events ----------
  $('sign-out').addEventListener('click', Auth.signOut);

  $('add-service').addEventListener('click', function () {
    if (!guard()) return;
    showStatus('');
    openForm(null);
  });

  $('reset-services').addEventListener('click', function () {
    if (!guard()) return;
    showStatus('');
    showConfirm('Reset all services to the original list?', function () {
      Store.resetServices();
      showStatus('Services reset to the original six.');
    });
  });

  tbody.addEventListener('click', function (e) {
    var button = e.target.closest('button[data-action]');
    if (!button || !guard()) return;
    var service = findService(button.dataset.id);
    if (!service) return;
    showStatus('');
    if (button.dataset.action === 'edit') openForm(service);
    else {
      showConfirm('Delete ' + service.title + '? This cannot be undone.', function () {
        Store.saveServices(Store.getServices().filter(function (s) { return s.id !== service.id; }));
        showStatus('Service deleted.');
      });
    }
  });

  $('confirm-yes').addEventListener('click', function () {
    if (!guard()) return;
    var action = pendingAction;
    hideConfirm();
    if (action) { action(); renderTable(); }
  });
  $('confirm-no').addEventListener('click', function () { if (guard()) hideConfirm(); });
  $('cancel-form').addEventListener('click', function () { if (guard()) closeForm(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!guard()) return;
    var services = Store.getServices();
    var input = { title: fields.title.value, summary: fields.summary.value, itemsText: fields.items.value };
    var errors = Store.validate(input, services, editingId);
    clearErrors();
    var keys = Object.keys(errors);
    if (keys.length) {
      keys.forEach(function (k) {
        errorEls[k].textContent = errors[k];
        errorEls[k].hidden = false;
        fields[k].setAttribute('aria-invalid', 'true');
      });
      fields[['title', 'summary', 'items'].filter(function (k) { return errors[k]; })[0]].focus();
      return;
    }
    var record = { title: input.title.trim(), summary: input.summary.trim(), items: Store.parseItems(input.itemsText) };
    if (editingId) {
      Store.saveServices(services.map(function (s) { return s.id === editingId ? Object.assign({}, s, record) : s; }));
      showStatus('Service updated.');
    } else {
      record.id = Store.makeId(record.title, services);
      Store.saveServices(services.concat([record]));
      showStatus('Service added.');
    }
    closeForm();
    renderTable();
    $('add-service').focus();
  });

  // Signing out in another tab signs out this one.
  window.addEventListener('storage', function (e) {
    if (e.key === Store.SESSION_KEY && !e.newValue) window.location.replace('index.html?reason=signed-out');
  });

  // Coming back via the browser's back button must not show data after sign-out or expiry.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) Auth.requireSession();
  });

  // ---------- Initial render ----------
  $('session-info').textContent = 'Signed in as ' + user.username + ' (' + roleLabel(user.role) + ')';
  if (!isEditor) {
    $('readonly-notice').hidden = false;
    $('toolbar').hidden = true;
    $('actions-head').hidden = true;
  }
  renderTable();
})();
