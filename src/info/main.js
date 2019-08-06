import { sortBy } from '../utils/sort.js'
import { addPrintedStats } from '../print/main.js'

import { getTasks, getVariations, getRunners } from './group.js'
import { addFastestIterations } from './fastest.js'
import { getSystem } from './system.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function(iterations, opts) {
  const tasks = getTasks(iterations)
  const variations = getVariations(iterations)
  const runners = getRunners(iterations)

  const iterationsA = iterations.map(iteration =>
    addIterationInfo({ iteration, tasks, variations, runners }),
  )

  const iterationsB = addFastestIterations(iterationsA)

  // The fastest tasks will be first, then the fastest iterations within each
  // task (regardless of variants or runners)
  sortBy(iterationsB, ['task', 'stats.median'])

  const iterationsC = addPrintedStats(iterationsB, opts)

  const system = getSystem()

  return { opts, tasks, variations, runners, iterations: iterationsC, system }
}

const addIterationInfo = function({
  iteration: { name, columnName, taskId, variationId, runnerId, stats },
  tasks,
  variations,
  runners,
}) {
  const taskA = tasks.findIndex(task => task.taskId === taskId)
  const variationA = variations.findIndex(
    variation => variation.variationId === variationId,
  )
  const runnerA = runners.findIndex(
    variation => variation.runnerId === runnerId,
  )
  return {
    name,
    columnName,
    task: taskA,
    variation: variationA,
    runner: runnerA,
    stats,
  }
}
