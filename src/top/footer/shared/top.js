// The first system is always for props matching all systems.
// If it has not been added yet, we do it here.
export const addTopSystem = (propGroups) =>
  propGroups.some(isTopPropGroup)
    ? propGroups
    : [{ propEntries: [], dimensionsArray: [] }, ...propGroups]

const isTopPropGroup = ({ dimensionsArray }) => dimensionsArray.length === 0
