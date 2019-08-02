import { sortBy } from '../utils/sort.js'
import { addPrintedStats } from '../stats/printed.js'

import { getTasks, getParameters } from './group.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ benchmark: { iterations }, opts }) {
  const tasks = getTasks(iterations)
  const parameters = getParameters(iterations)

  const iterationsA = iterations.map(iteration =>
    addIterationInfo({ iteration, tasks, parameters }),
  )

  // The fastest tasks will be first, then the fastest iterations within each
  // task
  sortBy(iterationsA, ['task', 'stats.median'])

  const iterationsB = addPrintedStats(iterationsA)

  return { opts, tasks, parameters, iterations: iterationsB }
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
