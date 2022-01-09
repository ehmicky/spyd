import { groupBy } from '../../utils/group.js'

// `merge` can be "last", which refers to the previous result's mergeId:
//  - If there are no previous results, the current result's id is used
//  - If the previous result has no mergeId, its id is used
// The new value is persisted in results.
export const normalizeMergeId = function (targetResult, history) {
  return targetResult.mergeId === LAST_MERGE_ID
    ? { ...targetResult, mergeId: replaceMergeIdLast(targetResult, history) }
    : targetResult
}

const LAST_MERGE_ID = 'last'

const replaceMergeIdLast = function (targetResult, history) {
  if (history.length === 0) {
    return targetResult.id
  }

  const { id, mergeId = id } = history[history.length - 1]
  return mergeId
}

// Group either metadata or rawResults by mergeId:
//  - They must both have the following properties: `id`, `mergeId`
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
