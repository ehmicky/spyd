import { sortBy } from '../utils/sort.js'
import { addPrintedStats } from '../stats/print/main.js'

import { getTasks, getParameters } from './group.js'
import { addFastestIterations } from './fastest.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ benchmark: { iterations }, opts }) {
  const tasks = getTasks(iterations)
  const parameters = getParameters(iterations)

  const iterationsA = iterations.map(iteration =>
    addIterationInfo({ iteration, tasks, parameters }),
  )

  const iterationsB = addFastestIterations(iterationsA)

  // The fastest tasks will be first, then the fastest iterations within each
  // task
  sortBy(iterationsB, ['task', 'stats.median'])

  const iterationsC = addPrintedStats(iterationsB)

  return { opts, tasks, parameters, iterations: iterationsC }
}

const addIterationInfo = function({
  iteration: { name, taskId, parameter, stats },
  tasks,
  parameters,
}) {
  const taskA = tasks.findIndex(task => task.taskId === taskId)
  const parameterA = parameters.findIndex(task => task.parameter === parameter)
  return { name, task: taskA, parameter: parameterA, stats }
}
