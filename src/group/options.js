import { v4 as uuidv4 } from 'uuid'

import { getEnvCi } from '../ci/info.js'

// By default `group` is the current CI build. If not in CI, it is a UUIDv4.
export const getDefaultGroup = function ({ cwd }) {
  const { service, build: buildNumber, slug } = getEnvCi(cwd)

  if (service === undefined || buildNumber === undefined) {
    return uuidv4()
  }

  const slugA = slug === undefined ? undefined : slug.replace('/', '-')
  return [slugA, service, buildNumber].filter(Boolean).join('-')
}

// Add `benchmark.group`.
// Also the `group` option can be "" to re-use the previous benchmark's group.
export const addGroup = function (benchmark, benchmarks, { group }) {
  const groupA = handleSame(benchmarks, group)
  return { ...benchmark, group: groupA }
}

const handleSame = function (benchmarks, group) {
  if (group !== '') {
    return group
  }

  const lastBenchmark = benchmarks[benchmarks.length - 1]

  if (lastBenchmark === undefined) {
    throw new Error(
      "Cannot use group='' because there are no previous benchmarks",
    )
  }

  return lastBenchmark.group
}
