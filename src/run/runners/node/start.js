#!/usr/bin/env node
import { executeMethod } from '../common/ipc.js'

import { loadTasksFile } from './load/main.js'
import { measureTask } from './measure/main.js'

// Communicate combination ids and titles to parent
const load = async function ({ runConfig, taskPath }) {
  const combinations = await loadTasksFile(taskPath, runConfig)
  const combinationsA = combinations.map(getCombination)
  return { combinations: combinationsA }
}

const getCombination = function ({ taskId, taskTitle, inputTitle, inputId }) {
  return { taskId, taskTitle, inputId, inputTitle }
}

// Compute measures
const benchmark = async function ({
  runConfig,
  taskPath,
  taskId,
  inputId,
  repeat,
  maxDuration,
  empty,
}) {
  const combinations = await loadTasksFile(taskPath, runConfig)
  const { main, before, after, async } = combinations.find(
    (combination) =>
      combination.taskId === taskId && combination.inputId === inputId,
  )
  const { mainMeasures, emptyMeasures, start } = await measureTask({
    main,
    before,
    after,
    async,
    repeat,
    maxDuration,
    empty,
  })
  return { mainMeasures, emptyMeasures, start }
}

executeMethod({ load, benchmark })
