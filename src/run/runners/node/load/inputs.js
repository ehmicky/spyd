// Bind task `input` (if present) to `main()`, `before()` and `after()`
export const bindInput = function (task, input) {
  const funcs = BOUND_FUNCS.filter(
    (name) => task[name] !== undefined,
  ).map((name) => bindFunction(task, name, input))
  return Object.assign({}, task, ...funcs)
}

const BOUND_FUNCS = ['main', 'before', 'after']

const bindFunction = function (task, name, input) {
  const func = task[name]
  const funcA = getBoundFunction({ func, task, name, input })
  return { [name]: funcA }
}

// `func.bind()` is much slower, especially for very fast functions.
const getBoundFunction = function ({ func, task: { before }, name, input }) {
  // Passing a `beforeArgs` is slower as well, so we only do it when needed.
  if (name === 'before' || before === undefined) {
    return () => func(input)
  }

  return (beforeArgs) => func(input, beforeArgs)
}
