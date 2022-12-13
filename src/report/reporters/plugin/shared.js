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

// Reporter-specific shared configuration properties
const sharedRules = [
  {
    name: '**',
    pick,
    validate: validateJson,
  },
  new Set([
    [
      // The reporter's output is decided by (in priority order):
      //  - `config.reporter.output` (user-defined, reporter-specific)
      //  - `config.output` (user-defined, any reporters): merged in a previous
      //     step
      //  - `reporter.defaultOutput` (reporter-defined, reporter-specific)
      //  - "stdout" (system-defined, any reporters)
      // The reporter's output also determines the format.
      {
        name: 'output',
        pick,
        default: ({
          context: {
            plugin: { defaultOutput },
          },
        }) => defaultOutput,
        path: normalizeOutputPath,
      },
      {
        name: 'format',
        pick,
        compute: computeFormat,
      },
      {
        name: 'output',
        pick,
        validate: validateOutputFormat,
      },
      // `reporter.config.tty` is `true` when output is interactive terminal.
      // Several reporter's configuration properties default to `true` only when
      // the output is an interactive terminal.
      {
        name: 'tty',
        pick,
        compute: ({ inputs }) => inputs.output === 'stdout' && isTtyOutput(),
      },
      new Set([
        {
          name: 'colors',
          pick,
          default: ({ inputs }) => inputs.tty,
          schema: { type: 'boolean' },
        },
        {
          name: 'quiet',
          pick: amongCommands(['run']),
          default: ({ inputs }) => !inputs.tty,
          schema: { type: 'boolean' },
        },
        {
          name: 'showDiff',
          pick,
          default: ({ inputs }) => inputs.tty,
          schema: { type: 'boolean' },
        },
      ]),
    ],
    {
      name: 'showMetadata',
      pick,
      default: getShowMetadataDefault,
      schema: { type: 'boolean' },
    },
    {
      name: 'showPrecision',
      pick,
      default: DEFAULT_SHOW_PRECISION,
      schema: { type: 'boolean' },
    },
    {
      name: 'showSystem',
      pick,
      schema: { type: 'boolean' },
    },
    {
      name: 'showTitles',
      pick,
      default: DEFAULT_SHOW_TITLES,
      schema: { type: 'boolean' },
    },
  ]),
]

export const shared = normalizeConfigSelectors(sharedRules)
