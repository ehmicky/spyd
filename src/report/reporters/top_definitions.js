import { computeFormat, validateFormat } from '../formats/detect.js'
import { isTtyOutput } from '../tty.js'

// Reporter-specific definitions of top-level properties
export const reportersTopDefinitions = [
  // The reporter's output is decided by (in priority order):
  //  - `config.reporterConfig.{reporterId}.output`
  //    (user-defined, reporter-specific)
  //  - `config.output` (user-defined, any reporters): merged in a previous
  //    step
  //  - `reporter.defaultOutput` (reporter-defined, reporter-specific)
  //  - "stdout" (system-defined, any reporters)
  // `reporter.defaultOutput` is meant for reporters to define the default
  // format and filename
  {
    name: 'output',
    default({
      context: {
        plugin: { defaultOutput },
      },
    }) {
      return defaultOutput
    },
  },
  {
    name: 'format',
    compute: computeFormat,
    validate: validateFormat,
  },
  // `reporter.config.tty` is `true` when output is interactive terminal.
  // Several reporter's configuration properties default to `true` only when
  // the output is an interactive terminal.
  {
    name: 'tty',
    compute({ config: { output } }) {
      return output === 'stdout' && isTtyOutput()
    },
  },
  {
    name: 'quiet',
    default({ config: { tty } }) {
      return !tty
    },
  },
  {
    name: 'showDiff',
    default({ config: { tty } }) {
      return tty
    },
  },
  {
    name: 'colors',
    default({ config: { tty } }) {
      return tty
    },
  },
]
