import { loadTaskFile } from './load.js'

// Retrieve a specific task in the task file
export const getTask = async function(taskPath, taskId, parameter) {
  const tasks = await loadTaskFile(taskPath)
  const { main, before, after, parameters } = tasks.find(
    task => task.taskId === taskId,
  )
  const [mainA, beforeA, afterA] = bindParameter(parameters, parameter, [
    main,
    before,
    after,
  ])
  return { main: mainA, before: beforeA, after: afterA }
}

const bindParameter = function(parameters, parameter, funcs) {
  if (parameter === undefined) {
    return funcs
  }

  const parameterValue = parameters[parameter]
  return funcs.map(func => bindFunction(func, parameterValue))
}

const bindFunction = function(func, parameterValue) {
  if (func === undefined) {
    return
  }

  return func.bind(null, parameterValue)
}
