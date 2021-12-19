import { setArrayElement, setObjectElement } from '../../utils/set.js'
import { getCombDimensions } from '../dimensions.js'

import { getDimensionId, setDimensionId } from './get.js'
import { isSameId, isSameDimension } from './has.js'

// We previously ensured that each `id` is unique within each dimension.
// This logic ensures each `id` is also unique across dimensions.
// We do this by prefixing the dimension's name to the `id` when we find
// cross-dimensions duplicates.
// We only do so on the previous result's id, not on the most recent, so those
// ids look simpler to users.
// Since the number of results can be large, this is optimized for performance.
//  - We try to avoid creating new objects and arrays unless a mutation is
//    actually needed, i.e. some id needs to be namespaced
//  - We directly mutate the list of `dimensionsIds`
export const namespaceDimensionIds = function (rawResults) {
  return rawResults.reduceRight(
    namespaceRawResultIds.bind(undefined, []),
    rawResults,
  )
}

// eslint-disable-next-line max-params
const namespaceRawResultIds = function (
  dimensionsIds,
  rawResults,
  rawResult,
  index,
) {
  const combinations = rawResult.combinations.reduce(
    namespaceDimensionsIds.bind(undefined, dimensionsIds),
    rawResult.combinations,
  )
  const rawResultA = setObjectElement(rawResult, 'combinations', combinations)
  return setArrayElement(rawResults, index, rawResultA)
}

// eslint-disable-next-line max-params
const namespaceDimensionsIds = function (
  dimensionsIds,
  combinations,
  combination,
  index,
) {
  const dimensions = getCombDimensions(combination)
  const combinationA = dimensions.reduce(
    namespaceDimensionId.bind(undefined, dimensionsIds),
    combination,
  )
  return setArrayElement(combinations, index, combinationA)
}

const namespaceDimensionId = function (dimensionsIds, combination, dimension) {
  const combDimensionId = getDimensionId(combination, dimension)
  const similarDimensionId = dimensionsIds.find((dimensionId) =>
    isSameId(combDimensionId, dimensionId),
  )

  if (similarDimensionId === undefined) {
    // eslint-disable-next-line fp/no-mutating-methods
    dimensionsIds.push(combDimensionId)
    return combination
  }

  if (isSameDimension(combDimensionId, similarDimensionId)) {
    return combination
  }

  return renameDimensionId(dimensionsIds, combination, combDimensionId)
}

const renameDimensionId = function (
  dimensionsIds,
  combination,
  combDimensionId,
) {
  const id = getNamespacedId(combDimensionId)
  const combDimensionIdA = { ...combDimensionId, id }
  const sameDimensionId = dimensionsIds.find(
    (dimensionId) =>
      isSameId(combDimensionIdA, dimensionId) &&
      isSameDimension(combDimensionIdA, dimensionId),
  )

  if (sameDimensionId === undefined) {
    // eslint-disable-next-line fp/no-mutating-methods
    dimensionsIds.push(combDimensionIdA)
  }

  const combinationA = setDimensionId(combination, combDimensionIdA)
  return combinationA
}

const getNamespacedId = function ({ id, dimension: { propName } }) {
  return `${propName}_${id}`
}
