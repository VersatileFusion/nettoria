/**
 * Simple logging utility for the application
 */
const logger = {
  /**
   * Log info level messages
   * @param {...any} args - Arguments to log
   */
  info: (...args) => {
    console.log('\x1b[36m[INFO]\x1b[0m', ...args);
  },

  /**
   * Log error level messages
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    console.error('\x1b[31m[ERROR]\x1b[0m', ...args);
  },

  /**
   * Log warning level messages
   * @param {...any} args - Arguments to log
   */
  warn: (...args) => {
    console.warn('\x1b[33m[WARN]\x1b[0m', ...args);
  },

  /**
   * Log debug level messages
   * @param {...any} args - Arguments to log
   */
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('\x1b[90m[DEBUG]\x1b[0m', ...args);
    }
  }
};

module.exports = logger; 