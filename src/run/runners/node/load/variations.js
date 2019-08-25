// `task.variations` is an array of `variationId` pointing towards the top-level
// `variations` object. We dereference those pointers here.
// `variations` are scoped to each benchmark file. However the same
// `variationId` can be used across benchmark files.
// Defaults to using all `variations`.
export const addTasksVariations = function(tasks, variations) {
  return tasks.flatMap(task => addTaskVariations(task, variations))
}

export const addTaskVariations = function(
  { variationsIds, ...task },
  variations,
) {
  if (variationsIds === undefined && variations === undefined) {
    return [{ ...task, variationId: DEFAULT_VARIATION }]
  }

  const variationsA = getVariations(task, variationsIds, variations)
  const tasks = variationsA.map(variation => ({ ...task, ...variation }))
  const tasksA = tasks.map(bindVariation)
  return tasksA
}

// `variationId` must default to an empty string before being sent to parent
const DEFAULT_VARIATION = ''

const getVariations = function(task, variationsIds, variations = []) {
  const variationsA = variations.map(normalizeVariation)

  if (variationsIds === undefined) {
    return variationsA
  }

  return variationsIds.map(variationId =>
    getVariation(variationId, variationsA, task),
  )
}

const normalizeVariation = function({
  id: variationId,
  title: variationTitle,
  value: variationValue,
}) {
  return { variationId, variationTitle, variationValue }
}

const getVariation = function(variationId, variations, { taskId }) {
  const variationA = variations.find(
    variation => variation.variationId === variationId,
  )

  if (variationA === undefined) {
    throw new TypeError(
      `Variation '${variationId}' of task '${taskId}' does not exist`,
    )
  }

  return variationA
}

// Bind task `variation.value` (if present) to `main()`, `before()` and
// `after()`
const bindVariation = function({ variationValue, ...task }) {
  const funcs = BOUND_FUNCS.filter(name => task[name] !== undefined).map(name =>
    bindFunction(task, name, variationValue),
  )
  return Object.assign({}, task, ...funcs)
}

const BOUND_FUNCS = ['main', 'before', 'after']

const bindFunction = function(task, name, variationValue) {
  const func = task[name]
  const funcA = getBoundFunction({ func, task, name, variationValue })
  return { [name]: funcA }
}

// `func.bind()` is much slower, especially for very fast functions.
const getBoundFunction = function({
  func,
  task: { before },
  name,
  variationValue,
}) {
  // Passing a `beforeArgs` is slower as well, so we only do it when needed.
  if (name === 'before' || before === undefined) {
    return () => func(variationValue)
  }

  return beforeArgs => func(variationValue, beforeArgs)
}
