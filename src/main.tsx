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
import './act3ArchiveIdentity.css';
import './premiumPass.css';
import './buildMarker.css';
import './premiumEnhancements';
import './cameraMeaning';
import './cameraFrames';
import './act2HiddenRouteV2';
import './act2GatePreview';
import './act3ArchiveIdentity';
import './premiumPass';
import './versionGuard';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PremiumApp />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' })
      .then((registration) => registration.update())
      .catch(() => {
        // The app remains fully usable without service worker support.
      });
  });
}
