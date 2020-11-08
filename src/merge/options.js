import { v4 as uuidv4 } from 'uuid'

import { getEnvCi } from '../ci/info.js'

// By default `mergeId` is the current CI build. If not in CI, it is a UUIDv4.
export const getDefaultMergeId = function ({ cwd }) {
  const { service, build: buildNumber, slug } = getEnvCi(cwd)

  if (service === undefined || buildNumber === undefined) {
    return uuidv4()
  }

  const slugA = slug === undefined ? undefined : slug.replace('/', '-')
  return [slugA, service, buildNumber].filter(Boolean).join('-')
}

// Add `benchmark.mergeId`.
// Also the `merge` option can be "" to re-use the previous benchmark's mergeId.
export const addMergeId = function (benchmark, benchmarks, { mergeId }) {
  const mergeIdA = handleSame(benchmarks, mergeId)
  return { ...benchmark, mergeId: mergeIdA }
}

const handleSame = function (benchmarks, mergeId) {
  if (mergeId !== '') {
    return mergeId
  }

  const lastBenchmark = benchmarks[benchmarks.length - 1]

  if (lastBenchmark === undefined) {
    throw new Error(
      "Cannot use merge='' because there are no previous benchmarks",
    )
  }

  return lastBenchmark.mergeId
}
