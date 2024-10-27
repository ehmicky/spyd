// Sort systems between each other:
//  - Top-level system first
//  - Then sorted to follow a specific order for the props
export const compareSystems = (
  { isTopSystem: isTopSystemA, propEntries: propEntriesA },
  { isTopSystem: isTopSystemB, propEntries: propEntriesB },
) => {
  if (isTopSystemA) {
    return -1
  }

  if (isTopSystemB) {
    return 1
  }

  // eslint-disable-next-line unicorn/no-for-loop, fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index < propEntriesA.length; index += 1) {
    const result = comparePropEntries(propEntriesA[index], propEntriesB[index])

    // eslint-disable-next-line max-depth
    if (result !== 0) {
      return result
    }
  }

  return 0
}

// eslint-disable-next-line max-statements
const comparePropEntries = (propEntryA, propEntryB) => {
  if (propEntryB === undefined) {
    return 1
  }

  if (propEntryA.propOrder > propEntryB.propOrder) {
    return 1
  }

  if (propEntryA.propOrder < propEntryB.propOrder) {
    return -1
  }

  if (propEntryA.propValue > propEntryB.propValue) {
    return 1
  }

  if (propEntryA.propValue < propEntryB.propValue) {
    return -1
  }

  return 0
}
