import './freshStart';
import { INTERNAL_MODE } from './internalMode';
import './routeFixtures';
import './performanceKernel';
import './investigationState';
import './playerGuidanceSync';
import './commercialRestart';
import React from 'react';
import ReactDOM from 'react-dom/client';
import PremiumApp from './PremiumApp';
import { ReactCaseExtension } from './ReactCaseExtension';
import { PlayerGuidance } from './PlayerGuidance';
import { FinalSynthesis } from './FinalSynthesis';
import { AppErrorBoundary } from './AppErrorBoundary';
import { mountActorStudio } from './actorStudio';
import { mountActorStudioGuide } from './actorStudioGuide';
import { mountCommercialLaunch } from './commercialLaunch';
import { installCommercialMetadataConsistency } from './commercialMetadataConsistency';
import { installStageHeaderConsistency } from './stageHeaderConsistency';
import { installFocusedFirstAction } from './focusedFirstAction';
import { installProgressiveNavigation } from './progressiveNavigation';
import { installInvestigationAgency } from './investigationAgency';
import { installInvestigationAgencyAct3 } from './investigationAgencyAct3';
import { installCompletedCaseReturn } from './completedCaseReturn';
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
import './interrogationGuidance.css';
import './interrogationAgency.css';
import './livingSuspect.css';
import './actorStudio.css';
import './actorStudioGuide.css';
import './act4FinalOperation.css';
import './stabilityPass.css';
import './commercialShell.css';
import './commercialMobile.css';
import './localMedia.css';
import './finalMedia.css';
import './reactCaseExtension.css';
import './finalSynthesis.css';
import './firstPlayerFixes.css';
import './act23Usability.css';
import './playerGuidance.css';
import './playerGuidanceVisibility.css';
import './focusedFirstAction.css';
import './stageHeaderConsistency.css';
import './investigationAgency.css';
import './investigationAgencyAct3.css';
import './premiumEnhancements';
import './cameraMeaning';
import './cameraFrames';
import './premiumPassV2';
import './interrogationGuidance';
import './investigationAgencyInterrogation';
import './interactiveInterrogation';
import './investigationAgencyAccessibility';
import './livingSuspect';
import './kirillVideoRuntime';
import './stabilityDiagnostics';
import './localMediaRuntime';
import './firstPlayerFixes';
import './act23Usability';
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
        <ReactCaseExtension />
        <PlayerGuidance />
        <FinalSynthesis />
      </AppErrorBoundary>
    </React.StrictMode>
  );
  installCompletedCaseReturn();
  mountCommercialLaunch();
  installCommercialMetadataConsistency();
  installStageHeaderConsistency();
  installFocusedFirstAction();
  installProgressiveNavigation();
  installInvestigationAgency();
  installInvestigationAgencyAct3();
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
