// Normalize tasks and variations
export const normalizeEntries = function({
  entries: { variations = {}, ...tasks },
  taskPath,
}) {
  const variationsA = variations.map(normalizeVariation)
  const tasksA = Object.entries(tasks).map(([taskId, task]) =>
    normalizeTask({ taskId, task, variations: variationsA, taskPath }),
  )
  return tasksA
}

const normalizeVariation = function({
  id: variationId,
  title: variationTitle = variationId,
  value,
}) {
  return { variationId, variationTitle, value }
}

// `taskTitle` defaults to the function variable name. `taskTitle` is used by
// reporters while the `taskId` is used for identification.
// We also link tasks to their variations
const normalizeTask = function({
  taskId,
  task,
  variations: allVariations,
  taskPath,
}) {
  const { taskTitle = taskId, variations, ...taskA } = normalizeTaskFunc(task)
  const variationsA = getTaskVariations({
    variations,
    allVariations,
    taskId,
    taskPath,
  })
  return { ...taskA, taskId, taskTitle, variations: variationsA }
}

// Tasks can be functions as a shortcut to `{ main() { ... } }`
const normalizeTaskFunc = function(task) {
  if (typeof task === 'function') {
    return { main: task }
  }

  return task
}

// `task.variations` is an array of `variationId` pointing towards the top-level
// `variations` object. We dereference those pointers here.
// Defaults to using all `variations`.
const getTaskVariations = function({
  variations,
  allVariations,
  taskId,
  taskPath,
}) {
  if (variations === undefined) {
    return allVariations
  }

  return variations.map(variationId =>
    getTaskVariation({ variationId, allVariations, taskId, taskPath }),
  )
}

const getTaskVariation = function({
  variationId,
  allVariations,
  taskId,
  taskPath,
}) {
  const variation = allVariations.find(
    ({ variationId: variationIdA }) => variationIdA === variationId,
  )

  if (variation === undefined) {
    throw new TypeError(
      `Variation '${variationId}' of task '${taskId}' in '${taskPath}' does not exist`,
    )
  }

  return variation
}
