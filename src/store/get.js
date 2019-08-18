// Get previous benchmark by `count` or `timestamp`
export const get = function(benchmarks, { queryType, queryValue }) {
  try {
    const index = getIndex(benchmarks, queryType, queryValue)
    const benchmark = benchmarks[index]
    return benchmark
  } catch (error) {
    throw new Error(`Could not find benchmark: ${error.message}`)
  }
}

// Same but index only
export const getIndex = function(benchmarks, queryType, queryValue) {
  if (benchmarks.length === 0) {
    throw new Error('No previous benchmarks')
  }

  const index = QUERIES[queryType](benchmarks, queryValue)

  if (index === undefined) {
    throw new Error('No matching benchmarks')
  }

  return index
}

const findByCount = function(benchmarks, count) {
  if (count > benchmarks.length) {
    return
  }

  return benchmarks.length - count
}

const findByTimestamp = function(benchmarks, timestamp) {
  const index = benchmarks.findIndex(
    benchmark => benchmark.timestamp > timestamp,
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
