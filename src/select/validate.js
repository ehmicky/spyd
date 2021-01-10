import { UserError } from '../error/main.js'

// Ensure identifiers of `include` and `exclude` exist in at least some
// combinations.
// This also validate the syntax of those configuration properties.
export const validateSelectorsIds = function (allSelectors, combinationsIds) {
  allSelectors.forEach(({ selectors, original, propName }) => {
    validateSelectors({ selectors, original, propName, combinationsIds })
  })
}

const validateSelectors = function ({
  selectors,
  original,
  propName,
  combinationsIds,
}) {
  const prefix = getErrorPrefix(original, propName)
  selectors.forEach((selector) => {
    validateSelector({ selector, prefix, combinationsIds })
  })
}

const getErrorPrefix = function (original, propName) {
  return `The "${propName}" configuration property is invalid:
  ${original}
`
}

const validateSelector = function ({ selector, prefix, combinationsIds }) {
  const groups = selector.intersect.map(({ ids }) =>
    matchGroup({ ids, prefix, combinationsIds }),
  )
  groups.forEach(({ type, ids: idsA }, index) => {
    validateSelectorType({ type, ids: idsA, groups, index, prefix })
  })
}

const matchGroup = function ({ ids, prefix, combinationsIds }) {
  const idInfos = ids.map((id) => matchId({ id, prefix, combinationsIds }))
  idInfos.forEach(({ type, id }, index) => {
    validateGroupType({ type, id, idInfos, index, prefix })
  })
  const [{ type: typeA }] = idInfos
  return { type: typeA, ids }
}

const matchId = function ({ id, prefix, combinationsIds }) {
  const idInfoA = combinationsIds.find((idInfo) => idInfo.id === id)

  if (idInfoA === undefined) {
    throw new UserError(
      `${prefix}The identifier "${id}" is selected but does not exist.
This can indicate:
  - That the identifier was mispelled.
  - That the identifier does not exist anymore.
  - A syntax error in the configuration property.
    It should be an array of strings.
    Each string should group identifiers using commas (if they share the same
    category) or spaces (otherwise).
    Each group can be prefixed by an exclamation mark to invert it.`,
    )
  }

  return idInfoA
}

const validateGroupType = function ({ type, id, idInfos, index, prefix }) {
  const differentIdInfo = idInfos
    .slice(index + 1)
    .find((idInfo) => idInfo.type !== type)

  if (differentIdInfo === undefined) {
    return
  }

  throw new UserError(`${prefix}The identifiers:
  "${id}" and "${differentIdInfo.id}"
are different: one is a ${type} and the other is a ${differentIdInfo.type}.
Therefore they must not belong to the same comma-separated group.
Please separate them with a space instead of a comma.`)
}

const validateSelectorType = function ({ type, ids, index, groups, prefix }) {
  const sameTypeGroup = groups
    .slice(index + 1)
    .find((group) => group.type === type)

  if (sameTypeGroup === undefined) {
    return
  }

  throw new UserError(`${prefix}The identifiers:
  "${ids.join(',')}" and "${sameTypeGroup.ids.join(',')}"
are all ${type}s, so they must belong to the same comma-separated group.
Please separate them with a comma instead of a space.`)
}
