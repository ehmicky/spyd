import { loadTaskFile } from './tasks.js'

export const loadTask = function(taskPath, taskId, parameter) {
  const tasks = loadTaskFile(taskPath)
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
