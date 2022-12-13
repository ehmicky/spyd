// Like `try {} finally {}` except:
//  - if both blocks throw, the exception from the `try` block has priority.
//  - the finally block cannot return a value.
export const safeFinally = async (tryFunc, finallyFunc) => {
  const returnValue = await callTry(tryFunc, finallyFunc)
  await finallyFunc()
  return returnValue
}

const callTry = async (tryFunc, finallyFunc) => {
  try {
    return await tryFunc()
  } catch (error) {
    await callSilentFinally(finallyFunc)
    throw error
  }
}

const callSilentFinally = async (finallyFunc) => {
  try {
    await finallyFunc()
  } catch {}
}
