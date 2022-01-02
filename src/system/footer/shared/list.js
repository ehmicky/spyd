// List all `propEntries`, i.e. unique sets of system props names + values.
export const listPropEntries = function (systems) {
  const propNames = getUniquePropNames(systems)
  const propEntries = getUniquePropEntries(propNames, systems)
  const propEntriesA = propEntries.map((propEntry) =>
    addPropEntryDimensions(propEntry, systems),
  )
  return propEntriesA
}

// List all unique system props names
const getUniquePropNames = function (systems) {
  return [...new Set(systems.flatMap(getPropNames))]
}

const getPropNames = function ({ props }) {
  return Object.keys(props)
}

// List all unique system props names + values
const getUniquePropEntries = function (propNames, systems) {
  return propNames.flatMap((propName) => getUniquePropEntry(propName, systems))
}

const getUniquePropEntry = function (propName, systems) {
  const propValues = [...new Set(systems.map(({ props }) => props[propName]))]
  return propValues.map((propValue) => ({ propName, propValue }))
}

// For each `propEntry`, add the list of matching dimensions
const addPropEntryDimensions = function ({ propName, propValue }, systems) {
  const dimensionsArray = systems
    .filter(({ props }) => props[propName] === propValue)
    .map(({ dimensions }) => dimensions)
  return { propName, propValue, dimensionsArray }
}
