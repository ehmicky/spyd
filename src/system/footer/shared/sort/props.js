import sortOn from 'sort-on'

// Sort the properties in each system, when it has several.
// Those follow a static order since the property names are known.
export const sortPropEntries = function (propEntries) {
  const propEntriesA = propEntries.map(addPropOrder)
  return sortOn(propEntriesA, ['propOrder'])
}

const addPropOrder = function ({ propName, propValue }) {
  const propOrder = PROP_ORDER.indexOf(propName)
  return { propName, propValue, propOrder }
}

// Order where each property should be shown in the footer
const PROP_ORDER = ['aa', 'ff', 'bb', 'cc', 'dd', 'ee', 'gg', 'hh']
