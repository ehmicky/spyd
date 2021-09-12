import { UserError } from '../../error/main.js'
import { getUserIds, getCombinationsIds } from '../ids.js'

// Validate combination identifiers.
export const validateCombinationsIds = function (combinations, inputs) {
  const userIds = getUserIds(combinations, inputs)
  userIds.forEach(validateUserIds)

  const combinationsIds = getCombinationsIds(combinations)
  combinationsIds.forEach(validateDuplicateId)
}

// Validate that identifiers don't use characters that we are using for parsing
// or could use in the future.
// Only for user-defined identifiers, not plugin-defined.
const validateUserIds = function ({ dimension, id }) {
  if (id.trim() === '') {
    throw new UserError(
      `Invalid ${dimension} "${id}": the identifier must not be empty.`,
    )
  }

  if (id.startsWith(USER_ID_INVALID_START)) {
    throw new UserError(
      `Invalid ${dimension} "${id}": the identifier must not start with a dash.`,
    )
  }

  if (!USER_ID_REGEXP.test(id)) {
    throw new UserError(
      `Invalid ${dimension} "${id}": the identifier must contain only letters, digits, - or _`,
    )
  }

  validateReservedIds(id, dimension)
}

// We do not allow starting with dash because of CLI flags parsing.
const USER_ID_INVALID_START = '-'
// We allow case-sensitiveness and both - and _ so that users can choose their
// preferred case convention. This also makes it easier to support different
// languages.
// We allow starting with digits since this might be used in variations.
// We do not allow empty strings.
// We do not allow dots because they are used in CLI flags for nested
// configuration properties.
// We forbid other characters for forward compatibility.
const USER_ID_REGEXP = /^\w[\w-]*$/u

const validateReservedIds = function (id, dimension) {
  const reservedIdA = RESERVED_IDS.find((reservedId) => id === reservedId)

  if (reservedIdA !== undefined) {
    throw new UserError(
      `Invalid ${dimension} "${id}": "${id}" is a reserved word`,
    )
  }
}

// 'not' is used by `select`
const RESERVED_IDS = ['not']

// We validate that identifiers are unique not only within their combination
// dimension but across combination dimensions.
// This allows specifying identifiers without specifying their combination
// dimension (task, systems, runners, variations) in many places including:
// `config.titles`, `config.select`, reporting.
// Non-combination identifiers are not checked for duplicates since they are
// not used for selection, reporting, `config.titles`, etc.
const validateDuplicateId = function ({ dimension, id }, index, allIds) {
  const duplicateId = allIds.slice(index + 1).find((nextId) => nextId.id === id)

  if (duplicateId !== undefined) {
    throw new UserError(`The identifier "${id}" must not be used both as ${dimension} and ${duplicateId.dimension}.
Please rename one of them.`)
  }
}
