(function () {
  const STORAGE_KEY = 'carspot_cookie_notice_acknowledged';

  function getBanner() {
    return document.getElementById('cookie-banner');
  }

  function hasAcknowledged() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  function saveAcknowledgement() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {
      // ignore storage errors silently
    }
  }

  function showBanner() {
    const banner = getBanner();
    if (!banner) return;
    banner.hidden = false;
    banner.setAttribute('aria-hidden', 'false');
  }

  function hideBanner() {
    const banner = getBanner();
    if (!banner) return;
    banner.hidden = true;
    banner.setAttribute('aria-hidden', 'true');
  }

  function acknowledgeAndHide() {
    saveAcknowledgement();
    hideBanner();
  }

  document.addEventListener('DOMContentLoaded', function () {
    const banner = getBanner();
    if (!banner) return;

    const acceptButton = document.getElementById('cookie-accept');
    const reopenButtons = document.querySelectorAll('[data-open-cookie-banner]');

    if (hasAcknowledged()) {
      hideBanner();
    } else {
      showBanner();
    }

    if (acceptButton) {
      acceptButton.addEventListener('click', acknowledgeAndHide);
    }

    reopenButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        showBanner();
      });
    });
  });
})();
