import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { SutraProvider } from './systems/sutraContext.jsx'
import { initBreathSync } from './systems/breathSync.js'
import { initLivingLight } from './systems/livingLight.js'
import App from './App.jsx'

// Initialize continuous cosmic clocks
initBreathSync();
initLivingLight();

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
import './styles/pages/settings.css'
import './styles/pages/static.css'
import './styles/pages/admin.css'
import './styles/pages/arcade.css'
import './styles/pages/campaign.css'
import './styles/pages/quizzes.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SutraProvider>
          <App />
        </SutraProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
