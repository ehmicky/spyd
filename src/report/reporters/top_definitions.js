/* eslint-disable max-lines */
import { getPropCwd } from '../../config/normalize/cwd.js'
import { amongCommands } from '../../config/normalize/pick.js'
import { validateRegularFile } from '../../config/normalize/validate/fs.js'
import { validateBoolean } from '../../config/normalize/validate/simple.js'
import { getShowMetadataDefault } from '../../top/omit.js'
import { isOutputPath } from '../contents/output.js'
import { computeFormat, validateOutputFormat } from '../formats/detect.js'
import { DEFAULT_SHOW_PRECISION } from '../normalize/omit.js'
import { DEFAULT_SHOW_TITLES } from '../normalize/titles_add.js'
import { isTtyOutput } from '../tty.js'

const pick = amongCommands(['remove', 'run', 'show'])

// The reporter's output is decided by (in priority order):
//  - `config.reporterConfig.{reporterId}.output`
//    (user-defined, reporter-specific)
//  - `config.output` (user-defined, any reporters): merged in a previous
//    step
//  - `reporter.defaultOutput` (reporter-defined, reporter-specific)
//  - "stdout" (system-defined, any reporters)
// `reporter.defaultOutput` is meant for reporters to define the default
// format and filename
const output = {
  name: 'output',
  pick,
  default({
    context: {
      plugin: { defaultOutput },
    },
  }) {
    return defaultOutput
  },
  path: isOutputPath,
  cwd: getPropCwd,
  validate: validateRegularFile,
}

const format = {
  name: 'format',
  pick,
  compute: computeFormat,
}

const outputFormat = {
  name: 'output',
  pick,
  validate: validateOutputFormat,
}

// `reporter.config.tty` is `true` when output is interactive terminal.
// Several reporter's configuration properties default to `true` only when
// the output is an interactive terminal.
const tty = {
  name: 'tty',
  pick,
  compute({ config }) {
    return config.output === 'stdout' && isTtyOutput()
  },
}

const colors = {
  name: 'colors',
  pick,
  default({ config }) {
    return config.tty
  },
  validate: validateBoolean,
}

const quiet = {
  name: 'quiet',
  pick: amongCommands(['run']),
  default({ config }) {
    return !config.tty
  },
  validate: validateBoolean,
}

const showDiff = {
  name: 'showDiff',
  pick,
  default({ config }) {
    return config.tty
  },
  validate: validateBoolean,
}

const showMetadata = {
  name: 'showMetadata',
  pick,
  default: getShowMetadataDefault,
  validate: validateBoolean,
}

const showPrecision = {
  name: 'showPrecision',
  pick,
  default: DEFAULT_SHOW_PRECISION,
  validate: validateBoolean,
}

const showSystem = {
  name: 'showSystem',
  pick,
  validate: validateBoolean,
}

const showTitles = {
  name: 'showTitles',
  pick,
  default: DEFAULT_SHOW_TITLES,
  validate: validateBoolean,
}

// Reporter-specific definitions of top-level properties
export const reportersTopDefinitions = [
  output,
  format,
  outputFormat,
  tty,
  colors,
  quiet,
  showDiff,
  showMetadata,
  showPrecision,
  showSystem,
  showTitles,
]
/* eslint-enable max-lines */
