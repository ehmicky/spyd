import { getDir } from './config.js'
import { getResults, setResults } from './fs.js'

// Filesystem store. This is the default built-in store.
// Saves results to `dir/data.json`
const start = function (opts) {
  return getDir(opts)
}

// eslint-disable-next-line no-empty-function
const end = function () {}

const list = async function (dir) {
  const results = await getResults(dir)
  return results
}

const add = async function (result, dir) {
  const results = await getResults(dir)
  const resultsA = [...results, result]
  await setResults(dir, resultsA)
}

const replace = async function (results, dir) {
  await setResults(dir, results)
}

const remove = async function (ids, dir) {
  const results = await getResults(dir)
  const resultsA = results.filter(({ id }) => !ids.includes(id))
  await setResults(dir, resultsA)
}

export const file = { start, end, list, add, replace, remove }
