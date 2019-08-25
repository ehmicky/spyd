import { sortBy } from '../utils/sort.js'

// Call `store.list()`
export const listStore = async function({ store }) {
  const benchmarks = await callList(store)
  sortBy(benchmarks, ['timestamp'])
  return benchmarks
}

const callList = async function(store) {
  try {
    return await store.list()
  } catch (error) {
    throw new Error(`Could not list previous benchmarks: ${error.message}`)
  }
}
