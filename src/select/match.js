import { parseSelector } from './parse.js'
import { getPrefix } from './prefix.js'
import { tokenizeSelector } from './tokenize.js'

// Select combinations according to the `include`, `exclude`, `limit`
// configuration properties
export const matchSelectors = function (
  rawSelectors,
  propName,
  { combination: { ids }, combinationsIds },
) {
  if (rawSelectors.length === 0) {
    return true
  }

  const selectors = getSelectors({ rawSelectors, combinationsIds, propName })

  const matches = selectors.some(({ intersect }) =>
    matchSelector(ids, intersect),
  )
  return propName === 'exclude' ? !matches : matches
}

// Parse `include`, `exclude`, `limit` user-friendly format (array of strings)
// to a code-friendlier format (objects)
// This also validates the syntax.
const getSelectors = function ({ rawSelectors, combinationsIds, propName }) {
  const prefix = getPrefix(rawSelectors, propName)
  return rawSelectors
    .map((rawSelector) => tokenizeSelector(rawSelector, prefix))
    .map((tokens) => parseSelector(tokens, combinationsIds, prefix))
}

// Check if a selector matches the ids of a given combination
const matchSelector = function (ids, intersect) {
  return intersect.every(({ ids: groupIds, inverse }) =>
    matchGroup(ids, groupIds, inverse),
  )
}

const matchGroup = function (ids, groupIds, inverse) {
  const matches = groupIds.some((id) => ids.includes(id))
  return inverse ? !matches : matches
}
