import { log, clearElement } from './utils.js'
import { store } from './store.js'
import { changeTab } from './tabs.js'
import { itemsAreReady, gotItems, renderItems, addItem, searchChanged } from "./items.js";
import { handlers } from './events.js'
import { activityDetected, startInactivityTimer } from "./timeout.js";
import { dbRead, login } from "./server.js";


export default {
  init
  , setupEvents
  , buildNavigation
  , fatalError
}

function init(gUser) {
  store.user = { ...gUser };
  changeTab(store.tabs.authorizing);
  login().then((ldata) => {
    changeTab(store.tabs.loading);
    dbRead()
      .then(gotItems)
      .then(renderItems)
      .then(itemsAreReady)
      .then(startInactivityTimer)
      .catch(log)
  });
}

function setupEvents() {
  store.elements.addButton.addEventListener("click", addItem);
  store.elements.clearSearch.addEventListener("click", () => {
    store.elements.ss.value = ""
    searchChanged()
  })
  document.addEventListener('pointerdown', handlers.click)
  document.addEventListener('pointermove', activityDetected)
  document.addEventListener('touchmove', activityDetected)
  document.addEventListener('keypress', activityDetected)
  return
}

function buildNavigation() {
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

function fatalError() {
  store.elements.error.innerHTML = store.fatalError
  changeTab(store.tabs.error)
}


// document.body.addEventListener('contextmenu', e => {
//   const { id } = e.target
//   if (id == '#mdInput') {
//     e.preventDefault()
//     log(e.pageX, e.pageY, e)
//   }
//   log(id, e.target, e)
//   return true
// })
