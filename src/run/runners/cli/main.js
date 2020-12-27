#!/usr/bin/env node
import { performRunner } from '../common/ipc.js'

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
const measure = async function ({ taskPath, taskId, inputId, maxDuration }) {
  const { combinations, shell } = await loadTasksFile(taskPath)
  const { main, beforeEach, afterEach, variables } = combinations.find(
    (combination) =>
      combination.taskId === taskId && combination.inputId === inputId,
  )
  const { mainMeasures } = await measureTask({
    main,
    beforeEach,
    afterEach,
    variables,
    shell,
    maxDuration,
  })
  return { mainMeasures }
}

performRunner({ load, measure })
