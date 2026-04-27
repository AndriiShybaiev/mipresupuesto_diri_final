import { calculateBudgetRows } from './financeService'

const budgetService = {
  getRows(monthTransactions) {
    return calculateBudgetRows(monthTransactions)
  },
}

export default budgetService
