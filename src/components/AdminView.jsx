import { useEffect, useState } from 'react'
import { get, ref, remove, set, update } from 'firebase/database'
import { auth, db } from '../firebaseConfig'
import { useLanguage } from '../contexts/LanguageContext'
import logger from '../services/logging'

async function loadUsers() {
  // Try reading the full users tree (requires permissive Firebase rules)
  const snap = await get(ref(db, 'users'))
  if (!snap.exists()) return []
  const data = snap.val()
  return Object.entries(data).map(([uid, info]) => ({
    uid,
    email: info.email ?? '-',
    name: info.name ?? '-',
    admin: info.roles?.admin === true,
  }))
}

async function loadOwnProfile() {
  const currentUser = auth.currentUser
  if (!currentUser) return []
  try {
    const snap = await get(ref(db, `users/${currentUser.uid}`))
    if (!snap.exists()) {
      if (currentUser.email === 'admin@email.com') {
        return [{
          uid: currentUser.uid,
          email: currentUser.email,
          name: 'Admin',
          admin: true,
        }]
      }
      return []
    }
    const info = snap.val()
    return [{
      uid: currentUser.uid,
      email: info.email ?? currentUser.email,
      name: info.name ?? (currentUser.email === 'admin@email.com' ? 'Admin' : currentUser.email),
      admin: currentUser.email === 'admin@email.com' ? true : info.roles?.admin === true,
    }]
  } catch (e) {
    if (currentUser.email === 'admin@email.com') {
      logger.warn(`Admin own profile fallback without DB read: ${String(e)}`)
      return [{
        uid: currentUser.uid,
        email: currentUser.email,
        name: 'Admin',
        admin: true,
      }]
    }
    throw e
  }
}

async function ensureHardcodedAdminProfile() {
  const currentUser = auth.currentUser
  if (!currentUser || currentUser.email !== 'admin@email.com') return false

  await set(ref(db, `users/${currentUser.uid}`), {
    email: currentUser.email,
    name: 'Admin',
    roles: { admin: true },
  })

  logger.info('Admin profile ensured in DB from AdminView')
  return true
}

function seedTransactionsByRole(role) {
  if (role === 'admin') {
    return [
      { id: 'seed_a_001', date: '2026-01-05', concept: 'Nómina', category: 'income', amount: 2900 },
      { id: 'seed_a_002', date: '2026-01-08', concept: 'Supermercado', category: 'food', amount: 260 },
      { id: 'seed_a_003', date: '2026-01-12', concept: 'Alquiler', category: 'home', amount: 950 },
      { id: 'seed_a_004', date: '2026-02-05', concept: 'Nómina', category: 'income', amount: 2900 },
      { id: 'seed_a_005', date: '2026-02-10', concept: 'Restaurantes', category: 'food', amount: 380 },
      { id: 'seed_a_006', date: '2026-02-22', concept: 'Taxi', category: 'transport', amount: 120 },
      { id: 'seed_a_007', date: '2026-03-05', concept: 'Nómina', category: 'income', amount: 2900 },
      { id: 'seed_a_008', date: '2026-03-09', concept: 'Facturas hogar', category: 'home', amount: 320 },
      { id: 'seed_a_009', date: '2026-03-18', concept: 'Escapada fin de semana', category: 'leisure', amount: 280 },
      { id: 'seed_a_010', date: '2026-04-05', concept: 'Nómina', category: 'income', amount: 2900 },
      { id: 'seed_a_011', date: '2026-04-14', concept: 'Compra semanal', category: 'food', amount: 340 },
      { id: 'seed_a_012', date: '2026-04-21', concept: 'Transporte público', category: 'transport', amount: 90 },
      { id: 'seed_a_013', date: '2026-05-05', concept: 'Nómina', category: 'income', amount: 2900 },
      { id: 'seed_a_014', date: '2026-05-10', concept: 'Hogar (mantenimiento)', category: 'home', amount: 560 },
      { id: 'seed_a_015', date: '2026-05-16', concept: 'Ocio y suscripciones', category: 'leisure', amount: 240 },
      { id: 'seed_a_016', date: '2026-05-20', concept: 'Combustible', category: 'transport', amount: 110 },
    ]
  }

  return [
    { id: 'seed_u_001', date: '2026-01-03', concept: 'Salario', category: 'income', amount: 1700 },
    { id: 'seed_u_002', date: '2026-01-07', concept: 'Compra mercado', category: 'food', amount: 180 },
    { id: 'seed_u_003', date: '2026-01-15', concept: 'Alquiler', category: 'home', amount: 780 },
    { id: 'seed_u_004', date: '2026-02-03', concept: 'Salario', category: 'income', amount: 1700 },
    { id: 'seed_u_005', date: '2026-02-09', concept: 'Comida fuera', category: 'food', amount: 220 },
    { id: 'seed_u_006', date: '2026-02-18', concept: 'Bus + metro', category: 'transport', amount: 70 },
    { id: 'seed_u_007', date: '2026-03-03', concept: 'Salario', category: 'income', amount: 1700 },
    { id: 'seed_u_008', date: '2026-03-11', concept: 'Concierto', category: 'leisure', amount: 240 },
    { id: 'seed_u_009', date: '2026-03-20', concept: 'Recibos casa', category: 'home', amount: 290 },
    { id: 'seed_u_010', date: '2026-04-03', concept: 'Salario', category: 'income', amount: 1700 },
    { id: 'seed_u_011', date: '2026-04-09', concept: 'Supermercado', category: 'food', amount: 270 },
    { id: 'seed_u_012', date: '2026-04-17', concept: 'Cine y cena', category: 'leisure', amount: 170 },
    { id: 'seed_u_013', date: '2026-05-03', concept: 'Salario', category: 'income', amount: 1700 },
    { id: 'seed_u_014', date: '2026-05-08', concept: 'Compra grande del mes', category: 'food', amount: 390 },
    { id: 'seed_u_015', date: '2026-05-12', concept: 'Reparación casa', category: 'home', amount: 530 },
    { id: 'seed_u_016', date: '2026-05-23', concept: 'Viaje corto', category: 'transport', amount: 210 },
  ]
}

