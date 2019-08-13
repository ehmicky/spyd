import { sortBy } from '../utils/sort.js'
import { getPrintedInfo } from '../print/main.js'

import { getTasks, getVariations, getCommands } from './group.js'
import { addFastestIterations } from './fastest.js'
import { getSystem } from './system.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ iterations, opts, versions }) {
  const tasks = getTasks(iterations)
  const variations = getVariations(iterations)
  const commands = getCommands(iterations)

  const iterationsA = iterations.map(iteration =>
    addIterationInfo({ iteration, tasks, variations, commands }),
  )

  const iterationsB = addFastestIterations(iterationsA)

  // The fastest tasks will be first, then the fastest iterations within each
  // task (regardless of variants or runners)
  sortBy(iterationsB, ['task', 'stats.median'])

  const system = getSystem(versions)

  const { iterations: iterationsC, printedSystem } = getPrintedInfo(
    iterationsB,
    system,
    opts,
  )

  const timestamp = new Date().toISOString()

  return {
    timestamp,
    opts,
    tasks,
    variations,
    commands,
    iterations: iterationsC,
    system,
    printedSystem,
  }
}

const addIterationInfo = function({
  iteration: { name, columnName, taskId, variationId, commandId, stats },
  tasks,
  variations,
  commands,
}) {
  const taskA = tasks.findIndex(task => task.taskId === taskId)
  const variationA = variations.findIndex(
    variation => variation.variationId === variationId,
  )
  const commandA = commands.findIndex(
    variation => variation.commandId === commandId,
  )
  return {
    name,
    columnName,
    task: taskA,
    variation: variationA,
    command: commandA,
    stats,
  }
}
