import { v4 as uuidv4 } from 'uuid'

import { getEnvCi } from '../ci/info.js'
import { UserError } from '../error/main.js'

// By default `mergeId` is the current CI build. If not in CI, it is a UUIDv4.
export const getDefaultMergeId = function ({ cwd }) {
  const { buildUrl } = getEnvCi(cwd)

  if (buildUrl === undefined) {
    return uuidv4()
  }

  // TODO: slugify
  return buildUrl
}

// Add `result.mergeId`.
// Also the `merge` configuration property can be "" to re-use the previous
// results' mergeId.
export const addMergeId = function (
  partialResult,
  partialResults,
  { mergeId },
) {
  const mergeIdA = handleSame(partialResults, mergeId)
  return { ...partialResult, mergeId: mergeIdA }
}

const handleSame = function (partialResults, mergeId) {
  if (mergeId !== '') {
    return mergeId
  }

  const lastResult = partialResults[partialResults.length - 1]

  if (lastResult === undefined) {
    throw new UserError(
      "Cannot use merge='' because there are no previous results",
    )
  }

  return lastResult.mergeId
}
