import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AppProvider } from './contexts/AppContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(235 10% 100%)',
              color: 'hsl(235 10% 20%)',
              boxShadow: '0 8px 24px hsla(240, 10%, 10%, 0.12)',
            },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)