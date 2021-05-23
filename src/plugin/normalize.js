import { isTtyOutput } from '../report/tty.js'

// Normalize plugins configuration
export const normalizePluginsConfig = function (config, command) {
  const configA = normalizeReporters(config, command)
  return configA
}

// Reporting in the `remove` command is shown so the user can be clear about
// which result was removed, and provide with confirmation.
// So we only need to print in the terminal, not output|insert files.
const normalizeReporters = function (config, command) {
  const reporters = config.reporters.map(addTty)

  if (command !== 'remove') {
    return { ...config, reporters }
  }

  const reportersA = reporters.filter(isTty)
  return { ...config, reporters: reportersA }
}

// `reporter.tty` is `true` when output is interactive terminal
const addTty = function (reporter) {
  const tty = reporter.config.output === 'stdout' && isTtyOutput()
  return { ...reporter, tty }
}

const isTty = function ({ tty }) {
  return tty
}
