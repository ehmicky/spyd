import { applyTemplate } from '../template.js'

// `task.variations` is an array of `variationId` pointing towards the top-level
// `variations` object. We dereference those pointers here.
// `variations` are scoped to each benchmark file. However the same
// `variationId` can be used across benchmark files.
// Defaults to using all `variations`.
export const addTasksVariations = function({
  tasks,
  variations = DEFAULT_VARIATIONS,
  variables,
}) {
  return tasks.flatMap(task =>
    addTaskVariations({ task, variations, variables }),
  )
}

const DEFAULT_VARIATIONS = [{ id: '' }]

export const addTaskVariations = function({
  task: { variationsIds, ...task },
  variations,
  variables,
}) {
  const variationsA = getVariations({
    task,
    variationsIds,
    variations,
    variables,
  })
  const tasks = variationsA.map(variation =>
    addVariation(task, variation, variables),
  )
  return tasks
}

const getVariations = function({
  task,
  variationsIds,
  variations = [],
  variables,
}) {
  const variationsA = variations.map(variation =>
    normalizeVariation(variation, variables),
  )

  if (variationsIds === undefined) {
    return variationsA
  }

  return variationsIds.map(variationId =>
    getVariation(variationId, variationsA, task),
  )
}

// Apply templates on variations
const normalizeVariation = function({ id, title, value }, variables) {
  const variationId = applyTemplate(id, variables)
  const variationTitle = applyTemplate(title, variables)
  const variationValue = getVariationValue(value, variables)
  return { variationId, variationTitle, variationValue }
}

// `value` can be a string but also a number or boolean, to avoid quoting
// those in YAML
const getVariationValue = function(value, variables) {
  if (value === undefined) {
    return ''
  }

  if (typeof value !== 'string') {
    return String(value)
  }

  return applyTemplate(value, variables)
}

// Add each variation to each task by adding the <<variation>> variable
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

const addVariation = function(
  task,
  { variationValue, ...variation },
  variables,
) {
  const variablesA = { ...variables, variation: variationValue }
  return { ...task, ...variation, variables: variablesA }
}
