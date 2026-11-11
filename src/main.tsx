import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/roboto-mono/400.css'
import '@fontsource/roboto-mono/500.css'
import App from './App'
import './styles.css'
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
