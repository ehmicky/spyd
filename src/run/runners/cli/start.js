import { executeMethod } from '../common/ipc.js'

import { loadTasksFile } from './load/main.js'
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
const benchmark = async function ({
  taskPath,
  taskId,
  inputId,
  maxDuration,
  dry,
}) {
  const { main, before, after, variables, shell } = await getTask({
    taskPath,
    taskId,
    inputId,
    dry,
  })
  const { measures, start } = await measureTask({
    main,
    before,
    after,
    variables,
    shell,
    maxDuration,
  })
  return { measures, start }
}

const getTask = async function ({ taskPath, taskId, inputId, dry }) {
  const { combinations, shell } = await loadTasksFile(taskPath)

  const { main, before, after, variables } = combinations.find(
    (combination) =>
      combination.taskId === taskId && combination.inputId === inputId,
  )
  const [mainA, beforeA, afterA] = applyDry([main, before, after], dry)
  return { main: mainA, before: beforeA, after: afterA, variables, shell }
}

const applyDry = function (funcs, dry) {
  if (!dry) {
    return funcs
  }

  return funcs.map(applyDryFunc)
}

const applyDryFunc = function (value) {
  if (value === undefined) {
    return
  }

  return DRY_FUNC
}

const DRY_FUNC = 'true'

executeMethod({ load, benchmark })
