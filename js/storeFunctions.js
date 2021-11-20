import {unique,log} from './utils.js'

export function storeFactory(storeProps) {
  const props = {};
  const privateData = { subscribe: {}, callBacks: {} };
  const keys = Object.keys(storeProps);
  keys.forEach((key) => {
    // replace initial values with object so getters and setters can work
    privateData[key] = { value: storeProps[key] };
    const p = privateData[key];
    p.hasGet = p.get;
    p.hasSet = p.set;
    p.get = propGet(key);
    p.set = propSet(key);
    // define getters/setters for each store property
    Object.defineProperty(props, key, { get: p.get, set: p.set });
    // setup system for subscribing, each property will have unique subscribers
    privateData.callBacks[key] = { subscribers: [] };
    privateData.subscribe[key] = (cb, userObj) => {
      const id = unique();
      const entry = [id, cb, userObj];
      privateData.callBacks[key].subscribers.push(entry);
      const unSubscribe = () => {
        const f = privateData.callBacks[key].subscribers.filter(
          ([eid]) => eid != id
        );
        privateData.callBacks[key].subscribers = f;
        return true;
      };
      return unSubscribe;
    };
  });
  // subscribe and _privateData will be readonly
  Object.defineProperty(props, "subscribe", {
    get: function (prop) {
      return privateData.subscribe;
    },
  });
  Object.defineProperty(props, "_privateData", {
    get: function (prop) {
      return privateData;
    },
  });
  return props;

  function propGet(prop) {
    return function () {
      const p = privateData[prop];
      return p.hasGet
        ? p.hasGet(privateData[prop].value)
        : privateData[prop].value;
    };
  }

  function propSet(prop) {
    return function (newVal) {
      const p = privateData[prop];
      const previous = p.get();
      const current = p.hasSet ? p.hasSet(newVal, previous) : newVal;
      privateData[prop].value = current;
      privateData.callBacks[prop].subscribers.forEach(([id, cb, userObj]) => {
        cb(current, previous, userObj);
      });
      return current;
    };
  }
}
