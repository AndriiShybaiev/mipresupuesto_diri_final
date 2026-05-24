import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLanguage } from '../contexts/LanguageContext'
import { budgetActions, removeTransaction } from '../store/budgetSlice'
import { categoryLabel, filterTransactions, formatCurrency } from '../services/financeService'

export default function TransactionsView() {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const { monthFilter, search, transactions, transactionsLoading, transactionsError } = useSelector((state) => state.budget)
  const currentMonth = new Date().toISOString().slice(0, 7)

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, { monthFilter, currentMonth, search }),
    [transactions, monthFilter, currentMonth, search],
  )

  if (transactionsLoading) {
    return <p className="text-sm px-3 py-2 border border-blue-300 bg-blue-50 text-blue-800">{t.loading}</p>
  }

  if (transactionsError) {
    return <p className="text-sm px-3 py-2 border border-red-300 bg-red-50 text-red-800">{t.transactionsLoadError}</p>
  }

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      style={{ animation: 'fadeUp 420ms ease both' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-3 mb-4 items-end">
        <div className="grid gap-1">
          <label className="font-semibold text-sm">{t.monthFilter}</label>
          <select
            className="min-h-10 px-3 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            value={monthFilter}
            onChange={(e) => dispatch(budgetActions.setMonthFilter(e.target.value))}
          >
            <option value="current">{t.monthCurrent}</option>
            <option value="all">{t.monthAll}</option>
          </select>
        </div>

        <div className="grid gap-1">
          <label className="font-semibold text-sm">{t.search}</label>
          <input
            type="text"
            className="min-h-10 px-3 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            value={search}
            onChange={(e) => dispatch(budgetActions.setSearch(e.target.value))}
            placeholder={`${t.search}...`}
          />
        </div>

        <button
          type="button"
          className="rounded-md bg-teal-600 text-white px-4 py-2 cursor-pointer font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 self-end"
          onClick={() => dispatch(budgetActions.openModal())}
        >
          {t.addTransaction}
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left bg-slate-50 px-3 py-2 border-b border-slate-200">{t.date}</th>
              <th className="text-left bg-slate-50 px-3 py-2 border-b border-slate-200">{t.concept}</th>
              <th className="text-left bg-slate-50 px-3 py-2 border-b border-slate-200">{t.category}</th>
              <th className="text-left bg-slate-50 px-3 py-2 border-b border-slate-200">{t.amount}</th>
              <th className="text-left bg-slate-50 px-3 py-2 border-b border-slate-200">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-2 border-b border-slate-200">{item.date}</td>
                <td className="px-3 py-2 border-b border-slate-200">{item.concept}</td>
                <td className="px-3 py-2 border-b border-slate-200">{categoryLabel(item.category, t)}</td>
                <td className={`px-3 py-2 border-b border-slate-200 font-bold ${item.category === 'income' ? 'text-teal-700' : 'text-red-700'}`}>
                  {item.category === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                </td>
                <td className="px-3 py-2 border-b border-slate-200 whitespace-nowrap">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded border border-slate-300 bg-white cursor-pointer hover:bg-teal-50 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      onClick={() => dispatch(budgetActions.openEditModal(item))}
                    >
                      {t.edit}
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded border border-red-200 text-red-700 bg-white cursor-pointer hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400/30"
                      onClick={() => dispatch(removeTransaction({ id: item.id }))}
                    >
                      {t.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <p className="text-sm px-3 py-2 border border-gray-300 bg-gray-50 text-gray-700">{t.noTransactions}</p>
        )}
      </div>
    </section>
  )
}
