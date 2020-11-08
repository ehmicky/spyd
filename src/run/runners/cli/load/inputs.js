import { applyTemplate } from '../template.js'

// `task.inputs` is an array of `inputId` pointing towards the top-level
// `inputs` object. We dereference those pointers here.
// `inputs` are scoped to each benchmark file. However the same
// `inputId` can be used across benchmark files.
// Defaults to using all `inputs`.
export const addTasksInputs = function ({
  tasks,
  inputs = DEFAULT_INPUTS,
  variables,
}) {
  return tasks.flatMap((task) => addTaskInputs({ task, inputs, variables }))
}

const DEFAULT_INPUTS = [{ id: '' }]

export const addTaskInputs = function ({
  task: { inputsIds, ...task },
  inputs,
  variables,
}) {
  const inputsA = getInputs({ task, inputsIds, inputs, variables })
  const tasks = inputsA.map((input) => addInput(task, input, variables))
  return tasks
}

const getInputs = function ({ task, inputsIds, inputs = [], variables }) {
  const inputsA = inputs.map((input) => normalizeInput(input, variables))

  if (inputsIds === undefined) {
    return inputsA
  }

  return inputsIds.map((inputId) => getInput(inputId, inputsA, task))
}

// Apply templates on inputs
const normalizeInput = function ({ id, title, value }, variables) {
  const inputId = applyTemplate(id, variables)
  const inputTitle = applyTemplate(title, variables)
  const inputValue = getInputValue(value, variables)
  return { inputId, inputTitle, inputValue }
}

// `value` can be a string but also a number or boolean, to avoid quoting
// those in YAML
const getInputValue = function (value, variables) {
  if (value === undefined) {
    return ''
  }

  if (typeof value !== 'string') {
    return String(value)
  }

  return applyTemplate(value, variables)
}

// Add each input to each task by adding the {{inputId}} variable
const getInput = function (inputId, inputs, { taskId }) {
  const inputA = inputs.find(({ inputId: inputIdA }) => inputIdA === inputId)

  if (inputA === undefined) {
    throw new TypeError(`Input '${inputId}' of task '${taskId}' does not exist`)
  }

  return inputA
}

const addInput = function (task, { inputValue, ...input }, variables) {
  const variablesA = { ...variables, input: inputValue }
  return { ...task, ...input, variables: variablesA }
}
