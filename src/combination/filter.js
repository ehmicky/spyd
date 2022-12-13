import { excludeKeys } from 'filter-obj'

// Retrieve `noDimensions`, i.e. dimensions that have the same ids across all
// combinations.
// Those are not reported, since they are redundant for users.
// We only filter those just before reporting|printing:
//  - `noDimensions` are always kept otherwise
//     - Some logic relies on all dimensions, even redundant, to be present:
//       select, limit, id validation
//  - We also keep all dimensions in result files since history merging and
//   `select` might add|remove redundant dimensions
//  - We do filter `noDimensions` inside the `result` passed to reporters though
//     - So they do not have to
//     - To ensure they do not report them
export const getNoDimensions = (combinations) => {
  const dimensionsArray = combinations.map(getCombinationDimensions)
  return getCombsNoDimensions(dimensionsArray)
}

const getCombinationDimensions = ({ dimensions }) => dimensions

// Same with already computed dimensions
export const getCombsNoDimensions = (dimensionsArray) => {
  const dimensionNames = [...new Set(dimensionsArray.flatMap(Object.keys))]
  return dimensionNames.filter((dimensionName) =>
    isNoDimensions(dimensionsArray, dimensionName),
  )
}

const isNoDimensions = (dimensionsArray, dimensionName) => {
  const isSparseDimension = dimensionsArray.some(
    (dimensions) => dimensions[dimensionName] === undefined,
  )

  if (isSparseDimension) {
    return false
  }

  const { id } = dimensionsArray[0][dimensionName]
  return dimensionsArray.every(
    (dimensions) => dimensions[dimensionName].id === id,
  )
}

// Filter `noDimensions` from result, during reporting.
// This is split from `getNoDimensions()` for performance reason:
//   - Retrieving `noDimensions` can be performed once per run
//   - But applying `noDimensions` might be repeated on many results or many
//     previews
export const omitNoDimensions = (result, noDimensions) => {
  const combinations = result.combinations.map((combination) =>
    omitCombNoDimensions(combination, noDimensions),
  )
  return { ...result, combinations }
}

// Same for a single combination
export const omitCombNoDimensions = (combination, noDimensions) => {
  const dimensions = excludeKeys(combination.dimensions, noDimensions)
  return { ...combination, dimensions }
}
