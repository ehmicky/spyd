import { loadRunners } from '../run/load.js'
import { getRunners } from '../run/main.js'
import { loadTaskFile } from '../processes/load.js'

// Load iterations by launching each runner
export const loadIterations = async function(taskPaths, runOpts) {
  const allRunners = await loadRunners(runOpts)

  const promises = taskPaths.map(taskPath => loadFiles(taskPath, allRunners))
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}

const loadFiles = async function(taskPath, allRunners) {
  const runners = getRunners(taskPath, allRunners)
  const promises = runners.map(runner => loadFile(taskPath, runner))
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}

const loadFile = async function(taskPath, runner) {
  const iterations = await loadTaskFile(taskPath, runner)
  return iterations.map(iteration =>
    normalizeIteration(iteration, runner, taskPath),
  )
}

const normalizeIteration = function(
  { taskId, taskTitle = taskId, variationId, variationTitle = variationId },
  { id: runnerId, title: runnerTitle = runnerId, ...runner },
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
    runner,
  }
}
