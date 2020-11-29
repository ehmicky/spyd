import { executeMethod } from '../common/ipc.js'

import { loadTasksFile } from './load/main.js'
import { measureTask } from './measure.js'

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

  if (dry) {
    return { main: DRY_FUNC, variables: {}, shell }
  }

  const { main, before, after, variables } = combinations.find(
    (combination) =>
      combination.taskId === taskId && combination.inputId === inputId,
  )
  return { main, before, after, variables, shell }
}

const DRY_FUNC = 'true'

executeMethod({ load, benchmark })
