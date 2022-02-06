import { wrapError } from '../../../error/wrap.js'
import { TasksRunError } from '../../common/error.js'

// Perform `beforeAll`, if defined
export const before = async function ({ task: { beforeAll }, inputs }) {
  if (beforeAll === undefined) {
    return
  }

  try {
    await beforeAll(inputs)
  } catch (error) {
    throw wrapError(error, '', TasksRunError)
  }
}

// Perform `afterAll`, if defined
export const after = async function ({ task: { afterAll }, inputs }) {
  if (afterAll === undefined) {
    return
  }

  try {
    await afterAll(inputs)
  } catch (error) {
    throw wrapError(error, '', TasksRunError)
  }
}
