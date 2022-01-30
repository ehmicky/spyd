import { detectFormat } from '../formats/detect.js'
import { isTtyOutput } from '../tty.js'

import { addProgrammaticReporter } from './programmatic.js'
import { validateOutputGroups } from './validate.js'

// Normalize reporters configuration
export const normalizeReporters = function (config, command) {
  const reporters = config.reporters
    .map(addOutput)
    .filter((reporter) => shouldUseReporter(reporter, command))
    .map(addDefaultReporterConfig)
  validateOutputGroups(reporters)
  const reportersA = addProgrammaticReporter(reporters)
  return { ...config, reporters: reportersA }
}

const addOutput = function (reporter) {
  const output = getOutput(reporter)
  const format = detectFormat(reporter, output)
  const tty = getTty(output)
  return { ...reporter, config: { ...reporter.config, format, tty, output } }
}

// The reporter's output is decided by (in priority order):
//  - `config.reporterConfig.{reporterId}.output`
//    (user-defined, reporter-specific)
//  - `config.output` (user-defined, any reporters): merged in a previous step
//  - `reporter.defaultOutput` (reporter-defined, reporter-specific)
//  - "stdout" (system-defined, any reporters)
// `reporter.defaultOutput` is meant for reporters to define the default format
// and filename
const getOutput = function ({
  defaultOutput,
  config: { output = defaultOutput },
}) {
  return output
}

// `reporter.config.tty` is `true` when output is interactive terminal
const getTty = function (output) {
  return output === 'stdout' && isTtyOutput()
}

// Reporting in the `remove` command is shown so the user can be clear about
// which result was removed, and provide with confirmation.
// So we only need to print in the terminal, not output|insert files.
const shouldUseReporter = function ({ config: { tty } }, command) {
  return command !== 'remove' || tty
}

// Add default values for each reporter's configuration
// Several reporter's configuration properties default to `true` only when the
// output is an interactive terminal.
const addDefaultReporterConfig = function ({
  config: { tty, quiet = !tty, showDiff = tty, colors = tty, ...config },
  ...reporter
}) {
  return {
    ...reporter,
    config: { ...config, tty, quiet, showDiff, colors },
  }
}
