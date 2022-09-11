// We end running samples when the `measures` is over `MAX_MEASURES`.
// This is meant to prevent memory overflow.
// We also adjust `maxLoops` to make sure runners never send too many measures
// in a single sample.
// We also make sure `measures` is garbage-collectable between each combination.
// We could use a more elaborate logic to allow for the benchmark to continue
// even after reaching that threshold:
//  - For example, we could persist measures on the filesystem, or aggregate
//    them in-memory
//  - However, needing more measures is unlikely to be needed:
//     - With a single step and max `precision`, the number of loops is still
//       lower than `MAX_MEASURES`:
//        - 4e4 with `rstdev` 10%
//        - 4e6 with `rstdev` 100%
//  - This assumption could be wrong in the following unlikely cases:
//     - A combination with hundreds of steps
//     - A `rstdev` > 100%, which is theoretically possible if the task duration
//       is exponential based on a random factor
export const hasMaxMeasures = function (measures) {
  return getMaxMeasuresLeft(measures) <= 0
}

export const getMaxMeasuresLeft = function (measures) {
  return MAX_MEASURES - measures.length
}

// The two limits we are avoiding are:
//  - Default memory limit in V8: 1.7GB
//     - This allows a little more than 1e8 double floats
//     - We use a smaller number since this is not the only variable taking
//       memory.
//  - Max string length in V8: ~5e8
//     - Since JSON serialized doubles can be up to 25 bytes (including the
//       comma), this means runners sending a JSON payload of more than 2e7
//       double floats would crash or make the parent process crash
//        - This could be avoided by streaming the HTTP response but this would
//          be slower
//        - Note: doubles are often much smaller than 25 bytes when JSON
//          serialized
// We also divide this number by 2 since measures are added to 2 arrays
// `measures` and `unsortedMeasures`
export const MAX_MEASURES = 5e6
