import { resolve } from 'path'

import { getRawResults, setRawResults } from './fs.js'

export const listRawResults = async function (cwd) {
  const dir = getDir(cwd)
  const rawResults = await getRawResults(dir)
  return rawResults
}

export const addRawResult = async function (rawResult, cwd) {
  const dir = getDir(cwd)
  const rawResults = await getRawResults(dir)
  const rawResultsA = [...rawResults, rawResult]
  await setRawResults(dir, rawResultsA)
}

export const removeRawResult = async function (id, cwd) {
  const dir = getDir(cwd)
  const rawResults = await getRawResults(dir)
  const rawResultsA = rawResults.filter((rawResult) => rawResult.id !== id)
  await setRawResults(dir, rawResultsA)
}

const getDir = function (cwd) {
  return resolve(cwd, DIR_LOCATION)
}

const DIR_LOCATION = 'benchmark'
