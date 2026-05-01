import { useState } from 'react'
import { INITIAL_NEW_TRANSACTION } from '../entities/entities'

function buildInitialForm(initialValues) {
  if (!initialValues) {
    return {
      ...INITIAL_NEW_TRANSACTION,
      date: new Date().toISOString().slice(0, 10),
    }
  }

  // Derive type from category for edit mode
  const type = initialValues.category === 'income' ? 'income' : 'expense'
  const category = type === 'income' ? INITIAL_NEW_TRANSACTION.category : initialValues.category

  return {
    date: initialValues.date ?? new Date().toISOString().slice(0, 10),
    concept: initialValues.concept ?? '',
    type,
    category,
    amount: initialValues.amount ?? '',
  }
}

export default function TransactionModal({ t, initialValues, onClose, onSave }) {
  const [form, setForm] = useState(() => buildInitialForm(initialValues))

  const isEditing = Boolean(initialValues)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function onSubmit(event) {
    event.preventDefault()

    const amount = Number(form.amount)
    if (!form.date || !form.concept || Number.isNaN(amount) || amount <= 0) {
      return
    }

    const category = form.type === 'income' ? 'income' : form.category
    onSave({
      date: form.date,
      concept: form.concept,
      category,
      amount,
    })
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <form className="modal-card" onSubmit={onSubmit}>
        <h3>{isEditing ? t.editMovement : t.addMovement}</h3>

        <label>
          <span>{t.date}</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
          />
        </label>

        <label>
          <span>{t.concept}</span>
          <input
            type="text"
            value={form.concept}
            onChange={(event) => updateField('concept', event.target.value)}
          />
        </label>

        <label>
          <span>{t.transactionType}</span>
          <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
            <option value="expense">{t.expenseType}</option>
            <option value="income">{t.incomeType}</option>
          </select>
        </label>

        {form.type === 'expense' ? (
          <label>
            <span>{t.category}</span>
            <select
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
            >
              <option value="food">{t.categoryFood}</option>
              <option value="home">{t.categoryHome}</option>
              <option value="leisure">{t.categoryLeisure}</option>
              <option value="transport">{t.categoryTransport}</option>
            </select>
          </label>
        ) : null}

        <label>
          <span>{t.amount}</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => updateField('amount', event.target.value)}
            placeholder="0.00"
          />
        </label>

        <div className="modal-actions">
          <button type="submit" className="primary">
            {t.save}
          </button>
          <button type="button" className="ghost" onClick={onClose}>
            {t.cancel}
          </button>
        </div>
      </form>
    </div>
  )
}
