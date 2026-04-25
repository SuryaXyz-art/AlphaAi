import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AppProviders } from './providers/AppProviders';
import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AppProviders>
  </StrictMode>
);
