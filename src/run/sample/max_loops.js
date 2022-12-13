import { getMaxMeasuresLeft } from './max_measures.js'

// `maxLoops` is the number of `repeat` loops the sample should measure.
// Each sample needs to perform a specific amount of measures (`maxLoops`).
// We do this instead of passing a maximum duration instead because:
//   - It is easier to implement for runner.
//   - It is faster, since it does not require computing a timestamp, which
//     allows running more loops in very fast tasks.
//   - It can be used to prevent memory crash in runners.
// The `maxLoops` is computed so the sample lasts a specific duration. We use a
// hardcoded duration because:
//   - It should be as high as possible. Since the upper limit is based on
//     user-perceived duration (preview refresh rate, duration to stop, etc.),
//     we do not need machine-friendly automated durations.
//   - It ensures each sample has roughly the same duration.
//      - This is because some runtime optimization applies as a new sample is
//        run. We do not want this runtime to spread differently between samples
//        due to different durations.
// We use the same target duration whether calibrated or not
//   - This ensures the calibration samples are measured in the same settings
//     as the others. Otherwise, the first samples after calibration might be
//     different from the others, removing the benefits of calibration.
// Since `maxLoops` aims to last a specific duration, we need the last
// `measureDuration` to estimate it.
//   - If the `repeat` changes, we need to take it into account as well, which
//     is especially important during calibration.
// Higher value of `targetSampleDuration` leads to:
//   - Less frequent previews
//   - Longer to wait for combinations to stop when user requests it.
//       - The sample duration should always be less than the abort delay.
//   - Higher minimum duration for any combination
//   - More unnecessary measures once the `precision` threshold has been reached
//   - Longer time to calibrate
// Lower value of `targetSampleDuration` leads to:
//   - Higher `stats.stdev` and `stats.max`. This is because new samples have
//     a small cold start. This is especially true for fast|low-complexity tasks
//   - Less duration measuring as opposed to IPC, runner internal logic, stats
//     computation and preview reporting
//   - Due to the above point, the real sample duration is less close to the
//     target.
// The value does not impact `stats.mean` much though.
export const getMaxLoops = ({
  newRepeat,
  measures,
  timeDurationMean,
  targetSampleDuration,
}) =>
  Math.min(
    Math.ceil(targetSampleDuration / (timeDurationMean * newRepeat)),
    getMaxMeasuresLeft(measures),
  )
