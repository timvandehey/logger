import { store, version } from "./store.js";
import { log, clearElement } from "./utils.js";
import { signout } from "./userGoogle.js";
import { addEventListener, eventTypes } from "./events.js";
import { changeTab } from "./tabs.js";

export function updateUserElements(newUser) {
  const avatar = document.createElement("img");
  avatar.id = "avatar";
  avatar.src = newUser.picture;
  addEventListener(avatar, eventTypes.click, (e) =>
    changeTab(store.tabs.usertab)
  );
  clearElement(store.elements.user);
  store.elements.user.appendChild(avatar);
  store.elements.so.addEventListener("click", signout);
  store.elements.userName.innerHTML = newUser.name
  store.elements.userEmail.innerHTML = newUser.email
  store.elements.version.innerHTML = `Version ${version}`
  if (newUser.email == "tim.vandehey@gmail.com") {
    const el = store.elements.debug
    const text = "Debug";
    const target = el.id;
    const button = document.createElement("button");
    button.innerHTML = text;
    button.addEventListener("click", () => changeTab(target));
    const p = document.createElement('p')
    p.appendChild(button)
    const p2 = document.createElement('p')
    const link = document.createElement('a')
    link.href = 'https://docs.google.com/spreadsheets/d/1C3L_w8mP7L8A_-9OM95cOlPuOtG2QDuCFpdP3Tzbrxo/edit#gid=1718951001'
    link.target = '_blank'
    link.innerHTML = 'Database Link'
    p2.append(link)
    store.elements.usertab.append(p, p2)
  }
}