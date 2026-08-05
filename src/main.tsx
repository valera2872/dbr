import './freshStart';
import { INTERNAL_MODE } from './internalMode';
import './routeFixtures';
import './performanceKernel';
import './investigationState';
import './commercialRestart';
import React from 'react';
import ReactDOM from 'react-dom/client';
import PremiumApp from './PremiumApp';
import { AppErrorBoundary } from './AppErrorBoundary';
import { mountActorStudio } from './actorStudio';
import { mountActorStudioGuide } from './actorStudioGuide';
import { mountCommercialLaunch } from './commercialLaunch';
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
import './interactiveInterrogation.css';
import './livingSuspect.css';
import './actorStudio.css';
import './actorStudioGuide.css';
import './act4FinalOperation.css';
import './stabilityPass.css';
import './commercialShell.css';
import './commercialMobile.css';
import './localMedia.css';
import './finalMedia.css';
import './premiumEnhancements';
import './cameraMeaning';
import './cameraFrames';
import './act2HiddenRouteV2';
import './act2GatePreview';
import './act3ArchiveIdentity';
import './premiumPassV2';
import './interactiveInterrogation';
import './livingSuspect';
import './kirillVideoRuntime';
import './act4FinalOperation';
import './stabilityDiagnostics';
import './localMediaRuntime';
import './versionGuard';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('DBR root element is missing');

const actorStudio = INTERNAL_MODE
  ? mountActorStudio(rootElement)
  : { mounted: false };

if (actorStudio.mounted) {
  mountActorStudioGuide(rootElement);
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <PremiumApp />
      </AppErrorBoundary>
    </React.StrictMode>
  );
  mountCommercialLaunch();
}

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
