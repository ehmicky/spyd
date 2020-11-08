// We distinguish between user, plugin and core errors
// eslint-disable-next-line fp/no-class
export class UserError extends Error {
  constructor() {
    super()
    // eslint-disable-next-line fp/no-this, fp/no-mutation
    this.name = 'UserError'
  }
}

// eslint-disable-next-line fp/no-class
export class PluginError extends Error {
  constructor() {
    super()
    // eslint-disable-next-line fp/no-this, fp/no-mutation
    this.name = 'PluginError'
  }
}

// eslint-disable-next-line fp/no-class
export class CoreError extends Error {
  constructor() {
    super()
    // eslint-disable-next-line fp/no-this, fp/no-mutation
    this.name = 'CoreError'
  }
}

// Error type-specific behavior
const ERROR_PROPS = {
  UserError: { exitCode: 1, printStack: false },
  PluginError: { exitCode: 2, printStack: false },
  CoreError: { exitCode: 3, printStack: true },
}

const CORE_ERROR_NAME = 'CoreError'

export const getErrorProps = function ({ name }) {
  const nameA = ERROR_PROPS[name] === undefined ? CORE_ERROR_NAME : name
  return ERROR_PROPS[nameA]
}

// Ensure we are using an Error instance
export const normalizeError = function (error) {
  if (error instanceof Error) {
    return error
  }

  return new Error(error)
}
