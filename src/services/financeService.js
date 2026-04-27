import { BUDGET_LIMITS } from '../entities/entities'

export function monthOf(date) {
  return date.slice(0, 7)
}

export function formatCurrency(value, locale = 'es-ES') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value)
}

export function categoryLabel(category, t) {
  const mapping = {
    food: t.categoryFood,
    home: t.categoryHome,
    leisure: t.categoryLeisure,
    transport: t.categoryTransport,
    income: t.categorySalary,
  }

  return mapping[category] || category
}

export function filterTransactions(transactions, { monthFilter, currentMonth, search }) {
  const term = search.trim().toLowerCase()

  return transactions
    .filter((item) => {
      if (monthFilter === 'current' && monthOf(item.date) !== currentMonth) {
        return false
      }
      if (!term) {
        return true
      }
      const searchBlob = `${item.date} ${item.concept} ${item.category} ${item.amount}`.toLowerCase()
      return searchBlob.includes(term)
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function monthlyTransactions(transactions, currentMonth) {
  return transactions.filter((item) => monthOf(item.date) === currentMonth)
}

export function calculateSummary(monthTransactions) {
  const income = monthTransactions
    .filter((item) => item.category === 'income')
    .reduce((acc, item) => acc + item.amount, 0)

  const expenses = monthTransactions
    .filter((item) => item.category !== 'income')
    .reduce((acc, item) => acc + item.amount, 0)

  return {
    income,
    expenses,
    balance: income - expenses,
  }
}

export function calculateBudgetRows(monthTransactions) {
  const spentByCategory = monthTransactions
    .filter((item) => item.category !== 'income')
    .reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount
        return acc
      },
      { food: 0, home: 0, leisure: 0, transport: 0 },
    )

  return Object.entries(BUDGET_LIMITS).map(([category, limit]) => {
    const used = spentByCategory[category] || 0
    return {
      category,
      used,
      limit,
      ratio: Math.min((used / limit) * 100, 100),
      available: limit - used,
    }
  })
}

export function calculateTrend(transactions) {
  const monthTotals = {}

  transactions.forEach((item) => {
    if (item.category === 'income') {
      return
    }
    const month = monthOf(item.date)
    monthTotals[month] = (monthTotals[month] || 0) + item.amount
  })

  const rows = Object.entries(monthTotals)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-4)
    .map(([month, total]) => ({ month, total }))

  const max = rows.reduce((acc, row) => Math.max(acc, row.total), 1)
  return rows.map((row) => ({
    ...row,
    height: Math.round((row.total / max) * 180),
  }))
}

export function calculateReports(monthTransactions, transactions) {
  const expenseTotals = monthTransactions
    .filter((item) => item.category !== 'income')
    .reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount
      return acc
    }, {})

  const topExpense = Object.entries(expenseTotals).sort((a, b) => b[1] - a[1])[0]
  const latest = [...transactions].sort((a, b) => b.date.localeCompare(a.date))[0]

  return {
    topExpense,
    latest,
    movementCount: monthTransactions.length,
  }
}
