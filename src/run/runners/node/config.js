import filterObj from 'filter-obj'
import { validate } from 'jest-validate'

// Normalize and validate runConfig
export const normalizeRunConfig = function (runConfig) {
  const runConfigA = filterObj(runConfig, isDefined)
  const runConfigB = normalizeVersions(runConfigA)

  validate(runConfigB, { exampleConfig: EXAMPLE_CONFIG })

  const runConfigC = { ...DEFAULT_CONFIG, ...runConfigB }
  return runConfigC
}

const isDefined = function (key, value) {
  return value !== undefined
}

// If versions is `MAJOR` or `MAJOR.MINOR`, yargs will parse it as a number
const normalizeVersions = function ({ versions, ...runConfig }) {
  const versionsA = typeof versions === 'number' ? String(versions) : versions
  return { ...runConfig, versions: versionsA }
}

const DEFAULT_CONFIG = {}

const EXAMPLE_CONFIG = {
  ...DEFAULT_CONFIG,
  versions: '12,10.5.0,8.0.0',
}
