import { loadRunners } from '../run/load.js'
import { getRunners } from '../run/main.js'
import { getVersions } from '../run/versions.js'
import { loadTaskFile } from '../processes/load.js'

// Load iterations by launching each runner
export const loadIterations = async function({ taskPaths, runOpts, cwd }) {
  const allRunners = await loadRunners(runOpts)

  const promises = taskPaths.map(taskPath =>
    loadFiles({ taskPath, allRunners, cwd }),
  )
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()

  const versions = await getVersions(iterationsA)

  return { iterations: iterationsA, versions }
}

const loadFiles = async function({ taskPath, allRunners, cwd }) {
  const runners = getRunners(taskPath, allRunners)
  const promises = runners.map(runner => loadFile({ taskPath, runner, cwd }))
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}

const loadFile = async function({ taskPath, runner, cwd }) {
  const iterations = await loadTaskFile({ taskPath, runner, cwd })
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
