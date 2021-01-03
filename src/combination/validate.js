import { UserError } from '../error/main.js'

// Validate that user-defined identifiers don't use characters that we are using
// for parsing or could use in the future.
export const validateCombinationsIds = function (combinations) {
  USER_ID_PROPS.forEach(({ getIds, type }) => {
    validateIdsPerType(combinations, getIds, type)
  })
}

const validateIdsPerType = function (combinations, getIds, type) {
  const ids = combinations.flatMap(getIds).filter(Boolean)
  const idsA = [...new Set(ids)]
  idsA.forEach((id) => {
    validateId(id, type)
  })
}

const USER_ID_PROPS = [
  { type: 'task', getIds: ({ taskId }) => taskId },
  { type: 'system', getIds: ({ systemId }) => systemId },
  {
    type: 'input',
    getIds: ({ inputs }) => inputs.map(({ inputName }) => inputName),
  },
]

const validateId = function (id, type) {
  if (!USER_ID_REGEXP.test(id)) {
    throw new UserError(
      `Invalid ${type} "${id}": must contain only lowercase letters, digits or _`,
    )
  }
}

// We do not allow:
//  - dots because they are used in CLI flags for nested configuration
//    properties
//  - environment variables (`SPYD_*`) only allow _ and are case-insensitive
//    on Windows
const USER_ID_REGEXP = /^[a-z_][a-z0-9_]*$/u
