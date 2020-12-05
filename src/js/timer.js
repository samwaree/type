let startTime;

/**
 * Starts the timer.
 */
function startTimer() {
  console.log('Staring timer...');
  startTime = startTime || new Date().getTime();
}

/**
 * Ends the timer. Returns the time elapsed in minutes.
 * @return {number} The amount of time elapsed in minutes
 */
function endTimer() {
  console.log('Ending timer...');
  if (startTime == null) {
    return;
  }
  const endTime = new Date().getTime();
  const difference = endTime - startTime;
  startTime = null;
  return difference / 60000;
}

/**
 * Returns whether or not the timer is currecntly running.
 * @return {boolean} Whether the timer is running
 */
function isTimerRunning() {
  return startTime != null;
}

module.exports = { startTimer, endTimer, isTimerRunning };
