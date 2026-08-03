import React from 'react';
import ReactDOM from 'react-dom/client';
import PremiumApp from './PremiumApp';
import './premium.css';
import './premium-fix.css';
import './premium-runtime.css';
import './cctv.css';
import './cameraMeaning.css';
import './cameraFrames.css';
import './cameraMap.css';
import './act2HiddenRoute.css';
import './premiumEnhancements';
import './cameraMeaning';
import './cameraFrames';
import './act2HiddenRoute';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PremiumApp />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // The app remains fully usable without service worker support.
    });
  });
}
