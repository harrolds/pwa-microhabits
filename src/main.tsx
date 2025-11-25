import React from 'react';
import ReactDOM from 'react-dom/client';
import Shell from './app/Shell/Shell';
import './main.css';
import { initializeLoaders } from './app/Manifest/RegisterLoaders';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found');
}

initializeLoaders();

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>,
);

const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .catch((error) => console.error('SW registration failed', error));
    });
  }
};

registerSW();

