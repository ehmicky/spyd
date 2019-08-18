import uuidv4 from 'uuid/v4.js'

import { sortBy } from '../utils/sort.js'

import { getTasks, getVariations, getCommands } from './group.js'
import { addFastestIterations } from './fastest.js'
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

  const iterationsA = getIterations({ iterations, tasks, variations, commands })

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

// We only keep options that are relevant for reporting
const getOpts = function({ duration, run: runOpts }) {
  const durationA = Math.round(duration / NANOSECS_TO_SECS)
  const runOptsA = getRunOpts(runOpts)
  return { duration: durationA, ...runOptsA }
}

const NANOSECS_TO_SECS = 1e9

const getRunOpts = function(runOpts) {
  const runOptsA = Object.fromEntries(runOpts.filter(hasRunOpt).map(getRunOpt))

  if (Object.keys(runOptsA).length === 0) {
    return {}
  }

  return { runOpts: runOptsA }
}

const hasRunOpt = function({ opts }) {
  return Object.keys(opts).length !== 0
}

const getRunOpt = function({ name, opts }) {
  return [name, opts]
}

const getIterations = function({ iterations, tasks, variations, commands }) {
  const iterationsA = iterations.map(iteration =>
    addIterationInfo({ iteration, tasks, variations, commands }),
  )

  const iterationsB = addFastestIterations(iterationsA)

  // The fastest tasks will be first, then the fastest iterations within each
  // task (regardless of variants or runners)
  sortBy(iterationsB, ['task', 'stats.median'])
  return iterationsB
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
