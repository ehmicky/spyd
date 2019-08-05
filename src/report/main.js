import { getReporters } from './get.js'
import { handleContent } from './content.js'

// Report benchmark results
export const report = async function(
  benchmark,
  { reporters, reportOpts, output, insert, system, link },
) {
  const reportersA = getReporters({
    reporters,
    reportOpts,
    output,
    insert,
    system,
    link,
  })

  const promises = reportersA.map(reporter =>
    useReporter({ ...reporter, benchmark }),
  )
  await Promise.all(promises)
}

// Perform each reporter
const useReporter = async function({ main, reportOpt, benchmark }) {
  const content = await main(benchmark, reportOpt)

  await handleContent({ content, reportOpt })
}
