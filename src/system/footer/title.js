// Add `system.title` which is a string representation of `system.dimension`
// to be shown as header in the footer
export const getSystemTitle = function (system) {
  const title = system.dimensions.map(getDimensionsTitle).join(', ')
  return { ...system, title }
}

const getDimensionsTitle = function (dimensions) {
  return Object.values(dimensions).map(getDimensionValuesTitle).join(' ')
}

const getDimensionValuesTitle = function (dimensionValues) {
  return dimensionValues.map(getDimensionValueTitle).join('/')
}

const getDimensionValueTitle = function ({ title }) {
  return title
}
