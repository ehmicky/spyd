import { loadTaskFile } from './load.js'

// Retrieve a specific task in the task file
export const getTask = async function({
  taskPath,
  taskId,
  parameter,
  requireOpt,
}) {
  const tasks = await loadTaskFile({ taskPath, requireOpt })

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

// Bind task `parameter` (if present) to `main()`, `before()` and `after()`
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

  // `func.bind()` is much slower, which shows with very functions
  return () => func(parameterValue)
}
