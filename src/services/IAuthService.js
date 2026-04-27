export class IAuthService {
  signIn(_credentials) {
    throw new Error('signIn must be implemented')
  }

  register(_credentials) {
    throw new Error('register must be implemented')
  }

  signOut() {
    throw new Error('signOut must be implemented')
  }

  getCurrentUser() {
    throw new Error('getCurrentUser must be implemented')
  }

  onAuthStateChanged(_callback) {
    throw new Error('onAuthStateChanged must be implemented')
  }
}
