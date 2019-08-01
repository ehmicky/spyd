import { cwd as getCwd } from 'process'
import { resolve } from 'path'

import { REPORTERS } from '../report/reporters/main.js'

// Normalize options shape and do custom validation
export const normalizeOpts = function(opts) {
  const optsA = normalizeDuration(opts)
  const optsB = normalizeCwd(optsA)
  const optsC = normalizeRequire(optsB)
  const optsD = normalizeReporters(optsC)
  return optsD
}

// Normalize and validate 'duration' option
// Duration is specified in seconds by the user but we convert it to nanoseconds
const normalizeDuration = function({ duration, ...opts }) {
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new TypeError(`'duration' must be a positive number: ${duration}`)
  }

  const durationA = duration * SECONDS_TO_NANOSECONDS
  return { ...opts, duration: durationA }
}

const SECONDS_TO_NANOSECONDS = 1e9

// Normalize 'cwd' option
const normalizeCwd = function({ cwd, ...opts }) {
  const cwdA = resolve(getCwd(), cwd)
  return { ...opts, cwd: cwdA }
}

// Normalize and validate 'require' option
const normalizeRequire = function({ require: requireOpt, cwd, ...opts }) {
  if (!requireOpt.every(isString)) {
    throw new TypeError(`'require' must be an array of strings: ${requireOpt}`)
  }

  const requireOptA = requireOpt.map(requiredModule =>
    resolveRequire(requiredModule, cwd),
  )
  return { ...opts, requireOpt: requireOptA, cwd }
}

const isString = function(value) {
  return typeof value === 'string'
}

const resolveRequire = function(requiredModule, cwd) {
  if (!requiredModule.startsWith('.')) {
    return requiredModule
  }

  return resolve(cwd, requiredModule)
}

// Normalize and validate 'reporters' option
const normalizeReporters = function({
  reporters,
  report: reportOpts,
  ...opts
}) {
  reporters.forEach(validateReporter)
  Object.keys(reportOpts).forEach(reporterName =>
    validateReportOpt(reporterName, reporters),
  )
  return { ...opts, reporters, reportOpts }
}

const validateReporter = function(reporter) {
  if (typeof reporter !== 'string') {
    throw new TypeError(`'reporter' must be a string: ${reporter}`)
  }
}

const validateReportOpt = function(reporterName, reporters) {
  if (
    !reporters.includes(reporterName) &&
    REPORTERS[reporterName] === undefined
  ) {
    throw new TypeError(
      `Invalid reporter '${reporterName}' in 'report.${reporterName}' option`,
    )
  }
}
