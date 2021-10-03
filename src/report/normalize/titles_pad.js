import { getDimensions } from '../../combination/dimensions.js'

// Add `combination.dimensions[*].titlePadded`
// It is like `combination.dimensions[*].title` but padded so all combinations
// vertically align
export const padTitles = function (combinations) {
  const dimensions = getDimensions(combinations)
  return dimensions.reduce(addTitlesPadded, combinations)
}

const addTitlesPadded = function (combinations, dimension) {
  const padding = getPadding(combinations, dimension)
  return combinations.map((combination) =>
    addTitlePadded(combination, dimension, padding),
  )
}

const getPadding = function (combinations, dimension) {
  const lengths = combinations.map(
    ({ dimensions }) => dimensions[dimension].title.length,
  )
  return Math.max(...lengths)
}

const addTitlePadded = function (combination, dimension, padding) {
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
