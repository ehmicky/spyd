// Normalize and retrieve options
export const getOpts = function (opts = {}) {
  if (!isObject(opts)) {
    throw new TypeError(`Options must be a plain object: ${opts}`)
  }

  const { onCreate } = opts
  validateOnCreate(onCreate)
  return { onCreate }
}

const isObject = function (value) {
  return typeof value === 'object' && value !== null
}

const validateOnCreate = function (onCreate) {
  if (onCreate !== undefined && typeof onCreate !== 'function') {
    throw new TypeError(`"onCreate" option must be a function: ${onCreate}`)
  }
}
