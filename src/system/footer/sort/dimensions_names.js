import { sortMatrix } from '../../../utils/sort.js'

// Retrieve `dimensionNames` used for sorting.
//  - Instead of using lexicographic order, we use the order of dimensions as
//    specified by the user in the `system` configuration property
//  - This is persisted in results and we ensure it does not change until it
//    reaches this logic
//  - We use the most recent result in priority so that users can change the
//    current order even if all previous results have a different one
export const getDimensionNames = function (firstSystem, systems) {
  const firstDimensionNames = Object.keys(getSystemDimensions(firstSystem))
  const uniqueDimensionNames = sortMatrix(
    systems.flatMap(getSystemDimensions).map(Object.keys),
  )
  const otherDimensionNames = uniqueDimensionNames.filter(
    (dimensionName) => !firstDimensionNames.includes(dimensionName),
  )
  return [...firstDimensionNames, ...otherDimensionNames]
}

const getSystemDimensions = function ({ dimensions }) {
  return dimensions
}
