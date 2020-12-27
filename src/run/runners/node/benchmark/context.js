// Retrieve context object shared by each repeat loop iteration (`beforeEach`,
// `main` and `afterEach`) for information passing.
// We use a context object instead of a function argument because:
//  - This is how most JavaScript test runners work, making it familiar to users
//  - This does not create confusion about arguments order (since inputs are
//    also arguments)
// Contexts are meant to be modified. We do thise instead of using a functional
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
//  - Can only be modified by `beforeAll` and `afterAll`. This is because
//    repeat loops perform several beforeEach/main/afterEach in batches, not
//    in order, so they cannot modify some shared global state.
// In a nutshell:
//  - Context objects are meant for `beforeEach`, `main` and `afterEach`
//  - The top-level scope can be read by all, but can only be modified by
//    `beforeAll` and `afterAll`
export const getContexts = function (repeat, contexts) {
  if (canReuseContexts(contexts)) {
    return contexts
  }

  return Array.from({ length: repeat }, getContext)
}

// Creating contexts is slow. If the previous `contexts` was not used, we re-use
// it
const canReuseContexts = function (contexts) {
  return contexts !== undefined && contexts.every(isEmptyObject)
}

const isEmptyObject = function (obj) {
  return Object.getOwnPropertyNames(obj).length === 0
}

const getContext = function () {
  return {}
}
