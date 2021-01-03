import { UserError } from '../error/main.js'

// Validate combination identifiers
export const validateCombinationsIds = function (combinations) {
  const combinationIds = COMBINATION_IDS.map(({ type, getIds }) =>
    getCombinationIds({ type, getIds, combinations }),
  )
  combinationIds.forEach(validateIdsPerType)
}

const getCombinationIds = function ({ type, getIds, combinations }) {
  const ids = combinations.flatMap(getIds).filter(Boolean)
  const idsA = [...new Set(ids)]
  return { type, ids: idsA }
}

const COMBINATION_IDS = [
  { type: 'task', getIds: ({ taskId }) => taskId },
  { type: 'system', getIds: ({ systemId }) => systemId },
  {
    type: 'input',
    getIds: ({ inputs }) => inputs.map(({ inputName }) => inputName),
  },
]

// Validate that identifiers don't use characters that we are using for parsing
// or could use in the future.
// Only for user-defined identifiers, not plugin-defined.
const validateIdsPerType = function ({ type, ids }) {
  if (!USER_IDS.has(type)) {
    return
  }

  ids.forEach((id) => {
    validateId(id, type)
  })
}

const USER_IDS = new Set(['task', 'system', 'input'])

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
