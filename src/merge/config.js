import { v4 as uuidv4 } from 'uuid'

import { getEnvCi } from '../ci/info.js'
import { UserError } from '../error/main.js'

// By default `mergeId` is the current CI build. If not in CI, it is a UUIDv4.
export const getDefaultMergeId = function ({ cwd }) {
  const { service, build: buildNumber, slug } = getEnvCi(cwd)

  if (service === undefined || buildNumber === undefined) {
    return uuidv4()
  }

  const slugA = slug === undefined ? undefined : slug.replace('/', '-')
  return [slugA, service, buildNumber].filter(Boolean).join('-')
}

// Add `result.mergeId`.
// Also the `merge` option can be "" to re-use the previous results' mergeId.
export const addMergeId = function (result, results, { mergeId }) {
  const mergeIdA = handleSame(results, mergeId)
  return { ...result, mergeId: mergeIdA }
}

const handleSame = function (results, mergeId) {
  if (mergeId !== '') {
    return mergeId
  }

  const lastResult = results[results.length - 1]

  if (lastResult === undefined) {
    throw new UserError(
      "Cannot use merge='' because there are no previous results",
    )
  }

  return lastResult.mergeId
}
