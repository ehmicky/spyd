import { cwd as getCwd } from 'process'
import { resolve } from 'path'

import { isPlainObject } from '../utils/main.js'

// Normalize options shape and do custom validation
export const normalizeOpts = function(opts) {
  validateFiles(opts)
  validateTasks(opts)
  const optsA = normalizeDuration(opts)
  const optsB = normalizeCwd(optsA)
  const optsC = normalizeRequire(optsB)
  const optsD = normalizeReporters(optsC)
  const optsE = normalizeProgress(optsD)
  return optsE
}

// Validate 'files' option
const validateFiles = function({ files }) {
  if (!files.every(isString)) {
    throw new TypeError(`'files' must be an array of strings: ${files}`)
  }
}

// Validate 'tasks' option
const validateTasks = function({ tasks }) {
  if (tasks !== undefined && !tasks.every(isString)) {
    throw new TypeError(`'tasks' must be an array of strings: ${tasks}`)
  }
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

// Normalize and validate 'report' option
const normalizeReporters = function({ report: reportOpts, ...opts }) {
  Object.entries(reportOpts).forEach(validateReportOpt)
  return { ...opts, reportOpts }
}

const validateReportOpt = function([name, reportOpt]) {
  if (!isPlainObject(reportOpt)) {
    throw new TypeError(`'report.${name}' value must be a plain object`)
  }
}

// Normalize and validate `progress' option
const normalizeProgress = function({ progress: progressOpts, ...opts }) {
  Object.entries(progressOpts).forEach(validateProgressOpt)
  return { ...opts, progressOpts }
}

const validateProgressOpt = function([name, progressOpt]) {
  if (!isPlainObject(progressOpt)) {
    throw new TypeError(`'report.${name}' value must be a plain object`)
  }
}
