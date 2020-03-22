import { sortBy } from '../utils/sort.js'

// Call `store.list()`
export const listStore = async function ({ store }) {
  const rawBenchmarks = await callList(store)
  sortBy(rawBenchmarks, ['timestamp'])
  return rawBenchmarks
}

const callList = async function (store) {
  try {
    return await store.list()
  } catch (error) {
    throw new Error(`Could not list previous benchmarks: ${error.message}`)
  }
}
