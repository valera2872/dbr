export const INTERNAL_MODE = import.meta.env.DEV || new URLSearchParams(window.location.search).get('internal') === '1';
export const DEBUG_MODE = INTERNAL_MODE && new URLSearchParams(window.location.search).get('debug') === '1';

const INTERNAL_PARAMS = ['actorStudio', 'diagnostics', 'qa', 'fixture', 'debug'];

if (!INTERNAL_MODE) {
  const url = new URL(window.location.href);
  let changed = false;

  INTERNAL_PARAMS.forEach((name) => {
    if (url.searchParams.has(name)) {
      url.searchParams.delete(name);
      changed = true;
    }
  });

  if (changed) {
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }
}

document.documentElement.dataset.dbrMode = INTERNAL_MODE ? 'internal' : 'commercial';
document.documentElement.dataset.dbrDebug = DEBUG_MODE ? 'true' : 'false';
