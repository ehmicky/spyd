import { groupBy } from '../../utils/group.js'

// Group either metadata or rawResults by mergeId
// `result.mergeId` defaults to `result.id`
//  - This allows merging to previous results even when the user did not
//    previously intend to
//  - However, the default value is assigned at load time, it is not persisted
export const groupByMergeId = function (metadataOrRawResults) {
  return Object.values(groupBy(metadataOrRawResults, getMergeId))
}

const getMergeId = function ({ id, mergeId = id }) {
  return mergeId
}
