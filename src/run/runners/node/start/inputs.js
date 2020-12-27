// Bind task `input` (if present) to `main()`, `beforeEach()` and `afterEach()`
export const bindInput = function (task, input) {
  const funcs = BOUND_FUNCS.map((name) => bindFunction(task, name, input))
  return Object.assign({}, task, ...funcs)
}

const BOUND_FUNCS = ['beforeEach', 'main', 'afterEach']

const bindFunction = function (task, name, input) {
  const func = task[name]

  if (func === undefined) {
    return {}
  }

  const funcA = getBoundFunction({ func, task, name, input })
  return { [name]: funcA }
}

// `func.bind()` is much slower, especially for very fast functions.
// Passing a `beforeArgs` is slower as well, so we only do it when needed.
const getBoundFunction = function ({
  func,
  task: { beforeEach },
  name,
  input,
}) {
  if (name === 'beforeEach' || beforeEach === undefined) {
    return () => func(input)
  }

  return (beforeArgs) => func(input, beforeArgs)
}
