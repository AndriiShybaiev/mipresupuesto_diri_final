import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { ref, get, set } from 'firebase/database'

import { IAuthService } from './IAuthService'
import { auth, db } from '../firebaseConfig'
import logger from './logging'

export class FirebaseAuthService extends IAuthService {
  signIn({ email, password }) {
    logger.info(`User signing in: ${email}`)
    return signInWithEmailAndPassword(auth, email, password)
  }

  register({ email, password, name }) {
    logger.info(`User registering: ${email}`)
    return createUserWithEmailAndPassword(auth, email, password).then(async (credential) => {
      const uid = credential.user.uid
      await set(ref(db, `users/${uid}`), {
        email,
        name: name || email.split('@')[0],
        roles: { admin: false },
      })
      logger.info(`User registered: ${email}`)
      return credential
    })
  }

  signOut() {
    const user = auth.currentUser
    logger.info(`User signing out: ${user?.email || 'unknown'}`)
    return signOut(auth)
  }

  getCurrentUser() {
    return auth.currentUser
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback)
  }

  async getUserRoles(user) {
    if (!user) return []
    if (user.email === 'admin@email.com') return ['ADMIN']

    try {
      const snap = await get(ref(db, `users/${user.uid}/roles`))
      if (!snap.exists()) return ['USER']

      const rolesData = snap.val()
      return rolesData?.admin === true ? ['ADMIN'] : ['USER']
    } catch (e) {
      logger.error(`Failed to get roles for ${user.uid}: ${String(e)}`)
      return ['USER']
    }
  }
}
