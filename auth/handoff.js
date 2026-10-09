(() => {
  'use strict';
  const isReset = location.pathname.replace(/\/$/, '') === '/auth/reset-password';
  const query = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.slice(1));
  const keys = ['token_hash', 'code', 'access_token', 'refresh_token', 'type', 'error', 'error_description'];
  const repeated = keys.some(key => query.getAll(key).length + hash.getAll(key).length > 1);
  const get = key => query.get(key) || hash.get(key) || '';
  const type = get('type');
  const expectedType = isReset ? 'recovery' : 'email';
  const token = get('token_hash');
  const access = get('access_token');
  const refresh = get('refresh_token');
  const code = get('code');
  const variants = Number(!!token) + Number(!!code) + Number(!!(access || refresh));
  const valid = !repeated && !get('error') && !get('error_description') && variants === 1 &&
    (!type || type === expectedType || (!isReset && type === 'signup')) &&
    (!token || /^[a-zA-Z0-9_-]{16,2048}$/.test(token)) && (!code || code.length <= 2048) &&
    (!(access || refresh) || (access && refresh && type && access.length <= 16384 && refresh.length <= 4096));
  // Keep one-time credentials only in memory, not in browser history or storage.
  history.replaceState(null, '', location.pathname);
  const action = document.getElementById('open-app');
  if (!valid) {
    action.hidden = true;
    document.getElementById('copy').textContent = 'Dieser Link ist unvollständig oder abgelaufen. Fordere in CarSpot einen neuen Link an.';
    return;
  }
  const destination = new URL(isReset ? 'carspot://auth/reset-password' : 'carspot://auth/email-confirm');
  if (token) { destination.searchParams.set('token_hash', token); destination.searchParams.set('type', expectedType); }
  else if (code) destination.searchParams.set('code', code);
  else { destination.hash = new URLSearchParams({access_token:access,refresh_token:refresh,type}).toString(); }
  action.addEventListener('click', () => {
    location.assign(destination.href);
    document.getElementById('help').hidden = false;
  });
})();
