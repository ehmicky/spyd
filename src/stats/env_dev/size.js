// Retrieve the number of groups to compute.
// Groups are divided into clusters of elements.
// Each group has `CLUSTER_FACTOR` more elements per cluster than the previous
// one.
export const getGroupsCount = (length) =>
  Math.floor(Math.log(length / MIN_GROUP_SIZE) / Math.log(CLUSTER_FACTOR))

// Retrieve the `clusterSize`, i.e. number of elements per cluster, of each
// group.
export const getClusterSizes = (groupsCount) =>
  Array.from({ length: groupsCount }, getClusterSize)

const getClusterSize = (_, index) => CLUSTER_FACTOR ** (index + 1)

// Minimum `groupSize`
// A higher value lowers accuracy:
//  - The result `envDev` will be lower than the real value
//  - This is because more `array` elements are required to reach the "optimal"
//    size.
//  - This means multiplying this constant by `n` requires running the benchmark
//    `n` times longer to get the same `envDev`
// A lower value lowers precision:
//  - This is because groups with a lower groupSize are less precise
//  - This is especially visible in preview mode, especially when a new group
//    is added
//     - This is because the last group are less precise.
//     - Also, new groups generally have higher `varianceRatio` if the "optimal"
//       size has not been reached yet, so each new group will make `envDev`
//       increase until it reaches its optimal value.
// In general, `envDev` tends to be generally too low, so we favor accuracy over
// precision.
// However, this does mean `envDev` tends to vary quite a lot between different
// `array`.
const MIN_GROUP_SIZE = 2

// Each group has `CLUSTER_FACTOR` more elements per cluster than the previous
// one.
// A lower value:
//  - Is slower to compute
//     - Using `CLUSTER_FACTOR ** n` divides the time complexity by `sqrt(n)`
//  - Leads to an overall slightly worse accuracy
// A higher value:
//  - Leads to much poorer accuracy and precision when the "optimal" size is
//    close to the `array.length`
//     - Specifically when that "optimal" size is higher than
//       `array.length` / (CLUSTER_FACTOR ** 2)
// We must also ensure that `CLUSTER_FACTOR ** MAX_ARGUMENTS >= MAX_SAMPLES`
//  - MAX_ARGUMENTS is the maximum number of arguments to Math.max(): 123182
//  - MAX_SAMPLES is the maximum number of array elements: 123182
//  - Otherwise, `Math.max(...groups)` would crash
// Using an integer >= 2 allows several implementation performance optimizations
const CLUSTER_FACTOR = 2
