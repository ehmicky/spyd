#!/usr/bin/env node
import { startRunner } from '../common/ipc.js'

import { loadTasksFile } from './load/main.js'
import { measureTask } from './measure/main.js'

const load = async function ({ runConfig, taskPath, taskId, inputId }) {
  const combinations = await loadTasksFile(taskPath, runConfig)
  const { main, before, after, async } = combinations.find(
    (combination) =>
      combination.taskId === taskId && combination.inputId === inputId,
  )
  return { main, before, after, async }
}

const benchmark = async function (
  { repeat, maxLoops, empty },
  { main, before, after, async },
) {
  const { mainMeasures, emptyMeasures } = await measureTask({
    main,
    before,
    after,
    async,
    repeat,
    maxLoops,
    empty,
  })
  return { mainMeasures, emptyMeasures }
}

startRunner({ load, benchmark })
