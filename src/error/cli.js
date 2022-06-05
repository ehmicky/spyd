import process from 'process'

import { normalizeError } from './normalize/main.js'

// Print CLI errors and exit, depending on the error type
export const handleCliError = function (error, opts) {
  const errorA = normalizeError(error)
  const { silent, short, exitCode } = getOpts(errorA, opts)
  printError(errorA, silent, short)
  exitProcess(exitCode)
}

const getOpts = function (error, opts = {}) {
  if (!isObject(opts)) {
    return handleOptsError(
      `options must be a plain object: ${opts}`,
      DEFAULT_OPTS,
    )
  }

  const { types = {}, ...optsA } = opts
  const typesOpts = findTypesOpts(types, error.name)
  const optsB = { ...DEFAULT_OPTS, ...optsA, ...typesOpts }
  const optsC = normalizeOpts(optsB)
  return optsC
}

const findTypesOpts = function (types, name) {
  if (!isObject(types)) {
    return handleOptsError(`options.types must be a plain object: ${types}`, {})
  }

  return getTypesOpts(types, name) || getTypesOpts(types, 'default') || {}
}

const getTypesOpts = function (types, name) {
  const typesOpts = types[name]

  if (typesOpts === undefined) {
    return
  }

  if (!isObject(typesOpts)) {
    return handleOptsError(
      `options.types.${name} must be a plain object: ${typesOpts}`,
      {},
    )
  }

  return typesOpts
}

const DEFAULT_OPTS = { silent: false, short: false, exitCode: 1 }

const isObject = function (value) {
  return typeof value === 'object' && value !== null
}

const normalizeOpts = function ({ silent, short, exitCode }) {
  return {
    silent: normalizeBooleanOpt(silent, 'silent'),
    short: normalizeBooleanOpt(short, 'short'),
    exitCode: normalizeExitCode(exitCode),
  }
}

const normalizeBooleanOpt = function (value, optName) {
  return typeof value === 'boolean'
    ? value
    : handleOptsError(
        `options.${optName} must be a boolean: ${value}`,
        DEFAULT_OPTS[optName],
      )
}

const normalizeExitCode = function (exitCode) {
  return Number.isInteger(exitCode) &&
    exitCode >= MIN_EXIT_CODE &&
    exitCode <= MAX_EXIT_CODE
    ? exitCode
    : handleOptsError(
        `options.exitCode must be between ${MIN_EXIT_CODE} and ${MAX_EXIT_CODE}: ${exitCode}`,
        DEFAULT_OPTS.exitCode,
      )
}

const MIN_EXIT_CODE = 0
// 126-255 have special meaning in Bash
const MAX_EXIT_CODE = 125

// We do not throw since we are using the top-level error handling logic
const handleOptsError = function (message, value) {
  // eslint-disable-next-line no-restricted-globals, no-console
  console.error(`handle-cli-error invalid usage: ${message}`)
  return value
}

// Print the error message and|or stack trace
const printError = function (error, silent, short) {
  if (silent) {
    return
  }

  const errorMessage = short ? error.message : error.stack
  // eslint-disable-next-line no-restricted-globals, no-console
  console.error(errorMessage)
}

// We use `process.exitCode` instead of `process.exit()` to let any pending
// tasks complete, with a timeout
const exitProcess = function (exitCode) {
  process.exitCode = exitCode
  setTimeout(() => {
    // eslint-disable-next-line unicorn/no-process-exit, n/no-process-exit
    process.exit(exitCode)
  }, EXIT_TIMEOUT).unref()
}

const EXIT_TIMEOUT = 5e3
