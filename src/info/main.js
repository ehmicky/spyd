import { sortBy } from '../utils/sort.js'
import { addPrintedStats } from '../print/main.js'

import { getTasks, getVariations } from './group.js'
import { addFastestIterations } from './fastest.js'
import { getSystem } from './system.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function(iterations, opts) {
  const tasks = getTasks(iterations)
  const variations = getVariations(iterations)

  const iterationsA = iterations.map(iteration =>
    addIterationInfo({ iteration, tasks, variations }),
  )

  const iterationsB = addFastestIterations(iterationsA)

  // The fastest tasks will be first, then the fastest iterations within each
  // task
  sortBy(iterationsB, ['task', 'stats.median'])

  const iterationsC = addPrintedStats(iterationsB, opts)

  const system = getSystem()

  return { opts, tasks, variations, iterations: iterationsC, system }
}

const addIterationInfo = function({
  iteration: { name, taskId, variationId, stats },
  tasks,
  variations,
}) {
  const taskA = tasks.findIndex(task => task.taskId === taskId)
  const variationA = variations.findIndex(
    variation => variation.variationId === variationId,
  )
  return { name, task: taskA, variation: variationA, stats }
}
