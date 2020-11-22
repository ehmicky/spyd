import { UserError } from '../error/main.js'
import { executeChild } from '../processes/main.js'

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
  const eventPayload = { type: 'load', taskPath, opts: commandOpt }
  const type = debug ? 'loadDebug' : 'loadRun'
  const { iterations } = await executeChild({
    commandSpawn,
    commandSpawnOptions,
    eventPayload,
    timeoutNs: duration,
    cwd,
    type,
  })

  if (iterations.length === 0) {
    throw new UserError(`File '${taskPath}' does not have any tasks to run`)
  }

  const iterationsA = iterations.map((iteration) =>
    normalizeIteration(iteration, command, { taskPath, system }),
  )
  return iterationsA
}

const normalizeIteration = function (
  { taskId, taskTitle = taskId, inputId = '', inputTitle = inputId },
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
  const inputIdA = inputId.trim()

  validateIds({ taskId, inputId: inputIdA, commandId, systemId })

  return {
    taskPath,
    taskId,
    taskTitle,
    inputId: inputIdA,
    inputTitle,
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
