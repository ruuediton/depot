
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LoadingProvider } from './contexts/LoadingContext';
import { NetworkProvider } from './contexts/NetworkContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <NetworkProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </NetworkProvider>
  </React.StrictMode>
);
// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered!', reg))
      .catch(err => console.log('SW register error:', err));
  });
}
