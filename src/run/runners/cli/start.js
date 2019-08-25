import { exit } from 'process'

import { benchmark } from './benchmark/main.js'
import { loadTaskFile } from './load/main.js'
import { getInput, sendOutput, sendError } from './ipc.js'
import { measure } from './benchmark/measure.js'

// Child process entry point
const start = async function() {
  try {
    const { type, ...input } = getInput()
    const output = await TYPES[type](input)
    await sendOutput(output)
  } catch (error) {
    await sendError(error)
    exit(1)
  }
}

// Communicate iterations ids and titles to parent
const load = async function({ taskPath }) {
  const { iterations } = await loadTaskFile(taskPath)
  const iterationsA = iterations.map(getIteration)
  return { iterations: iterationsA }
}

const getIteration = function({
  taskId,
  taskTitle,
  variationId,
  variationTitle,
}) {
  return { taskId, taskTitle, variationId, variationTitle }
}

// Run benchmarks
const run = async function({ taskPath, taskId, variationId, duration }) {
  const stdio = 'ignore'
  const { main, before, after, variables, shell } = await getTask({
    taskPath,
    taskId,
    variationId,
    stdio,
  })
  const { times, count } = await benchmark({
    main,
    before,
    after,
    variables,
    shell,
    stdio,
    duration,
  })
  return { times, count }
}

// Run an iteration once without benchmarking it
const debug = async function({ taskPath, taskId, variationId }) {
  const stdio = 'inherit'
  const { main, before, after, variables, shell } = await getTask({
    taskPath,
    taskId,
    variationId,
    stdio,
  })
  await measure({ main, before, after, variables, shell, stdio })
}

const getTask = async function({ taskPath, taskId, variationId, stdio }) {
  const { iterations, shell } = await loadTaskFile(taskPath, stdio)

  const { main, before, after, variables } = iterations.find(
    iteration =>
      iteration.taskId === taskId && iteration.variationId === variationId,
  )
  return { main, before, after, variables, shell }
}

const TYPES = { load, run, debug }

start()
