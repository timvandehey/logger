import { log, trim, show, prod, dev } from "./utils.js";

let user = {};

const disableCookie = prod
const cookieName = "g_signin_response";
const client_id =
  "85671938027-9tjqlgm07qejltr1tpp4o016e12t9nn8.apps.googleusercontent.com";
const cookieTimeoutInMins = 30;

const cookieTimeoutInSec = cookieTimeoutInMins * 60;
const cookieTimeoutValue = cookieTimeoutInSec * 1000;

export function googleLogin(signinButtonWrapper) {
  return new Promise(function (resolve, reject) {
    const savedCredentials = getSigninResponse(document.cookie);
    if (savedCredentials) {
      handleCredentialResponse(savedCredentials);
      return;
    }
    signinButtonWrapper.style = "width:fit-content";
    const signinButton = document.createElement("span");
    signinButtonWrapper.appendChild(signinButton);
    google.accounts.id.initialize({
      client_id,
      callback: handleCredentialResponse
    });
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        google.accounts.id.renderButton(
          signinButton,
          signinButtonWrapper.dataset
        );
        show(signinButtonWrapper);
      }
    });

    function handleCredentialResponse(arg) {
      let user = {}
      try {
        user.idToken = arg.credential;
        user = {...user, ...parseJWT(user.idToken)};
        storeSigninCookie(arg, cookieTimeoutValue);
        resolve(user);
      } catch (e) {
        reject(e.message);
      }
    }
  });
}

function storeSigninCookie(value = "", expireMs = cookieTimeoutValue) {
  if (disableCookie) return
  const expire = new Date(Date.now() + expireMs);
  const valueJson = value ? JSON.stringify(value) : "";
  const cookie = `${cookieName}=${valueJson}; expires=${expire.toUTCString()}; path=/;`;
  document.cookie = cookie;
}

export function signout() {
  google.accounts.id.disableAutoSelect();
  storeSigninCookie(null, -1);
  window.location = "/";
}

function getSigninResponse(cookie) {
  if (disableCookie) return null
  const [, ans] = cookie
    .split(";")
    .map((str) => trim(str))
    .filter((e) => e.indexOf(`${cookieName}=`) != -1)
    .join("")
    .split("=");
  return ans ? JSON.parse(ans) : null;
}

export function parseJWT(token) {
  try {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    throw Error("Bad JWT");
  }
}
