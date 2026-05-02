// AC 9.2 — Headless UI Dialog for the transaction modal
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
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

const inputClass = 'min-h-9 px-2 border border-gray-300 bg-white w-full'

export default function TransactionModal({ t, initialValues, isMutating, onClose, onSave }) {
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
    <Dialog open={true} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      {/* Centered panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white border-2 border-gray-800 p-4">
          <form onSubmit={onSubmit} className="grid gap-3">
            <DialogTitle className="text-lg font-bold m-0">
              {isEditing ? t.editMovement : t.addMovement}
            </DialogTitle>

            <label className="grid gap-1">
              <span className="font-semibold text-sm">{t.date}</span>
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-semibold text-sm">{t.concept}</span>
              <input
                type="text"
                className={inputClass}
                value={form.concept}
                onChange={(event) => updateField('concept', event.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-semibold text-sm">{t.transactionType}</span>
              <select
                className={inputClass}
                value={form.type}
                onChange={(event) => updateField('type', event.target.value)}
              >
                <option value="expense">{t.expenseType}</option>
                <option value="income">{t.incomeType}</option>
              </select>
            </label>

            {form.type === 'expense' ? (
              <label className="grid gap-1">
                <span className="font-semibold text-sm">{t.category}</span>
                <select
                  className={inputClass}
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

            <label className="grid gap-1">
              <span className="font-semibold text-sm">{t.amount}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.amount}
                onChange={(event) => updateField('amount', event.target.value)}
                placeholder="0.00"
              />
            </label>

            <div className="flex gap-2 justify-end mt-1">
              <button
                type="submit"
                className="bg-teal-700 text-white border-2 border-teal-800 px-4 py-2 cursor-pointer hover:bg-teal-800 disabled:opacity-50"
                disabled={isMutating}
              >
                {isMutating ? `${t.save}...` : t.save}
              </button>
              <button
                type="button"
                className="border-2 border-gray-800 bg-white px-4 py-2 cursor-pointer hover:bg-gray-100 disabled:opacity-50"
                onClick={onClose}
                disabled={isMutating}
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
