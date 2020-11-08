import { runMethod } from '../common/ipc.js'

import { benchmark } from './benchmark/main.js'
import { measure } from './benchmark/measure.js'
import { loadBenchmarkFile } from './load/main.js'

// Communicate iterations ids and titles to parent
const load = async function ({ taskPath }) {
  const { iterations } = await loadBenchmarkFile(taskPath)
  const iterationsA = iterations.map(getIteration)
  return { iterations: iterationsA }
}

const getIteration = function ({ taskId, taskTitle, inputId, inputTitle }) {
  return { taskId, taskTitle, inputId, inputTitle }
}

// Run benchmarks
const run = async function ({ taskPath, taskId, inputId, duration }) {
  const { main, before, after, variables, shell } = await getTask({
    taskPath,
    taskId,
    inputId,
  })
  const { times, count } = await benchmark({
    main,
    before,
    after,
    variables,
    shell,
    duration,
  })
  return { times, count }
}

// Run an iteration once without benchmarking it
const debug = async function ({ taskPath, taskId, inputId }) {
  const { main, before, after, variables, shell } = await getTask({
    taskPath,
    taskId,
    inputId,
    debug: true,
  })
  await measure({ main, before, after, variables, shell, debug: true })
  return {}
}

const getTask = async function ({
  taskPath,
  taskId,
  inputId,
  debug: debugOpt,
}) {
  const { iterations, shell } = await loadBenchmarkFile(taskPath, debugOpt)

  const { main, before, after, variables } = iterations.find(
    (iteration) => iteration.taskId === taskId && iteration.inputId === inputId,
  )
  return { main, before, after, variables, shell }
}

runMethod({ load, run, debug })
