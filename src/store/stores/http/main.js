import { getUrl } from './config.js'
import { fetchUrl } from './fetch.js'

// Filesystem store. This is the default built-in store.
// Saves results to `dir/data.json`
const start = function (opts) {
  return getUrl(opts)
}

// eslint-disable-next-line no-empty-function
const end = function () {}

// The server must return an empty array when there are no results
const list = async function (url) {
  const results = await fetchUrl({ method: 'GET', url })
  return results
}

const add = async function (result, url) {
  await fetchUrl({ method: 'POST', url, body: result, noResponse: true })
}

const remove = async function (ids, url) {
  await fetchUrl({
    method: 'DELETE',
    url,
    searchParams: { ids: ids.join(',') },
    noResponse: true,
  })
}

export const http = { start, end, list, add, remove }
