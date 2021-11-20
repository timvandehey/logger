import { store } from "./store.js";
import app from './app.js'
import { googleLogin } from "./userGoogle.js";
import { log, dev, prod, loadServiceWorker, setBodyBackgroundImg, queryParams } from "./utils.js";
import { tabWasChanged, changeTab } from "./tabs.js";
import { updateUserElements } from './user.js'
import "./debug.js";

if (prod) loadServiceWorker()
if (dev) setBodyBackgroundImg()

store.subscribe.user(updateUserElements);
store.subscribe.currentTabId(tabWasChanged);
store.subscribe.fatalError(app.fatalError)

store.elements.ss.value = queryParams.q || ''

app.setupEvents()
app.buildNavigation();

changeTab(store.tabs.authenticating);

googleLogin(store.elements.signinButton)
  .then(app.init)
  .catch((e) => log(e));
