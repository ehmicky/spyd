import { loadRunners } from '../run/load.js'
import { findRunners } from '../run/find.js'
import { loadTaskFile } from '../processes/load.js'

// Load iterations by launching each runner
export const loadIterations = async function(taskPaths, runOpts, cwd) {
  const { runners, versions } = await loadRunners(runOpts, taskPaths)

  const iterations = await Promise.all(
    taskPaths.map(taskPath => getFileIterations(taskPath, runners, cwd)),
  )
  const iterationsA = iterations.flat()

  return { iterations: iterationsA, versions }
}

const getFileIterations = async function(taskPath, runners, cwd) {
  const runnersA = findRunners(taskPath, runners)
  const iterations = await Promise.all(
    runnersA.map(({ commands }) =>
      loadFileIterations({ commands, taskPath, cwd }),
    ),
  )
  const iterationsA = iterations.flat()
  return iterationsA
}

const loadFileIterations = async function({ taskPath, commands, cwd }) {
  const promises = commands.map(command =>
    loadCommandIterations({ taskPath, command, cwd }),
  )
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}

const loadCommandIterations = async function({
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
  return iterations.map(iteration =>
    normalizeIteration(iteration, command, taskPath),
  )
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
