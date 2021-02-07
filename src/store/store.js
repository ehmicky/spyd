import { resolve } from 'path'

import { getResults, setResults } from './fs.js'

export const listResults = async function (cwd) {
  const dir = getDir(cwd)
  const results = await getResults(dir)
  return results
}

export const addResult = async function (result, cwd) {
  const dir = getDir(cwd)
  const results = await getResults(dir)
  const resultsA = [...results, result]
  await setResults(dir, resultsA)
}

export const removeResult = async function (id, cwd) {
  const dir = getDir(cwd)
  const results = await getResults(dir)
  const resultsA = results.filter((result) => result.id !== id)
  await setResults(dir, resultsA)
}

const getDir = function (cwd) {
  return resolve(cwd, DIR_LOCATION)
}

const DIR_LOCATION = 'benchmark'
