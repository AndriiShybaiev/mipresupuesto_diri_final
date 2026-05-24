import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../contexts/LanguageContext'
import {
  calculateSummary,
  calculateTrend,
  categoryLabel,
  formatCurrency,
  monthlyTransactions,
} from '../services/financeService'

export default function DashboardView() {
  const { t } = useLanguage()
  const { transactions, transactionsLoading, transactionsError } = useSelector((state) => state.budget)
  const currentMonth = new Date().toISOString().slice(0, 7)

  const monthTransactions = useMemo(
    () => monthlyTransactions(transactions, currentMonth),
    [transactions, currentMonth],
  )
  const summary = useMemo(() => calculateSummary(monthTransactions), [monthTransactions])
  const trendData = useMemo(() => calculateTrend(transactions), [transactions])
  const expensesByCategory = useMemo(() => {
    const totals = monthTransactions
      .filter((item) => item.category !== 'income')
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount
        return acc
      }, {})

    const total = Object.values(totals).reduce((acc, value) => acc + value, 0)
    return {
      total,
      rows: Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .map(([category, value]) => ({
          category,
          label: categoryLabel(category, t),
          value,
          percent: total > 0 ? Math.round((value / total) * 100) : 0,
        })),
    }
  }, [monthTransactions, t])

  const hasChartData = trendData.length > 0 || expensesByCategory.total > 0

  if (transactionsLoading) {
    return <p className="text-sm px-3 py-2 border border-blue-300 bg-blue-50 text-blue-800">{t.loading}</p>
  }

  if (transactionsError) {
    return <p className="text-sm px-3 py-2 border border-red-300 bg-red-50 text-red-800">{t.transactionsLoadError}</p>
  }

  if (transactions.length === 0) {
    return <p className="text-sm px-3 py-2 border border-gray-300 bg-gray-50 text-gray-700">{t.emptyDashboard}</p>
  }

  return (
    <>
      <section
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4"
        style={{ animation: 'fadeUp 420ms ease both' }}
      >
        <article className="rounded-lg border border-slate-200 p-3">
          <p className="m-0 text-slate-500 text-sm">{t.totalBalance}</p>
          <strong className="block mt-1 text-2xl">{formatCurrency(summary.balance)}</strong>
        </article>
        <article className="rounded-lg border border-slate-200 p-3">
          <p className="m-0 text-slate-500 text-sm">{t.income}</p>
          <strong className="block mt-1 text-2xl text-teal-700">{formatCurrency(summary.income)}</strong>
        </article>
        <article className="rounded-lg border border-slate-200 p-3">
          <p className="m-0 text-slate-500 text-sm">{t.expenses}</p>
          <strong className="block mt-1 text-2xl text-red-700">{formatCurrency(summary.expenses)}</strong>
        </article>
      </section>

      <section
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        style={{ animation: 'fadeUp 420ms 80ms ease both' }}
      >
        <h3 className="m-0 mb-4 text-lg font-bold tracking-tight">{t.dashboardChartsTitle}</h3>

        {!hasChartData ? (
          <p className="text-sm px-3 py-2 border border-gray-300 bg-gray-50 text-gray-700 rounded-lg">{t.emptyCharts}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <article className="rounded-lg border border-slate-200 p-4">
              <h4 className="m-0 mb-3 text-sm font-semibold text-slate-700">{t.chartMonthlyExpenses}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 min-h-56 items-end gap-4 rounded-lg border border-slate-200 p-4">
                {trendData.length === 0 ? (
                  <p className="col-span-full text-sm text-slate-500">{t.emptyCharts}</p>
                ) : (
                  trendData.map((item) => (
                    <div key={item.month} className="flex flex-col items-center gap-2">
                      <div
                        className="w-10 rounded-t-sm bg-gradient-to-b from-teal-400 to-teal-600"
                        style={{ height: `${item.height}px`, animation: 'grow 700ms ease', transformOrigin: 'bottom' }}
                      />
                      <span className="text-sm text-slate-600">{item.month.slice(5)}</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 p-4">
              <h4 className="m-0 mb-3 text-sm font-semibold text-slate-700">{t.chartCategoryDistribution}</h4>
              {expensesByCategory.total === 0 ? (
                <p className="text-sm text-slate-500">{t.emptyCharts}</p>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div
                    className="h-40 w-40 rounded-full border border-slate-200"
                    style={{
                      background: `conic-gradient(
                        #14b8a6 0% ${expensesByCategory.rows[0]?.percent || 0}%,
                        #22c55e ${expensesByCategory.rows[0]?.percent || 0}% ${(expensesByCategory.rows[0]?.percent || 0) + (expensesByCategory.rows[1]?.percent || 0)}%,
                        #f59e0b ${(expensesByCategory.rows[0]?.percent || 0) + (expensesByCategory.rows[1]?.percent || 0)}% ${(expensesByCategory.rows[0]?.percent || 0) + (expensesByCategory.rows[1]?.percent || 0) + (expensesByCategory.rows[2]?.percent || 0)}%,
                        #ef4444 ${(expensesByCategory.rows[0]?.percent || 0) + (expensesByCategory.rows[1]?.percent || 0) + (expensesByCategory.rows[2]?.percent || 0)}% 100%
                      )`,
                    }}
                  />
                  <ul className="m-0 p-0 list-none w-full space-y-2">
                    {expensesByCategory.rows.map((row) => (
                      <li key={row.category} className="flex items-center justify-between text-sm border-b border-slate-100 pb-1">
                        <span className="text-slate-600">{row.label}</span>
                        <strong className="text-slate-800">{row.percent}% · {formatCurrency(row.value)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </div>
        )}
      </section>
    </>
  )
}
