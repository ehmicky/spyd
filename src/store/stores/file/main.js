import { getDir } from './config.js'
import { getResults, setResults } from './fs.js'

// Filesystem store. This is the default built-in store.
// Saves results to `dir/data.json`
const start = function (config) {
  return getDir(config)
}

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

const remove = async function (id, dir) {
  const results = await getResults(dir)
  const resultsA = results.filter((result) => result.id !== id)
  await setResults(dir, resultsA)
}

export const file = { start, list, add, replace, remove }
