import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import isMobile from 'is-mobile'
import MobileApp from './mobile/AppMobile.tsx'
//is mobile


createRoot(document.getElementById('root')!).render(
  <>
    {isMobile() ? <MobileApp /> : <App />}
  </>
)
 