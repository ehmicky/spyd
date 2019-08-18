// Run an iteration once without benchmarking it
export const debugRun = async function({ main, before, after }) {
  const beforeArgs = await performBefore(before)

  await main(beforeArgs)

  await performAfter(after, beforeArgs)
}

const performBefore = async function(before) {
  if (before === undefined) {
    return
  }

  const beforeArgs = await before()
  return beforeArgs
}

const performAfter = async function(after, beforeArgs) {
  if (after === undefined) {
    return
  }

  await after(beforeArgs)
}
