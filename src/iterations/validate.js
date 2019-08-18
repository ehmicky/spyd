// Validate that identifiers don't use characters that we are using for parsing
// (e.g. , and = are used by `--limit`) or could use in the future.
export const validateIds = function({ taskId, variationId, commandId }) {
  validateId(taskId, 'task')
  validateId(variationId, 'variation')
  validateId(commandId, 'command')
}

const validateId = function(id, name) {
  if (!VALID_ID_REGEXP.test(id)) {
    throw new TypeError(
      `Invalid ${name} '${id}': must contain only letters, digits or _ . -`,
    )
  }
}

const VALID_ID_REGEXP = /^[a-zA-Z\d_.-]*$/u
