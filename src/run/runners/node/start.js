import { runMethod } from '../common/ipc.js'

import { benchmark } from './benchmark/main.js'
import { debugRun } from './debug.js'
import { loadBenchmarkFile } from './load/main.js'

// Communicate iterations ids and titles to parent
const load = async function ({ opts, taskPath }) {
  const iterations = await loadBenchmarkFile(taskPath, opts)
  const iterationsA = iterations.map(getIteration)
  return { iterations: iterationsA }
}

const getIteration = function ({ taskId, taskTitle, inputTitle, inputId }) {
  return { taskId, taskTitle, inputId, inputTitle }
}

// Run benchmarks
const run = async function ({
  opts,
  taskPath,
  taskId,
  inputId,
  repeat,
  maxDuration,
  dry,
}) {
  const { main, before, after, async } = await getTask({
    opts,
    taskPath,
    taskId,
    inputId,
    dry,
  })
  const { times, start } = await benchmark({
    main,
    before,
    after,
    async,
    repeat,
    maxDuration,
  })
  return { times, start }
}

const debug = async function ({ opts, taskPath, taskId, inputId }) {
  const { main, before, after } = await getTask({
    opts,
    taskPath,
    taskId,
    inputId,
  })
  await debugRun({ main, before, after })
  return {}
}

const getTask = async function ({ opts, taskPath, taskId, inputId, dry }) {
  const iterations = await loadBenchmarkFile(taskPath, opts)

  const { main, before, after, async } = iterations.find(
    (iteration) => iteration.taskId === taskId && iteration.inputId === inputId,
  )
  const [mainA, beforeA, afterA] = applyDry([main, before, after], dry)
  return { main: mainA, before: beforeA, after: afterA, async }
}

const applyDry = function (funcs, dry) {
  if (!dry) {
    return funcs
  }

  return funcs.map(applyDryFunc)
}

// Using `before` has a slight performance impact, so we keep it as `undefined`
// when `undefined`.
// We create separate functions for `before`, `main` and `after` so they are
// optimized separately
const applyDryFunc = function (value) {
  if (value === undefined) {
    return
  }

  // eslint-disable-next-line no-empty-function
  return function noop() {}
}

runMethod({ load, run, debug })
