import { IAuthService } from './IAuthService'
import logger from './logging'

const USERS_KEY = 'mipresupuesto_users'
const SESSION_KEY = 'mipresupuesto_session'

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) {
    return []
  }
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveSession(user) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export class LocalAuthService extends IAuthService {
  constructor() {
    super()
    this.listeners = new Set()
  }

  notify(user) {
    this.listeners.forEach((callback) => callback(user))
  }

  getCurrentUser() {
    return readSession()
  }

  signIn({ email, password }) {
    const users = readUsers()
    const user = users.find((item) => item.email === email && item.password === password)

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const safeUser = { email: user.email, name: user.name }
    saveSession(safeUser)
    logger.info(`User signed in: ${safeUser.email}`)
    this.notify(safeUser)
    return safeUser
  }

  register({ email, password, name }) {
    const users = readUsers()
    const exists = users.some((item) => item.email === email)
    if (exists) {
      throw new Error('Email already exists')
    }

    const newUser = {
      email,
      password,
      name: name || email.split('@')[0],
    }

    users.push(newUser)
    saveUsers(users)

    const safeUser = { email: newUser.email, name: newUser.name }
    saveSession(safeUser)
    logger.info(`User registered: ${safeUser.email}`)
    this.notify(safeUser)
    return safeUser
  }

  signOut() {
    const user = this.getCurrentUser()
    saveSession(null)
    logger.info(`User signed out: ${user?.email || 'unknown'}`)
    this.notify(null)
  }

  onAuthStateChanged(callback) {
    this.listeners.add(callback)
    callback(this.getCurrentUser())

    return () => {
      this.listeners.delete(callback)
    }
  }
}
