import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../contexts/LanguageContext'
import {
  calculateReports,
  categoryLabel,
  formatCurrency,
  monthlyTransactions,
} from '../services/financeService'

export default function ReportsView() {
  const { t } = useLanguage()
  const { transactions, transactionsLoading, transactionsError } = useSelector((state) => state.budget)
  const currentMonth = new Date().toISOString().slice(0, 7)

  const reportData = useMemo(() => {
    const monthTransactions = monthlyTransactions(transactions, currentMonth)
    return calculateReports(monthTransactions, transactions)
  }, [transactions, currentMonth])

  if (transactionsLoading) {
    return <p className="text-sm px-3 py-2 border border-blue-300 bg-blue-50 text-blue-800">{t.loading}</p>
  }

  if (transactionsError) {
    return <p className="text-sm px-3 py-2 border border-red-300 bg-red-50 text-red-800">{t.transactionsLoadError}</p>
  }

  if (transactions.length === 0) {
    return <p className="text-sm px-3 py-2 border border-gray-300 bg-gray-50 text-gray-700">{t.emptyReports}</p>
  }

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-3 gap-3"
      style={{ animation: 'fadeUp 420ms ease both' }}
    >
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="m-0 mb-2 text-slate-500 text-sm">{t.topExpense}</p>
        <strong className="block">
          {reportData.topExpense
            ? `${categoryLabel(reportData.topExpense[0], t)} (${formatCurrency(reportData.topExpense[1])})`
            : '-'}
        </strong>
      </article>
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="m-0 mb-2 text-slate-500 text-sm">{t.recentMovement}</p>
        <strong className="block">
          {reportData.latest
            ? `${reportData.latest.date} - ${reportData.latest.concept} (${formatCurrency(reportData.latest.amount)})`
            : '-'}
        </strong>
      </article>
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="m-0 mb-2 text-slate-500 text-sm">{t.totalMovements}</p>
        <strong className="block text-2xl">{reportData.movementCount}</strong>
      </article>
    </section>
  )
}
