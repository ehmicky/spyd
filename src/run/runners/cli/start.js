import { exit } from 'process'

import { getInput, sendOutput, sendError } from '../common/ipc.js'

import { benchmark } from './benchmark/main.js'
import { loadBenchmarkFile } from './load/main.js'
import { measure } from './benchmark/measure.js'

// Child process entry point
const start = async function () {
  try {
    const { type, ...input } = getInput()
    const typeFunc = TYPES[type]
    const output = await typeFunc(input)
    await sendOutput(output)
  } catch (error) {
    await sendError(error)
    exit(1)
  }
}

// Communicate iterations ids and titles to parent
const load = async function ({ taskPath }) {
  const { iterations } = await loadBenchmarkFile(taskPath)
  const iterationsA = iterations.map(getIteration)
  return { iterations: iterationsA }
}

const getIteration = function ({
  taskId,
  taskTitle,
  variationId,
  variationTitle,
}) {
  return { taskId, taskTitle, variationId, variationTitle }
}

// Run benchmarks
const run = async function ({ taskPath, taskId, variationId, duration }) {
  const { main, before, after, variables, shell } = await getTask({
    taskPath,
    taskId,
    variationId,
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
const debug = async function ({ taskPath, taskId, variationId }) {
  const { main, before, after, variables, shell } = await getTask({
    taskPath,
    taskId,
    variationId,
    debug: true,
  })
  await measure({ main, before, after, variables, shell, debug: true })
}

const getTask = async function ({
  taskPath,
  taskId,
  variationId,
  debug: debugOpt,
}) {
  const { iterations, shell } = await loadBenchmarkFile(taskPath, debugOpt)

  const { main, before, after, variables } = iterations.find(
    (iteration) =>
      iteration.taskId === taskId && iteration.variationId === variationId,
  )
  return { main, before, after, variables, shell }
}

const TYPES = { load, run, debug }

start()
