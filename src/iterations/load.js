import { findRunners } from '../run/find.js'
import { executeChild } from '../processes/execute.js'

import { validateIds } from './validate.js'

// Load iterations by launching each runner
// At startup we run child processes but do not run an benchmarks. We only
// retrieve the task files iterations
export const loadIterations = async function({
  taskPaths,
  runners,
  duration,
  cwd,
  debug,
}) {
  const iterations = await Promise.all(
    taskPaths.map(taskPath =>
      getFilesIterations({ taskPath, runners, duration, cwd, debug }),
    ),
  )
  const iterationsA = iterations.flat()
  return iterationsA
}

const getFilesIterations = async function({
  taskPath,
  runners,
  duration,
  cwd,
  debug,
}) {
  const runnersA = findRunners(taskPath, runners)
  const iterations = await Promise.all(
    runnersA.map(({ commands }) =>
      getFileIterations({ taskPath, commands, duration, cwd, debug }),
    ),
  )
  const iterationsA = iterations.flat()
  return iterationsA
}

const getFileIterations = async function({
  taskPath,
  commands,
  duration,
  cwd,
  debug,
}) {
  const iterations = await Promise.all(
    commands.map(command =>
      getCommandIterations({ taskPath, command, duration, cwd, debug }),
    ),
  )
  const iterationsA = iterations.flat()
  return iterationsA
}

const getCommandIterations = async function({
  taskPath,
  command,
  command: { commandValue, commandOpt },
  duration,
  cwd,
  debug,
}) {
  const input = { type: 'load', taskPath, opts: commandOpt }
  const type = debug ? 'loadDebug' : 'run'
  const { iterations } = await executeChild({
    commandValue,
    input,
    duration,
    cwd,
    type,
  })
  const iterationsA = iterations.map(iteration =>
    normalizeIteration(iteration, command, taskPath),
  )
  return iterationsA
}

const normalizeIteration = function(
  { taskId, taskTitle = taskId, variationId, variationTitle = variationId },
  { commandId, commandTitle, commandValue, commandOpt },
  taskPath,
) {
  validateIds({ taskId, variationId, commandId })

  return {
    taskPath,
    taskId,
    taskTitle,
    variationId,
    variationTitle,
    commandId,
    commandTitle,
    commandValue,
    commandOpt,
  }
}
