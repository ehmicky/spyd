/* eslint-disable max-lines */
import { amongCommands } from '../../../config/normalize/pick.js'
import { validateJson } from '../../../config/normalize/validate/json.js'
import { normalizeConfigSelectors } from '../../../config/select/normalize.js'
import { getShowMetadataDefault } from '../../../top/omit.js'
import { normalizeOutputPath } from '../../contents/output.js'
import { computeFormat, validateOutputFormat } from '../../formats/detect.js'
import { DEFAULT_SHOW_PRECISION } from '../../normalize/omit.js'
import { DEFAULT_SHOW_TITLES } from '../../normalize/titles_add.js'
import { isTtyOutput } from '../../tty.js'

const pick = amongCommands(['remove', 'run', 'show'])

const any = {
  name: '**',
  pick,
  validate: validateJson,
}

// The reporter's output is decided by (in priority order):
//  - `config.reporter.output` (user-defined, reporter-specific)
//  - `config.output` (user-defined, any reporters): merged in a previous step
//  - `reporter.defaultOutput` (reporter-defined, reporter-specific)
//  - "stdout" (system-defined, any reporters)
// The reporter's output also determines the format.
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
  path: normalizeOutputPath,
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
  schema: { type: 'boolean' },
}

const quiet = {
  name: 'quiet',
  pick: amongCommands(['run']),
  default({ config }) {
    return !config.tty
  },
  schema: { type: 'boolean' },
}

const showDiff = {
  name: 'showDiff',
  pick,
  default({ config }) {
    return config.tty
  },
  schema: { type: 'boolean' },
}

const showMetadata = {
  name: 'showMetadata',
  pick,
  default: getShowMetadataDefault,
  schema: { type: 'boolean' },
}

const showPrecision = {
  name: 'showPrecision',
  pick,
  default: DEFAULT_SHOW_PRECISION,
  schema: { type: 'boolean' },
}

const showSystem = {
  name: 'showSystem',
  pick,
  schema: { type: 'boolean' },
}

const showTitles = {
  name: 'showTitles',
  pick,
  default: DEFAULT_SHOW_TITLES,
  schema: { type: 'boolean' },
}

// Reporter-specific shared configuration properties
export const shared = [
  any,
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
].flatMap(normalizeConfigSelectors)
/* eslint-enable max-lines */
