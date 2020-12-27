// Perform `beforeAll`, if defined
export const before = async function ({ task: { beforeAll }, taskArg }) {
  if (beforeAll === undefined) {
    return
  }

  await beforeAll(taskArg)
}

// Perform `afterAll`, if defined
export const after = async function ({ task: { afterAll }, taskArg }) {
  if (afterAll === undefined) {
    return
  }

  await afterAll(taskArg)
}
