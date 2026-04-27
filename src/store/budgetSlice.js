export const initialBudgetState = {
  activeView: 'dashboard',
  monthFilter: 'current',
  search: '',
  showModal: false,
  transactions: [],
}

export const actionTypes = {
  setView: 'budget/setView',
  setMonthFilter: 'budget/setMonthFilter',
  setSearch: 'budget/setSearch',
  openModal: 'budget/openModal',
  closeModal: 'budget/closeModal',
  setTransactions: 'budget/setTransactions',
}

export function budgetReducer(state, action) {
  switch (action.type) {
    case actionTypes.setView:
      return { ...state, activeView: action.payload }
    case actionTypes.setMonthFilter:
      return { ...state, monthFilter: action.payload }
    case actionTypes.setSearch:
      return { ...state, search: action.payload }
    case actionTypes.openModal:
      return { ...state, showModal: true }
    case actionTypes.closeModal:
      return { ...state, showModal: false }
    case actionTypes.setTransactions:
      return { ...state, transactions: action.payload }
    default:
      return state
  }
}

export const budgetActions = {
  setView: (view) => ({ type: actionTypes.setView, payload: view }),
  setMonthFilter: (value) => ({ type: actionTypes.setMonthFilter, payload: value }),
  setSearch: (value) => ({ type: actionTypes.setSearch, payload: value }),
  openModal: () => ({ type: actionTypes.openModal }),
  closeModal: () => ({ type: actionTypes.closeModal }),
  setTransactions: (list) => ({ type: actionTypes.setTransactions, payload: list }),
}
