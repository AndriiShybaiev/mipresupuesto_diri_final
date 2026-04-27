export class ITransactionService {
  list() {
    throw new Error('list must be implemented')
  }

  add(_transaction) {
    throw new Error('add must be implemented')
  }

  subscribe(_callback) {
    throw new Error('subscribe must be implemented')
  }
}
