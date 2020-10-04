let startTime;

/**
 * Starts the timer.
 */
export function startTimer() {
  console.log("Staring timer...");
  startTime = startTime || new Date().getTime();
}

/**
 * Ends the timer. Returns the time elapsed in minutes.
 */
export function endTimer() {
  console.log("Ending timer...");
  var endTime = new Date().getTime();
  var difference = endTime - startTime;
  startTime = null;
  return difference / 60000;
}

/**
 * Returns whether or not the timer is currecntly running.
 */
export function isTimerRunning() {
  return startTime != null;
}
