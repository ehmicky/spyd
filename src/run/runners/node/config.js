import filterObj from 'filter-obj'
import { validate } from 'jest-validate'

// Normalize and validate runnerConfig
export const normalizeRunConfig = function (runnerConfig) {
  const runnerConfigA = filterObj(runnerConfig, isDefined)
  const runnerConfigB = normalizeVersion(runnerConfigA)

  validate(runnerConfigB, { exampleConfig: EXAMPLE_CONFIG })

  const runnerConfigC = { ...DEFAULT_CONFIG, ...runnerConfigB }
  return runnerConfigC
}

const isDefined = function (key, value) {
  return value !== undefined
}

// If `version` is `MAJOR` or `MAJOR.MINOR`, yargs will parse it as a number
const normalizeVersion = function ({ version, ...runnerConfig }) {
  const versionA = typeof version === 'number' ? String(version) : version
  return { ...runnerConfig, version: versionA }
}

const DEFAULT_CONFIG = {}

const EXAMPLE_CONFIG = {
  ...DEFAULT_CONFIG,
  tasks: 'tasks.js',
  version: '12',
}
