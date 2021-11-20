import { itemClicked } from "./items.js";
import { activityDetected, resetTimer } from "./timeout.js";
import { log } from "./utils.js";

export const eventTypes = {
  click: { types: ["click", "pointerUp"], plugin: click_handler },
  input: { types: ["input"] },
}

function executeHandler(fn, e) { fn(e) }

function click_handler(e, fn) {
  executeHandler(fn, e)
}

export const handlers = {
  click: generalClick,
}

function generalClick(e) {
  itemClicked(e)
  resetTimer({ type: 'click' })
}

export function addEventListener(el, eventType, fn) {
  const { types, plugin } = eventType;
  const listenerFunction = plugin ? (e) => plugin(e, fn) : (e) => fn(e)
  types.forEach(
    (type) => {
      el.addEventListener(type, listenerFunction)
    });
}
