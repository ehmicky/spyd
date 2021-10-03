import { getDimensions } from '../../combination/ids.js'

// Add `combination.dimensions[*].titlePadded`
// It is like `combination.dimensions[*].title` but padded so all combinations
// vertically align
export const padTitles = function (combinations) {
  const dimensions = getDimensions(combinations)
  const paddings = dimensions.map((dimension) =>
    getPadding(combinations, dimension),
  )
  return combinations.map((combination) =>
    addTitlesPadded(combination, paddings),
  )
}

const getPadding = function (combinations, dimension) {
  const lengths = combinations.map(
    ({ dimensions }) => dimensions[dimension].title.length,
  )
  const padding = Math.max(...lengths)
  return { dimension, padding }
}

const addTitlesPadded = function (combination, paddings) {
  return paddings.reduce(
    (combinationA, { dimension, padding }) =>
      addTitlePadded(combinationA, dimension, padding),
    combination,
  )
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
