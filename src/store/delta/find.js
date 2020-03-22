// Get previous benchmark index by benchmark delta
export const find = function (benchmarks, { queryType, queryValue }) {
  if (benchmarks.length === 0) {
    throw new Error('No previous benchmarks')
  }

  const index = QUERIES[queryType](benchmarks, queryValue)

  if (index === undefined) {
    throw new Error('No matching benchmarks')
  }

  return index
}

const findByCount = function (benchmarks, count) {
  if (count > benchmarks.length) {
    return
  }

  return benchmarks.length - count
}

const findByTimestamp = function (benchmarks, timestamp) {
  const index = benchmarks.findIndex(
    (benchmark) => benchmark.timestamp > timestamp,
  )

  if (index === 0) {
    return
  }

  if (index === -1) {
    return benchmarks.length - 1
  }

  return index - 1
}

const QUERIES = {
  count: findByCount,
  timestamp: findByTimestamp,
}
