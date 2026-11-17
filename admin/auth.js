// Demo staff sign-in. IMPORTANT: this runs entirely in the browser, so it simulates sign-in for
// demonstration and testing; it is not real security. Passwords are checked against salted PBKDF2
// hashes (admin/users.js), and the admin area is not published to the public website.
(function (global) {
  'use strict';

  var Store = global.AutolyticsStore;
  var LOCK_KEY = 'autolytics.lock';
  var MAX_FAILS = 3;
  var LOCK_MS = 60 * 1000;

  function readLock() {
    try { return JSON.parse(global.localStorage.getItem(LOCK_KEY)) || { fails: 0, until: 0 }; } catch (e) { return { fails: 0, until: 0 }; }
  }
  function writeLock(lock) { global.localStorage.setItem(LOCK_KEY, JSON.stringify(lock)); }

  function isLocked() {
    var lock = readLock();
    if (lock.until && Date.now() >= lock.until) { writeLock({ fails: 0, until: 0 }); return false; }
    return lock.until > Date.now();
  }

  function hex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  function fromHex(text) {
    var out = new Uint8Array(text.length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(text.substr(i * 2, 2), 16);
    return out;
  }

  function derive(password, user) {
    var subtle = global.crypto && global.crypto.subtle;
    if (!subtle) return Promise.reject(new Error('Sign-in needs a secure context (https or localhost).'));
    var enc = new TextEncoder().encode(password);
    return subtle.importKey('raw', enc, 'PBKDF2', false, ['deriveBits']).then(function (key) {
      return subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(user.salt), iterations: user.iterations }, key, 256);
    }).then(hex);
  }

  // Resolves to { ok: true, user } or { ok: false, reason: 'empty' | 'locked' | 'invalid' }.
  function signIn(username, password) {
    username = String(username || '').trim();
    password = String(password || '');
    if (!username || !password) return Promise.resolve({ ok: false, reason: 'empty' });
    if (isLocked()) return Promise.resolve({ ok: false, reason: 'locked' });

    var user = (global.AUTOLYTICS_USERS || []).filter(function (u) { return u.username.toLowerCase() === username.toLowerCase(); })[0];
    // Hash even for unknown users so the response time does not reveal which usernames exist.
    var check = user ? derive(password, user) : derive(password, { salt: '00', iterations: 1000 }).then(function () { return null; });
    return check.then(function (hash) {
      if (user && hash === user.hash) {
        writeLock({ fails: 0, until: 0 });
        var session = { username: user.username, role: user.role, expires: Date.now() + Store.SESSION_MS };
        global.localStorage.setItem(Store.SESSION_KEY, JSON.stringify(session));
        return { ok: true, user: session };
      }
      var lock = readLock();
      lock.fails += 1;
      if (lock.fails >= MAX_FAILS) { lock.until = Date.now() + LOCK_MS; lock.fails = 0; writeLock(lock); return { ok: false, reason: 'locked' }; }
      writeLock(lock);
      return { ok: false, reason: 'invalid' };
    });
  }

  function goToSignIn(reason) { global.location.replace('index.html?reason=' + reason); }

  // For protected pages: returns the session, or redirects to the sign-in page and returns null.
  function requireSession() {
    var raw = Store.getSession();
    var user = Store.currentUser();
    if (user) return user;
    if (raw) global.localStorage.removeItem(Store.SESSION_KEY);
    goToSignIn(raw ? 'expired' : 'login-required');
    return null;
  }

  // Any action by a signed-in user keeps the session alive (15 minutes of inactivity).
  function touch() {
    var user = requireSession();
    if (!user) return null;
    user.expires = Date.now() + Store.SESSION_MS;
    global.localStorage.setItem(Store.SESSION_KEY, JSON.stringify(user));
    return user;
  }

  function signOut() {
    global.localStorage.removeItem(Store.SESSION_KEY);
    goToSignIn('signed-out');
  }

  global.AutolyticsAuth = {
    signIn: signIn, requireSession: requireSession, touch: touch, signOut: signOut,
    lockMessage: 'Too many failed attempts. Try again in 1 minute.'
  };
})(window);
