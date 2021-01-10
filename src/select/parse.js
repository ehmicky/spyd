import { UserError } from '../error/main.js'

import { getPrefix } from './prefix.js'
import { tokenizeSelector } from './tokenize.js'

// Parse `include`, `exclude`, `limit` user-friendly format (array of strings)
// to a code-friendlier format (objects)
// Users specify a list of identifiers, some inverted.
// They do not specify the identifier's category, since we can guess this, in
// order to simplify the syntax.
// However, we do need to group identifiers by category since identifiers of
// the same category use unions while identifiers of different categories use
// intersection.
// This also validates the syntax.
export const parseSelectors = function (
  rawSelectors,
  propName,
  combinationsIds,
) {
  const selectors = rawSelectors.map((rawSelector) =>
    parseSelector(rawSelector, propName, combinationsIds),
  )
  const inverse = propName === 'exclude'
  return { selectors, inverse }
}

export const parseSelector = function (rawSelector, propName, combinationsIds) {
  const prefix = getPrefix([rawSelector], propName)

  const tokens = tokenizeSelector(rawSelector, prefix)

  const tokensA = tokens.map(({ id, inverse }) =>
    addTokenType({ id, inverse, combinationsIds, prefix }),
  )
  const types = getSelectorTypes(tokensA)
  const intersect = types.map((type) => getGroup(tokensA, type))
  return { intersect }
}

const addTokenType = function ({ id, inverse, combinationsIds, prefix }) {
  const idInfoA = combinationsIds.find((idInfo) => idInfo.id === id)

  if (idInfoA === undefined) {
    throw new UserError(
      `${prefix}The identifier "${id}" is selected but does not exist.
This can indicate:
  - That the identifier was mispelled.
  - That the identifier does not exist anymore.
  - A syntax error in the configuration property.
    It should be an array of space-separated identifiers.`,
    )
  }

  const { type } = idInfoA
  return { id, type, inverse }
}

const getSelectorTypes = function (tokens) {
  const types = tokens.map(getType)
  return [...new Set(types)]
}

const getType = function ({ type }) {
  return type
}

// Users invert individual identifiers because it simplifies the syntax.
// However, we need to invert whole categories instead. When all identifiers
// of the same category are inverted, we invert the whole category.
// There is no strong reason why a user would want to mix invertion and
// non-invertion for a specific category. However, we silently support it by
// trying to reconcile both.
const getGroup = function (tokens, type) {
  const { normalIds, invertedIds } = getIdGroups(tokens, type)

  if (normalIds.length !== 0) {
    return { ids: normalIds, inverse: false }
  }

  if (invertedIds.length === 0) {
    return { ids: [], inverse: false }
  }

  return { ids: invertedIds, inverse: true }
}

const getIdGroups = function (tokens, type) {
  const tokensA = tokens.filter((token) => token.type === type)
  const normalIds = tokensA.filter((token) => !hasInverse(token)).map(getId)
  const invertedIds = tokensA.filter(hasInverse).map(getId)
  const commonIds = new Set(normalIds.filter((id) => invertedIds.includes(id)))
  const normalIdsA = normalIds.filter((id) => !commonIds.has(id))
  const invertedIdsA = invertedIds.filter((id) => !commonIds.has(id))
  return { normalIds: normalIdsA, invertedIds: invertedIdsA }
}

const hasInverse = function ({ inverse }) {
  return inverse
}

const getId = function ({ id }) {
  return id
}

// Retrieve selector which catches everything
export const getCatchAllSelector = function () {
  return { intersect: [] }
}
