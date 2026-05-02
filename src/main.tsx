import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SocketProvider } from './hooks/useSocket'
import { SoundProvider } from './hooks/useSound'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SoundProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </SoundProvider>
  </StrictMode>,
)
