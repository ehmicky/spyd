import { loadRunners } from '../run/load.js'
import { getRunners } from '../run/main.js'
import { loadTaskFile } from '../processes/load.js'

// Load iterations by launching each runner
export const loadIterations = async function(taskPaths, runOpts, requireOpt) {
  const allRunners = await loadRunners(runOpts)

  const promises = taskPaths.map(taskPath =>
    loadFiles(taskPath, allRunners, requireOpt),
  )
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}

const loadFiles = async function(taskPath, allRunners, requireOpt) {
  const runners = getRunners(taskPath, allRunners)
  const promises = runners.map(runner =>
    loadFile({ taskPath, runner, requireOpt }),
  )
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}

const loadFile = async function({
  taskPath,
  runner,
  runner: { command },
  requireOpt,
}) {
  const iterations = await loadTaskFile({ taskPath, command, requireOpt })
  return iterations.map(iteration =>
    normalizeIteration(iteration, runner, taskPath),
  )
}

const normalizeIteration = function(
  { taskId, taskTitle = taskId, variationId, variationTitle = variationId },
  { id: runnerId, title: runnerTitle = runnerId, command },
  taskPath,
) {
  return {
    taskPath,
    taskId,
    taskTitle,
    variationId,
    variationTitle,
    runnerId,
    runnerTitle,
    command,
  }
}
