import uuidv4 from 'uuid/v4.js'

import { getOpts } from './options.js'
import { getTasks, getVariations, getCommands } from './group.js'
import { getSystem } from './system.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ iterations, opts, versions }) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()
  const optsA = getOpts(opts)
  const tasks = getTasks(iterations)
  const variations = getVariations(iterations)
  const commands = getCommands(iterations)
  const system = getSystem(versions)

  const iterationsA = iterations.map(iteration =>
    addIterationInfo({ iteration, tasks, variations, commands }),
  )

  return {
    id,
    timestamp,
    opts: optsA,
    tasks,
    variations,
    commands,
    system,
    iterations: iterationsA,
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
