import { useEffect, useState } from 'react'
import { get, ref, set, update } from 'firebase/database'
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

export default function AdminView() {
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [limited, setLimited] = useState(false)

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
