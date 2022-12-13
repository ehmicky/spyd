// Add `system.title` which is a string representation of `system.dimensions`
// to be shown as header in the footer
export const addSystemsTitles = (footer) => {
  const systems = footer.systems.map(addSystemTitle)
  return { ...footer, systems }
}

const addSystemTitle = ({ dimensions, props }) => {
  const title = dimensions.map(getDimensionsTitle).join(', ')
  return { title, props }
}

const getDimensionsTitle = (dimensions) =>
  Object.values(dimensions).map(getDimensionValuesTitle).join(' ')

const getDimensionValuesTitle = (dimensionValues) =>
  dimensionValues.map(getDimensionValueTitle).join('/')

const getDimensionValueTitle = ({ title }) => title
