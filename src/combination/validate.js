import { UserError } from '../error/main.js'

// Validate that user-defined identifiers don't use characters that we are using
// for parsing or could use in the future.
export const validateCombinationsIds = function (combinations) {
  combinations.forEach(validateCombinationIds)
}

const validateCombinationIds = function (combination) {
  ID_PROPS.forEach(({ propName, name }) => {
    validateId(combination[propName], propName, name)
  })
}

const ID_PROPS = [
  { propName: 'taskId', name: 'task' },
  { propName: 'inputId', name: 'input' },
  { propName: 'runnerId', name: 'runner' },
  { propName: 'systemId', name: 'system' },
]

const validateId = function (id, propName, name) {
  if (!VALID_ID_REGEXP.test(id)) {
    throw new UserError(
      `Invalid ${name} '${id}': must contain only letters, digits or _ . -`,
    )
  }
}

const VALID_ID_REGEXP = /^[\w.-]*$/u
