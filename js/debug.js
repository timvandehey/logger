import { store } from "./store.js";
import { log, dev, queryParams } from "./utils.js";
import { inactivityActivated } from './timeout.js'

const { hostname, pathname } = window.location
let checkDev = ["localhost", "vanilladatatest"]
  .includes(hostname)
let checkProd =
  !!queryParams.prod || pathname.includes('prod')
checkProd = checkProd || !checkDev


function debugHasChanged() {
  store.elements.alwaysShow.innerHTML = `
  Debug is ${store.debug} \n
  window.location.origin: \n${window.location.origin}
  hostname: ${hostname}
  pathname: ${pathname}
  `;
}

store.subscribe.debug(debugHasChanged);
debugHasChanged();

store.elements.toggleDebug.addEventListener(
  "click",
  () => (store.debug = !store.debug)
);

document.querySelector('#debug .inactivity')
  .addEventListener('click', inactivityActivated)
