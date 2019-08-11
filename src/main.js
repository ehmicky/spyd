import { getOpts } from './options/main.js'
import { report } from './report/main.js'
import { save } from './save/main.js'
import { remove } from './save/remove.js'
import { load } from './save/load.js'
import { runBenchmark } from './run.js'

// Benchmark JavaScript code defined in a tasks file and report the results.
const spyd = async function(opts) {
  const optsA = await getOpts(opts)

  if (optsA.remove !== undefined) {
    return removeAction(optsA)
  }

  if (optsA.show !== undefined) {
    return showAction(optsA)
  }

  return runAction(optsA)
}

// Action when the 'remove' option is used: remove a previous benchmark
const removeAction = async function(opts) {
  await remove(opts.remove, opts)
}

// Action when the 'show' option is used: show a previous benchmark
const showAction = async function(opts) {
  const benchmark = await load(opts.show, opts)

  await report(benchmark, opts)

  return benchmark
}

// Default action: run a new benchmark
const runAction = async function(opts) {
  const benchmark = await runBenchmark(opts)

  await Promise.all([report(benchmark, opts), save(benchmark, opts)])

  return benchmark
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = spyd
