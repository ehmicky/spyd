import { getTaskPath } from './path.js'
import { loadTaskFile } from './load.js'

// Retrieve each iteration, i.e. combination of task + parameter (if any)
export const getIterations = async function({
  file,
  cwd,
  duration,
  requireOpt,
}) {
  const taskPath = await getTaskPath(file, cwd)
  const tasks = await loadTaskFile({ taskPath, requireOpt })
  const iterations = tasks
    .flatMap(getIteration)
    .map(iteration => ({ ...iteration, taskPath, duration, requireOpt }))
  const iterationsA = addNames(iterations)
  return iterationsA
}

const getIteration = function({ taskId, title, parameters }) {
  if (parameters === undefined) {
    return [{ taskId, title }]
  }

  return Object.keys(parameters).map(parameter => ({
    taskId,
    title,
    parameter,
  }))
}

const addNames = function(iterations) {
  const iterationsA = iterations.map(addName)
  const iterationsB = addNamePaddings(iterationsA)
  return iterationsB
}

const addName = function({ title, parameter, ...iteration }) {
  const name = getName(title, parameter)
  return { ...iteration, name, title, parameter }
}

const getName = function(title, parameter) {
  if (parameter === undefined) {
    return title
  }

  return `${title} (${parameter})`
}

const addNamePaddings = function(iterations) {
  const padding = Math.max(...iterations.map(getNameLength))
  return iterations.map(iteration => addNamePadding(iteration, padding))
}

const getNameLength = function({ name }) {
  return name.length
}

const addNamePadding = function({ name, ...iteration }, padding) {
  const nameA = name.padEnd(padding)
  return { ...iteration, name: nameA }
}
