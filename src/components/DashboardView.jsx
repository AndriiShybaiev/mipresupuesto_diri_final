import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../contexts/LanguageContext'
import {
  calculateSummary,
  calculateTrend,
  formatCurrency,
  monthlyTransactions,
} from '../services/financeService'

export default function DashboardView() {
  const { t } = useLanguage()
  const { transactions } = useSelector((state) => state.budget)
  const currentMonth = new Date().toISOString().slice(0, 7)

  const monthTransactions = useMemo(
    () => monthlyTransactions(transactions, currentMonth),
    [transactions, currentMonth],
  )
  const summary = useMemo(() => calculateSummary(monthTransactions), [monthTransactions])
  const trendData = useMemo(() => calculateTrend(transactions), [transactions])

  return (
    <>
      <section
        className="border-2 border-gray-800 bg-white p-4 shadow-sm grid grid-cols-3 gap-4"
        style={{ animation: 'fadeUp 420ms ease both' }}
      >
        <article className="border border-gray-300 p-3">
          <p className="m-0 text-gray-500 text-sm">{t.totalBalance}</p>
          <strong className="block mt-1 text-2xl">{formatCurrency(summary.balance)}</strong>
        </article>
        <article className="border border-gray-300 p-3">
          <p className="m-0 text-gray-500 text-sm">{t.income}</p>
          <strong className="block mt-1 text-2xl text-teal-700">{formatCurrency(summary.income)}</strong>
        </article>
        <article className="border border-gray-300 p-3">
          <p className="m-0 text-gray-500 text-sm">{t.expenses}</p>
          <strong className="block mt-1 text-2xl text-red-700">{formatCurrency(summary.expenses)}</strong>
        </article>
      </section>

      <section
        className="border-2 border-gray-800 bg-white p-4 shadow-sm"
        style={{ animation: 'fadeUp 420ms 80ms ease both' }}
      >
        <h3 className="m-0 mb-4 font-bold">{t.monthlyTrend}</h3>
        <div className="grid grid-cols-4 min-h-56 items-end gap-4 border border-gray-300 p-4">
          {trendData.map((item) => (
            <div key={item.month} className="flex flex-col items-center gap-2">
              <div
                className="w-10 border-2 border-gray-800 bg-gradient-to-b from-teal-400 to-teal-700"
                style={{ height: `${item.height}px`, animation: 'grow 700ms ease', transformOrigin: 'bottom' }}
              />
              <span className="text-sm">{item.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
