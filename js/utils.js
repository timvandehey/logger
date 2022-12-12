export const queryParams = getQueryParams()

const { hostname, pathname } = window.location
let checkDev = ["localhost", "vanilladatatest.web.app"]
  .includes(hostname)
let checkProd =
  !!queryParams.prod || pathname.includes('prod')
checkProd = checkProd || !checkDev


export const prod = checkProd
export const dev = !prod;

import { store } from "./store.js";

function LoggerFactory() {
  let logs = [];
  const pad = (n, num = 2) => String(n).padStart(num, "0");
  const getTime = () => {
    const d = new Date();
    const h = pad(d.getHours());
    const m = pad(d.getMinutes());
    const s = pad(d.getSeconds());
    const ms = pad(d.getMilliseconds(), 3);
    return `${h}:${m}:${s}:${ms} `;
  };
  const logElement = document.getElementById("debuglog");
  const log = (summary = "", ...details) => {
    const l = details.length;
    if (l == 0) details = summary;
    if (l == 1) details = details[0];
    const event = { time: getTime(), summary, details };
    logs = [...logs, event];
  };
  const updateDebugLog = () => {
    if (store.debug && logElement) {
      const detailList = logs.map(({ time, summary, details }) => {
        const detailsJson = JSON.stringify(details, null, 2)
        const safeDetails = detailsJson
          ? detailsJson
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
          : ''
        return `<details><summary>[${time}] ${summary}</summary>
                <pre>${safeDetails}</pre></details>`;
      });
      // console.log({detailList})
      logElement.innerHTML = detailList.join("<br/>");
    }
  };
  return { log, updateDebugLog };
}

const Logger = LoggerFactory();


export function log(...args) {
  let s1;
  if (store.debug) {
    const sampleSize = 100;
    const sampleJSON = JSON.stringify([...args]);
    s1 = sampleJSON;
    let s2 = "";
    let css = "";
    if (sampleJSON.length > sampleSize) {
      s1 = sampleJSON.slice(0, sampleSize);
      s2 = " %c ...more ";
      css = "color:white;background:green;font-size:.8em;";
    }
    console.groupCollapsed(s1 + s2, css);
    console.log.apply(null, args);
    console.groupCollapsed("   ...log trace HERE collapsed");
    console.trace();
    console.groupEnd();
    console.groupEnd();
  }
  Logger.log.apply(null, [s1, ...args]);
  Logger.updateDebugLog();
}


// export function getStoreValue(storeVar) {
//   let store_value;
//   const unsubscribe = storeVar.subscribe((value) => {
//     store_value = value;
//   });
//   unsubscribe();
//   return store_value;
// }

export function trim(stringToTrim) {
  return stringToTrim.replace(/^\s+|\s+$/g, "");
}

export function debounced(delay, fn) {
  let timerId;
  let saveArgs
  return function (...args) {
    saveArgs = args
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn.apply(null, saveArgs);
      timerId = null;
    }, delay);
  };
}

export function throttled(delay, fn) {
  let timerId
  let saveArgs
  return function (...args) {
    saveArgs = args
    if (timerId) {
      return
    }
    timerId = setTimeout(function () {
      fn.apply(null, saveArgs)
      timerId = null;
    }, delay)
  }
}

export const hide = (el) => { if (el) el.hidden = true }
export const show = (el) => { if (el) el.hidden = false }

export const isArray = (arg) => toRawType(arg) === "Array";
export const isObject = (arg) => toRawType(arg) === "Object";
export const isString = (arg) => toRawType(arg) === "String";
export const isElement = (arg) => arg instanceof window.Element;
export const isFunction = (arg) => toRawType(arg) === "Function";

export const clearElement = (el) => {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
};
// export const createMenuAndHomeItem = (tab) => {
//   const el = document.createElement(tab.navComponent);
//   el.setAttribute("data-tabId", tab.id);
//   return el;
// };

function toRawType(value) {
  let _toString = Object.prototype.toString;
  let str = _toString.call(value);
  return str.slice(8, -1);
}

export function daysDiff(StartDate, EndDate) {
  return (Date.UTC(EndDate.getFullYear(), EndDate.getMonth(), EndDate.getDate()) -
    Date.UTC(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate())) / 86400000;
}

