import { runMethod } from '../common/ipc.js'

import { benchmark } from './benchmark/main.js'
import { measure } from './benchmark/measure.js'
import { loadTasksFile } from './load/main.js'

// Communicate combination ids and titles to parent
const load = async function ({ taskPath }) {
  const { combinations } = await loadTasksFile(taskPath)
  const combinationsA = combinations.map(getCombination)
  return { combinations: combinationsA }
}

const getCombination = function ({ taskId, taskTitle, inputId, inputTitle }) {
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

// Run a combination once without benchmarking it
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
  const { combinations, shell } = await loadTasksFile(taskPath, debugOpt)

  const { main, before, after, variables } = combinations.find(
    (combination) =>
      combination.taskId === taskId && combination.inputId === inputId,
  )
  return { main, before, after, variables, shell }
}

runMethod({ load, run, debug })
