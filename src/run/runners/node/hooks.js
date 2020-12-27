// Perform `beforeAll`, if defined
export const before = async function ({ beforeAll }) {
  if (beforeAll === undefined) {
    return
  }

  await beforeAll()
}

// Perform `afterAll`, if defined
export const after = async function ({ afterAll }) {
  if (afterAll === undefined) {
    return
  }

  await afterAll()
}
