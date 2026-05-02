import { useEffect, useState } from 'react'
import { get, ref } from 'firebase/database'
import { db } from '../firebaseConfig'
import { useLanguage } from '../contexts/LanguageContext'
import logger from '../services/logging'

export default function AdminView() {
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    get(ref(db, 'users'))
      .then((snap) => {
        if (!snap.exists()) {
          setUsers([])
          return
        }
        const data = snap.val()
        const list = Object.entries(data).map(([uid, info]) => ({
          uid,
          email: info.email ?? '-',
          name: info.name ?? '-',
          admin: info.roles?.admin === true,
        }))
        logger.info(`Admin loaded ${list.length} users`)
        setUsers(list)
      })
      .catch((e) => {
        logger.error(`Admin fetch users failed: ${String(e)}`)
        setError(String(e))
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
