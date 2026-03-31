import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import './index.css'
import App from './App.tsx' // ← Глобальные стили для всего сайта

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App/>
    </QueryClientProvider>
  </StrictMode>,
)
