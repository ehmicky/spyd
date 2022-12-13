export const pWhile = async (condition, action, initialState) => {
  // eslint-disable-next-line fp/no-let
  let state = initialState

  // eslint-disable-next-line fp/no-loops
  while (condition(state)) {
    // eslint-disable-next-line fp/no-mutation, no-await-in-loop
    state = await action(state)
  }

  return state
}
