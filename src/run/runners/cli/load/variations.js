// `task.variations` is an array of `variationId` pointing towards the top-level
// `variations` object. We dereference those pointers here.
// `variations` as scoped to each task file. However the same `variationId` can
// be used across task files.
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
  return tasks
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
  value,
}) {
  // `value` can be a string but also a number or boolean, to avoid quoting
  // those in YAML
  const variationValue = String(value)

  return { variationId, variationTitle, variationValue }
}

const getVariation = function(variationId, variations, { taskId, taskPath }) {
  const variationA = variations.find(
    variation => variation.variationId === variationId,
  )

  if (variationA === undefined) {
    throw new TypeError(
      `Variation '${variationId}' of task '${taskId}' in '${taskPath}' does not exist`,
    )
  }

  return variationA
}
