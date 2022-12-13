// List all `propEntries`, i.e. unique sets of system props names + values.
export const listPropEntries = (systems) => {
  const propNames = getUniquePropNames(systems)
  const propEntries = getUniquePropEntries(propNames, systems)
  const propEntriesA = propEntries.map((propEntry) =>
    addPropEntryDimensions(propEntry, systems),
  )
  return propEntriesA
}

// List all unique system props names
const getUniquePropNames = (systems) => [
  ...new Set(systems.flatMap(getPropNames)),
]

const getPropNames = ({ props }) => Object.keys(props)

// List all unique system props names + values
const getUniquePropEntries = (propNames, systems) =>
  propNames.flatMap((propName) => getUniquePropEntry(propName, systems))

const getUniquePropEntry = (propName, systems) => {
  const propValues = [...new Set(systems.map(({ props }) => props[propName]))]
  return propValues
    .filter(isDefined)
    .map((propValue) => ({ propName, propValue }))
}

const isDefined = (propValue) => propValue !== undefined

// For each `propEntry`, add the list of matching dimensions
const addPropEntryDimensions = ({ propName, propValue }, systems) => {
  const dimensionsArray = systems
    .filter(({ props }) => props[propName] === propValue)
    .map(({ dimensions }) => dimensions)
  return { propName, propValue, dimensionsArray }
}
