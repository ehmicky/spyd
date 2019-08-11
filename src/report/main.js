import { getReporters } from './get.js'
import { handleContent } from './content.js'

// Report benchmark results
export const report = async function(
  benchmark,
  { reportOpts, output, insert, system, link },
) {
  const reporters = getReporters({ reportOpts, output, insert, system, link })

  await Promise.all(
    reporters.map(reporter => useReporter({ ...reporter, benchmark })),
  )
}

// Perform each reporter
const useReporter = async function({ main, reportOpt, benchmark }) {
  const content = await main(benchmark, reportOpt)

  await handleContent({ content, reportOpt })
}
