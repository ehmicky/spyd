import { cwd as getCwd } from 'process'
import { resolve, normalize } from 'path'

import pkgDir from 'pkg-dir'

import {
  validateStringArray,
  validateDeepObject,
  validatePositiveNumber,
} from './validate.js'

// Normalize options shape and do custom validation
export const normalizeOpts = async function(opts) {
  const optsA = NORMALIZERS.reduce(normalizeOpt, opts)
  const optsB = await normalizeData(optsA)
  return optsB
}

const normalizeOpt = function(opts, normalizer) {
  return normalizer(opts)
}

// Validate 'files' option
const normalizeFiles = function({ files, ...opts }) {
  validateStringArray(files, 'files')
  return { ...opts, files }
}

// Validate 'tasks' option
const normalizeTasks = function({ tasks, ...opts }) {
  validateStringArray(tasks, 'tasks')
  return { ...opts, tasks }
}

// Validate 'variations' option
const normalizeVariations = function({ variations, ...opts }) {
  validateStringArray(variations, 'variations')
  return { ...opts, variations }
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

// Add default value to `data' option
const normalizeData = async function({ data: dataDir, cwd, ...opts }) {
  const dataDirA = await getDataDir(dataDir, cwd)
  const dataDirB = normalize(dataDirA)
  return { ...opts, dataDir: dataDirB, cwd }
}

const getDataDir = async function(dataDir, cwd) {
  if (dataDir !== undefined) {
    return dataDir
  }

  const dataRoot = await getDataRoot(cwd)
  const dataDirA = `${dataRoot}/${DATA_DIRNAME}`
  return dataDirA
}

const getDataRoot = async function(cwd) {
  const dataRoot = await pkgDir(cwd)

  if (dataRoot === undefined) {
    return cwd
  }

  return dataRoot
}

const DATA_DIRNAME = 'spyd'

const NORMALIZERS = [
  normalizeFiles,
  normalizeTasks,
  normalizeVariations,
  normalizeDuration,
  normalizeCwd,
  normalizeRunners,
  normalizeReporters,
  normalizeProgress,
]
