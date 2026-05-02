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
    <section className="panel fade-up">
      <h3>{t.adminPanel}</h3>

      {loading && <p className="status-msg loading">{t.loading}</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && (
        <>
          <p>{t.adminUsers}</p>
          {users.length === 0 ? (
            <p>{t.adminNoUsers}</p>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>{t.adminName}</th>
                  <th>{t.email}</th>
                  <th>{t.adminRole}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.admin ? 'ADMIN' : 'USER'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  )
}
