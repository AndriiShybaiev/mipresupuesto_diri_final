export class ITransactionService {
  list() {
    throw new Error('list must be implemented')
  }

  add(_transaction) {
    throw new Error('add must be implemented')
  }

  update(_id, _transaction) {
    throw new Error('update must be implemented')
  }

  remove(_id) {
    throw new Error('remove must be implemented')
  }

  subscribe(_callback) {
    throw new Error('subscribe must be implemented')
  }
}
