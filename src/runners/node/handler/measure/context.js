// Retrieve argument passed to `beforeEach`, `main` and `afterEach`.
// This includes a `context` object for information passing.
// Contexts are meant to be modified. We do this instead of using a functional
// approach such as returning a value in hooks because:
//  - Direct mutation is easier for many users
//  - This does not require any deep merging, which can be slow and fail if the
//    object has cycles
// The top-level scope has different requirements than those context objects:
//  - It is not scoped to single iterations
//  - It can be used by beforeAll and afterAll
//  - It is global
// Consequently the top-level scope:
//  - Can be read by `beforeAll`, `beforeEach`, `main`, `afterEach`, `afterAll`
//  - Can be modified by `beforeAll` and `afterAll`.
//    `beforeEach`, `main` and `afterAll` can mutate it too to communicate to
//    themselves for the next iteration, but not to communicate between each
//    other on the same iteration. This is because repeat loops perform several
//    beforeEach/main/afterEach in batches, not in order, so they cannot modify
//    some shared global state.
export const addContext = (inputs, repeat) => {
  const allInputs = new Array(repeat)

  // Using `new Array()` and a `for` loop is the most performant
  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index < repeat; index += 1) {
    // eslint-disable-next-line fp/no-mutation
    allInputs[index] = { ...inputs, context: {} }
  }

  return allInputs
}
