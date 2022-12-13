import now from 'precise-now'

import { addContext } from './context.js'

// Perform measuring loops iteratively
export const performLoopsSync = ({
  main,
  beforeEach,
  afterEach,
  inputs,
  maxLoops,
  repeat,
}) => {
  const measures = new Array(maxLoops)

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < measures.length; index += 1) {
    // eslint-disable-next-line fp/no-mutation
    measures[index] = performLoopSync({
      main,
      beforeEach,
      afterEach,
      inputs,
      repeat,
    })
  }

  return measures
}

const performLoopSync = ({ main, beforeEach, afterEach, inputs, repeat }) => {
  const allInputs = addContext(inputs, repeat)

  performHookSync(beforeEach, allInputs)
  const duration = getDurationSync(main, allInputs)
  performHookSync(afterEach, allInputs)
  return duration
}

// Task `beforeEach()`/`afterEach()`. Performed outside measurements.
// `beforeEach`, `main` and `afterEach` should communicate using context objects
const performHookSync = (hook, allInputs) => {
  if (hook === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops
  for (const inputs of allInputs) {
    hook(inputs)
  }
}

const getDurationSync = (main, allInputs) => {
  const start = now()

  // eslint-disable-next-line fp/no-loops
  for (const inputs of allInputs) {
    main(inputs)
  }

  return now() - start
}
