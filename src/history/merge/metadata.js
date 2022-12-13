import sortOn from 'sort-on'

import { groupBy } from '../../utils/group.js'

// Results with the same `id` should be handled like a single result by the
// delta logic. Therefore, we group metadata before applying deltas.
export const groupMetadata = (metadata) => {
  const metadataA = sortOn(metadata, 'timestamp')
  const metadataGroups = Object.values(groupBy(metadataA, 'id'))
  const metadataGroupsA = sortOn(metadataGroups, getMetadataGroupOrder)
  return metadataGroupsA
}

const getMetadataGroupOrder = (metadataGroup) => {
  const lastMetadatum = metadataGroup[metadataGroup.length - 1]
  return lastMetadatum.timestamp
}

// We ungroup metadata before fetching results' contents to abstract the merge
// logic from the store logic.
export const ungroupMetadata = (metadataGroups) => metadataGroups.flat()
