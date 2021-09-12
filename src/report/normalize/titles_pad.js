import { getCombinationsIds } from '../../combination/ids.js'

// Add `combination.dimensions[*].titlePadded`
// It is like `combination.dimensions[*].title` but padded so all combinations
// vertically align
export const padTitles = function (combinations) {
  const dimensions = getDimensions(combinations)
  const paddings = getPaddings(combinations, dimensions)
  return combinations.map((combination) => addPadding(combination, paddings))
}

const getDimensions = function (combinations) {
  const combinationsIds = getCombinationsIds(combinations)
  const dimensions = combinationsIds.map(getDimensionPropName)
  return [...new Set(dimensions)]
}

const getDimensionPropName = function ({ dimension: { propName } }) {
  return propName
}

const getPaddings = function (combinations, dimensions) {
  return dimensions.map((dimension) => getPadding(combinations, dimension))
}

const getPadding = function (combinations, dimension) {
  const lengths = combinations.map(
    ({ dimensions }) => dimensions[dimension].title.length,
  )
  const padding = Math.max(...lengths)
  return { dimension, padding }
}

const addPadding = function (combination, paddings) {
  return paddings.reduce(
    (combinationA, { dimension, padding }) =>
      padProp(combinationA, dimension, padding),
    combination,
  )
}

const padProp = function (combination, dimension, padding) {
  const dimensionProps = combination.dimensions[dimension]
  const titlePadded = dimensionProps.title.padEnd(padding)
  return {
    ...combination,
    dimensions: {
      ...combination.dimensions,
      [dimension]: { ...dimensionProps, titlePadded },
    },
  }
}
