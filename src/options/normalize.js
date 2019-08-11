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
  validateVariations(opts)
  const optsA = normalizeDuration(opts)
  const optsB = normalizeCwd(optsA)
  const optsC = normalizeRunners(optsB)
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

// Validate 'variations' option
const validateVariations = function({ variations }) {
  validateStringArray(variations, 'variations')
}

// Normalize and validate 'duration' option
// Duration is specified in seconds by the user but we convert it to nanoseconds
const normalizeDuration = function({ duration, ...opts }) {
  validatePositiveNumber(duration, 'duration')

  const durationA = duration * NANOSECS_TO_SECS
  return { ...opts, duration: durationA }
}

const NANOSECS_TO_SECS = 1e9

// Normalize 'cwd' option
const normalizeCwd = function({ cwd, ...opts }) {
  const cwdA = resolve(getCwd(), cwd)
  return { ...opts, cwd: cwdA }
}

// Normalize and validate 'run' option
const normalizeRunners = function({ run: runOpts, ...opts }) {
  validateDeepObject(runOpts, 'run')
  return { ...opts, runOpts }
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
