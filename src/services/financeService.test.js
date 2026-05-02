import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  calculateSummary,
  filterTransactions,
  monthlyTransactions,
  calculateTrend,
  calculateReports,
} from './financeService'

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const TRANSACTIONS = [
  { id: '1', date: '2026-05-01', concept: 'Salary', category: 'income', amount: 2000 },
  { id: '2', date: '2026-05-05', concept: 'Mercado', category: 'food', amount: 50 },
  { id: '3', date: '2026-05-10', concept: 'Alquiler', category: 'home', amount: 800 },
  { id: '4', date: '2026-04-01', concept: 'Nomina', category: 'income', amount: 1900 },
  { id: '5', date: '2026-04-06', concept: 'Metro', category: 'transport', amount: 30 },
]

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('includes the € symbol', () => {
    expect(formatCurrency(100)).toContain('€')
  })

  it('formats a decimal amount containing the numeric value', () => {
    const result = formatCurrency(1234.5)
    expect(result).toMatch(/1.?234/)   // allows locale-specific thousand separator
  })

  it('formats zero without crashing', () => {
    expect(() => formatCurrency(0)).not.toThrow()
  })
})

// ─── monthlyTransactions ─────────────────────────────────────────────────────

describe('monthlyTransactions', () => {
  it('returns only transactions whose date starts with the given month', () => {
    const result = monthlyTransactions(TRANSACTIONS, '2026-05')
    expect(result).toHaveLength(3)
    result.forEach((t) => expect(t.date).toMatch(/^2026-05/))
  })

  it('returns an empty array when no transactions match', () => {
    expect(monthlyTransactions(TRANSACTIONS, '2020-01')).toHaveLength(0)
  })

  it('returns all transactions for a month with full coverage', () => {
    expect(monthlyTransactions(TRANSACTIONS, '2026-04')).toHaveLength(2)
  })
})

// ─── calculateSummary ────────────────────────────────────────────────────────

describe('calculateSummary', () => {
  const mayTransactions = TRANSACTIONS.filter((t) => t.date.startsWith('2026-05'))

  it('calculates income correctly', () => {
    expect(calculateSummary(mayTransactions).income).toBe(2000)
  })

  it('calculates expenses correctly', () => {
    expect(calculateSummary(mayTransactions).expenses).toBe(850) // 50 + 800
  })

  it('calculates balance as income minus expenses', () => {
    expect(calculateSummary(mayTransactions).balance).toBe(1150)
  })

  it('returns zeros for an empty array', () => {
    expect(calculateSummary([])).toEqual({ income: 0, expenses: 0, balance: 0 })
  })
})

// ─── filterTransactions ──────────────────────────────────────────────────────

describe('filterTransactions', () => {
  it('returns all transactions when monthFilter is all and search is empty', () => {
    const result = filterTransactions(TRANSACTIONS, {
      monthFilter: 'all',
      currentMonth: '2026-05',
      search: '',
    })
    expect(result).toHaveLength(5)
  })

  it('filters to current month only', () => {
    const result = filterTransactions(TRANSACTIONS, {
      monthFilter: 'current',
      currentMonth: '2026-05',
      search: '',
    })
    expect(result).toHaveLength(3)
  })

  it('filters by search term (case insensitive)', () => {
    const result = filterTransactions(TRANSACTIONS, {
      monthFilter: 'all',
      currentMonth: '2026-05',
      search: 'metro',
    })
    expect(result).toHaveLength(1)
    expect(result[0].concept).toBe('Metro')
  })

  it('returns results sorted by date descending', () => {
    const result = filterTransactions(TRANSACTIONS, {
      monthFilter: 'all',
      currentMonth: '2026-05',
      search: '',
    })
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].date >= result[i + 1].date).toBe(true)
    }
  })

  it('returns empty array when search matches nothing', () => {
    const result = filterTransactions(TRANSACTIONS, {
      monthFilter: 'all',
      currentMonth: '2026-05',
      search: 'zzznomatch',
    })
    expect(result).toHaveLength(0)
  })
})

// ─── calculateTrend ──────────────────────────────────────────────────────────

describe('calculateTrend', () => {
  it('excludes income from the trend totals', () => {
    const result = calculateTrend(TRANSACTIONS)
    // Both months have income — trend should only count expense rows
    result.forEach((row) => {
      expect(row.total).toBeGreaterThan(0)
    })
  })

  it('returns at most 4 entries', () => {
    const result = calculateTrend(TRANSACTIONS)
    expect(result.length).toBeLessThanOrEqual(4)
  })

  it('assigns a height value to each entry', () => {
    const result = calculateTrend(TRANSACTIONS)
    result.forEach((row) => {
      expect(typeof row.height).toBe('number')
    })
  })
})

// ─── calculateReports ────────────────────────────────────────────────────────

describe('calculateReports', () => {
  const may = TRANSACTIONS.filter((t) => t.date.startsWith('2026-05'))

  it('identifies the top expense category', () => {
    const { topExpense } = calculateReports(may, TRANSACTIONS)
    expect(topExpense).toBeDefined()
    expect(topExpense[0]).toBe('home') // home = 800, food = 50
  })

  it('returns the most recent transaction as latest', () => {
    const { latest } = calculateReports(may, TRANSACTIONS)
    expect(latest.date).toBe('2026-05-10')
  })

  it('counts the movement count for the month', () => {
    const { movementCount } = calculateReports(may, TRANSACTIONS)
    expect(movementCount).toBe(3)
  })
})
