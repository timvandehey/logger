import { store } from "./store.js";
import { dbCreate, dbRead, dbUpdate, dbDelete } from "./server.js";
import { log, hide, show, clearElement, debounced, getDate } from "./utils.js";
import { eventTypes, addEventListener } from "./events.js";
// import { iconButton } from "./icons.js";
import { changeTab } from "./tabs.js";
// import h from "./elements.js";
// const { ul, li, div, button, span } = h;

const titleInput = store.elements.titleInput;
const mdInput = store.elements.mdInput;
store.subscribe.itemsShown(
  () => (store.elements.itemsShown.innerHTML = store.itemsShown)
);

const formValueChanged = (e) => {
  const item = store.editItem;
  item.title = titleInput.value;
  item.md = mdInput.value;
  const mdWithTitle = `# ${item.title}\n\n${item.md}`;
  item.html = convertToHTML(mdWithTitle);
  item.text = convertToPlainText(mdWithTitle);
  store.elements.editor.querySelector(".card_content").innerHTML = item.html;
};

// const dHandler = debounced(500, formValueChanged);
store.elements.editor.addEventListener(
  "input",
  debounced(500, formValueChanged)
);

const actions = {
  edit: "edit",
  delete: "delete",
  displayFull: "displayFull",
  closeFull: "closeFull"
};

const normalItemsHeader = `
          <button class="pointer material-icons" title='Display Full Item' data-action='${actions.displayFull}'>open_in_full</button>
          <button class="pointer material-icons" title='Delete Note' data-action='${actions.delete}'>delete</button>
          <button class="pointer material-icons" title='Edit Note' data-action='${actions.edit}'>edit</button>
`;

const fullItemHeader = `
          <button class="pointer material-icons" title='Close Full Display' data-action='${actions.closeFull}'>close_fullscreen</button>
          <button class="pointer material-icons" title='Delete Note' data-action='${actions.delete}'>delete</button>
          <button class="pointer material-icons" title='Edit Note' data-action='${actions.edit}'>edit</button>
`;

const editItemHeader = "&nbsp;";

const renderItemHtml = `
      <div class="card">
        <div class=card_header>
        ${normalItemsHeader}
        </div>
        <div class=card_content>
        </div>
      </div>
  `;


addEventListener(store.elements.save, eventTypes.click, saveItem);
addEventListener(store.elements.cancel, eventTypes.click, clearEditor);


export function gotItems(data) {
  store.items = data.value    //.sort((a, b) => (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : -1);
  store.itemRefs = store.items.reduce((obj, item) => {
    obj[item.key] = item;
    return obj;
  }, {});
}

function renderItem(item) {
  let itemHTML = '' //store.elements.itemTemplate.content.cloneNode(true)
  const d = getDate(item['Date Time'])
  let [date, time, ampm] = d.local.split(' ')
  time = time.split(':').slice(0, 2).join(':')
  itemHTML += `<p><b>${d.dowLong} ${date} ${time} ${ampm}</b></p>`
  const sys = item['BP-S']
  const dia = item['BP-D']
  const bp = sys.length > 0 & dia.length > 0 ? `${sys} / ${dia}` : ''
  itemHTML += `<p>Blood Pressure: ${bp}</p>`
  itemHTML += `<p>Pulse: ${item.Pulse}</p>`
  itemHTML += `<p>Blood Sugar: ${item['Blood Sugar']}</p>`
  itemHTML += `<p>Weight: ${item.Weight}</p>`
  itemHTML += `<p><em>${item.Comment}</em></p>`
  // itemHTML.querySelector('.BloodSugar').innerHTML = item['Blood Sugar']
  // itemHTML.querySelector('.Weight').innerHTML = item.Weight
  // itemHTML.querySelector('.Comment').innerHTML = item.Comment
  const node = document.createElement("div");
  node.innerHTML = renderItemHtml;
  node.querySelector(".card_content").innerHTML = itemHTML
  node.classList.add("item");
  node.dataset.key = item.key;
  return [node, item];
}

export function itemClicked(e) {
  const itemEl = e.target.closest('[data-key]')
  if (!itemEl) return
  const key = itemEl.dataset.key
  const action = e.target.dataset.action;
  if (!action) return
  // const path = [...e.path];
  // for (let i = 0; i < path.length; i++) {
  //   const key = path[i].dataset.key;
  //   if (key) {
  action == actions.edit && editItem(key);
  action == actions.delete && deleteItem(key);
  action == actions.displayFull && displayFullItem(key);
  action == actions.closeFull && changeTab(store.tabs.items);
  //     break;
  //   }
  // }
}

