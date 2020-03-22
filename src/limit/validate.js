// Ensure ids exist
export const validateLimits = function (iterations, limits) {
  limits.forEach((limit) => validateLimit(iterations, limit))
}

const validateLimit = function (iterations, { ids = [] }) {
  ids.forEach((id) => validateLimitId(iterations, id))
}

const validateLimitId = function (iterations, id) {
  const isValidId = iterations.some((iteration) => hasId(iteration, id))

  if (!isValidId) {
    throw new TypeError(
      `Invalid limit '${id}': no such tasks, variations, commands nor systems`,
    )
  }
}

const hasId = function ({ taskId, variationId, commandId, systemId }, id) {
  return (
    taskId === id || variationId === id || commandId === id || systemId === id
  )
}
