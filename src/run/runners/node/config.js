import filterObj from 'filter-obj'
import { validate } from 'jest-validate'

// Normalize and validate runnerConfig
export const normalizeRunConfig = function (runnerConfig) {
  const runnerConfigA = filterObj(runnerConfig, isDefined)
  const runnerConfigB = normalizeVersion(runnerConfigA)

  validate(runnerConfigB, { exampleConfig: EXAMPLE_CONFIG })

  return runnerConfigB
}

const isDefined = function (key, value) {
  return value !== undefined
}

// If `version` is `MAJOR` or `MAJOR.MINOR`, yargs will parse it as a number
const normalizeVersion = function ({ version, ...runnerConfig }) {
  const versionA = typeof version === 'number' ? String(version) : version
  return { ...runnerConfig, version: versionA }
}

const EXAMPLE_CONFIG = {
  tasks: 'tasks.js',
  version: '12',
}
