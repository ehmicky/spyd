import { executeChild } from '../processes/execute.js'

import { validateIds } from './validate.js'

// Load iterations by launching each command.
// At startup we run child processes but do not run an benchmarks. We only
// retrieve the task files iterations.
export const getCommandIterations = async function({
  taskPath,
  command,
  command: { commandValue, commandOpt },
  duration,
  cwd,
  debug,
  env,
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
    normalizeIteration(iteration, command, { taskPath, env }),
  )
  return iterationsA
}

const normalizeIteration = function(
  {
    taskId,
    taskTitle = taskId,
    variationId = '',
    variationTitle = variationId,
  },
  { commandId, commandTitle, commandValue, commandOpt },
  { taskPath, env },
) {
  const variationIdA = variationId.trim()

  validateIds({ taskId, variationId: variationIdA, commandId })

  return {
    taskPath,
    taskId,
    taskTitle,
    variationId: variationIdA,
    variationTitle,
    commandId,
    commandTitle,
    commandValue,
    commandOpt,
    envId: env,
    envTitle: env,
  }
}
