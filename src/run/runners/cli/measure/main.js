import now from 'precise-now'

import { preciseTimestamp } from '../../../../measure/precise_timestamp.js'

import { performLoops } from './loops.js'

// Measure how long a task takes.
// We take measures iteratively in order to stop exactly when the `duration`
// has been reached.
export const measureTask = async function ({
  main,
  before,
  after,
  variables,
  shell,
  repeat,
  maxDuration,
}) {
  const measures = []
  const start = String(preciseTimestamp())
  const measureEnd = now() + maxDuration
  await performLoops({
    main,
    before,
    after,
    variables,
    shell,
    repeat,
    measureEnd,
    measures,
  })
  return { measures, start }
}
