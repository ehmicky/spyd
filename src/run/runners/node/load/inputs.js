// `task.inputs` is an array of `inputId` pointing towards the top-level
// `inputs` object. We dereference those pointers here.
// `inputs` are scoped to each benchmark file. However the same
// `inputId` can be used across benchmark files.
// Defaults to using all `inputs`.
export const addTasksInputs = function (tasks, inputs) {
  return tasks.flatMap((task) => addTaskInputs(task, inputs))
}

export const addTaskInputs = function ({ inputsIds, ...task }, inputs) {
  if (inputsIds === undefined && inputs === undefined) {
    return [{ ...task, inputId: DEFAULT_INPUT }]
  }

  const inputsA = getInputs(task, inputsIds, inputs)
  const tasks = inputsA.map((input) => ({ ...task, ...input }))
  const tasksA = tasks.map(bindInput)
  return tasksA
}

// `inputId` must default to an empty string before being sent to parent
const DEFAULT_INPUT = ''

const getInputs = function (task, inputsIds, inputs = []) {
  const inputsA = inputs.map(normalizeInput)

  if (inputsIds === undefined) {
    return inputsA
  }

  return inputsIds.map((inputId) => getInput(inputId, inputsA, task))
}

const normalizeInput = function ({
  id: inputId,
  title: inputTitle,
  value: inputValue,
}) {
  return { inputId, inputTitle, inputValue }
}

const getInput = function (inputId, inputs, { taskId }) {
  const inputA = inputs.find((input) => input.inputId === inputId)

  if (inputA === undefined) {
    throw new TypeError(`Input '${inputId}' of task '${taskId}' does not exist`)
  }

  return inputA
}

// Bind task `input.value` (if present) to `main()`, `before()` and `after()`
const bindInput = function ({ inputValue, ...task }) {
  const funcs = BOUND_FUNCS.filter(
    (name) => task[name] !== undefined,
  ).map((name) => bindFunction(task, name, inputValue))
  return Object.assign({}, task, ...funcs)
}

const BOUND_FUNCS = ['main', 'before', 'after']

const bindFunction = function (task, name, inputValue) {
  const func = task[name]
  const funcA = getBoundFunction({ func, task, name, inputValue })
  return { [name]: funcA }
}

// `func.bind()` is much slower, especially for very fast functions.
const getBoundFunction = function ({
  func,
  task: { before },
  name,
  inputValue,
}) {
  // Passing a `beforeArgs` is slower as well, so we only do it when needed.
  if (name === 'before' || before === undefined) {
    return () => func(inputValue)
  }

  return (beforeArgs) => func(inputValue, beforeArgs)
}
