class Logger {
  constructor() {
    this.levels = ['debug', 'info', 'warn', 'error']
    this.currentLevel = 'debug'
  }

  setLevel(level) {
    if (this.levels.includes(level)) {
      this.currentLevel = level
      return
    }
    console.error(`Invalid log level: ${level}`)
  }

  write(level, message) {
    const levelIndex = this.levels.indexOf(level)
    const currentIndex = this.levels.indexOf(this.currentLevel)
    if (levelIndex < currentIndex) {
      return
    }
    const stamp = new Date().toISOString()
    console[level](`[${level.toUpperCase()}] ${stamp}: ${message}`)
  }

  debug(message) {
    this.write('debug', message)
  }

  info(message) {
    this.write('info', message)
  }

  warn(message) {
    this.write('warn', message)
  }

  error(message) {
    this.write('error', message)
  }
}

const logger = new Logger()
export default logger
