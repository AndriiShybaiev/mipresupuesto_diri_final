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
    <section className="panel fade-up">
      <div className="filters-row">
        <div>
          <label>{t.monthFilter}</label>
          <select
            value={monthFilter}
            onChange={(e) => dispatch(budgetActions.setMonthFilter(e.target.value))}
          >
            <option value="current">{t.monthCurrent}</option>
            <option value="all">{t.monthAll}</option>
          </select>
        </div>

        <div>
          <label>{t.search}</label>
          <input
            type="text"
            value={search}
            onChange={(e) => dispatch(budgetActions.setSearch(e.target.value))}
            placeholder={`${t.search}...`}
          />
        </div>

        <button type="button" className="primary" onClick={() => dispatch(budgetActions.openModal())}>
          {t.addTransaction}
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.date}</th>
              <th>{t.concept}</th>
              <th>{t.category}</th>
              <th>{t.amount}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.concept}</td>
                <td>{categoryLabel(item.category, t)}</td>
                <td className={item.category === 'income' ? 'income' : 'expense'}>
                  {item.category === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                </td>
                <td className="row-actions">
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    onClick={() => dispatch(budgetActions.openEditModal(item))}
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    className="action-btn delete-btn"
                    onClick={() => dispatch(removeTransaction({ id: item.id }))}
                  >
                    {t.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 ? (
          <p className="empty">{t.noTransactions}</p>
        ) : null}
      </div>
    </section>
  )
}
