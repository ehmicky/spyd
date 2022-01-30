import { DEFAULT_REPORTER_OUTPUT } from '../../report/contents/output.js'
import { getReportMethods } from '../../report/formats/list.js'
import {
  BUILTIN_REPORTERS,
  DEFAULT_REPORTERS,
} from '../../report/reporters/main.js'
import { BUILTIN_RUNNERS, DEFAULT_RUNNERS } from '../../runners/main.js'
import { normalizeOptionalArray } from '../normalize/transform.js'
import {
  validateBoolean,
  validateDefinedString,
  validateObject,
  validateEmptyArray,
  validateFunction,
} from '../normalize/validate.js'

// All plugin types
export const PLUGIN_TYPES = {
  runner: {
    // Shown in error message
    type: 'runner',
    // Internal variable name
    varName: 'runners',
    // Configuration property selecting the plugin
    selectProp: 'runner',
    // Configuration property configuring the plugin
    configProp: 'runnerConfig',
    // Configuration properties which can be overridden by each plugin
    topProps: ['tasks'],
    // Prefix of the npm package
    modulePrefix: 'spyd-runner-',
    // Commands which use the plugin
    commands: ['dev', 'run'],
    // Whether this is a combination's dimension.
    // When false, this allows using custom prefixes.
    isCombinationDimension: true,
    // Builtin plugins
    builtins: BUILTIN_RUNNERS,
    // Default value for the `selectProp`
    selectPropDefault: DEFAULT_RUNNERS,
    // Additional configuration definition for `selectProp`
    selectPropDefinition: {
      validate: validateEmptyArray,
    },
    mainDefinitions: [
      {
        name: 'launch',
        required: true,
        validate: validateFunction,
      },
    ],
  },
  reporter: {
    type: 'reporter',
    varName: 'reporters',
    selectProp: 'reporter',
    configProp: 'reporterConfig',
    topProps: [
      'quiet',
      'output',
      'colors',
      'showTitles',
      'showSystem',
      'showMetadata',
      'showPrecision',
      'showDiff',
    ],
    modulePrefix: 'spyd-reporter-',
    commands: ['remove', 'run', 'show'],
    isCombinationDimension: false,
    builtins: BUILTIN_REPORTERS,
    selectPropDefault: DEFAULT_REPORTERS,
    selectPropDefinition: {
      transform(value, { config }) {
        return config.force ? [] : normalizeOptionalArray(value)
      },
    },
    mainDefinitions: [
      ...getReportMethods().map((name) => ({
        name,
        validate: validateFunction,
      })),
      {
        name: 'capabilities',
        default: {},
        validate: validateObject,
      },
      {
        name: 'capabilities.debugStats',
        default: false,
        validate: validateBoolean,
      },
      {
        name: 'capabilities.history',
        default: false,
        validate: validateBoolean,
      },
      {
        name: 'defaultOutput',
        default: DEFAULT_REPORTER_OUTPUT,
        validate: validateDefinedString,
      },
    ],
  },
}

export const PLUGIN_TYPES_ARRAY = Object.values(PLUGIN_TYPES)

// Shared configurations are plugins when using the npm resolver.
// They are handled differently, i.e. require a separate type.
export const CONFIG_PLUGIN_TYPE = {
  type: 'config',
  modulePrefix: 'spyd-config-',
}
