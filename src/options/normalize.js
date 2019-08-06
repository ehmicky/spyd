import { cwd as getCwd } from 'process'
import { resolve } from 'path'

import {
  validateStringArray,
  validateDeepObject,
  validatePositiveNumber,
} from './validate.js'

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
  validateStringArray(files, 'files')
}

// Validate 'tasks' option
const validateTasks = function({ tasks }) {
  validateStringArray(tasks, 'tasks')
}

// Normalize and validate 'duration' option
// Duration is specified in seconds by the user but we convert it to nanoseconds
const normalizeDuration = function({ duration, ...opts }) {
  validatePositiveNumber(duration, 'duration')

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
  validateStringArray(requireOpt, 'require')

  const requireOptA = requireOpt.map(requiredModule =>
    resolveRequire(requiredModule, cwd),
  )
  return { ...opts, requireOpt: requireOptA, cwd }
}

const resolveRequire = function(requiredModule, cwd) {
  if (!requiredModule.startsWith('.')) {
    return requiredModule
  }

  return resolve(cwd, requiredModule)
}

// Normalize and validate 'report' option
const normalizeReporters = function({ report: reportOpts, ...opts }) {
  validateDeepObject(reportOpts, 'report')
  return { ...opts, reportOpts }
}

// Normalize and validate `progress' option
const normalizeProgress = function({ progress: progressOpts, ...opts }) {
  validateDeepObject(progressOpts, 'progress')
  return { ...opts, progressOpts }
}
