import { loadResults } from '../normalize/load.js'
import { applySince } from '../normalize/merge.js'

import { listResults } from './store.js'

// List all results and apply `since`.
// We try to apply `since` as soon as possible so user errors with that
// configuration property fail early.
export const listAll = async function (config) {
  const results = await listStore(config)
  const resultsA = await applySince(results, config)
  return resultsA
}

// List, sort, filter and normalize all results
// This is performed at the beginning of all commands because this allows:
//  - Failing fast if there is a problem with the store
//  - Including previous|diff in results preview
export const listStore = async function ({ cwd, include, exclude }) {
  const results = await listResults(cwd)
  const resultsA = loadResults({ results, include, exclude })
  return resultsA
}
