import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import './index.css'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { store } from './store/store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </Provider>
  </StrictMode>,
)
