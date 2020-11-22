import now from 'precise-now'

import { UserError } from '../error/main.js'
import { executeChild } from '../processes/main.js'

import { validateIds } from './validate.js'

// Load combinations by launching each command.
// At startup we run child processes but do not measure yet.
// We only retrieve the tasks files combinations.
export const getCommandCombinations = async function ({
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

  const start = now()
  const { combinations } = await executeChild({
    commandSpawn,
    commandSpawnOptions,
    eventPayload,
    timeoutNs: duration,
    cwd,
    type,
  })
  const loadDuration = now() - start

  if (combinations.length === 0) {
    throw new UserError(`File '${taskPath}' does not have any tasks to run`)
  }

  const combinationsA = combinations.map((combination) =>
    normalizeCombination(combination, command, {
      taskPath,
      system,
      loadDuration,
    }),
  )
  return combinationsA
}

const normalizeCombination = function (
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
  { taskPath, system: { id: systemId, title: systemTitle }, loadDuration },
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
    loadDuration,
  }
}
