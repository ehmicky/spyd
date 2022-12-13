import sortOn from 'sort-on'

import { PROP_ORDER } from '../serialize.js'

// Sort the properties in each system, when it has several.
// Those follow a static order since the property names are known.
export const addPropOrder = ([propName, propValue]) => {
  const propOrder = getPropOrder(propName)
  return { propName, propValue, propOrder }
}

const getPropOrder = (propName) => {
  const propOrder = PROP_ORDER.indexOf(propName)
  return propOrder === -1 ? PROP_ORDER.indexOf('') : propOrder
}

export const sortPropEntries = (propEntries) =>
  sortOn(propEntries, ['propOrder'])

export const removePropOrder = ({ propName, propValue }) => [
  propName,
  propValue,
]
