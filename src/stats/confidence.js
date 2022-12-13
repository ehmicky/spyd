// Retrieve the confidence interval.
// This is represented as `stats.meanMin` and `stats.meanMax`.
// When `showPrecision` is `true`, this is reported instead of `stats.mean`.
// This allows reporting both the approximate mean and its precision at once.
//  - When this happens, `stats.mean` is not reported
//  - This is easier to understand than reporting `stats.mean` and
//    `stats.moe|rmoe` because it is easier to visualize and to compare with
//    other combinations.
// We do not allow `stats.meanMin|meanMax` to go beyond `stats.min|max`:
//  - This is very unlikely to happen, although technically possible providing
//    both:
//     - The number of loops is very low
//     - `stats.rstdev` is very high, i.e. the distribution is very skewed
//  - This allows `stats.min|max` to be used in reporting as extreme boundaries
// This takes into account both the statistical variance (`moe`) and the
// environmental one (`envDev`).
// However, `envDev` is not used for the `rmoe` used to compute the overall
// benchmark duration:
//  - In principle, we should use `envDev` to compute `moe|rmoe`
//     - Otherwise, combinations with different `envDev` have different real
//       `rmoe` (taking `envDev` into account) at the end of the benchmark
//     - I.e. the logic makes the statistical variation difference (due to the
//       difference of `rstdev`) of all combinations equal, but not the
//       environmental variation
//  - However, there are several implementation problems which prevents
//    doing so:
//     - The benchmark might never reach the target `rmoe`
//        - This is because `envDev` eventually reaches a point where it grows
//          at the same pace as `Math.sqrt(samples.length)`
//        - I.e. `rmoe` does not decrease anymore even with more samples
//        - We should stop the benchmark when when this happens, but this is
//          difficult due to:
//           - `envDev` fluctuating a lot even when stabilized
//           - `envDev` sometimes appears to be stable for many measures, but is
//             actually still not
//           - We need to take into account that `rmoe` is also influenced by
//             `rstdev`, which changes and is also imprecise, especially at the
//             beginning
//     - This makes the benchmark end too early sometimes
//        - This is because `envDev / Math.sqrt(samples.length)` tends to be
//          too small when the number of samples is too slow
//     - This results in different stats between runs
//        - This is because `envDev` currently has a high variance,
//          i.e. different runs of the same combinations might have very
//          different durations
//     - This results in big jumps of the preview duration through the run
//        - `envDev` currently varies a lot through the run
export const getConfidenceInterval = ({ mean, adjustedMoe, min, max }) => {
  const meanMin = Math.max(mean - adjustedMoe, min, 0)
  const meanMax = Math.min(mean + adjustedMoe, max)
  return { meanMin, meanMax }
}
