import { findRunners } from '../run/find.js'
import { loadTaskFile } from '../processes/load.js'

// Load iterations by launching each runner
export const loadIterations = async function({
  taskPaths,
  runners,
  duration,
  cwd,
}) {
  const iterations = await Promise.all(
    taskPaths.map(taskPath =>
      getFilesIterations({ taskPath, runners, duration, cwd }),
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
}) {
  const runnersA = findRunners(taskPath, runners)
  const iterations = await Promise.all(
    runnersA.map(({ commands }) =>
      getFileIterations({ taskPath, commands, duration, cwd }),
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
}) {
  const iterations = await Promise.all(
    commands.map(command =>
      getCommandIterations({ taskPath, command, duration, cwd }),
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
}) {
  const iterations = await loadTaskFile({
    taskPath,
    commandValue,
    commandOpt,
    duration,
    cwd,
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
