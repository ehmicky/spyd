import { addProgrammaticReporter } from './programmatic.js'
import { validateOutputGroups } from './validate.js'

// Normalize reporters configuration
export const normalizeReporters = function (config, command) {
  const reporters = config.reporters.filter((reporter) =>
    shouldUseReporter(reporter, command),
  )
  validateOutputGroups(reporters)
  const reportersA = addProgrammaticReporter(reporters)
  return { ...config, reporters: reportersA }
}

// Reporting in the `remove` command is shown so the user can be clear about
// which result was removed, and provide with confirmation.
// So we only need to print in the terminal, not output|insert files.
const shouldUseReporter = function ({ config: { tty } }, command) {
  return command !== 'remove' || tty
}
