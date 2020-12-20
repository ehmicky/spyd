// Bind task `input` (if present) to `main()`, `before()` and `after()`
export const bindInput = function (task, input) {
  const funcs = BOUND_FUNCS.map((name) => bindFunction(task, name, input))
  return Object.assign({}, task, ...funcs)
}

const BOUND_FUNCS = ['before', 'main', 'after']

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
const getBoundFunction = function ({ func, task: { before }, name, input }) {
  if (name === 'before' || before === undefined) {
    return () => func(input)
  }

  return (beforeArgs) => func(input, beforeArgs)
}
