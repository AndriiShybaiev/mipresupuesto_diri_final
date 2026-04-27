import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import authService from '../services/AuthService'

const AuthContext = createContext({
  user: null,
  signIn: () => {},
  register: () => {},
  signOut: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCurrentUser())

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })
    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      signIn: (credentials) => authService.signIn(credentials),
      register: (credentials) => authService.register(credentials),
      signOut: () => authService.signOut(),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
