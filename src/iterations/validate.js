// Validate that identifiers don't use characters that we are using for parsing
// (e.g. , and = are used by `--limit`) or could use in the future.
export const validateIds = function(ids) {
  Object.entries(ids).forEach(validateId)
}

const validateId = function([name, id]) {
  if (!VALID_ID_REGEXP.test(id)) {
    const nameA = name.replace('Id', '')
    throw new TypeError(
      `Invalid ${nameA} '${id}': must contain only letters, digits or _ . -`,
    )
  }
}

const VALID_ID_REGEXP = /^[a-zA-Z\d_.-]*$/u
