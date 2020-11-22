import { executeMethod } from '../common/ipc.js'

import { debugRun } from './debug.js'
import { loadTasksFile } from './load/main.js'
import { measureTask } from './measure/main.js'

// Communicate combination ids and titles to parent
const load = async function ({ opts, taskPath }) {
  const combinations = await loadTasksFile(taskPath, opts)
  const combinationsA = combinations.map(getCombination)
  return { combinations: combinationsA }
}

const getCombination = function ({ taskId, taskTitle, inputTitle, inputId }) {
  return { taskId, taskTitle, inputId, inputTitle }
}

// Compute measures
const run = async function ({
  opts,
  taskPath,
  taskId,
  inputId,
  repeat,
  maxDuration,
  dry,
}) {
  const { main, before, after, async } = await getTask({
    opts,
    taskPath,
    taskId,
    inputId,
    dry,
  })
  const { measures, start } = await measureTask({
    main,
    before,
    after,
    async,
    repeat,
    maxDuration,
  })
  return { measures, start }
}

const debug = async function ({ opts, taskPath, taskId, inputId }) {
  const { main, before, after } = await getTask({
    opts,
    taskPath,
    taskId,
    inputId,
  })
  await debugRun({ main, before, after })
  return {}
}

const getTask = async function ({ opts, taskPath, taskId, inputId, dry }) {
  const combinations = await loadTasksFile(taskPath, opts)

  const { main, before, after, async } = combinations.find(
    (combination) =>
      combination.taskId === taskId && combination.inputId === inputId,
  )
  const [mainA, beforeA, afterA] = applyDry([main, before, after], dry)
  return { main: mainA, before: beforeA, after: afterA, async }
}

const applyDry = function (funcs, dry) {
  if (!dry) {
    return funcs
  }

  return funcs.map(applyDryFunc)
}

// Using `before` has a slight performance impact, so we keep it as `undefined`
// when `undefined`.
// We create separate functions for `before`, `main` and `after` so they are
// optimized separately
const applyDryFunc = function (value) {
  if (value === undefined) {
    return
  }

  // eslint-disable-next-line no-empty-function
  return function noop() {}
}

executeMethod({ load, run, debug })