export function getDate(dt = new Date()) {
  const d = new Date(dt)
  const hour = d.getHours()
  const dows = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const local = d.toLocaleString().replace(',', '')
  const [date, ...rest] = local.split(' ')
  const time = rest.join('')
  const ret = {
    hour
    , azHour: d.getTimezoneOffset() == 300 ? hour - 2 : hour - 1
    , minute: d.getMinutes()
    , second: d.getSeconds()
    , local
    , date
    , time
    , rest
    , az: d.toLocaleString('en-US', { timeZone: 'America/Phoenix' }).replace(',', '')
    , intl: getIntlInfo(d)
    , month: d.getMonth()
    , day: d.getDay()
    , year: d.getYear() + 1900
    , dow: dows[d.getDay()].substring(0, 3)
    , dowLong: dows[d.getDay()]
    // ,time: String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0')
    , getTime: d.getTime()
  }
  // const {minute,second} = ret
  // log({hour,minute,second})
  return ret
}

export function getIntlInfo(date) {
  // request a weekday along with a long date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  options.timeZone = 'America/Chicago'
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

// export function getDate() {
//   const d = new Date();
//   const ret = {
//     hour: d.getHours(),
//     minutes: d.getMinutes(),
//     seconds: d.getSeconds(),
//     local: d.toLocaleString(),
//     month: d.getMonth(),
//     day: d.getDay(),
//     dow: d.toString().slice(0, 3),
//   };
//   return ret;
// }

export function sequenceGenerator(start = 1, preString = "S") {
  function* sequenceGenerator(start) {
    let num = start;
    while (true) {
      yield num++;
    }
  }

  const sequenceNumbers = sequenceGenerator(start);
  const sequenceInt = () => sequenceNumbers.next().value;
  const sequenceStr = () => `${preString}${sequenceInt()}`;
  return preString ? sequenceStr : sequenceInt;
}

export function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const unique = sequenceGenerator();

export const upper = (txt) => {
  const [f, ...rest] = txt.split("");
  const result = `${f.toUpperCase()}${rest.join("")}`;
  log({ f, rest, result });
  return result;
};

export function loadServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => {
          console.log('Service worker registered.', reg);
        });
    });
  }
}


export function setBodyBackgroundImg(text = 'dev', size = 48) {
  var canvas = document.createElement("canvas");
  var fontSize = size;
  canvas.setAttribute('height', fontSize + size / 4)
  canvas.setAttribute('width', `${fontSize / 1.5 * text.length}px`)
  var context = canvas.getContext('2d');
  context.fillStyle = 'rgba(0,0,0,0.06)';
  context.font = fontSize + 'px sans-serif';
  context.fillText(text, 0, fontSize);
  const img = canvas.toDataURL("image/png")
  document.body.style.backgroundImage = `url(${img})`
  return
}

export function getQueryParams(url = window.location) {
  let qParams = {};
  let anchor = document.createElement('a');
  anchor.href = url;
  let qStrings = anchor.search.substring(1);
  let params = qStrings.split('&');
  for (let i = 0; i < params.length; i++) {
    let pair = params[i].split('=');
    qParams[pair[0]] = decodeURIComponent(pair[1]);
  }
  return qParams;
};


// export function logOld(...args) {
//   let s1;
//   if (dev) {
//     const sampleSize = 100;
//     // let sampleJSON
//     const sampleJSON = args[0].toString(); //JSON.stringify([...args])
//     let first = args[0];
//     if (Array.isArray(first)) first = first[0];
//     s1 = first.toString();
//     if (s1 == "[object Object]") {
//       if (Array.isArray(first)) s1 = JSON.stringify(first[0]);
//       s1 = JSON.stringify(first);
//     }
//     let s2 = "";
//     let css = "";
//     if (s1.length > sampleSize) {
//       s1 = s1.slice(0, sampleSize);
//       s2 = " %c ...more ";
//       css = "color:white;background:green;font-size:.8em;";
//     }
//     console.groupCollapsed(s1 + s2, css);
//     console.log.apply(null, args);
//     console.groupCollapsed("   ...log trace HERE collapsed");
//     console.trace();
//     console.groupEnd();
//     console.groupEnd();
//   }
//   Logger.log.apply(null, [s1, ...args]);
//   Logger.updateDebugLog();
// }
