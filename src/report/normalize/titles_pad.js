import { getCombsDimensions } from '../../combination/dimensions.js'

// Add `combination.dimensions[*].titlePadded`
// It is like `combination.dimensions[*].title` but padded so all combinations
// vertically align
export const padTitles = (combinations) => {
  const dimensions = getCombsDimensions(combinations)
  return dimensions.reduce(addTitlesPadded, combinations)
}

const addTitlesPadded = (combinations, { propName }) => {
  const padding = getPadding(combinations, propName)
  return combinations.map((combination) =>
    addTitlePadded(combination, propName, padding),
  )
}

const getPadding = (combinations, propName) => {
  const lengths = combinations.map(
    ({ dimensions }) => dimensions[propName].title.length,
  )
  return Math.max(...lengths)
}

const addTitlePadded = (combination, propName, padding) => {
  const dimensionProps = combination.dimensions[propName]
  const titlePadded = dimensionProps.title.padEnd(padding)
  return {
    ...combination,
    dimensions: {
      ...combination.dimensions,
      [propName]: { ...dimensionProps, titlePadded },
    },
  }
}
