import mapObj from 'map-obj'

// Bind task `input` (if present) to all functions
export const bindInput = function (task, input) {
  return mapObj(task, bindFunction.bind(undefined, input))
}

const bindFunction = function (input, key, value) {
  if (value === undefined || !BOUND_FUNCS.has(key)) {
    return [key, value]
  }

  return [key, (beforeArgs) => value(input, beforeArgs)]
}

const BOUND_FUNCS = new Set([
  'beforeAll',
  'beforeEach',
  'main',
  'afterEach',
  'afterAll',
])
