import sortOn from 'sort-on'

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
    throw new Error(`Could not list previous benchmarks: ${error.message}`)
  }
}
