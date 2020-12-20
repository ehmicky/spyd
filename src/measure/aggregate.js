import { computeStats } from '../stats/compute.js'

import { addProcessMeasures } from './add.js'

// Aggregate `processMeasures` to `measures`.
// The `stats` need a single `measures` array, so they are computed right after.
// Since this is CPU-heavy, this is done incrementally after one or several
// samples, as opposed to at the end of the benchmark. This is because:
//  - Stats are reported in realtime
//  - This avoids a big slowdown at the end of the benchmark, which would be
//    perceived by users
export const aggregateMeasures = function ({
  measures,
  processMeasures,
  stats,
}) {
  if (false) {
    return { processMeasures, stats }
  }

  addProcessMeasures(measures, processMeasures)
  const statsA = computeStats(measures)
  return { processMeasures: [], stats: statsA }
}
