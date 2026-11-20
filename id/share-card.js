const shareButton = document.getElementById('share-button');
const shareStatus = document.getElementById('share-status');
const copyDialog = document.getElementById('copy-dialog');
const shareUrl = document.getElementById('share-url');
const detailsDialog = document.getElementById('details-dialog');
let statusTimer;

function confirmCopy() {
  shareStatus.textContent = 'Link kopiert';
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { shareStatus.textContent = ''; }, 2600);
}

async function shareCard() {
  const url = window.location.href;
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: document.title, url });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      confirmCopy();
      return;
    } catch {
      // A browser can expose the clipboard API and still deny a write.
    }
  }

  shareUrl.value = url;
  copyDialog.showModal();
  shareUrl.select();
  // Local HTTP phone previews can still copy a selection from the user's tap.
  if (!navigator.clipboard?.writeText) {
    try {
      if (document.execCommand('copy')) {
        copyDialog.close();
        confirmCopy();
      }
    } catch {
      // Keep the URL selected for the system's Copy action.
    }
  }
}

shareButton?.addEventListener('click', shareCard);
if (detailsDialog) {
  document.getElementById('details-button').addEventListener('click', () => detailsDialog.showModal());
}
