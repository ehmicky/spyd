// Ensure ids exist
export const validateLimits = function (iterations, limits) {
  limits.forEach((limit) => {
    validateLimit(iterations, limit)
  })
}

const validateLimit = function (iterations, { ids = [] }) {
  ids.forEach((id) => {
    validateLimitId(iterations, id)
  })
}

const validateLimitId = function (iterations, id) {
  const isValidId = iterations.some((iteration) => hasId(iteration, id))

  if (!isValidId) {
    throw new TypeError(
      `Invalid limit '${id}': no such tasks, inputs, commands nor systems`,
    )
  }
}

const hasId = function ({ taskId, inputId, commandId, systemId }, id) {
  return taskId === id || inputId === id || commandId === id || systemId === id
}
