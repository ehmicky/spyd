import { TasksRunError } from '../../common/error.js'

// Perform `beforeAll`, if defined
export const before = async function ({ task: { beforeAll }, inputs }) {
  if (beforeAll === undefined) {
    return
  }

  try {
    await beforeAll(inputs)
  } catch (cause) {
    throw new TasksRunError('', { cause })
  }
}

// Perform `afterAll`, if defined
export const after = async function ({ task: { afterAll }, inputs }) {
  if (afterAll === undefined) {
    return
  }

  try {
    await afterAll(inputs)
  } catch (cause) {
    throw new TasksRunError('', { cause })
  }
}
