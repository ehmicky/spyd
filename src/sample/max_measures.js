// We end running samples when the `measures` is over `MAX_MEASURES`.
// This is meant to prevent memory overflow.
// We also make sure `measures` is garbage-collectable between each combination.
// We could use a more elaborate logic to allow for the benchmark to continue
// even after reaching that threshold:
//  - For example, we could persist measures on the filesysystem, or aggregate
//    them in-memory
//  - However, needing more measures is unlikely to be needed:
//     - With a single step and max `precision`, the number of loops is:
//        - 4e4 with `rstdev` 10%
//        - 4e6 with `rstdev` 100%
//  - This assumption could be wrong in the following unlikely cases:
//     - A combination with hundreds of steps
//     - A `rstdev` > 100%, which is theoritically possible if the task duration
//       is exponential based on a random factor
export const hasMaxMeasures = function ({ measures }) {
  return measures.length >= MAX_MEASURES
}

// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats. We use a smaller number since this is not the
// only variable taking memory.
export const MAX_MEASURES = 1e7
