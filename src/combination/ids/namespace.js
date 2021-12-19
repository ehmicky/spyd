import { setArrayElement } from '../../utils/set.js'

import {
  getCombsDimensionsIds,
  getCombDimensionsIds,
  setDimensionId,
} from './get.js'
import { isSameDimension, hasCrossDimensionsIds, findSameId } from './has.js'

// When a result is created, we ensure that two dimensions do not have the
// same ids, by throwing errors.
// When loading previous results, we also ensure that each id is unique
// across dimensions of those results.
// We do this by prefixing the dimension's name to the id when we find
// cross-dimensions duplicates.
//  - If the prefixed id is still a duplicate, which is very unlikely, we add
//    additional prefixes until it stops being a duplicate.
// We only do so on the previous result's id, not on the most recent, so those
// ids look simpler to users.
// Since the number of results can be large, this is optimized for performance.
//  - We try to avoid creating new objects and arrays unless a mutation is
//    actually needed, i.e. some id needs to be namespaced
//  - We directly mutate the list of `dimensionsIds`
export const namespaceDimensionIds = function (rawResults, newCombinations) {
  const dimensionsIds = getCombsDimensionsIds(newCombinations)
  return rawResults.reduceRight(
    namespaceRawResultIds.bind(undefined, dimensionsIds),
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
  const rawResultA =
    rawResult.combinations === combinations
      ? rawResult
      : { ...rawResult, combinations }
  return setArrayElement(rawResults, index, rawResultA)
}

// eslint-disable-next-line max-params
const namespaceDimensionsIds = function (
  dimensionsIds,
  combinations,
  combination,
  index,
) {
  const comDimensionsIds = getCombDimensionsIds(combination)
  const combinationA = comDimensionsIds.reduce(
    namespaceDimensionId.bind(undefined, dimensionsIds),
    combination,
  )
  return setArrayElement(combinations, index, combinationA)
}

const namespaceDimensionId = function (
  dimensionsIds,
  combination,
  combDimensionId,
) {
  const similarDimensionId = addDimensionId(dimensionsIds, combDimensionId)

  if (!shouldNamespace(similarDimensionId, combDimensionId)) {
    return combination
  }

  const combDimensionIdA = addNamespace(combDimensionId, dimensionsIds)
  addDimensionId(dimensionsIds, combDimensionIdA)
  const combinationA = setDimensionId(combination, combDimensionIdA)
  return combinationA
}

const shouldNamespace = function (similarDimensionId, combDimensionId) {
  return (
    similarDimensionId !== undefined &&
    !isSameDimension(combDimensionId, similarDimensionId)
  )
}

const addNamespace = function (
  combDimensionId,
  dimensionsIds,
  separators = '_',
) {
  const { id, dimension } = combDimensionId
  const idA = `${dimension.propName}${separators}${id}`
  const combDimensionIdA = { id: idA, dimension }
  return hasCrossDimensionsIds(dimensionsIds, combDimensionIdA)
    ? addNamespace(combDimensionId, dimensionsIds, `${separators}_`)
    : combDimensionIdA
}

const addDimensionId = function (dimensionsIds, combDimensionId) {
  const similarDimensionId = findSameId(dimensionsIds, combDimensionId)

  if (similarDimensionId === undefined) {
    // eslint-disable-next-line fp/no-mutating-methods
    dimensionsIds.push(combDimensionId)
  }

  return similarDimensionId
}
