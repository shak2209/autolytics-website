(function () {
  'use strict';

  var Auth = window.AutolyticsAuth;
  var Store = window.AutolyticsStore;

  // Already signed in: go straight to the dashboard.
  if (Store.currentUser()) { window.location.replace('services.html'); return; }

  var NOTICES = {
    'login-required': 'Please sign in to continue.',
    'expired': 'Your session has expired. Please sign in again.',
    'signed-out': 'You have been signed out.'
  };

  var notice = document.getElementById('login-notice');
  var reason = new URLSearchParams(window.location.search).get('reason');
  if (reason && NOTICES[reason]) { notice.textContent = NOTICES[reason]; notice.hidden = false; }

  var form = document.getElementById('login-form');
  var username = document.getElementById('username');
  var password = document.getElementById('password');
  var error = document.getElementById('login-error');
  var toggle = document.getElementById('toggle-password');

  function showError(message) { error.textContent = message; error.hidden = false; }

  toggle.addEventListener('click', function () {
    var show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Hide password' : 'Show password';
  });

  // The page can be restored from the back/forward cache after signing in elsewhere.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && Store.currentUser()) window.location.replace('services.html');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    error.hidden = true;
    notice.hidden = true;
    Auth.signIn(username.value, password.value).then(function (result) {
      if (result.ok) { window.location.assign('services.html'); return; }
      if (result.reason === 'empty') showError('Enter your username and password.');
      else if (result.reason === 'locked') showError(Auth.lockMessage);
      else showError('Invalid username or password.');
      password.value = '';
    }).catch(function (err) { showError(err.message); });
  });
})();
