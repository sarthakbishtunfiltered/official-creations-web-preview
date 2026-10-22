import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PreviewPage } from './components/PreviewPage'
import { previewIdFromLocation } from './lib/previewStore'

// "/?preview=<id>" shows one generated website full-page; anything else is the generator.
const previewId = previewIdFromLocation()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {previewId ? <PreviewPage id={previewId} /> : <App />}
  </StrictMode>,
)
