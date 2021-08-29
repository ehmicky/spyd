// Delta can be "first" to compare with the least recent result.
const parseFirst = function (delta) {
  if (delta !== FIRST_DELTA) {
    return
  }

  return delta
}

const FIRST_DELTA = 'first'

const findByFirst = function () {
  return 0
}

export const firstFormat = {
  type: 'first',
  message: 'first result',
  parse: parseFirst,
  find: findByFirst,
}
