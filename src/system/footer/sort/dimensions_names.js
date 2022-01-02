// Retrieve `dimensionNames` used for sorting.
//  - Instead of using lexicographic order, we use the order of dimensions as
//    specified by the user in the `system` configuration property
//  - This is persisted in results and we ensure it does not change until it
//    reaches this logic
//  - We use the most recent results in priority
export const getDimensionNames = function (firstSystem, systems) {
  const firstDimensionNames = Object.keys(getSystemDimensions(firstSystem))
  const uniqueDimensionNames = [
    ...new Set(systems.flatMap(getSystemDimensions).flatMap(Object.keys)),
  ]
  const otherDimensionNames = uniqueDimensionNames.filter(
    (dimensionName) => !firstDimensionNames.includes(dimensionName),
  )
  return [...firstDimensionNames, ...otherDimensionNames]
}

const getSystemDimensions = function ({ dimensions }) {
  return dimensions
}
