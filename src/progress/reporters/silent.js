// eslint-disable-next-line no-empty-function
const noop = function() {}

// Silent reporter
export const silent = { start: noop, update: noop, stop: noop }
