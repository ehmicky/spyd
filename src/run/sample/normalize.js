import { getSortedMedian } from '../../stats/quantile.js'
import { sortFloats } from '../../stats/sort.js'

// Normalize `sampleMeasures` by dividing `repeat` and sorting.
// We use the `sampleMedian` instead of `stats.median`:
//  - So that `repeat` adjusts to slowdowns of the task (for example due to
//    competing processes).
//  - It makes the initial calibration phase shorter. This leads to more
//    stable `max` and `stdev` stats.
// We use the `sampleMedian` instead of the `sampleMean` because:
//  - The duration of faster measures is more important than slower here when
//    it comes to `repeat` callibration, since those are the ones being fixed
//    by it.
//  - It is more stable
//  - It is faster to compute since we need to sort `sampleMeasures` anyway
// Some durations might be 0:
//  - This happens due when the task duration is too close to either:
//     - The runner's time resolution (on a given machine)
//     - The runner's duration to take a timestamp
//  - So durations being 0 are not actually 0 but instead:
//     - Unknown durations
//     - Lower than any duration not 0
//  - Unlike measures being 0, they are not desirable
//     - We try to reduce their occurences using the `repeat` loop
//     - But they can still occur due to:
//        - Wrong `measureCost` estimation
//        - Wrong `timeResolution` estimation
//        - Task being too slow during calibration, ending calibration too soon
//  - As an unknown lowest duration, they are still useful and kept in the
//   following cases:
//     - `sampleMedian` computation
//     - Measures of unit "auto"
//  - However, with the unit group "mixed", they do not make sense and are
//    filtered out
export const normalizeSampleMeasures = (sampleMeasures, repeat) => {
  const sampleUnsortedMeasures = normalizeRepeat(sampleMeasures, repeat)
  const sampleLoops = sampleUnsortedMeasures.length
  const sampleTimes = sampleLoops * repeat

  const sampleSortedMeasures = [...sampleUnsortedMeasures]
  sortFloats(sampleSortedMeasures)
  const sampleMedian = getSortedMedian(sampleSortedMeasures)

  return {
    sampleSortedMeasures,
    sampleUnsortedMeasures,
    sampleMedian,
    sampleLoops,
    sampleTimes,
  }
}

// The runner measures loops of the task. This retrieve the mean time to execute
// the task each time, from the time to execute the whole loop.
const normalizeRepeat = (sampleMeasures, repeat) => {
  if (repeat === 1) {
    return sampleMeasures
  }

  // Somehow this is faster than direct mutation, providing `sampleMeasures` is
  // not used anymore after this function and can be garbage collected.
  return sampleMeasures.map((sampleMeasure) => sampleMeasure / repeat)
}
