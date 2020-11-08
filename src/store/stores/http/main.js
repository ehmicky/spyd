import { fetchUrl } from './fetch.js'
import { getUrl } from './options.js'

// Filesystem store. This is the default built-in store.
// Saves benchmarks to `dir/data.json`
const start = function (opts) {
  return getUrl(opts)
}

// eslint-disable-next-line no-empty-function
const destroy = function () {}

// The server must return an empty array when there are no benchmarks
const list = async function (url) {
  const benchmarks = await fetchUrl({ method: 'GET', url })
  return benchmarks
}

const add = async function (benchmark, url) {
  await fetchUrl({ method: 'POST', url, body: benchmark, noResponse: true })
}

const replace = async function (benchmarks, url) {
  await fetchUrl({ method: 'PUT', url, body: benchmarks, noResponse: true })
}

const remove = async function (ids, url) {
  await fetchUrl({
    method: 'DELETE',
    url,
    searchParams: { ids: ids.join(',') },
    noResponse: true,
  })
}

export const http = { start, destroy, list, add, replace, remove }
