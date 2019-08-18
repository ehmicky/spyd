import { loadRunners } from '../run/load.js'
import { padTitles } from '../print/titles.js'
import { addNames } from '../print/name.js'

import { getTaskPaths } from './path.js'
import { loadIterations } from './load.js'
import { selectIterations } from './select.js'
import { removeDuplicates } from './duplicate.js'

// Retrieve each iteration, i.e. combination of task + variation (if any)
export const getIterations = async function({
  files,
  duration,
  cwd,
  tasks: taskIds,
  variations: variationIds,
  run: runners,
  env,
}) {
  const taskPaths = await getTaskPaths(files, cwd)

  const { runners: runnersA, versions } = await loadRunners(runners, taskPaths)

  const iterationsB = await getAllIterations({
    taskPaths,
    runners: runnersA,
    duration,
    cwd,
    taskIds,
    variationIds,
  })

  const iterationsC = addEnv(iterationsB, env)
  const iterationsD = padTitles(iterationsC)
  const iterationsE = addNames(iterationsD)
  return { iterations: iterationsE, versions }
}

const getAllIterations = async function({
  taskPaths,
  runners,
  duration,
  cwd,
  taskIds,
  variationIds,
}) {
  const iterations = await loadIterations({ taskPaths, runners, duration, cwd })

  const iterationsA = removeDuplicates(iterations)
  const iterationsB = selectIterations({
    iterations: iterationsA,
    taskIds,
    variationIds,
  })

  if (iterationsB.length === 0) {
    throw new Error('No tasks to benchmark')
  }

  return iterationsB
}

const addEnv = function(iterations, env) {
  return iterations.map(iteration => ({
    ...iteration,
    envId: env,
    envTitle: env,
  }))
}
