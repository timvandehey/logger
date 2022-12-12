import { log, dev } from "./utils.js";
import { storeFactory } from './storeFunctions.js'
import { findCurrentTabId } from './tabs.js'

export const version = '1.0'

export const API_URL =
  // "https://script.google.com/macros/s/AKfycbya4Lt5XG7upra-dUMX5BD50YKbCjhuWx_NvIT4nI2eeZh58H6G/exec";
  // 'https://script.google.com/macros/s/AKfycbzXM5-xuTUg8RZttjY62Edh52PZwEsxPhd-WzdBevhmoMcIrapPP20_BYdrlz9zf0ALKA/exec'
  'https://script.google.com/macros/s/AKfycbyv911RCTj7ywKcIy3Eu4atkn6_rGUsp2Fke7hsIR8354YYUb0jEBrxUWuScpxR8VMMlg/exec'

export const dbName = "logger";

export const store = storeFactory({
  user: { name: "tim" },
  title: "Hello",
  elements: {},
  items: [],
  itemRefs: {},
  itemsShown: 0,
  currentTabId: findCurrentTabId(),
  savedTabId: "",
  tabs: {},
  elements: {},
  itemElements: {},
  editItem: {},
  fullItem: {},
  activeTabBeforeTimeout: '',
  debug: dev,
  fatalError: ''
});

store.tabs = (function () {
  const tabEls = document.querySelectorAll(".tab");
  const tabIds = [...tabEls].reduce((p, el) => {
    const id = el.id;
    p[id] = id;
    return p;
  }, {});
  return tabIds;
})();

store.elements = Array.from(document.querySelectorAll("[id]")).reduce(
  (p, c) => {
    p[c.id] = c;
    return p;
  },
  {}
);

store.debug = dev;
