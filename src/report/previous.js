// Add:
//  - `benchmark.previous`: all previous benchmarks
//  - `benchmark.iterations[*].previous`: previous iteration with same runner,
//    task and variation
// When combined with the 'show' option, we only show the benchmarks before it.
export const addPrevious = async function({ benchmark, dataDir, store }) {
  const benchmarks = await listBenchmarks({ dataDir, store })
  const previous = benchmarks.filter(
    benchmarkA => benchmarkA.timestamp < benchmark.timestamp,
  )
  return { ...benchmark, previous }
}

const listBenchmarks = async function({ dataDir, store: { list: listStore } }) {
  try {
    const benchmarks = await listStore(dataDir)
    return benchmarks
  } catch (error) {
    throw new Error(
      `Could not list benchmarks from '${dataDir}':\n${error.message}`,
    )
  }
}
