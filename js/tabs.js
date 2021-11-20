import { store } from "./store.js";
import { log, hide, show, clearElement } from "./utils.js";

const altHeaderEls = [...document.querySelectorAll(".altHeader")];

export const changeTab = (tabId) => {
  store.currentTabId = tabId;
};

export function tabWasChanged(id, prev = "", obj = {}) {
  // log(`tab changed from ${prev} to ${id}`)
  prev.length > 0 && hide(store.elements[prev]);
  show(store.elements[id]);
  if (["editor"].includes(id)) {
    altHeaderEls.forEach((el) => el.classList.add("invisible"));
  } else {
    altHeaderEls.forEach((el) => el.classList.remove("invisible"));
    // store.elements.ss.focus();
  }

  return;
}

export function findCurrentTabId() {
  const noHide = (el) => {
    return !el.hidden;
  };
  const active = [...document.querySelectorAll(".tab")].find(noHide)
  return active.id;
}

export function buildNavigation() {
  clearElement(store.elements.navigation);
  const menuItems = document.querySelectorAll("[data-menu]");
  const navUl = document.createElement("ul");
  store.elements.navigation.appendChild(navUl);
  menuItems.forEach((el) => {
    const text = el.dataset.menu;
    const target = el.id;
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.classList.add("navigation");
    button.innerHTML = text;
    button.addEventListener("click", () => changeTab(target));
    li.appendChild(button);
    navUl.appendChild(li);
  });
  store.elements.hamburger.addEventListener("click", () => {
    // check if nav is open - if so return to previous tab
    if (store.currentTabId == store.tabs.navigation) {
      store.currentTabId = store.savedTabId;
    } else {
      store.savedTabId = store.currentTabId;
      store.currentTabId = store.tabs.navigation;
    }
  });
}
