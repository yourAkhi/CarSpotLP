(() => {
  const modal = document.getElementById("store-modal");
  const openButtons = Array.from(
    document.querySelectorAll("[data-open-store-modal]")
  );

  if (!modal || openButtons.length === 0) return;

  const closeButtons = Array.from(
    modal.querySelectorAll("[data-close-store-modal]")
  );
  const storeLinks = Array.from(modal.querySelectorAll("[data-store-link]"));
  const dialog = modal.querySelector(".store-modal__dialog");
  const modalEyebrow = modal.querySelector("[data-store-modal-eyebrow]");
  const modalPlatform = modal.querySelector("[data-store-modal-platform]");
  const storeView = modal.querySelector('[data-store-modal-view="store"]');
  const iosPwaView = modal.querySelector('[data-store-modal-view="ios-pwa"]');
  const iosPwaTrigger = modal.querySelector("[data-ios-pwa-trigger]");
  const backButton = modal.querySelector("[data-store-modal-back]");

  const storeContent = {
    ios: {
      eyebrow: "Danke für deinen Support",
      platform: "LOS GEHT'S! 😎",
    },
    android: {
      eyebrow: "Danke für deinen Support",
      platform: "LOS GEHT'S! 😎",
    },
  };

  let lastFocusedElement = null;

  const getFocusableElements = () =>
    Array.from(
      modal.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (element) =>
        !element.hasAttribute("hidden") &&
        !element.closest("[hidden]")
    );

  const showInitialView = () => {
    if (storeView) storeView.hidden = false;
    if (iosPwaView) iosPwaView.hidden = true;

    modal.dataset.modalView = "store";
    modal.setAttribute("aria-labelledby", "store-modal-heading");
    modal.setAttribute("aria-describedby", "store-modal-description");
  };

  const showIosPwaView = () => {
    if (!storeView || !iosPwaView) return;

    storeView.hidden = true;
    iosPwaView.hidden = false;

    modal.dataset.modalView = "ios-pwa";
    modal.setAttribute("aria-labelledby", "ios-pwa-heading");
    modal.setAttribute("aria-describedby", "ios-pwa-description");

    requestAnimationFrame(() => {
      iosPwaView.querySelector("a[href]")?.focus();
    });
  };

  const showStoreContext = (store) => {
    const selectedStore = storeContent[store] ? store : "ios";
    const content = storeContent[selectedStore];

    showInitialView();

    storeLinks.forEach((link) => {
      const isSelected = link.dataset.storeLink === selectedStore;
      link.hidden = !isSelected;
      link.setAttribute("aria-hidden", String(!isSelected));
      link.classList.toggle("is-selected", isSelected);
    });

    if (modalEyebrow) modalEyebrow.textContent = content.eyebrow;
    if (modalPlatform) modalPlatform.textContent = content.platform;

    modal.dataset.activeStore = selectedStore;
    return selectedStore;
  };

  const openModal = (store) => {
    lastFocusedElement = document.activeElement;
    const selectedStore = showStoreContext(store);

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("store-modal-open");

    requestAnimationFrame(() => {
      const preferredLink = modal.querySelector(
        `[data-store-link="${selectedStore}"]`
      );
      (preferredLink || modal.querySelector(".store-modal__close"))?.focus();
    });
  };

  const closeModal = () => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("store-modal-open");
    showInitialView();

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openModal(button.dataset.openStoreModal || "ios");
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  iosPwaTrigger?.addEventListener("click", showIosPwaView);

  backButton?.addEventListener("click", () => {
    showInitialView();
    requestAnimationFrame(() => iosPwaTrigger?.focus());
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();

      if (modal.dataset.modalView === "ios-pwa") {
        showInitialView();
        requestAnimationFrame(() => iosPwaTrigger?.focus());
      } else {
        closeModal();
      }
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  dialog?.addEventListener("click", (event) => {
    event.stopPropagation();
  });
})();
