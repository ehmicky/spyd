#!/usr/bin/env node
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
const benchmark = async function ({ taskPath, taskId, inputId, maxDuration }) {
  const { combinations, shell } = await loadTasksFile(taskPath)
  const { main, before, after, variables } = combinations.find(
    (combination) =>
      combination.taskId === taskId && combination.inputId === inputId,
  )
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

executeMethod({ load, benchmark })
