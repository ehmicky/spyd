import { runMethod } from '../common/ipc.js'

import { loadTasksFile } from './load/main.js'
import { measure } from './measure/loop.js'
import { measureTask } from './measure/main.js'

// Communicate combination ids and titles to parent
const load = async function ({ taskPath }) {
  const { combinations } = await loadTasksFile(taskPath)
  const combinationsA = combinations.map(getCombination)
  return { combinations: combinationsA }
}

const getCombination = function ({ taskId, taskTitle, inputId, inputTitle }) {
  return { taskId, taskTitle, inputId, inputTitle }
}

// Compute measures
const run = async function ({ taskPath, taskId, inputId, duration }) {
  const { main, before, after, variables, shell } = await getTask({
    taskPath,
    taskId,
    inputId,
  })
  const { times, count } = await measureTask({
    main,
    before,
    after,
    variables,
    shell,
    duration,
  })
  return { times, count }
}

// Run a combination once without measuring it
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
