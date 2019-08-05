import { loadTaskFile } from './load.js'

// Retrieve a specific task in the task file
export const getTask = async function({
  taskPath,
  taskId,
  variationId,
  requireOpt,
}) {
  const tasks = await loadTaskFile({ taskPath, requireOpt })

  const { main, before, after, variations } = tasks.find(
    task => task.taskId === taskId,
  )

  const [mainA, beforeA, afterA] = bindVariation(variations, variationId, [
    main,
    before,
    after,
  ])
  return { main: mainA, before: beforeA, after: afterA }
}

// Bind task `variation` (if present) to `main()`, `before()` and `after()`
const bindVariation = function(variations, variationId, funcs) {
  if (variationId === undefined) {
    return funcs
  }

  const { value } = variations.find(
    ({ variationId: variationIdA }) => variationIdA === variationId,
  )
  return funcs.map(func => bindFunction(func, value))
}

const bindFunction = function(func, value) {
  if (func === undefined) {
    return
  }

  // `func.bind()` is much slower, which shows with very functions
  return () => func(value)
}
