// When the logic involving a combination throws, we do not propagate the
// exception right away. This allows the combination and other combinations
// to properly stop and exit.
export const handleCombinationError = function (combinations) {
  const erroredCombination = combinations.find(combinationHasErrored)

  if (erroredCombination === undefined) {
    return
  }

  throw getCombinationError(erroredCombination)
}

export const combinationHasErrored = function ({ error }) {
  return error !== undefined
}

const getCombinationError = function ({ error, taskId, inputId }) {
  const taskPrefix = getTaskPrefix(taskId, inputId)
  // eslint-disable-next-line no-param-reassign
  error.message = `${taskPrefix}:\n${error.message}`
  return error
}

const getTaskPrefix = function (taskId, inputId) {
  return inputId === ''
    ? `In task '${taskId}'`
    : `In task '${taskId}' (input '${inputId}')`
}
