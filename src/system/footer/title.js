// Add `system.title` which is a string representation of `system.dimensions`
// to be shown as header in the footer
export const addSystemsTitles = function (footer) {
  const systems = footer.systems.map(addSystemTitle)
  return { ...footer, systems }
}

const addSystemTitle = function ({ dimensions, ...system }) {
  const title = dimensions.map(getDimensionsTitle).join(', ')
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
