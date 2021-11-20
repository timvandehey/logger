import { store, API_URL, dbName } from "./store.js";
import { log } from "./utils.js";

export const login = async () => server({ action: 'login' });
export const dbCreate = async (item) => server({ action: 'create', record: item })
export const dbRead = async (key = null) => server({ action: 'read', key })
export const dbUpdate = async (item) => server({ action: 'update', record: item })
export const dbDelete = async (item) => server({ action: 'delete', record: item })

const currentUser = () => store.user;

export async function server(payload) {
  const url = API_URL;
  payload.token = currentUser().idToken
  payload.dbName = dbName
  // log({ payload })
  const response = await fetch(url, {
    "method": "POST",
    "contentType": 'application/json',
    "body": JSON.stringify(payload)
  })
    .then(res => {
      // log({ res })
      return res
    })
    .then((res) => res.json())
    .catch((e) => {
      store.fatalError = JSON.stringify({ error: e.message, url, payload }, null, 2)
      throw e
    })
  if (response.error) {
    store.fatalError = JSON.stringify(response, null, 2)
    throw response.error
  }
  // log(response)
  return response;
}
