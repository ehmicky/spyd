// Delta can be "first" to compare with the least recent rawResult.
const parseFirst = (delta) => {
  if (delta !== FIRST_DELTA) {
    return
  }

  return delta
}

const FIRST_DELTA = 'first'

const findByFirst = () => 0

export const firstFormat = {
  type: 'first',
  message: 'first result',
  parse: parseFirst,
  find: findByFirst,
}
