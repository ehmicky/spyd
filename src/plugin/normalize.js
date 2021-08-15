import { isTtyOutput } from '../report/tty.js'

// Normalize plugins configuration
export const normalizePluginsConfig = function (config, command) {
  const configA = normalizeReporters(config, command)
  return configA
}

const normalizeReporters = function (config, command) {
  const reporters = config.reporters
    .map(normalizeReporter)
    .filter((reporter) => shouldUseReporter(reporter, command))
  return { ...config, reporters }
}

const normalizeReporter = function (reporter) {
  const output = getOutput(reporter)
  const tty = getTty(output)
  return { ...reporter, config: { ...reporter.config, output }, tty }
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
  defaultOutput = DEFAULT_OUTPUT,
  config: { output = defaultOutput },
}) {
  return output
}

const DEFAULT_OUTPUT = 'stdout'

// `reporter.tty` is `true` when output is interactive terminal
const getTty = function (output) {
  return output === 'stdout' && isTtyOutput()
}

// Reporting in the `remove` command is shown so the user can be clear about
// which result was removed, and provide with confirmation.
// So we only need to print in the terminal, not output|insert files.
const shouldUseReporter = function ({ tty }, command) {
  return command !== 'remove' || tty
}
