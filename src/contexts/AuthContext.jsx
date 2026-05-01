import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import authService from '../services/AuthService'

const AuthContext = createContext({
  user: null,
  roles: null,
  signIn: () => {},
  register: () => {},
  signOut: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState(null)

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          const userRoles = await authService.getUserRoles(currentUser)
          setRoles(userRoles)
        } catch {
          setRoles(null)
        }
      } else {
        setRoles(null)
      }
    })

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      roles,
      signIn: (credentials) => authService.signIn(credentials),
      register: (credentials) => authService.register(credentials),
      signOut: () => authService.signOut(),
    }),
    [user, roles],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
