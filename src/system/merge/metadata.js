import sortOn from 'sort-on'

import { groupBy } from '../../utils/group.js'

export const groupMetadata = function (metadata) {
  const metadataA = sortOn(metadata, 'timestamp')
  const metadataGroups = Object.values(groupBy(metadataA, getMetadatumGroup))
  const metadataGroupsA = sortOn(metadataGroups, getMetadataGroupOrder)
  return metadataGroupsA
}

// `result.mergeId` defaults to `result.id`.
//  - This allows merging to previous results even when the user did not
//    previously intend to
//  - However, the default value is assigned at load time, it is not persisted
const getMetadatumGroup = function ({ id, mergeId = id }) {
  return mergeId
}

const getMetadataGroupOrder = function (metadataGroup) {
  const lastMetadatum = metadataGroup[metadataGroup.length - 1]
  return lastMetadatum.timestamp
}

export const ungroupMetadata = function (metadataGroups) {
  return metadataGroups.flat()
}
