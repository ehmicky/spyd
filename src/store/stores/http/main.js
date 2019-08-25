import { getUrl } from './options.js'
import { fetchUrl } from './fetch.js'

// Filesystem store. This is the default built-in store.
// Saves benchmarks to `dir/data.json`
const init = function(opts) {
  return getUrl(opts)
}

// eslint-disable-next-line no-empty-function
const destroy = function() {}

// The server must return an empty array when there are no benchmarks
const list = async function(url) {
  const benchmarks = await fetchUrl('GET', url)
  return benchmarks
}

const add = async function(benchmark, url) {
  await fetchUrl('POST', url, benchmark)
}

const remove = async function(ids, url) {
  await fetchUrl('DELETE', `${url}?ids=${ids.join(',')}`)
}

export const http = { init, destroy, list, add, remove }
