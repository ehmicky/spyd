import { runMethod } from '../common/ipc.js'

import { benchmark } from './benchmark/main.js'
import { debugRun } from './debug.js'
import { loadBenchmarkFile } from './load/main.js'

// Communicate iterations ids and titles to parent
const load = async function ({ taskPath, opts }) {
  const iterations = await loadBenchmarkFile(taskPath, opts)
  const iterationsA = iterations.map(getIteration)
  return { iterations: iterationsA }
}

const getIteration = function ({ taskId, taskTitle, inputTitle, inputId }) {
  return { taskId, taskTitle, inputId, inputTitle }
}

// Run benchmarks
const run = async function ({
  taskPath,
  opts,
  taskId,
  inputId,
  repeat,
  maxDuration,
  maxTimes,
}) {
  const { main, before, after, async } = await getTask({
    taskPath,
    opts,
    taskId,
    inputId,
  })
  const times = await benchmark({
    main,
    before,
    after,
    async,
    repeat,
    maxDuration,
    maxTimes,
  })
  return { times }
}

const debug = async function ({ taskPath, opts, taskId, inputId }) {
  const { main, before, after } = await getTask({
    taskPath,
    opts,
    taskId,
    inputId,
  })
  await debugRun({ main, before, after })
  return {}
}

const getTask = async function ({ taskPath, opts, taskId, inputId }) {
  if (taskPath === undefined) {
    return { main: noop, async: false }
  }

  const iterations = await loadBenchmarkFile(taskPath, opts)

  const { main, before, after, async } = iterations.find(
    (iteration) => iteration.taskId === taskId && iteration.inputId === inputId,
  )
  return { main, before, after, async }
}

// eslint-disable-next-line no-empty-function
const noop = function () {}

runMethod({ load, run, debug })
