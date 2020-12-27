#!/usr/bin/env node
import { performRunner } from '../common/ipc.js'

import { measureTask } from './measure.js'
import { startTask } from './start/main.js'

// Communicate combination ids and titles to parent
const start = async function ({ taskPath }) {
  const { combinations } = await startTask(taskPath)
  const combinationsA = combinations.map(getCombination)
  return { combinations: combinationsA }
}

const getCombination = function ({ taskId, taskTitle, inputId, inputTitle }) {
  return { taskId, taskTitle, inputId, inputTitle }
}

// Compute measures
const measure = async function ({ taskPath, taskId, inputId, maxDuration }) {
  const { combinations, shell } = await startTask(taskPath)
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

performRunner({ start, measure })
