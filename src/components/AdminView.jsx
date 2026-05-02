import { useEffect, useState } from 'react'
import { get, ref } from 'firebase/database'
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
  const snap = await get(ref(db, `users/${currentUser.uid}`))
  if (!snap.exists()) return []
  const info = snap.val()
  return [{
    uid: currentUser.uid,
    email: info.email ?? currentUser.email,
    name: info.name ?? 'Admin',
    admin: info.roles?.admin === true,
  }]
}

export default function AdminView() {
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [limited, setLimited] = useState(false)

  useEffect(() => {
    loadUsers()
      .then((list) => {
        logger.info(`Admin loaded ${list.length} users`)
        setUsers(list)
      })
      .catch(async (e) => {
        const msg = String(e)
        if (msg.includes('PERMISSION_DENIED')) {
          // Firebase rules restrict reading users/ root — fall back to own profile
          logger.warn('Admin: PERMISSION_DENIED on users/, falling back to own profile')
          try {
            const own = await loadOwnProfile()
            setUsers(own)
            setLimited(true)
          } catch (e2) {
            setError(String(e2))
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
      className="border-2 border-gray-800 bg-white p-4 shadow-sm"
      style={{ animation: 'fadeUp 420ms ease both' }}
    >
      <h3 className="text-xl font-bold m-0 mb-4">{t.adminPanel}</h3>

      {loading && (
        <p className="text-sm px-3 py-2 border border-blue-300 bg-blue-50 text-blue-800">{t.loading}</p>
      )}
      {error && (
        <p className="text-sm px-3 py-2 border border-red-300 bg-red-50 text-red-800">{error}</p>
      )}
      {limited && (
        <p className="text-sm px-3 py-2 border border-yellow-300 bg-yellow-50 text-yellow-800 mb-3">
          Firebase rules restrict reading all users. Showing own profile only.
          Set <code className="font-mono bg-yellow-100 px-1">/users .read: auth != null</code> in Firebase Console for full access.
        </p>
      )}

      {!loading && !error && (
        <>
          <p className="text-gray-600 mb-3">{t.adminUsers}</p>
          {users.length === 0 ? (
            <p className="text-gray-500">{t.adminNoUsers}</p>
          ) : (
            <div className="border border-gray-300 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left bg-teal-50 px-3 py-2 border-b border-gray-300">{t.adminName}</th>
                    <th className="text-left bg-teal-50 px-3 py-2 border-b border-gray-300">{t.email}</th>
                    <th className="text-left bg-teal-50 px-3 py-2 border-b border-gray-300">{t.adminRole}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.uid}>
                      <td className="px-3 py-2 border-b border-gray-200">{u.name}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{u.email}</td>
                      <td className={`px-3 py-2 border-b border-gray-200 font-bold ${u.admin ? 'text-teal-700' : 'text-gray-500'}`}>
                        {u.admin ? 'ADMIN' : 'USER'}
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
