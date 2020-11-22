import { UserError } from '../error/main.js'

// Ensure ids exist
export const validateLimits = function (combinations, limits) {
  limits.forEach((limit) => {
    validateLimit(combinations, limit)
  })
}

const validateLimit = function (combinations, { ids = [] }) {
  ids.forEach((id) => {
    validateLimitId(combinations, id)
  })
}

const validateLimitId = function (combinations, id) {
  const isValidId = combinations.some((combination) => hasId(combination, id))

  if (!isValidId) {
    throw new UserError(
      `In 'limit' option, invalid id '${id}': no such tasks, inputs, commands nor systems`,
    )
  }
}

const hasId = function ({ taskId, inputId, commandId, systemId }, id) {
  return taskId === id || inputId === id || commandId === id || systemId === id
}
