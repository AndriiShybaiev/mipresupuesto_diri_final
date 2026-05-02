import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLanguage } from '../contexts/LanguageContext'
import { budgetActions, removeTransaction } from '../store/budgetSlice'
import { categoryLabel, filterTransactions, formatCurrency } from '../services/financeService'

export default function TransactionsView() {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const { monthFilter, search, transactions } = useSelector((state) => state.budget)
  const currentMonth = new Date().toISOString().slice(0, 7)

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, { monthFilter, currentMonth, search }),
    [transactions, monthFilter, currentMonth, search],
  )

  return (
    <section
      className="border-2 border-gray-800 bg-white p-4 shadow-sm"
      style={{ animation: 'fadeUp 420ms ease both' }}
    >
      <div className="grid grid-cols-[160px_1fr_auto] gap-3 mb-4 items-end">
        <div className="grid gap-1">
          <label className="font-semibold text-sm">{t.monthFilter}</label>
          <select
            className="min-h-9 px-2 border border-gray-300 bg-white"
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
            className="min-h-9 px-2 border border-gray-300 bg-white"
            value={search}
            onChange={(e) => dispatch(budgetActions.setSearch(e.target.value))}
            placeholder={`${t.search}...`}
          />
        </div>

        <button
          type="button"
          className="bg-teal-700 text-white border-2 border-teal-800 px-4 py-2 cursor-pointer hover:bg-teal-800 self-end"
          onClick={() => dispatch(budgetActions.openModal())}
        >
          {t.addTransaction}
        </button>
      </div>

      <div className="border border-gray-300 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left bg-teal-50 px-3 py-2 border-b border-gray-300">{t.date}</th>
              <th className="text-left bg-teal-50 px-3 py-2 border-b border-gray-300">{t.concept}</th>
              <th className="text-left bg-teal-50 px-3 py-2 border-b border-gray-300">{t.category}</th>
              <th className="text-left bg-teal-50 px-3 py-2 border-b border-gray-300">{t.amount}</th>
              <th className="text-left bg-teal-50 px-3 py-2 border-b border-gray-300">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-2 border-b border-gray-200">{item.date}</td>
                <td className="px-3 py-2 border-b border-gray-200">{item.concept}</td>
                <td className="px-3 py-2 border-b border-gray-200">{categoryLabel(item.category, t)}</td>
                <td className={`px-3 py-2 border-b border-gray-200 font-bold ${item.category === 'income' ? 'text-teal-700' : 'text-red-700'}`}>
                  {item.category === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                </td>
                <td className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="px-2 py-1 text-xs border border-gray-300 bg-white cursor-pointer hover:bg-teal-50 hover:border-teal-500"
                      onClick={() => dispatch(budgetActions.openEditModal(item))}
                    >
                      {t.edit}
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs border border-red-200 text-red-700 bg-white cursor-pointer hover:bg-red-50"
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
          <p className="px-3 py-2 text-gray-500">{t.noTransactions}</p>
        )}
      </div>
    </section>
  )
}
