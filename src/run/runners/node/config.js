import filterObj from 'filter-obj'
import { validate } from 'jest-validate'

// Normalize and validate runConfig
export const normalizeRunConfig = function (runConfig) {
  const runConfigA = filterObj(runConfig, isDefined)
  const runConfigB = normalizeVersion(runConfigA)

  validate(runConfigB, { exampleConfig: EXAMPLE_CONFIG })

  const runConfigC = { ...DEFAULT_CONFIG, ...runConfigB }
  return runConfigC
}

const isDefined = function (key, value) {
  return value !== undefined
}

// If `version` is `MAJOR` or `MAJOR.MINOR`, yargs will parse it as a number
const normalizeVersion = function ({ version, ...runConfig }) {
  const versionA = typeof version === 'number' ? String(version) : version
  return { ...runConfig, version: versionA }
}

const DEFAULT_CONFIG = {}

const EXAMPLE_CONFIG = {
  ...DEFAULT_CONFIG,
  tasks: 'tasks.js',
  version: '12',
}
