import sortOn from 'sort-on'

import { UserError } from '../error/main.js'

// Call `store.list()`
export const listStore = async function ({ store }) {
  const rawBenchmarks = await callList(store)
  const rawBenchmarksA = sortOn(rawBenchmarks, 'timestamp')
  return rawBenchmarksA
}

const callList = async function (store) {
  try {
    return await store.list()
  } catch (error) {
    throw new UserError(`Could not list previous benchmarks: ${error.message}`)
  }
}
