export const initCopyProtection = (): void => {
  disableSelection();
  disableCopyShortcuts();
  addCopyPreventionStyles();
  handleClipboardEvents();
  disableDragAndDrop();
};

const disableSelection = (): void => {
  document.body.classList.add("unselectable");
  
  const originalGetSelection = window.getSelection;
  window.getSelection = function() {
    const selection = originalGetSelection.apply(this);
    if (document.querySelector(".novel-content")?.contains(selection?.anchorNode as Node)) {
      selection?.removeAllRanges();
    }
    return selection;
  };
};

const disableCopyShortcuts = (): void => {
  document.addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "c" || e.key === "x" || e.key === "s" || e.key === "p" || e.key === "a")
    ) {
      e.preventDefault();
      console.log("Copy shortcut blocked");
    }
    
    if (e.key === "PrintScreen") {
      e.preventDefault();
      console.log("PrintScreen blocked");
    }
  });
};

const addCopyPreventionStyles = (): void => {
  const style = document.createElement("style");
  style.innerHTML = `
    .novel-content {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      position: relative;
    }
    
    .novel-content::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 1;
    }
    
    @media print {
      .novel-content {
        display: none !important;
      }
      body::after {
        content: "Printing is disabled for copyright protection.";
        display: block;
        padding: 100px 50px;
        text-align: center;
        font-size: 24px;
      }
    }
  `;
  document.head.appendChild(style);
};

const handleClipboardEvents = (): void => {
  document.addEventListener("copy", (e) => {
    if (isProtectedElement(e.target as HTMLElement)) {
      e.preventDefault();
      console.log("Copy blocked");
    }
  });
  
  document.addEventListener("cut", (e) => {
    if (isProtectedElement(e.target as HTMLElement)) {
      e.preventDefault();
      console.log("Cut blocked");
    }
  });
  
  document.addEventListener("paste", (e) => {
    if (isProtectedElement(e.target as HTMLElement)) {
      e.preventDefault();
      console.log("Paste blocked");
    }
  });
};

const disableDragAndDrop = (): void => {
  document.addEventListener("dragstart", (e) => {
    if (isProtectedElement(e.target as HTMLElement)) {
      e.preventDefault();
      console.log("Drag blocked");
    }
  });
  
  document.addEventListener("drop", (e) => {
    if (isProtectedElement(e.target as HTMLElement)) {
      e.preventDefault();
      console.log("Drop blocked");
    }
  });
};

const isProtectedElement = (element: HTMLElement | null): boolean => {
  if (!element) return false;
  
  return (
    element.classList.contains("novel-content") ||
    element.classList.contains("novel-char") ||
    !!element.closest(".novel-content")
  );
};

export const startDOMObserver = (): void => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node as HTMLElement;
            if (element.classList.contains("novel-content")) {
              element.classList.add("unselectable");
            }
          }
        });
      }
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
};
