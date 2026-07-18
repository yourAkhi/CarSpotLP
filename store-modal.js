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

  let lastFocusedElement = null;

  const getFocusableElements = () =>
    Array.from(
      modal.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute("hidden"));

  const highlightStore = (store) => {
    storeLinks.forEach((link) => {
      const isSelected = link.dataset.storeLink === store;
      link.classList.toggle("is-selected", isSelected);
    });
  };

  const openModal = (store) => {
    lastFocusedElement = document.activeElement;
    highlightStore(store);

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("store-modal-open");

    requestAnimationFrame(() => {
      const preferredLink = modal.querySelector(
        `[data-store-link="${store}"]`
      );
      (preferredLink || modal.querySelector(".store-modal__close"))?.focus();
    });
  };

  const closeModal = () => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("store-modal-open");

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

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
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
