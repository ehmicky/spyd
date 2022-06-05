// Normalize and retrieve options
export const getOpts = function (opts = {}) {
  if (!isObject(opts)) {
    throw new TypeError(`Options must be a plain object: ${opts}`)
  }

  const { onCreate } = opts
  return { onCreate }
}

const isObject = function (value) {
  return typeof value === 'object' && value !== null
}
