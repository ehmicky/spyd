import { UserError } from '../../error/main.js'
import { isInvalidDefaultId } from '../default.js'

import { getCombsDimensionsIds } from './get.js'
import { getUserIds } from './user.js'

// Validate combination identifiers.
export const validateCombinationsIds = (combinations, inputsList) => {
  const userIds = getUserIds(combinations, inputsList)
  userIds.forEach(validateUserId)

  const dimensionsIds = getCombsDimensionsIds(combinations)
  dimensionsIds.forEach(validateDimensionId)
}

// Validate that identifiers don't use characters that we are using for parsing
// or could use in the future.
// Only for user-defined identifiers, not plugin-defined.
export const validateUserId = ({ id, messageName }) => {
  if (id.trim() === '') {
    throw new UserError(
      `Invalid ${messageName} "${id}": the identifier must not be empty.`,
    )
  }

  if (id.startsWith(USER_ID_INVALID_START)) {
    throw new UserError(
      `Invalid ${messageName} "${id}": the identifier must not start with a dash.`,
    )
  }

  if (!USER_ID_REGEXP.test(id)) {
    throw new UserError(
      `Invalid ${messageName} "${id}": the identifier must contain only letters, digits, - or _`,
    )
  }

  validateReservedIds(id, messageName)
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

const validateReservedIds = (id, messageName) => {
  const reservedIdA = RESERVED_IDS.find((reservedId) => id === reservedId)

  if (reservedIdA !== undefined) {
    throw new UserError(
      `Invalid ${messageName} "${id}": "${id}" is a reserved word`,
    )
  }
}

// 'not' and 'and' are used by `select`
const RESERVED_IDS = ['not', 'and']

const validateDimensionId = ({ id, dimension }, index, allIds) => {
  validateDefaultId(id, dimension)
  validateDuplicateId({ id, dimension, index, allIds })
}

// Since ids must not be duplicate across dimensions, we need to forbid any
// id which might be used as a dimension's default id.
const validateDefaultId = (id, dimension) => {
  if (isInvalidDefaultId(id, dimension)) {
    throw new UserError(
      `The identifier "${id}" is reserved as a default value.`,
    )
  }
}

// For each dimension of the new result, we previously ensured that each
// identifier of that dimension is unique.
// We validate there that identifiers across dimensions are also unique.
// This allows specifying identifiers without specifying their combination
// dimension in many places including: `config.titles`, `config.select`,
// reporting.
// Non-combination identifiers are not checked for duplicates since they are
// not used for selection, reporting, `config.titles`, etc.
// Identifier of previous results do not need to be checked for duplicate ids
// since only their combinations matching the target result are kept.
const validateDuplicateId = ({ id, dimension, index, allIds }) => {
  const duplicateId = allIds.slice(index + 1).find((nextId) => nextId.id === id)

  if (duplicateId === undefined) {
    return
  }

  const { dimension: duplicateDimension } = duplicateId
  const userDimensions = [dimension, duplicateDimension].filter(isUserDimension)
  const errorSuffix =
    userDimensions.length === 1
      ? `Please rename the ${userDimensions[0].messageName}.`
      : `Please rename one of them.`
  throw new UserError(`The identifier "${id}" must not be used both as a ${dimension.messageName} and as a ${duplicateDimension.messageName}.
${errorSuffix}`)
}

const isUserDimension = ({ createdByUser }) => createdByUser
