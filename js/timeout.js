import { store } from "./store.js";
import { log, throttled } from "./utils.js";
import { changeTab } from "./tabs.js";
import { signout } from "./userGoogle.js";

const inactivityMs = 30 * 60 * 1000; // 30 minutes
const questionMs = 60 * 1000 // 60 seconds
const throttedMs = 5 * 1000 // 5 seconds

const secondsLeftEl = store.elements.loginInSecs;

let prevTabId;
let inactivityTime;
let keepAliveTime;
let questionTime;
let watchInactivity = false;

export const activityDetected = throttled(throttedMs, resetTimer)

export function startInactivityTimer() {
  watchInactivity = true;
  resetTimer({ type: 'start inactivity timer' });
}

export function inactivityActivated() {
  watchInactivity = false;
  prevTabId = store.currentTabId;
  clearTimeout(inactivityTime);
  setQuestionTime();
  changeTab(store.tabs.timeout);
}

export function resetTimer(e = { type: 'Nothing' }) {
  if (!watchInactivity) return;
  clearTimeout(inactivityTime);
  clearInterval(questionTime);
  watchInactivity = true;
  inactivityTime = setTimeout(inactivityActivated, inactivityMs);
}

let timeLeft;

function setQuestionTime() {
  clearTimeout(keepAliveTime);
  timeLeft = questionMs;
  setSecondsLeftOnPage(timeLeft / 1000);
  questionTime = setInterval(decrementSecondsOrLogoff, 1000);
}

function decrementSecondsOrLogoff() {
  timeLeft -= 1000;
  if (timeLeft >= 1) {
    setSecondsLeftOnPage(timeLeft / 1000);
  } else {
    clearInterval(questionTime);
    signout();
  }
}

function setSecondsLeftOnPage(sec) {
  secondsLeftEl.innerHTML = sec;
  return;
}

function keepAlive() {
  watchInactivity = true;
  resetTimer();
  changeTab(prevTabId);
}

store.elements.timeoutButton.onclick = keepAlive;
