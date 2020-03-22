import { executeChild } from '../processes/execute.js'

import { validateIds } from './validate.js'

// Load iterations by launching each command.
// At startup we run child processes but do not run an benchmarks. We only
// retrieve the benchmark files iterations.
export const getCommandIterations = async function ({
  taskPath,
  command,
  command: { commandSpawn, commandSpawnOptions, commandOpt },
  duration,
  cwd,
  debug,
  system,
}) {
  const input = { type: 'load', taskPath, opts: commandOpt }
  const type = debug ? 'loadDebug' : 'run'
  const { iterations } = await executeChild({
    commandSpawn,
    commandSpawnOptions,
    input,
    duration,
    cwd,
    type,
  })

  if (iterations.length === 0) {
    throw new Error(`File '${taskPath}' does not have any tasks to run`)
  }

  const iterationsA = iterations.map((iteration) =>
    normalizeIteration(iteration, command, { taskPath, system }),
  )
  return iterationsA
}

const normalizeIteration = function (
  {
    taskId,
    taskTitle = taskId,
    variationId = '',
    variationTitle = variationId,
  },
  {
    commandRunner,
    commandId,
    commandTitle,
    commandDescription,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
  },
  { taskPath, system: { id: systemId, title: systemTitle } },
) {
  const variationIdA = variationId.trim()

  validateIds({ taskId, variationId: variationIdA, commandId, systemId })

  return {
    taskPath,
    taskId,
    taskTitle,
    variationId: variationIdA,
    variationTitle,
    commandRunner,
    commandId,
    commandTitle,
    commandDescription,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    systemId,
    systemTitle,
  }
}
