// Perform `beforeAll`, if defined
export const before = async function ({ task: { beforeAll }, inputs }) {
  if (beforeAll === undefined) {
    return
  }

  await beforeAll(inputs)
}

// Perform `afterAll`, if defined
export const after = async function ({ task: { afterAll }, inputs }) {
  if (afterAll === undefined) {
    return
  }

  await afterAll(inputs)
}