function toSeedRecord(transactions) {
  return transactions.reduce((acc, tx) => {
    acc[tx.id] = {
      date: tx.date,
      concept: tx.concept,
      category: tx.category,
      amount: tx.amount,
    }
    return acc
  }, {})
}

export default function AdminView() {
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [limited, setLimited] = useState(false)
  const [seedStatus, setSeedStatus] = useState('')
  const [seedLoading, setSeedLoading] = useState(false)

  const currentUid = auth.currentUser?.uid
  const isBuiltInAdmin = (email) => email === 'admin@email.com'

  async function toggleAdminRole(user) {
    setError('')

    if (!user?.uid) return
    if (user.uid === currentUid || isBuiltInAdmin(user.email)) return

    try {
      const nextAdmin = !user.admin
      await update(ref(db, `users/${user.uid}`), {
        roles: { admin: nextAdmin },
      })

      setUsers((prev) => prev.map((u) => (u.uid === user.uid ? { ...u, admin: nextAdmin } : u)))
    } catch (e) {
      setError(String(e))
    }
  }

  async function applyDemoSeed() {
    setSeedStatus('')
    setError('')
    setSeedLoading(true)

    try {
      const adminUser = users.find((u) => String(u.email).toLowerCase() === 'admin@email.com')
      const standardUser = users.find((u) => String(u.email).toLowerCase() === 'user@user.user')

      if (!adminUser || !standardUser) {
        setSeedStatus(t.adminSeedMissingUsers)
        return
      }

      const adminTransactions = toSeedRecord(seedTransactionsByRole('admin'))
      const userTransactions = toSeedRecord(seedTransactionsByRole('user'))

      await update(ref(db, `users/${adminUser.uid}`), {
        email: 'admin@email.com',
        name: adminUser.name || 'Admin',
        roles: { admin: true },
      })
      await set(ref(db, `users/${adminUser.uid}/transactions`), adminTransactions)

      await update(ref(db, `users/${standardUser.uid}`), {
        email: 'user@user.user',
        name: standardUser.name || 'Usuario demo',
        roles: { admin: false },
      })
      await set(ref(db, `users/${standardUser.uid}/transactions`), userTransactions)

      setSeedStatus(t.adminSeedLoaded)
    } catch (e) {
      setSeedStatus(`${t.adminSeedError}: ${String(e)}`)
    } finally {
      setSeedLoading(false)
    }
  }

  async function clearDemoSeed() {
    setSeedStatus('')
    setError('')
    setSeedLoading(true)

    try {
      const adminUser = users.find((u) => String(u.email).toLowerCase() === 'admin@email.com')
      const standardUser = users.find((u) => String(u.email).toLowerCase() === 'user@user.user')

      if (!adminUser || !standardUser) {
        setSeedStatus(t.adminSeedMissingUsers)
        return
      }

      await remove(ref(db, `users/${adminUser.uid}/transactions`))
      await remove(ref(db, `users/${standardUser.uid}/transactions`))

      setSeedStatus(t.adminSeedCleared)
    } catch (e) {
      setSeedStatus(`${t.adminSeedError}: ${String(e)}`)
    } finally {
      setSeedLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
      .then((list) => {
        logger.info(`Admin loaded ${list.length} users`)
        setUsers(list)
      })
      .catch(async (e) => {
        const msg = String(e)
        const normalizedMsg = msg.toUpperCase()
        if (normalizedMsg.includes('PERMISSION_DENIED') || normalizedMsg.includes('PERMISSION DENIED')) {
          // Firebase rules restrict reading users/ root — try self-heal for hardcoded admin
          logger.warn('Admin: PERMISSION_DENIED on users/, trying admin self-heal')
          try {
            const healed = await ensureHardcodedAdminProfile()
            if (healed) {
              const list = await loadUsers()
              setUsers(list)
              setLimited(false)
              return
            }

            const own = await loadOwnProfile()
            setUsers(own)
            setLimited(true)
          } catch (e2) {
            logger.warn(`Admin self-heal failed: ${String(e2)}`)
            try {
              const own = await loadOwnProfile()
              setUsers(own)
              setLimited(true)
            } catch (e3) {
              setError(String(e3))
            }
          }
        } else {
          logger.error(`Admin fetch failed: ${msg}`)
          setError(msg)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      style={{ animation: 'fadeUp 420ms ease both' }}
    >
      <h3 className="text-xl font-bold tracking-tight m-0 mb-4">{t.adminPanel}</h3>

      {loading && (
        <p className="text-sm px-3 py-2 border border-blue-300 bg-blue-50 text-blue-800">{t.loading}</p>
      )}
      {error && (
        <p className="text-sm px-3 py-2 border border-red-300 bg-red-50 text-red-800">{error}</p>
      )}
      {limited && (
        <p className="text-sm px-3 py-2 border border-yellow-300 bg-yellow-50 text-yellow-800 mb-3">
          {t.adminLimitedWarning}
          {' '}
          {t.adminLimitedHint}
          <code className="font-mono bg-yellow-100 px-1 ml-1">.read: auth != null &amp;&amp; root.child('users').child(auth.uid).child('roles').child('admin').val() == true</code>
        </p>
      )}

      {!loading && !error && (
        <>
          <p className="text-slate-500 mb-3">{t.adminUsers}</p>
          <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="m-0 text-sm text-slate-600">{t.adminSeedHint}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyDemoSeed}
                disabled={seedLoading || limited}
                className="px-3 py-1.5 rounded-md text-xs font-semibold border border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.adminSeedLoad}
              </button>
              <button
                type="button"
                onClick={clearDemoSeed}
                disabled={seedLoading || limited}
                className="px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.adminSeedClear}
              </button>
            </div>
            {seedStatus && (
              <p className="mt-2 mb-0 text-xs text-slate-600">{seedStatus}</p>
            )}
          </div>

          {users.length === 0 ? (
            <p className="text-slate-500">{t.adminNoUsers}</p>
          ) : (
            <div className="rounded-lg border border-slate-200 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left bg-slate-50 px-3 py-2 border-b border-slate-200">{t.adminName}</th>
                    <th className="text-left bg-slate-50 px-3 py-2 border-b border-slate-200">{t.email}</th>
                    <th className="text-left bg-slate-50 px-3 py-2 border-b border-slate-200">{t.adminRole}</th>
                    <th className="text-left bg-slate-50 px-3 py-2 border-b border-slate-200">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.uid}>
                      <td className="px-3 py-2 border-b border-slate-200">{u.name}</td>
                      <td className="px-3 py-2 border-b border-slate-200">{u.email}</td>
                      <td className={`px-3 py-2 border-b border-slate-200 font-bold ${u.admin ? 'text-teal-700' : 'text-slate-500'}`}>
                        {u.admin ? 'ADMIN' : t.userRole}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-200">
                        {u.uid === currentUid || isBuiltInAdmin(u.email) ? (
                          <span className="text-xs text-slate-400">{t.adminRoleLocked}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleAdminRole(u)}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border transition ${u.admin
                              ? 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100'
                            }`}
                          >
                            {u.admin ? t.adminDemote : t.adminPromote}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}
