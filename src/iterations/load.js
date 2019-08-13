import { findRunners } from '../run/find.js'
import { loadTaskFile } from '../processes/load.js'

// Load iterations by launching each runner
export const loadIterations = async function(taskPaths, runners, cwd) {
  const iterations = await Promise.all(
    taskPaths.map(taskPath => getFilesIterations(taskPath, runners, cwd)),
  )
  const iterationsA = iterations.flat()
  return iterationsA
}

const getFilesIterations = async function(taskPath, runners, cwd) {
  const runnersA = findRunners(taskPath, runners)
  const iterations = await Promise.all(
    runnersA.map(({ commands }) =>
      getFileIterations({ commands, taskPath, cwd }),
    ),
  )
  const iterationsA = iterations.flat()
  return iterationsA
}

const getFileIterations = async function({ taskPath, commands, cwd }) {
  const promises = commands.map(command =>
    getCommandIterations({ taskPath, command, cwd }),
  )
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}

const getCommandIterations = async function({
  taskPath,
  command,
  command: { commandValue, commandOpt },
  cwd,
}) {
  const iterations = await loadTaskFile({
    taskPath,
    commandValue,
    commandOpt,
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
