import { getBenchmarks, setBenchmarks } from './fs.js'
import { getDir } from './options.js'

// Filesystem store. This is the default built-in store.
// Saves benchmarks to `dir/data.json`
const start = function (opts) {
  return getDir(opts)
}

// eslint-disable-next-line no-empty-function
const end = function () {}

const list = async function (dir) {
  const benchmarks = await getBenchmarks(dir)
  return benchmarks
}

const add = async function (benchmark, dir) {
  const benchmarks = await getBenchmarks(dir)
  const benchmarksA = [...benchmarks, benchmark]
  await setBenchmarks(dir, benchmarksA)
}

const replace = async function (benchmarks, dir) {
  await setBenchmarks(dir, benchmarks)
}

const remove = async function (ids, dir) {
  const benchmarks = await getBenchmarks(dir)
  const benchmarksA = benchmarks.filter(({ id }) => !ids.includes(id))
  await setBenchmarks(dir, benchmarksA)
}

export const file = { start, end, list, add, replace, remove }
