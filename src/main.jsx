import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import App from './App.jsx'

/* Modular Cyber-Vedic Design System */
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/pages/landing.css'
import './styles/pages/auth.css'
import './styles/pages/home.css'
import './styles/pages/library.css'
import './styles/pages/versedetail.css'
import './styles/pages/chat.css'
import './styles/pages/rankings.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
