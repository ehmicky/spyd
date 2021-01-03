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
      `Invalid ${type} "${id}": must contain only letters, digits, - or _`,
    )
  }
}

// We allow case-sensitiveness and both - and _ so that users can choose their
// preferred case convention. This also makes it easier to support different
// languages.
// We allow starting with digits since this might be used in inputIds or
// propSets.
// We do not allow empty strings.
// We do not allow dots because they are used in CLI flags for nested
// configuration properties.
// We forbid other characters for forward compatibility.
const USER_ID_REGEXP = /^[\w-]+$/u
