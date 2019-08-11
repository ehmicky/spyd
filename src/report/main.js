import { getReporters } from './get.js'
import { handleContent } from './content.js'

// Report benchmark results
export const report = async function(
  benchmark,
  { reportOpts, output, insert, system, link },
) {
  const reporters = getReporters(reportOpts)

  await Promise.all(
    reporters.map(reporter =>
      useReporter({ ...reporter, benchmark, output, insert, system, link }),
    ),
  )
}

// Perform each reporter
const useReporter = async function({
  report: reportFunc,
  reportOpt,
  benchmark,
  output,
  insert,
  system,
  link,
}) {
  const reportOptA = { output, insert, system, link, ...reportOpt }

  const content = await reportFunc(benchmark, reportOptA)

  await handleContent(content, reportOptA)
}