export function renderItems() {
  const startRender = Date.now()
  const itemsEl = document.createElement("ul");
  store.elements.items.appendChild(itemsEl);
  // itemsEl.addEventListener("click", itemClicked);
  // const tbody = store.elements.items.querySelector('tbody')
  const listItems = store.items.map(renderItem);
  listItems.forEach(([node, item]) => {
    const li = document.createElement("li");
    li.appendChild(node);
    store.itemElements[item.key] = node;
    // t  body.appendChild(node)
    itemsEl.appendChild(li);
  });
  const renderTime = Date.now() - startRender
  log(`Items rendered in ${renderTime}ms.`)
  store.itemsShown = listItems.length;
}

export function itemsAreReady() {
  // setup for searching
  // const dHandler = debounced(200, searchChanged);
  addEventListener(store.elements.ss, eventTypes.input, debounced(200, searchChanged));
  // show the items
  searchChanged(); // check search field
  changeTab(store.tabs.items);
  // changeTab(store.tabs.navigation);
}

export function addItem() {
  renderEditor({ key: null, title: "", md: "", html: "", text: "" });
}

function displayFullItem(key) {
  renderFullItem(cloneItem(store.itemRefs[key]));
}

export function deleteItem(key) {
  const item = store.itemRefs[key];
  const ans = confirm(`Deleting item with key=${item.key}: Click OK if sure.`);
  if (!ans) return;
  const deletedItem = { ...item }
  changeTab(store.tabs.updating);
  const ul = store.elements.items.querySelector("ul");
  ul.removeChild(store.itemElements[key]);
  store.items = store.items.filter(current => current.key != key)
  delete store.itemRefs[key];
  searchChanged()
  changeTab(store.tabs.items);
  // dbDelete(deletedItem)
  //   .catch((e) => log(e));
}

function cloneItem(item) {
  log(item)
  return JSON.parse(JSON.stringify(item));
}

export function editItem(key) {
  renderEditor(cloneItem(store.itemRefs[key]));
}

function clearEditor() {
  store.editItem = null;
  store.elements.form.reset();
  changeTab(store.tabs.items);
  return;
}

function saveItem(e) {
  // log(e, e.target)
  changeTab(store.tabs.updating);
  const item = store.editItem;
  const { key } = item;
  if (key) {
    store.itemRefs[key] = item;
    const thisItemEl = store.itemElements[key];
    clearElement(thisItemEl);
    const [node] = renderItem(item);
    thisItemEl.appendChild(node);
    clearEditor();
    // dbUpdate(item)
    //   .catch((e) => {
    //     log(e);
    //     // clearEditor;
    //   });
  } else {
    // save NEW item
    const key = Date.now() % 1000000000000 // 31.688739 Years
    item.key = key
    store.itemRefs[key] = item;
    store.items = [item, ...store.items];
    const [node] = renderItem(item);
    const li = document.createElement("li");
    store.itemElements[key] = li;
    li.appendChild(node);
    const ul = store.elements.items.querySelector("ul");
    ul.insertBefore(li, ul.firstChild);
    searchChanged()
    clearEditor();
    // dbCreate(item)
    //   // .then(({ value: item }) => {
    //   // })
    //   .catch((e) => {
    //     log(e);
    //     clearEditor;
    //   });
  }
}

function renderEditor(item) {
  store.editItem = item;
  const editorEl = store.elements.editor;
  // store.elements.titleInput.value = item.title;
  store.elements.mdInput.innerHTML = JSON.stringify(item) // item.md;
  const lines = Math.max(15, Math.floor(JSON.stringify(item).split('\n').length))
  store.elements.mdInput.rows = lines
  // const ul = document.createElement("ul");
  const [node] = renderItem(item);
  // ul.appendChild(li);
  node.querySelector(".card_header").innerHTML = editItemHeader;
  clearElement(store.elements.itemDisplay);
  store.elements.itemDisplay.appendChild(node);
  changeTab(store.tabs.editor);
}

function renderFullItem(item) {
  store.fullItem = item;
  store.elements.titleInput.value = item.title;
  store.elements.mdInput.innerHTML = item.md;
  const [node] = renderItem(item);
  // node.addEventListener("click", itemClicked);
  node.querySelector(".card_header").innerHTML = fullItemHeader;
  clearElement(store.elements.fullitem);
  store.elements.fullitem.appendChild(node);
  changeTab(store.tabs.fullitem);
}

export const searchChanged = () => {
  const ss = store.elements.ss.value.toLowerCase();
  if (ss == "") {
    store.elements.clearSearch.style.display = "none";
  } else {
    store.elements.clearSearch.style.display = "inline";
  }
  let num = 0;
  store.items.forEach((item) => {
    const el = store.itemElements[item.key];
    if (JSON.stringify(item).indexOf(ss) < 0) {
      hide(el);
    } else {
      show(el);
      num++;
    }
  });
  store.itemsShown = num;
};
